const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPasswordHistory = sequelize.define('UserPasswordHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true,
    updatedAt: false
  });

  return UserPasswordHistory;
};