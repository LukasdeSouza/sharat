import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test company
  const company = await prisma.company.create({
    data: {
      name: 'Test Company',
      emailDomain: 'test.com',
    },
  });

  console.log(`✓ Created company: ${company.name}`);

  // Create a test user (admin)
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      company: {
        connect: { id: company.id },
      },
    },
  });

  console.log(`✓ Created user: ${user.email}`);

  // Create a test form
  const form = await prisma.form.create({
    data: {
      name: 'Contact Form',
      description: 'A simple contact form',
      schema: {
        fields: [
          {
            id: 'field-1',
            type: 'text',
            label: 'Name',
            placeholder: 'Enter your name',
            required: true,
            validation: [
              {
                type: 'required',
                message: 'Name is required',
              },
            ],
          },
          {
            id: 'field-2',
            type: 'email',
            label: 'Email',
            placeholder: 'Enter your email',
            required: true,
            validation: [
              {
                type: 'required',
                message: 'Email is required',
              },
              {
                type: 'email',
                message: 'Invalid email',
              },
            ],
          },
          {
            id: 'field-3',
            type: 'textarea',
            label: 'Message',
            placeholder: 'Enter your message',
            required: true,
            validation: [
              {
                type: 'required',
                message: 'Message is required',
              },
              {
                type: 'minLength',
                value: 10,
                message: 'Message must be at least 10 characters',
              },
            ],
          },
        ],
      },
      isPublished: true,
      company: {
        connect: { id: company.id },
      },
      createdBy: {
        connect: { id: user.id },
      },
    },
  });

  console.log(`✓ Created form: ${form.name}`);

  // Create a test workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Approval Workflow',
      definition: {
        steps: [
          {
            id: 'step-1',
            type: 'approval',
            name: 'Manager Approval',
            config: {
              approverEmail: 'manager@test.com',
              approvalTimeout: 86400,
            },
          },
          {
            id: 'step-2',
            type: 'notification',
            name: 'Send Confirmation',
            config: {
              recipients: ['user@test.com'],
              template: 'Your submission has been approved',
            },
          },
        ],
        connections: [
          {
            id: 'conn-1',
            fromStepId: 'step-1',
            toStepId: 'step-2',
          },
        ],
      },
      form: {
        connect: { id: form.id },
      },
      company: {
        connect: { id: company.id },
      },
    },
  });

  console.log(`✓ Created workflow: ${workflow.name}`);

  // Create a test submission
  const submission = await prisma.submission.create({
    data: {
      data: {
        'field-1': 'John Doe',
        'field-2': 'john@example.com',
        'field-3': 'This is a test message for the contact form',
      },
      workflowStatus: 'PENDING',
      form: {
        connect: { id: form.id },
      },
      company: {
        connect: { id: company.id },
      },
    },
  });

  console.log(`✓ Created submission: ${submission.id}`);

  // Create a workflow execution
  const execution = await prisma.workflowExecution.create({
    data: {
      currentStep: 'step-1',
      status: 'PENDING',
      workflow: {
        connect: { id: workflow.id },
      },
      submission: {
        connect: { id: submission.id },
      },
      company: {
        connect: { id: company.id },
      },
    },
  });

  console.log(`✓ Created workflow execution: ${execution.id}`);

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
