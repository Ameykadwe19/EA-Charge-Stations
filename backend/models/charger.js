const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Charger extends Model {
    static associate(models) {
      // define associations here
      Charger.belongsTo(models.User);
    }
  }

  Charger.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(255),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive']]
      }
    },
    powerOutput: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    connectorType: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Charger',
    tableName: 'Chargers', // <-- matches your PG table
    timestamps: true,
    indexes: [
      {
        fields: ['latitude', 'longitude']
      }
    ]
  });

  return Charger;
};

