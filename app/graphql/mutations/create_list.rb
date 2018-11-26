class Mutations::CreateList < Mutations::BaseMutation
  argument :name, String, required: true
  argument :description, String, required: false

  field :list, Types::ListType, null: true
  field :errors, [String], null: false

  def resolve(arguments)
    list = List.new({
      user: context[:current_user],
      name: arguments[:name],
      description: arguments[:description],
    })

    raise Pundit::NotAuthorizedError unless ListPolicy.new(context[:current_user], list).create?

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
