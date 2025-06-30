// cultures.js - Enhanced version with region-based cultures
document.addEventListener('DOMContentLoaded', function() {
    window.culturesByCountry = {
        // North America
        'US': [
            'East Coast Urban', 
            'Southern', 
            'Midwestern', 
            'West Coast', 
            'Southwestern',
            'African-American',
            'Hispanic-American'
        ],
        'CA': [
            'English Canadian',
            'French Canadian',
            'First Nations',
            'Inuit',
            'Urban Canadian'
        ],
        'MX': [
            'Northern Mexican',
            'Central Mexican',
            'Southern Indigenous',
            'Mexico City Urban'
        ],

        // Europe
        'UK': [
            'English',
            'Scottish',
            'Welsh',
            'Northern Irish',
            'British Asian'
        ],
        'FR': [
            'Parisian',
            'Northern French',
            'Southern French',
            'Breton',
            'Alsatian'
        ],
        'DE': [
            'Northern German',
            'Southern German',
            'Bavarian',
            'Berlin Urban',
            'Turkish-German'
        ],
        'IT': [
            'Northern Italian',
            'Central Italian',
            'Southern Italian',
            'Sicilian',
            'Milanese'
        ],

        // Asia
        'JP': [
            'Kanto (Tokyo Area)',
            'Kansai (Osaka/Kyoto)',
            'Tohoku (Northern)',
            'Okinawan',
            'Urban Japanese'
        ],
        'CN': [
            'Northern Chinese',
            'Southern Chinese',
            'Cantonese',
            'Shanghainese',
            'Tibetan'
        ],
        'IN': [
            'North Indian',
            'South Indian',
            'Bengali',
            'Punjabi',
            'Mumbai Urban'
        ],

        // Oceania
        'AU': [
            'Urban Australian',
            'Outback',
            'Aboriginal',
            'Tasmanian',
            'Multicultural Australian'
        ],
        'NZ': [
            'Pākehā (European)',
            'Māori',
            'Pacific Islander',
            'Urban Kiwi'
        ],

        // Africa
        'ZA': [
            'Afrikaans',
            'Zulu',
            'Xhosa',
            'Cape Coloured',
            'Johannesburg Urban'
        ],
        'NG': [
            'Yoruba',
            'Igbo',
            'Hausa-Fulani',
            'Lagos Urban'
        ],

        // South America
        'BR': [
            'Paulista (São Paulo)',
            'Carioca (Rio)',
            'Bahian',
            'Amazonian',
            'Southern Brazilian'
        ],
        'AR': [
            'Porteño (Buenos Aires)',
            'Northern Argentine',
            'Andean',
            'Patagonian'
        ]
    };

    function initializeCultureDropdown() {
        const countrySelect = document.getElementById('country');
        const cultureSelect = document.getElementById('culture');
        
        if (!countrySelect || !cultureSelect) {
            console.warn('Culture dropdown elements not found - will retry');
            setTimeout(initializeCultureDropdown, 200); // Retry after 200ms
            return;
        }

        // Initialize culture dropdown
        cultureSelect.innerHTML = '<option value="" disabled selected>-- Select Country First --</option>';
        cultureSelect.disabled = true;

        // Handle country changes
        countrySelect.addEventListener('change', function() {
            const countryCode = this.value;
            cultureSelect.innerHTML = '<option value="" disabled selected>-- Select Culture --</option>';
            
            if (!countryCode) {
                cultureSelect.disabled = true;
                return;
            }

            const cultures = window.culturesByCountry[countryCode];
            
            if (cultures?.length) {
                cultureSelect.disabled = false;
                
                cultures.forEach(culture => {
                    const option = new Option(
                        culture, 
                        // Create code: first 3 letters + first letters of subsequent words
                        culture.replace(/(\w)\w*\s*/g, '$1').toLowerCase()
                    );
                    cultureSelect.add(option);
                });
                
                console.log(`Loaded ${cultures.length} cultures for ${countryCode}`);
            } else {
                const fallbackCultures = [
                    'Urban',
                    'Traditional',
                    'Northern',
                    'Southern',
                    'Coastal'
                ];
                
                cultureSelect.disabled = false;
                fallbackCultures.forEach(culture => {
                    cultureSelect.add(new Option(
                        `${countrySelect.options[countrySelect.selectedIndex].text} ${culture}`,
                        `${countryCode.toLowerCase()}-${culture.toLowerCase()}`
                    ));
                });
                console.warn(`Using fallback cultures for ${countryCode}`);
            }
        });

        // Trigger change if country is already selected
        if (countrySelect.value) {
            countrySelect.dispatchEvent(new Event('change'));
        }
    }

    // Initialize with slight delay
    setTimeout(initializeCultureDropdown, 50);
});