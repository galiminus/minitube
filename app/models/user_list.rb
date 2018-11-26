class UserList < ApplicationRecord
  self.table_name = "users_lists"
  
  belongs_to :user
  belongs_to :list
end
