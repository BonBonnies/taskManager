import TaskController from './taskController.js';
import { TaskList } from './taskModel.js';

document.addEventListener('DOMContentLoaded', function() {
    const model = new TaskList();
    const controller = new TaskController(model);

    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) { // Ensure the element exists
        addTaskForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const description = document.getElementById('description').value;
            const dueDate = document.getElementById('dueDate').value;
            controller.addTask(description, dueDate);
            // Additional logic to update the UI if needed
            addTaskForm.reset();
        });
    }
});