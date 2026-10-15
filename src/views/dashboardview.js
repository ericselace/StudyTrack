import {
  getCourses,
  getAssignments,
} from "../services/storageService.js";

import { getDailyScripture } from "../services/scriptureService.js";

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

function formatDate(dateString) {
  if (!dateString) return "No due date";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getCourseName(courseId, courses) {
  const course = courses.find((item) => item.id === courseId);
  return course ? course.name : "Unknown course";
}

function getDaysRemaining(dateString) {
  if (!dateString) return null;

  const dueDate = new Date(`${dateString}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(dueDate.getTime())) return null;

  return Math.round((dueDate - today) / 86400000);
}

function renderAssignment(assignment, courses) {
  const days = getDaysRemaining(assignment.dueDate);

  let deadlineText = formatDate(assignment.dueDate);
  let deadlineClass = "";

  if (days !== null) {
    if (days < 0) {
      deadlineText = `${Math.abs(days)} day(s) overdue`;
      deadlineClass = "deadline-overdue";
    } else if (days === 0) {
      deadlineText = "Due today";
      deadlineClass = "deadline-today";
    } else if (days === 1) {
      deadlineText = "Due tomorrow";
      deadlineClass = "deadline-today";
    }
  }

  return `
    <article class="dashboard-task">
      <div class="task-status-dot ${
        assignment.priority === "High"
          ? "priority-high"
          : assignment.priority === "Medium"
            ? "priority-medium"
            : "priority-low"
      }"></div>

      <div class="dashboard-task-content">
        <h3>${escapeHTML(assignment.title)}</h3>
        <p>${escapeHTML(getCourseName(assignment.courseId, courses))}</p>
        <span class="task-deadline ${deadlineClass}">
          ${escapeHTML(deadlineText)}
        </span>
      </div>

      <span class="priority-label priority-${escapeHTML(
        String(assignment.priority || "Medium").toLowerCase(),
      )}">
        ${escapeHTML(assignment.priority || "Medium")}
      </span>
    </article>
  `;
}

async function loadDailyScripture() {
  const textElement = document.querySelector("#scripture-text");
  const referenceElement = document.querySelector(
    "#scripture-reference",
  );

  if (!textElement || !referenceElement) return;

  try {
    const scripture = await getDailyScripture();

    // Ensure the dashboard still exists after the API request.
    const currentText = document.querySelector("#scripture-text");
    const currentReference = document.querySelector(
      "#scripture-reference",
    );

    if (!currentText || !currentReference) return;

    if (
      !scripture ||
      typeof scripture.text !== "string" ||
      typeof scripture.reference !== "string"
    ) {
      currentText.textContent =
        "Today's scripture is temporarily unavailable. Please try again later.";
      currentReference.textContent = "";
      return;
    }

    // Use textContent to prevent API content from being interpreted as HTML.
    currentText.textContent = scripture.text;
    currentReference.textContent = scripture.reference;
  } catch (error) {
    console.error("StudyTrack: Could not load daily scripture.", error);

    const currentText = document.querySelector("#scripture-text");
    const currentReference = document.querySelector(
      "#scripture-reference",
    );

    if (currentText) {
      currentText.textContent =
        "Today's scripture is temporarily unavailable. Please try again later.";
    }

    if (currentReference) {
      currentReference.textContent = "";
    }
  }
}

export function renderDashboard() {
  const app = document.querySelector("#app");

  if (!app) {
    console.error("StudyTrack: #app element not found.");
    return;
  }

  const courses = getCourses();
  const assignments = getAssignments();

  const pendingAssignments = assignments.filter(
    (assignment) => !assignment.completed,
  );

  const completedAssignments = assignments.filter(
    (assignment) => assignment.completed,
  );

  const urgentAssignments = pendingAssignments
    .filter((assignment) => {
      const days = getDaysRemaining(assignment.dueDate);
      return days !== null && days <= 2;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.dueDate}T00:00:00`);
      const dateB = new Date(`${b.dueDate}T00:00:00`);
      return dateA - dateB;
    });

  const upcomingAssignments = pendingAssignments
    .filter((assignment) => {
      const days = getDaysRemaining(assignment.dueDate);
      return days !== null && days > 2;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.dueDate}T00:00:00`);
      const dateB = new Date(`${b.dueDate}T00:00:00`);
      return dateA - dateB;
    })
    .slice(0, 4);

  const completionRate = assignments.length
    ? Math.round(
        (completedAssignments.length / assignments.length) * 100,
      )
    : 0;

  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  app.innerHTML = `
    <section class="dashboard">

      <section class="welcome-banner">
        <div class="welcome-content">
          <span class="welcome-eyebrow">YOUR PERSONAL STUDY SPACE</span>
          <h1>Make today count!</h1>
          <p>
            Stay organized, keep your goals in sight, and make progress
            one task at a time.
          </p>
          <div class="welcome-date">${escapeHTML(currentDate)}</div>

          <div class="welcome-actions">
            <a href="#assignments" class="dashboard-primary-button">
              + View assignments
            </a>
            <a href="#courses" class="dashboard-secondary-button">
              Explore courses
            </a>
          </div>
        </div>

        <div class="welcome-decoration" aria-hidden="true">
          <div class="decoration-circle circle-one"></div>
          <div class="decoration-circle circle-two"></div>
          <div class="decoration-icon">✦</div>
          <div class="decoration-card">
            <span>Keep going!</span>
            <strong>${completionRate}%</strong>
            <small>Tasks completed</small>
          </div>
        </div>
      </section>

      <!-- Scripture of the Day -->
      <section
        class="scripture-card"
        aria-labelledby="scripture-title"
      >
        <div class="scripture-icon" aria-hidden="true">✦</div>

        <div class="scripture-content">
          <span class="section-eyebrow">DAILY INSPIRATION</span>
          <h2 id="scripture-title">Scripture of the Day</h2>

          <p id="scripture-text" aria-live="polite" aria-atomic="true">
            Loading today's scripture...
          </p>

          <p
            id="scripture-reference"
            class="scripture-reference"
          ></p>

          <div class="scripture-sources">
            <a
              href="https://www.churchofjesuschrist.org/study/scriptures?lang=eng"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the official scriptures
            </a>

            <a
              href="https://openscriptureapi.org/docs/quickstart"
              target="_blank"
              rel="noopener noreferrer"
            >
              API documentation
            </a>
          </div>
        </div>
      </section>

      <!-- Study Statistics -->
      <section class="stats-grid" aria-label="Study statistics">

        <article class="stat-card stat-purple">
          <div class="stat-card-top">
            <span class="stat-icon" aria-hidden="true">▤</span>
            <span class="stat-caption">Learning</span>
          </div>
          <p class="stat-number">${courses.length}</p>
          <h2>Total courses</h2>
          <p class="stat-description">Your learning journey</p>
        </article>

        <article class="stat-card stat-turquoise">
          <div class="stat-card-top">
            <span class="stat-icon" aria-hidden="true">✓</span>
            <span class="stat-caption">To do</span>
          </div>
          <p class="stat-number">${pendingAssignments.length}</p>
          <h2>Pending tasks</h2>
          <p class="stat-description">Tasks still to complete</p>
        </article>

        <article class="stat-card stat-orange">
          <div class="stat-card-top">
            <span class="stat-icon" aria-hidden="true">◷</span>
            <span class="stat-caption">Attention</span>
          </div>
          <p class="stat-number">${urgentAssignments.length}</p>
          <h2>Urgent tasks</h2>
          <p class="stat-description">
            Due within two days or overdue
          </p>
        </article>

        <article class="stat-card stat-blue">
          <div class="stat-card-top">
            <span class="stat-icon" aria-hidden="true">★</span>
            <span class="stat-caption">Progress</span>
          </div>
          <p class="stat-number">${completionRate}%</p>
          <h2>Completed</h2>
          <p class="stat-description">
            ${completedAssignments.length} of ${assignments.length} tasks
          </p>
        </article>

      </section>

      <!-- Deadlines and Upcoming Tasks -->
      <section class="dashboard-columns">

        <div class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <span class="section-eyebrow">STAY ON TRACK</span>
              <h2>Urgent deadlines</h2>
            </div>
            <a href="#assignments" class="panel-link">View all →</a>
          </div>

          <div class="dashboard-task-list">
            ${
              urgentAssignments.length
                ? urgentAssignments
                    .map((assignment) =>
                      renderAssignment(assignment, courses),
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span class="empty-state-icon">✓</span>
                    <h3>You're all caught up!</h3>
                    <p>No urgent deadlines at the moment.</p>
                  </div>
                `
            }
          </div>
        </div>

        <div class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <span class="section-eyebrow">COMING UP</span>
              <h2>Upcoming tasks</h2>
            </div>
            <a href="#assignments" class="panel-link">View all →</a>
          </div>

          <div class="dashboard-task-list">
            ${
              upcomingAssignments.length
                ? upcomingAssignments
                    .map((assignment) =>
                      renderAssignment(assignment, courses),
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span class="empty-state-icon">◷</span>
                    <h3>Nothing scheduled ahead</h3>
                    <p>
                      Add a task with a future deadline to see it here.
                    </p>
                  </div>
                `
            }
          </div>
        </div>

      </section>

      <!-- Courses -->
      <section class="dashboard-panel courses-panel">
        <div class="panel-heading">
          <div>
            <span class="section-eyebrow">YOUR LEARNING JOURNEY</span>
            <h2>My courses</h2>
            <p class="panel-subtitle">
              Keep track of your courses and associated tasks.
            </p>
          </div>
          <a href="#courses" class="panel-link">Manage courses →</a>
        </div>

        ${
          courses.length
            ? `
              <div class="dashboard-courses-grid">
                ${courses
                  .map((course, index) => {
                    const courseAssignments = assignments.filter(
                      (assignment) => assignment.courseId === course.id,
                    );

                    const courseCompleted = courseAssignments.filter(
                      (assignment) => assignment.completed,
                    ).length;

                    const courseProgress = courseAssignments.length
                      ? Math.round(
                          (courseCompleted / courseAssignments.length) * 100,
                        )
                      : 0;

                    const colors = [
                      "course-accent-purple",
                      "course-accent-turquoise",
                      "course-accent-orange",
                      "course-accent-blue",
                    ];

                    return `
                      <article class="dashboard-course-card ${
                        colors[index % colors.length]
                      }">
                        <div class="course-card-heading">
                          <span
                            class="course-card-icon"
                            aria-hidden="true"
                          >
                            ${index + 1}
                          </span>

                          <span class="course-task-count">
                            ${courseAssignments.length}
                            ${
                              courseAssignments.length === 1
                                ? "task"
                                : "tasks"
                            }
                          </span>
                        </div>

                        <h3>${escapeHTML(course.name)}</h3>
                        <p class="course-instructor">
                          Instructor:
                          ${escapeHTML(
                            course.instructor || "Not specified",
                          )}
                        </p>

                        <div class="course-progress-label">
                          <span>Task completion</span>
                          <strong>${courseProgress}%</strong>
                        </div>

                        <div
                          class="course-progress-track"
                          role="progressbar"
                          aria-label="${escapeHTML(
                            course.name,
                          )} task completion"
                          aria-valuenow="${courseProgress}"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <div
                            class="course-progress-fill"
                            style="width: ${courseProgress}%"
                          ></div>
                        </div>
                      </article>
                    `;
                  })
                  .join("")}
              </div>
            `
            : `
              <div class="empty-state">
                <span class="empty-state-icon">▤</span>
                <h3>Your learning journey starts here</h3>
                <p>
                  Add your first course to see it on your dashboard.
                </p>
                <a href="#courses" class="dashboard-primary-button">
                  + Add a course
                </a>
              </div>
            `
        }
      </section>

    </section>
  `;

  // Load the scripture after the dashboard markup has been inserted.
  loadDailyScripture();
}