const apiURL ='https://692c751ec829d464006f9ff5.mockapi.io/todos'; 
const todoList = document.getElementById('todo-list');
const todoForm = document.getElementById('todo-form');

async function fetchTodos() {
    todoList.innerHTML = '<p style="text-align:center;">Loading tasks...</p>'; 

    try {
        const response = await fetch(apiURL);
        const tasks = await response.json();
        checkDueDates(tasks);
        todoList.innerHTML = '';

        tasks.forEach(task => {
            renderTaskToDOM(task);
        });

    } catch (error) {
        console.error('Error:', error);
        todoList.innerHTML = '<p style="text-align:center; color:red;">Failed to load tasks.</p>'; 
    }
}

function renderTaskToDOM(task) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    
    if (task.isCompleted) {
        li.classList.add('completed');

    }

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    if (task.dueDate && dueDate < now && !task.isCompleted) {
        li.classList.add('overdue');
    }

    const displayDate = task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No date';

    li.innerHTML = `
        <div class="todo-content">
            <span class="todo-title">${task.title}</span>
            <div class="todo-meta">
                <span>📅 ${displayDate}</span>
                <br>
                <span>${task.description || ''}</span> 
            </div>
        </div>
        <div class="actions">
            <button class="btn-complete" onclick="toggleComplete('${task.id}', ${task.isCompleted})">
                ${task.isCompleted ? 'Undo' : 'Done'}
            </button>
            
            <button class="btn-delete" onclick="deleteTask('${task.id}')">
                Delete
            </button>
        </div>
    `;

    todoList.appendChild(li);
}

fetchTodos();

todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('description');
    const dateInput = document.getElementById('dueDate');
    const addBtn = document.getElementById('add-btn');

    const newTask = {
        title: titleInput.value,
        description: descInput.value,
        dueDate: dateInput.value,
        isCompleted: false 
    };

    
    const originalBtnText = addBtn.innerText;
    addBtn.innerText = 'Saving...';
    addBtn.disabled = true;

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            todoForm.reset(); 
            fetchTodos();
        } else {
            alert('Something went wrong adding the task.');
        }

    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to connect to the server.');
    } finally {
        addBtn.innerText = originalBtnText;
        addBtn.disabled = false;
    }
});
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${apiURL}/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchTodos();
        } else {
            alert('Error deleting task');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function toggleComplete(id, currentStatus) {
    const updatedStatus = !currentStatus;

    try {
        const response = await fetch(`${apiURL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isCompleted: updatedStatus }),
        });

        if (response.ok) {
            fetchTodos();
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

function checkDueDates(tasks) {
    const now = new Date();

    tasks.forEach(task => {
        if (task.dueDate && !task.isCompleted) {
            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate - now;

            if (timeDiff > 0 && timeDiff < 60000) {
                alert(`Reminder: Task "${task.title}" is due now!`);
            }
        }
    });
}