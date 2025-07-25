import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, Optional, ModelAttributes } from "sequelize";

interface ModelInterface extends Model<InferAttributes<ModelInterface>, InferCreationAttributes<ModelInterface>> {
  id?: number;
  stock_id: number;
  stock_name: string;
  reversal_points: Object;
  sma20: number;
  sma50: number;
  sma200: number;
  avg_volume_uptrend: number;
  avg_volume_downtrend: number;
  volume_ratio_higher: number;
  change_time: Date;
}

const StockReversalData = (sequelize: Sequelize) => {
  const StockReversalData = sequelize.define<ModelInterface>(
    "stock_reversal_data",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stock_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      reversal_points: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      sma20: {
        type: DataTypes.NUMBER,
        allowNull: true,
        field: "20sma",
      },
      sma50: {
        type: DataTypes.NUMBER,
        allowNull: true,
        field: "50sma",
      },
      sma200: {
        type: DataTypes.NUMBER,
        allowNull: true,
        field: "200sma",
      },
      avg_volume_uptrend: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      avg_volume_downtrend: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      volume_ratio_higher: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      change_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      underscored: true,
      timestamps: false,
    }
  );

  return StockReversalData;
};

export default StockReversalData;
