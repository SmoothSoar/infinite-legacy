window.CAREERS = [
    // ================== MINIMUM WAGE SECTOR ==================
    {
        id: 'fast_food_worker',
        title: 'Fast Food Worker',
        sector: 'minimum_wage',
        employmentType: 'part-time',
        experienceLevel: 'entry',
        description: 'Prepare food and handle transactions.',
        salary: 1500,
        benefits: { freeMeals: true },
        requirements: {
            age: 16,
            education: ['none'],
            skills: []
        },
        skillsGained: ['time_management'],
        stress: 35,
        nextPositions: ['shift_supervisor']
    },
    {
        id: 'grocery_bagger',
        title: 'Grocery Bagger',
        sector: 'minimum_wage',
        employmentType: 'part-time',
        experienceLevel: 'entry',
        description: 'Pack groceries and assist customers.',
        salary: 1350,
        benefits: { employeeDiscount: true },
        requirements: {
            age: 16,
            education: ['none'],
            skills: []
        },
        skillsGained: ['time_management'],
        stress: 20,
        nextPositions: ['cashier']
    },

    // ================== TECHNOLOGY SECTOR ==================
    {
        id: 'junior_web_developer',
        title: 'Junior Web Developer',
        sector: 'technology',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Build websites using HTML/CSS/JavaScript.',
        salary: 4500,
        benefits: { remoteWork: true },
        requirements: {
            age: 18,
            education: ['certification'],
            skills: ['programming', 'critical_thinking']
        },
        skillsGained: ['data_analysis'],
        stress: 40,
        nextPositions: ['web_developer']
    },

    // ================== HEALTHCARE SECTOR ==================
    {
        id: 'nursing_assistant',
        title: 'Nursing Assistant',
        sector: 'healthcare',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Provide basic patient care.',
        salary: 3200,
        benefits: { healthInsurance: true },
        requirements: {
            age: 18,
            education: ['certification'],
            skills: ['first_aid', 'empathy']
        },
        skillsGained: ['time_management'],
        stress: 50,
        nextPositions: ['registered_nurse']
    },

    // ================== CREATIVE SECTOR ==================
    {
        id: 'graphic_designer',
        title: 'Graphic Designer',
        sector: 'creative',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Design visuals for brands.',
        salary: 4000,
        benefits: { portfolioBuilding: true },
        requirements: {
            age: 18,
            education: ['certification'],
            skills: ['graphic_design', 'creativity']
        },
        skillsGained: ['ui_ux'],
        stress: 35,
        nextPositions: ['senior_designer']
    },

    // ================== TRADES SECTOR ==================
    {
        id: 'auto_mechanic',
        title: 'Auto Mechanic',
        sector: 'trades',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Repair vehicles.',
        salary: 3800,
        benefits: { toolAllowance: 1000 },
        requirements: {
            age: 18,
            education: ['certification'],
            skills: ['automotive_repair', 'problem_solving']
        },
        skillsGained: ['engine_repair'],
        stress: 40,
        nextPositions: ['master_mechanic']
    }
];

window.JOB_FILTERS = {
    sector: ['minimum_wage', 'technology', 'healthcare', 'creative', 'trades'],
    employmentType: ['full-time', 'part-time'],
    experienceLevel: ['entry', 'intermediate', 'senior'],
    education: ['none', 'high_school', 'certification', 'bachelors']
};