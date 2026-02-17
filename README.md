# Campus Facility Booking System

A simple MVC backend API for managing campus facility bookings with Express.js, TypeORM, and PostgreSQL.

## Project Structure

```
src/
├── entities/          # Database models (User, Facility, Booking)
├── controllers/       # HTTP request handlers
├── routes/           # API route definitions
├── data-source.ts    # TypeORM configuration
├── app.ts            # Express app setup
└── index.ts          # Server entry point
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project and database
3. Copy your connection string
4. Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000
DB_HOST=your-project.neon.tech
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
```

### 3. Create Database Tables

Run the SQL migration script in your Neon console:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  facility_id INT NOT NULL REFERENCES facilities(id),
  user_id INT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  FOREIGN KEY (facility_id) REFERENCES facilities(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. Seed Initial Data

Run this SQL in your Neon console to add sample data:

```sql
-- Insert users
INSERT INTO users (name, email, role) VALUES
  ('Admin User', 'admin@campus.edu', 'admin'),
  ('John Doe', 'john@campus.edu', 'user'),
  ('Jane Smith', 'jane@campus.edu', 'user');

-- Insert facilities
INSERT INTO facilities (name, location, capacity) VALUES
  ('Computer Lab A', 'Building 1, Floor 2', 30),
  ('Meeting Room B', 'Building 1, Floor 3', 15),
  ('Auditorium C', 'Building 2, Floor 1', 200);

-- Insert sample booking
INSERT INTO bookings (facility_id, user_id, date, start_time, end_time, status) VALUES
  (1, 2, '2026-02-20', '09:00', '10:00', 'confirmed');
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Facilities

- `GET /facilities` - Get all facilities
- `GET /facilities/:id` - Get a specific facility

### Bookings

- `GET /bookings` - Get all bookings
- `POST /bookings` - Create a new booking
- `PUT /bookings/:id` - Update booking status
- `DELETE /bookings/:id` - Cancel a booking
- `GET /bookings/availability/check?facilityId=1&date=2026-02-20` - Check facility availability

### Health Check

- `GET /health` - Server health check

## Example API Calls

### Create a Booking

```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "facility_id": 1,
    "user_id": 2,
    "date": "2026-02-20",
    "start_time": "10:00",
    "end_time": "11:00",
    "status": "pending"
  }'
```

### Check Availability

```bash
curl http://localhost:3000/bookings/availability/check?facilityId=1&date=2026-02-20
```

### Get All Facilities

```bash
curl http://localhost:3000/facilities
```

## Build for Production

```bash
npm run build
npm start
```

## Notes

- 30-minute time slots are automatically generated for availability checking (8 AM - 6 PM)
- Double-booking prevention: POST /bookings returns 409 Conflict if time overlaps
- DELETE /bookings/:id marks booking as "cancelled" instead of physical deletion
- All timestamps are in 24-hour format (HH:MM)
