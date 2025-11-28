
const { Role, Permission } = require('../models');
class RoleController {
  async getRoles(req, res) {
    try {
      const roles = await Role.findAll({
        include: [Permission]
      });

      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createRole(req, res) {
    try {
      const { name, description, permissions } = req.body;

      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        return res.status(400).json({ error: 'Role already exists' });
      }

      const role = await Role.create({ name, description });

      if (permissions && permissions.length > 0) {
        const permissionRecords = await Permission.findAll({
          where: { id: permissions }
        });
        await role.setPermissions(permissionRecords);
      }

      const createdRole = await Role.findByPk(role.id, {
        include: [Permission]
      });

      res.status(201).json(createdRole);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, description, permissions } = req.body;

      const role = await Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (role.isSystem) {
        return res.status(400).json({ error: 'Cannot modify system role' });
      }

      await role.update({ name, description });

      if (permissions) {
        const permissionRecords = await Permission.findAll({
          where: { id: permissions }
        });
        await role.setPermissions(permissionRecords);
      }

      const updatedRole = await Role.findByPk(id, {
        include: [Permission]
      });

      res.json(updatedRole);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteRole(req, res) {
    try {
      const { id } = req.params;

      const role = await Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (role.isSystem) {
        return res.status(400).json({ error: 'Cannot delete system role' });
      }

      await role.destroy();

      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RoleController();