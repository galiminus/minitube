module Types
  class ListType < Types::BaseObject
    description "List object"
    field :id, ID, null: false
    field :name, String, null: false
    field :description, String, null: true
    field :user_id, ID, null: false
  end
end
