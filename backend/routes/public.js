import express from 'express';
import { prisma } from '../server.js';
import { workflowEngine } from '../services/workflowEngine.js';

const router = express.Router();

// Get form for public view
router.get('/form/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Public API] Fetching form: ${id}`);

        const form = await prisma.form.findFirst({
            where: { id },
        });

        if (!form) {
            console.log(`[Public API] Form ${id} NOT FOUND in database`);
            return res.status(404).json({ error: 'Form not found' });
        }

        if (!form.isPublished) {
            console.log(`[Public API] Form ${id} exists but is NOT PUBLISHED`);
            return res.status(404).json({ error: 'Form not published' });
        }

        console.log(`[Public API] Form ${id} found and published. Returning data.`);
        res.json({
            id: form.id,
            name: form.name,
            description: form.description,
            schema: form.schema,
            companyId: form.companyId,
        });
    } catch (error) {
        console.error('[Public API] Error fetching form:', error);
        res.status(500).json({ error: 'Failed to fetch form' });
    }
});

// Submit form publicly
router.post('/submit/:formId', async (req, res) => {
    try {
        const { formId } = req.params;
        const { data } = req.body;
        console.log(`[Public Submission] Start for form: ${formId}`);

        if (!data) {
            console.log('[Public Submission] ERROR: No data provided');
            return res.status(400).json({ error: 'Submission data required' });
        }

        // Verify form exists and is published
        const form = await prisma.form.findFirst({
            where: { id: formId },
        });

        if (!form) {
            console.log(`[Public Submission] ERROR: Form ${formId} not found`);
            return res.status(404).json({ error: 'Form not found' });
        }

        if (!form.isPublished) {
            console.log(`[Public Submission] ERROR: Form ${formId} is not published`);
            return res.status(404).json({ error: 'Form not published' });
        }

        // Create submission
        const submission = await prisma.submission.create({
            data: {
                data,
                form: { connect: { id: formId } },
                company: { connect: { id: form.companyId } },
            },
        });

        // Trigger workflow if exists
        const workflow = await prisma.workflow.findFirst({
            where: { formId }
        });

        if (workflow && workflow.definition && workflow.definition.steps) {
            const steps = workflow.definition.steps;
            const connections = workflow.definition.connections || [];

            // Find starting step (steps with no incoming connections)
            const targetIds = new Set(connections.map(c => c.targetId));
            const startStep = steps.find(s => !targetIds.has(s.id)) || steps[0];

            if (startStep) {
                const execution = await prisma.workflowExecution.create({
                    data: {
                        workflow: { connect: { id: workflow.id } },
                        submission: { connect: { id: submission.id } },
                        company: { connect: { id: form.companyId } },
                        status: 'PENDING',
                        currentStep: startStep.id,
                        snapshot: workflow.definition, // Save a snapshot of the workflow at execution time
                    }
                });

                // Trigger the engine to process the first step immediately
                // Use setImmediate to not block the response
                setImmediate(() => {
                    workflowEngine.processStep(execution.id, startStep.id).catch(err => {
                        console.error('Initial step processing failed:', err);
                    });
                });
            }
        }

        res.status(201).json({ message: 'Submission successful', id: submission.id });
    } catch (error) {
        console.error('Public submission error:', error);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

export default router;
