import TaskController from './taskController.js';
import { TaskList } from './taskModel.js';
import { getAllTasks } from './database.js';

document.addEventListener('DOMContentLoaded', async function () {
    const model = new TaskList();
    const controller = new TaskController(model);

    const taskForm = document.getElementById('addTaskForm'); // Corrected the form id
    if (taskForm) { // Ensure the element exists
        taskForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const description = document.getElementById('description').value;
            const dueDate = document.getElementById('dueDate').value;
            await controller.addTask(description, dueDate); // Wait for task to be added
            await renderTasks(); // Render tasks after adding
            taskForm.reset();
        });
    }

    async function renderTasks() {
        try {
            const tasks = await getAllTasks(); // Fetch tasks from the database
            const oldTaskList = document.getElementById('oldTaskList');
            const newTaskList = document.getElementById('newTaskList');
            oldTaskList.innerHTML = '';
            newTaskList.innerHTML = '';
            tasks.forEach((task) => {
                const taskItem = document.createElement('tr'); // Change li to tr for table rows
                const descriptionCell = document.createElement('td'); // Create table cell for description
                const dueDateCell = document.createElement('td'); // Create table cell for due date
                const actionCell = document.createElement('td'); // Create table cell for actions
                const completedCell = document.createElement('td');

                descriptionCell.textContent = task.description;
                dueDateCell.textContent = task.dueDate.split('T')[0];

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-button'); // Add delete button styling
                deleteButton.addEventListener('click', async () => {
                    await controller.removeTask(task.id);
                    await renderTasks(); // Render tasks after removal
                });
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.classList.add('checkbox');
                checkbox.addEventListener('change', async (event) => {
                    const isChecked = event.target.checked;
                    await controller.updateTask(task.id, isChecked);
                    await renderTasks(); // Render tasks after removal
                });
                completedCell.append(checkbox);
                actionCell.appendChild(deleteButton);

                taskItem.appendChild(descriptionCell);
                taskItem.appendChild(dueDateCell);
                taskItem.appendChild(actionCell);
                taskItem.appendChild(completedCell);
                const date = Date.parse(task.dueDate);
                const now = new Date();
                if (date < now.getTime())
                    oldTaskList.appendChild(taskItem);
                else
                    newTaskList.appendChild(taskItem);
            });
        } catch (error) {
            console.error('Error rendering tasks:', error);
        }
    }

    // Initial render when the page loads
    await renderTasks();
});