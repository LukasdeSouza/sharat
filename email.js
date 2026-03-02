// This is a mock email sending function for demonstration
const sendEmail = async ({ to, subject, body }) => {
  console.log(`\n--- Sending Email ---`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  // Simulate network delay for sending an email
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log(`Email sent successfully to ${to}`);
  console.log(`---------------------\n`);
  return { success: true };
};

export const processEmailJob = async (job) => {
  const { to, subject, body } = job.data;
  console.log(`Processing job ${job.id} - Sending email to ${to}`);

  try {
    await sendEmail({ to, subject, body });
    console.log(`Job ${job.id} completed successfully.`);
  } catch (error) {
    console.error(`Job ${job.id} failed with error: ${error.message}`);
    throw error; // Throwing error will trigger a retry based on queue settings
  }
};