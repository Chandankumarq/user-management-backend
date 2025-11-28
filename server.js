const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const seeder = require('./seeders/001-initial-data');
require('dotenv').config();
const { sequelize, User, Role, Permission } = require('./models');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;


async function runSeederAutomatically() {
  try {
    console.log('Checking if Super Admin exists...');
    
    const adminUser = await User.findOne({ 
      where: { email: 'chandan.kumar.qdegrees@gmail.com' },
      include: [Role]
    });
    
    if (adminUser) {
      console.log('Super Admin already exists:', adminUser.email);
      return;
    }
    
    console.log('Super Admin not found, running seeder...');
    await seeder.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
  } catch (error) {
    console.log(error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('ℹData already exists, continuing...');
    } else {
      console.error('Error running seeder:', error.message);
    }
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ alter: false });
    console.log('Database synchronized.');
    await runSeederAutomatically();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();