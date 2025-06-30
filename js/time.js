// time.js - Optimized Version
class TimeManager {
    // Cached DOM elements
    static timeDisplays = null;
    static advanceTimeBtn = null;
    static resetTimeBtn = null;
    
    // Event listener references for cleanup
    static eventListeners = [];
    
    // Configuration
    static debug = true;
    static timeState = null;

    /**
     * Initializes the TimeManager system
     * @throws {Error} If initialization fails
     * @returns {void}
     */
    static init() {
        try {
            this.log('Initializing TimeManager...');
            
            // Cache DOM elements
            this.cacheDOMElements();
            
            // Load or initialize time state
            this.timeState = this.loadTimeState();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.log('TimeManager initialized with state:', this.timeState);
        } catch (error) {
            console.error('TimeManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Cleans up event listeners and references
     * @returns {void}
     */
    static cleanup() {
        this.log('Cleaning up TimeManager...');
        this.eventListeners.forEach(({ element, type, listener }) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];
        
        // Clear cached DOM references
        this.timeDisplays = null;
        this.advanceTimeBtn = null;
        this.resetTimeBtn = null;
    }

    /**
     * Caches frequently used DOM elements
     * @returns {void}
     */
    static cacheDOMElements() {
        this.timeDisplays = document.querySelectorAll('.time-display');
        this.advanceTimeBtn = document.getElementById('advanceTimeBtn');
        this.resetTimeBtn = document.getElementById('resetTimeBtn');
    }

    /**
     * Sets up all event listeners
     * @returns {void}
     */
    static setupEventListeners() {
        if (this.advanceTimeBtn) {
            const advanceHandler = () => this.advanceTime(3);
            this.advanceTimeBtn.addEventListener('click', advanceHandler);
            this.eventListeners.push({
                element: this.advanceTimeBtn,
                type: 'click',
                listener: advanceHandler
            });
        }
        
        if (this.resetTimeBtn) {
            const resetHandler = () => this.resetTime();
            this.resetTimeBtn.addEventListener('click', resetHandler);
            this.eventListeners.push({
                element: this.resetTimeBtn,
                type: 'click',
                listener: resetHandler
            });
        }
    }

    /**
     * Loads time state from localStorage or returns default
     * @returns {Object} Time state object
     */
    static loadTimeState() {
        try {
            const savedState = localStorage.getItem('lifeSimTimeState');
            if (savedState) return JSON.parse(savedState);
        } catch (e) {
            this.log('Error loading time state:', e);
            if (typeof EventManager !== 'undefined') {
                EventManager.addToEventLog('Error loading time data', 'danger');
            }
        }
        return this.getDefaultTimeState();
    }

    /**
     * Returns default time state
     * @returns {Object} Default time state
     */
    static getDefaultTimeState() {
        return {
            totalMonths: 0,
            month: 1,
            quarter: 1,
            year: 1,
            age: 18
        };
    }

    /**
     * Saves current time state to localStorage
     * @returns {void}
     */
    static saveTimeState() {
        try {
            localStorage.setItem('lifeSimTimeState', JSON.stringify(this.timeState));
        } catch (e) {
            this.log('Error saving time state:', e);
            if (typeof EventManager !== 'undefined') {
                EventManager.addToEventLog('Error saving time data', 'danger');
            }
        }
    }

    /**
     * Calculates age based on total months
     * @param {number} totalMonths - Total months elapsed
     * @returns {number} Calculated age
     */
    static calculateAge(totalMonths) {
        return 18 + Math.floor(totalMonths / 12);
    }

    /**
     * Advances time by specified months
     * @param {number} months - Number of months to advance
     * @throws {Error} If months is invalid
     * @returns {Object} Updated time state
     */
    static advanceTime(months) {
        if (isNaN(months) || months <= 0) {
            throw new Error('Invalid months value: must be a positive number');
        }

        const oldState = {...this.timeState};
        
        // Update time state
        this.timeState.totalMonths += months;
        this.timeState.year = 1 + Math.floor(this.timeState.totalMonths / 12);
        this.timeState.month = (this.timeState.totalMonths % 12) || 12;
        this.timeState.quarter = Math.ceil(this.timeState.month / 3);
        this.timeState.age = this.calculateAge(this.timeState.totalMonths);

        const isQuarterly = this.timeState.quarter !== oldState.quarter;
        const isYearly = this.timeState.year !== oldState.year;
        const isNewAge = this.timeState.age !== oldState.age;

        this.saveTimeState();

        // Dispatch event instead of directly updating displays
        document.dispatchEvent(new CustomEvent('timeAdvanced', {
            detail: {
                ...this.timeState,
                isQuarterly,
                isYearly,
                isNewAge,
                monthsAdvanced: months
            }
        }));

        return this.timeState;
    }

    /**
     * Resets all time data to default state
     * @returns {void}
     */
    static resetTime() {
        if (confirm('Reset all time data? This cannot be undone.')) {
            try {
                localStorage.removeItem('lifeSimTimeState');
                this.timeState = this.getDefaultTimeState();
                this.saveTimeState();
                
                // Dispatch reset event
                document.dispatchEvent(new CustomEvent('timeReset', {
                    detail: { ...this.timeState }
                }));
                
                if (typeof EventManager !== 'undefined') {
                    EventManager.addToEventLog('Time data has been reset', 'warning');
                }
            } catch (e) {
                this.log('Error resetting time:', e);
                if (typeof EventManager !== 'undefined') {
                    EventManager.addToEventLog('Failed to reset time data', 'danger');
                }
            }
        }
    }

    /**
     * Logs messages when debug is enabled
     * @param {...any} args - Arguments to log
     * @returns {void}
     */
    static log(...args) {
        if (this.debug) {
            console.log('[TimeManager]', ...args);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TimeManager.init();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    TimeManager.cleanup();
});

// Make TimeManager globally available
window.TimeManager = TimeManager;