import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

// Get notifications for current user
router.get('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    const { id: userId } = req.user;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;
