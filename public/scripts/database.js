// Function to add a task to the database
export function addTask(task) {
    return new Promise((resolve, reject) => {
        const requestBody = {
            task_name: task.description,
            task_date: task.dueDate,
          };
        fetch('https://localhost:3000/add-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestBody),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error adding task');
            }
            resolve();
        })
        .catch(error => {
            reject(error.message);
        });
    });
}

export function removeTask(taskId) {
    return new Promise((resolve, reject) => {
        fetch(`https://localhost:3000/remove-task/${taskId}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error removing task');
            }
            resolve();
        })
        .catch(error => {
            reject(error.message);
        });
    });
}

export function updateTask(taskId, updatedTaskData) {
    return new Promise((resolve, reject) => {
        fetch(`https://localhost:3000/update-task/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ completed: updatedTaskData }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error updating task');
            }
            return response.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error.message);
        });
    });
}

// Function to retrieve all tasks from the database
export function getAllTasks() {
    return new Promise((resolve, reject) => {
        fetch('https://localhost:3000/all-tasks',{
            credentials: 'include',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching tasks');
            }
            return response.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error.message);
        });
    });
}