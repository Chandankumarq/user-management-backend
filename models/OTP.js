const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OTP = sequelize.define('OTP', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    purpose: {
      type: DataTypes.ENUM('login', 'password_reset', 'invitation'),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  OTP.prototype.isExpired = function() {
    return new Date() > this.expiresAt;
  };

  return OTP;
};