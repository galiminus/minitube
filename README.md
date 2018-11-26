# Minitube

Minitube is small Youtube-like service with moderation. It use direct S3 upload and `ffmpeg` for transcoding.

Because I'm a lazy ass the service only support Telegram Login for now.

## Environment variables

```
DATABASE_URL:                            postgres://XXX	  # URL to the database host and name
S3_ACCESS_KEY_ID:                        XXX	          # Access key of the S3 bucket where the transcoded videos will be stored
S3_SECRET_ACCESS_KEY:                    XXX	          # Secret key of the S3 bucket where the trancoded videos will be stored
S3_BUCKET:                               XXX	          # Bucket where the transcoded videos will be stored
S3_ENDPOINT:                             XXX	          # The S3 endpoint of the bucket where all the transcoded videos will be stored (useful for minio)
S3_HOST:                                 XXX 	          # The S3 host of the bucket where all the trancoded videos will be stored (useful for minio)
S3_REGION:                               XXX	          # The S3 region of the bucket where all the transcoded videos will be stored
SECURE_UPLOADER_KEY:                     XXX	          # An encryption key you can generate with bin/rake secret
SITE_NAME:                               XXX	          # The site name (ix. Minitube)
TELEGRAM_BOT_NAME:                       XXX	          # The name of the login Telegram bot
TELEGRAM_LOGIN_BOT_TOKEN:                XXX	          # The login Telegram bot token
TEMPORARY_S3_ACCESS_KEY_ID:              XXX	          # Access key of the temporary S3 bucket where uploaded videos will be stored
TEMPORARY_S3_SECRET_ACCESS_KEY:          XXX	          # Secret key of the temporary S3 bucket where uploaded videos will be stored
TEMPORARY_S3_BUCKET:                     XXX	          # The S3 bucket of the temporary bucket where all the uploaded videos will be stored
TEMPORARY_S3_REGION:                     XXX	          # The S3 region of the temporary bucket where all the uploaded videos will be stored
ADMIN_ACCOUNT_TELEGRAM_ID:               1234	      	  # Telegram id of the admin user
CONTENT_PRODUCERS_NAME:                  publishers 	  # Name of the publishers (ex: minitubers, youtubers)
DEFAULT_THEME:                           light		  # Can be light or dark
DOMAIN:                                  minitube.com	  # The domain you want to use for the application
ENABLE_BETA:                             false		  # Add a the 'beta' text beside the site name
ENABLE_PORNOGRAPHY_DISCLAIMER:           false		  # Add a disclaimer for pornographic website
ICON_FOLDER:                             minitube	  # Folder for your icons in `app/assets/images`
MINIMUM_AGE:                             13		  # Minimum age to signup
UNREAD_ACTIVITY_COUNT_REFRESH_INTERVAL:  120000	  	  # Refresh interval of the activity counter (default. 120000)
UNREAD_CHATS_COUNT_REFRESH_INTERVAL:     10000	  	  # Refresh interval of the chat (default. 10000)
MESSAGES_REFRESH_INTERVAL:               10000		  # Refresh interval for message
USER_MEDIA_PAGE_SIZE:                    10		  # Pagination settings
ACTIVITIES_PAGE_SIZE:                    20		  # Pagination settings
ANNOUNCEMENTS_PAGE_SIZE:                 30		  # Pagination settings
CHATS_PAGE_SIZE:                         30		  # Pagination settings
COMMENTS_PAGE_SIZE:                      20		  # Pagination settings
FOLLOWERS_PAGE_SIZE:                     30		  # Pagination settings
FOLLOWINGS_PAGE_SIZE:                    30		  # Pagination settings
LIKES_PAGE_SIZE:                         10		  # Pagination settings
LISTS_PAGE_SIZE:                         30		  # Pagination settings
MEDIA_PAGE_SIZE:                         30		  # Pagination settings
MESSAGES_PAGE_SIZE:                      30		  # Pagination settings
```

## License

Copyright (c) 2018 Victor Goya <goya.victor@gmail.com>

Permission to use, copy, modify, and distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
