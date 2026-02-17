-- Schema migration for Campus Facility Booking System
-- Run this in your Neon console

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL
);

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INT NOT NULL
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  facility_id INT NOT NULL,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  FOREIGN KEY (facility_id) REFERENCES facilities(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert initial users
INSERT INTO users (name, email, role) VALUES
  ('Admin User', 'admin@campus.edu', 'admin'),
  ('John Fordj', 'john@campus.edu', 'user'),
  ('Dessy Kweku', 'des@campus.edu', 'user');

-- Insert initial facilities
INSERT INTO facilities (name, location, capacity) VALUES
  ('Computer Lab A', 'Building 1, Floor 2', 30),
  ('Meeting Room B', 'Building 1, Floor 3', 15),
  ('Auditorium C', 'Building 2, Floor 1', 200);

-- Insert sample bookings
INSERT INTO bookings (facility_id, user_id, date, start_time, end_time, status) VALUES
  (1, 2, '2026-02-20', '09:00', '10:00', 'confirmed'),
  (2, 3, '2026-02-20', '14:00', '15:30', 'pending');
