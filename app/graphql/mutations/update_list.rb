class Mutations::UpdateList < Mutations::BaseMutation
  argument :id, ID, required: true
  argument :name, String, required: true
  argument :description, String, required: false

  field :list, Types::ListType, null: true
  field :errors, [String], null: false

  def resolve(arguments)
    list = List.find(arguments[:id])
    list.assign_attributes(arguments)

    raise Pundit::NotAuthorizedError unless ListPolicy.new(context[:current_user], list).update?

    if list.save
      {
        list: list,
        errors: [],
      }
    else
      {
        list: nil,
        errors: list.errors.full_messages
      }
    end
  end
end
