import { requireStaff, logout } from './auth.js';
import { getAppointments, getDoctors, patchAppointment } from './api.js';
import {
  countByStatus,
  filterAppointments,
  sortChronological,
  canTransition,
} from './appointments.js';
import { renderStats, renderRows, fillDoctorOptions } from './admin-view.js';
import { showLoading, showError, showSuccess, clearStatus } from './ui.js';

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
  renderRows(
    rows,
    sortChronological(filterAppointments(state.appointments, filters)),
    state.doctors,
    changeStatus
  );
}

export async function changeStatus(appointment, newStatus) {
  if (!canTransition(appointment.status, newStatus)) {
    showError(status, `A ${appointment.status} appointment cannot be changed to ${newStatus}.`);
    draw();
    return;
  }
  if (
    newStatus === 'Cancelled' &&
    !window.confirm(`Cancel ${appointment.patientName}'s appointment?`)
  ) {
    draw();
    return;
  }

  showLoading(status, 'Updating status…');
  try {
    const updated = await patchAppointment(appointment.id, { status: newStatus });
    state.appointments = state.appointments.map((a) => (a.id === updated.id ? updated : a));
    draw();
    showSuccess(status, `${updated.patientName}'s appointment is now ${updated.status}.`);
  } catch {
    draw();
    showError(status, 'Could not update the status. Check that the API is running and try again.');
  }
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

document.querySelector('#sign-out').addEventListener('click', logout);
if (requireStaff('admin.html')) init();