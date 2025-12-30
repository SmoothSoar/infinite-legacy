// degrees.js - Education Programs with Skill-Based Fields
// degrees.js - Education Programs with Skill-Based Fields
window.EDUCATION_PROGRAMS = [
    // ========== HIGH SCHOOL ==========
    {
        id: 'high-school-diploma',
        name: 'High School Diploma',
        type: 'high-school',
        field: 'General Education',
        duration: '4 years',
        cost: 0,
        difficulty: 2,
        maxAge: 19,
        minAge: 14,
        skillsGained: ['critical_thinking', 'time_management']
    },
    {
        id: 'ged',
        name: 'GED Certificate',
        type: 'high-school',
        field: 'General Education',
        duration: '1 year',
        cost: 500,
        difficulty: 2,
        maxAge: 19,
        minAge: 16,
        skillsGained: ['critical_thinking']
    },

    // ========== CERTIFICATIONS ==========
    {
        id: 'culinary-cert',
        name: 'Culinary Certificate',
        type: 'certification',
        field: 'Culinary',
        duration: '6 months',
        cost: 2000,
        difficulty: 3,
        minAge: 16,  // Minimum age for vocational programs
        skillsGained: ['cooking_nutrition', 'time_management']
    },
    {
        id: 'auto-mechanic-cert',
        name: 'Auto Mechanic Certification',
        type: 'certification',
        field: 'Automotive',
        duration: '1 year',
        cost: 3000,
        difficulty: 3,
        minAge: 16,  // Minimum age for vocational programs
        skillsGained: ['automotive_repair', 'critical_thinking']
    },
    {
        id: 'graphic-design-cert',
        name: 'Graphic Design Certificate',
        type: 'certification',
        field: 'Design',
        duration: '1 year',
        cost: 2500,
        difficulty: 3,
        minAge: 16,  // Minimum age for vocational programs
        skillsGained: ['graphic_design', 'creativity']
    },
    {
        id: 'ux-design-cert',
        name: 'UX Design Certificate',
        type: 'certification',
        field: 'Design',
        duration: '9 months',
        cost: 6000,
        difficulty: 3,
        minAge: 18,
        skillsGained: ['graphic_design', 'user_research', 'ui_prototyping']
    },

    // ========== ASSOCIATE DEGREES ==========
    {
        id: 'as-computer-science',
        name: 'AS Computer Science',
        type: 'associate',
        field: 'Technology',
        duration: '2 years',
        cost: 10000,
        difficulty: 4,
        minAge: 18,  // College-level minimum age
        skillsGained: ['programming', 'data_analysis']
    },
    {
        id: 'aas-nursing',
        name: 'AAS Nursing',
        type: 'associate',
        field: 'Healthcare',
        duration: '2 years',
        cost: 12000,
        difficulty: 4,
        minAge: 18,  // College-level minimum age
        skillsGained: ['first_aid', 'empathy']
    },
    {
        id: 'electrical-tech-associate',
        name: 'AS Electrical Technology',
        type: 'associate',
        field: 'Electrical',
        duration: '2 years',
        cost: 15000,
        difficulty: 4,
        minAge: 18,
        skillsGained: ['electrical_work', 'electrical_code']
    },
    {
        id: 'as-paramedic',
        name: 'AS Paramedic Science',
        type: 'associate',
        field: 'Emergency Services',
        duration: '2 years',
        cost: 18000,
        difficulty: 4,
        minAge: 18,
        skillsGained: ['emergency_response', 'first_aid', 'critical_thinking']
    },

    // ========== BACHELOR DEGREES ==========
    {
        id: 'ba-business',
        name: 'BA Business',
        type: 'bachelor',
        field: 'Business',
        duration: '4 years',
        cost: 40000,
        difficulty: 5,
        minAge: 18,  // College-level minimum age
        skillsGained: ['negotiation', 'financial_literacy']
    },
    {
        id: 'bs-computer-science',
        name: 'BS Computer Science',
        type: 'bachelor',
        field: 'Technology',
        duration: '4 years',
        cost: 45000,
        difficulty: 5,
        minAge: 18,  // College-level minimum age
        skillsGained: ['programming', 'critical_thinking', 'system_design']
    },
    {
        id: 'bs-data-analytics',
        name: 'BS Data Analytics',
        type: 'bachelor',
        field: 'Data Science',
        duration: '4 years',
        cost: 48000,
        difficulty: 5,
        minAge: 18,
        skillsGained: ['data_analysis', 'programming', 'statistics']
    },

    // ========== MASTER DEGREES ==========
    {
        id: 'mba',
        name: 'MBA',
        type: 'master',
        field: 'Business',
        duration: '2 years',
        cost: 60000,
        difficulty: 5,
        minAge: 21,  // Graduate-level minimum age
        skillsGained: ['leadership', 'financial_analysis']
    },
    {
        id: 'ms-computer-science',
        name: 'MS Computer Science',
        type: 'master',
        field: 'Technology',
        duration: '2 years',
        cost: 50000,
        difficulty: 5,
        minAge: 21,  // Graduate-level minimum age
        skillsGained: ['data_analysis', 'system_design']
    }
];

// ... rest of the file remains the same ...

// Prerequisites for programs
window.PREREQUISITES = {
    'mba': ['ba-business'],
    'ms-computer-science': ['bs-computer-science'],
    'ms-electrical-eng': ['bs-computer-science'],
    'ma-psychology': ['ba-psychology'],
    'mph': ['bs-biology', 'aas-nursing'],
    'mfa-design': ['graphic-design-cert'],
    'pmp-cert': ['aa-business'],
    'cpa-cert': ['ba-business'],
    'ccna-cert': ['as-computer-science'],
    'aws-cert': ['bs-computer-science'],
    'bs-data-analytics': ['as-computer-science']
};

// Field skills mapping (updated to match your skills.js)
window.FIELD_SKILLS = {
    'Business': ['negotiation', 'financial_literacy', 'leadership'],
    'Technology': ['programming', 'critical_thinking', 'system_design'],
    'Data Science': ['data_analysis', 'programming', 'statistics'],
    'Healthcare': ['first_aid', 'empathy', 'patient_care'],
    'Design': ['graphic_design', 'creativity', 'public_speaking', 'user_research', 'ui_prototyping'],
    'Electrical': ['electrical_work', 'electrical_code', 'critical_thinking'],
    'Emergency Services': ['emergency_response', 'first_aid', 'critical_thinking'],
    'Culinary': ['cooking_nutrition', 'time_management'],
    'Automotive': ['automotive_repair', 'critical_thinking', 'strength_fitness'],
    'General Education': ['critical_thinking', 'time_management']
};
