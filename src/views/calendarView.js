import {
  getCourses,
  getAssignments,
} from "../services/storageService.js";

let currentMonth = new Date();
let selectedDate = getDateKey(new Date());

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function renderCalendarGrid(assignments) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // The calendar starts on Monday.
  const startOffset = (firstDay.getDay() + 6) % 7;

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  let html = weekdays
    .map((day) => `<div class="calendar-weekday">${day}</div>`)
    .join("");

  for (let i = 0; i < startOffset; i += 1) {
    html += '<div class="calendar-day calendar-day-empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);

    const dayAssignments = assignments.filter(
      (assignment) => assignment.dueDate === dateKey,
    );

    const isToday = dateKey === getDateKey(new Date());
    const isSelected = dateKey === selectedDate;

    html += `
      <button
        type="button"
        class="calendar-day
          ${isToday ? "calendar-day-today" : ""}
          ${isSelected ? "calendar-day-selected" : ""}
          ${dayAssignments.length ? "calendar-day-has-tasks" : ""}"
        data-date="${dateKey}"
        aria-label="${formatDate(dateKey)}${
          dayAssignments.length
            ? `, ${dayAssignments.length} assignment(s)`
            : ""
        }"
        aria-pressed="${isSelected}"
      >
        <span class="calendar-day-number">${day}</span>

        ${
          dayAssignments.length
            ? `
              <span class="calendar-day-count">
                ${dayAssignments.length}
                ${dayAssignments.length === 1 ? "task" : "tasks"}
              </span>
            `
            : ""
        }
      </button>
    `;
  }

  const totalCells = startOffset + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;

  for (let i = 0; i < remainingCells; i += 1) {
    html += '<div class="calendar-day calendar-day-empty"></div>';
  }

  return html;
}

function renderSelectedDate(assignments, courses) {
  const dayAssignments = assignments
    .filter((assignment) => assignment.dueDate === selectedDate)
    .sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };

      return (
        (priorityOrder[a.priority] ?? 1) -
        (priorityOrder[b.priority] ?? 1)
      );
    });

  if (!dayAssignments.length) {
    return `
      <div class="calendar-empty-state">
        <span class="calendar-empty-icon" aria-hidden="true">✓</span>
        <h3>No assignments for this day</h3>
        <p>Enjoy your free time or add a new assignment.</p>
        <a href="#assignments" class="calendar-action-link">
          Go to assignments →
        </a>
      </div>
    `;
  }

  return `
    <div class="calendar-assignment-list">
      ${dayAssignments
        .map((assignment) => {
          const course = courses.find(
            (item) => item.id === assignment.courseId,
          );

          const priority = ["High", "Medium", "Low"].includes(
            assignment.priority,
          )
            ? assignment.priority
            : "Medium";

          return `
            <article class="calendar-assignment ${
              assignment.completed ? "calendar-assignment-completed" : ""
            }">
              <div class="calendar-assignment-indicator priority-${priority.toLowerCase()}"></div>

              <div class="calendar-assignment-info">
                <h3>${escapeHTML(assignment.title)}</h3>
                <p>${escapeHTML(course?.name || "Unknown course")}</p>
                <span class="calendar-priority priority-${priority.toLowerCase()}">
                  ${priority}
                </span>
                ${
                  assignment.completed
                    ? '<span class="calendar-completed-label">Completed</span>'
                    : ""
                }
              </div>

              <span class="calendar-assignment-check" aria-hidden="true">
                ${assignment.completed ? "✓" : "○"}
              </span>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

export function renderCalendar() {
  const app = document.querySelector("#app");

  if (!app) return;

  const assignments = getAssignments();
  const courses = getCourses();

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  const dueThisMonth = assignments.filter((assignment) => {
    if (!assignment.dueDate) return false;

    const [year, month] = assignment.dueDate.split("-").map(Number);

    return (
      year === currentMonth.getFullYear() &&
      month === currentMonth.getMonth() + 1
    );
  });

  const pendingThisMonth = dueThisMonth.filter(
    (assignment) => !assignment.completed,
  );

  app.innerHTML = `
    <section class="calendar-page">

      <header class="calendar-page-heading">
        <div>
          <span class="calendar-eyebrow">PLAN YOUR SUCCESS</span>
          <h1>Study Calendar</h1>
          <p>Keep track of your deadlines and stay organized.</p>
        </div>

        <a href="#assignments" class="calendar-add-button">
          + Add assignment
        </a>
      </header>

      <section class="calendar-summary">
        <article class="calendar-summary-card summary-purple">
          <span class="calendar-summary-icon" aria-hidden="true">▦</span>
          <div>
            <p>Assignments this month</p>
            <strong>${dueThisMonth.length}</strong>
          </div>
        </article>

        <article class="calendar-summary-card summary-orange">
          <span class="calendar-summary-icon" aria-hidden="true">◷</span>
          <div>
            <p>Pending assignments</p>
            <strong>${pendingThisMonth.length}</strong>
          </div>
        </article>
      </section>

      <section class="calendar-layout">

        <div class="calendar-panel">
          <div class="calendar-toolbar">
            <div>
              <h2>${monthLabel}</h2>
              <p>Select a date to view its assignments.</p>
            </div>

            <div class="calendar-navigation">
              <button
                type="button"
                id="calendar-previous"
                aria-label="Previous month"
              >‹</button>

              <button
                type="button"
                id="calendar-today"
              >Today</button>

              <button
                type="button"
                id="calendar-next"
                aria-label="Next month"
              >›</button>
            </div>
          </div>

          <div class="calendar-grid">
            ${renderCalendarGrid(assignments)}
          </div>

          <div class="calendar-legend">
            <span><i class="legend-today"></i> Today</span>
            <span><i class="legend-tasks"></i> Has assignments</span>
          </div>
        </div>

        <aside class="calendar-details-panel">
          <span class="calendar-eyebrow">YOUR SCHEDULE</span>
          <h2>${formatDate(selectedDate)}</h2>
          <p class="calendar-details-subtitle">
            Assignments due on the selected date.
          </p>

          ${renderSelectedDate(assignments, courses)}
        </aside>

      </section>
    </section>
  `;

  document.querySelector("#calendar-previous").addEventListener("click", () => {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
    );

    renderCalendar();
  });

  document.querySelector("#calendar-next").addEventListener("click", () => {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );

    renderCalendar();
  });

  document.querySelector("#calendar-today").addEventListener("click", () => {
    currentMonth = new Date();
    selectedDate = getDateKey(new Date());

    renderCalendar();
  });

  app.querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDate = button.dataset.date;
      renderCalendar();
    });
  });
}