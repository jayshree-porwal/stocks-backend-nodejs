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
  short_term: string;
  previous_verdict: string;
  verdict_price: number;
  verdict_change_date: Date;
  long_term: string;
  long_verdict_price: number;
  long_verdict_change_date: Date;
  created_at: Date;
  updated_at: Date;
}

const StockVerdict = (sequelize: Sequelize) => {
  const StockVerdict = sequelize.define<ModelInterface>(
    'stock_verdict',
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
      short_term: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      previous_verdict: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      verdict_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      verdict_change_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      long_term: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      long_verdict_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      long_verdict_change_date: {
        type: DataTypes.DATE,
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
      tableName: "stock_verdict"
    }
  );

  return StockVerdict;
};

export default StockVerdict;
