# GitHub Actions Secrets Setup

To enable the CI/CD pipeline, add these secrets to your GitHub repository:

## How to Add Secrets:
1. Go to: **Settings → Secrets and variables → Actions**
2. Click "New repository secret"
3. Add each secret below

## Required Secrets:

### Docker Hub Credentials (for image pushing)
```
DOCKER_USERNAME: your-docker-hub-username
DOCKER_PASSWORD: your-docker-hub-password (or access token)
```

### SMTP Credentials (for OTP/email)
```
SMTP_USER: your-gmail@gmail.com
SMTP_PASS: your-app-password (not regular password - use Gmail App Password)
```

### Optional: Cloud Deployment
```
AWS_ACCESS_KEY_ID: your-aws-key
AWS_SECRET_ACCESS_KEY: your-aws-secret
DEPLOY_KEY: your-private-key-for-deployment
```

---

# Creating a Docker Hub Access Token

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name it "GitHub Actions"
4. Copy the token and add as `DOCKER_PASSWORD` secret

---

# Gmail App Password Setup

1. Enable 2FA on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Google will generate a 16-character password
5. Use this as `SMTP_PASS` secret

---

# GitHub Actions Status

- Check pipeline status: **Actions** tab in your repository
- See build logs: Click on the workflow run
- Workflows trigger on:
  - Push to: main, karthik, ladda, develop
  - Pull requests to: main, karthik, ladda, develop
