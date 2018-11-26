class EncodeVideoJob < ApplicationJob
  self.queue_adapter = :chronofage
  queue_as :default

  SHAKA_PACKAGER_URL = 'https://github.com/google/shaka-packager/releases/download/v2.2.1/packager-linux'
  SHAKA_PACKAGER_PATH = '/tmp/shaka-packager'

  PROFILES = [
    {
      codec: "libx264",
      bandwidth: 1500000,
      resolution: 720,
      name: 'high',
    },
    {
      codec: "libx264",
      bandwidth: 800000,
      resolution: 480,
      name: 'low'
    }
  ]

  def perform(medium)
    Dir.mktmpdir do |wdir|
      @wdir = wdir
      @medium = medium

      download_input!
      perform_video_encoding!
      # encrypt!
      get_thumbnail!
      get_preview!
      get_duration!
    end

    @medium.update(published_at: DateTime.now)

    @medium.create_activity key: 'medium.published', owner: User.find_by(telegram_id: ENV["ADMIN_ACCOUNT_TELEGRAM_ID"]), recipient: @medium.user

    begin
      SendTweetJob.perform_now(@medium) if @medium.share_on_twitter?
    rescue => exception
      ExceptionNotifier.notify_exception exception
    end
  end

  def download_input!
    call_command("curl #{video_url} -s -o #{input_path}")
  end

  def perform_video_encoding!
    # Reencode
    ffmpeg_configurations = PROFILES.map { |profile| ffmpeg_configuration_for(profile) }.join(" ")

    call_command("ffmpeg -i #{input_path} -pass 1 #{ffmpeg_configurations}")
    call_command("ffmpeg -i #{input_path} -pass 2 #{ffmpeg_configurations}")

    # create index file
    indices = PROFILES.map do |profile|
      [
        "#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=#{profile[:bandwidth]}",
        "#{profile[:name]}_#{job_id}.m3u8"
      ]
    end
    File.open("#{@wdir}/index.m3u8", 'w') { |f| f.write("#EXTM3U\n" + indices.flatten.join("\n")) }

    # Upload to storage
    Dir["#{@wdir}/*.{ts,m3u8}"].each do |path|
      upload(path, "#{root_dir}/#{File.basename(path)}")
    end

    @medium.update(key: "#{root_dir}/index.m3u8")
  end

  def get_thumbnail!
    call_command "ffmpeg -i #{input_path} -vcodec mjpeg -vframes 1 -filter:v scale=\"1080:-1\" -q:v 10 -an -f rawvideo -ss #{video_middle} #{thumbnail_path}"

    upload(thumbnail_path, "#{root_dir}/thumbnail.jpg")
    @medium.update({
      thumbnail_key: "#{root_dir}/thumbnail.jpg",
    })

    call_command "ffmpeg -i #{input_path} -vcodec mjpeg -vframes 1 -filter:v scale=\"640:-1\" -q:v 10 -an -f rawvideo -ss #{video_middle} #{small_thumbnail_path}"

    upload(small_thumbnail_path, "#{root_dir}/small_thumbnail.jpg")
    @medium.update({
      small_thumbnail_key: "#{root_dir}/small_thumbnail.jpg",
    })
  end

  def get_preview!
    call_command "ffmpeg -y -ss #{video_middle} -t 3 -i #{input_path} -vf fps=10,scale=320:-1:flags=lanczos,palettegen #{palette_path}"
    call_command "ffmpeg -ss #{video_middle} -t 3 -i #{input_path} -i #{palette_path} -filter_complex \"fps=10,scale=320:-1:flags=lanczos[x];[x][1:v]paletteuse\" #{preview_path}"

    upload(preview_path, "#{root_dir}/preview.gif")
    @medium.update(preview_key: "#{root_dir}/preview.gif")
  end

  def get_duration!
    output = JSON.parse(`ffprobe -of json -show_format_entry name -show_format #{input_path} -loglevel quiet`)

    @medium.update({
      duration: output["format"]["duration"].to_i
    })
  end

  protected

  def video_url
    Shellwords.escape("https://s3.amazonaws.com/#{ENV['TEMPORARY_S3_BUCKET']}/#{@medium.temporary_key}")
  end

  def input_path
    Shellwords.escape("#{@wdir}/input")
  end

  def thumbnail_path
    Shellwords.escape("#{@wdir}/thumbnail.jpeg")
  end

  def small_thumbnail_path
    Shellwords.escape("#{@wdir}/small_thumbnail.jpeg")
  end

  def preview_path
    Shellwords.escape("#{@wdir}/preview.gif")
  end

  def palette_path
    Shellwords.escape("#{@wdir}/palette.png")
  end

  def video_middle
    Shellwords.escape(`ffmpeg -i #{input_path} 2>&1 | grep Duration | awk '{print $2}' | tr -d , | awk -F ':' '{print ($3+$2*60+$1*3600)/2}'`.chomp)
  end

  def root_dir
    Digest::SHA1.hexdigest("#{ENV["SECURE_UPLOADER_KEY"]}#{@medium.uuid}")
  end

  def call_command(command)
    puts command
    system(command)
    raise if $?.to_i != 0
  end

  def ffmpeg_configuration_for(profile)
    "-vcodec #{profile[:codec]} -acodec aac -strict -2 -profile:v baseline -preset medium -b:v #{profile[:bandwidth]} -maxrate #{profile[:bandwidth]} -pix_fmt yuv420p -flags -global_header -hls_time 5 -hls_list_size 0 #{@wdir}/#{profile[:name]}_#{job_id}.m3u8"
  end

  def storage
    @storage ||= Fog::Storage.new({
      provider:              'AWS',
      aws_access_key_id:     ENV['S3_ACCESS_KEY_ID'],
      aws_secret_access_key: ENV['S3_SECRET_ACCESS_KEY'],
      region:                ENV['S3_REGION'],
      endpoint:              ENV['S3_ENDPOINT'],
      host:                  ENV['S3_HOST'],
      path_style:            true
    })
    @storage.directories.get(ENV["S3_BUCKET"])
  end

  def upload(path, key)
    open(path) do |file|
      storage.files.create({
        key: key,
        body: file,
        public: true
      })
    end.public_url
  end

  def encrypt!
    install_shaka_packager!

    Dir.chdir(@wdir) do
      shaka_configurations = (PROFILES.map { |profile| shaka_configuration_for(profile) } + [" --hls_master_playlist_output #{@wdir}/index.m3u8"] + shaka_encryption_configuration).join(" ")
      system("#{SHAKA_PACKAGER_PATH} #{shaka_configurations}")

      byebug
    end
  end

  def shaka_configuration_for(profile)
    "'in=input,stream=video,segment_template=#{profile[:name]}_#{job_id}$Number$.ts,playlist_name=#{profile[:name]}_#{job_id}.m3u8'"
  end

  def shaka_encryption_configuration
    [
      "--enable_widevine_encryption",
      "--signer widevine_test",
      "--key_server_url #{Shellwords.escape('https://license.uat.widevine.com/cenc/getcontentkey/widevine_test')}",
      "--content_id 3603ba0d266643489d10d0e35922a2f9",
      "--aes_signing_key '1ae8ccd0e7985cc0b6203a55855a1034afc252980e970ca90e5202689f947ab9'",
      "--aes_signing_iv 'd58ce954203b7c9a9a9d467f59839249'",
      "--protection_systems Widevine",
      "--mpd_output h264.mpd",
    ]
  end

  def install_shaka_packager!
    system("wget #{Shellwords.escape(SHAKA_PACKAGER_URL)} -O #{Shellwords.escape(SHAKA_PACKAGER_PATH)} && chmod +x #{Shellwords.escape(SHAKA_PACKAGER_PATH)}")
  end

end
