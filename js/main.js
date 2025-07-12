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
        // Ensure TimeManager exists
        if (!window.TimeManager) {
            throw new Error('TimeManager is required but not loaded');
        }
        
        // Initialize TimeManager with safe defaults
        await TimeManager.init({
            characterId: this._getCharacterId(),
            startYear: new Date().getFullYear(),
            startQuarter: 1
        });
        
        this._log('Core systems ready');
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
        return params.get('characterId') || 'default';
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
        const systems = [
            'Player',
            'FinancesManager',
            'EventManager',
            'EducationManager',
            'CareerManager'
        ];
        
        await Promise.all(systems.map(sys => {
            if (window[sys]?.onTimeAdvanced) {
                return window[sys].onTimeAdvanced(timeState);
            }
        }));
        
        document.dispatchEvent(new CustomEvent('timeAdvancedConsolidated', {
            detail: { timeState }
        }));
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