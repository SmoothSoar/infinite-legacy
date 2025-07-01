// game.js - Optimized Implementation
class GameManager {
    // Cached DOM elements
    static currentEducationContainer = null;
    static eventLogContainer = null;
    static characterInfoElements = {
        name: null,
        gender: null,
        country: null,
        culture: null,
        age: null
    };
    
    // Event listener references for cleanup
    static eventListeners = [];
    
    // Configuration
    static debug = true;

    /**
     * Initializes the GameManager system
     * @throws {Error} If required dependencies are not available
     * @returns {void}
     */
   static init() {
    try {
        if (this.debug) console.log('[GameManager] Initializing...');
        
        // Verify dependencies
        if (typeof EventManager === 'undefined') {
            throw new Error('EventManager is required but not loaded');
        }
        
        if (typeof TimeManager === 'undefined') {
            throw new Error('TimeManager is required but not loaded');
        }

        // Initialize EducationManager if available
        if (typeof EducationManager !== 'undefined') {
            EducationManager.init();
            EducationManager.loadGameState(); // Load state instead of calling syncState
        }

        // Cache DOM elements
        this.cacheDOMElements();
        
        // Initial renders
        this.renderCurrentEducation();
        this.renderCharacterInfo();
        
        // Set up event listeners
        this.setupEventListeners();
        
        if (this.debug) console.log('[GameManager] Initialized successfully');
    } catch (error) {
        console.error('GameManager initialization failed:', error);
        throw error;
    }
}

    /**
     * Cleans up event listeners and references
     * @returns {void}
     */
    static cleanup() {
        if (this.debug) console.log('[GameManager] Cleaning up...');
        
        // Remove event listeners
        this.eventListeners.forEach(({ type, listener }) => {
            document.removeEventListener(type, listener);
        });
        this.eventListeners = [];
        
        // Clear cached DOM references
        this.currentEducationContainer = null;
        this.eventLogContainer = null;
        this.characterInfoElements = {
            name: null,
            gender: null,
            country: null,
            culture: null,
            age: null
        };
    }

    /**
     * Caches frequently used DOM elements
     * @returns {void}
     */
    static cacheDOMElements() {
        this.currentEducationContainer = document.getElementById('currentEducation');
        this.eventLogContainer = document.getElementById('eventLog');
        
        this.characterInfoElements = {
            name: document.getElementById('characterName'),
            gender: document.getElementById('characterGender'),
            country: document.getElementById('characterCountry'),
            culture: document.getElementById('characterCulture'),
            age: document.getElementById('characterAge')
        };
    }

    /**
     * Sets up all event listeners
     * @returns {void}
     */
    static setupEventListeners() {
        const timeAdvancedListener = (e) => this.handleTimeAdvanced(e.detail);
        
        document.addEventListener('timeAdvanced', timeAdvancedListener);
        
        this.eventListeners = [
            { type: 'timeAdvanced', listener: timeAdvancedListener }
        ];
    }

    /**
     * Renders current education information
     * @returns {void}
     */
    static renderCurrentEducation() {
        if (!this.currentEducationContainer) return;

        try {
            // Ensure we have the latest state
            if (typeof EducationManager !== 'undefined') {
                EducationManager.loadGameState();
            }

            // Delegate to EventManager which has the same functionality
            if (TimeManager.timeState) {
                EventManager.updateEducationDisplays(TimeManager.timeState);
            }
        } catch (e) {
            console.error('[GameManager] Error rendering current education:', e);
            this.currentEducationContainer.innerHTML = '<div class="alert alert-danger mb-0">Error loading education data</div>';
        }
    }

    /**
     * Renders character information
     * @returns {void}
     */
static renderCharacterInfo() {
    try {
        const rawData = localStorage.getItem('lifeSimCharacter');
        console.log("Raw character data from localStorage:", rawData);
        
        const character = JSON.parse(rawData) || {
            name: 'Player',
            gender: 'Unknown',
            country: { name: 'Unknown' },
            culture: { name: 'Unknown' },
            age: 18
        };
        
        console.log("Parsed character data:", character);
        
        // Update display with proper nested property access
        if (this.characterInfoElements.name) {
            this.characterInfoElements.name.textContent = character.name || 'Player';
        }
        if (this.characterInfoElements.country) {
            this.characterInfoElements.country.textContent = character.country?.name || 'Unknown';
        }
        if (this.characterInfoElements.culture) {
            this.characterInfoElements.culture.textContent = character.culture?.name || 'Unknown';
        }
        if (this.characterInfoElements.gender) {
            this.characterInfoElements.gender.textContent = character.gender || 'Unknown';
        }
        
        // Handle age
        const timeState = JSON.parse(localStorage.getItem('timeState')) || { age: character.age || 18 };
        if (this.characterInfoElements.age) {
            this.characterInfoElements.age.textContent = `Age ${timeState.age}`;
        }
        
    } catch (error) {
        console.error('[GameManager] Error rendering character info:', error);
        // Fallback display
        if (this.characterInfoElements.name) {
            this.characterInfoElements.name.textContent = 'Error Loading Data';
        }
        if (this.characterInfoElements.country) {
            this.characterInfoElements.country.textContent = 'Error';
        }
    }
}

    /**
     * Handles time advancement events
     * @param {Object} timeState - Current time state object
     * @returns {void}
     */
    static handleTimeAdvanced(timeState) {
        try {
            if (this.debug) console.log('[GameManager] Handling time advancement:', timeState);
            
            // Use EventManager's logging system
            EventManager.addToEventLog(`Advanced to Year ${timeState.year}, Q${timeState.quarter}`, 'info');
            
            // Update character info (especially age)
            this.renderCharacterInfo();
        } catch (e) {
            console.error('[GameManager] Error in handleTimeAdvanced:', e);
            EventManager.addToEventLog('System error during time processing', 'danger');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GameManager.init();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    GameManager.cleanup();
});