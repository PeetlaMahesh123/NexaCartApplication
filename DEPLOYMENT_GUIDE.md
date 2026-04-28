# 🚀 NexaCart Deployment Guide

## 📋 Step 1: Push to GitHub

### 1.1 Create GitHub Repository
1. Go to [GitHub](https://github.com) and sign in
2. Click "+" → "New repository"
3. Repository name: `NexaCart`
4. Description: `Modern E-commerce Platform with React & Supabase`
5. Make it **Public** (required for Render free tier)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click "Create repository"

### 1.2 Push Your Code
```bash
# Add remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/NexaCart.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy to Render

### 2.1 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with **GitHub** (recommended)
3. Verify your email

### 2.2 Deploy Static Site
1. Click "New +" → "Static Site"
2. **Connect Repository**: Select your `NexaCart` GitHub repo
3. **Name**: `nexacart`
4. **Branch**: `main`
5. **Root Directory**: Leave empty
6. **Build Command**: `npm run build`
7. **Publish Directory**: `dist`

### 2.3 Environment Variables
Add these environment variables in Render dashboard:

#### Supabase Configuration
```
VITE_SUPABASE_URL=https://yqksuecpjrokfjmvfcfa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxa3N1ZWNwanJva2ZqbXZmY2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MzAxNTcsImV4cCI6MjA5MjMwNjE1N30.Mzmv4gE5jcxkq1Q-ed-mawXaa8x47yRethfXxwhPRb4
```

#### Razorpay Configuration (Optional)
```
VITE_RAZORPAY_KEY_ID=rzp_test_LqWBBDbgwot5lh
```

#### App Configuration
```
APP_URL=https://your-app-name.onrender.com
```

### 2.4 Advanced Settings
1. **Auto-Deploy**: Enable (default)
2. **Custom Domain**: Optional (upgrade to Pro for custom domain)
3. **Redirects**: Add if needed

## 🔧 Step 3: Supabase Setup for Production

### 3.1 Update CORS Settings
1. Go to your Supabase project
2. Settings → API
3. Add your Render URL to CORS settings:
   ```
   https://your-app-name.onrender.com
   ```

### 3.2 Update Auth Settings
1. Authentication → Settings
2. Add your Render URL to "Site URL"
3. Add to "Redirect URLs":
   ```
   https://your-app-name.onrender.com/*
   ```

## 📱 Step 4: Test Your Deployment

### 4.1 Verify Build
1. Render will automatically build your site
2. Check the "Build Log" for any errors
3. Once deployed, visit your Render URL

### 4.2 Test Features
- ✅ Landing page loads
- ✅ Products display correctly
- ✅ User registration/login works
- ✅ Cart functionality works
- ✅ Checkout process completes

## 🛠️ Step 5: Troubleshooting

### Common Issues & Solutions

#### Build Fails
```bash
# Check locally first
npm run build
```

#### Environment Variables Not Working
- Verify variable names in Render dashboard
- Check they start with `VITE_` for frontend
- Restart the service after updating

#### Supabase Connection Issues
- Verify Supabase URL and keys
- Check CORS settings
- Ensure RLS policies are correct

#### White Screen/Blank Page
- Check browser console for errors
- Verify all assets load correctly
- Check network tab for failed requests

## 📊 Step 6: Monitor & Maintain

### Performance Monitoring
- Render provides basic metrics
- Check build logs regularly
- Monitor error rates

### Updates
- Push changes to GitHub → Auto-deploy
- Test thoroughly in production
- Keep dependencies updated

## 🎯 Quick Deployment Checklist

- [ ] GitHub repository created
- [ ] Code pushed to main branch
- [ ] Render static site created
- [ ] Environment variables configured
- [ ] Supabase CORS updated
- [ ] Supabase Auth URLs updated
- [ ] Build successful
- [ ] All features tested
- [ ] Domain working correctly

## 🆘 Support Resources

- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)

---

**🎉 Your NexaCart application is now live and ready for customers!**
