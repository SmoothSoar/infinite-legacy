/**
 * EventManager - Central event handling and UI update system
 * @version 3.0
 * @description Handles game events, manages UI updates, and coordinates between systems
 * 
 * Responsibilities:
 * - Central event bus for game systems
 * - UI display updates
 * - Event logging system
 * - Time-based event processing
 */
class EventManager {
    /**
     * Configuration settings
     * @static
     * @property {Object} config
     * @property {boolean} debug - Enable debug logging
     * @property {number} maxEventLogEntries - Maximum events to keep in log
     * @property {number} financialUpdateInterval - Months between financial updates
     * @property {number} debounceTime - Debounce time for rapid updates (ms)
     * @property {number} retryAttempts - Number of initialization retries
     * @property {number} retryDelay - Delay between retries (ms)
     */
    static config = {
        debug: true,
        maxEventLogEntries: 50,
        financialUpdateInterval: 3,
        debounceTime: 200,
        retryAttempts: 3,
        retryDelay: 1000
    };

    /**
     * Current manager state
     * @static
     * @property {Object} state
     * @property {boolean} initialized - Initialization status
     * @property {Object} elements - Cached DOM elements
     * @property {Array} eventListeners - Active event listeners
     * @property {number|null} debounceTimer - Timeout ID for debouncing
     * @property {Set} pendingUpdates - Types of pending UI updates
     * @property {boolean} updateScheduled - Whether update is scheduled
     * @property {Object|null} lastProcessedTime - Last processed time state
     * @property {Object|null} lastCharacterState - Last character state
     */
    static state = {
        initialized: false,
        elements: {
            eventLogContainer: null,
            timeDisplay: null,
            ageDisplay: null,
            moneyDisplay: null
        },
        eventListeners: [],
        debounceTimer: null,
        pendingUpdates: new Set(),
        updateScheduled: false,
        lastProcessedTime: null,
        lastCharacterState: null
    };

    /* --------------------------
     * Initialization
     * -------------------------- */

    /**
     * Initialize the EventManager system
     * @async
     * @static
     * @throws {Error} If initialization fails after retries
     */
  static async init() {
    if (this.state.initialized) {
        this.log('Already initialized');
        return;
    }

    try {
        this._validateConfig();
        this._cacheElements();
        this._setupEventListeners();
        
        this.state.initialized = true;
        this.log('Initialized successfully');
        
        // Immediately update all displays
        this._updateDisplays();
        this._updateCharacterDisplays(); // Add this line
        
    } catch (error) {
        console.error('Initialization failed:', error);
        await this._retryInit();
    }
}



    /**
     * Validate configuration settings
     * @private
     * @static
     * @throws {Error} If config is invalid
     */
    static _validateConfig() {
        if (typeof this.config.debug !== 'boolean') {
            throw new Error('Invalid config: debug must be boolean');
        }
        if (typeof this.config.maxEventLogEntries !== 'number' || this.config.maxEventLogEntries < 1) {
            throw new Error('Invalid config: maxEventLogEntries must be positive number');
        }
    }

    /**
     * Cache frequently used DOM elements
     * @private
     * @static
     */
  static _cacheElements() {
    this.state.elements = {
        eventLogContainer: document.getElementById('eventLog'),
        timeDisplay: document.getElementById('timeDisplay'),
        ageDisplay: document.getElementById('characterAge'),
        moneyDisplay: document.getElementById('moneyDisplay'),
        characterName: document.getElementById('characterName'),
        characterCountry: document.getElementById('characterCountry'),
        characterCulture: document.getElementById('characterCulture'),
        healthDisplay: document.getElementById('healthDisplay')
    };
    
    if (this.config.debug) {
        Object.entries(this.state.elements).forEach(([name, element]) => {
            if (!element) {
                this.log(`Warning: ${name} element not found`);
            }
        });
    }
}
    

    /* --------------------------
     * Event System
     * -------------------------- */

    /**
     * Set up all event listeners
     * @private
     * @static
     */
static _setupEventListeners() {
    this._removeEventListeners();

    // Single handler for consolidated time events
    const timeHandler = (e) => {
        if (!e.detail?.timeState) return;
        this._handleTimeAdvanced(e.detail.timeState);
        this._queueUpdate('financial');
        this._queueUpdate('career');
        this._queueUpdate('character');
    };
    this._addListener(document, 'timeAdvancedConsolidated', timeHandler);

    // Storage event handler for cross-tab sync
    const storageHandler = (e) => {
        if (e.key === `${TimeManager.config.localStorageKey}_${TimeManager.state.currentCharacterId}`) {
            const newState = JSON.parse(e.newValue);
            document.dispatchEvent(new CustomEvent('timeAdvanced', {
                detail: newState
            }));
        }
    };
    this._addListener(window, 'storage', storageHandler);

    // Existing handlers (unchanged)
    const financialHandler = () => this._queueUpdate('financial');
    this._addListener(document, 'financialDataUpdated', financialHandler);

    const careerHandler = () => this._queueUpdate('career');
    this._addListener(document, 'careerUpdated', careerHandler);

    const characterHandler = (e) => {
        this._queueUpdate('character');
        this.state.lastCharacterState = e.detail;
    };
    this._addListener(document, 'characterStateChanged', characterHandler);
}

    /**
     * Add tracked event listener
     * @private
     * @static
     * @param {Element} element - DOM element to listen on
     * @param {string} type - Event type
     * @param {Function} handler - Callback function
     */
    static _addListener(element, type, handler) {
        element.addEventListener(type, handler);
        this.state.eventListeners.push({ element, type, handler });
    }

    /**
     * Remove all event listeners
     * @private
     * @static
     */
    static _removeEventListeners() {
        this.state.eventListeners.forEach(({element, type, handler}) => {
            element?.removeEventListener(type, handler);
        });
        this.state.eventListeners = [];
    }

    /* --------------------------
     * Time Handling
     * -------------------------- */

    /**
     * Handle time advancement events
     * @private
     * @static
     * @param {Object} timeState - Time state from TimeManager
     */
    static _handleTimeAdvanced(timeState) {
        if (!timeState) {
            this.log('Received empty timeState');
            return;
        }

        // Debounce rapid updates
        clearTimeout(this.state.debounceTimer);
        this.state.debounceTimer = setTimeout(() => {
            this._processTimeUpdate(timeState);
        }, this.config.debounceTime);
    }

    /**
     * Process time update and trigger related updates
     * @private
     * @static
     * @param {Object} timeState - Current time state
     */
    static _processTimeUpdate(timeState) {
        try {
            // Update time displays
            this._updateTimeDisplay(timeState);
            this._updateAgeDisplay(timeState.age);
            
            // Process financial updates if needed
            if (timeState.month % this.config.financialUpdateInterval === 0) {
                this._queueUpdate('financial');
            }
            
            // Process quarterly events
            if (timeState.isQuarterly) {
                this._processQuarterlyEvents(timeState);
            }

            this.state.lastProcessedTime = timeState;
        } catch (error) {
            console.error('Error processing time update:', error);
        }
    }

    /**
     * Handle quarterly events
     * @private
     * @static
     * @param {Object} timeState - Current time state
     */
    static _processQuarterlyEvents(timeState) {
        this.log(`Processing quarterly events for Q${timeState.quarter}`);
        this.addToEventLog(`Quarter ${timeState.quarter} of Year ${timeState.year} has begun`, 'info');
        
        document.dispatchEvent(new CustomEvent('quarterlyUpdate', {
            detail: timeState
        }));
    }

    /* --------------------------
     * Update Management
     * -------------------------- */

    /**
     * Queue UI update of specific type
     * @private
     * @static
     * @param {string} type - Update type ('financial', 'career', 'character')
     */
    static _queueUpdate(type) {
        this.state.pendingUpdates.add(type);
        if (!this.state.updateScheduled) {
            this.state.updateScheduled = true;
            requestAnimationFrame(() => this._processQueuedUpdates());
        }
    }

    /**
     * Process all queued updates
     * @private
     * @static
     */
    static _processQueuedUpdates() {
        try {
            this.state.pendingUpdates.forEach(type => {
                switch(type) {
                    case 'financial':
                        this._updateFinancialDisplays();
                        break;
                    case 'career':
                        this._updateCareerDisplays();
                        break;
                    case 'character':
                        this._updateCharacterDisplays();
                        break;
                }
            });
            
            this.state.pendingUpdates.clear();
            this.state.updateScheduled = false;
        } catch (error) {
            console.error('Error processing queued updates:', error);
        }
    }

    /* --------------------------
     * Display Updates
     * -------------------------- */

    /**
     * Update all displays
     * @private
     * @static
     */
    static _updateDisplays() {
        this._updateTimeDisplay();
        this._updateAgeDisplay();
        this._updateFinancialDisplays();
    }

    /**
     * Update time display
     * @private
     * @static
     * @param {Object} [timeState] - Optional time state (uses TimeManager if not provided)
     */
    static _updateTimeDisplay(timeState) {
        if (!this.state.elements.timeDisplay) return;
        
        const state = timeState || TimeManager?.state?.timeState;
        if (!state) return;
        
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
        const monthName = monthNames[state.month - 1] || '';
        
        this.state.elements.timeDisplay.textContent = 
            `Year ${state.year}, Q${state.quarter} (${monthName})`;
    }

    /**
     * Update age display
     * @private
     * @static
     * @param {number} [age] - Optional age (uses TimeManager if not provided)
     */
    static _updateAgeDisplay(age) {
        if (!this.state.elements.ageDisplay) return;

        // Only update when we have a reliable age; otherwise keep the current display to avoid flicker
        const resolvedAge = (typeof age === 'number')
            ? age
            : (typeof TimeManager?.state?.timeState?.age === 'number'
                ? TimeManager.state.timeState.age
                : null);

        if (resolvedAge !== null) {
            this.state.elements.ageDisplay.textContent = `Age ${resolvedAge}`;
        }
    }

    /**
     * Update financial displays
     * @private
     * @static
     */
    static _updateFinancialDisplays() {
        if (!this.state.elements.moneyDisplay) return;
        
        // Prefer FinancesManager for authoritative balance
        if (typeof FinancesManager !== 'undefined' && FinancesManager.getFinancialState) {
            const financialState = FinancesManager.getFinancialState() || {};
            this.state.elements.moneyDisplay.textContent = 
                `$${(financialState.totalBalance || 0).toLocaleString()}`;
        }
        // Fallback to player totalMoney if finances not available
        else if (MainManager.state.player) {
            const money = MainManager.state.player.totalMoney || 0;
            this.state.elements.moneyDisplay.textContent = `$${money.toLocaleString()}`;
        }
    }

    /**
     * Update career displays
     * @private
     * @static
     */
    static _updateCareerDisplays() {
        // Implementation would go here when CareerManager is available
    }

    /**
     * Update character displays
     * @private
     * @static
     */
  // In eventManager.js, modify the _updateCharacterDisplays method:
static _updateCharacterDisplays() {
    try {
        // Try to get player from MainManager first
        const player = MainManager.state?.player;
        
        if (player) {
            console.log('Updating character displays with player data:', {
                name: player.name,
                country: player.country,
                culture: player.culture
            });
            
            const fields = {
                'characterName': player.name,
                'characterAge': `Age ${player.age || 18}`,
                'characterCountry': player.country?.name || 'Unknown',
                'characterCulture': player.culture?.name || 'Unknown',
                'healthDisplay': `${player.getStat?.('health') || 100}%`,
                'moneyDisplay': `$${(player.totalMoney || 0).toLocaleString()}`
            };

            Object.entries(fields).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = value;
                    if (this.config.debug) {
                        console.log(`Updating ${id} with:`, value);
                    }
                } else if (this.config.debug) {
                    console.warn(`Element not found: ${id}`);
                }
            });
            return;
        }
        
        // Fallback to last character state if available
        if (this.state.lastCharacterState) {
            console.log('Updating character displays with last state:', this.state.lastCharacterState);
            const fields = {
                'characterName': this.state.lastCharacterState.name,
                'characterAge': `Age ${this.state.lastCharacterState.age || 18}`,
                'characterCountry': this.state.lastCharacterState.country?.name || 'Unknown',
                'characterCulture': this.state.lastCharacterState.culture?.name || 'Unknown',
                'healthDisplay': `${this.state.lastCharacterState.health || 100}%`,
                'moneyDisplay': `$${(this.state.lastCharacterState.finances?.cash + this.state.lastCharacterState.finances?.bank || 0).toLocaleString()}`
            };

            Object.entries(fields).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = value;
                    if (this.config.debug) {
                        console.log(`Updating ${id} with:`, value);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error updating character displays:', error);
    }
}
    /* --------------------------
     * Event Log Management
     * -------------------------- */

    /**
     * Add message to event log
     * @static
     * @param {string} message - Message to display
     * @param {string} [type='info'] - Message type ('info', 'warning', 'error')
     */
    static addToEventLog(message, type = 'info') {
        if (!this.state.elements.eventLogContainer) {
            if (this.config.debug) {
                console.log(`[Event] ${message}`);
            }
            return;
        }

        const eventElement = document.createElement('div');
        eventElement.className = `event-log-entry event-${type}`;
        
        const ts = TimeManager?.state?.timeState;
        const timestamp = ts ? `[Year ${ts.year}, Q${ts.quarter}] ` : '';
        eventElement.textContent = timestamp + message;
        
        this.state.elements.eventLogContainer.prepend(eventElement);
        
        // Trim log if too long
        const maxEntries = this.config.maxEventLogEntries;
        while (this.state.elements.eventLogContainer.children.length > maxEntries) {
            this.state.elements.eventLogContainer.lastChild.remove();
        }
    }

    /**
     * Get all logged events
     * @static
     * @returns {Array<Object>} Array of event objects
     */
    static getEvents() {
        if (!this.state.elements.eventLogContainer) return [];
        
        return Array.from(this.state.elements.eventLogContainer.children).map(el => ({
            message: el.textContent,
            type: el.className.match(/event-(\w+)/)?.[1] || 'info',
            timestamp: el.dataset.timestamp || Date.now()
        }));
    }

    /* --------------------------
     * Utility Methods
     * -------------------------- */

    /**
     * Retry initialization on failure
     * @private
     * @async
     * @static
     */
    static async _retryInit() {
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                this.log(`Retry attempt ${attempt}/${this.config.retryAttempts}`);
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
                await this.init();
                return;
            } catch (error) {
                if (attempt === this.config.retryAttempts) {
                    console.error('Failed to initialize after retries:', error);
                }
            }
        }
    }

    /**
     * Debug logging
     * @private
     * @static
     * @param {...any} args - Messages to log
     */
    static log(...args) {
        if (this.config.debug) {
            console.log('[EventManager]', ...args);
        }
    }

    /**
     * Clean up resources
     * @static
     */
    static cleanup() {
        this._removeEventListeners();
        clearTimeout(this.state.debounceTimer);
        this.state = {
            initialized: false,
            elements: {},
            eventListeners: [],
            debounceTimer: null,
            pendingUpdates: new Set(),
            updateScheduled: false,
            lastProcessedTime: null,
            lastCharacterState: null
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    EventManager.init();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    EventManager.cleanup();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
} else {
    window.EventManager = EventManager;
}
