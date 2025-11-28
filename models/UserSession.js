const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserSession = sequelize.define('UserSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return UserSession;
};