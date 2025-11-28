'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      failedLoginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lockedUntil: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastPasswordChange: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      isInvited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      invitedBy: {
        type: Sequelize.UUID,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Roles table
    await queryInterface.createTable('Roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isSystem: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Permissions table
    await queryInterface.createTable('Permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // UserRoles junction table
    await queryInterface.createTable('UserRoles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      UserId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      RoleId: {
        type: Sequelize.UUID,
        references: {
          model: 'Roles',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // RolePermissions junction table
    await queryInterface.createTable('RolePermissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      RoleId: {
        type: Sequelize.UUID,
        references: {
          model: 'Roles',
          key: 'id'
        }
      },
      PermissionId: {
        type: Sequelize.UUID,
        references: {
          model: 'Permissions',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // UserPasswordHistory table
    await queryInterface.createTable('UserPasswordHistories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // OTPs table
    await queryInterface.createTable('OTPs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      otp: {
        type: Sequelize.STRING(6),
        allowNull: false
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      purpose: {
        type: Sequelize.ENUM('login', 'password_reset', 'invitation'),
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isUsed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // UserSessions table
    await queryInterface.createTable('UserSessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      lastActivity: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserSessions');
    await queryInterface.dropTable('OTPs');
    await queryInterface.dropTable('UserPasswordHistories');
    await queryInterface.dropTable('RolePermissions');
    await queryInterface.dropTable('UserRoles');
    await queryInterface.dropTable('Permissions');
    await queryInterface.dropTable('Roles');
    await queryInterface.dropTable('Users');
  }
};