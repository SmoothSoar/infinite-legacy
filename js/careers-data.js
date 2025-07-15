window.CAREERS = [
    // ================ PART-TIME (NO EXPERIENCE) ================
    {
        id: 'fast_food_worker',
        title: 'Fast Food Worker',
        sector: 'food_service',
        employmentType: 'part-time',
        experienceLevel: 'entry',
        description: 'Prepare food and handle orders at a quick-service restaurant.',
        salary: 550,
        requirements: { age: 16, education: ['none'], skills: [] },
        skillsGained: ['multitasking'],
        stress: 40,
        nextPositions: ['shift_supervisor']
    },
    {
        id: 'grocery_bagger',
        title: 'Grocery Bagger',
        sector: 'retail',
        employmentType: 'part-time',
        experienceLevel: 'entry',
        description: 'Pack groceries and assist customers at checkout.',
        salary: 500,
        requirements: { age: 16, education: ['none'], skills: [] },
        skillsGained: ['customer_service'],
        stress: 20,
        nextPositions: ['cashier']
    },

    // ================ FULL-TIME ENTRY LEVEL ================
    {
        id: 'warehouse_picker',
        title: 'Warehouse Picker',
        sector: 'logistics',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Select and prepare merchandise for shipments.',
        salary: 1250,
        requirements: { age: 18, education: ['none'], skills: [] },
        skillsGained: ['inventory_management'],
        stress: 35,
        nextPositions: ['forklift_operator']
    },
    {
        id: 'security_guard',
        title: 'Security Guard',
        sector: 'protective_services',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Monitor premises and prevent security violations.',
        salary: 1400,
        requirements: { age: 18, education: ['high_school'], skills: [] },
        skillsGained: ['situational_awareness'],
        stress: 30,
        nextPositions: ['security_supervisor']
    },

    // ================ SKILLED TRADES ================
    {
        id: 'auto_mechanic',
        title: 'Auto Mechanic',
        sector: 'trades',
        employmentType: 'full-time',
        experienceLevel: 'skilled',
        description: 'Diagnose and repair vehicle mechanical issues.',
        salary: 1850,
        requirements: { 
            age: 18, 
            education: ['vocational'], 
            skills: ['mechanical_aptitude'] 
        },
        skillsGained: ['auto_repair'],
        stress: 45,
        nextPositions: ['master_mechanic']
    },
    {
        id: 'carpenter_apprentice',
        title: 'Carpenter Apprentice',
        sector: 'trades',
        employmentType: 'full-time',
        experienceLevel: 'skilled',
        description: 'Assist with construction and woodworking projects.',
        salary: 1600,
        requirements: { 
            age: 18, 
            education: ['high_school'], 
            skills: ['basic_math'] 
        },
        skillsGained: ['woodworking'],
        stress: 40,
        nextPositions: ['journeyman_carpenter']
    },

    // ================ TECHNOLOGY ================
    {
        id: 'help_desk_support',
        title: 'Help Desk Support',
        sector: 'technology',
        employmentType: 'full-time',
        experienceLevel: 'skilled',
        description: 'Provide technical assistance to computer users.',
        salary: 1950,
        requirements: { 
            age: 18, 
            education: ['certification'], 
            skills: ['computer_literacy'] 
        },
        skillsGained: ['troubleshooting'],
        stress: 35,
        nextPositions: ['it_specialist']
    },
    {
        id: 'web_developer_junior',
        title: 'Junior Web Developer',
        sector: 'technology',
        employmentType: 'full-time',
        experienceLevel: 'skilled',
        description: 'Build and maintain website components.',
        salary: 2250,
        requirements: { 
            age: 18, 
            education: ['certification'], 
            skills: ['html_css'] 
        },
        skillsGained: ['javascript'],
        stress: 50,
        nextPositions: ['web_developer']
    },

    // ================ PROFESSIONAL ================
    {
        id: 'registered_nurse',
        title: 'Registered Nurse',
        sector: 'healthcare',
        employmentType: 'full-time',
        experienceLevel: 'professional',
        description: 'Provide patient care and administer medications.',
        salary: 2850,
        requirements: { 
            age: 21, 
            education: ['bachelors'], 
            skills: ['anatomy'] 
        },
        skillsGained: ['patient_care'],
        stress: 60,
        nextPositions: ['nurse_practitioner']
    },
    {
        id: 'accountant_junior',
        title: 'Junior Accountant',
        sector: 'finance',
        employmentType: 'full-time',
        experienceLevel: 'professional',
        description: 'Prepare financial statements and verify records.',
        salary: 2450,
        requirements: { 
            age: 21, 
            education: ['bachelors'], 
            skills: ['basic_math'] 
        },
        skillsGained: ['financial_reporting'],
        stress: 45,
        nextPositions: ['senior_accountant']
    },

    // ================ MANAGEMENT ================
    {
        id: 'restaurant_manager',
        title: 'Restaurant Manager',
        sector: 'food_service',
        employmentType: 'full-time',
        experienceLevel: 'management',
        description: 'Oversee daily operations of food establishment.',
        salary: 3200,
        requirements: { 
            age: 21, 
            education: ['high_school'], 
            skills: ['leadership'],
            experience: ['food_service'] 
        },
        skillsGained: ['operations_management'],
        stress: 55
    },
    {
        id: 'it_project_manager',
        title: 'IT Project Manager',
        sector: 'technology',
        employmentType: 'full-time',
        experienceLevel: 'management',
        description: 'Coordinate technology projects and teams.',
        salary: 3800,
        requirements: { 
            age: 25, 
            education: ['bachelors'], 
            skills: ['project_management'],
            experience: ['technology'] 
        },
        skillsGained: ['agile_methodologies'],
        stress: 60
    }
];

window.JOB_FILTERS = {
    sector: [
        'food_service', 
        'retail', 
        'logistics', 
        'protective_services',
        'trades', 
        'technology', 
        'healthcare', 
        'finance'
    ],
    employmentType: ['part-time', 'full-time'],
    experienceLevel: [
        'entry', 
        'skilled', 
        'professional', 
        'management'
    ],
    education: [
        'none', 
        'high_school', 
        'vocational', 
        'certification', 
        'bachelors'
    ]
};