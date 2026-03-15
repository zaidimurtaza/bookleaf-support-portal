-- BookLeaf Database Schema with explicit schema namespace

-- Create schema (namespace)
CREATE SCHEMA IF NOT EXISTS bookleaf;

-- Drop tables if they exist
DROP TABLE IF EXISTS bookleaf.ticket_responses CASCADE;
DROP TABLE IF EXISTS bookleaf.tickets CASCADE;
DROP TABLE IF EXISTS bookleaf.books CASCADE;
DROP TABLE IF EXISTS bookleaf.users CASCADE;

-- Users table
CREATE TABLE bookleaf.users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('author', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE bookleaf.books (
    id SERIAL PRIMARY KEY,
    book_id VARCHAR(50) UNIQUE NOT NULL,
    author_id VARCHAR(50) REFERENCES bookleaf.users(user_id),
    title VARCHAR(500) NOT NULL,
    isbn VARCHAR(20),
    genre VARCHAR(200),
    status VARCHAR(100),
    mrp INTEGER,
    total_copies_sold INTEGER DEFAULT 0,
    royalty_paid INTEGER DEFAULT 0,
    royalty_pending INTEGER DEFAULT 0
);

-- Tickets table
CREATE TABLE bookleaf.tickets (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    author_id VARCHAR(50) REFERENCES bookleaf.users(user_id),
    book_id VARCHAR(50),
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Open',
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'Medium',
    ai_draft TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket responses table
CREATE TABLE bookleaf.ticket_responses (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) REFERENCES bookleaf.tickets(ticket_id),
    responder_id INTEGER REFERENCES bookleaf.users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin user (password: admin123)
INSERT INTO bookleaf.users (user_id, name, email, password_hash, role)
VALUES ('ADMIN001', 'Admin', 'admin@bookleaf.com', 
'$2b$12$egl1e9NpDxUDFqkAlqW67u0GIK0gOPkudXpWeJG4oh0Srg85aYQzO', 'admin');
