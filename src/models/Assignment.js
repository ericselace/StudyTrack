export default class Assignment {
  constructor({
    title,
    courseId,
    dueDate,
    priority = "Medium",
    description = "",
  }) {
    this.id = crypto.randomUUID();
    this.title = title.trim();
    this.courseId = courseId;
    this.dueDate = dueDate;
    this.priority = priority;
    this.description = description.trim();
    this.completed = false;
    this.createdAt = new Date().toISOString();
  }
}