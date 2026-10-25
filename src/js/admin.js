import { getAppointments, getDoctors } from './api.js';
import { countByStatus, filterAppointments, sortChronological } from './appointments.js';
import { renderStats, renderRows, fillDoctorOptions } from './admin-view.js';
import { showLoading, showError, clearStatus } from './ui.js';

const filtersForm = document.querySelector('#filters');
const dateInput = document.querySelector('#f-date');
const doctorSelect = document.querySelector('#f-doctor');
const statusSelect = document.querySelector('#f-status');
const resetButton = document.querySelector('#clear-filters');
const stats = document.querySelector('#stats');
const rows = document.querySelector('#rows');
const status = document.querySelector('#status');

const state = { appointments: [], doctors: [] };

function draw() {
  const filters = {
    date: dateInput.value,
    doctorId: doctorSelect.value,
    status: statusSelect.value,
  };
  renderStats(stats, countByStatus(state.appointments));
  renderRows(rows, sortChronological(filterAppointments(state.appointments, filters)), state.doctors);
}

async function init() {
  showLoading(status, 'Loading appointments…');
  try {
    const [appointments, doctors] = await Promise.all([getAppointments(), getDoctors()]);
    state.appointments = appointments;
    state.doctors = doctors;
  } catch {
    showError(status, 'Could not load appointments. Check that the API is running.');
    return;
  }
  clearStatus(status);
  fillDoctorOptions(doctorSelect, state.doctors);
  draw();
}

filtersForm.addEventListener('input', draw);
resetButton.addEventListener('click', () => {
  filtersForm.reset();
  draw();
});

init();