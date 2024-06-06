import { addTask, removeTask, updateTask} from './database.js';
import { Task } from './taskModel.js';

class TaskController {
  constructor(model) {
    this.model = model;
  }

  async addTask(description, dueDate) {
    const task = new Task(description, dueDate);
    this.model.addTask(task);
    try {
      await addTask(task);
      console.log('Task added to the database');
    } catch (error) {
      console.error('Error inserting task:', error);
    }
  }

  async removeTask(taskId) {
    try {
      await removeTask(taskId);
      console.log('Task removed from the database');
    } catch (error) {
      console.error('Error removing task:', error);
    }
  }

  async updateTask(taskId, updatedTaskData) {
    try {
      await updateTask(taskId, updatedTaskData); 
      console.log('Task updated in the database');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

}

export default TaskController;