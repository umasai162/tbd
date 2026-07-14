# Deploy to Render - Complete Guide

This guide will help you deploy the Sri Venkateswara Holy Devasthanams portal to Render.

## 📋 Prerequisites

- **Render Account** - Sign up at [render.com](https://render.com)
- **GitHub Account** - Your code should be on GitHub
- **MySQL Database** - External MySQL provider (Render doesn't support MySQL directly)
  - Recommended: [PlanetScale](https://planetscale.com) (Free tier available)
  - Alternatives: AWS RDS, Google Cloud SQL, DigitalOcean MySQL
- **Gemini API Key** - For AI chatbot functionality

## 🚀 Deployment Options

### Option 1: Direct Render Deployment (Recommended)

#### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Ensure all files are committed**
   - `render.yaml`
   - `Dockerfile`
   - `.dockerignore`
   - `.env.example` (for reference)

#### Step 2: Set Up External MySQL Database

**Using PlanetScale (Recommended Free Option):**

1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database named `temple_db`
3. Get your connection details:
   - Host
   - Username
   - Password
   - Database name
4. Run the initialization script:
   ```bash
   # In PlanetScale console, run the SQL from database/init.sql
   ```

**Using Other MySQL Providers:**

- Create database `temple_db`
- Run the `database/init.sql` script
- Note the connection details

#### Step 3: Deploy to Render

1. **Log in to Render** at [dashboard.render.com](https://dashboard.render.com)

2. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure the Web Service**
   - **Name**: `temple-portal`
   - **Region**: Choose nearest to your users
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Instance Type**: Free (for testing) or Starter ($7/month for production)

4. **Add Environment Variables**
   In the "Advanced" section, add these environment variables:
   
   | Variable | Value | Required |
   |----------|-------|----------|
   | `NODE_ENV` | `production` | Yes |
   | `PORT` | `3000` | Yes |
   | `GEMINI_API_KEY` | Your Gemini API key | Optional |
   | `DB_HOST` | Your MySQL host | Yes |
   | `DB_USER` | Your MySQL username | Yes |
   | `DB_PASSWORD` | Your MySQL password | Yes |
   | `DB_NAME` | `temple_db` | Yes |
   | `DB_PORT` | `3306` | Yes |

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your application
   - Wait for the deployment to complete (usually 2-5 minutes)

#### Step 4: Access Your Application

- Once deployed, Render will provide a URL like: `https://temple-portal.onrender.com`
- Access your application at this URL
- The application will automatically use MySQL if configured, or fall back to JSON storage

### Option 2: Manual Docker Deployment

If you prefer more control or need custom configuration:

#### Step 1: Build Docker Image

```bash
docker build -t temple-portal .
```

#### Step 2: Test Locally

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your_mysql_host \
  -e DB_USER=your_mysql_user \
  -e DB_PASSWORD=your_mysql_password \
  -e DB_NAME=temple_db \
  temple-portal
```

#### Step 3: Push to Container Registry

```bash
# Tag for Docker Hub
docker tag temple-portal yourusername/temple-portal:latest

# Push to Docker Hub
docker push yourusername/temple-portal:latest
```

#### Step 4: Deploy to Render

1. In Render, create a new Web Service
2. Select "Docker" as runtime
3. Use your Docker image: `yourusername/temple-portal:latest`
4. Add environment variables as shown in Option 1

## 🔧 Configuration Details

### render.yaml Explained

The `render.yaml` file automates deployment configuration:

```yaml
services:
  - type: web              # Web service
    name: temple-portal    # Service name
    env: node              # Runtime environment
    plan: free             # Pricing plan
    buildCommand: npm install && npm run build
    startCommand: npm start
```

### Dockerfile Explained

Multi-stage build for optimized image size:
- **Stage 1**: Build the application
- **Stage 2**: Production runtime with minimal dependencies

### Environment Variables

Critical environment variables for production:

```env
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_api_key_here
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=temple_db
DB_PORT=3306
```

## 🗄️ Database Setup

### PlanetScale Setup (Free MySQL)

1. **Create Account**: [planetscale.com](https://planetscale.com)
2. **Create Database**: 
   - Click "Create Database"
   - Name: `temple_db`
   - Region: Choose nearest
3. **Get Connection Details**:
   - Go to "Settings" → "Connection Strings"
   - Copy the connection details
4. **Run Initialization**:
   - In PlanetScale console, run the SQL from `database/init.sql`

### Alternative: Render PostgreSQL

If you prefer to use Render's built-in database:

1. Uncomment the PostgreSQL section in `render.yaml`
2. Update `server.ts` to use PostgreSQL instead of MySQL
3. Install PostgreSQL dependencies:
   ```bash
   npm install pg
   ```

## 🔒 Security Considerations

1. **Never commit `.env` file** - Use environment variables in Render
2. **Use strong database passwords** - Generate secure passwords
3. **Enable SSL** - Most cloud providers include SSL by default
4. **API Keys** - Keep Gemini API key secure in Render environment variables
5. **Rate Limiting** - Consider adding rate limiting for production

## 📊 Monitoring

### Render Dashboard

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, memory, and response times
- **Deployments**: Track deployment history

### Health Checks

The Dockerfile includes a health check:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/stats', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update application"
git push origin main
# Render will automatically redeploy
```

## 🐛 Troubleshooting

### Common Issues

**1. Build Fails**
- Check logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Dockerfile syntax

**2. Database Connection Failed**
- Verify environment variables are set correctly
- Check MySQL database is accessible
- Ensure database user has proper permissions

**3. Application Not Starting**
- Check PORT environment variable (should be 3000)
- Verify start command in `render.yaml`
- Review server logs for errors

**4. Payment Gateway Issues**
- Ensure payment_attempts table exists
- Check database connection
- Verify transaction ID generation

### Getting Help

- Render Documentation: [render.com/docs](https://render.com/docs)
- PlanetScale Docs: [planetscale.com/docs](https://planetscale.com/docs)
- Check logs in Render dashboard

## 📈 Scaling

### Upgrade from Free Tier

When ready for production:

1. **In Render Dashboard**:
   - Go to your service
   - Click "Settings"
   - Change "Instance Type" to "Starter" ($7/month) or higher

2. **Benefits**:
   - More CPU and memory
   - Faster build times
   - No cold starts
   - Better performance

### Database Scaling

- **PlanetScale**: Upgrade to paid tier for more connections
- **External MySQL**: Scale based on your provider's options

## 🎉 Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Database connection works
- [ ] Booking functionality works
- [ ] Payment gateway functions
- [ ] AI chatbot responds (if API key configured)
- [ ] SSL certificate is active
- [ ] Environment variables are set
- [ ] Logs show no critical errors
- [ ] Health checks pass

## 📝 Custom Domain (Optional)

To use a custom domain:

1. **In Render Dashboard**:
   - Go to your service
   - Click "Settings" → "Custom Domains"
   - Add your domain (e.g., `temple.yourdomain.com`)

2. **Update DNS**:
   - Add CNAME record pointing to your Render service
   - Wait for DNS propagation (usually 24-48 hours)

3. **SSL Certificate**:
   - Render automatically provisions SSL for custom domains

## 🔄 Backup Strategy

### Database Backups

- **PlanetScale**: Automatic backups included
- **External MySQL**: Configure regular backups
- **JSON Fallback**: Not suitable for production backup

### Application Backups

- Git repository serves as application backup
- Render maintains deployment history
- Consider periodic database exports

## 📞 Support

For issues specific to:
- **Render**: [render.com/support](https://render.com/support)
- **PlanetScale**: [planetscale.com/support](https://planetscale.com/support)
- **Application**: Check logs and documentation

---

**Your application is now ready for deployment to Render!** 🚀
