export default class Course {
  constructor(name, instructor, color) {
    this.id = crypto.randomUUID();
    this.name = name.trim();
    this.instructor = instructor.trim();
    this.color = color;
    this.createdAt = new Date().toISOString();
  }
}