class Mutations::DeleteList < Mutations::BaseMutation
  argument :id, ID, required: true

  field :list, Types::ListType, null: true
  field :errors, [String], null: false

  def resolve(arguments)
    list = List.find(arguments[:id])

    raise Pundit::NotAuthorizedError unless ListPolicy.new(context[:current_user], list).destroy?

    if list.destroy
      {
        list: list,
        errors: [],
      }
    else
      {
        list: list,
        errors: list.errors.full_messages
      }
    end
  end
end
