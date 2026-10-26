# MediBook – Clinic Appointment Booking System

A web application where patients can view doctors, check available time slots and book appointments online, and where clinic staff can manage doctors and appointments from an admin area.

**Live app:** https://brovincemangwana.github.io/clinic-appointment-booking/
**Live API:** https://clinic-appointment-booking-6pr4.onrender.com/doctors
**Figma wireframes:** https://www.figma.com/design/w6kgww66Gd4UTvABRO0rXe

> The API runs on a free Render instance. It goes to sleep after 15 minutes without traffic, so the first request can take up to a minute. Data saved on the live site is also reset when the API restarts (see [Known limitations](#known-limitations)).

![Doctors page](docs/home.png)

## Problem

Many small and medium-sized clinics still book appointments by phone or walk-in. Patients wait in long queues, double bookings happen, and staff spend a lot of time managing schedules by hand. Patients also cannot easily see which doctors are available or when.

## Objectives

- Let patients find a doctor and book an appointment without calling the clinic
- Show only the time slots that are actually free
- Give staff one place to confirm, reschedule or cancel appointments and manage doctors
- Demonstrate a REST API with full CRUD, modular JavaScript, automated tests and a documented Git workflow

## Features

**Patient**
- View doctors and filter by specialty or search by name
- Pick a date and see available time slots (booked slots are blocked)
- Book an appointment with validated name, Kenyan phone number and reason
- Look up appointments by phone number
- Reschedule or cancel upcoming appointments

**Admin**
- View all appointments with totals and filters by date, doctor and status
- Move appointments through Booked, Confirmed and Completed, or cancel them
- Add, edit and delete doctors, including working days, hours and slot length
- Block deleting a doctor who still has upcoming appointments

| Booking | Admin |
|---|---|
| ![Booking page](docs/booking.png) | ![Admin appointments](docs/admin.png) |

## Technologies

- HTML5, CSS3 and JavaScript (ES modules, no framework)
- JSON Server 0.17 as the REST API and data store
- Fetch API for all requests
- Vitest and jsdom for tests
- Figma for wireframes
- Render (API) and GitHub Pages (frontend)

## Getting started

You need Node.js 18 or newer and Python 3 (used only to serve the static files).

```bash
git clone git@github.com:brovincemangwana/clinic-appointment-booking.git
cd clinic-appointment-booking
npm install
```

Start the API in one terminal (port 3000):

```bash
npm run api
```

Start the frontend in a second terminal (port 5500):

```bash
npm start
```

Open http://localhost:5500. When the site runs on `localhost`, it uses the local API; anywhere else it uses the deployed API (see `src/js/config.js`).

### Scripts

| Command | What it does |
|---|---|
| `npm run api` | Starts JSON Server on port 3000 with `db.json` |
| `npm start` | Serves the frontend on port 5500 |
| `npm run start:api` | Production API start, used by Render |
| `npm test` | Runs all tests |
| `npm run test:coverage` | Runs tests and prints a coverage report |

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Doctors list with filters |
| `booking.html?doctor=1` | Pick a date and time, then book |
| `my-appointments.html` | Look up, reschedule or cancel by phone number |
| `admin.html` | Admin appointments table |
| `admin-doctors.html` | Admin doctor management |

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/doctors` | List doctors (supports `?specialty=` and `?name_like=`) |
| GET | `/doctors/:id` | Get one doctor |
| POST | `/doctors` | Add a doctor |
| PUT | `/doctors/:id` | Replace a doctor's details |
| DELETE | `/doctors/:id` | Delete a doctor |
| GET | `/appointments` | List appointments (supports `?doctorId=`, `?date=`, `?phone=`) |
| POST | `/appointments` | Book an appointment |
| PUT | `/appointments/:id` | Reschedule an appointment |
| PATCH | `/appointments/:id` | Update the status of an appointment |

### Data

- **doctors:** `id`, `name`, `specialty`, `workingDays` (0 = Sunday), `startTime`, `endTime`, `slotMinutes`, `available`
- **appointments:** `id`, `doctorId`, `patientName`, `phone`, `reason`, `date`, `time`, `status` (Booked, Confirmed, Completed, Cancelled), `createdAt`

## Project structure

```
├── index.html, booking.html, my-appointments.html, admin.html, admin-doctors.html
├── db.json                  Seed data for JSON Server
├── src
│   ├── css/styles.css
│   └── js
│       ├── api.js           All HTTP requests
│       ├── config.js        API URL (local or deployed)
│       ├── slots.js         Slot generation and availability
│       ├── dates.js         Date helpers
│       ├── validation.js    Booking form validation
│       ├── appointments.js  Appointment rules (status transitions, filters, sorting)
│       ├── doctor-form.js   Doctor validation and rules
│       ├── ui.js            Elements and status messages
│       └── *-view.js, main.js, booking.js, admin*.js, my-appointments.js
│                            Rendering and page logic
└── tests                    Vitest unit and DOM tests
```

Pure logic (slots, dates, validation, rules) is kept apart from rendering and page scripts, so it can be tested without a browser.

## Testing

```bash
npm test
npm run test:coverage
```

Tests cover the API module (with a mocked `fetch`, including all five HTTP methods), slot generation, validation, status rules and the rendering modules (using jsdom). Line coverage is above 50%.

![Coverage report](docs/coverage.png)

## Design

Wireframes were made in Figma before the build: [Figma file](https://www.figma.com/design/w6kgww66Gd4UTvABRO0rXe). The interface uses three colours plus neutrals: blue for actions and selected states, navy for text and headings, and coral for cancellations and errors. It is responsive for desktop, tablet and mobile screens.

## Git workflow

Work was done on feature branches (`feature/...`, `test/...`, `style/...`, `docs/...`) and merged through pull requests, with feature-based commits following the pattern `feat:`, `test:`, `fix:`, `docs:`, `style:` and `chore:`.

## Known limitations

- **Data resets on the live site.** Render's free instances have an ephemeral filesystem, so bookings and edits made on the live API are lost when it restarts or sleeps. Run the project locally to keep data.
- **No authentication.** The admin pages and the API are open. This is acceptable for a learning project but not for real patient data.
- **Double bookings are only partly prevented.** The app re-checks availability just before saving, but JSON Server has no server-side validation, so two people booking at the same moment could still collide.

## License

[MIT](LICENSE)