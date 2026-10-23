# MediBook – Clinic Appointment Booking System

A web application where patients can view doctors, check available time slots and book appointments online, and where clinic staff can manage doctors and appointments.

## Objectives

- Let patients find a doctor and book an appointment without calling the clinic
- Show only the time slots that are actually free
- Give staff one place to confirm, reschedule or cancel appointments and manage doctors

## Features

**Patient**
- View doctors and filter by specialty or name
- View available time slots for a chosen date
- Book, reschedule and cancel appointments
- Look up appointments by phone number

**Admin**
- Add, update and delete doctors
- View all appointments and filter them
- Update appointment status (Booked, Confirmed, Completed, Cancelled)

## Technologies

- HTML5, CSS3 and JavaScript (ES modules)
- JSON Server (mock REST API)
- Fetch API
- Vitest (testing)
- Figma (wireframes)

## Setup

1. Clone the repository:
```bash
   git clone git@github.com:brovincemangwana/clinic-appointment-booking.git
   cd clinic-appointment-booking
```
2. Install dependencies:
```bash
   npm install
```
3. Start the API (runs on port 3000):
```bash
   npm run api
```
4. In a second terminal, start the frontend:
```bash
   npm start
```
5. Open http://localhost:5500

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /doctors | List doctors (supports `?specialty=` and `?name_like=`) |
| GET | /appointments | List appointments (supports `?doctorId=`, `?date=`, `?phone=`) |

More endpoints are added here as each feature is built.

## Deployment

- Live app: _coming soon_
- API: _coming soon_
- Figma wireframes: https://www.figma.com/design/w6kgww66Gd4UTvABRO0rXe

## License

MIT