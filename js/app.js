// Task data structure
const todoList = {
    prioritni: [],
    prace: [],
    zabava: [],
    hotove: {
        prioritni: [],
        prace: [],
        zabava: []
    },
    archiv: {}, // Archiv smazaných kategorií
    categoryOrder: ['prioritni', 'prace', 'zabava'] // Pořadí kategorií
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
    '#FF6B6B', '#FF8787', '#FFA8A8', '#FFB8B8', // červené
    '#74C0FC', '#A5D8FF', '#C5F6FA', '#66D9E8', // modré
    '#8CE99A', '#69DB7C', '#51CF66', '#40C057', // zelené
    '#FFD43B', '#FCC419', '#FAB005', '#F59F00', // žluté
    '#CED4DA', '#ADB5BD', '#D0BFFF', '#B197FC'  // šedé a fialové
];

// Aktivní barvy pro úkoly (5 barev, poslední vždy prázdná)
const taskColors = [
    '#ff6b6b', '#74c0fc', '#8ce99a', '#ffd43b', ''
];

// Aktuálně editovaná pozice barvy (1-5)
let editingColorPosition = 0;

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
        
        // Ensure critical properties exist
        if (!parsedTasks.archiv) {
            parsedTasks.archiv = {};
        }
        
        if (!parsedTasks.categoryOrder || !Array.isArray(parsedTasks.categoryOrder)) {
            parsedTasks.categoryOrder = ['prioritni', 'prace', 'zabava'];
        }
        
        Object.assign(todoList, parsedTasks);
    }
    
    // Ensure interval settings are loaded
    const archiveDays = localStorage.getItem('archiveDays');
    if (archiveDays) {
        const daysElement = document.getElementById('archive-days');
        if (daysElement) {
            daysElement.value = archiveDays;
        }
    }
    
    const deleteDays = localStorage.getItem('deleteDays');
    if (deleteDays) {
        const deleteDaysElement = document.getElementById('delete-days');
        if (deleteDaysElement) {
            deleteDaysElement.value = deleteDays;
        }
    }
    
    const archiveEnabled = localStorage.getItem('archiveEnabled');
    if (archiveEnabled !== null) {
        const enabledElement = document.getElementById('archive-enabled');
        if (enabledElement) {
            enabledElement.checked = archiveEnabled === 'true';
        }
    }
}

// Save tasks to localStorage
function saveTasksToStorage() {
    localStorage.setItem('todoList', JSON.stringify(todoList));
    
    // Save archiving settings
    const daysElement = document.getElementById('archive-days');
    if (daysElement) {
        localStorage.setItem('archiveDays', daysElement.value);
    }
    
    const deleteDaysElement = document.getElementById('delete-days');
    if (deleteDaysElement) {
        localStorage.setItem('deleteDays', deleteDaysElement.value);
    }
    
    const archiveEnabledElement = document.getElementById('archive-enabled');
    if (archiveEnabledElement) {
        localStorage.setItem('archiveEnabled', archiveEnabledElement.checked);
    }
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
            
            // Proměnná pro div s barvou kolem checkboxu
            let colorDivHTML = '';
            
            // Přidat barvu pouze kolem checkboxu
            if (task.color) {
                colorDivHTML = `<div class="task-checkbox-color" style="background-color: ${task.color}"></div>`;
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
                <div class="checkbox-container">
                    ${colorDivHTML}
                    <input type="checkbox" class="task-checkbox">
                </div>
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
            
            // Proměnná pro div s barvou kolem checkboxu
            let colorDivHTML = '';
            
            // Přidat barvu pouze kolem checkboxu
            if (task.color) {
                colorDivHTML = `<div class="task-checkbox-color" style="background-color: ${task.color}"></div>`;
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
                <div class="checkbox-container">
                    ${colorDivHTML}
                    <input type="checkbox" class="task-checkbox" checked>
                </div>
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
    // Aktualizace náhledu barvy a čísla pozice
    document.getElementById('position-number').textContent = editingColorPosition + 1;
    const selectedPositionColor = document.querySelector('.selected-position-color');
    selectedPositionColor.style.backgroundColor = taskColors[editingColorPosition] || 'transparent';
    
    // Aktivuj aktuální tlačítko pozice
    document.querySelectorAll('.color-position').forEach((btn, index) => {
        if (index === editingColorPosition) {
            btn.classList.add('active');
            btn.style.backgroundColor = taskColors[editingColorPosition] || 'transparent';
        } else {
            btn.classList.remove('active');
            btn.style.backgroundColor = taskColors[index] || 'transparent';
        }
    });
    
    // Aktualizace palety barev
    colorPalette.innerHTML = '';
    
    colorPalettes.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'palette-color';
        colorBtn.style.backgroundColor = color;
        
        // Zvýrazni, pokud je to aktuální barva pro vybranou pozici
        if (taskColors[editingColorPosition] && taskColors[editingColorPosition].toLowerCase() === color.toLowerCase()) {
            colorBtn.classList.add('selected');
        }
        
        colorBtn.addEventListener('click', () => {
            setColorForPosition(color);
        });
        
        colorPalette.appendChild(colorBtn);
    });
    
    // Přidej tlačítko pro "žádná barva"
    const noColorBtn = document.createElement('button');
    noColorBtn.className = 'palette-color';
    noColorBtn.style.backgroundColor = 'transparent';
    noColorBtn.style.border = '1px dashed ' + getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    
    if (!taskColors[editingColorPosition]) {
        noColorBtn.classList.add('selected');
    }
    
    noColorBtn.addEventListener('click', () => {
        setColorForPosition('');
    });
    
    colorPalette.appendChild(noColorBtn);
}

// Nastavení barvy pro konkrétní pozici
function setColorForPosition(color) {
    // Poslední pozice je vždy prázdná
    if (editingColorPosition === 4) {
        return;
    }
    
    const lowerColor = color.toLowerCase();
    
    // Nastav barvu na danou pozici
    taskColors[editingColorPosition] = lowerColor;
    
    // Vždy zajisti, že poslední barva je prázdná
    taskColors[4] = '';
    
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

// Funkce pro získání zobrazovaného názvu kategorie
function getCategoryDisplayName(categorySlug) {
    // Mapování výchozích kategorií
    const categoryMapping = {
        'prioritni': 'Prioritní',
        'prace': 'Práce',
        'zabava': 'Zábava',
        'hotove': 'Hotové úkoly'
    };
    
    // Pokud je to výchozí kategorie, použijeme mapování
    if (categoryMapping[categorySlug]) {
        return categoryMapping[categorySlug];
    }
    
    // Pokud je to uživatelská kategorie, prvním písmeno velké
    return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
        .replace(/_/g, ' '); // Nahradit podtržítka mezerami
}

// Update categories list in settings modal
function updateSettingsCategoryList() {
    settingsCategoryList.innerHTML = '';
    
    Object.keys(todoList).forEach(category => {
        if (category !== 'hotove') {
            const li = document.createElement('li');
            li.className = 'settings-category-item';
            li.draggable = true;
            li.dataset.category = category;
            
            // Získej zobrazované jméno kategorie
            const displayName = getCategoryDisplayName(category);
            
            li.innerHTML = `
                <div class="drag-handle">&#8942;</div>
                <span>${displayName}</span>
                <button class="category-delete-btn" data-category="${category}">&times;</button>
            `;
            
            // Add event listener to delete button
            const deleteBtn = li.querySelector('.category-delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (category === 'hotove') {
                    alert('Nelze odstranit kategorii "Hotové úkoly"!');
                    return;
                }
                
                if (confirm(`Opravdu chcete odstranit kategorii "${displayName}"? Všechny úkoly budou přesunuty do archivu.`)) {
                    removeCategory(category);
                    updateSettingsCategoryList();
                }
            });
            
            // Přidání event listenerů pro drag and drop
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('dragenter', handleDragEnter);
            li.addEventListener('dragleave', handleDragLeave);
            li.addEventListener('drop', handleDrop);
            li.addEventListener('dragend', handleDragEnd);
            
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
        
        // Add to category order (before "hotove")
        todoList.categoryOrder.push(categorySlug);
        
        // Add to completed categories
        const completedBtn = document.createElement('button');
        completedBtn.className = 'completed-category-btn';
        completedBtn.setAttribute('data-category', categorySlug);
        completedBtn.textContent = categoryName;
        
        document.querySelector('.completed-categories').appendChild(completedBtn);
        
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
        
        // Update the UI with the new category
        updateCategoryList();
        
        // Save changes
        saveTasksToStorage();
        newCategoryInput.value = '';
        
        // Aktualizace seznamu kategorií v nastavení
        if (settingsModal.classList.contains('show')) {
            updateSettingsCategoryList();
        }
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
    
    // Move to archive before deleting
    moveToArchive(category);
    
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
    
    // Remove from category order
    const categoryIndex = todoList.categoryOrder.indexOf(category);
    if (categoryIndex !== -1) {
        todoList.categoryOrder.splice(categoryIndex, 1);
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

// Move category to archive
function moveToArchive(category) {
    // Skip if it's the "hotove" category which can't be deleted
    if (category === 'hotove') {
        return;
    }
    
    // Create archive entry if it doesn't exist
    if (!todoList.archiv[category]) {
        todoList.archiv[category] = {
            tasks: [],
            displayName: getCategoryDisplayName(category),
            archivedDate: new Date().toISOString()
        };
    }
    
    // Move active tasks to archive
    if (todoList[category] && todoList[category].length > 0) {
        todoList.archiv[category].tasks = todoList.archiv[category].tasks.concat(todoList[category]);
    }
    
    // Move completed tasks to archive
    if (todoList.hotove[category] && todoList.hotove[category].length > 0) {
        todoList.archiv[category].tasks = todoList.archiv[category].tasks.concat(todoList.hotove[category]);
    }
    
    // Remove from data structure
    delete todoList[category];
    delete todoList.hotove[category];
    
    // Update archive UI if visible
    updateArchivedCategories();
}

// Archive completed tasks based on date
function archiveCompletedTasks() {
    // Check if archiving is enabled
    const archiveEnabled = document.getElementById('archive-enabled').checked;
    if (!archiveEnabled) {
        alert('Automatická archivace je vypnuta. Zapněte ji v nastavení.');
        return;
    }
    
    const archiveDays = parseInt(document.getElementById('archive-days').value) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - archiveDays);
    
    let archivedCount = 0;
    
    // Go through all categories with completed tasks
    Object.keys(todoList.hotove).forEach(category => {
        // Skip "hotove" itself
        if (category === 'hotove') return;
        
        const tasksToKeep = [];
        const tasksToArchive = [];
        
        // Check each task's completion date
        todoList.hotove[category].forEach(task => {
            if (task.completedAt) {
                const completedDate = new Date(task.completedAt);
                if (completedDate < cutoffDate) {
                    tasksToArchive.push(task);
                    archivedCount++;
                } else {
                    tasksToKeep.push(task);
                }
            } else {
                tasksToKeep.push(task);
            }
        });
        
        // If we have tasks to archive
        if (tasksToArchive.length > 0) {
            // Create special "archived_completed" category if it doesn't exist
            if (!todoList.archiv[category]) {
                todoList.archiv[category] = {
                    tasks: [],
                    displayName: getCategoryDisplayName(category),
                    archivedDate: new Date().toISOString()
                };
            }
            
            // Add tasks to archive
            todoList.archiv[category].tasks = todoList.archiv[category].tasks.concat(tasksToArchive);
            
            // Update the completed tasks
            todoList.hotove[category] = tasksToKeep;
        }
    });
    
    // Update UI and save
    if (archivedCount > 0) {
        alert(`Archivováno ${archivedCount} úkolů starších než ${archiveDays} dnů.`);
        displayCompletedTasks(activeCompletedCategory);
        updateArchivedCategories();
        saveTasksToStorage();
    } else {
        alert(`Žádné úkoly starší než ${archiveDays} dnů nebyly nalezeny.`);
    }
}

// Delete old tasks from the archive
function deleteOldFromArchive() {
    const deleteDays = parseInt(document.getElementById('delete-days').value) || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - deleteDays);
    
    let deletedCount = 0;
    
    // Go through all archived categories
    Object.keys(todoList.archiv).forEach(category => {
        const tasksToKeep = [];
        
        // Check each task's archive or completion date
        todoList.archiv[category].tasks.forEach(task => {
            const dateToCheck = task.completedAt ? new Date(task.completedAt) : 
                               (task.archivedDate ? new Date(task.archivedDate) : new Date());
                               
            if (dateToCheck < cutoffDate) {
                deletedCount++;
            } else {
                tasksToKeep.push(task);
            }
        });
        
        // Update the tasks
        todoList.archiv[category].tasks = tasksToKeep;
        
        // If no tasks left, remove the category from archive
        if (tasksToKeep.length === 0) {
            delete todoList.archiv[category];
        }
    });
    
    // Update UI and save
    if (deletedCount > 0) {
        alert(`Trvale smazáno ${deletedCount} úkolů starších než ${deleteDays} dnů z archivu.`);
        updateArchivedCategories();
        
        // If archive is visible, refresh it
        const activeArchivedCategory = document.querySelector('.archived-category-btn.active');
        if (activeArchivedCategory) {
            displayArchivedTasks(activeArchivedCategory.dataset.category);
        }
        
        saveTasksToStorage();
    } else {
        alert(`Žádné úkoly starší než ${deleteDays} dnů nebyly nalezeny v archivu.`);
    }
}

// Update the archived categories UI
function updateArchivedCategories() {
    const archivedCategoriesContainer = document.querySelector('.archived-categories');
    if (!archivedCategoriesContainer) return;
    
    archivedCategoriesContainer.innerHTML = '';
    
    // Add buttons for each archived category
    Object.keys(todoList.archiv).forEach(category => {
        const categoryData = todoList.archiv[category];
        const button = document.createElement('button');
        button.className = 'archived-category-btn';
        button.dataset.category = category;
        button.textContent = categoryData.displayName;
        
        // Přidat tlačítko pro mazání
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'archived-category-wrapper';
        
        // Vytvořit tlačítko pro mazání
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'archived-category-delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Smazat kategorii z archivu';
        
        // Přidat event listener
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Aby se neaktivovala kategorie
            
            if (confirm(`Opravdu chcete trvale smazat archivovanou kategorii "${categoryData.displayName}" a všechny její úkoly?`)) {
                delete todoList.archiv[category];
                updateArchivedCategories();
                saveTasksToStorage();
            }
        });
        
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.archived-category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Display archived tasks
            displayArchivedTasks(category);
        });
        
        buttonWrapper.appendChild(button);
        buttonWrapper.appendChild(deleteBtn);
        
        archivedCategoriesContainer.appendChild(buttonWrapper);
    });
    
    // Show/hide archive section based on whether there are archived categories
    const archiveSection = document.querySelector('.archive-section');
    if (archiveSection) {
        archiveSection.style.display = Object.keys(todoList.archiv).length > 0 ? 'block' : 'none';
    }
}

// Display tasks from the archive
function displayArchivedTasks(category) {
    const archivedTaskList = document.getElementById('archived-task-list');
    if (!archivedTaskList) return;
    
    archivedTaskList.innerHTML = '';
    
    if (todoList.archiv[category] && todoList.archiv[category].tasks.length > 0) {
        const tasks = todoList.archiv[category].tasks;
        
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            
            // Proměnná pro div s barvou kolem checkboxu
            let colorDivHTML = '';
            
            // Přidat barvu pouze kolem checkboxu
            if (task.color) {
                colorDivHTML = `<div class="task-checkbox-color" style="background-color: ${task.color}"></div>`;
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
            
            // Format completion date if it exists
            let completionHTML = '';
            if (task.completedAt) {
                const completedDate = new Date(task.completedAt);
                const formattedCompletionDate = new Intl.DateTimeFormat('cs-CZ', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                }).format(completedDate);
                
                completionHTML = `<div class="task-due-date">Dokončeno: ${formattedCompletionDate}</div>`;
            }
            
            // Format task detail as inline snippet if it exists
            let detailHTML = '';
            if (task.detail) {
                const shortDetail = task.detail.length > 80 ? task.detail.substring(0, 80) + '...' : task.detail;
                detailHTML = `<div class="task-inline-detail">${shortDetail}</div>`;
            }
            
            const taskTextClass = task.completedAt ? 'task-text completed' : 'task-text';
            
            li.innerHTML = `
                <div class="checkbox-container">
                    ${colorDivHTML}
                    <input type="checkbox" class="task-checkbox" ${task.completedAt ? 'checked' : ''} disabled>
                </div>
                <div class="task-content">
                    <div class="${taskTextClass}">${task.text}</div>
                    ${dueDateHTML}
                    ${completionHTML}
                    ${detailHTML}
                </div>
                <button class="delete-btn">✕</button>
            `;
            
            // Add event listener to permanently delete the task
            li.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm('Opravdu chcete trvale odstranit tento úkol z archivu?')) {
                    todoList.archiv[category].tasks.splice(index, 1);
                    
                    // If this was the last task, remove the category from archive
                    if (todoList.archiv[category].tasks.length === 0) {
                        delete todoList.archiv[category];
                        updateArchivedCategories();
                    } else {
                        displayArchivedTasks(category);
                    }
                    
                    saveTasksToStorage();
                }
            });
            
            // Add event listener to show task details
            li.querySelector('.task-content').addEventListener('click', () => {
                showTaskDetails(task);
            });
            
            archivedTaskList.appendChild(li);
        });
    }
}

// Variables for drag and drop operation
let draggedItem = null;

// Drag and Drop handlers
function handleDragStart(e) {
    this.classList.add('dragging');
    draggedItem = this;
    
    // Set data for drag operation
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    
    // Don't do anything if dropping on the same item
    if (draggedItem !== this) {
        // Get the category names
        const fromCategory = draggedItem.dataset.category;
        const toCategory = this.dataset.category;
        
        // Get all category items in current order
        const categoryItems = Array.from(document.querySelectorAll('.settings-category-item'));
        const fromIdx = categoryItems.indexOf(draggedItem);
        const toIdx = categoryItems.indexOf(this);
        
        // Reorder UI elements first
        const parent = draggedItem.parentNode;
        
        if (fromIdx < toIdx) {
            // Moving down
            parent.insertBefore(draggedItem, this.nextSibling);
        } else {
            // Moving up
            parent.insertBefore(draggedItem, this);
        }
        
        // Now update the order in data structure
        // Get updated order after DOM changes
        const newOrder = Array.from(document.querySelectorAll('.settings-category-item'))
            .map(item => item.dataset.category);
            
        // Filter out undefined/null and remove 'hotove' if present
        todoList.categoryOrder = newOrder.filter(cat => cat && cat !== 'hotove');
        
        // Update the category list in the main UI
        updateCategoryList();
        
        // Save the updated order
        saveTasksToStorage();
    }
    
    this.classList.remove('drag-over');
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Clear all drag-over classes
    document.querySelectorAll('.settings-category-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

// Update the category list in main UI to reflect the new order
function updateCategoryList() {
    // Clear existing list items except the "Hotové úkoly"
    const completedCategoryLi = Array.from(categoryList.querySelectorAll('li')).find(
        li => li.querySelector('.category-link').dataset.category === 'hotove'
    );
    
    categoryList.innerHTML = '';
    
    // Add categories in the correct order
    todoList.categoryOrder.forEach(category => {
        const displayName = getCategoryDisplayName(category);
        
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" class="category-link" data-category="${category}">${displayName}</a>`;
        
        // Set active class if this is the current category
        if (category === activeCategory) {
            li.querySelector('.category-link').classList.add('active');
        }
        
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
        
        categoryList.appendChild(li);
    });
    
    // Add back the "Hotové úkoly" category at the end
    if (completedCategoryLi) {
        categoryList.appendChild(completedCategoryLi);
    }
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
    
    // Color position buttons
    document.querySelectorAll('.color-position').forEach(btn => {
        btn.addEventListener('click', () => {
            editingColorPosition = parseInt(btn.dataset.position);
            updateColorPalette();
        });
    });
    
    // Archive toggle
    const archiveToggle = document.querySelector('.archive-toggle');
    if (archiveToggle) {
        archiveToggle.addEventListener('click', () => {
            const archiveContent = document.querySelector('.archive-content');
            archiveToggle.classList.toggle('open');
            archiveContent.classList.toggle('hidden');
        });
    }
    
    // Archive now button
    const archiveNowBtn = document.getElementById('archive-now-btn');
    if (archiveNowBtn) {
        archiveNowBtn.addEventListener('click', archiveCompletedTasks);
    }
    
    // Delete from archive button
    const deleteArchivedBtn = document.getElementById('delete-archived-btn');
    if (deleteArchivedBtn) {
        deleteArchivedBtn.addEventListener('click', deleteOldFromArchive);
    }
    
    // Archive enabled checkbox
    const archiveEnabledCheckbox = document.getElementById('archive-enabled');
    if (archiveEnabledCheckbox) {
        archiveEnabledCheckbox.addEventListener('change', () => {
            saveTasksToStorage();
        });
    }
    
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
    
    // Update the category list based on order
    updateCategoryList();
    
    // Initialize the archive
    updateArchivedCategories();
    
    // Save to ensure proper structure
    saveTasksToStorage();
});