// education.js - Fully Refactored and Error-Resistant Version
class EducationManager {
    static gameState = null;
    static initialized = false;
    static elements = {};
    static selectedProgram = null;
    static eventListeners = [];
    static debug = true;
    static visibleProgramsCount = 6;
    
    // Constants with better organization
    static CONSTANTS = {
        MIN_GPA: 1.0,
        MAX_GPA: 4.0,
        DEFAULT_GPA: 3.2,
        EDUCATION_LEVELS: {
            HIGH_SCHOOL: 'High School',
            HIGH_SCHOOL_GRAD: 'High School Graduate',
            ASSOCIATE: 'Associate Degree',
            BACHELOR: "Bachelor's Degree",
            MASTER: "Master's Degree"
        },
        XP: {
            PER_PROGRAM: 500,
            PER_LEVEL: 1000
        },
        DEFAULT_STATE: {
            balance: 10000,
            currentYear: 1,
            totalMonths: 0,
            education: {
                level: 'High School',
                gpa: 3.2,
                enrolledPrograms: [],
                completedPrograms: [],
                skills: {}
            }
        }
    };

    // Error messages
    static ERROR_MESSAGES = {
        INIT_FAILED: 'Education system initialization failed',
        STATE_LOAD_FAILED: 'Failed to load education state',
        STATE_SAVE_FAILED: 'Failed to save education state',
        RENDER_FAILED: 'Failed to render education components',
        TIME_ADVANCE_FAILED: 'Failed to process time advancement'
    };

    /**
     * Initializes the EducationManager system
     */
    static init() {
        try {
            if (this.initialized) return;
            
            this.log('Initializing EducationManager...');
            
            // Load in specific order with validation
            this.loadEducationData();
            this.loadGameState();
            this.cacheElements();
            this.setupEventListeners();
            this.renderAll();
            
            this.initialized = true;
            this.log('EducationManager initialized successfully');
        } catch (error) {
            console.error(this.ERROR_MESSAGES.INIT_FAILED, error);
            EventManager.addToEventLog(this.ERROR_MESSAGES.INIT_FAILED, 'danger');
            throw error;
        }
    }

    static cleanup() {
        this.log('Cleaning up EducationManager...');
        this.removeEventListeners();
        this.elements = {};
        this.initialized = false;
    }

    // ===================================================================
    // DATA & STATE MANAGEMENT
    // ===================================================================

    static loadEducationData() {
        try {
            this.programs = Array.isArray(window.EDUCATION_PROGRAMS) ? window.EDUCATION_PROGRAMS : [];
            this.skillsData = typeof window.SKILLS === 'object' ? window.SKILLS : {};
            this.fieldSkills = typeof window.FIELD_SKILLS === 'object' ? window.FIELD_SKILLS : {};
            this.prerequisites = typeof window.PREREQUISITES === 'object' ? window.PREREQUISITES : {};
            this.log("Static education data loaded");
        } catch (e) {
            console.error('Error loading education data:', e);
            // Initialize with empty data if loading fails
            this.programs = [];
            this.skillsData = {};
            this.fieldSkills = {};
            this.prerequisites = {};
        }
    }

    static loadGameState() {
        try {
            const savedState = GameStateStorage.load('educationGameState');
            this.gameState = savedState ? this.validateGameState(savedState) : this.getDefaultGameState();
            this.log("Game state loaded");
        } catch (e) {
            console.error(this.ERROR_MESSAGES.STATE_LOAD_FAILED, e);
            this.gameState = this.getDefaultGameState();
            EventManager.addToEventLog(this.ERROR_MESSAGES.STATE_LOAD_FAILED, 'warning');
        }
    }

    static validateGameState(state) {
        try {
            // Deep clone to avoid modifying original
            const validated = JSON.parse(JSON.stringify(state));
            
            // Ensure education object exists
            validated.education = validated.education || {};
            
            // Validate enrolled programs
            validated.education.enrolledPrograms = this.validateEnrolledPrograms(
                validated.education.enrolledPrograms || []
            );
            
            // Validate completed programs
            validated.education.completedPrograms = this.validateProgramIds(
                validated.education.completedPrograms || []
            );
            
            // Initialize skills with proper structure
            validated.education.skills = this.initializeSkills(
                validated.education.skills || {}
            );
            
            // Validate GPA
            validated.education.gpa = this.validateGPA(
                validated.education.gpa
            );
            
            // Ensure other required fields exist
            validated.balance = typeof validated.balance === 'number' ? validated.balance : this.CONSTANTS.DEFAULT_STATE.balance;
            validated.currentYear = typeof validated.currentYear === 'number' ? validated.currentYear : this.CONSTANTS.DEFAULT_STATE.currentYear;
            validated.totalMonths = typeof validated.totalMonths === 'number' ? validated.totalMonths : this.CONSTANTS.DEFAULT_STATE.totalMonths;

            return validated;
        } catch (e) {
            console.error('Error validating game state:', e);
            return this.getDefaultGameState();
        }
    }

    static validateGPA(gpa) {
        const num = Number(gpa);
        return isNaN(num) ? this.CONSTANTS.DEFAULT_GPA : 
            Math.max(this.CONSTANTS.MIN_GPA, Math.min(this.CONSTANTS.MAX_GPA, num));
    }

    static getDefaultGameState() {
        return JSON.parse(JSON.stringify(this.CONSTANTS.DEFAULT_STATE));
    }

static validateEnrolledPrograms(programs) {
    return programs.filter(program => {
        if (!program?.id) return false;
        
        // Get program data to validate duration
        const programData = this.programs.find(p => p.id === program.id);
        const duration = this.getDurationInMonths(programData?.duration);
        
        return typeof program.progress === 'number' && 
               typeof program.monthsCompleted === 'number' &&
               duration > 0;
    });
}

    static validateProgramIds(programIds) {
        if (!Array.isArray(programIds)) return [];
        return programIds.filter(id => this.programs.some(p => p.id === id));
    }

    static initializeSkills(savedSkills = {}) {
        const skills = {};
        for (const skillId in this.skillsData) {
            const savedSkill = savedSkills[skillId];
            skills[skillId] = {
                ...this.skillsData[skillId],
                xp: typeof savedSkill?.xp === 'number' ? savedSkill.xp : 0,
                level: typeof savedSkill?.level === 'number' ? savedSkill.level : 1
            };
        }
        return skills;
    }

    // ===================================================================
    // UI MANAGEMENT
    // ===================================================================

    static cacheElements() {
        const elements = {
            programsContainer: document.querySelector('.education-programs-container'),
            currentProgress: this.getElementById('currentProgress'),
            skillMeter: this.getElementById('skillMeter'),
            eduLevel: this.getElementById('eduLevel'),
            gpaDisplay: this.getElementById('gpaDisplay'),
            yearDisplay: this.getElementById('yearDisplay'),
            balanceDisplay: this.getElementById('balanceDisplay'),
            startProgramBtn: this.getElementById('startProgramBtn'),
            modalTitle: this.getElementById('programDetailsTitle'),
            modalDescription: this.getElementById('programDetailsDescription'),
            modalSkills: this.getElementById('programDetailsSkills'),
            modalCareers: this.getElementById('programDetailsCareers'),
            modalPrerequisites: this.getElementById('programDetailsPrerequisites'),
            careerSection: this.getElementById('careerRelevanceSection'),
            prereqSection: this.getElementById('prerequisitesSection')
        };

        // Initialize modal if exists
        const modalElement = this.getElementById('programDetailsModal');
        if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            elements.modal = new bootstrap.Modal(modalElement);
        }

        this.elements = elements;
    }

    static getElementById(id) {
        try {
            return document.getElementById(id);
        } catch (e) {
            this.log(`Error getting element with ID ${id}:`, e);
            return null;
        }
    }

  static setupEventListeners() {
    this.removeEventListeners(); // Clean up any existing listeners

    // Program click listener
    if (this.elements.programsContainer) {
        this.addListener(this.elements.programsContainer, 'click', (e) => {
            const button = e.target.closest('.program-action-btn');
            if (button && button.dataset.programId) {
                e.preventDefault();
                this.showProgramDetails(button.dataset.programId);
            }
        });
    }

    // Enroll button listener
    if (this.elements.startProgramBtn) {
        this.addListener(this.elements.startProgramBtn, 'click', () => {
            if (this.selectedProgram) {
                this.handleEnroll(this.selectedProgram.id);
            }
        });
    }

    // Time advancement listener - MODIFIED THIS PART
    this.addListener(document, 'timeAdvanced', (e) => {
        this.handleTimeAdvanced(e.detail);
    });

    // Storage listener
    this.addListener(window, 'storage', (e) => {
        if (e.key === 'educationGameState' || e.key === 'educationUpdateTrigger') {
            this.log('Detected education state change from storage');
            this.loadGameState();
            this.renderAll();
            
            if (typeof GameManager !== 'undefined' && GameManager.currentEducationContainer) {
                GameManager.renderCurrentEducation();
            }
        }
    });

    // Filter button listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        if (button.dataset.filter) {
            this.addListener(button, 'click', (e) => {
                e.preventDefault();
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.renderPrograms(button.dataset.filter);
            });
        }
    });
}

    static addListener(element, type, listener) {
        if (!element || !type || !listener) return;
        
        try {
            element.addEventListener(type, listener);
            this.eventListeners.push({ element, type, listener });
        } catch (e) {
            this.log('Error adding event listener:', e);
        }
    }

    static removeEventListeners() {
        this.eventListeners.forEach(({ element, type, listener }) => {
            try {
                element?.removeEventListener(type, listener);
            } catch (e) {
                this.log('Error removing event listener:', e);
            }
        });
        this.eventListeners = [];
    }

    // ===================================================================
    // CORE FUNCTIONALITY
    // ===================================================================

    static handleTimeAdvanced(timeState) {
    try {
        // Validate input
        if (!timeState || typeof timeState !== 'object') {
            this.log('Invalid timeState object');
            return;
        }

        this.log('Handling time advancement:', timeState);

        // Update progress
        this.updateQuarterlyProgress();
        this.updateYearlyProgress();

        // Save and render
        this.saveGameState();
        this.debouncedRender();
        
        // Handle age changes
        if (timeState.isNewAge && typeof timeState.age === 'number') {
            this.handleAgeChange(timeState.age);
        }

        // Notify CareerManager if available
        if (typeof CareerManager !== 'undefined') {
            try {
                if (typeof CareerManager.loadGameState === 'function') {
                    CareerManager.loadGameState();
                }
                CareerManager.handleTimeAdvanced(timeState);
            } catch (e) {
                this.log('Error in CareerManager.handleTimeAdvanced:', e);
                EventManager.addToEventLog('Career update failed', 'warning');
            }
        }

        // Notify other systems
        this.dispatchEvent('educationTimeAdvanced', { timeState });

    } catch (error) {
        console.error(this.ERROR_MESSAGES.TIME_ADVANCE_FAILED, error);
        EventManager.addToEventLog(this.ERROR_MESSAGES.TIME_ADVANCE_FAILED, 'danger');
    }
}

    static dispatchEvent(name, detail) {
        try {
            document.dispatchEvent(new CustomEvent(name, { detail }));
        } catch (e) {
            this.log(`Error dispatching event ${name}:`, e);
        }
    }

static updateQuarterlyProgress() {
    if (!this.gameState?.education?.enrolledPrograms) return;

    const { education } = this.gameState;
    
    // Process in reverse order to allow safe removal
    for (let i = education.enrolledPrograms.length - 1; i >= 0; i--) {
        const program = education.enrolledPrograms[i];
        
        // Get program data from the static programs list
        const programData = this.programs.find(p => p.id === program.id);
        if (!programData) continue; // Skip if program data not found
        
        // Ensure totalDuration is set correctly
        program.totalDuration = this.getDurationInMonths(programData.duration);
        if (program.totalDuration <= 0) {
            console.warn(`Invalid duration for program ${program.id}`);
            continue; // Skip if duration is invalid
        }
        
        // Update progress
        program.monthsCompleted += 3;
        program.progress = Math.min(100, (program.monthsCompleted / program.totalDuration) * 100);

        // Check for dropout
        if (this.shouldDropout(program)) {
            this.handleDropout(program);
            continue;
        }

        // Check for completion
        if (program.monthsCompleted >= program.totalDuration) {
            this.completeProgram(program.id);
        }
    }

    // Update GPA with bounds checking
    if (typeof education.gpa === 'number') {
        education.gpa = this.validateGPA(
            education.gpa * (0.95 + Math.random() * 0.1)
        );
    } else {
        education.gpa = this.CONSTANTS.DEFAULT_GPA;
    }
}

    static shouldDropout(program) {
        if (!program?.id) return false;
        
        const programData = this.programs.find(p => p.id === program.id);
        const dropoutChance = typeof programData?.failureRate === 'number' ? programData.failureRate : 0;
        
        const gpaFactor = this.gameState.education.gpa < 2.0 ? 2 : 1;
        return Math.random() < (dropoutChance * gpaFactor);
    }

    static handleDropout(program) {
        if (!program?.id || !program?.cost) return;

        const costLost = program.cost * 0.3;
        this.gameState.balance -= costLost;
        this.gameState.education.enrolledPrograms = 
            this.gameState.education.enrolledPrograms.filter(p => p.id !== program.id);
        
        EventManager.addToEventLog(
            `Dropped out of ${program.name}! Lost $${costLost.toLocaleString()} and all progress.`, 
            'danger'
        );
    }

    static updateYearlyProgress() {
        if (!this.gameState) return;
        
        this.gameState.totalMonths += 12;
        this.gameState.currentYear = 1 + Math.floor(this.gameState.totalMonths / 12);
    }
    
    static handleAgeChange(newAge) {
        if (newAge === 18) {
            EventManager.addToEventLog("You've turned 18 and are now eligible for higher education!", 'info');
        }
    }

    static handleEnroll(programId) {
    try {
        const program = this.programs.find(p => p.id === programId);
        if (!program) return;

        // Check enrollment status
        if (this.isProgramEnrolled(programId)) {
            EventManager.addToEventLog('Already enrolled in this program', 'warning');
            return;
        }

        if (this.isProgramCompleted(programId)) {
            EventManager.addToEventLog('Already completed this program', 'warning');
            return;
        }

        // Age validation - only for high school programs
        const characterAge = TimeManager?.timeState?.age || 14;
        
        if (program.type === 'high-school') {
            if (program.maxAge && characterAge > program.maxAge) {
                EventManager.addToEventLog(`Too old for this program (max age: ${program.maxAge})`, 'warning');
                return;
            }

            if (program.minAge && characterAge < program.minAge) {
                EventManager.addToEventLog(`Too young for this program (min age: ${program.minAge})`, 'warning');
                return;
            }
        }

        // Rest of the enrollment logic remains the same...
        const missingPrereqs = this.getMissingPrerequisites(programId);
        if (missingPrereqs.length > 0) {
            const prereqNames = missingPrereqs.map(id => 
                this.programs.find(p => p.id === id)?.name || id
            ).join(', ');
            EventManager.addToEventLog(`Missing prerequisites: ${prereqNames}`, 'danger');
            return;
        }

        // Check funds
        if (this.gameState.balance < program.cost) {
            EventManager.addToEventLog(`Insufficient funds for ${program.name} ($${program.cost})`, 'danger');
            return;
        }

        // All checks passed - enroll student
        this.enrollStudent(program);

    } catch (e) {
        console.error('Error enrolling in program:', e);
        EventManager.addToEventLog('Failed to enroll in program', 'danger');
    }
}

static enrollStudent(program) {
    if (!program?.id || !program?.name || !program?.field || !program?.type || !program?.duration) {
        console.error('Invalid program data:', program);
        return;
    }

    const durationMonths = this.getDurationInMonths(program.duration);
    if (durationMonths <= 0) {
        console.error('Invalid program duration:', program.duration);
        return;
    }

    this.gameState.balance -= program.cost;
    
    const enrolledProgram = {
        id: program.id,
        name: program.name,
        field: program.field,
        type: program.type,
        progress: 0,
        monthsCompleted: 0,
        totalDuration: durationMonths,
        cost: program.cost
    };
    
    this.gameState.education.enrolledPrograms.push(enrolledProgram);
    this.saveGameState();
    
    if (this.elements.modal?.hide) {
        this.elements.modal.hide();
    }
    
    this.debouncedRender();
    EventManager.addToEventLog(`Enrolled in ${program.name}`, 'success');
}

    static completeProgram(programId) {
        if (!programId || !this.gameState?.education) return;

        const edu = this.gameState.education;
        const programIndex = edu.enrolledPrograms.findIndex(p => p.id === programId);
        if (programIndex === -1) return;

        const program = edu.enrolledPrograms[programIndex];
        edu.enrolledPrograms.splice(programIndex, 1);

        if (!edu.completedPrograms.includes(program.id)) {
            edu.completedPrograms.push(program.id);
        }

        this.updateSkillsFromProgram(program);
        this.updateEducationLevel(program);
        this.saveGameState();

        this.dispatchEvent('educationCompleted', { programId: program.id });
        EventManager.addToEventLog(`Completed ${program.name}!`, 'success');
    }
    
    static updateSkillsFromProgram(program) {
        if (!program?.field || !this.fieldSkills[program.field]) return;

        const skillsToUpdate = this.fieldSkills[program.field];
        skillsToUpdate.forEach(skillId => {
            const skill = this.gameState.education.skills[skillId];
            if (skill) {
                skill.xp += this.CONSTANTS.XP.PER_PROGRAM;
                skill.level = Math.floor(skill.xp / this.CONSTANTS.XP.PER_LEVEL) + 1;
            }
        });
    }

    static updateEducationLevel(program) {
        if (!program?.type || !program?.id || !program?.name) return;

        if (program.type === 'degree') {
            if (program.name.includes('Master')) {
                this.gameState.education.level = this.CONSTANTS.EDUCATION_LEVELS.MASTER;
            } else if (program.name.includes('Bachelor')) {
                this.gameState.education.level = this.CONSTANTS.EDUCATION_LEVELS.BACHELOR;
            } else if (program.name.includes('Associate')) {
                this.gameState.education.level = this.CONSTANTS.EDUCATION_LEVELS.ASSOCIATE;
            }
        } else if (['hs-diploma', 'ged'].includes(program.id)) {
            this.gameState.education.level = this.CONSTANTS.EDUCATION_LEVELS.HIGH_SCHOOL_GRAD;
        }
    }

    // ===================================================================
    // RENDERING
    // ===================================================================

    static renderAll() {
        try {
            this.renderPrograms();
            this.renderCurrentProgress();
            this.renderSkills();
            this.updateStats();
        } catch (e) {
            console.error(this.ERROR_MESSAGES.RENDER_FAILED, e);
            EventManager.addToEventLog(this.ERROR_MESSAGES.RENDER_FAILED, 'danger');
        }
    }

    static renderPrograms(filter = 'all') {
        if (!this.elements.programsContainer) return;

        try {
            const filteredPrograms = this.getFilteredPrograms(filter);
            
            if (filteredPrograms.length === 0) {
                this.elements.programsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info">No programs match the selected filter</div>
                    </div>
                `;
                return;
            }

            const programsToDisplay = filter === 'all' 
                ? filteredPrograms.slice(0, this.visibleProgramsCount)
                : filteredPrograms;

            this.elements.programsContainer.innerHTML = programsToDisplay
                .map(program => this.renderProgramCard(program))
                .join('');

            this.addLoadMoreButton(filter, filteredPrograms);
        } catch (e) {
            console.error('Error rendering programs:', e);
            this.elements.programsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">Error loading programs</div>
                </div>
            `;
        }
    }

    static getFilteredPrograms(filter) {
        if (!Array.isArray(this.programs)) return [];
        
        return this.programs.filter(program => {
            if (!program?.type) return false;
            
            switch (filter) {
                case 'all': return true;
                case 'high-school': return program.type === 'high-school';
                case 'certificates': return program.type === 'certificate';
                case 'associate': 
                    return program.type === 'degree' && 
                        (program.name.includes('Associate') || program.level === 'associate');
                case 'bachelor': 
                    return program.type === 'degree' && 
                        (program.name.includes('Bachelor') || program.level === 'bachelor');
                case 'master': 
                    return program.type === 'degree' && 
                        (program.name.includes('Master') || program.level === 'master');
                default: return false;
            }
        });
    }

    static renderProgramCard(program) {
        if (!program?.id || !program?.name || !program?.type || !program?.field || !program?.duration) {
            return ''; // Skip invalid programs
        }

        const isEnrolled = this.isProgramEnrolled(program.id);
        const isCompleted = this.isProgramCompleted(program.id);
        const canEnroll = this.getMissingPrerequisites(program.id).length === 0;

        let buttonText = 'View Details';
        let buttonDisabled = false;
        let statusBadge = '';

        if (isCompleted) {
            statusBadge = '<span class="badge bg-success">Completed</span>';
            buttonDisabled = true;
        } else if (isEnrolled) {
            const enrolled = this.getEnrolledProgram(program.id);
            const progress = enrolled?.progress || 0;
            statusBadge = `<span class="badge bg-primary">${Math.round(progress)}%</span>`;
        } else if (!canEnroll) {
            statusBadge = '<span class="badge bg-secondary">Locked</span>';
            buttonDisabled = true;
        }
        
        // Safely get difficulty stars
        const difficultyStars = typeof program.difficulty === 'number' ? 
            '★'.repeat(Math.min(5, Math.max(1, program.difficulty))) : '★';
        
        // Safely format cost
        const cost = typeof program.cost === 'number' ? 
            program.cost.toLocaleString() : '0';

        return `
            <div class="col-md-6 col-lg-4">
                <div class="education-program-card card h-100">
                    <div class="card-body">
                        ${statusBadge}
                        <div class="program-card-header">
                            <h3 class="h5">${program.name}</h3>
                            <span class="badge bg-dark">${program.type.toUpperCase()}</span>
                        </div>
                        <p><strong>${program.field}</strong> • ${program.duration}</p>
                        <div class="program-details">
                            <span class="badge bg-warning">${difficultyStars}</span>
                            <span class="badge bg-success">$${cost}</span>
                        </div>
                        ${this.renderCareerRelevance(program)}
                        <button class="btn btn-primary program-action-btn mt-2" 
                                data-program-id="${program.id}" ${buttonDisabled ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static addLoadMoreButton(filter, filteredPrograms) {
        if (filter !== 'all' || this.visibleProgramsCount >= filteredPrograms.length) return;

        const loadMoreBtn = document.createElement('div');
        loadMoreBtn.className = 'col-12 text-center mt-3';
        loadMoreBtn.innerHTML = `
            <button class="btn btn-outline-primary" id="loadMoreProgramsBtn">
                Load More (${filteredPrograms.length - this.visibleProgramsCount} remaining)
            </button>
        `;
        this.elements.programsContainer.appendChild(loadMoreBtn);

        this.addListener(document.getElementById('loadMoreProgramsBtn'), 'click', () => {
            this.visibleProgramsCount += 6;
            this.renderPrograms(filter);
        });
    }
    
    static renderCareerRelevance(program) {
        if (!window.CAREERS || !Array.isArray(window.CAREERS)) return '';
        
        const relevantCareers = window.CAREERS.filter(c => 
            c?.requirements?.education?.includes(program.id)
        );
        
        if (relevantCareers.length === 0) return '';
        
        return `
            <div class="career-relevance">
                <small>Leads to:</small>
                <div class="d-flex flex-wrap gap-1">
                    ${relevantCareers.slice(0, 2).map(c => 
                        `<span class="badge bg-info">${c?.title || 'Unknown Career'}</span>`
                    ).join('')}
                    ${relevantCareers.length > 2 ? 
                        `<span class="badge bg-secondary">+${relevantCareers.length - 2}</span>` : ''}
                </div>
            </div>`;
    }

    static renderCurrentProgress() {
        if (!this.elements.currentProgress) return;

        try {
            const enrolled = this.gameState?.education?.enrolledPrograms || [];
            
            if (enrolled.length === 0) {
                this.elements.currentProgress.innerHTML = '<div class="alert alert-info">Not enrolled in any programs</div>';
                return;
            }

            this.elements.currentProgress.innerHTML = enrolled.map(program => `
                <div class="current-program-item">
                    <div class="d-flex justify-content-between">
                        <strong>${program.name || 'Unknown Program'}</strong>
                        <span>${Math.round(program.progress || 0)}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${program.progress || 0}%"></div>
                    </div>
                    <small>${program.monthsCompleted || 0}/${program.totalDuration || 0} months</small>
                </div>
            `).join('');
        } catch (e) {
            console.error('Error rendering current progress:', e);
            this.elements.currentProgress.innerHTML = '<div class="alert alert-danger">Error loading progress</div>';
        }
    }

    static renderSkills() {
        if (!this.elements.skillMeter) return;

        try {
            const skills = this.gameState?.education?.skills || {};
            const activeSkills = Object.values(skills).filter(s => s?.xp > 0);
            
            if (activeSkills.length === 0) {
                this.elements.skillMeter.innerHTML = '<div class="alert alert-info">No skills developed yet</div>';
                return;
            }

            this.elements.skillMeter.innerHTML = activeSkills
                .sort((a, b) => (b?.level || 0) - (a?.level || 0) || (b?.xp || 0) - (a?.xp || 0))
                .map(skill => this.renderSkillItem(skill))
                .join('');
        } catch (e) {
            console.error('Error rendering skills:', e);
            this.elements.skillMeter.innerHTML = '<div class="alert alert-danger">Error loading skills</div>';
        }
    }

    static renderSkillItem(skill) {
        if (!skill?.name || !skill?.xp || !skill?.level) return '';
        
        const currentLevelXp = skill.xp % this.CONSTANTS.XP.PER_LEVEL;
        const progressPercent = (currentLevelXp / this.CONSTANTS.XP.PER_LEVEL) * 100;
        
        return `
            <div class="skill-item">
                <div class="d-flex justify-content-between">
                    <span>${skill.name}</span>
                    <span>Lvl ${skill.level}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <small>${currentLevelXp}/${this.CONSTANTS.XP.PER_LEVEL} XP</small>
            </div>`;
    }

    static updateStats() {
        if (!this.gameState?.education) return;

        const edu = this.gameState.education;
        
        if (this.elements.eduLevel) {
            this.elements.eduLevel.textContent = edu.level || this.CONSTANTS.EDUCATION_LEVELS.HIGH_SCHOOL;
        }
        
        if (this.elements.gpaDisplay) {
            this.elements.gpaDisplay.textContent = typeof edu.gpa === 'number' ? 
                edu.gpa.toFixed(2) : this.CONSTANTS.DEFAULT_GPA.toFixed(2);
        }
        
        if (this.elements.yearDisplay) {
            this.elements.yearDisplay.textContent = `Year ${this.gameState.currentYear || 1}`;
        }
        
        if (this.elements.balanceDisplay) {
            this.elements.balanceDisplay.textContent = `$${typeof this.gameState.balance === 'number' ? 
                this.gameState.balance.toLocaleString() : '0'}`;
        }
    }
    
    static showProgramDetails(programId) {
        try {
            if (!programId || !this.elements.modal) return;

            const program = this.programs.find(p => p.id === programId);
            if (!program) return;

            this.selectedProgram = program;

            // Populate modal content with safe checks
            if (this.elements.modalTitle) {
                this.elements.modalTitle.textContent = program.name || 'Unknown Program';
            }

            if (this.elements.modalDescription) {
                this.elements.modalDescription.innerHTML = `
                    <p><strong>Field:</strong> ${program.field || 'Unknown'}</p>
                    <p><strong>Type:</strong> ${program.type || 'Unknown'}</p>
                    <p><strong>Duration:</strong> ${program.duration || 'Unknown'} (${this.getDurationInMonths(program.duration)} months)</p>
                    <p><strong>Cost:</strong> $${typeof program.cost === 'number' ? program.cost.toLocaleString() : '0'}</p>
                `;
            }

            // Populate skills
            if (this.elements.modalSkills) {
                const fieldSkills = program.field ? this.fieldSkills[program.field] || [] : [];
                this.elements.modalSkills.innerHTML = fieldSkills.map(id => {
                    const skill = this.skillsData[id];
                    return skill ? `<li>${skill.name} <span class="badge bg-success">+${this.CONSTANTS.XP.PER_PROGRAM} XP</span></li>` : '';
                }).join('') || '<li>No specific skills listed</li>';
            }

            // Populate careers
            if (this.elements.careerSection && this.elements.modalCareers) {
                const relevantCareers = window.CAREERS?.filter(c => 
                    c?.requirements?.education?.includes(program.id)
                ) || [];
                
                if (relevantCareers.length > 0) {
                    this.elements.careerSection.style.display = 'block';
                    this.elements.modalCareers.innerHTML = `<ul>${
                        relevantCareers.map(c => 
                            `<li>${c.title || 'Unknown'} ($${typeof c.baseSalary === 'number' ? 
                                c.baseSalary.toLocaleString() : '0'}/yr)</li>`
                        ).join('')
                    }</ul>`;
                } else {
                    this.elements.careerSection.style.display = 'none';
                }
            }

            // Populate prerequisites
            if (this.elements.prereqSection && this.elements.modalPrerequisites) {
                const prereqs = this.prerequisites[program.id] || [];
                if (prereqs.length > 0) {
                    this.elements.prereqSection.style.display = 'block';
                    this.elements.modalPrerequisites.innerHTML = prereqs.map(id => {
                        const p = this.programs.find(prog => prog.id === id);
                        const isCompleted = this.isProgramCompleted(id);
                        return `<li class="${isCompleted ? 'text-success' : 'text-danger'}">${
                            p ? p.name : id
                        } ${isCompleted ? '(Completed)' : '(Required)'}</li>`;
                    }).join('');
                } else {
                    this.elements.prereqSection.style.display = 'none';
                }
            }

            // Update enroll button
            if (this.elements.startProgramBtn) {
                const isEnrolled = this.isProgramEnrolled(programId);
                const isCompleted = this.isProgramCompleted(programId);
                const canEnroll = this.getMissingPrerequisites(programId).length === 0;
                
                this.elements.startProgramBtn.disabled = isEnrolled || isCompleted || !canEnroll;
                this.elements.startProgramBtn.textContent = 
                    isCompleted ? 'Completed' :
                    isEnrolled ? 'Currently Enrolled' :
                    !canEnroll ? 'Prerequisites Not Met' :
                    'Begin Program';
            }

            // Show modal
            if (this.elements.modal?.show) {
                this.elements.modal.show();
            }

        } catch (e) {
            console.error('Error showing program details:', e);
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // ===================================================================
    // UTILITIES
    // ===================================================================

    static debouncedRender = this.debounce(() => this.renderAll(), 300);

    static saveGameState() {
        try {
            if (!this.gameState) return false;
            
            const success = GameStateStorage.save('educationGameState', this.gameState);
            if (success) {
                localStorage.setItem('educationUpdateTrigger', Date.now().toString());
                this.log('Game state saved and sync triggered');
                return true;
            }
            return false;
        } catch (e) {
            console.error(this.ERROR_MESSAGES.STATE_SAVE_FAILED, e);
            EventManager.addToEventLog(this.ERROR_MESSAGES.STATE_SAVE_FAILED, 'danger');
            return false;
        }
    }

    static getEnrolledProgram(programId) {
        return this.gameState?.education?.enrolledPrograms?.find(p => p.id === programId);
    }
    
    static isProgramEnrolled(programId) {
        return this.gameState?.education?.enrolledPrograms?.some(p => p.id === programId) || false;
    }

    static isProgramCompleted(programId) {
        return this.gameState?.education?.completedPrograms?.includes(programId) || false;
    }

    static getMissingPrerequisites(programId) {
        return (this.prerequisites[programId] || []).filter(reqId => !this.isProgramCompleted(reqId));
    }

    static getDurationInMonths(durationString) {
    if (!durationString) return 0;
    
    const num = parseInt(durationString, 10);
    if (isNaN(num)) return 0;
    
    const lowerDuration = durationString.toLowerCase();
    
    if (lowerDuration.includes('year') || lowerDuration.includes('yr')) return num * 12;
    if (lowerDuration.includes('month') || lowerDuration.includes('mo')) return num;
    if (lowerDuration.includes('week') || lowerDuration.includes('wk')) return Math.ceil(num / 4);
    if (lowerDuration.includes('semester')) return num * 6; // Assuming 6 months per semester
    if (lowerDuration.includes('quarter')) return num * 3; // Assuming 3 months per quarter
    return num; // Default to months if no unit specified
}

    static log(...args) {
        if (this.debug) {
            console.log('[EducationManager]', ...args);
        }
    }
}

// Enhanced Storage helper class
class GameStateStorage {
    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from storage:', e);
            return null;
        }
    }

    static save(key, data) {
        try {
            if (!key || typeof key !== 'string') return false;
            
            const dataToSave = JSON.stringify(data);
            if (dataToSave.length > 5000000) { // ~5MB limit
                console.warn('Data too large to save to localStorage');
                return false;
            }
            
            localStorage.setItem(key, dataToSave);
            return true;
        } catch (e) {
            console.error('Error saving to storage:', e);
            return false;
        }
    }
}

// Safe initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        TimeManager.init();
        EducationManager.init();
    } catch (e) {
        console.error('Initialization failed:', e);
    }
});