# This migration comes from chronofage_engine (originally 2)
class AddDefaultPriority < ActiveRecord::Migration[5.0]
  def change
    change_column_default :chronofage_jobs, :priority, 0
  end
end
