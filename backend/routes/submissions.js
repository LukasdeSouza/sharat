import express from 'express';
import { prisma } from '../server.js';
import { workflowEngine } from '../services/workflowEngine.js';

const router = express.Router();

// Get submissions for a form
router.get('/form/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const { company_id } = req.user;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

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

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: {
          formId,
          companyId: company_id,
        },
        include: {
          execution: {
            include: {
              workflow: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.submission.count({
        where: {
          formId,
          companyId: company_id,
        },
      }),
    ]);

    res.json({
      data: submissions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get single submission
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id } = req.user;

    const submission = await prisma.submission.findFirst({
      where: {
        id,
        companyId: company_id,
      },
      include: {
        execution: {
          include: {
            workflow: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Create submission
router.post('/', async (req, res) => {
  try {
    const { form_id, data } = req.body;
    const { company_id } = req.user;

    if (!form_id || !data) {
      return res.status(400).json({ error: 'Form ID and data required' });
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

    const submission = await prisma.submission.create({
      data: {
        data,
        form: { connect: { id: form_id } },
        company: { connect: { id: company_id } },
      },
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Update submission status (for workflow approvals)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { workflow_status } = req.body;
    const { company_id, role } = req.user;

    if (role === 'VIEWER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].includes(workflow_status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const submission = await prisma.submission.findFirst({
      where: {
        id,
        companyId: company_id,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        workflowStatus: workflow_status,
      },
      include: {
        execution: true
      }
    });

    // If an execution exists and was updated to a terminal step, move on 
    if (updatedSubmission.execution && ['APPROVED', 'REJECTED'].includes(workflow_status)) {
      setImmediate(() => {
        workflowEngine.moveToNextStep(updatedSubmission.execution.id, updatedSubmission.execution.currentStep)
          .catch(err => console.error('Next step processing failed:', err));
      });
    }

    res.json(updatedSubmission);
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// Delete submission
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, role } = req.user;

    if (role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can delete submissions' });
    }

    const submission = await prisma.submission.findFirst({
      where: {
        id,
        companyId: company_id,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    await prisma.submission.delete({
      where: { id },
    });

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

export default router;
