document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    if (typeof ThemeManager !== 'undefined') {
        ThemeManager.init();
    }

    // DOM Elements
    const characterForm = document.getElementById('characterForm');
    const countrySelect = document.getElementById('country');
    const cultureSelect = document.getElementById('culture');
    
    // Initialize form
    initCountryDropdown();
    initCultureDropdown();
    setupEventListeners();
    
    // Initialize Country Dropdown
    function initCountryDropdown() {
        countrySelect.innerHTML = '<option value="" disabled selected>-- Select Country --</option>';
        
        if (!window.COUNTRIES || window.COUNTRIES.length === 0) {
            console.error('COUNTRIES data not loaded!');
            countrySelect.innerHTML += '<option value="error" disabled>Error loading countries</option>';
            return;
        }
        
        // Group countries by continent
        const groupedCountries = {};
        window.COUNTRIES.forEach(country => {
            const continent = country.continent || 'Other';
            if (!groupedCountries[continent]) {
                groupedCountries[continent] = [];
            }
            groupedCountries[continent].push(country);
        });
        
        // Add grouped options
        for (const [continent, countries] of Object.entries(groupedCountries)) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = continent;
            
            countries.forEach(country => {
                const option = new Option(country.name, country.code);
                optgroup.appendChild(option);
            });
            
            countrySelect.appendChild(optgroup);
        }
        
        console.log('Country dropdown initialized with', window.COUNTRIES.length, 'countries');
    }
    
    // Initialize Culture Dropdown
    function initCultureDropdown() {
        cultureSelect.innerHTML = '<option value="" disabled selected>-- Select Country First --</option>';
        cultureSelect.disabled = true;
    }
    
    // Handle Country Change
    function handleCountryChange() {
        cultureSelect.disabled = !this.value;
        
        // The actual culture population is handled by cultures.js
        // We just ensure the dropdown is enabled/disabled properly
    }
    
    // Handle Form Submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!characterForm.checkValidity()) {
            e.stopPropagation();
            characterForm.classList.add('was-validated');
            return;
        }
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            countryCode: countrySelect.value,
            countryName: countrySelect.options[countrySelect.selectedIndex].text,
            cultureCode: cultureSelect.value,
            cultureName: cultureSelect.options[cultureSelect.selectedIndex].text
        };
        
        // Create and save character
        const character = createCharacterObject(formData);
        saveCharacter(character);
        
        // Redirect to game
        window.location.href = 'game.html';
    }
    
    // Create Character Object
    function createCharacterObject(formData) {
        const character = {
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
                wealth: 25
            },
            skills: {
                programming: 0,
                communication: 0,
                leadership: 0
            },
            inventory: [],
            finances: {
                cash: 5000,
                bank: 0,
                debt: 0
            },
            createdAt: new Date().toISOString()
        };
        
        console.log("Character created:", character);
        return character;
    }
    
    // Save Character to LocalStorage
    function saveCharacter(character) {
        try {
            localStorage.setItem('lifeSimCharacter', JSON.stringify(character));
            console.log("Character saved successfully");
        } catch (e) {
            console.error('Error saving character:', e);
            alert('Error saving your character data. Please try again.');
        }
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        countrySelect.addEventListener('change', handleCountryChange);
        characterForm.addEventListener('submit', handleFormSubmit);
    }
});