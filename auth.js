// Reads the logged-in student from localStorage. Redirects to login.html if absent.
function getStudent() {
  const raw = localStorage.getItem("fa1_student");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function requireStudent() {
  const student = getStudent();
  if (!student) {
    window.location.href = "login.html";
    return null;
  }
  return student;
}

function logoutStudent() {
  localStorage.removeItem("fa1_student");
  window.location.href = "login.html";
}

// Renders the shared top bar (nickname pill + "switch student" link) into #app-header
function renderHeader(student, opts = {}) {
  const header = document.getElementById("app-header");
  if (!header) return;
  const backLink = opts.showBack
    ? `<a class="header-back" href="index.html">&larr; Sommaire</a>`
    : "";
  header.innerHTML = `
    <div class="header-inner">
      ${backLink}
      <div class="header-spacer"></div>
      <div class="header-student">
        <span class="student-dot" aria-hidden="true"></span>
        <span class="student-name">${escapeHtml(student.nickname)}</span>
        <button class="student-switch" id="switch-student-btn" type="button">змінити</button>
      </div>
    </div>
  `;
  document.getElementById("switch-student-btn").addEventListener("click", logoutStudent);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
