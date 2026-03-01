import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

// Get all forms for company
router.get('/', async (req, res) => {
  try {
    const { company_id } = req.user;

    const forms = await prisma.form.findMany({
      where: { companyId: company_id },
      include: {
        createdBy: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(forms);
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get single form
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id } = req.user;

    const form = await prisma.form.findFirst({
      where: {
        id,
        companyId: company_id,
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json(form);
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Create form
router.post('/', async (req, res) => {
  try {
    const { name, description, schema } = req.body;
    const { company_id, id: userId, role } = req.user;

    if (role === 'VIEWER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!name || !schema) {
      return res.status(400).json({ error: 'Name and schema required' });
    }

    const form = await prisma.form.create({
      data: {
        name,
        description: description || '',
        schema,
        company: { connect: { id: company_id } },
        createdBy: { connect: { id: userId } },
      },
    });

    res.status(201).json(form);
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Update form
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, schema, isPublished } = req.body;
    const { company_id, role } = req.user;

    if (role === 'VIEWER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const form = await prisma.form.findFirst({
      where: {
        id,
        companyId: company_id,
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const updatedForm = await prisma.form.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(schema && { schema }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    res.json(updatedForm);
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Delete form
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, role } = req.user;

    if (role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can delete forms' });
    }

    const form = await prisma.form.findFirst({
      where: {
        id,
        companyId: company_id,
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    await prisma.form.delete({
      where: { id },
    });

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

export default router;
