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
    term: string;
    created_at: Date;
    updated_at: Date;
  }
  
  const SearchTerm = (sequelize: Sequelize) => {
    const SearchTerm = sequelize.define<ModelInterface>(
      'search_term',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        term: {
          type: DataTypes.STRING,
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
        tableName: "search_term"
      }
    );
  
    return SearchTerm;
  };
  
  export default SearchTerm;