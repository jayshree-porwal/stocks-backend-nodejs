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
  scanner_id: number;
  ticker_list: any[] | { [key: string]: any };
  created_at: Date;
  updated_at: Date;
}

const DailyScanData = (sequelize: Sequelize) => {
  const DailyScanData = sequelize.define<ModelInterface>(
    'daily_scan_data',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      scanner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    }
  );

  return DailyScanData;
};

export default DailyScanData;

