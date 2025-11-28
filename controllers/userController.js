const { User, Role, Permission } = require('../models');
const authService = require('../services/authService');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [{
          model: Role,
          include: [Permission]
        }]
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        include: [Role]
      });
      console.log(users)

      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async inviteUser(req, res) {
    try {
      const { email, roleId } = req.body;
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Generate temporary password
      const tempPassword = require('crypto').randomBytes(8).toString('hex');
      const user = await User.create({
        email,
        name: email.split('@')[0], // Default name from email
        password: tempPassword,
        isInvited: true,
        invitedBy: req.user.id
      });

      const role = await Role.findByPk(roleId);
      if (role) {
        await user.addRole(role);
      }

      // Send invitation email with setup link
      const sessionId = require('crypto').randomBytes(16).toString('hex');
      const otp = await authService.generateOTP(user.id, sessionId, 'invitation');
      await authService.sendOTP(email, otp, 'invitation');

      res.status(201).json({ 
        message: 'User invited successfully',
        user: { id: user.id, email: user.email },
        sessionId
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();