import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

// Get all workflows for a company
router.get('/', async (req, res) => {
  try {
    const { company_id } = req.user;

    const workflows = await prisma.workflow.findMany({
      where: {
        companyId: company_id,
      },
      include: {
        form: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(workflows);
  } catch (error) {
    console.error('Get all workflows error:', error);
    res.status(500).json({ error: 'Failed to fetch all workflows' });
  }
});

// Get workflows for a form
router.get('/form/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const { company_id } = req.user;

    // Verify form belongs to company
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        companyId: company_id,
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const workflows = await prisma.workflow.findMany({
      where: {
        formId,
        companyId: company_id,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(workflows);
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Get single workflow
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id } = req.user;

    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        companyId: company_id,
      },
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

// Create workflow
router.post('/', async (req, res) => {
  try {
    const { form_id, name, definition } = req.body;
    const { company_id, role } = req.user;

    if (role === 'VIEWER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!form_id || !name || !definition) {
      return res.status(400).json({ error: 'Form ID, name, and definition required' });
    }

    // Verify form belongs to company
    const form = await prisma.form.findFirst({
      where: {
        id: form_id,
        companyId: company_id,
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        definition,
        form: { connect: { id: form_id } },
        company: { connect: { id: company_id } },
      },
    });

    res.status(201).json(workflow);
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Update workflow
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, definition } = req.body;
    const { company_id, role } = req.user;

    if (role === 'VIEWER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        companyId: company_id,
      },
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(definition && { definition }),
      },
    });

    res.json(updatedWorkflow);
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

// Delete workflow
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, role } = req.user;

    if (role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can delete workflows' });
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        companyId: company_id,
      },
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    await prisma.workflow.delete({
      where: { id },
    });

    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

export default router;
