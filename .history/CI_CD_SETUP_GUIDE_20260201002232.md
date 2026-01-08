# **Complete CI/CD Setup Instructions**

## **STEP 1: Create Docker Hub Account (5 minutes)**

### **1.1 Sign Up**
1. Go to: https://hub.docker.com/signup
2. Fill in:
   - Email: your email
   - Username: choose a username (e.g., `your-name`)
   - Password: strong password
3. Click "Sign up"
4. Verify your email

### **1.2 Create Access Token**
1. Go to: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Fill in:
   - Token name: `GitHub Actions`
   - Access permissions: Select "Read, Write, Delete"
4. Click "Generate"
5. **COPY the token** (16+ characters)
   - ⚠️ You won't see it again!
   - Save it temporarily (we'll use it in Step 3)

**Example token:** `dckr_pat_ABC123XYZ789...`

---

## **STEP 2: Create Gmail App Password (5 minutes)**

### **2.1 Enable 2-Factor Authentication**
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the prompts (phone verification)
4. Confirm when complete

### **2.2 Generate App Password**
1. Go to: https://myaccount.google.com/apppasswords
2. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your OS)
3. Click "Generate"
4. **Google shows 16-character password**
   - **COPY this exactly** (ignore spaces)
   - Example: `abcd efgh ijkl mnop` → copy as `abcdefghijklmnop`

---

## **STEP 3: Add GitHub Secrets (5 minutes)**

### **3.1 Navigate to Secrets**
1. Go to your GitHub repo: https://github.com/your-username/Zero-Knowledge-Password-Manager
2. Click **Settings** (top right)
3. Left sidebar → **Secrets and variables** → **Actions**

### **3.2 Create Secret 1: Docker Username**
1. Click "New repository secret"
2. **Name:** `DOCKER_USERNAME`
3. **Value:** your Docker Hub username (from Step 1)
4. Click "Add secret"

### **3.3 Create Secret 2: Docker Password**
1. Click "New repository secret"
2. **Name:** `DOCKER_PASSWORD`
3. **Value:** the Docker access token from Step 1.2
4. Click "Add secret"

### **3.4 Create Secret 3: SMTP User**
1. Click "New repository secret"
2. **Name:** `SMTP_USER`
3. **Value:** your Gmail email address (e.g., `yourname@gmail.com`)
4. Click "Add secret"

### **3.5 Create Secret 4: SMTP Password**
1. Click "New repository secret"
2. **Name:** `SMTP_PASS`
3. **Value:** the Gmail app password from Step 2.2 (16 characters, no spaces)
4. Click "Add secret"

### **Verification:**
Go back to Settings → Secrets and variables → Actions
You should see 4 secrets (values hidden with dots):
```
✓ DOCKER_PASSWORD
✓ DOCKER_USERNAME
✓ SMTP_PASS
✓ SMTP_USER
```

---

## **STEP 4: Verify Pipeline Files Are Ready (2 minutes)**

Check these files exist in your repo:

```
.github/
  └── workflows/
      └── ci-cd.yml                    ✓ Main pipeline

packages/
  ├── backend/
  │   └── Dockerfile                   ✓ Backend container
  └── crypto-engine/
      └── test/
          ├── argon2.test.ts           ✓ Crypto tests
          ├── aes.test.ts              ✓ (31 tests)
          └── vault.test.ts            ✓

apps/
  └── extension/
      └── Dockerfile                   ✓ Frontend container

docker-compose.yml                     ✓ Local dev setup
GITHUB_ACTIONS_SETUP.md               ✓ This file
```

---

## **STEP 5: Push Files to GitHub (2 minutes)**

### **5.1 Commit Files Locally**
```powershell
cd c:\Users\ASUS\Downloads\Password_Manager

# Stage all files
git add .github/ docker-compose.yml packages/backend/Dockerfile apps/extension/Dockerfile GITHUB_ACTIONS_SETUP.md

# Commit
git commit -m "Add CI/CD pipeline: GitHub Actions, Docker, docker-compose"

# Push to main branch
git push origin main
```

### **5.2 Verify Push**
```powershell
git log --oneline -5
# Should show your new commit at top
```

---

## **STEP 6: Trigger & Verify Pipeline (10 minutes)**

### **6.1 Check Workflow Started**
1. Go to: https://github.com/your-username/Zero-Knowledge-Password-Manager
2. Click **Actions** tab (top menu)
3. You should see: "CI/CD Pipeline" workflow running
4. Green checkmark = passing, Red X = failed

### **6.2 View Detailed Logs**
1. Click the workflow run
2. You'll see:
   ```
   ✅ test-crypto          [████████████] Passed (50s)
   ✅ test-backend         [████████████] Passed (80s)
   ✅ build-docker         [████████████] Passed (2min)
   ✅ code-quality         [████████████] Passed (1min)
   ```

### **6.3 Check Docker Images Pushed**
1. Go to: https://hub.docker.com/repositories
2. Login with your Docker Hub account
3. You should see:
   - `your-username/password-manager-backend` (latest tag)
   - `your-username/password-manager-frontend` (latest tag)

### **6.4 If Something Failed**

**Error: "Docker login failed"**
- Check DOCKER_USERNAME and DOCKER_PASSWORD are correct
- Re-generate Docker access token if needed

**Error: "MongoDB connection timeout"**
- This is expected for some backend tests
- GitHub Actions MongoDB service should auto-start
- Check workflow logs for details

**Error: "Tests failed"**
- Click on failed job
- Scroll to "Run tests" section
- See exact error message
- Fix code and push again

---

## **STEP 7: Local Development Setup (5 minutes)**

### **7.1 Update .env File**
Create/update `c:\Users\ASUS\Downloads\Password_Manager\.env`:

```env
MONGODB_URI=mongodb://admin:password@localhost:27017/password-manager?authSource=admin
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password
PORT=3001
NODE_ENV=development
```

### **7.2 Start Local Environment**
```powershell
cd c:\Users\ASUS\Downloads\Password_Manager

# Start all containers
docker-compose up

# Output should show:
# [+] Running 3/3
#  ✓ Container password-manager-db      Running
#  ✓ Container password-manager-backend Running
#  ✓ Container password-manager-frontend Running
```

### **7.3 Test Connections**
```powershell
# In another terminal

# Test backend
curl http://localhost:3001/health

# Test frontend
curl http://localhost:3000

# Test MongoDB
mongosh mongodb://admin:password@localhost:27017
```

### **7.4 View Logs**
```powershell
# Real-time logs from all containers
docker-compose logs -f

# Logs from specific container
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### **7.5 Stop Everything**
```powershell
# Stop all containers
docker-compose down

# Stop and remove volumes (careful - deletes MongoDB data)
docker-compose down -v
```

---

## **STEP 8: Making Changes & Testing**

### **8.1 Local Testing**
```powershell
# Terminal 1: Run containers
docker-compose up

# Terminal 2: Make code changes to backend
# Edit packages/backend/src/routes/authRoutes.ts

# Changes auto-reload (hot-reload enabled in docker-compose.yml)
# Backend automatically restarts

# Terminal 3: Run tests
cd packages/backend
npm run test
```

### **8.2 Push to GitHub**
```powershell
git add .
git commit -m "Fix auth endpoint"
git push origin main

# GitHub Actions automatically:
# 1. Tests crypto (31 tests)
# 2. Tests backend (with MongoDB)
# 3. Builds Docker images
# 4. Pushes to Docker Hub
```

### **8.3 Monitor Pipeline**
- Go to Actions tab
- Watch workflow progress
- Get notified when done (green ✅ or red ❌)

---

## **STEP 9: Deployment (Optional - Production)**

### **9.1 Simple Deployment: DigitalOcean**
1. Create DigitalOcean account: https://www.digitalocean.com
2. Create App Platform app
3. Connect GitHub repo
4. Select Dockerfile
5. Click Deploy
6. **That's it!** Auto-deploys on every push to main

### **9.2 AWS ECS Deployment**
1. Create AWS account
2. Set up ECS cluster
3. Add AWS secrets to GitHub (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
4. Create deployment script in ci-cd.yml
5. Auto-deploys after Docker build

### **9.3 Manual Deployment**
```bash
# SSH into your server
ssh user@your-server.com

# Pull latest image
docker pull your-username/password-manager-backend:latest

# Stop old container
docker stop backend || true
docker rm backend || true

# Run new container
docker run -d --name backend -p 3001:3001 \
  -e MONGODB_URI=mongodb://... \
  -e SMTP_USER=... \
  -e SMTP_PASS=... \
  your-username/password-manager-backend:latest
```

---

## **TROUBLESHOOTING**

### **Pipeline Stuck/Not Starting**
```powershell
# Check workflow file syntax
cd .github/workflows
cat ci-cd.yml | more

# Re-push
git push origin main
```

### **Docker Images Not Pushing**
1. Verify Docker Hub login: `docker login` (local machine)
2. Check DOCKER_USERNAME, DOCKER_PASSWORD secrets
3. Check Docker access token isn't expired
4. Regenerate token and update secret

### **Backend Tests Failing**
```powershell
# Run locally with MongoDB
docker-compose up mongodb
docker-compose up backend

cd packages/backend
npm run test

# Check logs
docker-compose logs backend
```

### **MongoDB Connection Issues**
```powershell
# Check MongoDB is running
docker-compose ps

# Connect manually
mongosh mongodb://admin:password@localhost:27017

# Check firewall
# Port 27017 should be accessible
```

### **Frontend Not Building**
```powershell
cd apps/extension
npm install
npm run build

# Check for errors in next.config.js
cat next.config.js
```

---

## **VERIFICATION CHECKLIST**

- [ ] Docker Hub account created
- [ ] Docker access token generated & saved
- [ ] Gmail 2FA enabled
- [ ] Gmail app password created & saved
- [ ] All 4 GitHub secrets added (DOCKER_USERNAME, DOCKER_PASSWORD, SMTP_USER, SMTP_PASS)
- [ ] `.github/workflows/ci-cd.yml` exists
- [ ] `packages/backend/Dockerfile` exists
- [ ] `apps/extension/Dockerfile` exists
- [ ] `docker-compose.yml` exists
- [ ] Files committed and pushed to GitHub
- [ ] GitHub Actions workflow triggered (check Actions tab)
- [ ] All tests passed (green checkmarks)
- [ ] Docker images pushed to Docker Hub
- [ ] `docker-compose up` works locally
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:3001

---

## **NEXT STEPS**

1. **Production Deployment:** Set up on AWS/DigitalOcean/Heroku
2. **Monitoring:** Add Datadog or New Relic for performance metrics
3. **Logging:** Set up ELK Stack or Splunk for centralized logs
4. **Backup:** Automate MongoDB backups
5. **Security:** Add HTTPS certificates, WAF, DDoS protection

---

## **QUICK REFERENCE**

### **Commands**
```bash
# GitHub Actions
git push origin main                    # Triggers workflow

# Local Development
docker-compose up                       # Start everything
docker-compose down                     # Stop everything
docker-compose logs -f                  # View logs

# Testing
cd packages/backend && npm run test     # Test backend
cd packages/crypto-engine && npm run test  # Test crypto

# Deployment
docker pull your-username/password-manager-backend:latest
docker run your-username/password-manager-backend:latest
```

### **Important URLs**
```
Docker Hub:       https://hub.docker.com/
GitHub Secrets:   Settings → Secrets and variables → Actions
GitHub Actions:   Actions tab in repository
Gmail App Pwd:    https://myaccount.google.com/apppasswords
Docker Login:     https://hub.docker.com/settings/security
```

---

## **Support**

If something fails:
1. Check GitHub Actions logs (Actions tab → workflow → click failed job)
2. Check docker-compose logs: `docker-compose logs backend`
3. Verify all 4 secrets are set correctly
4. Verify Docker Hub credentials work: `docker login`
5. Re-read the error message carefully - it usually tells you what's wrong!

**You now have a production-ready CI/CD pipeline! 🚀**
