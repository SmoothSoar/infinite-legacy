/**
 * Character Creation Module
 * @module Creation
 * @description Handles character creation form, validation, and saving to localStorage
 * @version 2.0
 * @requires COUNTRIES - Global array of country data
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme if available
    if (typeof ThemeManager !== 'undefined') {
        ThemeManager.init();
    }

    // DOM Elements
    const characterForm = document.getElementById('characterForm');
    const countrySelect = document.getElementById('country');
    const cultureSelect = document.getElementById('culture');

    // Initialize form components
    initCountryDropdown();
    initCultureDropdown();
    setupEventListeners();

    /**
     * Initializes the country dropdown with grouped options
     * @function initCountryDropdown
     * @throws {Error} If COUNTRIES data is not loaded
     */
    function initCountryDropdown() {
        try {
            countrySelect.innerHTML = '<option value="" disabled selected>-- Select Country --</option>';
            
            if (!window.COUNTRIES || !Array.isArray(window.COUNTRIES)) {
                throw new Error('COUNTRIES data not loaded or invalid format');
            }

            // Group countries by continent
            const groupedCountries = window.COUNTRIES.reduce((groups, country) => {
                const continent = country.continent || 'Other';
                if (!groups[continent]) {
                    groups[continent] = [];
                }
                groups[continent].push(country);
                return groups;
            }, {});

            // Add grouped options to select
            Object.entries(groupedCountries).forEach(([continent, countries]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = continent;
                
                countries.forEach(country => {
                    const option = new Option(country.name, country.code);
                    optgroup.appendChild(option);
                });
                
                countrySelect.appendChild(optgroup);
            });

            console.debug('Country dropdown initialized with', window.COUNTRIES.length, 'countries');
        } catch (error) {
            console.error('Failed to initialize country dropdown:', error);
            countrySelect.innerHTML = '<option value="error" disabled>Error loading countries</option>';
            countrySelect.disabled = true;
        }
    }

    /**
     * Initializes the culture dropdown in disabled state
     * @function initCultureDropdown
     */
    function initCultureDropdown() {
        cultureSelect.innerHTML = '<option value="" disabled selected>-- Select Country First --</option>';
        cultureSelect.disabled = true;
    }

    /**
     * Handles country selection change
     * @function handleCountryChange
     */
    function handleCountryChange() {
        cultureSelect.disabled = !this.value;
        // Actual culture population handled by cultures.js
    }

    /**
     * Creates a character object from form data
     * @function createCharacterObject
     * @param {Object} formData - Form input values
     * @returns {Object} Character data object
     */
    function createCharacterObject(formData) {
        return {
            id: '', // Will be set in saveCharacter
            name: formData.name,
            age: formData.age,
            gender: formData.gender,
            country: {
                code: formData.countryCode,
                name: formData.countryName
            },
            culture: {
                code: formData.cultureCode,
                name: formData.cultureName
            },
            stats: {
                health: 100,
                happiness: 75,
                education: 50,
                wealth: 25,
                fitness: 50,
                intelligence: 50,
                charisma: 50
            },
            skills: {
                programming: 0,
                communication: 0,
                leadership: 0,
                cooking: 0,
                driving: 0,
                creativity: 0
            },
            finances: {
                cash: 1000,
                bank: 0,
                debt: 0,
                creditScore: 650,
                monthlyIncome: 0,
                monthlyExpenses: 0
            },
            education: [],
            jobs: [],
            relationships: [],
            inventory: [],
            properties: [],
            version: '1.1',
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Saves character data to localStorage
     * @function saveCharacter
     * @param {Object} character - Character data object
     * @returns {string} The generated character ID
     * @throws {Error} If saving fails
     */
    function saveCharacter(character) {
        try {
            const characterId = 'char_' + Date.now();
            character.id = characterId;
            
            // Prepare save data
            const saveData = {
                ...character,
                lastPlayed: new Date().toISOString()
            };

            // Save full character data
            localStorage.setItem(`lifeSimCharacter_${characterId}`, JSON.stringify(saveData));
            
            // Update characters list
            const characters = JSON.parse(localStorage.getItem('lifeSimCharacters')) || [];
            characters.push({
                id: characterId,
                name: character.name,
                age: character.age,
                gender: character.gender,
                country: character.country,
                culture: character.culture,
                createdAt: character.createdAt,
                lastPlayed: saveData.lastPlayed
            });
            localStorage.setItem('lifeSimCharacters', JSON.stringify(characters));
            
            // Set as current character
            localStorage.setItem('currentCharacterId', characterId);
            
            console.debug('Character saved successfully:', saveData);
            return characterId;
        } catch (error) {
            console.error('Failed to save character:', error);
            throw new Error('Failed to save character data');
        }
    }

    /**
     * Handles form submission
     * @function handleFormSubmit
     * @param {Event} e - Form submit event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            // Validate form
            if (!characterForm.checkValidity()) {
                e.stopPropagation();
                characterForm.classList.add('was-validated');
                return;
            }
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                age: parseInt(document.getElementById('age').value) || 18,
                gender: document.getElementById('gender').value,
                countryCode: countrySelect.value,
                countryName: countrySelect.options[countrySelect.selectedIndex].text,
                cultureCode: cultureSelect.value,
                cultureName: cultureSelect.options[cultureSelect.selectedIndex].text
            };

            // Validate required fields
            if (!formData.name || !formData.countryCode || !formData.cultureCode) {
                throw new Error('Please fill all required fields');
            }

            // Create and save character
            const character = createCharacterObject(formData);
            const characterId = saveCharacter(character);
            
            // Debug verification before redirect
            console.debug('Redirecting to game with character:', {
                id: characterId,
                name: character.name,
                country: character.country,
                culture: character.culture
            });
            
            // Redirect to game page
            window.location.href = `game.html?characterId=${characterId}`;
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert(`Error: ${error.message}`);
        }
    }

    /**
     * Sets up event listeners
     * @function setupEventListeners
     */
    function setupEventListeners() {
        countrySelect.addEventListener('change', handleCountryChange);
        characterForm.addEventListener('submit', handleFormSubmit);
    }
});