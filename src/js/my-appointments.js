import {
  getAppointments,
  getDoctors,
  patchAppointment,
  updateAppointment,
} from './api.js';
import { normalizePhone, validatePhone } from './validation.js';
import { sortAppointments, buildRescheduled } from './appointments.js';
import { getUpcomingDates, formatDateLong } from './dates.js';
import { getAvailableSlots, formatTime } from './slots.js';
import { renderAppointments } from './my-appointments-view.js';
import { renderDates, renderSlots } from './booking-view.js';
import { showLoading, showError, showSuccess, clearStatus } from './ui.js';

const form = document.querySelector('#lookup-form');
const phoneInput = document.querySelector('#phone');
const phoneError = document.querySelector('#phone-error');
const status = document.querySelector('#status');
const results = document.querySelector('#results');

const dialog = document.querySelector('#reschedule-dialog');
const rsForm = document.querySelector('#reschedule-form');
const rsDoctor = document.querySelector('#rs-doctor');
const rsDates = document.querySelector('#rs-dates');
const rsSlots = document.querySelector('#rs-slots');
const rsError = document.querySelector('#rs-error');
const rsSave = document.querySelector('#rs-save');
const rsClose = document.querySelector('#rs-close');

const state = { doctors: [], appointments: [] };
const rs = { appointment: null, doctor: null, others: [], dates: [], date: '', time: '' };

function draw() {
  renderAppointments(results, sortAppointments(state.appointments), state.doctors, {
    onCancel: cancel,
    onReschedule: openReschedule,
  });
}

async function cancel(appointment) {
  const doctor = state.doctors.find((d) => d.id === appointment.doctorId);
  const name = doctor ? doctor.name : 'your doctor';
  const when = `${formatDateLong(appointment.date)} at ${formatTime(appointment.time)}`;
  if (!window.confirm(`Cancel your appointment with ${name} on ${when}?`)) return;

  showLoading(status, 'Cancelling your appointment…');
  try {
    const updated = await patchAppointment(appointment.id, { status: 'Cancelled' });
    state.appointments = state.appointments.map((a) => (a.id === updated.id ? updated : a));
    draw();
    showSuccess(status, 'Your appointment was cancelled. The slot is free for other patients.');
  } catch {
    showError(status, 'Could not cancel your appointment. Check that the API is running and try again.');
  }
}

function drawReschedule() {
  renderDates(rsDates, rs.dates, rs.date, (iso) => {
    rs.date = iso;
    rs.time = '';
    rsError.textContent = '';
    drawReschedule();
  });
  const slots = rs.date ? getAvailableSlots(rs.doctor, rs.date, rs.others) : [];
  renderSlots(rsSlots, slots, rs.time, (time) => {
    rs.time = time;
    rsError.textContent = '';
    drawReschedule();
  });
}

async function openReschedule(appointment) {
  const doctor = state.doctors.find((d) => d.id === appointment.doctorId);
  if (!doctor) {
    showError(status, 'Could not find this doctor. Please contact the clinic.');
    return;
  }

  showLoading(status, 'Loading availability…');
  try {
    const all = await getAppointments({ doctorId: doctor.id });
    rs.others = all.filter((a) => a.id !== appointment.id);
  } catch {
    showError(status, 'Could not load availability. Check that the API is running.');
    return;
  }
  clearStatus(status);

  rs.appointment = appointment;
  rs.doctor = doctor;
  rs.dates = getUpcomingDates(doctor);
  rs.date = rs.dates.includes(appointment.date) ? appointment.date : rs.dates[0] || '';
  rs.time = '';
  rsDoctor.textContent = `${doctor.name} · currently ${formatDateLong(appointment.date)} at ${formatTime(appointment.time)}`;
  rsError.textContent = '';
  drawReschedule();
  dialog.showModal();
}

async function saveReschedule(event) {
  event.preventDefault();
  if (!rs.time) {
    rsError.textContent = 'Choose a new time slot.';
    return;
  }
  if (rs.date === rs.appointment.date && rs.time === rs.appointment.time) {
    rsError.textContent = 'That is your current time. Choose a different slot, or keep your current time.';
    return;
  }

  rsSave.disabled = true;
  try {
    const latest = await getAppointments({ doctorId: rs.doctor.id });
    rs.others = latest.filter((a) => a.id !== rs.appointment.id);
    const slot = getAvailableSlots(rs.doctor, rs.date, rs.others).find((s) => s.time === rs.time);
    if (!slot || slot.booked) {
      rs.time = '';
      drawReschedule();
      rsError.textContent = 'Sorry, that slot was just taken. Please choose another time.';
      return;
    }

    const updated = await updateAppointment(
      rs.appointment.id,
      buildRescheduled(rs.appointment, { date: rs.date, time: rs.time })
    );
    state.appointments = state.appointments.map((a) => (a.id === updated.id ? updated : a));
    dialog.close();
    draw();
    showSuccess(
      status,
      `Rescheduled to ${formatDateLong(updated.date)} at ${formatTime(updated.time)}. The clinic will confirm your new time.`
    );
  } catch {
    rsError.textContent = 'Could not reschedule. Check that the API is running and try again.';
  } finally {
    rsSave.disabled = false;
  }
}

async function lookup(event) {
  event.preventDefault();

  const message = validatePhone(phoneInput.value);
  phoneError.textContent = message;
  phoneInput.classList.toggle('invalid', Boolean(message));
  if (message) {
    phoneInput.focus();
    return;
  }

  const phone = normalizePhone(phoneInput.value);
  showLoading(status, 'Looking for your appointments…');
  results.replaceChildren();
  try {
    const [appointments, doctors] = await Promise.all([getAppointments({ phone }), getDoctors()]);
    state.appointments = appointments;
    state.doctors = doctors;
    if (appointments.length === 0) {
      status.className = 'status';
      status.textContent = `No appointments found for ${phone}.`;
      return;
    }
    clearStatus(status);
    draw();
  } catch {
    showError(status, 'Could not load your appointments. Check that the API is running.');
  }
}

form.addEventListener('submit', lookup);
rsForm.addEventListener('submit', saveReschedule);
rsClose.addEventListener('click', () => dialog.close());