import { getDoctor, getAppointments, createAppointment } from './api.js';
import { getUpcomingDates, formatDateLong } from './dates.js';
import { getAvailableSlots, formatTime } from './slots.js';
import { validateBooking } from './validation.js';
import { buildAppointment } from './appointments.js';
import {
  renderProfile,
  renderDates,
  renderSlots,
  renderSummary,
  showFormErrors,
} from './booking-view.js';
import { showLoading, showError, showSuccess, clearStatus } from './ui.js';

const status = document.querySelector('#status');
const profile = document.querySelector('#profile');
const datesContainer = document.querySelector('#dates');
const slotsContainer = document.querySelector('#slots');
const summary = document.querySelector('#summary');
const crumb = document.querySelector('#crumb-name');
const form = document.querySelector('#booking-form');
const submitButton = form.querySelector('button[type="submit"]');

const state = { doctor: null, appointments: [], dates: [], date: '', time: '' };

const field = (id) => form.querySelector(`#${id}`).value;

function refresh() {
  renderDates(datesContainer, state.dates, state.date, selectDate);
  const slots = getAvailableSlots(state.doctor, state.date, state.appointments);
  renderSlots(slotsContainer, slots, state.time, selectTime);
  renderSummary(summary, state.doctor, state.date, state.time);
}

function selectDate(iso) {
  state.date = iso;
  state.time = '';
  refresh();
}

function selectTime(time) {
  state.time = time;
  refresh();
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!state.doctor) return;

  const values = {
    name: field('name'),
    phone: field('phone'),
    reason: field('reason'),
    date: state.date,
    time: state.time,
  };

  const errors = validateBooking(values);
  showFormErrors(form, errors);
  if (Object.keys(errors).length > 0) {
    form.querySelector('.invalid')?.focus();
    return;
  }

  submitButton.disabled = true;
  showLoading(status, 'Booking your appointment…');
  try {
    state.appointments = await getAppointments({ doctorId: state.doctor.id });
    const slot = getAvailableSlots(state.doctor, state.date, state.appointments).find(
      (s) => s.time === state.time
    );
    if (!slot || slot.booked) {
      state.time = '';
      refresh();
      showError(status, 'Sorry, that slot was just taken. Please choose another time.');
      return;
    }

    const saved = await createAppointment(
      buildAppointment({ doctorId: state.doctor.id, ...values })
    );
    state.appointments.push(saved);
    state.time = '';
    form.reset();
    refresh();
    showSuccess(
      status,
      `Booked! ${state.doctor.name} on ${formatDateLong(saved.date)} at ${formatTime(saved.time)}. Use your phone number to find this booking later.`
    );
  } catch {
    showError(status, 'Could not complete your booking. Check that the API is running and try again.');
  } finally {
    submitButton.disabled = false;
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

async function init() {
  const id = new URLSearchParams(window.location.search).get('doctor');
  if (!id) {
    showError(status, 'No doctor selected. Go back and choose a doctor.');
    return;
  }

  showLoading(status, 'Loading doctor…');
  try {
    state.doctor = await getDoctor(id);
  } catch {
    showError(status, 'Could not load this doctor. Check the link and that the API is running.');
    return;
  }

  try {
    state.appointments = await getAppointments({ doctorId: state.doctor.id });
  } catch {
    showError(status, 'Could not load availability. Check that the API is running.');
    return;
  }

  clearStatus(status);
  crumb.textContent = state.doctor.name;
  document.title = `MediBook – Book ${state.doctor.name}`;
  renderProfile(profile, state.doctor);

  state.dates = getUpcomingDates(state.doctor);
  if (state.dates.length === 0) {
    status.textContent = 'This doctor has no upcoming availability.';
    return;
  }
  selectDate(state.dates[0]);
}

form.addEventListener('submit', handleSubmit);
init();