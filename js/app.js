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
const categoryList = document.getElementById('category-list');
const taskList = document.getElementById('task-list');
const completedTaskList = document.getElementById('completed-task-list');
const newTaskInput = document.getElementById('new-task');
const taskDueDateInput = document.getElementById('task-due-date');
const taskDetailInput = document.getElementById('task-detail');
const addTaskBtn = document.getElementById('add-task-btn');
const activeCategoryTasks = document.getElementById('active-category-tasks');
const completedSubcategories = document.getElementById('completed-subcategories');
const completedCategoryBtns = document.querySelectorAll('.completed-category-btn');
const newCategoryInput = document.getElementById('new-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const removeCategoryBtn = document.getElementById('remove-category-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const colorBtns = document.querySelectorAll('.color-btn');
const modal = document.getElementById('task-detail-modal');
const closeModalBtn = document.querySelector('.close-modal');

// Current active category
let activeCategory = 'prioritni';
let activeCompletedCategory = 'prioritni';
let selectedColor = '';

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
                detail: null,
                color: '',
                createdAt: new Date().toISOString()
            }));
            saveTasksToStorage();
        }
        
        todoList[category].forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            
            // Add task color if it exists
            if (task.color) {
                li.style.backgroundColor = task.color;
            }
            
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
            
            // Indicate if task has details
            const hasDetailIndicator = task.detail ? '<span class="detail-indicator">📝</span> ' : '';
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="task-text">${hasDetailIndicator}${task.text}</div>
                    ${dueDateHTML}
                </div>
                <button class="delete-btn">✕</button>
            `;
            
            // Add event listener to mark task as completed on double click
            li.querySelector('.task-content').addEventListener('dblclick', () => {
                completeTask(category, index);
            });
            
            // Add event listener to show task details on single click
            li.querySelector('.task-content').addEventListener('click', () => {
                showTaskDetails(task);
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
                detail: null,
                color: '',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            }));
            saveTasksToStorage();
        }
        
        todoList.hotove[category].forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            
            // Add task color if it exists
            if (task.color) {
                li.style.backgroundColor = task.color;
            }
            
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
            
            // Indicate if task has details
            const hasDetailIndicator = task.detail ? '<span class="detail-indicator">📝</span> ' : '';
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="task-text completed">${hasDetailIndicator}${task.text}</div>
                    ${dueDateHTML}
                    <div class="task-due-date">Dokončeno: ${formattedCompletionDate}</div>
                </div>
                <button class="delete-btn">✕</button>
            `;
            
            // Add event listener to delete completed task
            li.querySelector('.delete-btn').addEventListener('click', () => {
                deleteCompletedTask(category, index);
            });
            
            // Add event listener to show task details on single click
            li.querySelector('.task-content').addEventListener('click', () => {
                showTaskDetails(task);
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
    const taskDetail = taskDetailInput.value.trim();
    
    if (taskText !== '' && activeCategory !== 'hotove') {
        const taskObj = {
            text: taskText,
            dueDate: dueDate || null,
            detail: taskDetail || null,
            color: selectedColor,
            createdAt: new Date().toISOString()
        };
        
        todoList[activeCategory].push(taskObj);
        saveTasksToStorage();
        displayTasks(activeCategory);
        newTaskInput.value = '';
        taskDueDateInput.value = '';
        taskDetailInput.value = '';
        
        // Reset color selection
        colorBtns.forEach(btn => {
            if (btn.dataset.color === '') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        selectedColor = '';
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

// Show task details in modal
function showTaskDetails(task) {
    // Set modal title
    document.getElementById('modal-task-title').textContent = task.text;
    
    // Set dates
    const createdDate = new Date(task.createdAt);
    const formattedCreatedDate = new Intl.DateTimeFormat('cs-CZ', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(createdDate);
    
    document.querySelector('#modal-date-created span').textContent = formattedCreatedDate;
    
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const formattedDueDate = new Intl.DateTimeFormat('cs-CZ', { 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        }).format(dueDate);
        
        document.querySelector('#modal-date-due span').textContent = formattedDueDate;
        document.getElementById('modal-date-due').classList.remove('hidden');
    } else {
        document.getElementById('modal-date-due').classList.add('hidden');
    }
    
    if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const formattedCompletedDate = new Intl.DateTimeFormat('cs-CZ', { 
            day: 'numeric', 
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(completedDate);
        
        document.querySelector('#modal-date-completed span').textContent = formattedCompletedDate;
        document.getElementById('modal-date-completed').classList.remove('hidden');
    } else {
        document.getElementById('modal-date-completed').classList.add('hidden');
    }
    
    // Set task detail
    if (task.detail) {
        document.getElementById('modal-detail-text').textContent = task.detail;
        document.getElementById('modal-task-detail').classList.remove('hidden');
    } else {
        document.getElementById('modal-detail-text').textContent = 'Žádný detail...';
        document.getElementById('modal-task-detail').classList.remove('hidden');
    }
    
    // Show modal
    modal.classList.add('show');
}

// Close modal
function closeModal() {
    modal.classList.remove('show');
}

// Toggle dark/light theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    // Save theme preference
    const isDarkTheme = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDarkTheme);
    
    // Update theme button text
    themeToggleBtn.textContent = isDarkTheme ? '☀️' : '🌙';
}

// Add new category
function addCategory() {
    const categoryName = newCategoryInput.value.trim();
    
    if (categoryName !== '' && categoryName.toLowerCase() !== 'hotove') {
        // Create slug version of the category name (for data-category attribute)
        const categorySlug = categoryName.toLowerCase()
            .replace(/[^\w\s]/gi, '')  // Remove special characters
            .replace(/\s+/g, '_');     // Replace spaces with underscores
        
        // Check if category already exists
        if (todoList[categorySlug] || categorySlug === 'hotove') {
            alert('Tato kategorie již existuje!');
            return;
        }
        
        // Add to data structure
        todoList[categorySlug] = [];
        todoList.hotove[categorySlug] = [];
        
        // Add to UI
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" class="category-link" data-category="${categorySlug}">${categoryName}</a>`;
        
        // Insert before the "Hotové úkoly" category
        const completedCategoryLi = Array.from(categoryList.querySelectorAll('li')).find(
            li => li.querySelector('.category-link').dataset.category === 'hotove'
        );
        
        categoryList.insertBefore(li, completedCategoryLi);
        
        // Add to completed categories
        const completedBtn = document.createElement('button');
        completedBtn.className = 'completed-category-btn';
        completedBtn.setAttribute('data-category', categorySlug);
        completedBtn.textContent = categoryName;
        
        document.querySelector('.completed-categories').appendChild(completedBtn);
        
        // Add event listener
        li.querySelector('.category-link').addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // Remove active class from all links
            document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Update active category and display tasks
            activeCategory = category;
            activeCategoryTasks.classList.remove('hidden');
            completedSubcategories.classList.add('hidden');
            displayTasks(category);
        });
        
        // Add event listener to completed category button
        completedBtn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Remove active class from all buttons
            document.querySelectorAll('.completed-category-btn').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update active completed category and display tasks
            activeCompletedCategory = category;
            displayCompletedTasks(category);
        });
        
        // Save changes
        saveTasksToStorage();
        newCategoryInput.value = '';
    }
}

// Remove current category
function removeCategory() {
    if (activeCategory === 'hotove') {
        alert('Nelze odstranit kategorii "Hotové úkoly"!');
        return;
    }
    
    if (confirm(`Opravdu chcete odstranit kategorii "${activeCategory}"? Všechny úkoly budou smazány.`)) {
        // Remove from data structure
        delete todoList[activeCategory];
        delete todoList.hotove[activeCategory];
        
        // Remove from UI
        const categoryLi = Array.from(categoryList.querySelectorAll('li')).find(
            li => li.querySelector('.category-link').dataset.category === activeCategory
        );
        
        if (categoryLi) {
            categoryList.removeChild(categoryLi);
        }
        
        // Remove from completed categories
        const completedBtn = Array.from(document.querySelectorAll('.completed-category-btn')).find(
            btn => btn.dataset.category === activeCategory
        );
        
        if (completedBtn) {
            completedBtn.parentNode.removeChild(completedBtn);
        }
        
        // Switch to first category
        const firstCategory = document.querySelector('.category-link').dataset.category;
        document.querySelector('.category-link').classList.add('active');
        activeCategory = firstCategory;
        activeCategoryTasks.classList.remove('hidden');
        completedSubcategories.classList.add('hidden');
        displayTasks(firstCategory);
        
        // Save changes
        saveTasksToStorage();
    }
}

// Setup additional event listeners
function setupAdditionalEventListeners() {
    // Close modal when clicking close button or outside the modal
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Category management
    addCategoryBtn.addEventListener('click', addCategory);
    removeCategoryBtn.addEventListener('click', removeCategory);
    
    // Color selector
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            colorBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update selected color
            selectedColor = btn.dataset.color;
        });
    });
    
    // Add category on Enter key press
    newCategoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCategory();
        }
    });
}

// Apply saved theme
function applyTheme() {
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeToggleBtn.textContent = '☀️';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
    setupAdditionalEventListeners();
    applyTheme();
});