const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User, UserPasswordHistory, OTP, UserSession } = require('../models');

class AuthService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTP(email, otp, purpose) {
    const subject = purpose === 'login' 
      ? 'Your Login OTP Code' 
      : purpose === 'password_reset'
      ? 'Password Reset OTP'
      : 'Account Invitation';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Security Verification</h2>
        <p>Your OTP code is: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
        <p>This code will expire in 3 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    });
  }

  async generateOTP(userId, sessionId, purpose) {
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    await OTP.destroy({
      where: { 
        userId, 
        sessionId, 
        purpose,
        isUsed: false 
      }
    });

    const otp = await OTP.create({
      userId,
      otp: otpCode,
      sessionId,
      purpose,
      expiresAt
    });

    return otpCode;
  }

  async verifyOTP(email, otpCode, sessionId, purpose) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const otpRecord = await OTP.findOne({
      where: {
        userId: user.id,
        otp: otpCode,
        sessionId,
        purpose,
        isUsed: false
      }
    });

    if (!otpRecord) {
      throw new Error('Invalid OTP');
    }

    if (otpRecord.isExpired()) {
      throw new Error('OTP expired');
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    return user;
  }

  async canUsePassword(userId, newPassword) {
    const lastThreePasswords = await UserPasswordHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 3
    });

    for (const history of lastThreePasswords) {
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(newPassword, history.password);
      if (isMatch) {
        return false;
      }
    }

    return true;
  }

  async savePasswordHistory(userId, password) {
    await UserPasswordHistory.create({
      userId,
      password
    });

    // Keep only last 3 passwords
    const histories = await UserPasswordHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      offset: 3
    });

    for (const history of histories) {
      await history.destroy();
    }
  }

  async createUserSession(userId, sessionId, userAgent, ipAddress) {
    return await UserSession.create({
      userId,
      sessionId,
      userAgent,
      ipAddress
    });
  }
}

module.exports = new AuthService();