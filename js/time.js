/**
 * TimeManager - Core time progression system
 * @version 2.0
 * @description Handles game time, age calculation, and quarterly events
 */
class TimeManager {
    // Configuration with defaults
    static config = {
        debug: true,
        monthsPerAdvance: 3,
        localStorageKey: 'lifeSimTimeState',
        maxRetryAttempts: 3,
        quarterStartMonths: [1, 4, 7, 10] // Months that start quarters
    };

    // Singleton state
    static state = {
        initialized: false,
        timeState: null,
        elements: {
            timeDisplays: null,
            ageDisplays: null
        },
        listeners: [],
        eventListeners: [],
        currentCharacterId: null
    };

    /**
     * Initialize TimeManager with a character ID
     * @param {string} characterId - Character ID for state isolation
     * @returns {Promise<boolean>} True if initialization succeeded
     */
    static async init(characterId = 'default') {
        if (this.state.initialized) {
            this.log('Already initialized');
            return true;
        }

        this.state.currentCharacterId = characterId;
        let attempts = 0;

        while (attempts < this.config.maxRetryAttempts) {
            try {
                attempts++;
                this.log(`Initialization attempt ${attempts}`);

                this.state.timeState = await this._loadTimeState(characterId);
                this._cacheElements();
                this._setupEventListeners();
                this.updateDisplays();

                this.state.initialized = true;
                this.log('Initialization successful');
                return true;

            } catch (error) {
                console.error(`Initialization attempt ${attempts} failed:`, error);
                if (attempts >= this.config.maxRetryAttempts) {
                    this._handleInitError(error);
                    return false;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }
    }

    // --------------------------
    // Public API
    // --------------------------

    /**
     * Advance time by configured months
     * @returns {Promise<TimeState>} New time state
     * @throws {Error} If not initialized
     */
static async advanceTime() {
    if (!this.state.initialized) throw new Error('TimeManager not initialized');
    
    const oldState = { ...this.state.timeState };
    const newState = this._calculateNewTimeState(oldState);
    
    // Validate exactly 3 months advancement
    if (newState.totalMonths - oldState.totalMonths !== 3) {
        newState.totalMonths = oldState.totalMonths + 3;
        // Recalculate with fixed totalMonths
        newState.month = (newState.totalMonths % 12) || 12;
        newState.quarter = this._getQuarterForMonth(newState.month);
        newState.year = 1 + Math.floor(newState.totalMonths / 12);
        newState.age = 18 + Math.floor(newState.totalMonths / 12);
        newState.isQuarterly = this.config.quarterStartMonths.includes(newState.month);
    }
    
    this.state.timeState = newState;
    await this._saveTimeState();
    this.updateDisplays();
    
    // Dispatch only one event
    document.dispatchEvent(new CustomEvent('timeAdvanced', {
        detail: newState
    }));
    
    return newState;
}



    /**
     * Update all time-related displays
     */
    static updateDisplays() {
        if (!this.state.initialized) return;

        const { timeState, elements } = this.state;
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];

        // Update time displays
        if (elements.timeDisplays?.length) {
            const timeText = `Year ${timeState.year}, Q${timeState.quarter} (${monthNames[timeState.month - 1]})`;
            elements.timeDisplays.forEach(el => el.textContent = timeText);
        }

        // Update age displays
        if (elements.ageDisplays?.length) {
            const ageText = `Age ${timeState.age}`;
            elements.ageDisplays.forEach(el => el.textContent = ageText);
        }
    }

    /**
     * Register time advancement listener
     * @param {function(TimeState)} callback - Function to call on time advancement
     */
    static registerTimeListener(callback) {
        if (typeof callback === 'function') {
            this.state.listeners.push(callback);
        }
    }

    /**
     * Get current time state
     * @returns {TimeState} Current time state
     */
    static getTimeState() {
        return {...this.state.timeState};
    }

    /**
     * Clean up resources
     */
    static cleanup() {
        this._removeEventListeners();
        this.state = {
            initialized: false,
            timeState: null,
            elements: {
                timeDisplays: null,
                ageDisplays: null
            },
            listeners: [],
            eventListeners: [],
            currentCharacterId: null
        };
        this.log('Cleanup complete');
    }

    // --------------------------
    // Private Methods
    // --------------------------

    /**
     * Calculate new time state after advancement
     * @private
     */
    static _calculateNewTimeState(oldState) {
        const months = this.config.monthsPerAdvance;
        const totalMonths = oldState.totalMonths + months;
        const month = (totalMonths % 12) || 12;
        
        return {
            totalMonths,
            month,
            quarter: this._getQuarterForMonth(month),
            year: 1 + Math.floor(totalMonths / 12),
            age: 18 + Math.floor(totalMonths / 12),
            isQuarterly: this.config.quarterStartMonths.includes(month)
        };
    }

    /**
     * Get quarter for a given month
     * @private
     */
    static _getQuarterForMonth(month) {
        return Math.ceil(month / 3);
    }

    /**
     * Load time state from storage or create default
     * @private
     */
static async _loadTimeState(characterId) {
    try {
        const key = `${this.config.localStorageKey}_${characterId}`;
        const savedState = localStorage.getItem(key);
        
        if (savedState) {
            const parsed = JSON.parse(savedState);
            // Ensure we have all required fields
            return {
                ...this._getDefaultTimeState(),
                ...parsed
            };
        }
        return this._getDefaultTimeState();
        
    } catch (error) {
        console.error('Error loading time state:', error);
        return this._getDefaultTimeState();
    }
}

    /**
     * Save current time state to storage
     * @private
     */
    static async _saveTimeState() {
        try {
            const key = `${this.config.localStorageKey}_${this.state.currentCharacterId || 'default'}`;
            localStorage.setItem(key, JSON.stringify(this.state.timeState));
        } catch (error) {
            console.error('Error saving time state:', error);
        }
    }

    /**
     * Get default time state
     * @private
     */
    static _getDefaultTimeState() {
        return {
            totalMonths: 0,
            month: 1,
            quarter: 1,
            year: 1,
            age: 18,
            isQuarterly: false
        };
    }

    /**
     * Cache frequently used DOM elements
     * @private
     */
    static _cacheElements() {
        this.state.elements = {
            timeDisplays: document.querySelectorAll('.time-display, [data-time-display]'),
            ageDisplays: document.querySelectorAll('.age-display, [data-age-display]')
        };
        this.log('Cached DOM elements');
    }

    /**
     * Setup event listeners
     * @private
     */
    static _setupEventListeners() {
        this._removeEventListeners();
        
        // Storage events for cross-tab sync
         const storageHandler = (e) => {
        if (e.key === `${this.config.localStorageKey}_${this.state.currentCharacterId}`) {
            this._loadTimeState(this.state.currentCharacterId).then(newState => {
                this.state.timeState = newState;
                this.updateDisplays();
                // Notify other systems in THIS tab
                document.dispatchEvent(new CustomEvent('timeAdvanced', { detail: newState }));
            });
        }
    };
    window.addEventListener('storage', storageHandler);
}

    /**
     * Remove all event listeners
     * @private
     */
    static _removeEventListeners() {
        this.state.eventListeners.forEach(({ element, type, handler }) => {
            element?.removeEventListener(type, handler);
        });
        this.state.eventListeners = [];
    }

    /**
     * Handle storage events
     * @private
     */
    static _handleStorageEvent(e) {
        try {
            const characterId = e.key.split('_').pop();
            if (characterId === (this.state.currentCharacterId || 'default')) {
                this.log('Detected time state change from another tab');
                this._loadTimeState(characterId).then(state => {
                    this.state.timeState = state;
                    this.updateDisplays();
                });
            }
        } catch (error) {
            console.error('Error handling storage event:', error);
        }
    }

    /**
     * Notify all listeners of time change
     * @private
     */
    static _notifyListeners(newState) {
        // Notify registered callbacks
        this.state.listeners.forEach(listener => {
            try {
                listener(newState);
            } catch (error) {
                console.error('Error in time listener:', error);
            }
        });
        
        // Dispatch global event
        document.dispatchEvent(new CustomEvent('timeAdvanced', {
            detail: newState
        }));
    }

    /**
     * Handle initialization error
     * @private
     */
    static _handleInitError(error) {
        console.error('TimeManager initialization failed:', error);
        this.state.timeState = this._getDefaultTimeState();
    }

    /**
     * Log debug messages
     * @private
     */
    static log(...args) {
        if (this.config.debug) {
            console.log('[TimeManager]', ...args);
        }
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeManager;
} else {
    window.TimeManager = TimeManager;
}