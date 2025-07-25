import {
  Sequelize,
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

interface ModelInterface
  extends Model<
    InferAttributes<ModelInterface>,
    InferCreationAttributes<ModelInterface>
  > {
  id: number;
  stock_id: number;
  price: number;
  created_at: Date;
  updated_at: Date;
}

const DailyPrice = (sequelize: Sequelize) => {
  const DailyPrice = sequelize.define<ModelInterface>(
    'daily_price',
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
      price: {
        type: DataTypes.DECIMAL(10, 2),
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
      tableName:"daily_price"
    }
  );

  return DailyPrice;
};

export default DailyPrice;
