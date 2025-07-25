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
  link: string;
  search_term_id: number;
  created_at: Date;
  updated_at: Date;
}

const Scanners = (sequelize: Sequelize) => {
  const Scanners = sequelize.define<ModelInterface>(
    'scanners',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      search_term_id: {
        type: DataTypes.INTEGER,
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

  return Scanners;
};

export default Scanners;

