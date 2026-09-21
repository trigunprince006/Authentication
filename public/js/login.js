// ============================================================
// login.js  -  runs in the BROWSER on index.html
// ------------------------------------------------------------
// Sends the email and password to the backend, and if MongoDB
// says they are correct, moves to dashboard.html.
// ============================================================

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("loginBtn");
const messageBox = document.getElementById("message");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message show " + type;
}

function setHint(input, hintId, text) {
  document.getElementById(hintId).textContent = text;
  input.classList.toggle("invalid", Boolean(text));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // ---- Basic checks before we bother the server ----
  setHint(emailInput, "emailHint", "");
  setHint(passwordInput, "passwordHint", "");
  let isValid = true;

  if (!email) {
    setHint(emailInput, "emailHint", "Email is required.");
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    setHint(emailInput, "emailHint", "That does not look like an email address.");
    isValid = false;
  }

  if (!password) {
    setHint(passwordInput, "passwordHint", "Password is required.");
    isValid = false;
  }

  if (!isValid) {
    showMessage("Fill in both fields to continue.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Checking MongoDB...";
  pipelineStart();

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      pipelineFinish(false);
      showMessage(data.message || "Login failed.", "error");
      return;
    }

    pipelineFinish(true);
    showMessage("Credentials verified. Opening your dashboard...", "success");

    // Remember the logged-in user for the dashboard page.
    // sessionStorage lives only in this browser tab and is cleared
    // when the tab closes. A real app would use a secure cookie or
    // a JSON Web Token instead.
    sessionStorage.setItem("demoUser", JSON.stringify(data.user));

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  } catch (error) {
    pipelineFinish(false);
    console.error(error);
    showMessage(
      "Could not reach the server. Is it running on http://localhost:5000 ?",
      "error"
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Log in";
  }
});

[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", () => input.classList.remove("invalid"));
});
