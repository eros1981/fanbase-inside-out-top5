-- Database initialization script
-- This script creates the basic tables needed for the Fanbase Inside-Out system
-- Customize this based on your actual database schema

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create revenue transactions table (for Monetizer category)
CREATE TABLE IF NOT EXISTS revenue_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    revenue DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create content table (for Content Machine category)
CREATE TABLE IF NOT EXISTS content (
    content_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    title VARCHAR(500),
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create content views table (for Eyeball Emperor category)
CREATE TABLE IF NOT EXISTS content_views (
    view_id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES content(content_id),
    view_count INTEGER DEFAULT 1,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table (for Host With The Most category)
CREATE TABLE IF NOT EXISTS events (
    event_id SERIAL PRIMARY KEY,
    host_id INTEGER REFERENCES users(user_id),
    title VARCHAR(500),
    event_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product feedback table (for Product Whisperer category)
CREATE TABLE IF NOT EXISTS product_feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    title VARCHAR(500),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO users (display_name, email) VALUES
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Johnson', 'bob@example.com'),
    ('Alice Brown', 'alice@example.com'),
    ('Charlie Wilson', 'charlie@example.com')
ON CONFLICT (email) DO NOTHING;

-- Sample revenue data
INSERT INTO revenue_transactions (user_id, revenue) VALUES
    (1, 1500.00),
    (1, 750.50),
    (2, 2000.00),
    (2, 1200.00),
    (3, 800.00),
    (4, 3000.00),
    (5, 950.00)
ON CONFLICT DO NOTHING;

-- Sample content data
INSERT INTO content (user_id, title, status) VALUES
    (1, 'How to Build Better Products', 'published'),
    (1, 'Marketing Strategies That Work', 'published'),
    (2, 'Content Creation Tips', 'published'),
    (2, 'Social Media Best Practices', 'published'),
    (2, 'Building Your Brand', 'published'),
    (3, 'Technical Deep Dive', 'published'),
    (4, 'Leadership Insights', 'published'),
    (4, 'Team Management', 'published'),
    (5, 'Innovation in Tech', 'published')
ON CONFLICT DO NOTHING;

-- Sample view data
INSERT INTO content_views (content_id, view_count) VALUES
    (1, 150),
    (1, 200),
    (2, 300),
    (3, 250),
    (3, 180),
    (4, 400),
    (5, 320),
    (6, 150),
    (7, 500),
    (8, 280),
    (9, 190)
ON CONFLICT DO NOTHING;

-- Sample events data
INSERT INTO events (host_id, title, event_date, status) VALUES
    (1, 'Product Workshop', '2025-01-15 14:00:00', 'completed'),
    (1, 'Marketing Seminar', '2025-01-22 10:00:00', 'completed'),
    (2, 'Content Strategy Session', '2025-01-10 16:00:00', 'completed'),
    (2, 'Social Media Training', '2025-01-25 11:00:00', 'completed'),
    (3, 'Technical Review', '2025-01-18 15:00:00', 'completed'),
    (4, 'Leadership Roundtable', '2025-01-12 09:00:00', 'completed'),
    (4, 'Team Building Event', '2025-01-28 13:00:00', 'completed'),
    (5, 'Innovation Summit', '2025-01-20 10:00:00', 'completed')
ON CONFLICT DO NOTHING;

-- Sample feedback data
INSERT INTO product_feedback (user_id, title, description, status) VALUES
    (1, 'Better Analytics Dashboard', 'We need more detailed metrics', 'accepted'),
    (1, 'Mobile App Improvements', 'The mobile experience could be better', 'accepted'),
    (2, 'Content Management System', 'Need better tools for content creators', 'accepted'),
    (2, 'Social Media Integration', 'More platforms would be helpful', 'accepted'),
    (2, 'User Interface Updates', 'The UI feels outdated', 'accepted'),
    (3, 'Performance Optimization', 'The app is sometimes slow', 'accepted'),
    (4, 'Team Collaboration Features', 'Need better team communication tools', 'accepted'),
    (4, 'Reporting Improvements', 'More comprehensive reports needed', 'accepted'),
    (5, 'API Enhancements', 'More flexible API endpoints', 'accepted'),
    (5, 'Integration Options', 'Support for more third-party tools', 'accepted')
ON CONFLICT DO NOTHING;
