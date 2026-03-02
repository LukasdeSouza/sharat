import express from 'express';
import { prisma } from '../server.js';
import { workflowEngine } from '../services/workflowEngine.js';

const router = express.Router();

// Get pending tasks for current user
router.get('/my-tasks', async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // Fetch all pending submissions with their workflow definitions
    const submissions = await prisma.submission.findMany({
      where: {
        workflowStatus: 'PENDING',
        execution: { isNot: null }
      },
      include: {
        form: {
          select: { name: true, schema: true }
        },
        execution: {
          include: {
            workflow: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Filter in-memory to find ones where current user is the approver
    const myTasks = submissions.filter(submission => {
      const execution = submission.execution;
      if (!execution || !execution.workflow) return false;

      const { definition } = execution.workflow;
      const currentStepId = execution.currentStep;
      
      if (!definition || !definition.steps || !currentStepId) return false;

      const currentStep = definition.steps.find(s => s.id === currentStepId);
      
      // Check if it's an approval step and assigned to this user
      return (
        currentStep && 
        currentStep.type === 'approval' && 
        currentStep.config && 
        currentStep.config.approverId === userId
      );
    });

    res.json(myTasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

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
        auditLogs: {
          include: {
            user: { select: { email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
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

    // Check for Workflow
    const workflow = await prisma.workflow.findFirst({
      where: { formId: form_id },
      orderBy: { createdAt: 'desc' }
    });

    let status = 'PENDING';
    let currentStepId = null;
    let executionStatus = 'COMPLETED';

    // Workflow Initialization Logic
    if (workflow) {
      const { steps, connections } = workflow.definition;
      
      // Find start node (simple heuristic: node with no incoming connections or first in list)
      // In a real graph, we'd traverse properly. Assuming linear-ish flow for now or first step after start.
      // Finding the "Start" step (usually type 'start')
      const startStep = steps.find(s => s.type === 'start') || steps[0];
      
      if (startStep) {
        // Find what the start step connects to
        const firstConnection = connections.find(c => c.fromStepId === startStep.id);
        if (firstConnection) {
          const nextStep = steps.find(s => s.id === firstConnection.toStepId);
          
          if (nextStep) {
            currentStepId = nextStep.id;
            
            if (nextStep.type === 'approval') {
              status = 'PENDING';
              executionStatus = 'PENDING';
              
              // Create Notification if an approver is assigned
              if (nextStep.config && nextStep.config.approverId) {
                await prisma.notification.create({
                  data: {
                    userId: nextStep.config.approverId,
                    title: 'New Approval Request',
                    message: `A new submission for "${form.name}" requires your approval.`,
                    link: `/submissions?formId=${form_id}`,
                  }
                });
              }
            }
          }
        }
      }
    }

    const submission = await prisma.submission.create({
      data: {
        data,
        workflowStatus: status,
        form: { connect: { id: form_id } },
        company: { connect: { id: company_id } },
        auditLogs: {
          create: {
            action: 'SUBMITTED',
            details: 'Internal submission',
            userId: req.user.id
          }
        },
        // Create execution record if workflow exists
        ...(workflow && {
          execution: {
            create: {
              workflowId: workflow.id,
              companyId: company_id,
              status: executionStatus, // Simplified status mapping
              currentStep: currentStepId
            }
          }
        })
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
        auditLogs: {
          create: {
            action: workflow_status,
            details: `Status updated to ${workflow_status}`,
            userId: req.user.id
          }
        }
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
