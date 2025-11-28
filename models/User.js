const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastPasswordChange: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isInvited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    invitedBy: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 12);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
          user.lastPasswordChange = new Date();
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.isPasswordExpired = function() {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    return this.lastPasswordChange < tenDaysAgo;
  };

  return User;
};