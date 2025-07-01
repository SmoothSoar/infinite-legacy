// main.js - Optimized Version
class MainManager {
    // Event listener references for cleanup
    static eventListeners = [];
    
    // Configuration
    static debug = true;

    
    /**
     * Initializes the main application
     * @throws {Error} If required dependencies are not available
     * @returns {void}
     */
// In main.js - Update the init method:

static init() {
    try {
        this.log('Initializing MainManager...');
        this.verifyDependencies();
        
        // Setup theme first
        this.setupTheme();
        
        // Initialize core managers in correct order
        TimeManager.init();
        
        // Load character info before other managers
        this.loadCharacterInfo();
        
        // Initialize money system (which initializes FinancesManager)
        this.initMoneySystem
        
        // Initialize other managers
        EventManager.init();
        
        // Initialize EducationManager if available
        if (typeof EducationManager !== 'undefined') {
            EducationManager.syncState();
        }
        
        // Initialize CareerManager if available
        if (typeof CareerManager !== 'undefined') {
            CareerManager.init();
        }
        
        this.setupEventListeners();
        
        // Initial display updates
        if (TimeManager.timeState) {
            TimeManager.updateDisplays();
        }
        
        this.log('MainManager initialized successfully');
    } catch (error) {
        console.error('MainManager initialization failed:', error);
        throw error;
    }
}

    /**
     * Cleans up event listeners and references
     * @returns {void}
     */
    static cleanup() {
        this.log('Cleaning up MainManager...');
        this.eventListeners.forEach(({ element, type, listener }) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];
    }

    /**
     * Verifies required dependencies are available
     * @throws {Error} If required dependencies are missing
     * @returns {void}
     */
    static verifyDependencies() {
        if (typeof TimeManager === 'undefined') {
            throw new Error('Required dependency TimeManager is missing');
        }
    }

    /**
     * Sets up all event listeners
     * @returns {void}
     */
    static setupEventListeners() {
        const advanceTimeBtn = document.getElementById('advanceTimeBtn');
        const themeToggle = document.getElementById('themeToggle');
        
        if (advanceTimeBtn) {
            const advanceTimeListener = () => this.handleAdvanceTime();
            advanceTimeBtn.addEventListener('click', advanceTimeListener);
            this.eventListeners.push({
                element: advanceTimeBtn,
                type: 'click',
                listener: advanceTimeListener
            });
        }
        
        if (themeToggle) {
            const themeToggleListener = () => this.toggleTheme();
            themeToggle.addEventListener('click', themeToggleListener);
            this.eventListeners.push({
                element: themeToggle,
                type: 'click',
                listener: themeToggleListener
            });
        }
    }

    /**
     * Handles time advancement
     * @returns {void}
     */
    static handleAdvanceTime() {
        const btn = document.getElementById('advanceTimeBtn');
        if (!btn) return;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Advancing...';
        
        try {
            TimeManager.advanceTime(3);
            EventManager.addToEventLog('Time advanced by 3 months');
        } catch (error) {
            console.error('Error advancing time:', error);
            EventManager.addToEventLog('Failed to advance time', 'danger');
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = 'Advance Time';
            }, 500);
        }
    }

    /**
     * Loads and displays character information
     * @returns {void}
     */
    static loadCharacterInfo() {
        try {
           const character = JSON.parse(localStorage.getItem('lifeSimCharacter')) || {
    name: 'Player',
    gender: 'Unknown',
    countryName: 'Unknown',  // Changed from country to countryName
    culture: 'Unknown',
    age: 18
};

            // Sync age with TimeManager
            if (TimeManager.timeState) {
                character.age = TimeManager.timeState.age;
                localStorage.setItem('lifeSimCharacter', JSON.stringify(character));
            }

            // Update DOM
            ['name', 'gender', 'country', 'culture', 'age'].forEach(field => {
                const element = document.getElementById(`character${field.charAt(0).toUpperCase() + field.slice(1)}`);
                if (element) element.textContent = character[field];
            });
        } catch (error) {
            this.log('Error loading character info:', error);
        }
    }

    /**
     * Sets up the application theme
     * @returns {void}
     */
    static setupTheme() {
        try {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.innerHTML = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
            }
        } catch (error) {
            this.log('Error setting up theme:', error);
        }
    }

    /**
     * Toggles between light and dark theme
     * @returns {void}
     */
    static toggleTheme() {
        try {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.innerHTML = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
            }
        } catch (error) {
            this.log('Error toggling theme:', error);
        }
    }

    /**
     * Logs messages when debug is enabled
     * @param {...any} args - Arguments to log
     * @returns {void}
     */
    static log(...args) {
        if (this.debug) {
            console.log('[MainManager]', ...args);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    MainManager.init();
    document.getElementById('currentYear')?.textContent = new Date().getFullYear();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    MainManager.cleanup();
});