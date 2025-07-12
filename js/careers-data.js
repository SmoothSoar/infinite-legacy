window.CAREERS = [
    // ================== MINIMUM WAGE SECTOR (NO SKILLS REQUIRED) ==================
    {
        id: 'pet_groomer',
        title: 'Pet Groomer',
        sector: 'minimum_wage',
        employmentType: 'part-time',
        experienceLevel: 'entry',
        description: 'Bathe, brush, and groom pets at a salon or mobile service.',
        salary: 880,
        benefits: { flexibleHours: true },
        requirements: {
            age: 16,
            education: ['none'],
            skills: []
        },
        skillsGained: ['empathy'],
        stress: 30,
        nextPositions: ['senior_groomer']
    },
    {
        id: 'delivery_driver',
        title: 'Delivery Driver',
        sector: 'minimum_wage',
        employmentType: 'part-time',
        experienceLevel: 'entry',
        description: 'Deliver food or packages using a car or bike.',
        salary: 920,
        benefits: { tips: true },
        requirements: {
            age: 18,
            education: ['none'],
            skills: []
        },
        skillsGained: ['time_management'],
        stress: 35,
        nextPositions: ['logistics_coordinator']
    },
    {
        id: 'library_aide',
        title: 'Library Aide',
        sector: 'minimum_wage',
        employmentType: 'part-time',
        experienceLevel: 'entry',
        description: 'Organize books and assist patrons at a public library.',
        salary: 850,
        benefits: { freeBookAccess: true },
        requirements: {
            age: 16,
            education: ['none'],
            skills: []
        },
        skillsGained: ['public_speaking'],
        stress: 20,
        nextPositions: ['library_assistant']
    },
    {
        id: 'farm_hand',
        title: 'Farm Hand',
        sector: 'minimum_wage',
        employmentType: 'seasonal',
        experienceLevel: 'entry',
        description: 'Assist with planting, harvesting, and livestock care.',
        salary: 800,
        benefits: { outdoorWork: true },
        requirements: {
            age: 16,
            education: ['none'],
            skills: []
        },
        skillsGained: ['strength_fitness'],
        stress: 25,
        nextPositions: ['farm_manager']
    },
    {
        id: 'call_center_agent',
        title: 'Call Center Agent',
        sector: 'minimum_wage',
        employmentType: 'part-time',
        experienceLevel: 'entry',
        description: 'Handle customer inquiries via phone or chat.',
        salary: 900,
        benefits: { remoteWork: true },
        requirements: {
            age: 16,
            education: ['none'],
            skills: []
        },
        skillsGained: ['empathy'],
        stress: 45,
        nextPositions: ['team_lead']
    },

    // ================== TECHNOLOGY SECTOR ==================
    {
        id: 'it_technician',
        title: 'IT Technician',
        sector: 'technology',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Troubleshoot hardware/software issues for employees.',
        salary: 1600,
        benefits: { remoteWork: true },
        requirements: {
            age: 18,
            education: ['certification'],
            skills: ['basic_it_support']
        },
        skillsGained: ['problem_solving'],
        stress: 40,
        nextPositions: ['systems_administrator']
    },
    {
        id: 'graphic_designer',
        title: 'Graphic Designer',
        sector: 'technology',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Create visual content for digital or print media.',
        salary: 1500,
        benefits: { creativeFreedom: true },
        requirements: {
            age: 18,
            education: ['graphic-design-cert'],
            skills: ['graphic_design']
        },
        skillsGained: ['storytelling'],
        stress: 35,
        nextPositions: ['art_director']
    },

    // ================== HEALTHCARE SECTOR ==================
    {
        id: 'nursing_assistant',
        title: 'Nursing Assistant',
        sector: 'healthcare',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Assist nurses with patient care in hospitals.',
        salary: 1400,
        benefits: { healthInsurance: true },
        requirements: {
            age: 18,
            education: ['certification'],
            skills: ['empathy', 'first_aid']
        },
        skillsGained: ['critical_thinking'],
        stress: 50,
        nextPositions: ['licensed_nurse']
    },

    // ================== TRADES SECTOR ==================
    {
        id: 'electrician_apprentice',
        title: 'Electrician Apprentice',
        sector: 'trades',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Assist with wiring and electrical installations.',
        salary: 1300,
        benefits: { unionBenefits: true },
        requirements: {
            age: 18,
            education: ['high_school'],
            skills: ['critical_thinking']
        },
        skillsGained: ['electrical_work'],
        stress: 40,
        nextPositions: ['electrician']
    },
    {
        id: 'plumber_apprentice',
        title: 'Plumber Apprentice',
        sector: 'trades',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Learn to install and repair plumbing systems.',
        salary: 1250,
        benefits: { unionBenefits: true },
        requirements: {
            age: 18,
            education: ['high_school'],
            skills: ['problem_solving']
        },
        skillsGained: ['plumbing'],
        stress: 45,
        nextPositions: ['plumber']
    },

    // ================== BUSINESS SECTOR ==================
    {
        id: 'sales_associate',
        title: 'Sales Associate',
        sector: 'business',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        description: 'Sell products/services and build client relationships.',
        salary: 1200,
        benefits: { commission: true },
        requirements: {
            age: 18,
            education: ['high_school'],
            skills: ['public_speaking']
        },
        skillsGained: ['negotiation'],
        stress: 40,
        nextPositions: ['sales_manager']
    }
];

window.JOB_FILTERS = {
    sector: ['minimum_wage', 'technology', 'healthcare', 'creative', 'trades', 'business'],
    employmentType: ['full-time', 'part-time', 'seasonal'],
    experienceLevel: ['entry', 'intermediate', 'senior'],
    education: ['none', 'high_school', 'certification', 'bachelors']
};