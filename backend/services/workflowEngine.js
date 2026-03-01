import { prisma } from '../server.js';
import { emailService } from './emailService.js';

export const workflowEngine = {
    /**
     * Process a step in a workflow execution
     * @param {string} executionId 
     * @param {string} stepId 
     */
    async processStep(executionId, stepId) {
        try {
            const execution = await prisma.workflowExecution.findUnique({
                where: { id: executionId },
                include: {
                    workflow: true,
                    submission: { include: { form: true } },
                    company: true,
                },
            });

            if (!execution) throw new Error('Execution not found');

            // Use snapshot if available, otherwise use live definition
            const definition = execution.snapshot || execution.workflow.definition;
            const step = definition.steps.find((s) => s.id === stepId);

            if (!step) {
                // No more steps or invalid step, mark execution as completed
                await prisma.workflowExecution.update({
                    where: { id: executionId },
                    data: { status: 'COMPLETED', currentStep: null },
                });

                await prisma.submission.update({
                    where: { id: execution.submissionId },
                    data: { workflowStatus: 'COMPLETED' },
                });
                return;
            }

            // Update current step
            await prisma.workflowExecution.update({
                where: { id: executionId },
                data: { currentStep: stepId },
            });

            // Handle based on step type
            switch (step.type) {
                case 'notification':
                    await this.handleNotificationStep(execution, step);
                    await this.moveToNextStep(execution, stepId);
                    break;

                case 'approval':
                    await this.handleApprovalStep(execution, step);
                    // Wait for user manual approval (manual PUT to /submissions/:id/status)
                    break;

                case 'condition':
                    await this.handleConditionStep(execution, step);
                    break;

                case 'webhook':
                    await this.handleWebhookStep(execution, step);
                    await this.moveToNextStep(execution, stepId);
                    break;

                case 'transform':
                    await this.handleTransformStep(execution, step);
                    await this.moveToNextStep(execution, stepId);
                    break;

                default:
                    // Unhandled step type, just move on
                    await this.moveToNextStep(execution, stepId);
            }
        } catch (error) {
            console.error('Workflow engine error:', error);
            // Mark as rejected or error if something fails fundamentally
            await prisma.workflowExecution.update({
                where: { id: executionId },
                data: { status: 'REJECTED' },
            });
        }
    },

    async handleNotificationStep(execution, step) {
        const recipients = step.config?.recipients || [];
        const formName = execution.submission.form.name;
        const stepName = step.name || 'Notification';
        const template = step.config?.template;
        const submissionData = execution.submission.data;

        for (const email of recipients) {
            if (email && /^\S+@\S+\.\S+$/.test(email)) {
                await emailService.sendWorkflowStepNotification(
                    email,
                    stepName,
                    formName,
                    execution.submissionId,
                    submissionData,
                    template
                );
            }
        }
    },

    async handleApprovalStep(execution, step) {
        const approverEmail = step.config?.approverEmail;
        const formName = execution.submission.form.name;
        const stepName = step.name || 'Approval Request';
        const submissionData = execution.submission.data;
        // Approvals can also have a custom instruction/template if we want
        const template = step.config?.template;

        if (approverEmail && /^\S+@\S+\.\S+$/.test(approverEmail)) {
            await emailService.sendWorkflowStepNotification(
                approverEmail,
                stepName,
                formName,
                execution.submissionId,
                submissionData,
                template
            );
        }
    },

    async handleConditionStep(execution, step) {
        // Basic evaluation for now (could use safer eval logic)
        const condition = step.config?.condition;
        const submissionData = execution.submission.data;

        let result = false;
        try {
            // In a real app, use a sandboxed evaluator like 'vm' or 'jexl'
            // For this demo, we'll implement simple key mapping
            const context = submissionData;
            // Simple eval placeholder
            result = true; // Defaulting to true for demo
        } catch (e) {
            console.error('Condition evaluation error:', e);
        }

        const nextStepId = result ? step.config?.truePath : step.config?.falsePath;
        if (nextStepId) {
            await this.processStep(execution.id, nextStepId);
        } else {
            await this.moveToNextStep(execution.id, step.id);
        }
    },

    async handleWebhookStep(execution, step) {
        // Placeholder for webhook execution
        console.log('Executing webhook:', step.config?.url);
    },

    async handleTransformStep(execution, step) {
        // Placeholder for data transformation
        console.log('Executing transformation');
    },

    async moveToNextStep(execution, currentStepId) {
        const definition = execution.snapshot || execution.workflow.definition;
        const connection = (definition.connections || []).find(
            (c) => c.sourceId === currentStepId
        );

        if (connection && connection.targetId) {
            await this.processStep(execution.id, connection.targetId);
        } else {
            // No next step, finish
            await this.processStep(execution.id, 'finish_this_execution');
        }
    }
};
