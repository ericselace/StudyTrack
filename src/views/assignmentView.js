export function renderAssignments(assignments, courses) {
  const app = document.querySelector("#app");

  const courseOptions = courses
    .map(
      (course) => `
        <option value="${escapeHTML(course.id)}">
          ${escapeHTML(course.name)}
        </option>
      `,
    )
    .join("");

  app.innerHTML = `
    <section class="container">
      <div class="page-heading">
        <div>
          <p class="eyebrow">STAY ORGANIZED</p>
          <h1>My Assignments</h1>
          <p class="page-description">
            Manage your deadlines and track your progress.
          </p>
        </div>
        <button id="show-assignment-form" class="primary-button" type="button">
          + Add Assignment
        </button>
      </div>

      <section id="assignment-form-section"
        class="dashboard-card form-section" hidden>
        <h2>New Assignment</h2>

        ${
          courses.length
            ? `
              <form id="assignment-form">
                <div class="form-group">
                  <label for="assignment-title">Assignment title</label>
                  <input id="assignment-title" name="title"
                    type="text" maxlength="120" required
                    placeholder="e.g. JavaScript Project" />
                </div>

                <div class="form-group">
                  <label for="assignment-course">Course</label>
                  <select id="assignment-course" name="courseId" required>
                    <option value="">Select a course</option>
                    ${courseOptions}
                  </select>
                </div>

                <div class="form-group">
                  <label for="assignment-due-date">Due date</label>
                  <input id="assignment-due-date" name="dueDate"
                    type="date" required />
                </div>

                <div class="form-group">
                  <label for="assignment-priority">Priority</label>
                  <select id="assignment-priority" name="priority">
                    <option value="Low">Low</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="assignment-description">Description (optional)</label>
                  <textarea id="assignment-description"
                    name="description" rows="3" maxlength="500"
                    placeholder="Add details about this assignment"></textarea>
                </div>

                <div class="form-actions">
                  <button class="primary-button" type="submit">
                    Save Assignment
                  </button>
                  <button id="cancel-assignment-form"
                    class="secondary-button" type="button">
                    Cancel
                  </button>
                </div>

                <p id="assignment-form-message"
                  class="form-message" role="status"></p>
              </form>
            `
            : `
              <p>
                You need to add a course before creating an assignment.
                <a href="#courses">Go to My Courses</a>
              </p>
            `
        }
      </section>

      <section class="dashboard-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">YOUR WORK</p>
            <h2>Assignment List</h2>
          </div>
          <label for="assignment-filter">Filter</label>
          <select id="assignment-filter" aria-label="Filter assignments">
            <option value="all">All assignments</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="High">High priority</option>
            <option value="Medium">Medium priority</option>
            <option value="Low">Low priority</option>
          </select>
        </div>

        <div id="assignment-list">
          ${renderAssignmentCards(assignments, courses)}
        </div>
      </section>
    </section>
  `;

  bindAssignmentEvents();
}

function renderAssignmentCards(assignments, courses, filter = "all") {
  let filteredAssignments = assignments;

  if (filter === "pending") {
    filteredAssignments = assignments.filter(
      (assignment) => !assignment.completed,
    );
  } else if (filter === "completed") {
    filteredAssignments = assignments.filter(
      (assignment) => assignment.completed,
    );
  } else if (["High", "Medium", "Low"].includes(filter)) {
    filteredAssignments = assignments.filter(
      (assignment) => assignment.priority === filter,
    );
  }

  if (!filteredAssignments.length) {
    return `
      <div class="empty-state">
        <p class="empty-state-icon" aria-hidden="true">📝</p>
        <h3>No assignments found</h3>
        <p>Add an assignment or select another filter.</p>
      </div>
    `;
  }

  return filteredAssignments
    .map((assignment) => {
      const course = courses.find(
        (item) => item.id === assignment.courseId,
      );

      const dueDate = new Date(`${assignment.dueDate}T00:00:00`);
      const formattedDate = Number.isNaN(dueDate.getTime())
        ? "Invalid date"
        : dueDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

      return `
        <article class="assignment-card ${
          assignment.completed ? "is-completed" : ""
        }">
          <div class="assignment-card-content">
            <div class="assignment-title-row">
              <h3>${escapeHTML(assignment.title)}</h3>
              <span class="priority-badge priority-${assignment.priority.toLowerCase()}">
                ${escapeHTML(assignment.priority)}
              </span>
            </div>

            <p class="assignment-course">
              ${escapeHTML(course?.name ?? "Course unavailable")}
            </p>

            <p class="assignment-due-date">
              Due: ${formattedDate}
            </p>

            ${
              assignment.description
                ? `<p class="assignment-description">${escapeHTML(assignment.description)}</p>`
                : ""
            }
          </div>

          <div class="assignment-actions">
            <label class="completion-label">
              <input type="checkbox"
                data-toggle-assignment="${escapeHTML(assignment.id)}"
                ${assignment.completed ? "checked" : ""} />
              Completed
            </label>

            <button class="delete-course-button"
              type="button"
              data-delete-assignment="${escapeHTML(assignment.id)}"
              aria-label="Delete ${escapeHTML(assignment.title)}">
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function bindAssignmentEvents() {
  const formSection = document.querySelector("#assignment-form-section");
  const showButton = document.querySelector("#show-assignment-form");
  const form = document.querySelector("#assignment-form");
  const filterSelect = document.querySelector("#assignment-filter");

  showButton.addEventListener("click", () => {
    formSection.hidden = false;
    document.querySelector("#assignment-title")?.focus();
  });

  document.querySelector("#cancel-assignment-form")?.addEventListener(
    "click",
    () => {
      form?.reset();
      formSection.hidden = true;
    },
  );

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    document.dispatchEvent(
      new CustomEvent("assignment:create", {
        detail: {
          title: formData.get("title"),
          courseId: formData.get("courseId"),
          dueDate: formData.get("dueDate"),
          priority: formData.get("priority"),
          description: formData.get("description"),
        },
      }),
    );
  });

  filterSelect.addEventListener("change", () => {
    document.dispatchEvent(
      new CustomEvent("assignment:filter", {
        detail: { filter: filterSelect.value },
      }),
    );
  });

  document.querySelectorAll("[data-delete-assignment]").forEach((button) => {
    button.addEventListener("click", () => {
      document.dispatchEvent(
        new CustomEvent("assignment:delete", {
          detail: { id: button.dataset.deleteAssignment },
        }),
      );
    });
  });

  document.querySelectorAll("[data-toggle-assignment]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      document.dispatchEvent(
        new CustomEvent("assignment:toggle", {
          detail: {
            id: checkbox.dataset.toggleAssignment,
            completed: checkbox.checked,
          },
        }),
      );
    });
  });
}

export function renderAssignmentList(assignments, courses, filter = "all") {
  const list = document.querySelector("#assignment-list");

  if (list) {
    list.innerHTML = renderAssignmentCards(assignments, courses, filter);
    bindAssignmentListEvents();
  }
}

function bindAssignmentListEvents() {
  document.querySelectorAll("[data-delete-assignment]").forEach((button) => {
    button.addEventListener("click", () => {
      document.dispatchEvent(
        new CustomEvent("assignment:delete", {
          detail: { id: button.dataset.deleteAssignment },
        }),
      );
    });
  });

  document.querySelectorAll("[data-toggle-assignment]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      document.dispatchEvent(
        new CustomEvent("assignment:toggle", {
          detail: {
            id: checkbox.dataset.toggleAssignment,
            completed: checkbox.checked,
          },
        }),
      );
    });
  });
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}