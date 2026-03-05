# Deployment Guide - ATS Interview Platform

This guide explains how to deploy the ATS Interview Platform to production using Vercel (frontend) and Render (backend).

## Prerequisites

- ✅ GitHub repository: https://github.com/sowmya-sruthidevi/well.git
- ✅ MongoDB Atlas account and database
- ✅ OpenAI API key
- ✅ Vercel account (free tier)
- ✅ Render account (free tier)

## Architecture Overview

```
Frontend (React)          Backend (Node.js/Express)       Database
    Vercel       ←→            Render              ←→   MongoDB Atlas
```

## Step 1: Deploy Backend to Render

### 1.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `sowmya-sruthidevi/well`
4. Configure the service:
   - **Name**: `ats-interview-backend` (or your preferred name)
   - **Region**: Oregon (or closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `ats-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

### 1.2 Add Environment Variables

In the Render dashboard, add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `5000` | Render will override this, but keep for consistency |
| `MONGO_URI` | `mongodb+srv://sruthi:Devi7842@cluster0.qesbnze.mongodb.net/atsdb` | Your MongoDB Atlas connection string |
| `OPENAI_API_KEY` | `sk-proj-RKL_FCz4lW_...` | Your OpenAI API key from .env file |
| `JWT_SECRET` | `your_secure_random_string` | Generate a secure random string for production |
| `FRONTEND_URL` | *Leave empty for now* | We'll add this after deploying frontend |

### 1.3 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Copy your backend URL: `https://your-backend-app.onrender.com`
4. Test the health endpoint: `https://your-backend-app.onrender.com/health`
   - Should return: `{"status":"ok","message":"Server is running"}`

> **Note**: Render free tier spins down after 15 minutes of inactivity. First request after inactivity may take 30-60 seconds.

## Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Frontend

1. Update `interview-frontend/.env.production` with your Render backend URL:
   ```env
   REACT_APP_API_URL=https://your-backend-app.onrender.com
   ```

2. Commit and push this change:
   ```bash
   git add interview-frontend/.env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

### 2.2 Create New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `sowmya-sruthidevi/well`
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `interview-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.3 Add Environment Variables

In Vercel project settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend-app.onrender.com` | Production |

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for build and deployment (3-5 minutes)
3. Copy your frontend URL: `https://your-app.vercel.app`
4. Test the deployment by visiting the URL

## Step 3: Update CORS Configuration

Now that you have the frontend URL, update the backend:

1. Go back to Render dashboard → Your backend service
2. Add/Update environment variable:
   - `FRONTEND_URL` = `https://your-app.vercel.app`
3. This will trigger automatic redeployment
4. Wait for deployment to complete

## Step 4: Verify Deployment

### Backend Checks:
- ✅ Health endpoint: `https://your-backend-app.onrender.com/health`
- ✅ MongoDB connection: Check logs for "MongoDB Connected"
- ✅ OpenAI API key: Check logs for any API errors

### Frontend Checks:
- ✅ Homepage loads: `https://your-app.vercel.app`
- ✅ Login/Signup works
- ✅ Dashboard displays
- ✅ All features functional:
  - ATS Resume Upload & Analysis
  - Aptitude Test
  - Bot Interview with Code Editor
  - Group Discussion with AI Bots
  - Technical Round

### Integration Checks:
- ✅ API calls succeed (check browser Network tab)
- ✅ CORS errors resolved
- ✅ Authentication works
- ✅ File uploads work
- ✅ AI features work (OpenAI API calls)

## Step 5: Custom Domain (Optional)

### For Vercel (Frontend):
1. In Vercel project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### For Render (Backend):
1. In Render service settings → Custom Domain
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update `FRONTEND_URL` in Render and `REACT_APP_API_URL` in Vercel

## Troubleshooting

### Backend Issues:

**MongoDB Connection Error**:
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for all IPs)
- Verify database user credentials

**OpenAI API Error**:
- Verify `OPENAI_API_KEY` is correct and active
- Check OpenAI account has available credits
- Review backend logs for specific error messages

**CORS Error**:
- Verify `FRONTEND_URL` environment variable is set correctly
- Check backend logs for CORS-related errors
- Ensure frontend URL doesn't have trailing slash

### Frontend Issues:

**API Calls Failing**:
- Check `REACT_APP_API_URL` environment variable
- Verify backend is running: test health endpoint
- Check browser console for specific errors

**Build Failure**:
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Try building locally first: `npm run build`

**Environment Variables Not Working**:
- In Vercel: Redeploy after adding environment variables
- Ensure variable names start with `REACT_APP_`
- Clear browser cache and hard refresh

## Maintenance

### Update Deployment:

**Backend**:
1. Push changes to GitHub: `git push origin main`
2. Render automatically redeploys from `main` branch
3. Monitor deployment in Render dashboard

**Frontend**:
1. Push changes to GitHub: `git push origin main`
2. Vercel automatically redeploys from `main` branch
3. Monitor deployment in Vercel dashboard

### Monitor Logs:

**Render**:
- Dashboard → Your Service → Logs tab
- View real-time logs and error messages

**Vercel**:
- Dashboard → Your Project → Deployments → Click deployment → Function Logs
- View build logs and runtime logs

## Production URLs

After deployment, update these in your documentation:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend-app.onrender.com`
- **Health Check**: `https://your-backend-app.onrender.com/health`

## Security Notes

🔒 **Important**:
- Never commit `.env` files to Git (already in `.gitignore`)
- Use strong, unique `JWT_SECRET` in production
- Keep `OPENAI_API_KEY` secure
- Regularly rotate secrets and API keys
- Monitor API usage and costs
- Set MongoDB Atlas IP whitelist restrictively if possible

## Free Tier Limits

**Vercel Free**:
- 100 GB bandwidth/month
- Unlimited deployments
- Serverless functions limited

**Render Free**:
- 750 hours/month (enough for 1 service running 24/7)
- Spins down after 15 min inactivity
- 512 MB RAM
- Shared CPU

**MongoDB Atlas Free**:
- 512 MB storage
- Shared cluster
- No backups

## Cost Optimization

1. **Backend**: Consider paid plan ($7/month) to prevent spin-down
2. **Frontend**: Free tier is usually sufficient
3. **Database**: Free tier adequate for MVP and testing
4. **OpenAI**: Monitor usage, set monthly limits

## Support

If you encounter issues:
1. Check logs in Render and Vercel dashboards
2. Test locally first to isolate deployment issues
3. Review this guide's troubleshooting section
4. Check MongoDB Atlas and OpenAI status pages

---

**Deployment Checklist**:
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS configured with frontend URL
- [ ] All features tested end-to-end
- [ ] Health check endpoint working
- [ ] Production URLs documented

🎉 **Congratulations!** Your ATS Interview Platform is now live in production!
