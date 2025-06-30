// skill-learning.js
window.LEARNING_METHODS = {
    // General learning methods available for most skills
    general: [
        {
            id: 'self_study',
            name: "Self-Study",
            description: "Independent learning through books, online resources, and practice",
            timeRequired: "Varies (20-100 hours)",
            cost: 0,
            effectiveness: 0.7,
            requirements: {
                skills: ['time_management']
            },
            skillsGained: ['self_discipline'],
            stress: 15
        },
        {
            id: 'online_course',
            name: "Online Course",
            description: "Structured learning through platforms like Coursera, Udemy, or edX",
            timeRequired: "4-12 weeks",
            cost: 50,
            effectiveness: 0.8,
            requirements: {
                skills: ['time_management']
            },
            skillsGained: ['digital_literacy'],
            stress: 20
        },
        {
            id: 'community_college',
            name: "Community College Course",
            description: "Formal classroom instruction at local community college",
            timeRequired: "1 semester",
            cost: 300,
            effectiveness: 0.85,
            requirements: {
                education: ['high_school']
            },
            skillsGained: ['academic_writing'],
            stress: 30
        },
        {
            id: 'mentorship',
            name: "Find a Mentor",
            description: "One-on-one guidance from an experienced professional",
            timeRequired: "3-6 months",
            cost: 0,
            effectiveness: 0.9,
            requirements: {
                skills: ['networking']
            },
            skillsGained: ['professional_networking'],
            stress: 10
        },
        {
            id: 'volunteer',
            name: "Volunteer Work",
            description: "Gain experience while contributing to a cause",
            timeRequired: "3-6 months (part-time)",
            cost: 0,
            effectiveness: 0.75,
            requirements: {},
            skillsGained: ['teamwork'],
            stress: 20
        }
    ],

    // Specialized learning methods for specific skill categories
    category_specific: {
        technical: [
            {
                id: 'coding_bootcamp',
                name: "Coding Bootcamp",
                description: "Intensive programming training program",
                timeRequired: "12-24 weeks",
                cost: 10000,
                effectiveness: 0.95,
                requirements: {
                    skills: ['problem_solving']
                },
                skillsGained: ['programming', 'algorithms'],
                stress: 50
            },
            {
                id: 'open_source',
                name: "Contribute to Open Source",
                description: "Collaborate on real-world software projects",
                timeRequired: "3-6 months",
                cost: 0,
                effectiveness: 0.85,
                requirements: {
                    skills: ['programming']
                },
                skillsGained: ['version_control', 'teamwork'],
                stress: 25
            }
        ],
        medical: [
            {
                id: 'certification_program',
                name: "Certification Program",
                description: "Formal training for medical certifications",
                timeRequired: "6-12 months",
                cost: 2000,
                effectiveness: 0.9,
                requirements: {
                    education: ['high_school']
                },
                skillsGained: ['medical_terminology'],
                stress: 40
            },
            {
                id: 'clinical_shadowing',
                name: "Clinical Shadowing",
                description: "Observe professionals in healthcare settings",
                timeRequired: "1-3 months",
                cost: 0,
                effectiveness: 0.8,
                requirements: {
                    skills: ['professionalism']
                },
                skillsGained: ['patient_interaction'],
                stress: 15
            }
        ],
        creative: [
            {
                id: 'portfolio_projects',
                name: "Portfolio Projects",
                description: "Build a collection of creative work samples",
                timeRequired: "3-6 months",
                cost: 0,
                effectiveness: 0.85,
                requirements: {},
                skillsGained: ['project_management'],
                stress: 20
            },
            {
                id: 'creative_workshops',
                name: "Creative Workshops",
                description: "Short-term intensive creative training",
                timeRequired: "1-4 weeks",
                cost: 500,
                effectiveness: 0.75,
                requirements: {},
                skillsGained: ['creative_thinking'],
                stress: 15
            }
        ]
    },

    // Job-based learning opportunities
    job_based: [
        {
            id: 'internship',
            name: "Internship",
            description: "Structured work experience with training",
            timeRequired: "3-12 months",
            cost: 0,
            effectiveness: 0.9,
            requirements: {
                education: ['high_school']
            },
            skillsGained: ['professionalism'],
            stress: 30
        },
        {
            id: 'apprenticeship',
            name: "Apprenticeship",
            description: "Paid on-the-job training in skilled trades",
            timeRequired: "1-4 years",
            cost: 0,
            effectiveness: 0.95,
            requirements: {
                education: ['high_school']
            },
            skillsGained: ['trade_skills'],
            stress: 35
        },
        {
            id: 'part_time_job',
            name: "Part-Time Job",
            description: "Entry-level position with skill development",
            timeRequired: "6+ months",
            cost: 0,
            effectiveness: 0.7,
            requirements: {},
            skillsGained: ['work_ethic'],
            stress: 25
        }
    ],

    // Special learning methods for specific high-value skills
    skill_specific: {
        public_speaking: [
            {
                id: 'toastmasters',
                name: "Toastmasters",
                description: "Structured public speaking practice group",
                timeRequired: "6-12 months",
                cost: 100,
                effectiveness: 0.9,
                requirements: {},
                skillsGained: ['confidence'],
                stress: 20
            }
        ],
        foreign_language: [
            {
                id: 'language_immersion',
                name: "Language Immersion",
                description: "Intensive study in native-speaking environment",
                timeRequired: "3-6 months",
                cost: 5000,
                effectiveness: 0.95,
                requirements: {},
                skillsGained: ['cultural_awareness'],
                stress: 30
            },
            {
                id: 'language_exchange',
                name: "Language Exchange",
                description: "Practice with native speakers teaching each other",
                timeRequired: "6-12 months",
                cost: 0,
                effectiveness: 0.8,
                requirements: {},
                skillsGained: ['interpersonal_skills'],
                stress: 10
            }
        ],
        leadership: [
            {
                id: 'leadership_program',
                name: "Leadership Program",
                description: "Structured leadership development curriculum",
                timeRequired: "6-12 months",
                cost: 2000,
                effectiveness: 0.85,
                requirements: {
                    skills: ['communication']
                },
                skillsGained: ['team_management'],
                stress: 25
            }
        ]
    }
};

// Skill learning pathways - maps skills to recommended learning methods
window.SKILL_LEARNING_PATHS = {
    // Technical skills
    programming: {
        best: 'coding_bootcamp',
        alternatives: ['online_course', 'open_source', 'internship']
    },
    cloud_platforms: {
        best: 'online_course',
        alternatives: ['self_study', 'mentorship']
    },
    data_analysis: {
        best: 'community_college',
        alternatives: ['online_course', 'volunteer']
    },

    // Medical skills
    patient_care: {
        best: 'certification_program',
        alternatives: ['clinical_shadowing', 'volunteer']
    },
    first_aid: {
        best: 'community_college',
        alternatives: ['online_course']
    },

    // Creative skills
    design: {
        best: 'portfolio_projects',
        alternatives: ['creative_workshops', 'online_course']
    },
    writing: {
        best: 'self_study',
        alternatives: ['online_course', 'mentorship']
    },

    // Professional skills
    time_management: {
        best: 'online_course',
        alternatives: ['self_study']
    },
    communication: {
        best: 'toastmasters',
        alternatives: ['community_college', 'volunteer']
    },

    // Trade skills
    welding: {
        best: 'apprenticeship',
        alternatives: ['community_college']
    },
    electrical_systems: {
        best: 'apprenticeship',
        alternatives: ['community_college']
    }
};

// Function to get learning options for a specific skill
window.getLearningOptions = function(skillId) {
    const skill = window.SKILLS[skillId];
    if (!skill) return [];
    
    const options = [];
    
    // Add general methods
    options.push(...window.LEARNING_METHODS.general);
    
    // Add category-specific methods
    if (window.LEARNING_METHODS.category_specific[skill.category]) {
        options.push(...window.LEARNING_METHODS.category_specific[skill.category]);
    }
    
    // Add job-based methods
    options.push(...window.LEARNING_METHODS.job_based);
    
    // Add skill-specific methods if available
    if (window.LEARNING_METHODS.skill_specific[skillId]) {
        options.push(...window.LEARNING_METHODS.skill_specific[skillId]);
    }
    
    return options;
};

// Function to get recommended learning path for a skill
window.getRecommendedLearning = function(skillId) {
    return window.SKILL_LEARNING_PATHS[skillId] || {
        best: 'online_course',
        alternatives: ['self_study', 'mentorship']
    };
};