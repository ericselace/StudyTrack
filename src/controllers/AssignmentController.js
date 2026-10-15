import Assignment from "../models/Assignment.js";
import {
  getAssignments,
  saveAssignments,
  getCourses,
} from "../services/storageService.js";
import {
  renderAssignments,
  renderAssignmentList,
} from "../views/assignmentView.js";

export default class AssignmentController {
  constructor() {
    this.assignments = getAssignments();
    this.filter = "all";

    document.addEventListener("assignment:create", (event) => {
      this.addAssignment(event.detail);
    });

    document.addEventListener("assignment:delete", (event) => {
      this.deleteAssignment(event.detail.id);
    });

    document.addEventListener("assignment:toggle", (event) => {
      this.toggleAssignment(event.detail.id, event.detail.completed);
    });

    document.addEventListener("assignment:filter", (event) => {
      this.filter = event.detail.filter;
      this.renderList();
    });
  }

  render() {
    renderAssignments(this.assignments, getCourses());
  }

  addAssignment(data) {
    const title = String(data.title ?? "").trim();
    const courseId = String(data.courseId ?? "");
    const dueDate = String(data.dueDate ?? "");
    const courses = getCourses();

    if (!title || !courseId || !dueDate) {
      this.showMessage("Please complete all required fields.");
      return;
    }

    if (!courses.some((course) => course.id === courseId)) {
      this.showMessage("Please select a valid course.");
      return;
    }

    const selectedDate = new Date(`${dueDate}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      this.showMessage("Please select a valid due date.");
      return;
    }

    const validPriorities = ["Low", "Medium", "High"];
    const priority = validPriorities.includes(data.priority)
      ? data.priority
      : "Medium";

    const assignment = new Assignment({
      title,
      courseId,
      dueDate,
      priority,
      description: data.description ?? "",
    });

    this.assignments.push(assignment);
    saveAssignments(this.assignments);
    this.filter = "all";
    this.render();
  }

  deleteAssignment(id) {
    this.assignments = this.assignments.filter(
      (assignment) => assignment.id !== id,
    );

    saveAssignments(this.assignments);
    this.render();
  }

  toggleAssignment(id, completed) {
    this.assignments = this.assignments.map((assignment) =>
      assignment.id === id
        ? { ...assignment, completed }
        : assignment,
    );

    saveAssignments(this.assignments);
    this.render();
  }

  renderList() {
    renderAssignmentList(
      this.assignments,
      getCourses(),
      this.filter,
    );
  }

  showMessage(message) {
    const messageElement = document.querySelector(
      "#assignment-form-message",
    );

    if (messageElement) {
      messageElement.textContent = message;
    }
  }
}