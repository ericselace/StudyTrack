import "./style.css";

import CourseController from "./controllers/CourseController.js";
import AssignmentController from "./controllers/AssignmentController.js";
import { renderDashboard } from "./views/dashboardView.js";
import { renderCalendar } from "./views/calendarView.js";

const courseController = new CourseController();
const assignmentController = new AssignmentController();

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
        aria-label="Toggle dark mode"
      >
        🌙
      </button>
    </div>
  `;
}

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

function initializeApp() {
  renderNavigation();
  renderPage();

  window.addEventListener("hashchange", renderPage);
}

initializeApp();