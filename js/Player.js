/**
 * Player - Core player character class
 * @version 2.1
 * @description Handles all player data including stats, skills, finances, and persistence
 */
class Player {
    /**
     * Configuration settings
     * @static
     */
    static config = {
        debug: false // Default to false unless overridden
    };

    /**
     * Creates a new Player instance
     * @param {string} [characterId='default'] - Unique identifier for the character
     */
    constructor(characterId = 'default') {
        this.id = characterId;
        this._name = 'Player';
        this._age = 18;
        this._gender = 'Unknown';
        this._country = { name: 'Unknown', code: 'UNK' };
        this._culture = { name: 'Unknown', code: 'UNK' };
        this._stats = this._getDefaultStats();
        this._skills = this._getDefaultSkills();
        this._finances = this._getDefaultFinances();
        this._education = [];
        this._jobs = [];
        this._relationships = [];
        this._inventory = [];
        this._properties = [];
        
        // Load existing data if available
        this._loadCharacterData();
        
        // Ensure we have valid data for all fields
        this._validateData();
        
        // Dispatch initial update after loading data
        this._dispatchCharacterUpdate();
    }

_validateData() {
    this._name = this._name || 'Player';
    this._age = this._age || 18;
    this._gender = this._gender || 'Unknown';
    this._country = this._country || { name: 'Unknown', code: 'UNK' };
    this._culture = this._culture || { name: 'Unknown', code: 'UNK' };
    this._stats = this._stats || this._getDefaultStats();
    this._finances = this._finances || this._getDefaultFinances();
}
    // --------------------------
    // Core Properties
    // --------------------------

    /**
     * Gets the player's name
     * @returns {string}
     */
    get name() { return this._name; }

    /**
     * Sets the player's name
     * @param {string} value - New name
     */
 set name(value) {
    this._name = value?.trim() || 'Player';
    this._save();
    this._dispatchCharacterUpdate();
}
    
    /**
     * Gets the player's age
     * @returns {number}
     */
    get age() { return this._age; }

    /**
     * Sets the player's age
     * @param {number} value - New age
     */
    set age(value) {
        this._age = Math.max(0, parseInt(value) || 18);
        this._save();
    }
    
    /**
     * Gets the player's gender
     * @returns {string}
     */
    get gender() { return this._gender; }

    /**
     * Sets the player's gender
     * @param {string} value - New gender
     */
    set gender(value) {
        this._gender = value || 'Unknown';
        this._save();
    }
    
    /**
     * Gets the player's country info
     * @returns {Object} {name: string, code: string}
     */
    get country() { return this._country; }

    /**
     * Sets the player's country
     * @param {string|Object} value - Country name or {name, code} object
     */
   set country(value) {
    this._country = typeof value === 'string' ? 
        { code: value.toUpperCase(), name: value } : 
        { name: 'Unknown', code: 'UNK', ...value };
    this._save();
    this._dispatchCharacterUpdate(); // Add this line
}
    /**
     * Gets the player's culture info
     * @returns {Object} {name: string, code: string}
     */
    get culture() { return this._culture; }

    /**
     * Sets the player's culture
     * @param {string|Object} value - Culture name or {name, code} object
     */
  set culture(value) {
    this._culture = typeof value === 'string' ? 
        { code: value.toUpperCase(), name: value } : 
        { name: 'Unknown', code: 'UNK', ...value };
    this._save();
    this._dispatchCharacterUpdate(); // Add this line
}
    /**
     * Gets the player's total money (cash + bank)
     * @returns {number}
     */
    get totalMoney() { 
        return (this._finances?.cash || 0) + (this._finances?.bank || 0); 
    }

_dispatchCharacterUpdate() {
    document.dispatchEvent(new CustomEvent('characterStateChanged', {
        detail: this.getCharacterSnapshot()
    }));
}

getCharacterSnapshot() {
    return {
        name: this._name,
        age: this._age,
        health: this._stats.health,
        stats: {...this._stats},
        country: {...this._country},
        culture: {...this._culture},
        finances: {...this._finances}
    };
}


    // --------------------------
    // Stats Management
    // --------------------------

    /**
     * Gets all player stats
     * @returns {Object}
     */
    get stats() { return this._stats; }
    
    /**
     * Gets a specific stat value
     * @param {string} statName - Name of the stat to retrieve
     * @returns {number}
     */
    getStat(statName) {
        return this._stats[statName] || 0;
    }
    
    /**
     * Updates a stat by a given amount (clamped between 0-100)
     * @param {string} statName - Stat to update
     * @param {number} amount - Amount to add (can be negative)
     */
    updateStat(statName, amount) {
        if (!this._stats[statName]) return;
        this._stats[statName] = Math.max(0, Math.min(100, this._stats[statName] + amount));
        this._save();
    }

    // --------------------------
    // Financial Management
    // --------------------------

    /**
     * Gets all financial data
     * @returns {Object}
     */
    get finances() { return this._finances; }
    
    /**
     * Adds money to player's finances
     * @param {number} amount - Amount to add
     * @param {string} [source='cash'] - 'cash' or 'bank'
     */
    addMoney(amount, source = 'cash') {
        if (source === 'cash') {
            this._finances.cash = (this._finances.cash || 0) + amount;
        } else {
            this._finances.bank = (this._finances.bank || 0) + amount;
        }
        this._save();
    }

    // --------------------------
    // Time Advancement Handler
    // --------------------------

    /**
     * Handles time advancement events
     * @param {Object} timeState - Time state from TimeManager
     * @async
     */
    async onTimeAdvanced(timeState) {
        if (!timeState) return;
        
        // Update age if needed
        if (timeState.age !== this._age) {
            this._age = timeState.age;
            this._save();
        }
        
        // Dispatch character state change event
        document.dispatchEvent(new CustomEvent('characterStateChanged', {
            detail: {
                name: this._name,
                age: this._age,
                health: this._stats.health,
                stats: this._stats
            }
        }));
    }

    // --------------------------
    // Private Methods
    // --------------------------

    /**
     * Loads character data from localStorage
     * @private
     */
_loadCharacterData() {
    try {
        const storageKey = `lifeSimCharacter_${this.id}`;
        const data = JSON.parse(localStorage.getItem(storageKey)) || {};
        
        if (Player.config.debug) {
            console.log(`Loading character data for ${this.id}:`, data);
        }
        
        // Assign loaded data to properties
        this._name = data.name || this._name;
        this._age = data.age || this._age;
        this._gender = data.gender || this._gender;
        this._country = data.country || this._country;
        this._culture = data.culture || this._culture;
        this._stats = data.stats || this._getDefaultStats();
        this._skills = data.skills || this._getDefaultSkills();
        this._finances = data.finances || this._getDefaultFinances();
        this._education = data.education || [];
        this._jobs = data.jobs || [];
        this._relationships = data.relationships || [];
        this._inventory = data.inventory || [];
        this._properties = data.properties || [];
        
    } catch (e) {
        console.error("Error loading character data:", e);
    }
}
    
    /**
     * Saves current character data to localStorage
     * @private
     */
 _save() {
    try {
        const saveData = {
            name: this._name,
            age: this._age,
            gender: this._gender,
            country: this._country,
            culture: this._culture,
            stats: this._stats,
            skills: this._skills,
            finances: this._finances,
            education: this._education,
            jobs: this._jobs,
            relationships: this._relationships,
            inventory: this._inventory,
            properties: this._properties
        };
        
        const storageKey = `lifeSimCharacter_${this.id}`;
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        
        // Debug log to verify saving
        if (this.config?.debug) {
            console.log('Saved character data:', saveData);
            console.log('Storage key:', storageKey);
        }
        
        // Notify listeners of changes
        this._dispatchCharacterUpdate();
    } catch (e) {
        console.error("Error saving character data:", e);
    }
}
    
    /**
     * Creates default stats object
     * @returns {Object}
     * @private
     */
    _getDefaultStats() {
        return {
            health: 100,
            happiness: 75,
            education: 50,
            wealth: 25,
            fitness: 50,
            intelligence: 50,
            charisma: 50
        };
    }
    
    /**
     * Creates default skills object
     * @returns {Object}
     * @private
     */
    _getDefaultSkills() {
        return {
            programming: 0,
            communication: 0,
            leadership: 0,
            cooking: 0,
            driving: 0,
            creativity: 0
        };
    }
    
    /**
     * Creates default finances object
     * @returns {Object}
     * @private
     */
    _getDefaultFinances() {
        return {
            cash: 0,
            bank: 0,
            debt: 0,
            creditScore: 650,
            monthlyIncome: 0,
            monthlyExpenses: 0
        };
    }
}

// Make globally available
window.Player = Player;