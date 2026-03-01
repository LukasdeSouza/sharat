import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// List all users in the same company (Admin only)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { companyId: req.user.company_id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create a new user (Admin only)
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Role validation
        const validRoles = ['ADMIN', 'EDITOR', 'VIEWER', 'APPROVER'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user linked to the same company
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
                company: {
                    connect: { id: req.user.company_id },
                },
            },
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Delete a user (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        // Ensure the user to delete belongs to the same company
        const userToDelete = await prisma.user.findFirst({
            where: { id, companyId: req.user.company_id }
        });

        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }

        await prisma.user.delete({
            where: { id },
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
