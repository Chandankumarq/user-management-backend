'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Starting enhanced seeder with duplicate handling...');

    try {
      // 1. Insert permissions with duplicate handling
      const permissions = [
        { id: uuidv4(), name: 'user.create', description: 'Create users', category: 'users', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'user.view', description: 'View users', category: 'users', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'user.edit', description: 'Edit users', category: 'users', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'user.delete', description: 'Delete users', category: 'users', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'role.create', description: 'Create roles', category: 'roles', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'role.view', description: 'View roles', category: 'roles', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'role.edit', description: 'Edit roles', category: 'roles', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'role.delete', description: 'Delete roles', category: 'roles', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'system.settings', description: 'Manage system settings', category: 'system', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'reports.view', description: 'View reports', category: 'reports', createdAt: new Date(), updatedAt: new Date() }
      ];

      // Insert permissions one by one with error handling
      let permissionsCreated = 0;
      for (const permission of permissions) {
        try {
          await queryInterface.sequelize.query(`
            INSERT INTO "Permissions" (id, name, description, category, "createdAt", "updatedAt")
            VALUES (:id, :name, :description, :category, :createdAt, :updatedAt)
            ON CONFLICT (name) DO NOTHING
          `, {
            replacements: permission,
            type: Sequelize.QueryTypes.INSERT
          });
          permissionsCreated++;
        } catch (error) {
          console.log(`Permission "${permission.name}" already exists`);
        }
      }
      console.log(`Permissions: ${permissionsCreated} inserted`);

      // 2. Insert roles with duplicate handling
      const roles = [
        { id: uuidv4(), name: 'Super Admin', description: 'Full system access', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Admin', description: 'Administrative access', isSystem: false, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Editor', description: 'Content editor', isSystem: false, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Viewer', description: 'Read-only access', isSystem: false, createdAt: new Date(), updatedAt: new Date() }
      ];

      let rolesCreated = 0;
      for (const role of roles) {
        try {
          await queryInterface.sequelize.query(`
            INSERT INTO "Roles" (id, name, description, "isSystem", "createdAt", "updatedAt")
            VALUES (:id, :name, :description, :isSystem, :createdAt, :updatedAt)
            ON CONFLICT (name) DO NOTHING
          `, {
            replacements: role,
            type: Sequelize.QueryTypes.INSERT
          });
          rolesCreated++;
        } catch (error) {
          console.log(`ℹ️  Role "${role.name}" already exists`);
        }
      }
      console.log(`Roles: ${rolesCreated} inserted`);

      // 3. Get Super Admin role ID
      const [superAdminRole] = await queryInterface.sequelize.query(
        'SELECT id FROM "Roles" WHERE name = \'Super Admin\'',
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (superAdminRole) {
        // 4. Assign all permissions to Super Admin role
        const allPermissions = await queryInterface.sequelize.query(
          'SELECT id FROM "Permissions"',
          { type: Sequelize.QueryTypes.SELECT }
        );

        let rolePermissionsCreated = 0;
        for (const permission of allPermissions) {
          try {
            await queryInterface.sequelize.query(`
              INSERT INTO "RolePermissions" ("RoleId", "PermissionId", "createdAt", "updatedAt")
              VALUES (:roleId, :permissionId, :createdAt, :updatedAt)
              ON CONFLICT ("RoleId", "PermissionId") DO NOTHING
            `, {
              replacements: {
                roleId: superAdminRole.id,
                permissionId: permission.id,
                createdAt: new Date(),
                updatedAt: new Date()
              },
              type: Sequelize.QueryTypes.INSERT
            });
            rolePermissionsCreated++;
          } catch (error) {
            // Ignore duplicate role-permission assignments
          }
        }
        console.log(`Role-Permissions: ${rolePermissionsCreated} assigned to Super Admin`);
      }

      // 5. Create Super Admin user (only if doesn't exist)
      const [existingAdmin] = await queryInterface.sequelize.query(
        'SELECT id FROM "Users" WHERE email = \'chandan.kumar.qdegrees@gmail.com\'',
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (!existingAdmin) {
        const adminPassword = await bcrypt.hash('Admin123!', 12);
        const adminId = uuidv4();
        
        await queryInterface.sequelize.query(`
          INSERT INTO "Users" (id, name, email, password, "isActive", "failedLoginAttempts", "lastPasswordChange", "createdAt", "updatedAt")
          VALUES (:id, :name, :email, :password, :isActive, :failedLoginAttempts, :lastPasswordChange, :createdAt, :updatedAt)
        `, {
          replacements: {
            id: adminId,
            name: 'Super Admin',
            email: 'chandan.kumar.qdegrees@gmail.com',
            password: adminPassword,
            isActive: true,
            failedLoginAttempts: 0,
            lastPasswordChange: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          type: Sequelize.QueryTypes.INSERT
        });
        console.log('Super Admin user created');

        // 6. Assign Super Admin role to user
        if (superAdminRole) {
          await queryInterface.sequelize.query(`
            INSERT INTO "UserRoles" ("UserId", "RoleId", "createdAt", "updatedAt")
            VALUES (:userId, :roleId, :createdAt, :updatedAt)
            ON CONFLICT ("UserId", "RoleId") DO NOTHING
          `, {
            replacements: {
              userId: adminId,
              roleId: superAdminRole.id,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            type: Sequelize.QueryTypes.INSERT
          });
          console.log('Super Admin role assigned to user');
        }

        // 7. Save password history
        await queryInterface.sequelize.query(`
          INSERT INTO "UserPasswordHistories" (id, "userId", password, "createdAt")
          VALUES (:id, :userId, :password, :createdAt)
        `, {
          replacements: {
            id: uuidv4(),
            userId: adminId,
            password: adminPassword,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          type: Sequelize.QueryTypes.INSERT
        });
        console.log('Password history saved');
      } else {
        console.log('Super Admin user already exists');
      }

    } catch (error) {
      console.error('Seeder error:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserRoles', null, {});
    await queryInterface.bulkDelete('RolePermissions', null, {});
    await queryInterface.bulkDelete('UserPasswordHistories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};