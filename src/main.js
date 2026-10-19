
import "./style.css";

import CourseController from "./controllers/CourseController.js";
import AssignmentController from "./controllers/AssignmentController.js";
import { renderDashboard } from "./views/dashboardView.js";
import { renderCalendar } from "./views/calendarView.js";

const courseController = new CourseController();
const assignmentController = new AssignmentController();

// ========================================
// Navigation
// ========================================

function renderNavigation() {
  const header = document.querySelector("#site-header");

  header.innerHTML = `
    <div class="site-header">
      <a href="#dashboard" class="logo">
        <span class="logo-icon">✓</span>
        <span>StudyTrack</span>
      </a>

      <nav class="main-nav" aria-label="Main navigation">
        <a href="#dashboard" data-page="dashboard">Dashboard</a>
        <a href="#courses" data-page="courses">Courses</a>
        <a href="#assignments" data-page="assignments">Assignments</a>
        <a href="#calendar" data-page="calendar">Calendar</a>
        <a href="#profile" data-page="profile">Profile</a>
      </nav>

      <button
        id="theme-toggle"
        class="theme-button"
        type="button"
        aria-label="Switch to dark mode"
        aria-pressed="false"
        title="Switch to dark mode"
      >
        🌙
      </button>
    </div>
  `;
}

// ========================================
// Page management
// ========================================

function getPage() {
  return window.location.hash.substring(1) || "dashboard";
}

function renderPage() {
  const page = getPage();

  switch (page) {
    case "courses":
      courseController.render();
      break;

    case "assignments":
      assignmentController.render();
      break;

    case "calendar":
      renderCalendar();
      break;

    case "dashboard":
      renderDashboard();
      break;

    case "profile":
      document.querySelector("#app").innerHTML = `
        <section class="page-header">
          <h1>Profile</h1>
          <p>Manage your student profile.</p>
        </section>
      `;
      break;

    default:
      renderDashboard();
      break;
  }

  updateActiveNavigation(page);
}

function updateActiveNavigation(page) {
  document.querySelectorAll("[data-page]").forEach((link) => {
    if (link.dataset.page === page) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
}

// ========================================
// Dark Mode
// ========================================

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const themeButton = document.querySelector("#theme-toggle");

  if (!themeButton) {
    return;
  }

  const isDark = theme === "dark";

  themeButton.textContent = isDark ? "☀️" : "🌙";

  themeButton.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode",
  );

  themeButton.setAttribute("aria-pressed", String(isDark));

  themeButton.title = isDark
    ? "Switch to light mode"
    : "Switch to dark mode";
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("studytrack-theme");

  const initialTheme = savedTheme === "dark" ? "dark" : "light";

  applyTheme(initialTheme);

  const themeButton = document.querySelector("#theme-toggle");

  if (!themeButton) {
    return;
  }

  themeButton.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme;

    const newTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(newTheme);

    localStorage.setItem("studytrack-theme", newTheme);
  });
}

// ========================================
// Initialize application
// ========================================

function initializeApp() {
  renderNavigation();
  initializeTheme();
  renderPage();

  window.addEventListener("hashchange", renderPage);
}

initializeApp();
