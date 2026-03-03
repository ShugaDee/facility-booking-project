# Campus Facility Booking API Documentation

This API supports managing campus facilities, checking availability, and creating or managing bookings.

## Base URL
`/api` (When running locally: `http://localhost:3000`)

---

## 1. Facilities
### Retrieve all facilities
- **Endpoint:** `GET /facilities`
- **Description:** Returns a list of all campus facilities.
- **Request Parameters:** None
- **Response Structure (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Computer Lab A",
    "location": "Building 1, Floor 2",
    "capacity": 30
  }
]
```

### Retrieve a specific facility
- **Endpoint:** `GET /facilities/{id}`
- **Description:** Returns the details of a single facility.
- **Request Parameters:** None (ID in URL path)
- **Response Structure (200 OK):**
```json
{
  "id": 1,
  "name": "Computer Lab A",
  "location": "Building 1, Floor 2",
  "capacity": 30
}
```

---

## 2. Bookings
### Retrieve all bookings
- **Endpoint:** `GET /bookings`
- **Description:** Returns a list of all existing bookings.
- **Request Parameters:** None
- **Response Structure (200 OK):**
```json
[
  {
    "id": 1,
    "facility_id": 1,
    "user_id": 2,
    "date": "2026-03-02",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "status": "confirmed"
  }
]
```

### Create a booking
- **Endpoint:** `POST /bookings`
- **Description:** Creates a new booking reservation. Fails if the slot is already occupied.
- **Request Body (application/json):**
```json
{
  "facility_id": 1,
  "user_id": 2,
  "date": "2026-03-02",
  "start_time": "09:00",
  "end_time": "09:30"
}
```
- **Response Structure (201 Created):** Returns the newly created booking object.
- **Error Responses:** 
  - `409 Conflict`: "Facility is already booked for this time slot"
  - `400 Bad Request`: "Missing required fields"

### Update a booking
- **Endpoint:** `PUT /bookings/{id}`
- **Description:** Updates the status of an existing booking.
- **Request Body (application/json):**
```json
{
  "status": "confirmed"
}
```
- **Response Structure (200 OK):** Returns the updated booking object.

### Cancel a booking
- **Endpoint:** `DELETE /bookings/{id}`
- **Description:** Soft-cancels a booking by changing its status to `cancelled`.
- **Response Structure (200 OK):**
```json
{
  "message": "Booking cancelled successfully"
}
```

---

## 3. Availability
### Check Availability
- **Endpoint:** `GET /availability`
- **Description:** Checks the availability of a specific facility on a given date and returns unbooked 30-minute time slots.
- **Query Parameters:**
  - `facilityId` (Number): The ID of the facility to check.
  - `date` (String): The date to check in `YYYY-MM-DD` format.
- **Response Structure (200 OK):**
```json
{
  "date": "2026-03-02",
  "facilitId": "1",
  "availableSlots": [
    "08:00:00",
    "08:30:00",
    "11:00:00"
  ]
}
```
