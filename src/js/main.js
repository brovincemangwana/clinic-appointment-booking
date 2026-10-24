import { getDoctors } from './api.js';
import { renderDoctors, fillSpecialties } from './doctors.js';
import { showLoading, showError, clearStatus } from './ui.js';

const form = document.querySelector('#filters');
const searchInput = document.querySelector('#search');
const specialtySelect = document.querySelector('#specialty');
const list = document.querySelector('#doctors');
const status = document.querySelector('#status');
const count = document.querySelector('#count');

async function load() {
    showLoading(status, 'Loading doctors…');
    try {
        const doctors = await getDoctors({
            specialty: specialtySelect.value,
            search: searchInput.value.trim(),
        });
        clearStatus(status);
        renderDoctors(list, doctors);
        count.textContent = `Showing ${doctors.length} doctor${doctors.length === 1 ? '' : 's'}`;
        if (doctors.length === 0) status.textContent = 'No doctors match your search.';
    } catch {
        list.replaceChildren();
        count.textContent = '';
        showError(status, 'Could not load doctors. Check that the API is running.');
    }
}

async function init() {
    try {
        fillSpecialties(specialtySelect, await getDoctors());
    } catch {
        // load() below shows the error message
    }
    await load();
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    load();
});
specialtySelect.addEventListener('change', load);

list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-doctor-id]');
    if (button) {
        window.location.href = `booking.html?doctor=${button.dataset.doctorId}`;
    }
});

init();