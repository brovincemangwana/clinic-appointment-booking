import { getAppointments, getDoctors } from './api.js';
import { normalizePhone, validatePhone } from './validation.js';
import { sortAppointments } from './appointments.js';
import { renderAppointments } from './my-appointments-view.js';
import { showLoading, showError, clearStatus } from './ui.js';

const form = document.querySelector('#lookup-form');
const phoneInput = document.querySelector('#phone');
const phoneError = document.querySelector('#phone-error');
const status = document.querySelector('#status');
const results = document.querySelector('#results');

const state = { doctors: [], appointments: [] };

function draw() {
  renderAppointments(results, sortAppointments(state.appointments), state.doctors);
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