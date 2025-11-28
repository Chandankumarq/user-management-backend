const jwt = require('jsonwebtoken');
const { User, Role } = require('../models')
const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  async signup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const canUsePassword = await authService.canUsePassword(null, password);
      if (!canUsePassword) {
        return res.status(400).json({ 
          error: 'Cannot use recent password. Please choose a different one.' 
        });
      }

      const user = await User.create({ name, email, password });
      
      // Assign default role (Viewer)
      const defaultRole = await Role.findOne({ where: { name: 'Viewer' } });
      if (defaultRole) {
        await user.addRole(defaultRole);
      }

      await authService.savePasswordHistory(user.id, user.password);

      res.status(201).json({ 
        message: 'User created successfully',
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, sessionId } = req.body;

      const user = await User.findOne({ 
        where: { email },
        include: [Role]
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return res.status(423).json({ error: 'Account locked. Try again later.' });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        user.failedLoginAttempts += 1;
        
        if (user.failedLoginAttempts >= 3) {
          user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
        
        await user.save();
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if password expired
      if (user.isPasswordExpired()) {
        return res.status(403).json({ 
          error: 'Password expired. Please reset your password.',
          requiresPasswordReset: true 
        });
      }

      // Reset failed attempts on successful login
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await user.save();

      // Generate and send OTP
      console.log("user",user.name)
       const otp = await authService.generateOTP(user.id, sessionId, 'login');
      await authService.sendOTP(email, otp, 'login');
      

      // Create session record
      await authService.createUserSession(
        user.id,
        sessionId, 
        req.get('User-Agent'), 
        req.ip
      );

      res.json({ 
        message: 'OTP sent to email',
        requiresOTP: true,
        sessionId 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async verifyOTP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp, sessionId } = req.body;

      const user = await authService.verifyOTP(email, otp, sessionId, 'login');
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          sessionId 
        },
        process.env.JWT_SECRET,
        { expiresIn: '10d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const sessionId = req.body.sessionId || require('crypto').randomBytes(16).toString('hex');

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const otp = await authService.generateOTP(user.id, sessionId, 'password_reset');
      await authService.sendOTP(email, otp, 'password_reset');

      res.json({ 
        message: 'OTP sent to email',
        sessionId 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, otp, sessionId, newPassword } = req.body;

      const user = await authService.verifyOTP(email, otp, sessionId, 'password_reset');
      
      const canUsePassword = await authService.canUsePassword(user.id, newPassword);
      if (!canUsePassword) {
        return res.status(400).json({ 
          error: 'Cannot use recent password. Please choose a different one.' 
        });
      }

      user.password = newPassword;
      await user.save();

      await authService.savePasswordHistory(user.id, user.password);

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();