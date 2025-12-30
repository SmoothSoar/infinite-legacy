// property-data.js - Property definitions for Real Estate Management System

const PROPERTY_DATA = {
    residential: [
        // Budget Homes
        {
            id: 'tiny-house',
            name: 'Tiny House',
            price: 50000,
            description: 'A minimalist 200 sq ft tiny home with basic amenities.',
            type: 'residential',
            image: '',
            bedrooms: 1,
            bathrooms: 1,
            size: '200 sq ft',
            location: 'Rural Area',
            neighborhood: 'Tiny Home Community',
            condition: 'basic',
            yearBuilt: 2020,
            maintenance: 100,
            income: 0,
            appreciationRate: 0.02,
            furnishingCosts: {
                basic: 5000,
                standard: 10000,
                luxury: 20000
            },
            renovationOptions: [
                { name: 'Expand Loft', cost: 8000, addsValue: 12000, requiresPermit: true },
                { name: 'Add Deck', cost: 5000, addsValue: 7000, requiresPermit: true }
            ],
            zoning: 'residential',
            historicalSignificance: 0
        },
        // ... (all other residential properties)
    ],
    
    commercial: [
        // ... (all commercial properties)
    ],
    
    vacation: [
        // ... (all vacation properties)
    ],
    
    land: [
        // ... (all land properties)
    ]
};

// Export for CommonJS or ES Modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PROPERTY_DATA };
} else {
    window.PROPERTY_DATA = PROPERTY_DATA;
}
