# Backend Setup Commands

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Seed database with test data
npm run prisma:seed

# 5. Start development server
npm run dev
```

## Useful Commands

```bash
# View database in Prisma Studio
npm run prisma:studio

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Deploy migrations to production
npm run prisma:migrate:prod

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npm run prisma:generate

# Seed database
npm run prisma:seed

# Start production server
npm start
```

## Environment Variables

The `.env` file should contain:
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
```

## Test Credentials

After seeding:
- **Email**: admin@test.com
- **Password**: password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new company and user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Forms
- `GET /api/forms` - List all forms
- `GET /api/forms/:id` - Get single form
- `POST /api/forms` - Create form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Workflows
- `GET /api/workflows/form/:formId` - Get workflows for form
- `GET /api/workflows/:id` - Get single workflow
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Submissions
- `GET /api/submissions/form/:formId` - Get submissions for form
- `GET /api/submissions/:id` - Get single submission
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/:id/status` - Update submission status
- `DELETE /api/submissions/:id` - Delete submission

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` in `.env` is correct
- Check PostgreSQL is running
- Ensure network access to database host

### Prisma Client Not Found
```bash
npx prisma generate
```

### Migration Conflicts
```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

### Reset Everything
```bash
npx prisma migrate reset
npm run prisma:seed
```
