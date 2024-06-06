import { openDatabase, getAllTasks } from './database.js';

// Function to display tasks in the HTML
function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach((task) => {
        const taskItem = document.createElement('li');
        taskItem.textContent = `${task.description} - ${task.dueDate}`;
        taskList.appendChild(taskItem);
    });
}

// Fetch and display all tasks when the window loads
window.onload = async () => {
    try {
        const db = await openDatabase();
        const tasks = await getAllTasks(db);
        displayTasks(tasks);
    } catch (error) {
        console.error(error);
    }
};
