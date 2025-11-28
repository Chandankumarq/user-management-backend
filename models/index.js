const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Role = require('./Role')(sequelize);
const Permission = require('./Permission')(sequelize);
const UserPasswordHistory = require('./UserPasswordHistory')(sequelize);
const OTP = require('./OTP')(sequelize);
const UserSession = require('./UserSession')(sequelize);

// Define associations
User.belongsToMany(Role, { through: 'UserRoles' });
Role.belongsToMany(User, { through: 'UserRoles' });

Role.belongsToMany(Permission, { through: 'RolePermissions' });
Permission.belongsToMany(Role, { through: 'RolePermissions' });

User.hasMany(UserPasswordHistory, { foreignKey: 'userId' });
UserPasswordHistory.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(OTP, { foreignKey: 'userId' });
OTP.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserSession, { foreignKey: 'userId' });
UserSession.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  UserPasswordHistory,
  OTP,
  UserSession
};