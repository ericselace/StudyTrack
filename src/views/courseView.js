export function renderCourses(courses) {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section class="container">
      <div class="page-heading">
        <div>
          <p class="eyebrow">YOUR LEARNING</p>
          <h1>My Courses</h1>
          <p class="page-description">
            Organize your courses and track your studies.
          </p>
        </div>

        <button id="show-course-form" class="primary-button" type="button">
          + Add Course
        </button>
      </div>

      <section id="course-form-section" class="dashboard-card form-section" hidden>
        <h2>Add a New Course</h2>

        <form id="course-form">
          <div class="form-group">
            <label for="course-name">Course name</label>
            <input
              id="course-name"
              name="name"
              type="text"
              maxlength="80"
              required
              placeholder="e.g. Web Development"
            />
          </div>

          <div class="form-group">
            <label for="course-instructor">Instructor</label>
            <input
              id="course-instructor"
              name="instructor"
              type="text"
              maxlength="80"
              required
              placeholder="e.g. Professor Smith"
            />
          </div>

          <div class="form-group">
            <label for="course-color">Course color</label>
            <select id="course-color" name="color">
              <option value="#2563eb">Blue</option>
              <option value="#16a34a">Green</option>
              <option value="#9333ea">Purple</option>
              <option value="#ea580c">Orange</option>
              <option value="#db2777">Pink</option>
            </select>
          </div>

          <div class="form-actions">
            <button class="primary-button" type="submit">Save Course</button>
            <button id="cancel-course-form" class="secondary-button" type="button">
              Cancel
            </button>
          </div>

          <p id="course-form-message" class="form-message" role="status"></p>
        </form>
      </section>

      <section class="course-grid" aria-label="Your courses">
        ${
          courses.length
            ? courses.map((course) => `
                <article class="course-card" style="--course-color: ${course.color}">
                  <div class="course-card-top">
                    <span class="course-indicator" aria-hidden="true"></span>
                    <button
                      class="delete-course-button"
                      type="button"
                      data-delete-course="${course.id}"
                      aria-label="Delete ${escapeHTML(course.name)}"
                    >Delete</button>
                  </div>

                  <h2>${escapeHTML(course.name)}</h2>
                  <p class="course-instructor">
                    Instructor: ${escapeHTML(course.instructor)}
                  </p>
                  <p class="course-meta">Added to your study plan</p>
                </article>
              `).join("")
            : `<div class="dashboard-card empty-state">
                 <p class="empty-state-icon" aria-hidden="true">📚</p>
                 <h2>No courses yet</h2>
                 <p>Add your first course to start organizing your studies.</p>
               </div>`
        }
      </section>
    </section>
  `;

  bindCourseViewEvents();
}

function bindCourseViewEvents() {
  const formSection = document.querySelector("#course-form-section");
  const form = document.querySelector("#course-form");

  document.querySelector("#show-course-form").addEventListener("click", () => {
    formSection.hidden = false;
    document.querySelector("#course-name").focus();
  });

  document.querySelector("#cancel-course-form").addEventListener("click", () => {
    form.reset();
    formSection.hidden = true;
    document.querySelector("#course-form-message").textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    document.dispatchEvent(new CustomEvent("course:create", {
      detail: {
        name: formData.get("name"),
        instructor: formData.get("instructor"),
        color: formData.get("color"),
      },
    }));
  });

  document.querySelectorAll("[data-delete-course]").forEach((button) => {
    button.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("course:delete", {
        detail: { id: button.dataset.deleteCourse },
      }));
    });
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}