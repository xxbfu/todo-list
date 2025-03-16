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
const themeToggleBtn = document.getElementById('theme-toggle');
const settingsToggleBtn = document.getElementById('settings-toggle');
const colorBtns = document.querySelectorAll('.color-btn');
const taskDetailModal = document.getElementById('task-detail-modal');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const settingsCategoryList = document.getElementById('settings-category-list');
const colorPalette = document.querySelector('.color-palette');

// Current active category
let activeCategory = 'prioritni';
let activeCompletedCategory = 'prioritni';
let selectedColor = '';

// Definice 20 barev pro paletu
const colorPalettes = [
    '#FFCCCB', '#FFB6C1', '#FFC0CB', '#FF69B4', // růžové
    '#ADD8E6', '#87CEEB', '#87CEFA', '#00BFFF', // modré
    '#98FB98', '#90EE90', '#8FBC8F', '#3CB371', // zelené
    '#FFFACD', '#FAFAD2', '#FFFFE0', '#F0E68C', // žluté
    '#E6E6FA', '#D8BFD8', '#DDA0DD', '#DA70D6'  // fialové
];

// Aktivní barvy pro úkoly (5 barev)
const taskColors = [
    '#ffcccb', '#c1e1c1', '#c4c3d0', '#add8e6', ''
];

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
            
            // Format task detail as inline snippet if it exists
            let detailHTML = '';
            if (task.detail) {
                const shortDetail = task.detail.length > 80 ? task.detail.substring(0, 80) + '...' : task.detail;
                detailHTML = `<div class="task-inline-detail">${shortDetail}</div>`;
            }
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox">
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    ${dueDateHTML}
                    ${detailHTML}
                </div>
                <button class="delete-btn">✕</button>
            `;
            
            // Add event listener for checkbox to mark task as completed
            li.querySelector('.task-checkbox').addEventListener('change', (e) => {
                if (e.target.checked) {
                    completeTask(category, index);
                }
            });
            
            // Add event listener to show task details on click
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
            
            // Format task detail as inline snippet if it exists
            let detailHTML = '';
            if (task.detail) {
                const shortDetail = task.detail.length > 80 ? task.detail.substring(0, 80) + '...' : task.detail;
                detailHTML = `<div class="task-inline-detail">${shortDetail}</div>`;
            }
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" checked>
                <div class="task-content">
                    <div class="task-text completed">${task.text}</div>
                    ${dueDateHTML}
                    <div class="task-due-date">Dokončeno: ${formattedCompletionDate}</div>
                    ${detailHTML}
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
            
            // Add event listener to restore task when checkbox is unchecked
            li.querySelector('.task-checkbox').addEventListener('change', (e) => {
                if (!e.target.checked) {
                    restoreTask(category, index);
                }
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
        document.getElementById('modal-detail-text').textContent = '';
        document.getElementById('modal-task-detail').classList.add('hidden');
    }
    
    // Show modal
    taskDetailModal.classList.add('show');
}

// Show settings modal
function showSettingsModal() {
    // Populate category list in settings
    updateSettingsCategoryList();
    
    // Populate color palette
    updateColorPalette();
    
    // Show modal
    settingsModal.classList.add('show');
}

// Update color palette in settings
function updateColorPalette() {
    colorPalette.innerHTML = '';
    
    colorPalettes.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'palette-color';
        colorBtn.style.backgroundColor = color;
        
        // Check if this color is one of active task colors
        if (taskColors.includes(color.toLowerCase())) {
            colorBtn.classList.add('selected');
        }
        
        colorBtn.addEventListener('click', () => {
            toggleTaskColor(color);
        });
        
        colorPalette.appendChild(colorBtn);
    });
}

// Toggle a color in task colors
function toggleTaskColor(color) {
    const lowerColor = color.toLowerCase();
    
    // Check if already in task colors
    const index = taskColors.indexOf(lowerColor);
    
    // If color is active and we have more than 1 color, remove it
    if (index !== -1 && taskColors.length > 1) {
        taskColors.splice(index, 1);
    } 
    // If color is not active and we have less than 5 colors, add it
    else if (index === -1 && taskColors.length < 5) {
        taskColors.push(lowerColor);
    }
    
    // Update color selectors in main view
    updateColorSelectors();
    
    // Update palette in settings
    updateColorPalette();
    
    // Save color preferences
    localStorage.setItem('taskColors', JSON.stringify(taskColors));
}

// Update color selectors in main view
function updateColorSelectors() {
    const colorSelector = document.querySelector('.color-selector');
    colorSelector.innerHTML = '';
    
    taskColors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-btn';
        if (color === selectedColor) {
            btn.classList.add('active');
        }
        btn.dataset.color = color;
        btn.style.backgroundColor = color || '#f5f5f5';
        
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update selected color
            selectedColor = btn.dataset.color;
        });
        
        colorSelector.appendChild(btn);
    });
}

// Update categories list in settings modal
function updateSettingsCategoryList() {
    settingsCategoryList.innerHTML = '';
    
    Object.keys(todoList).forEach(category => {
        if (category !== 'hotove') {
            const li = document.createElement('li');
            li.className = 'settings-category-item';
            
            // Get display name (first character uppercase)
            const displayName = category.charAt(0).toUpperCase() + category.slice(1);
            
            li.innerHTML = `
                <span>${displayName}</span>
                <button class="category-delete-btn" data-category="${category}">&times;</button>
            `;
            
            // Add event listener to delete button
            const deleteBtn = li.querySelector('.category-delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (category === 'prioritni' || category === 'prace' || category === 'zabava') {
                    alert('Nelze odstranit výchozí kategorie!');
                    return;
                }
                
                if (confirm(`Opravdu chcete odstranit kategorii "${displayName}"? Všechny úkoly budou smazány.`)) {
                    removeCategory(category);
                    updateSettingsCategoryList();
                }
            });
            
            settingsCategoryList.appendChild(li);
        }
    });
}

// Close any open modal
function closeModal() {
    taskDetailModal.classList.remove('show');
    settingsModal.classList.remove('show');
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

// Remove specified category
function removeCategory(category) {
    if (category === 'hotove') {
        alert('Nelze odstranit kategorii "Hotové úkoly"!');
        return;
    }
    
    // Check if this is the currently active category
    const isActive = activeCategory === category;
    
    // Remove from data structure
    delete todoList[category];
    delete todoList.hotove[category];
    
    // Remove from UI
    const categoryLi = Array.from(categoryList.querySelectorAll('li')).find(
        li => li.querySelector('.category-link').dataset.category === category
    );
    
    if (categoryLi) {
        categoryList.removeChild(categoryLi);
    }
    
    // Remove from completed categories
    const completedBtn = Array.from(document.querySelectorAll('.completed-category-btn')).find(
        btn => btn.dataset.category === category
    );
    
    if (completedBtn) {
        completedBtn.parentNode.removeChild(completedBtn);
    }
    
    // If this was the active category, switch to first category
    if (isActive) {
        const firstCategory = document.querySelector('.category-link').dataset.category;
        document.querySelector('.category-link').classList.add('active');
        activeCategory = firstCategory;
        activeCategoryTasks.classList.remove('hidden');
        completedSubcategories.classList.add('hidden');
        displayTasks(firstCategory);
    }
    
    // Save changes
    saveTasksToStorage();
}

// Setup additional event listeners
function setupAdditionalEventListeners() {
    // Close modals when clicking close button or outside the modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === taskDetailModal || e.target === settingsModal) {
            closeModal();
        }
    });
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Settings toggle
    settingsToggleBtn.addEventListener('click', showSettingsModal);
    
    // Category management
    addCategoryBtn.addEventListener('click', addCategory);
    
    // Initial color selectors
    updateColorSelectors();
    
    // Add category on Enter key press
    newCategoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCategory();
        }
    });
}

// Load color preferences
function loadColorPreferences() {
    const savedColors = localStorage.getItem('taskColors');
    if (savedColors) {
        const parsedColors = JSON.parse(savedColors);
        if (Array.isArray(parsedColors) && parsedColors.length > 0) {
            // Only replace if valid colors were saved
            taskColors.length = 0;
            parsedColors.forEach(color => taskColors.push(color));
        }
    }
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
    // Load tasks and preferences
    loadColorPreferences();
    init();
    
    // Setup event listeners
    setupAdditionalEventListeners();
    applyTheme();
});