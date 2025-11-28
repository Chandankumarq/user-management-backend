# User Management System - Backend

A secure Node.js backend for User Management System with Two-Factor Authentication (2FA) and Role-Based Access Control (RBAC).

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with 2FA via email OTP
- **Role-Based Access Control**: Dynamic role and permission management
- **Password Security**: Password history, rotation, and strength validation
- **Session Management**: Isolated session handling with OTP verification
- **Account Security**: Account lockout after failed attempts, password expiry

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT, bcryptjs
- **Security**: Helmet, CORS, rate limiting
- **Email**: Nodemailer for OTP delivery
- **Validation**: Express-validator

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-management-system/backend
