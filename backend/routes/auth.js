import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register company and user
router.post('/register', async (req, res) => {
  try {
    const { company_name, email, password } = req.body;

    if (!company_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name: company_name,
      },
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with admin role
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'ADMIN',
        company: {
          connect: { id: company.id },
        },
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Company and user created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        company_id: user.companyId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        company_id: user.companyId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  res.json({ user: req.user });
});

export default router;
