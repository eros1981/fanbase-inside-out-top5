# Railway Deployment Guide

## 🚀 Deploy to Railway

### Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- BigQuery service account key file

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `fanbase-inside-out-top5` repository
5. Railway will automatically detect the `railway.json` configuration

### Step 2: Configure Environment Variables

#### For Query Service (`fanbase-query-service`):

```bash
# BigQuery Configuration
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json
BIGQUERY_PROJECT_ID=758470639878
BIGQUERY_DATASET=your_dataset_name

# Security
HMAC_SECRET_SHARED=your_shared_hmac_secret_here

# Application Settings
NODE_ENV=production
PORT=3001
DEFAULT_TIMEZONE=America/New_York
```

#### For Slack Bot (`fanbase-slack-bot`):

```bash
# Slack Configuration
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
SLACK_BOT_TOKEN=xoxb-your_bot_token_here
SLACK_APP_TOKEN=xapp-your_app_token_here

# Authorization
ALLOWED_USERGROUP_ID=S123ABC
# OR use user ID allowlist:
# ALLOWED_USER_IDS=U1234567890,U0987654321

# Query Service Configuration
QUERY_SERVICE_URL=https://fanbase-query-service-production.up.railway.app/api/top5

# Security
QUERY_SERVICE_HMAC_SECRET=your_shared_hmac_secret_here

# Application Settings
NODE_ENV=production
PORT=3000
DEFAULT_TIMEZONE=America/New_York
```

### Step 3: Upload Service Account Key

1. In Railway dashboard, go to your Query Service
2. Go to "Variables" tab
3. Add a new variable: `GOOGLE_APPLICATION_CREDENTIALS` = `/app/service-account-key.json`
4. Go to "Files" tab
5. Upload your BigQuery service account key file as `service-account-key.json`

### Step 4: Deploy

1. Railway will automatically deploy both services
2. Wait for both services to show "Deployed" status
3. Note the URLs for each service:
   - Query Service: `https://fanbase-query-service-production.up.railway.app`
   - Slack Bot: `https://fanbase-slack-bot-production.up.railway.app`

### Step 5: Update Slack App Configuration

1. Go to your Slack app settings
2. Update the Request URL to: `https://fanbase-slack-bot-production.up.railway.app/slack/events`
3. Save changes

### Step 6: Test the Deployment

1. Go to your Slack workspace
2. Try the command: `/insideout top5 aug 2025 all`
3. Check Railway logs if there are any issues

## 🔧 Troubleshooting

### Common Issues:

1. **Service Account Key Issues**:

   - Ensure the key file is uploaded correctly
   - Check the file path in environment variables
   - Verify the key has proper BigQuery permissions

2. **HMAC Secret Mismatch**:

   - Ensure both services use the same `HMAC_SECRET_SHARED` value
   - Check the `QUERY_SERVICE_HMAC_SECRET` matches

3. **Slack App Issues**:

   - Verify the Request URL is correct
   - Check Slack app permissions
   - Ensure bot token is valid

4. **BigQuery Connection**:
   - Verify project ID is correct
   - Check dataset name exists
   - Ensure service account has access

### Monitoring:

- Check Railway logs for both services
- Monitor BigQuery usage in Google Cloud Console
- Test health endpoints:
  - Query Service: `https://fanbase-query-service-production.up.railway.app/health`
  - Slack Bot: `https://fanbase-slack-bot-production.up.railway.app/health`

## 📊 Environment Variables Summary

| Variable                         | Service       | Description                              |
| -------------------------------- | ------------- | ---------------------------------------- |
| `GOOGLE_APPLICATION_CREDENTIALS` | Query Service | Path to BigQuery service account key     |
| `BIGQUERY_PROJECT_ID`            | Query Service | Your BigQuery project ID (758470639878)  |
| `BIGQUERY_DATASET`               | Query Service | Your BigQuery dataset name               |
| `HMAC_SECRET_SHARED`             | Both          | Shared secret for service authentication |
| `SLACK_SIGNING_SECRET`           | Slack Bot     | Slack app signing secret                 |
| `SLACK_BOT_TOKEN`                | Slack Bot     | Slack bot token                          |
| `SLACK_APP_TOKEN`                | Slack Bot     | Slack app token                          |
| `ALLOWED_USERGROUP_ID`           | Slack Bot     | HR usergroup ID for access control       |
| `QUERY_SERVICE_URL`              | Slack Bot     | URL of the deployed query service        |
