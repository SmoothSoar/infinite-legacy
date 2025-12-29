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
        currentCharacterId: null,
        startYear: 1,
        startQuarter: 1,
        startAge: 18,
        storageKey: null
    };

    /**
     * Initialize TimeManager with a character ID
     * @param {string} characterId - Character ID for state isolation
     * @returns {Promise<boolean>} True if initialization succeeded
     */
    static async init(options = 'default') {
        if (this.state.initialized) {
            this.log('Already initialized');
            return true;
        }

        // Normalize options so callers can pass a string ID or an options object
        const initOptions = this._normalizeInitOptions(options);
        this.state.currentCharacterId = initOptions.characterId;
        this.state.startYear = initOptions.startYear;
        this.state.startQuarter = initOptions.startQuarter;
        this.state.startAge = initOptions.startAge;
        this.state.storageKey = this._getStorageKey(initOptions.characterId);

        let attempts = 0;

        while (attempts < this.config.maxRetryAttempts) {
            try {
                attempts++;
                this.log(`Initialization attempt ${attempts}`);

                this.state.timeState = await this._loadTimeState(initOptions);
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
        
        // Enforce configured advancement
        if (newState.totalMonths - oldState.totalMonths !== this.config.monthsPerAdvance) {
            throw new Error(`Time advancement must be exactly ${this.config.monthsPerAdvance} months`);
        }

        this.state.timeState = newState;
        await this._saveTimeState();
        this._notifyListeners(newState);
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
            currentCharacterId: null,
            startYear: 1,
            startQuarter: 1,
            startAge: 18,
            storageKey: null
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
        const monthsAdvanced = this.config.monthsPerAdvance;
        const previousTotalMonths = oldState?.totalMonths ?? 0;
        const totalMonths = previousTotalMonths + monthsAdvanced;
        const startMonth = oldState?.startMonth ?? Math.min(12, Math.max(1, ((this.state.startQuarter ?? 1) - 1) * 3 + 1));
        const monthIndex = (startMonth - 1) + totalMonths;
        const prevMonthIndex = (startMonth - 1) + previousTotalMonths;
        const month = (monthIndex % 12) + 1;
        const quarter = this._getQuarterForMonth(month);
        const prevYearCount = Math.floor(prevMonthIndex / 12);
        const newYearCount = Math.floor(monthIndex / 12);
        const yearsPassed = newYearCount - prevYearCount;
        const startYear = oldState?.startYear ?? this.state.startYear ?? 1;
        const startAge = oldState?.startAge ?? this.state.startAge ?? 18;
        
        return {
            ...oldState,
            startYear,
            startAge,
            startMonth,
            monthsAdvanced,
            yearsPassed,
            totalMonths,
            month,
            quarter,
            quarterChanged: quarter !== (oldState?.quarter ?? this._getQuarterForMonth(oldState?.month ?? startMonth)),
            year: startYear + newYearCount,
            age: startAge + newYearCount,
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
    static async _loadTimeState(options = {}) {
        const { characterId, startYear, startQuarter, startAge } = this._normalizeInitOptions(options);
        const storageKey = this._getStorageKey(characterId);
        const legacyKey = this._getStorageKey('[object Object]'); // Legacy bug key for migration
        const defaults = this._getDefaultTimeState({ startYear, startQuarter, startAge });
        const shouldTryLegacyMigration = characterId === 'default';

        try {
            // Try the correct key first
            const savedState = localStorage.getItem(storageKey);
            if (savedState) {
                return { ...defaults, ...JSON.parse(savedState) };
            }

            // Fallback: migrate data saved under the legacy key
            if (shouldTryLegacyMigration) {
                const legacyState = localStorage.getItem(legacyKey);
                if (legacyState) {
                    const parsedLegacy = { ...defaults, ...JSON.parse(legacyState) };
                    localStorage.setItem(storageKey, JSON.stringify(parsedLegacy));
                    return parsedLegacy;
                }
            }

            return defaults;
            
        } catch (error) {
            console.error('Error loading time state:', error);
            return defaults;
        }
    }

    /**
     * Save current time state to storage
     * @private
     */
    static async _saveTimeState() {
        try {
            const key = this.state.storageKey || this._getStorageKey(this.state.currentCharacterId || 'default');
            localStorage.setItem(key, JSON.stringify(this.state.timeState));
        } catch (error) {
            console.error('Error saving time state:', error);
        }
    }

    /**
     * Get default time state
     * @private
     */
    static _getDefaultTimeState(options = {}) {
        const startYear = options.startYear ?? 1;
        const startQuarter = options.startQuarter ?? 1;
        const startAge = options.startAge ?? 18;
        const startMonth = Math.min(12, Math.max(1, ((startQuarter - 1) * 3) + 1));

        return {
            totalMonths: 0,
            month: startMonth,
            quarter: this._getQuarterForMonth(startMonth),
            year: startYear,
            age: startAge,
            startYear,
            startAge,
            startMonth,
            monthsAdvanced: 0,
            yearsPassed: 0,
            quarterChanged: false,
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
            if (e.key === this.state.storageKey) {
                this._loadTimeState({
                    characterId: this.state.currentCharacterId,
                    startYear: this.state.startYear,
                    startQuarter: this.state.startQuarter,
                    startAge: this.state.startAge
                }).then(newState => {
                    this.state.timeState = newState;
                    this.updateDisplays();
                    // Notify other systems in THIS tab
                    document.dispatchEvent(new CustomEvent('timeAdvanced', { detail: newState }));
                });
            }
        };
        window.addEventListener('storage', storageHandler);
        this.state.eventListeners.push({
            element: window,
            type: 'storage',
            handler: storageHandler
        });
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
            if (e.key === this.state.storageKey) {
                this.log('Detected time state change from another tab');
                this._loadTimeState({
                    characterId: this.state.currentCharacterId,
                    startYear: this.state.startYear,
                    startQuarter: this.state.startQuarter,
                    startAge: this.state.startAge
                }).then(state => {
                    this.state.timeState = state;
                    this.updateDisplays();
                });
            }
        } catch (error) {
            console.error('Error handling storage event:', error);
        }
    }

    /**
     * Normalize initialization options regardless of the input shape
     * @private
     */
    static _normalizeInitOptions(options) {
        if (typeof options === 'string') {
            return {
                characterId: options || 'default',
                startYear: 1,
                startQuarter: 1,
                startAge: 18
            };
        }

        return {
            characterId: options?.characterId || 'default',
            startYear: options?.startYear ?? 1,
            startQuarter: options?.startQuarter ?? 1,
            startAge: options?.age ?? options?.startAge ?? 18
        };
    }

    /**
     * Build the storage key for a given character
     * @private
     */
    static _getStorageKey(characterId) {
        return `${this.config.localStorageKey}_${characterId || 'default'}`;
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
        this.state.timeState = this._getDefaultTimeState({
            startYear: this.state.startYear,
            startQuarter: this.state.startQuarter,
            startAge: this.state.startAge
        });
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
