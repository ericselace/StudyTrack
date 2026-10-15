import Course from "../models/Course.js";
import {
  getCourses,
  saveCourses,
} from "../services/storageService.js";
import { renderCourses } from "../views/courseView.js";

const ALLOWED_COLORS = [
  "#2563eb",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#db2777",
];

export default class CourseController {
  constructor() {
    this.courses = getCourses();

    document.addEventListener("course:create", (event) => {
      this.addCourse(event.detail);
    });

    document.addEventListener("course:delete", (event) => {
      this.deleteCourse(event.detail.id);
    });
  }

  render() {
    renderCourses(this.courses);
  }

  addCourse(data) {
    const name = String(data.name ?? "").trim();
    const instructor = String(data.instructor ?? "").trim();
    const color = ALLOWED_COLORS.includes(data.color)
      ? data.color
      : ALLOWED_COLORS[0];

    // Validate required fields.
    if (!name || !instructor) {
      this.showMessage("Please enter a course name and instructor.");
      return;
    }

    // Prevent duplicate course names.
    const duplicate = this.courses.some(
      (course) => course.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      this.showMessage("This course already exists.");
      return;
    }

    // Create and save the new course.
    const course = new Course(name, instructor, color);

    this.courses.push(course);
    saveCourses(this.courses);

    // Refresh the course list.
    this.render();
  }

  deleteCourse(id) {
    const courseExists = this.courses.some((course) => course.id === id);

    if (!courseExists) {
      return;
    }

    this.courses = this.courses.filter((course) => course.id !== id);

    saveCourses(this.courses);
    this.render();
  }

  showMessage(message) {
    const messageElement = document.querySelector("#course-form-message");

    if (messageElement) {
      messageElement.textContent = message;
    }
  }
}