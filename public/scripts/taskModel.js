class Task {
  constructor(description, dueDate, id) {
    this.description = description;
    this.dueDate = dueDate;
    this.id = id;
    this.completed = false;
  }
}

class TaskList {
  constructor() {
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push(task);
  }

  removeTask(index) {
    this.tasks.splice(index, 1);
  }

  completeTask(index) {
    this.tasks[index].completed = true;
  }
}

export { Task, TaskList };
