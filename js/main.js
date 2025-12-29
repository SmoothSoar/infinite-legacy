/**
 * Universal Main Manager - Core Game System
 * @version 3.1
 * @description Cross-page time advancement system with robust button handling
 * 
 * Key Improvements:
 * - Fixed initialization sequence
 * - 100% reliable button handling
 * - Self-contained initialization
 * - Better error recovery
 * - Simplified architecture
 */

class MainManager {
    /**
     * Configuration with safe defaults
     * @static
     */
    static config = {
        debug: true,
        requiredSystems: ['TimeManager', 'Player'],
        optionalSystems: ['EventManager', 'FinancesManager'],
        buttonCheckInterval: 1000,
        maxInitAttempts: 3
    };

    /**
     * Current system state
     * @static
     */
    static state = {
        initialized: false,
        initAttempts: 0,
        systemsReady: false,
        pendingTimeAdvance: false,
        boundHandlers: new Map(),
        intervals: new Set(),
        observers: new Set()
    };

    /* ========================
     * PUBLIC INTERFACE
     * ======================== */

    /**
     * Initializes the entire game system
     * @static
     * @async
     */
    static async init() {
        if (this.state.initialized) {
            this._log('Already initialized');
            return;
        }

        this.state.initAttempts++;
        
        try {
            // Phase 1: Core Setup
            await this._setupCore();
            
            // Phase 2: System Verification
            await this._verifySystems();
            
            // Phase 3: Event System Setup
            this._setupEventSystem();
            
            // Phase 4: Button Handling
            this._setupButtonHandlers();
            
            this.state.initialized = true;
            this._log('System ready');
            
            // Notify other systems
            document.dispatchEvent(new CustomEvent('mainManagerReady'));
            
        } catch (error) {
            this._handleInitError(error);
        }
    }

    /**
     * Handles time advancement
     * @static
     * @async
     * @param {Event} [event] - Optional DOM event
     */
    static async advanceTime(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.state.pendingTimeAdvance) {
            this._log('Time advance already in progress');
            return;
        }

        this.state.pendingTimeAdvance = true;
        const button = event?.target?.closest('#advanceTimeButton') || 
                      document.getElementById('advanceTimeButton');

        try {
            // Visual feedback
            if (button) {
                const originalText = button.innerHTML;
                button.disabled = true;
                button.innerHTML = 'Processing...';
                
                // Core advancement
                const newTime = await TimeManager.advanceTime();
                this._log(`Advanced to ${newTime.year} Q${newTime.quarter}`);
                
                // Update systems
                await this._updateAllSystems(newTime);
                
                // Restore button
                button.disabled = false;
                button.innerHTML = originalText;
            } else {
                // Fallback if no button found
                const newTime = await TimeManager.advanceTime();
                await this._updateAllSystems(newTime);
            }
            
        } catch (error) {
            this._handleError('Time advance failed', error);
            if (button) {
                button.disabled = false;
                button.innerHTML = 'Advance Time (3 Months)';
            }
        } finally {
            this.state.pendingTimeAdvance = false;
        }
    }

    /**
     * Cleans up all resources
     * @static
     */
    static cleanup() {
        // Clear intervals
        this.state.intervals.forEach(clearInterval);
        this.state.intervals.clear();
        
        // Disconnect observers
        this.state.observers.forEach(obs => obs.disconnect());
        this.state.observers.clear();
        
        // Remove event listeners
        this.state.boundHandlers.forEach((handler, element) => {
            element?.removeEventListener?.('click', handler);
        });
        this.state.boundHandlers.clear();
        
        // Reset state
        this.state.initialized = false;
        this.state.systemsReady = false;
        this.state.pendingTimeAdvance = false;
    }

    /* ========================
     * CORE SYSTEM SETUP
     * ======================== */

    /**
     * Sets up core functionality
     * @static
     * @async
     * @private
     */
static async _setupCore() {
    const characterId = this._getCharacterId();
    const timeInitOptions = {
        characterId: characterId,
        startYear: 1,
        startQuarter: 1,
        startAge: this.state?.player?.age ?? null
    };
    
    // Initialize Player - this will load from localStorage or create new
    this.state.player = new Player(characterId);
    
    // Debug log to verify player data
    if (this.config.debug) {
        console.log('Player initialized with:', {
            name: this.state.player.name,
            country: this.state.player.country,
            culture: this.state.player.culture,
            age: this.state.player.age // Log age for debugging
        });
    }
    
    // Ensure TimeManager exists
    if (!window.TimeManager) {
        throw new Error('TimeManager is required but not loaded');
    }
    
    // Load the saved time state to get the actual age
    const savedTimeState = await TimeManager._loadTimeState({
        characterId,
        startYear: timeInitOptions.startYear,
        startQuarter: timeInitOptions.startQuarter,
        startAge: this.state.player.age
    });
    if (savedTimeState) {
        timeInitOptions.startYear = savedTimeState.startYear ?? savedTimeState.year ?? timeInitOptions.startYear;
    }
    
    // Update player's age to match the saved time state
    if (savedTimeState && savedTimeState.age) {
        this.state.player.age = savedTimeState.age;
        if (this.config.debug) {
            console.log('Updated player age from saved time state:', savedTimeState.age);
        }
    }
    
    // Initialize TimeManager with the correct age
    timeInitOptions.startAge = this.state.player.age;
    await TimeManager.init(timeInitOptions);

    // Ensure the player age stays in sync with the active time state
    const activeTimeState = TimeManager.getTimeState?.();
    if (activeTimeState?.age) {
        this.state.player.age = activeTimeState.age;
    }
    
    // Initialize EventManager if available
    if (window.EventManager) {
        await EventManager.init();
    }
    
    // Force initial UI update after all systems are ready
    this._forceInitialUIUpdate();
    
    this._log('Core systems ready');
}

static _forceInitialUIUpdate() {
    // Update all character displays immediately
    document.dispatchEvent(new CustomEvent('characterStateChanged', {
        detail: this.state.player.getCharacterSnapshot()
    }));
    
    // Force update financial displays
    document.dispatchEvent(new CustomEvent('financialDataUpdated'));
    
    // If EventManager is available, trigger its updates
    if (window.EventManager) {
        EventManager._updateDisplays();
        EventManager._updateCharacterDisplays();
    }
}

    /**
     * Verifies all required systems
     * @static
     * @async
     * @private
     */
    static async _verifySystems() {
        const missing = this.config.requiredSystems.filter(sys => !window[sys]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required systems: ${missing.join(', ')}`);
        }
        
        // Initialize optional systems if they exist
        await Promise.all(this.config.optionalSystems.map(async sys => {
            if (window[sys]?.init) {
                await window[sys].init();
                this._log(`${sys} initialized`);
            }
        }));
        
        this.state.systemsReady = true;
    }

    /**
     * Gets current character ID
     * @static
     * @private
     * @returns {string}
     */
   static _getCharacterId() {
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get('characterId');
    const currentId = localStorage.getItem('currentCharacterId');
    const lastId = localStorage.getItem('lastCharacterId');
    
    // Prefer explicit URL parameter, then the actively selected character, then last played
    const characterId = paramId || currentId || lastId || 'default';
    
    // Remember the most recent character for nav links without params
    localStorage.setItem('lastCharacterId', characterId);
    localStorage.setItem('currentCharacterId', characterId);
    return characterId;
}

    /* ========================
     * EVENT SYSTEM
     * ======================== */

    /**
     * Sets up the event system
     * @static
     * @private
     */
    static _setupEventSystem() {
        // System-wide events
        document.addEventListener('timeAdvanced', async (e) => {
            await this._updateAllSystems(e.detail);
        });
        
        // Financial updates
        if (window.FinancesManager) {
            FinancesManager.onUpdate(() => {
                document.dispatchEvent(new CustomEvent('financialUpdate'));
            });
        }
        
        this._log('Event system ready');
    }

    /* ========================
     * BUTTON HANDLING
     * ======================== */

    /**
     * Sets up all button handlers
     * @static
     * @private
     */
    static _setupButtonHandlers() {
        // 1. Direct binding for existing buttons
        this._bindExistingButtons();
        
        // 2. Document-level delegation for dynamic buttons
        const handler = (e) => {
            if (e.target?.closest('#advanceTimeButton')) {
                this.advanceTime(e);
            }
        };
        
        document.addEventListener('click', handler);
        this.state.boundHandlers.set(document, handler);
        
        // 3. Periodic check for new buttons
        this._setupButtonChecker();
        
        // 4. MutationObserver for modern SPAs
        this._setupMutationObserver();
        
        this._log('Button handlers ready');
    }

    /**
     * Binds handlers to existing buttons
     * @static
     * @private
     */
    static _bindExistingButtons() {
        document.querySelectorAll('#advanceTimeButton').forEach(button => {
            if (!this.state.boundHandlers.has(button)) {
                const handler = (e) => this.advanceTime(e);
                button.addEventListener('click', handler);
                this.state.boundHandlers.set(button, handler);
            }
        });
    }

    /**
     * Sets up periodic button checker
     * @static
     * @private
     */
    static _setupButtonChecker() {
        const interval = setInterval(() => {
            this._bindExistingButtons();
        }, this.config.buttonCheckInterval);
        
        this.state.intervals.add(interval);
    }

    /**
     * Sets up DOM mutation observer
     * @static
     * @private
     */
    static _setupMutationObserver() {
        if (typeof MutationObserver === 'undefined') return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const buttons = node.querySelectorAll('#advanceTimeButton');
                        buttons.forEach(button => {
                            if (!this.state.boundHandlers.has(button)) {
                                const handler = (e) => this.advanceTime(e);
                                button.addEventListener('click', handler);
                                this.state.boundHandlers.set(button, handler);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.state.observers.add(observer);
    }

    /* ========================
     * SYSTEM UPDATES
     * ======================== */

    /**
     * Updates all game systems
     * @static
     * @async
     * @private
     * @param {Object} timeState - Current time data
     */
static async _updateAllSystems(timeState) {
    if (!timeState) return;

    // Create a standardized timeState object (ensure age is always present to avoid UI flicker)
    const resolvedAge = typeof timeState?.age === 'number'
        ? timeState.age
        : (typeof TimeManager?.state?.timeState?.age === 'number' ? TimeManager.state.timeState.age : null);

    const standardizedTimeState = {
        ...timeState,
        age: resolvedAge,
        monthsAdvanced: timeState?.monthsAdvanced ?? (TimeManager?.config?.monthsPerAdvance ?? 3),
        yearsPassed: timeState?.yearsPassed ?? 0,
        isQuarterly: timeState?.isQuarterly ?? (timeState?.quarterChanged ?? false)
    };
    
    // Only dispatch one consolidated event
    document.dispatchEvent(new CustomEvent('timeAdvancedConsolidated', {
        detail: { timeState: standardizedTimeState }
    }));
    
    // Update systems directly without triggering more events
    if (window.Player?.onTimeAdvanced) {
        await Player.onTimeAdvanced(standardizedTimeState);
    }
    if (window.FinancesManager?.onTimeAdvanced) {
        await FinancesManager.onTimeAdvanced(standardizedTimeState);
    }
    if (window.CareerManager?.onTimeAdvanced) {
        await CareerManager.onTimeAdvanced(standardizedTimeState);
    }
}

    /* ========================
     * ERROR HANDLING
     * ======================== */

    /**
     * Handles initialization errors
     * @static
     * @private
     * @param {Error} error
     */
    static _handleInitError(error) {
        console.error('Initialization error:', error);
        
        if (this.state.initAttempts < this.config.maxInitAttempts) {
            setTimeout(() => this.init(), 1000 * this.state.initAttempts);
            this._log(`Retrying initialization (attempt ${this.state.initAttempts})`);
        } else {
            document.dispatchEvent(new CustomEvent('initFailed', {
                detail: { error: error.message }
            }));
        }
    }

    /**
     * Handles runtime errors
     * @static
     * @private
     * @param {string} context
     * @param {Error} error
     */
    static _handleError(context, error) {
        console.warn(`${context}:`, error);
        
        if (window.EventManager) {
            EventManager.addToEventLog(`${context}: ${error.message}`, 'warning');
        }
    }

    /**
     * Debug logging
     * @static
     * @private
     * @param {...any} args
     */
    static _log(...args) {
        if (this.config.debug) {
            console.log('[MainManager]', ...args);
        }
    }
}

/* ========================
 * AUTOMATIC INITIALIZATION
 * ======================== */

// Self-registering initialization
(function() {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Register the manager globally
    window.MainManager = MainManager;
    
    // Initialize when ready
    function start() {
        MainManager.init().catch(error => {
            console.error('Failed to initialize MainManager:', error);
        });
        
        // Update copyright year if element exists
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
    

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainManager;
} else {
    window.MainManager = MainManager;
}

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => MainManager.cleanup());
})();
