// ============================================================
// register.js  -  runs in the BROWSER on register.html
// ------------------------------------------------------------
// Job of this file:
//   1. Check the form before sending anything
//   2. Send the data to the backend with fetch()
//   3. Show whatever message comes back
// ============================================================

// Grab the elements we need from the page.
const form = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("registerBtn");
const messageBox = document.getElementById("message");

// ------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message show " + type; // type is "error" or "success"
}

function clearMessage() {
  messageBox.className = "message";
  messageBox.textContent = "";
}

function setHint(input, hintId, text) {
  document.getElementById(hintId).textContent = text;
  input.classList.toggle("invalid", Boolean(text));
}

function clearAllHints() {
  setHint(nameInput, "nameHint", "");
  setHint(emailInput, "emailHint", "");
  setHint(passwordInput, "passwordHint", "");
  setHint(confirmInput, "confirmHint", "");
}

// A simple email pattern: something @ something . something
function looksLikeEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

// ------------------------------------------------------------
// Validation - returns true when the form is good to send
// ------------------------------------------------------------
function validateForm(name, email, password, confirmPassword) {
  clearAllHints();
  let isValid = true;

  if (name.length < 2) {
    setHint(nameInput, "nameHint", "Enter your name (2 characters or more).");
    isValid = false;
  }

  if (!email) {
    setHint(emailInput, "emailHint", "Email is required.");
    isValid = false;
  } else if (!looksLikeEmail(email)) {
    setHint(emailInput, "emailHint", "That does not look like an email address.");
    isValid = false;
  }

  if (password.length < 6) {
    setHint(passwordInput, "passwordHint", "Use at least 6 characters.");
    isValid = false;
  }

  if (password !== confirmPassword) {
    setHint(confirmInput, "confirmHint", "The two passwords do not match.");
    isValid = false;
  }

  return isValid;
}

// ------------------------------------------------------------
// When the form is submitted
// ------------------------------------------------------------
form.addEventListener("submit", async (event) => {
  // Stop the browser from reloading the page, which is its default.
  event.preventDefault();
  clearMessage();

  // .trim() removes accidental spaces around what was typed.
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (!validateForm(name, email, password, confirmPassword)) {
    showMessage("Fix the highlighted fields and try again.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving to MongoDB...";
  pipelineStart();

  try {
    // ---- THIS is the call that reaches Node.js ----
    // fetch() sends an HTTP POST request to our own server.
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // "I am sending JSON"
      body: JSON.stringify({ name, email, password }), // object -> JSON text
    });

    // The server always replies with JSON, so we turn it back into an object.
    const data = await response.json();

    if (!response.ok || !data.success) {
      pipelineFinish(false);
      showMessage(data.message || "Registration failed.", "error");
      return;
    }

    // Success: the user document now exists in MongoDB.
    pipelineFinish(true);
    form.reset();
    clearAllHints();
    showMessage(
      "Account created and saved in MongoDB. You can log in now.",
      "success"
    );

    // Send them to the login page after a short pause.
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1800);
  } catch (error) {
    // We only land here if the server is unreachable
    // (not started, wrong port, no network).
    pipelineFinish(false);
    console.error(error);
    showMessage(
      "Could not reach the server. Is it running on http://localhost:5000 ?",
      "error"
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create account";
  }
});

// Clear a field's red hint as soon as the user starts fixing it.
[nameInput, emailInput, passwordInput, confirmInput].forEach((input) => {
  input.addEventListener("input", () => input.classList.remove("invalid"));
});
