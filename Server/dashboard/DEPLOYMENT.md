# Tanak Prabha Dashboard - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Backend API server running and accessible
- Environment variables configured

## Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your configuration:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
# For production: https://api.your-domain.com/api

# Dashboard API Key (must match backend DASHBOARD_API_KEY)
NEXT_PUBLIC_DASHBOARD_API_KEY=tanak-prabha-dashboard-secret-key-2024

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000
# For production: https://dashboard.your-domain.com

# Map Configuration (optional)
NEXT_PUBLIC_MAP_DEFAULT_LAT=26.2006
NEXT_PUBLIC_MAP_DEFAULT_LNG=92.9376
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=7
```

## Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

## Development

```bash
# Start development server
npm run dev

# Dashboard will be available at http://localhost:3000
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t tanak-prabha-dashboard .
docker run -p 3000:3000 --env-file .env.local tanak-prabha-dashboard
```

### Traditional Server Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start npm --name "dashboard" -- start
pm2 save
pm2 startup
```

## Environment Variables

### Required Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_DASHBOARD_API_KEY` - Dashboard API key (must match backend)
- `NEXTAUTH_SECRET` - Secret for NextAuth (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Full URL of your dashboard (for production)

### Optional Variables

- `NEXT_PUBLIC_MAP_DEFAULT_LAT` - Default map latitude
- `NEXT_PUBLIC_MAP_DEFAULT_LNG` - Default map longitude
- `NEXT_PUBLIC_MAP_DEFAULT_ZOOM` - Default map zoom level

## Features

### ✅ Implemented Features

- **Authentication**: NextAuth.js with credentials provider
- **Dashboard Overview**: Statistics cards, farmer density map, recent activity
- **Beneficiaries Management**: View, add, edit, delete farmers
- **Professionals Management**: Manage doctors, veterinarians, agricultural experts
- **Content Management**: 
  - Schemes (with English/Hindi support)
  - Banners (with drag-and-drop ordering)
  - Announcements/Notifications
- **Settings**: Profile and organization settings
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode**: Theme toggle support

### API Integration

All components are integrated with the backend API:
- Users API (`/api/users`)
- Professionals API (`/api/professionals`)
- Schemes API (`/api/schemes`)
- Banners API (`/api/banners`)
- Notifications API (`/api/notifications`)
- Analytics API (`/api/analytics`)
- Upload API (`/api/upload`)

## Troubleshooting

### Build Errors

1. **Module not found**: Run `npm install` to ensure all dependencies are installed
2. **Environment variables**: Ensure all required variables are set
3. **API connection**: Verify backend API is running and accessible

### Runtime Errors

1. **API errors**: Check browser console and network tab
2. **Authentication issues**: Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly
3. **CORS errors**: Ensure backend allows requests from dashboard domain

### Common Issues

- **"Network error"**: Backend API is not running or URL is incorrect
- **"Unauthorized"**: Dashboard API key doesn't match backend
- **"Invalid token"**: NextAuth secret mismatch or session expired

## Security Notes

1. **Never commit `.env.local`** to version control
2. **Use strong secrets** for `NEXTAUTH_SECRET` in production
3. **Enable HTTPS** in production
4. **Keep dependencies updated** regularly
5. **Use environment-specific API keys**

## Support

For issues or questions, please check:
- Backend API documentation
- Next.js documentation: https://nextjs.org/docs
- NextAuth.js documentation: https://next-auth.js.org
