// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme if themeManager exists
    if (typeof themeManager !== 'undefined') {
        themeManager.initTheme();
        
        // Add theme toggle handler
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                themeManager.toggleTheme();
            });
        }
    }

    // DOM Elements
    const countrySelect = document.getElementById('country');
    const cultureSelect = document.getElementById('culture');
    const characterForm = document.getElementById('characterForm');
    
    // Debug: Check if COUNTRIES is loaded
    console.log('COUNTRIES available:', window.COUNTRIES);
    
    // Initialize Country Dropdown
    function initCountryDropdown() {
        // Clear existing options
        countrySelect.innerHTML = '';
        
        // Add default option
        const defaultOption = new Option('-- Select Country --', '', true, true);
        defaultOption.disabled = true;
        countrySelect.add(defaultOption);
        
        // Check if COUNTRIES is available
        if (!window.COUNTRIES || window.COUNTRIES.length === 0) {
            console.error('COUNTRIES data not loaded!');
            const errorOption = new Option('Error loading countries', 'error');
            countrySelect.add(errorOption);
            return;
        }
        
        // Add countries to dropdown
        window.COUNTRIES.forEach(country => {
            countrySelect.add(new Option(country.name, country.code));
        });
        
        console.log('Country dropdown initialized with', window.COUNTRIES.length, 'countries');
    }
    
    // Initialize Culture Dropdown
    function initCultureDropdown() {
        cultureSelect.innerHTML = '';
        const defaultOption = new Option('-- Select Country First --', '', true, true);
        defaultOption.disabled = true;
        cultureSelect.add(defaultOption);
    }
    
    // Handle Country Change
    function handleCountryChange() {
        const countryCode = this.value;
        console.log('Country selected:', countryCode);
        
        // This will be handled by cultures.js
        // We just need to ensure the event is triggered
    }
    
    // Handle Form Submission
    function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form elements
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const countrySelect = document.getElementById('country');
    const cultureSelect = document.getElementById('culture');
    
    // Create form data object
    const formData = {
        name: nameInput.value.trim(),
        age: parseInt(ageInput.value),
        gender: genderSelect.value,
        countryCode: countrySelect.value,
        countryName: countrySelect.options[countrySelect.selectedIndex].text,
        cultureCode: cultureSelect.value,
        cultureName: cultureSelect.options[cultureSelect.selectedIndex].text
    };
    
    // Validate inputs
    if (!validateForm(formData)) {
        return;
    }
    
    // Create and save character
    const character = createCharacterObject(formData);
    saveCharacter(character);
    
    // Redirect to game
    window.location.href = 'game.html';
}
    
    // Form Validation
    function validateForm(data) {
        if (!data.name) {
            alert('Please enter your character name');
            return false;
        }
        
        if (isNaN(data.age) || data.age < 1 || data.age > 100) {
            alert('Please enter a valid age between 1 and 100');
            return false;
        }
        
        if (!data.countryCode) {
            alert('Please select a country');
            return false;
        }
        
        if (!data.cultureCode) {
            alert('Please select a culture');
            return false;
        }
        
        return true;
    }
    
    // Create Character Object
  // In the createCharacterObject function:
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
            name: formData.cultureName,
            code: formData.cultureCode
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
        createdAt: new Date().toISOString()
    };
    
    console.log("Character data being saved:", character);
    return character;
}

    // Save Character to LocalStorage
    function saveCharacter(character) {
    try {
        console.log("DEBUG - Character data before saving:", character);
        localStorage.setItem('lifeSimCharacter', JSON.stringify(character));
        console.log("DEBUG - Saved character:", JSON.parse(localStorage.getItem('lifeSimCharacter')));
    } catch (e) {
        console.error('Error saving character:', e);
        alert('Error saving your character data. Please try again.');
    }
}
    
    // Initialize everything
    initCountryDropdown();
    initCultureDropdown();
    
    // Event Listeners
    countrySelect.addEventListener('change', handleCountryChange);
    characterForm.addEventListener('submit', handleFormSubmit);
    
    // Debug: Simulate country selection for testing
    // setTimeout(() => { countrySelect.value = 'US'; countrySelect.dispatchEvent(new Event('change')); }, 1000);
});