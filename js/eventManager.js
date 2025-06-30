// eventManager.js - Optimized for Financial System Integration
class EventManager {
    // Cached DOM elements
    static elements = {
        timeDisplays: null,
        ageDisplays: null,
        currentEducationContainer: null,
        eventLogContainer: null,
        financialSummaryContainer: null
    };
    
    // Event listener references for cleanup
    static eventListeners = [];
    
    // Configuration
    static config = {
        debug: true,
        maxEventLogEntries: 50,
        financialUpdateInterval: 3 // Update financial displays every 3 months
    };

    /**
     * Initializes the EventManager system
     */
    static init() {
        try {
            this.log('Initializing EventManager...');
            
            // Verify dependencies
            if (typeof TimeManager === 'undefined') {
                throw new Error('TimeManager is required but not loaded');
            }

            // Cache DOM elements safely
            this.cacheDOMElements();
            
            // Initialize event listeners
            this.setupEventListeners();
            
            // Initial state sync
            this.syncState();
            
            this.log('EventManager initialized successfully');
        } catch (error) {
            console.error('EventManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Cleans up resources
     */
    static cleanup() {
        this.log('Cleaning up EventManager...');
        this.removeEventListeners();
        this.elements = {};
    }

    /**
     * Caches frequently used DOM elements safely
     */
    static cacheDOMElements() {
        this.elements.timeDisplays = document.querySelectorAll('.time-display');
        this.elements.ageDisplays = document.querySelectorAll('.age-display');
        this.elements.currentEducationContainer = document.getElementById('currentEducation');
        this.elements.eventLogContainer = document.getElementById('eventLog');
        this.elements.financialSummaryContainer = document.getElementById('financialSummary');
        
        // Log missing elements for debugging
        if (this.config.debug) {
            for (const [key, value] of Object.entries(this.elements)) {
                if (!value) {
                    this.log(`Element not found: ${key}`);
                }
            }
        }
    }

    /**
     * Sets up all event listeners
     */
    static setupEventListeners() {
        const timeAdvancedListener = (e) => this.handleTimeAdvanced(e.detail);
        const storageListener = (e) => this.handleStorageEvent(e);
        const financialUpdateListener = () => this.updateFinancialDisplays();
        
        document.addEventListener('timeAdvanced', timeAdvancedListener);
        window.addEventListener('storage', storageListener);
        document.addEventListener('financialDataUpdated', financialUpdateListener);
        
        this.eventListeners = [
            { type: 'timeAdvanced', element: document, listener: timeAdvancedListener },
            { type: 'storage', element: window, listener: storageListener },
            { type: 'financialDataUpdated', element: document, listener: financialUpdateListener }
        ];
    }

    /**
     * Removes all event listeners
     */
    static removeEventListeners() {
        this.eventListeners.forEach(({ element, type, listener }) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];
    }

    /**
     * Synchronizes game state across all components
     */
    static syncState() {
        try {
            // Sync with financial system if available
            if (typeof FinancesManager !== 'undefined') {
                FinancesManager.loadGameState();
                this.updateFinancialDisplays();
            }
            
            // Sync with education system if available
            if (typeof EducationManager !== 'undefined') {
                EducationManager.loadGameState();
            }
            
            // Update all displays with current time state
            if (TimeManager.timeState) {
                this.updateAllDisplays(TimeManager.timeState);
            }
        } catch (error) {
            console.error('Error in syncState:', error);
            this.addToEventLog('Failed to synchronize game state', 'danger');
        }
    }

    /**
     * Handles time advancement events
     * @param {Object} timeState - Current time state
     */
    static handleTimeAdvanced(timeState) {
    try {
        // Update all displays first
        this.updateAllDisplays(timeState);
        
        // Process financial updates if FinancesManager exists
        if (typeof FinancesManager !== 'undefined') {
            // Only process financial updates at configured interval
            if (timeState.month % this.config.financialUpdateInterval === 0) {
                // Ensure FinancesManager is initialized
                if (typeof FinancesManager.loadGameState === 'function') {
                    FinancesManager.loadGameState();
                }
                FinancesManager.handleTimeAdvanced(timeState);
                this.updateFinancialDisplays();
            }
        }
        
        // Process quarterly events
        if (timeState.isQuarterly) {
            this.processQuarterlyEvents(timeState);
            
            // Special quarterly financial processing
            if (typeof FinancesManager !== 'undefined') {
                FinancesManager.processQuarterlyEvents(timeState);
                this.updateFinancialDisplays();
            }
        }
        
        // Handle career updates if CareerManager exists
        if (typeof CareerManager !== 'undefined') {
            // Ensure CareerManager is initialized
            if (typeof CareerManager.loadGameState === 'function') {
                CareerManager.loadGameState();
            }
            CareerManager.handleTimeAdvanced(timeState);
        }
        
        // Handle education updates if EducationManager exists
        if (typeof EducationManager !== 'undefined') {
            // Ensure EducationManager is initialized
            if (typeof EducationManager.loadGameState === 'function') {
                EducationManager.loadGameState();
            }
            EducationManager.handleTimeAdvanced(timeState);
        }
        
    } catch (error) {
        this.log('Error handling time advancement:', error);
        this.addToEventLog('Error processing time advancement', 'danger');
    }
}

    /**
     * Updates all display elements
     * @param {Object} timeState - Current time state
     */
    static updateAllDisplays(timeState) {
        this.updateTimeDisplays(timeState);
        this.updateAgeDisplays(timeState);
        this.updateEducationDisplays(timeState);
        
        // Update financial displays if needed
        if (typeof FinancesManager !== 'undefined') {
            this.updateFinancialDisplays();
        }
    }

    /**
     * Updates time-related displays
     * @param {Object} timeState - Current time state
     */
    static updateTimeDisplays(timeState) {
        if (!this.elements.timeDisplays || this.elements.timeDisplays.length === 0) return;
        
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
        const currentMonth = monthNames[timeState.month - 1];
        
        this.elements.timeDisplays.forEach(el => {
            el.textContent = `Year ${timeState.year}, Q${timeState.quarter} (${currentMonth})`;
        });
    }

    /**
     * Updates age-related displays
     * @param {Object} timeState - Current time state
     */
    static updateAgeDisplays(timeState) {
        if (!this.elements.ageDisplays || this.elements.ageDisplays.length === 0) return;
        
        this.elements.ageDisplays.forEach(el => {
            el.textContent = timeState.age;
        });
    }

    /**
     * Updates education-related displays
     * @param {Object} timeState - Current time state
     */
    static updateEducationDisplays(timeState) {
        if (!this.elements.currentEducationContainer) return;

        try {
            if (typeof EducationManager !== 'undefined') {
                EducationManager.loadGameState();
                const enrolledPrograms = EducationManager.gameState?.education?.enrolledPrograms || [];
                
                if (enrolledPrograms.length === 0) {
                    this.elements.currentEducationContainer.innerHTML = '<div class="alert alert-info mb-0">Not currently enrolled in any programs.</div>';
                    return;
                }

                this.elements.currentEducationContainer.innerHTML = enrolledPrograms.map(program => `
                    <div class="mb-2">
                        <div class="d-flex justify-content-between">
                            <strong>${program.name}</strong>
                            <span>${Math.round(program.progress)}%</span>
                        </div>
                        <div class="progress mt-1" style="height: 8px;">
                            <div class="progress-bar" role="progressbar" 
                                 style="width: ${program.progress}%" 
                                 aria-valuenow="${program.progress}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                            </div>
                        </div>
                        <small class="text-muted">${program.monthsCompleted}/${program.totalDuration} months completed</small>
                    </div>
                `).join('');
            }
        } catch (e) {
            this.log('Error updating education displays:', e);
            this.elements.currentEducationContainer.innerHTML = '<div class="alert alert-danger mb-0">Error loading education data</div>';
        }
    }

    /**
     * Updates financial-related displays
     */
    static updateFinancialDisplays() {
        if (!this.elements.financialSummaryContainer || typeof FinancesManager === 'undefined') return;
        
        try {
            const financialState = FinancesManager.getFinancialState();
            
            this.elements.financialSummaryContainer.innerHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Financial Summary</h5>
                        <div class="row">
                            <div class="col-md-4">
                                <div class="d-flex align-items-center">
                                    <div class="me-3 text-primary">
                                        <i class="bi bi-cash-stack fs-2"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-0">Liquid Assets</h6>
                                        <p class="mb-0">$${financialState.totalBalance.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="d-flex align-items-center">
                                    <div class="me-3 text-success">
                                        <i class="bi bi-graph-up fs-2"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-0">Monthly Income</h6>
                                        <p class="mb-0">$${financialState.monthlyIncome.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="d-flex align-items-center">
                                    <div class="me-3 text-danger">
                                        <i class="bi bi-graph-down fs-2"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-0">Monthly Expenses</h6>
                                        <p class="mb-0">$${financialState.monthlyExpenses.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-0">Net Worth</h6>
                                <h4 class="mb-0 text-primary">$${financialState.netWorth.toLocaleString()}</h4>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="if (typeof FinancesManager !== 'undefined') FinancesManager.init()">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            this.log('Error updating financial displays:', error);
            this.elements.financialSummaryContainer.innerHTML = '<div class="alert alert-danger">Error loading financial data</div>';
        }
    }

    /**
     * Processes quarterly events
     * @param {Object} timeState - Current time state
     */
    static processQuarterlyEvents(timeState) {
        this.log('Processing quarterly events for:', timeState);
        
        // Financial events are handled directly in FinancesManager.processQuarterlyEvents()
        
        // Add any non-financial quarterly events here
        this.addToEventLog(`Quarter ${timeState.quarter} of Year ${timeState.year} has begun`, 'info');
    }

    /**
     * Handles storage events from other tabs
     * @param {StorageEvent} e - Storage event object
     */
    static handleStorageEvent(e) {
        if (e.key === 'financesGameState' || e.key === 'educationGameState') {
            this.log('Detected state change from another tab');
            this.syncState();
        }
    }

    /**
     * Adds a message to the event log
     * @param {string} message - Message to display
     * @param {string} [type='info'] - Alert type (info, success, warning, danger)
     */
    static addToEventLog(message, type = 'info') {
        if (!this.elements.eventLogContainer) return;

        const newEvent = document.createElement('div');
        newEvent.className = `alert alert-${type} p-2 mb-2`;
        newEvent.textContent = `[Year ${TimeManager.timeState?.year || '?'}] ${message}`;
        newEvent.dataset.timestamp = Date.now();
        this.elements.eventLogContainer.insertBefore(newEvent, this.elements.eventLogContainer.firstChild);

        // Limit log size
        while (this.elements.eventLogContainer.children.length > this.config.maxEventLogEntries) {
            this.elements.eventLogContainer.removeChild(this.elements.eventLogContainer.lastChild);
        }
    }

    /**
     * Gets all events from the event log
     * @returns {Array} Array of event objects
     */
    static getEvents() {
        if (!this.elements.eventLogContainer) return [];
        
        return Array.from(this.elements.eventLogContainer.children).map(el => ({
            message: el.textContent,
            type: el.className.match(/alert-(\w+)/)?.[1] || 'info',
            timestamp: el.dataset.timestamp || Date.now()
        }));
    }

    /**
     * Logs debug messages when enabled
     * @param {...any} args - Arguments to log
     */
    static log(...args) {
        if (this.config.debug) {
            console.log('[EventManager]', ...args);
        }
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