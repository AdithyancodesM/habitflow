// Global variables for charts
let performanceChartInstance = null;
let categoryChartInstance = null;

// Initialize Feather icons & event listeners
document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
    initCharts();
    setupGlobalEventListeners(); // Renamed for clarity
    setupNavigation();
    setupDarkMode();
    // Initialize state for initially loaded habit cards
    initializeCardStates(document.querySelectorAll('.habits-grid .habit-card'));
});

// --- Chart Initialization ---

function initCharts() {
    // Ensure container exists before initializing
    const perfChartContainer = document.getElementById('performanceChart');
    const catChartContainer = document.getElementById('categoryChart');

    if (perfChartContainer) initPerformanceChart(perfChartContainer);
    if (catChartContainer) initCategoryChart(catChartContainer);
}

function initPerformanceChart(canvasElement) {
    if (performanceChartInstance) {
        performanceChartInstance.destroy(); // Destroy previous instance if exists
    }
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e5e7eb' : '#6b7280';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'; // Lighter grid

    const ctx = canvasElement.getContext('2d');
    performanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLast30Days(),
            datasets: [{
                label: 'Completion Rate',
                data: generatePerformanceData(),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
                backgroundColor: isDarkMode ? 'rgba(129, 140, 248, 0.2)' : 'rgba(99, 102, 241, 0.1)', // Use CSS var
                tension: 0.4,
                fill: true,
                pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
                pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim(), // Match card bg
                pointHoverBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim(),
                pointHoverBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textColor }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: gridColor, drawBorder: false },
                    ticks: {
                        color: textColor,
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}

function initCategoryChart(canvasElement) {
    if (categoryChartInstance) {
        categoryChartInstance.destroy(); // Destroy previous instance
    }
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e5e7eb' : '#6b7280';

    const ctx = canvasElement.getContext('2d');
    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Health', 'Productivity', 'Education', 'Other'],
            datasets: [{
                data: [40, 30, 20, 10], // Example data
                backgroundColor: [ // Use CSS vars or appropriate colors
                    getComputedStyle(document.documentElement).getPropertyValue('--success').trim(),
                    getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
                    getComputedStyle(document.documentElement).getPropertyValue('--warning').trim(),
                    getComputedStyle(document.documentElement).getPropertyValue('--gray').trim()
                ],
                borderWidth: 2, // Add small border
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() // Match card bg
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, boxWidth: 12, padding: 20 }
                }
            },
            cutout: '70%'
        }
    });
}

// --- Chart Helpers ---

function getLast30Days() {
    const labels = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Format as short month and day (e.g., Apr 23)
        labels.push(date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    }
    return labels;
}

function generatePerformanceData() {
    const data = [];
    let value = 70 + (Math.random() * 10 - 5); // Start with slight variation
    for (let i = 0; i < 30; i++) {
        value = Math.max(50, Math.min(95, value + (Math.random() * 6 - 3))); // More realistic variation
        data.push(Math.round(value));
    }
    return data;
}

// --- Global Event Listeners Setup ---

function setupGlobalEventListeners() {
    // Modal: New Habit
    const modal = document.getElementById('habitModal');
    const newHabitBtn = document.getElementById('newHabitBtn');
    const closeModalBtns = modal.querySelectorAll('.modal-close, .cancel-modal-btn');
    const newHabitForm = document.getElementById('newHabitForm');

    if (newHabitBtn) {
        newHabitBtn.addEventListener('click', () => modal.classList.add('active'));
    }

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    if (newHabitForm) {
        newHabitForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            createNewHabit(newHabitForm);
        });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterHabits(btn.dataset.filter); // Use data-filter attribute
        });
    });

    // Advanced Filter Button (Placeholder)
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            showNotification('Advanced filtering options coming soon!', 'info');
        });
    }

    // *** Event Delegation for Habit Card Actions ***
    const habitsGrid = document.querySelector('.habits-grid');
    if (habitsGrid) {
        habitsGrid.addEventListener('click', (e) => {
            const target = e.target; // The element that was actually clicked

            // Find the closest matching button within the card actions
            const completeButton = target.closest('.complete-btn');
            const statsButton = target.closest('.stats-btn');
            const moreButton = target.closest('.more-btn');

            // Find the parent habit card
            const habitCard = target.closest('.habit-card');

            if (!habitCard) return; // Click was not inside a habit card

            if (completeButton) {
                markHabitComplete(habitCard);
            } else if (statsButton) {
                const habitTitle = habitCard.querySelector('.habit-title').textContent;
                showHabitStats(habitTitle);
            } else if (moreButton) {
                // Close any existing menus first
                const existingMenu = document.querySelector('.habit-options-menu');
                if (existingMenu) existingMenu.remove();
                showHabitOptions(habitCard, moreButton); // Pass the button for positioning
            }
        });
    } else {
        console.error("Habits grid element not found for event delegation.");
    }
}

// --- Navigation ---

function setupNavigation() {
    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const sectionsContainer = document.querySelector('.content-sections');

    // Create placeholder content sections if they don't exist
    createContentSections(sectionsContainer, menuItems);

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section; // Get section from data attribute

            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');

            // Show the corresponding content section
            showContentSection(sectionId);
        });
    });

    // Initially show dashboard
    showContentSection('dashboard');
}

function createContentSections(container, menuItems) {
    if (!container) return;
    const existingSections = new Set([...container.querySelectorAll('.content-section')].map(el => el.id));

    menuItems.forEach(item => {
        const sectionId = `${item.dataset.section}-section`;
        if (!existingSections.has(sectionId) && item.dataset.section !== 'dashboard') {
            const section = document.createElement('div');
            section.className = 'content-section';
            section.id = sectionId;
            const sectionName = item.textContent.trim();
            const icon = getSectionIcon(item.dataset.section);

            section.innerHTML = `
                <div class="header">
                    <h1 class="page-title">${sectionName}</h1>
                </div>
                <div style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
                    <i data-feather="${icon}" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1.5rem; display: block; margin-left: auto; margin-right: auto;"></i>
                    <h2 style="margin-bottom: 1rem; color: var(--text-main);">Welcome to ${sectionName}</h2>
                    <p style="max-width: 500px; margin: 0 auto;">
                        This feature is under development. Check back soon for updates!
                    </p>
                </div>
            `;
            container.appendChild(section);
        }
    });
    feather.replace(); // Update icons for newly added sections
}

function showContentSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const currentSection = document.getElementById(`${sectionName}-section`);
    if (currentSection) {
        currentSection.style.display = 'block';
        // Reinitialize charts if showing dashboard and charts exist
        if (sectionName === 'dashboard') {
            // Use setTimeout to ensure DOM is ready for chart rendering
            setTimeout(() => {
                const perfChart = document.getElementById('performanceChart');
                const catChart = document.getElementById('categoryChart');
                if (perfChart) initPerformanceChart(perfChart);
                if (catChart) initCategoryChart(catChart);
            }, 50); // Small delay
        }
    } else {
        console.warn(`Content section not found: ${sectionName}-section`);
        // Optionally show a default or error message
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) dashboardSection.style.display = 'block';
    }
}

function getSectionIcon(sectionName) {
    const icons = {
        'dashboard': 'grid',
        'my-habits': 'list',
        'calendar': 'calendar',
        'analytics': 'bar-chart-2',
        'achievements': 'award',
        'settings': 'settings'
    };
    return icons[sectionName] || 'alert-circle'; // Default icon
}

// --- Dark Mode ---

function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return; // Exit if toggle button not found

    // Apply initial theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        enableDarkMode(false); // Don't save again on initial load
    } else {
        disableDarkMode(false); // Don't save again on initial load
    }

    // Update icon on load
    updateDarkModeToggleIcon();

    // Add toggle listener
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Only change if no manual preference is set
            if (e.matches) {
                enableDarkMode(false);
            } else {
                disableDarkMode(false);
            }
            updateDarkModeToggleIcon();
        }
    });
}

function toggleDarkMode() {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
    updateDarkModeToggleIcon();
}

function enableDarkMode(save = true) {
    document.body.classList.add('dark-mode');
    if (save) localStorage.setItem('theme', 'dark');
    updateChartsForTheme(true); // Update charts
}

function disableDarkMode(save = true) {
    document.body.classList.remove('dark-mode');
    if (save) localStorage.setItem('theme', 'light');
    updateChartsForTheme(false); // Update charts
}

function updateDarkModeToggleIcon() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.innerHTML = ''; // Clear existing icon
    const iconName = isDarkMode ? 'sun' : 'moon';
    const icon = feather.icons[iconName].toSvg({ width: 18, height: 18 }); // Adjust size
    darkModeToggle.insertAdjacentHTML('beforeend', icon);
}

function updateChartsForTheme(isDark) {
    const textColor = isDark ? '#e5e7eb' : '#6b7280';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const cardBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim();
    const tooltipBgColor = isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)';

    // Update Performance Chart
    if (performanceChartInstance) {
        performanceChartInstance.options.scales.x.ticks.color = textColor;
        performanceChartInstance.options.scales.y.ticks.color = textColor;
        performanceChartInstance.options.scales.y.grid.color = gridColor;
        performanceChartInstance.options.plugins.tooltip.backgroundColor = tooltipBgColor;
        performanceChartInstance.options.plugins.tooltip.titleColor = textColor;
        performanceChartInstance.options.plugins.tooltip.bodyColor = textColor;
        performanceChartInstance.options.plugins.tooltip.borderColor = gridColor;
        // Update dataset colors
        performanceChartInstance.data.datasets[0].borderColor = primaryColor;
        performanceChartInstance.data.datasets[0].backgroundColor = isDark ? 'rgba(129, 140, 248, 0.2)' : 'rgba(99, 102, 241, 0.1)';
        performanceChartInstance.data.datasets[0].pointBackgroundColor = primaryColor;
        performanceChartInstance.data.datasets[0].pointBorderColor = cardBgColor;
        performanceChartInstance.data.datasets[0].pointHoverBackgroundColor = cardBgColor;
        performanceChartInstance.data.datasets[0].pointHoverBorderColor = primaryColor;

        performanceChartInstance.update();
    }

    // Update Category Chart
    if (categoryChartInstance) {
        categoryChartInstance.options.plugins.legend.labels.color = textColor;
        // Update dataset colors
        categoryChartInstance.data.datasets[0].backgroundColor = [
            getComputedStyle(document.documentElement).getPropertyValue('--success').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--warning').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--gray').trim()
        ];
        categoryChartInstance.data.datasets[0].borderColor = cardBgColor;

        categoryChartInstance.update();
    }

    // Re-initialize any active habit stats charts (if modal is open)
    const statsModal = document.getElementById('statsModal');
    if (statsModal && statsModal.classList.contains('active')) {
        const habitStatsChartCanvas = statsModal.querySelector('#habitStatsChart');
        const chartInstance = Chart.getChart(habitStatsChartCanvas); // Get chart instance by canvas
        if (chartInstance) {
            chartInstance.options.scales.x.ticks.color = textColor;
            chartInstance.options.scales.y.ticks.color = textColor;
            chartInstance.options.scales.y.grid.color = gridColor;
            chartInstance.options.plugins.legend.labels.color = textColor;
            chartInstance.data.datasets[0].backgroundColor = primaryColor; // Update bar color
            chartInstance.update();
        }
    }
}


// --- Habit Card Actions ---

// Initialize state for a collection of habit cards (e.g., set initial button appearance)
function initializeCardStates(cards) {
    if (!cards) return;
    const cardList = cards.nodeType ? [cards] : Array.from(cards); // Handle single card or NodeList/Array

    cardList.forEach(card => {
        updateCompleteButtonState(card);
        // Add other initial state updates if needed
    });
}

// Update complete button appearance based on card state
function updateCompleteButtonState(habitCard) {
    const completeBtn = habitCard.querySelector('.complete-btn');
    if (!completeBtn) return;

    const progressFill = habitCard.querySelector('.progress-fill');
    const isCompleted = habitCard.classList.contains('completed') || (progressFill && parseInt(progressFill.style.width) === 100);

    const iconElement = completeBtn.querySelector('i');
    const spanElement = completeBtn.querySelector('span');

    if (isCompleted) {
        habitCard.classList.add('completed'); // Ensure class is set
        iconElement.setAttribute('data-feather', 'check-circle');
        if (spanElement) spanElement.textContent = 'Completed';
        completeBtn.disabled = true; // Optionally disable
        completeBtn.style.cursor = 'default';
    } else {
        habitCard.classList.remove('completed');
        iconElement.setAttribute('data-feather', 'check');
        if (spanElement) spanElement.textContent = 'Complete';
        completeBtn.disabled = false;
        completeBtn.style.cursor = 'pointer';
    }
    feather.replace({ width: 16, height: 16 }); // Re-render the specific icon
}


// Show habit statistics modal
function showHabitStats(habitTitle) {
    // Remove existing stats modal if present
    const existingModal = document.getElementById('statsModal');
    if (existingModal) existingModal.remove();

    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e5e7eb' : '#6b7280';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();

    const statsModal = document.createElement('div');
    statsModal.className = 'modal'; // Start inactive
    statsModal.id = 'statsModal';

    // Simplified stats data for example
    const currentStreak = Math.floor(Math.random() * 15) + 1;
    const completionRate = Math.floor(Math.random() * 30) + 70;

    statsModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Stats: ${habitTitle}</h3>
                <button class="modal-close"><i data-feather="x"></i></button>
            </div>
            <div class="modal-body">
                <div style="height: 250px; margin-bottom: 2rem; position: relative;">
                    <canvas id="habitStatsChart"></canvas>
                </div>
                <div class="stats" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
                     <div class="stat-card" style="padding: 1rem;">
                        <div class="stat-header" style="margin-bottom: 0.5rem;">
                            <div class="stat-icon purple"><i data-feather="trending-up"></i></div>
                            <div class="stat-title">Current Streak</div>
                        </div>
                        <div class="stat-value" style="font-size: 1.5rem;">${currentStreak} days</div>
                    </div>
                    <div class="stat-card" style="padding: 1rem;">
                        <div class="stat-header" style="margin-bottom: 0.5rem;">
                            <div class="stat-icon green"><i data-feather="check-circle"></i></div>
                            <div class="stat-title">Completion Rate</div>
                        </div>
                        <div class="stat-value" style="font-size: 1.5rem;">${completionRate}%</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary close-stats-modal-btn">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(statsModal);
    feather.replace(); // Init icons

    // Get canvas and init chart
    const ctx = statsModal.querySelector('#habitStatsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Example labels
            datasets: [{
                label: 'Completions This Week', // Example label
                data: Array.from({length: 7}, () => Math.random() > 0.3 ? 1 : 0), // Random binary data
                backgroundColor: primaryColor,
                borderRadius: 4,
                barThickness: 20,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textColor }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor, drawBorder: false },
                    ticks: { color: textColor, stepSize: 1 } // Ensure integer steps if binary data
                }
            }
        }
    });

    // Add close functionality
    const closeBtns = statsModal.querySelectorAll('.modal-close, .close-stats-modal-btn');
    closeBtns.forEach(btn => {
        // Use a named function for removal if needed, otherwise anonymous is fine
        btn.addEventListener('click', () => statsModal.classList.remove('active'));
    });
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) statsModal.classList.remove('active');
    });

    // Use setTimeout to allow CSS to apply before adding 'active' class for transition
    setTimeout(() => statsModal.classList.add('active'), 10);
}

// Show habit options menu relative to the card's 'more' button
function showHabitOptions(habitCard, moreBtn) {
    // Remove any existing menu first (redundant check, but safe)
    const existingMenu = document.querySelector('.habit-options-menu');
    if (existingMenu) existingMenu.remove();

    const habitTitle = habitCard.querySelector('.habit-title').textContent;
    // moreBtn is passed directly from the event handler

    const optionsMenu = document.createElement('div');
    optionsMenu.className = 'habit-options-menu';

    optionsMenu.innerHTML = `
        <div class="options-list">
            <div class="option-item" data-action="edit">
                <i data-feather="edit-2"></i><span>Edit Habit</span>
            </div>
            <div class="option-item" data-action="skip">
                <i data-feather="skip-forward"></i><span>Skip Today</span>
            </div>
            <div class="option-item" data-action="duplicate">
                <i data-feather="copy"></i><span>Duplicate</span>
            </div>
            <div class="option-item" data-action="reminder">
                <i data-feather="bell"></i><span>Add Reminder</span>
            </div>
            <div class="option-item danger" data-action="delete">
                <i data-feather="trash-2"></i><span>Delete</span>
            </div>
        </div>
    `;

    // Position the menu
    document.body.appendChild(optionsMenu);
    feather.replace({ width: 16, height: 16 }); // Init icons

    const moreBtnRect = moreBtn.getBoundingClientRect();
    const menuRect = optionsMenu.getBoundingClientRect();

    // Position below and slightly aligned to the right edge of the button
    let top = moreBtnRect.bottom + window.scrollY + 5;
    let left = moreBtnRect.right + window.scrollX - menuRect.width;

    // Adjust if menu goes off-screen horizontally
    if (left < 10) { // Add some padding from the edge
         left = 10;
    } else if (left + menuRect.width > window.innerWidth - 10) {
         left = window.innerWidth - menuRect.width - 10;
    }

    // Adjust if menu goes off-screen vertically
    if (top + menuRect.height > window.innerHeight + window.scrollY - 10) {
        top = moreBtnRect.top + window.scrollY - menuRect.height - 5; // Position above if no space below
    }
    if (top < window.scrollY + 10) { // Ensure it doesn't go off the top
         top = window.scrollY + 10;
    }


    optionsMenu.style.position = 'absolute'; // Ensure absolute positioning
    optionsMenu.style.top = `${top}px`;
    optionsMenu.style.left = `${left}px`;


    // Add event listeners to options
    optionsMenu.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handleHabitAction(action, habitTitle, habitCard);
            // Remove menu after action
            if (document.body.contains(optionsMenu)) {
                optionsMenu.remove();
            }
        });
    });

    // Close menu when clicking outside
    function closeMenuOnClickOutside(event) {
        // Check if the click is outside the menu AND outside the button that opened it
        if (!optionsMenu.contains(event.target) && !moreBtn.contains(event.target)) {
            if (document.body.contains(optionsMenu)) {
                optionsMenu.remove();
            }
            // Clean up the listener
            document.removeEventListener('click', closeMenuOnClickOutside, true);
        }
    }

    // Use setTimeout to allow the current click event (that opened the menu) to finish
    // Attach listener in the capture phase to catch clicks anywhere
    setTimeout(() => {
        document.addEventListener('click', closeMenuOnClickOutside, true);
    }, 0);
}

// --- Habit CRUD and Actions ---

function handleHabitAction(action, habitTitle, habitCard) {
    switch(action) {
        case 'edit':
            showEditHabitModal(habitCard);
            break;
        case 'skip':
            showNotification(`"${habitTitle}" skipped for today`, 'info');
            // Add actual skip logic here (e.g., mark as skipped in data)
            break;
        case 'duplicate':
            duplicateHabit(habitCard);
            break;
        case 'reminder':
            showNotification(`Reminder feature for "${habitTitle}" coming soon!`, 'info');
            // Add reminder logic here
            break;
        case 'delete':
            deleteHabit(habitCard, habitTitle);
            break;
        default:
            console.warn(`Unknown habit action: ${action}`);
    }
}

// Show edit habit modal - Populates with existing card data
function showEditHabitModal(habitCard) {
    // Remove existing edit modal if present
    const existingModal = document.getElementById('editHabitModal');
    if (existingModal) existingModal.remove();

    const habitTitle = habitCard.querySelector('.habit-title').textContent;
    const description = habitCard.querySelector('.habit-description').textContent;
    const categorySpan = habitCard.querySelector('.habit-category');
    // Get category VALUE from data attribute for consistency
    const currentCategoryValue = habitCard.dataset.category || 'Other';

    const editModal = document.createElement('div');
    editModal.className = 'modal'; // Start inactive
    editModal.id = 'editHabitModal';

    editModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Edit Habit</h3>
                <button class="modal-close"><i data-feather="x"></i></button>
            </div>
             <form id="editHabitForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label" for="editHabitName">Habit Name</label>
                        <input type="text" id="editHabitName" class="form-input" value="${habitTitle}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="editHabitDescription">Description</label>
                        <input type="text" id="editHabitDescription" class="form-input" value="${description}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="editHabitCategory">Category</label>
                        <select id="editHabitCategory" class="form-select">
                            <option value="Health" ${currentCategoryValue === 'Health' ? 'selected' : ''}>Health & Fitness</option>
                            <option value="Productivity" ${currentCategoryValue === 'Productivity' ? 'selected' : ''}>Productivity</option>
                            <option value="Education" ${currentCategoryValue === 'Education' ? 'selected' : ''}>Education</option>
                            <option value="Personal" ${currentCategoryValue === 'Personal' ? 'selected' : ''}>Personal Development</option>
                            <option value="Other" ${currentCategoryValue === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="editHabitFrequency">Frequency</label>
                        <select id="editHabitFrequency" class="form-select">
                            <option>Daily</option>
                            <option>Weekdays</option>
                            <option>Weekends</option>
                            <option>Weekly</option>
                            <option>Custom</option>
                        </select>
                    </div>
                     <div class="form-group">
                        <label class="form-label" for="editHabitReminder">Reminder Time</label>
                        <input type="time" id="editHabitReminder" class="form-input" value="08:00"> </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline cancel-edit-modal-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(editModal);
    feather.replace();

    // Add close functionality
    const closeBtns = editModal.querySelectorAll('.modal-close, .cancel-edit-modal-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => editModal.classList.remove('active'));
    });
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) editModal.classList.remove('active');
    });

    // Handle form submission for saving changes
    const editForm = editModal.querySelector('#editHabitForm');
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTitle = editModal.querySelector('#editHabitName').value;
        const newDescription = editModal.querySelector('#editHabitDescription').value;
        const newCategoryValue = editModal.querySelector('#editHabitCategory').value; // e.g., "Health"
        const newCategoryText = editModal.querySelector('#editHabitCategory option:checked').textContent; // e.g., "Health & Fitness"


        if (newTitle.trim()) {
            // Update the original habit card
            habitCard.querySelector('.habit-title').textContent = newTitle;
            habitCard.querySelector('.habit-description').textContent = newDescription;

            // Update category display
            const categorySpan = habitCard.querySelector('.habit-category');
            const categoryClass = newCategoryValue.toLowerCase(); // e.g., "health"
            const progressColorClass = getProgressColorClass(newCategoryValue); // e.g., "green"

            if (categorySpan) {
                categorySpan.textContent = newCategoryText; // Display "Health & Fitness"
                categorySpan.className = `habit-category ${categoryClass}`; // Set class "health"
            }
            habitCard.dataset.category = newCategoryValue; // Update data attribute for filtering

            // Update progress bar color
            const progressFill = habitCard.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.className = `progress-fill ${progressColorClass}`;
            }

            showNotification('Habit updated successfully!');
            editModal.classList.remove('active'); // Close modal
        } else {
            // Simple alert for now, could be more sophisticated validation
            showNotification('Please enter a habit name.', 'error');
        }
    });

    // Show the modal with transition
    setTimeout(() => editModal.classList.add('active'), 10);
}


// Duplicate habit
function duplicateHabit(originalCard) {
    const title = originalCard.querySelector('.habit-title').textContent;
    const description = originalCard.querySelector('.habit-description').textContent;
    const category = originalCard.dataset.category || 'Other'; // Use data attribute

    // Create new habit card element
    const newHabitCard = createHabitCardElement(`${title} (Copy)`, description, category);

    // Insert the new card after the original one
    originalCard.parentNode.insertBefore(newHabitCard, originalCard.nextSibling);

    // *** No need to call setupHabitCardActions due to event delegation ***
    // Initialize the state of the new card (e.g., button appearance)
    initializeCardStates(newHabitCard);

    feather.replace(); // Initialize icons on the new card

    showNotification('Habit duplicated successfully!');
}

// Delete habit
function deleteHabit(habitCard, habitTitle) {
    // Ask for confirmation using a more robust method if available (e.g., custom modal)
    if (confirm(`Are you sure you want to delete "${habitTitle}"? This action cannot be undone.`)) {
        // Fade out and shrink animation
        habitCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease, margin-bottom 0.3s ease, padding 0.3s ease';
        habitCard.style.opacity = '0';
        habitCard.style.transform = 'scale(0.9)';
        habitCard.style.paddingTop = '0'; // Collapse padding
        habitCard.style.paddingBottom = '0';
        habitCard.style.marginBottom = `-${habitCard.offsetHeight}px`; // Collapse space

        // Remove after animation
        setTimeout(() => {
            habitCard.remove(); // Use remove() method
            showNotification('Habit deleted successfully', 'info');
        }, 300); // Match transition duration
    }
}

// Filter habits by category using data attribute
function filterHabits(categoryToShow) {
    const habitCards = document.querySelectorAll('.habits-grid .habit-card');

    habitCards.forEach(card => {
        const cardCategory = card.dataset.category; // Get category from data attribute

        if (categoryToShow === 'All' || cardCategory === categoryToShow) {
            card.style.display = 'flex'; // Use flex as it's a flex column now
        } else {
            card.style.display = 'none';
        }
    });
}

// Create HTML element for a new habit card
function createHabitCardElement(title, description, categoryValue) {
    const categoryTextMap = { // Map value back to display text
        "Health": "Health & Fitness",
        "Productivity": "Productivity",
        "Education": "Education",
        "Personal": "Personal Development",
        "Other": "Other"
    };
    const categoryText = categoryTextMap[categoryValue] || categoryValue;
    const categoryClass = categoryValue.toLowerCase();
    const progressColorClass = getProgressColorClass(categoryValue);
    const progress = 0; // New habits start at 0%

    const habitCard = document.createElement('div');
    habitCard.className = 'habit-card';
    habitCard.dataset.category = categoryValue; // Set data attribute

    habitCard.innerHTML = `
        <div class="habit-content">
            <div class="habit-header">
                <span class="habit-category ${categoryClass}">${categoryText}</span>
            </div>
            <h3 class="habit-title">${title}</h3>
            <p class="habit-description">${description || 'No description.'}</p> <div class="streak-calendar">
                </div>
            <div class="habit-progress">
                <div class="progress-text">
                    <span>Progress</span>
                    <span class="progress-percent">${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressColorClass}" style="width: ${progress}%"></div>
                </div>
            </div>
        </div>
        <div class="habit-actions">
             <button class="habit-action complete-btn">
                <i data-feather="check" size="16"></i>
                <span>Complete</span>
            </button>
            <button class="habit-action stats-btn">
                <i data-feather="bar-chart-2" size="16"></i>
                <span>Stats</span>
            </button>
            <button class="habit-action more-btn">
                <i data-feather="more-vertical" size="16"></i>
                <span>More</span>
            </button>
        </div>
    `;

    return habitCard;
}

// Get progress bar color class based on category value
function getProgressColorClass(categoryValue) {
    switch (categoryValue) {
        case 'Health': return 'green';
        case 'Productivity': return 'purple';
        case 'Education': return 'orange';
        case 'Personal': return 'red'; // Added a color for Personal
        default: return 'gray'; // Default color for Other
    }
}


// Create a new habit from the modal form
function createNewHabit(form) {
    const titleInput = form.querySelector('#habitName');
    const descriptionInput = form.querySelector('#habitDescription');
    const categorySelect = form.querySelector('#habitCategory');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const categoryValue = categorySelect.value; // e.g., "Health"

    if (!title) {
        showNotification('Please enter a habit name.', 'error');
        titleInput.focus();
        return;
    }

    // Create new habit card element
    const newHabitCard = createHabitCardElement(title, description, categoryValue);

    // Add to habits grid (prepend to show at top)
    const habitsGrid = document.querySelector('.habits-grid');
    if (habitsGrid) {
        habitsGrid.prepend(newHabitCard);
    } else {
        console.error("Habits grid not found!");
        return; // Stop if grid doesn't exist
    }

    // Initialize the state of the new card (e.g., button appearance)
    initializeCardStates(newHabitCard);

    feather.replace(); // Initialize icons on the new card

    showNotification('New habit created successfully!');

    // Close modal and reset form
    const modal = document.getElementById('habitModal');
    modal.classList.remove('active');
    form.reset(); // Reset the form fields

    // ✅ NEW: Send habit to backend
    fetch('/api/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: title,
            description: description,
            category: categoryValue,
            frequency: 'Daily' // Or replace with actual frequency field value if you have one
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Habit saved to database.');
        } else {
            console.warn('⚠️ Failed to save habit to database.');
        }
    })
    .catch(error => {
        console.error('🚫 Error saving habit to database:', error);
    });
}

// Mark a habit as complete
function markHabitComplete(habitCard) {
    if (habitCard.classList.contains('completed')) return; // Already completed

    const progressFill = habitCard.querySelector('.progress-fill');
    const progressText = habitCard.querySelector('.progress-percent'); // Target the span with the percentage

    // Update progress to 100%
    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = '100%';

    // Add completed class and update button state
    habitCard.classList.add('completed');
    updateCompleteButtonState(habitCard); // Updates icon, text, and state

    // Show notification
    const habitTitle = habitCard.querySelector('.habit-title').textContent;
    showNotification(`"${habitTitle}" completed! Great job!`);

    // Add pulse animation
    habitCard.style.animation = 'pulse 0.5s ease-out';
    habitCard.addEventListener('animationend', () => {
        habitCard.style.animation = ''; // Remove animation after it finishes
    }, { once: true }); // Ensure listener is removed after one run
}

// Show notification popup
function showNotification(message, type = 'success') { // type can be 'success', 'info', 'error'
    // Remove existing notification first
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';

    let iconName = 'check-circle';
    let iconColorVar = '--success'; // Default to success color variable
    if (type === 'error') {
        iconName = 'alert-circle';
        iconColorVar = '--danger';
    } else if (type === 'info') {
        iconName = 'info';
        iconColorVar = '--primary'; // Use primary color for info
    }

    notification.innerHTML = `
        <div class="notification-icon" style="color: var(${iconColorVar});">
            <i data-feather="${iconName}"></i>
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i data-feather="x" size="18"></i>
        </button>
    `;

    document.body.appendChild(notification);
    feather.replace();

    const closeBtn = notification.querySelector('.notification-close');
    let autoCloseTimeout;

    const closeNotification = () => {
        clearTimeout(autoCloseTimeout); // Clear timer if closed manually
        notification.classList.add('hide');
        // Remove from DOM after transition
        notification.addEventListener('transitionend', () => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, { once: true });
    }

    closeBtn.addEventListener('click', closeNotification);

    // Auto close after 3 seconds
    autoCloseTimeout = setTimeout(closeNotification, 3000);

    // Slide in animation - use setTimeout to trigger transition
    setTimeout(() => notification.classList.add('show'), 10);
}

// --- General Helpers ---

// Helper function to capitalize first letter of each word
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}
