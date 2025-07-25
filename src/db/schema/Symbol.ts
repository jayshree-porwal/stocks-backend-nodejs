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
  symbol: string;
  stock_name: string;
  fin_code: string;
  created_at: Date;
  updated_at: Date;
}

const Symbol = (sequelize: Sequelize) => {
  const Symbol = sequelize.define<ModelInterface>(
    'symbol',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stock_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fin_code: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "symbol"
    }
  );

  return Symbol;
};

export default Symbol;

