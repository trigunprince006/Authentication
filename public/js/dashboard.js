// ============================================================
// dashboard.js  -  runs in the BROWSER on dashboard.html
// ------------------------------------------------------------
// 1. Finds out who is logged in
// 2. Greets them by name
// 3. Handles the logout button
// ============================================================

const greeting = document.getElementById("greeting");
const userEmail = document.getElementById("userEmail");
const userId = document.getElementById("userId");
const logoutBtn = document.getElementById("logoutBtn");

// ------------------------------------------------------------
// Who is logged in?
// First we look at sessionStorage (saved by login.js).
// If that is empty we ask the backend with GET /api/auth/me.
// If both come up empty, nobody is logged in -> back to login.
// ------------------------------------------------------------
async function loadUser() {
  const saved = sessionStorage.getItem("demoUser");

  if (saved) {
    return JSON.parse(saved);
  }

  try {
    const response = await fetch("/api/auth/me");
    const data = await response.json();
    if (data.success) return data.user;
  } catch (error) {
    console.error(error);
  }

  return null;
}

async function showDashboard() {
  const user = await loadUser();

  if (!user) {
    // Not logged in - do not show the welcome page.
    window.location.href = "index.html";
    return;
  }

  greeting.textContent = `Welcome, ${user.name}!`;
  userEmail.textContent = user.email;
  userId.textContent = user.id;
  document.title = `Welcome, ${user.name}`;
}

showDashboard();

// ------------------------------------------------------------
// Logout
// ------------------------------------------------------------
logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;

  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error(error);
  }

  sessionStorage.removeItem("demoUser");
  window.location.href = "index.html";
});

// ------------------------------------------------------------
// If the GIF cannot load (for example you are offline),
// show a small CSS confetti animation instead.
// ------------------------------------------------------------
const gif = document.getElementById("celebrationGif");
const confetti = document.getElementById("confetti");

gif.addEventListener("error", () => {
  gif.style.display = "none";
  confetti.style.display = "block";

  const colors = ["#00ed64", "#7fe7b0", "#ffd166", "#6ec8ff", "#ff7a7a"];
  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("i");
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = (Math.random() * 2).toFixed(2) + "s";
    confetti.appendChild(piece);
  }
});
