import express from 'express';
import { prisma } from '../server.js';
const router = express.Router();

const DEFAULT_DAYS = 14;

// GET /api/stats - Overview stats for the current tenant
router.get('/', async (req, res) => {
  try {
    const { company_id } = req.user;
    const days = Math.min(parseInt(req.query.days) || DEFAULT_DAYS, 90);

    const [usersCount, formsCount, workflowsCount, submissionsCount, submissionsByDay, submissionsByForm] =
      await Promise.all([
        prisma.user.count({ where: { companyId: company_id } }),
        prisma.form.count({ where: { companyId: company_id } }),
        prisma.workflow.count({ where: { companyId: company_id } }),
        prisma.submission.count({ where: { companyId: company_id } }),
        getSubmissionsByDay(company_id, days),
        getSubmissionsByForm(company_id),
      ]);

    res.json({
      users: usersCount,
      forms: formsCount,
      workflows: workflowsCount,
      submissions: submissionsCount,
      submissionsByDay,
      submissionsByForm,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

async function getSubmissionsByDay(companyId, days) {
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - days);
  const result = await prisma.$queryRaw`
    SELECT
      date_trunc('day', "submittedAt" AT TIME ZONE 'UTC')::date AS day,
      count(*)::int AS count
    FROM submissions
    WHERE "companyId" = ${companyId}
      AND "submittedAt" >= ${startDate}
    GROUP BY date_trunc('day', "submittedAt" AT TIME ZONE 'UTC')::date
    ORDER BY day ASC
  `;
  return result.map((r) => ({
    date: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
    count: Number(r.count),
  }));
}

async function getSubmissionsByForm(companyId) {
  const result = await prisma.submission.groupBy({
    by: ['formId'],
    where: { companyId: companyId },
    _count: { id: true },
  });

  if (result.length === 0) return [];

  const formIds = result.map((r) => r.formId);
  const forms = await prisma.form.findMany({
    where: { id: { in: formIds }, companyId: companyId },
    select: { id: true, name: true },
  });
  const formNames = Object.fromEntries(forms.map((f) => [f.id, f.name]));

  return result.map((r) => ({
    formId: r.formId,
    formName: formNames[r.formId] || 'Unknown',
    count: r._count.id,
  }));
}

export default router;
