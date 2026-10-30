import { login, isLoggedIn } from "./auth.js";
import { showLoading, showError } from "./ui.js";

const ALLOWED = ["admin.html", "admin-doctors.html"];

const form = document.querySelector("#login-form");
const input = document.querySelector("#password");
const error = document.querySelector("#password-error");
const button = document.querySelector("#login-button");
const status = document.querySelector("#status");

const requested = new URLSearchParams(window.location.search).get("next");
const target = ALLOWED.includes(requested) ? requested : "admin.html";

if (isLoggedIn()) window.location.replace(target);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  error.textContent = "";
  input.classList.remove("invalid");

  if (!input.value) {
    error.textContent = "Enter the staff password.";
    input.classList.add("invalid");
    input.focus();
    return;
  }

  button.disabled = true;
  showLoading(status, "Checking password…");
  try {
    await login(input.value);
    window.location.replace(target);
  } catch (problem) {
    const offline = problem instanceof TypeError;
    showError(
      status,
      offline
        ? "Could not reach the server. Check that the API is running."
        : problem.message,
    );
    input.select();
    button.disabled = false;
  }
});
