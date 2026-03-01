# Guia de Deployment

## Arquitetura de Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  Frontend (React)│      │  Backend (Node)  │
│  Vercel/Netlify │      │  Heroku/Railway  │
│  Static Files    │      │  REST API        │
└──────────────────┘      └────────┬─────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │  PostgreSQL      │
                          │  Neon/AWS RDS    │
                          │  Database        │
                          └──────────────────┘
```

## Frontend Deployment

### Opção 1: Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
cd form-workflow-builder
vercel

# 3. Configurar variáveis de ambiente
# No dashboard Vercel:
# REACT_APP_API_URL=https://seu-backend.com/api
```

### Opção 2: Netlify

```bash
# 1. Build
npm run build

# 2. Deploy
netlify deploy --prod --dir=dist

# 3. Configurar variáveis de ambiente
# No dashboard Netlify:
# REACT_APP_API_URL=https://seu-backend.com/api
```

### Opção 3: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

```bash
docker build -t form-builder-frontend .
docker run -p 3000:3000 form-builder-frontend
```

## Backend Deployment

### Opção 1: Railway (Recomendado)

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd backend
railway up

# 4. Configurar variáveis de ambiente
# No dashboard Railway:
# DATABASE_URL=postgresql://...
# JWT_SECRET=seu-secret-key
# NODE_ENV=production
```

### Opção 2: Heroku

```bash
# 1. Instalar Heroku CLI
npm install -g heroku

# 2. Login
heroku login

# 3. Criar app
heroku create seu-app-name

# 4. Adicionar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 5. Configurar variáveis
heroku config:set JWT_SECRET=seu-secret-key
heroku config:set NODE_ENV=production

# 6. Deploy
git push heroku main
```

### Opção 3: Docker + AWS ECS

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

```bash
# Build e push para ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker build -t form-builder-backend .
docker tag form-builder-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/form-builder-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/form-builder-backend:latest
```

## Database Deployment

### Opção 1: Neon (Recomendado)

```bash
# 1. Criar conta em neon.tech
# 2. Criar projeto
# 3. Copiar DATABASE_URL
# 4. Executar migrations

DATABASE_URL=postgresql://... npm run migrate
```

### Opção 2: AWS RDS

```bash
# 1. Criar RDS instance
# 2. Configurar security groups
# 3. Copiar connection string
# 4. Executar migrations

DATABASE_URL=postgresql://... npm run migrate
```

### Opção 3: DigitalOcean Managed Database

```bash
# 1. Criar Managed Database
# 2. Copiar connection string
# 3. Executar migrations

DATABASE_URL=postgresql://... npm run migrate
```

## Variáveis de Ambiente

### Frontend (.env.production)

```
REACT_APP_API_URL=https://seu-backend.com/api
REACT_APP_ENV=production
```

### Backend (.env.production)

```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=seu-super-secret-key-aleatorio
PORT=3001
NODE_ENV=production
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm install
      
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: cd backend && npm run migrate
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: npm install -g @railway/cli && railway up

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd form-workflow-builder && npm install
      
      - name: Build
        env:
          REACT_APP_API_URL: ${{ secrets.API_URL }}
        run: cd form-workflow-builder && npm run build
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: npm install -g vercel && vercel --prod --token $VERCEL_TOKEN
```

## Monitoramento

### Logs

```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Docker
docker logs container-id
```

### Métricas

```bash
# Verificar saúde da API
curl https://seu-backend.com/health

# Verificar database
psql $DATABASE_URL -c "SELECT 1"
```

## Backup

### PostgreSQL Backup

```bash
# Backup local
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Backup automático (cron)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

## Scaling

### Horizontal Scaling

```
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)           │
└────────────┬────────────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐
│Backend1││Backend2││Backend3│
└────────┘└────────┘└────────┘
    │        │        │
    └────────┼────────┘
             │
             ▼
        ┌─────────────┐
        │ PostgreSQL  │
        │ (Replicated)│
        └─────────────┘
```

### Cache Layer

```
Frontend → Nginx (Cache) → Backend → PostgreSQL
```

## Checklist de Deployment

- [ ] Variáveis de ambiente configuradas
- [ ] Database migrations executadas
- [ ] CORS configurado corretamente
- [ ] JWT_SECRET alterado
- [ ] SSL/HTTPS ativado
- [ ] Backups configurados
- [ ] Monitoramento ativado
- [ ] Logs centralizados
- [ ] Rate limiting ativado
- [ ] Testes passando

## Troubleshooting

### Erro: "Cannot connect to database"
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
psql $DATABASE_URL -c "SELECT 1"
```

### Erro: "Invalid token"
```bash
# Verificar JWT_SECRET
echo $JWT_SECRET

# Regenerar token
# Fazer login novamente
```

### Erro: "CORS error"
```bash
# Verificar CORS no backend
# Adicionar frontend URL em CORS whitelist
```

## Próximos Passos

1. Configurar CI/CD
2. Implementar monitoring
3. Configurar alertas
4. Implementar auto-scaling
5. Configurar CDN para frontend
