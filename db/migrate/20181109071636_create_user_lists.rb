class CreateUserLists < ActiveRecord::Migration[5.2]
  def change
    create_table :users_lists do |t|
      t.uuid "user_id"
      t.uuid "list_id"

      t.timestamps
    end
  end
end
