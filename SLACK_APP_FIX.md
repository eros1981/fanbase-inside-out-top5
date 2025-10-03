# Slack App Configuration Fix for "dispatch_failed" Error

## Problem
The `/insideout` command is failing with "dispatch_failed" error after deploying the crash fix.

## Root Cause
The Slack app manifest was configured incorrectly for Socket Mode. It had HTTP endpoints configured while using Socket Mode, which creates a conflict.

## Solution

### Step 1: Update Slack App Configuration

1. **Go to your Slack App Settings**:
   - Visit https://api.slack.com/apps
   - Select your "Fanbase Inside-Out Top 5" app

2. **Update Slash Commands**:
   - Go to "Slash Commands" in the left sidebar
   - For `/insideout` command:
     - **Remove the Request URL** (leave it empty)
     - Keep the description and usage hint
   - Add `/health` command:
     - Command: `/health`
     - Description: `Check bot health status`
     - Usage Hint: `Check bot health and connection status`
     - **No Request URL needed**

3. **Update Event Subscriptions**:
   - Go to "Event Subscriptions" in the left sidebar
   - **Turn OFF** "Enable Events"
   - This is not needed for Socket Mode

4. **Update Interactivity & Shortcuts**:
   - Go to "Interactivity & Shortcuts" in the left sidebar
   - **Turn OFF** "Interactivity"
   - This is not needed for Socket Mode

5. **Verify Socket Mode Settings**:
   - Go to "Socket Mode" in the left sidebar
   - Ensure "Enable Socket Mode" is **ON**
   - Verify your App Token is set correctly

### Step 2: Update App Manifest (Optional)

If you want to use the updated manifest:

1. Go to "App Manifest" in the left sidebar
2. Copy the contents from `infra/slack-app-manifest.yml`
3. Paste it into the manifest editor
4. Click "Save Changes"
5. Click "Reinstall to Workspace"

### Step 3: Verify Environment Variables

Ensure these are set in Railway:

```bash
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_BOT_TOKEN=xoxb-your_bot_token
SLACK_APP_TOKEN=xapp-your_app_token
```

### Step 4: Test the Commands

1. **Test `/health` command first**:
   ```
   /health
   ```
   This should show the bot's health status.

2. **Test `/insideout` command**:
   ```
   /insideout top5 sept 2025 all
   ```

## Key Points for Socket Mode

- **No HTTP endpoints needed**: Socket Mode uses WebSocket connections
- **No Request URLs**: Slash commands work directly through Socket Mode
- **No Event Subscriptions**: Events are handled through Socket Mode
- **No Interactivity**: Not needed for slash commands

## Troubleshooting

### If commands still fail:

1. **Check Railway Logs**:
   - Go to Railway dashboard
   - Check `fanbase-slack-bot` service logs
   - Look for connection errors

2. **Verify Tokens**:
   - Ensure all three tokens are correct
   - Check token permissions in Slack app settings

3. **Test Socket Mode Connection**:
   - Look for "Socket Mode connection established" in logs
   - Check for any connection errors

4. **Reinstall App**:
   - In Slack app settings, go to "Install App"
   - Click "Reinstall to Workspace"
   - This refreshes the app configuration

## Expected Behavior After Fix

- `/health` command should work and show bot status
- `/insideout` command should work without "dispatch_failed" error
- Bot should show "Socket Mode connection established" in logs
- No HTTP endpoint errors in Railway logs

---

**Note**: The key issue was mixing Socket Mode with HTTP endpoints. Socket Mode apps don't need Request URLs for slash commands.
