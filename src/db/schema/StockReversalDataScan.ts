import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";

interface ModelInterface extends Model<InferAttributes<ModelInterface>, InferCreationAttributes<ModelInterface>> {
  id?: number;
  ticker_list: any[] | { [key: string]: any };
  created_at?: Date;
  updated_at?: Date;
}

const StockReversalDataScan = (sequelize: Sequelize) => {
  const StockReversalDataScan = sequelize.define<ModelInterface>(
    "stock_reversal_data_scan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ticker_list: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      underscored: true,
      tableName: "stock_reversal_data_scan"
    }
  );

  return StockReversalDataScan;
};

export default StockReversalDataScan;
