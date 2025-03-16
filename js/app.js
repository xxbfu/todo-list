// Task data structure
const todoList = {
    prioritni: [],
    prace: [],
    zabava: [],
    hotove: {
        prioritni: [],
        prace: [],
        zabava: []
    }
};

// DOM Elements
const categoryLinks = document.querySelectorAll('.category-link');
const taskList = document.getElementById('task-list');
const completedTaskList = document.getElementById('completed-task-list');
const newTaskInput = document.getElementById('new-task');
const taskDueDateInput = document.getElementById('task-due-date');
const addTaskBtn = document.getElementById('add-task-btn');
const activeCategoryTasks = document.getElementById('active-category-tasks');
const completedSubcategories = document.getElementById('completed-subcategories');
const completedCategoryBtns = document.querySelectorAll('.completed-category-btn');

// Current active category
let activeCategory = 'prioritni';
let activeCompletedCategory = 'prioritni';

// Initialize app
function init() {
    // Load tasks from localStorage if available
    loadTasksFromStorage();
    
    // Display tasks for default category
    displayTasks(activeCategory);
    
    // Set up event listeners
    setupEventListeners();
}

// Load tasks from localStorage
function loadTasksFromStorage() {
    const savedTasks = localStorage.getItem('todoList');
    if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        Object.assign(todoList, parsedTasks);
    }
}

// Save tasks to localStorage
function saveTasksToStorage() {
    localStorage.setItem('todoList', JSON.stringify(todoList));
}

// Set up event listeners
function setupEventListeners() {
    // Category navigation
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            
            // Remove active class from all links
            categoryLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Update active category and display tasks
            activeCategory = category;
            
            // Show appropriate view based on category
            if (category === 'hotove') {
                activeCategoryTasks.classList.add('hidden');
                completedSubcategories.classList.remove('hidden');
                displayCompletedTasks(activeCompletedCategory);
            } else {
                activeCategoryTasks.classList.remove('hidden');
                completedSubcategories.classList.add('hidden');
                displayTasks(category);
            }
        });
    });
    
    // Completed category buttons
    completedCategoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            
            // Remove active class from all buttons
            completedCategoryBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update active completed category and display tasks
            activeCompletedCategory = category;
            displayCompletedTasks(category);
        });
    });
    
    // Add new task
    addTaskBtn.addEventListener('click', addNewTask);
    
    // Add task on Enter key press
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewTask();
        }
    });
}

// Display tasks for active category
function displayTasks(category) {
    taskList.innerHTML = '';
    
    if (todoList[category] && todoList[category].length > 0) {
        // Check if we need to migrate old format data
        if (typeof todoList[category][0] === 'string') {
            todoList[category] = todoList[category].map(taskText => ({
                text: taskText,
                dueDate: null,
                createdAt: new Date().toISOString()
            }));
            saveTasksToStorage();
        }
        
        todoList[category].forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            
            // Format due date if it exists
            let dueDateHTML = '';
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                const isOverdue = dueDate < today && dueDate.toDateString() !== today.toDateString();
                const formattedDate = new Intl.DateTimeFormat('cs-CZ', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                }).format(dueDate);
                
                dueDateHTML = `<div class="task-due-date ${isOverdue ? 'overdue' : ''}">Termín: ${formattedDate}</div>`;
            }
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    ${dueDateHTML}
                </div>
                <button class="delete-btn">✕</button>
            `;
            
            // Add event listener to mark task as completed on double click
            li.querySelector('.task-content').addEventListener('dblclick', () => {
                completeTask(category, index);
            });
            
            // Add event listener to delete task
            li.querySelector('.delete-btn').addEventListener('click', () => {
                deleteTask(category, index);
            });
            
            taskList.appendChild(li);
        });
    }
}

// Display completed tasks for selected category
function displayCompletedTasks(category) {
    completedTaskList.innerHTML = '';
    
    if (todoList.hotove[category] && todoList.hotove[category].length > 0) {
        // Check if we need to migrate old format data
        if (typeof todoList.hotove[category][0] === 'string') {
            todoList.hotove[category] = todoList.hotove[category].map(taskText => ({
                text: taskText,
                dueDate: null,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            }));
            saveTasksToStorage();
        }
        
        todoList.hotove[category].forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            
            // Format due date if it exists
            let dueDateHTML = '';
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const formattedDate = new Intl.DateTimeFormat('cs-CZ', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                }).format(dueDate);
                
                dueDateHTML = `<div class="task-due-date">Termín: ${formattedDate}</div>`;
            }
            
            // Format completion date
            const completedDate = task.completedAt ? new Date(task.completedAt) : new Date();
            const formattedCompletionDate = new Intl.DateTimeFormat('cs-CZ', { 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
            }).format(completedDate);
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="task-text completed">${task.text}</div>
                    ${dueDateHTML}
                    <div class="task-due-date">Dokončeno: ${formattedCompletionDate}</div>
                </div>
                <button class="delete-btn">✕</button>
            `;
            
            // Add event listener to delete completed task
            li.querySelector('.delete-btn').addEventListener('click', () => {
                deleteCompletedTask(category, index);
            });
            
            // Add event listener to restore task on double click
            li.querySelector('.task-content').addEventListener('dblclick', () => {
                restoreTask(category, index);
            });
            
            completedTaskList.appendChild(li);
        });
    }
}

// Add new task
function addNewTask() {
    const taskText = newTaskInput.value.trim();
    const dueDate = taskDueDateInput.value;
    
    if (taskText !== '' && activeCategory !== 'hotove') {
        const taskObj = {
            text: taskText,
            dueDate: dueDate || null,
            createdAt: new Date().toISOString()
        };
        
        todoList[activeCategory].push(taskObj);
        saveTasksToStorage();
        displayTasks(activeCategory);
        newTaskInput.value = '';
        taskDueDateInput.value = '';
    }
}

// Delete task
function deleteTask(category, index) {
    todoList[category].splice(index, 1);
    saveTasksToStorage();
    displayTasks(category);
}

// Delete completed task
function deleteCompletedTask(category, index) {
    todoList.hotove[category].splice(index, 1);
    saveTasksToStorage();
    displayCompletedTasks(category);
}

// Complete task
function completeTask(category, index) {
    // Get task
    const task = todoList[category][index];
    
    // Add completion timestamp
    task.completedAt = new Date().toISOString();
    
    // Add to completed tasks
    todoList.hotove[category].push(task);
    
    // Remove from active tasks
    todoList[category].splice(index, 1);
    
    // Save and refresh display
    saveTasksToStorage();
    displayTasks(category);
}

// Restore task
function restoreTask(category, index) {
    // Get task
    const task = todoList.hotove[category][index];
    
    // Remove completion timestamp if exists
    if (task.completedAt) {
        delete task.completedAt;
    }
    
    // Add back to original category
    todoList[category].push(task);
    
    // Remove from completed tasks
    todoList.hotove[category].splice(index, 1);
    
    // Save and refresh display
    saveTasksToStorage();
    displayCompletedTasks(category);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);