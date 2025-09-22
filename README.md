# Fanbase Inside-Out – Slack Top-5 Automation

A Slack automation system that allows HR to query top 5 performers in each Inside-Out category for any given month and receive beautifully formatted responses using Slack's Block Kit.

## 🎯 Overview

This system enables HR team members to use a simple Slack slash command to fetch and display the top 5 performers across five categories:

- **💰 Monetizer** - Top revenue generators
- **📸 Content Machine** - Most active content creators
- **👀 Eyeball Emperor** - Highest engagement/view metrics
- **🎤 Host With The Most** - Most active event hosts
- **🧠 Product Whisperer** - Most valuable product feedback contributors

## 🏗️ Architecture

The system consists of two main services:

1. **Slack Bot** (`slack-bot/`) - Handles slash commands, user authentication, and response formatting
2. **Query Service** (`query-service/`) - Executes database queries and returns structured data
3. **SQL Queries** (`sql/`) - Database queries for each category
4. **Infrastructure** (`infra/`) - Deployment and development configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Slack workspace with admin access
- Railway account (for deployment) or Docker (for local development)

### Local Development

1. **Clone and setup the repository:**

   ```bash
   git clone <your-repo-url>
   cd fanbase-inside-out-top5
   ```

2. **Start the database:**

   ```bash
   cd infra
   docker-compose up postgres -d
   ```

3. **Setup Slack Bot:**

   ```bash
   cd ../slack-bot
   cp env.example .env
   # Edit .env with your Slack app credentials
   npm install
   npm run dev
   ```

4. **Setup Query Service:**

   ```bash
   cd ../query-service
   cp env.example .env
   # Edit .env with your database URL and HMAC secret
   npm install
   npm run dev
   ```

5. **Test the system:**
   - Use the `/insideout top5 aug 2025 all` command in your Slack workspace

### Production Deployment

1. **Deploy to Railway:**

   - Connect your GitHub repository to Railway
   - Deploy both services using the `railway.json` configuration
   - Set environment variables in Railway dashboard

2. **Configure Slack App:**
   - Create a new Slack app in your workspace
   - Add slash command `/insideout` pointing to your bot's URL
   - Set OAuth scopes: `commands`, `chat:write`, `users:read`, `usergroups:read`
   - Install the app to your workspace

## 📋 Usage

### Slash Command Syntax

```
/insideout top5 [month] [year] [category|all]
```

**Examples:**

- `/insideout top5 aug 2025 all` - All categories for August 2025
- `/insideout top5 2025-08 Monetizer` - Only Monetizer category for August 2025
- `/insideout top5 last-month all` - All categories for last month
- `/insideout top5` - Defaults to last month, all categories

### Supported Formats

**Month formats:**

- `aug`, `august` - Month names
- `2025-08` - YYYY-MM format
- `last-month`, `last` - Previous month

**Categories:**

- `monetizer` - Revenue metrics
- `content_machine` - Content creation metrics
- `eyeball_emperor` - View/engagement metrics
- `host_with_the_most` - Event hosting metrics
- `product_whisperer` - Product feedback metrics
- `all` - All categories (default)

## 🔧 Configuration

### Environment Variables

#### Slack Bot (`slack-bot/.env`)

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
QUERY_SERVICE_URL=https://query-service.yourdomain.com/api/top5
QUERY_SERVICE_HMAC_SECRET=your_shared_hmac_secret_here

# Application Settings
DEFAULT_TIMEZONE=America/New_York
PORT=3000
```

#### Query Service (`query-service/.env`)

```bash
# Database Configuration
DB_URL=postgres://user:password@localhost:5432/fanbase_db

# Security
HMAC_SECRET_SHARED=your_shared_hmac_secret_here

# Application Settings
DEFAULT_TIMEZONE=America/New_York
PORT=3001
```

## 🗄️ Database Schema

The system expects the following tables (customize based on your schema):

- `users` - User information
- `revenue_transactions` - Revenue data for Monetizer category
- `content` - Content data for Content Machine category
- `content_views` - View data for Eyeball Emperor category
- `events` - Event data for Host With The Most category
- `product_feedback` - Feedback data for Product Whisperer category

See `infra/init.sql` for sample schema and data.

## 🔒 Security

- **HMAC Authentication** - All requests between services are signed
- **HR-Only Access** - Commands restricted to authorized users/groups
- **Input Validation** - All inputs are validated and sanitized
- **No PII Exposure** - Only display names and internal IDs are returned

## 📊 API Reference

### Query Service Endpoint

**POST** `/api/top5`

**Headers:**

```
Content-Type: application/json
X-Signature: <HMAC-SHA256(body, HMAC_SECRET_SHARED)>
```

**Request Body:**

```json
{
  "month": "2025-08",
  "category": "all"
}
```

**Response:**

```json
{
  "period": "2025-08",
  "results": {
    "monetizer": [
      {
        "rank": 1,
        "user": "Jane D.",
        "user_id": 123,
        "value": 12345.67,
        "unit": "USD"
      }
    ],
    "content_machine": [...],
    "eyeball_emperor": [...],
    "host_with_the_most": [...],
    "product_whisperer": [...]
  },
  "notes": ["Ties share the same rank; next rank is offset accordingly."]
}
```

## 🛠️ Development

### Project Structure

```
fanbase-inside-out-top5/
├── slack-bot/                 # Slack bot service
│   ├── src/
│   │   ├── handlers/          # Command handlers
│   │   ├── middleware/        # Authentication middleware
│   │   └── utils/            # Utilities and helpers
│   ├── package.json
│   └── Dockerfile
├── query-service/             # Query service
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── database/         # Database connection and queries
│   │   └── utils/            # Utilities
│   ├── package.json
│   └── Dockerfile
├── sql/                      # SQL query files
│   ├── monetizer_top5.sql
│   ├── content_machine_top5.sql
│   ├── eyeball_emperor_top5.sql
│   ├── host_with_the_most_top5.sql
│   └── product_whisperer_top5.sql
├── infra/                    # Infrastructure configuration
│   ├── docker-compose.yml
│   ├── railway.json
│   └── init.sql
└── README.md
```

### Adding New Categories

1. Create a new SQL query file in `sql/`
2. Add the category to the valid categories list in both services
3. Update the Block Kit formatter to include the new category
4. Test with sample data

### Customizing SQL Queries

Edit the SQL files in `sql/` directory to match your database schema:

- Use `$1` as the month parameter (YYYY-MM format)
- Return columns: `user_id`, `display_name`, `metric_value`, `unit`
- Ensure proper ranking and tie handling

## 🚨 Troubleshooting

### Common Issues

1. **"Access denied" error:**

   - Check `ALLOWED_USERGROUP_ID` or `ALLOWED_USER_IDS` configuration
   - Verify user is in the correct Slack usergroup

2. **"Query service not responding":**

   - Check `QUERY_SERVICE_URL` is correct
   - Verify HMAC secrets match between services
   - Check query service logs

3. **"No data available":**

   - Verify database connection
   - Check SQL queries match your schema
   - Ensure data exists for the requested month

4. **Database connection errors:**
   - Verify `DB_URL` is correct
   - Check database is running and accessible
   - Ensure user has proper permissions

### Logs

- **Slack Bot:** Check application logs for command processing
- **Query Service:** Check application logs for database queries
- **Database:** Check PostgreSQL logs for query execution

## 📝 License

This project is proprietary and confidential.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:

- Check the troubleshooting section above
- Review application logs
- Contact the development team

---

**Note:** This system is designed for internal use by HR teams. Ensure proper access controls and data privacy compliance in your environment.
