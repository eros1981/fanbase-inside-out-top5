# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Copy SQL files from parent directory
COPY ../sql /sql

# Build the application
RUN npm run build

# Remove dev dependencies after build (as root user)
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S queryservice -u 1001

# Change ownership of the app directory
RUN chown -R queryservice:nodejs /app

# Switch to non-root user
USER queryservice

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
