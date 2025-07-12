// neighborhood-data.js - Neighborhood definitions for Real Estate Management System

const NEIGHBORHOODS = {
    'Tiny Home Community': {
        developmentLevel: 2,
        safetyRating: 4,
        schoolQuality: 3,
        amenities: ['Community Garden', 'Shared Workspace'],
        futurePlans: [
            { description: 'New community center', effect: 'Increases property values by 5%', completionInMonths: 12 },
            { description: 'Expanded parking', effect: 'Reduces maintenance costs by 10%', completionInMonths: 6 }
        ]
    },
    // ... (all other neighborhoods)
};

const PERMIT_REQUIREMENTS = {
    'Rural Area': {
        renovation: { cost: 200, processingTime: 14 },
        expansion: { cost: 500, processingTime: 30 },
        zoningChange: { cost: 1500, processingTime: 90 }
    },
    // ... (all other permit requirements)
};

// Export for CommonJS or ES Modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NEIGHBORHOODS, PERMIT_REQUIREMENTS };
} else {
    window.NEIGHBORHOODS = NEIGHBORHOODS;
    window.PERMIT_REQUIREMENTS = PERMIT_REQUIREMENTS;
}