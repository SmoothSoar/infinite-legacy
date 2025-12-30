// education.js - Optimized Version
class EducationManager {
    static gameState = null;
    static initialized = false;
    static elements = {};
    static selectedProgram = null;
    static eventListeners = [];
    static debug = true;
    static visibleProgramsCount = 6;
    
    // Constants with better organization
    static CONSTANTS = Object.freeze({
        MIN_GPA: 1.0,
        MAX_GPA: 4.0,
        DEFAULT_GPA: 3.2,
        EDUCATION_LEVELS: Object.freeze({
            HIGH_SCHOOL: 'High School',
            HIGH_SCHOOL_GRAD: 'High School Graduate',
            ASSOCIATE: 'Associate Degree',
            BACHELOR: "Bachelor's Degree",
            MASTER: "Master's Degree"
        }),
        XP: Object.freeze({
            PER_PROGRAM: 500,
            PER_LEVEL: 1000
        }),
        DEFAULT_STATE: Object.freeze({
            balance: 10000,
            currentYear: 1,
            totalMonths: 0,
            education: Object.freeze({
                level: 'High School',
                gpa: 3.2,
                enrolledPrograms: [],
                completedPrograms: [],
                skills: {}
            })
        })
    });

    // Error messages
    static ERROR_MESSAGES = Object.freeze({
        INIT_FAILED: 'Education system initialization failed',
        STATE_LOAD_FAILED: 'Failed to load education state',
        STATE_SAVE_FAILED: 'Failed to save education state',
        RENDER_FAILED: 'Failed to render education components',
        TIME_ADVANCE_FAILED: 'Failed to process time advancement'
    });

    /**
     * Initializes the EducationManager system
     */
 static init() {
    try {
        if (this.initialized) return;
        
        this.log('Initializing EducationManager...');
        
        // Wait for TimeManager to be ready
        // If TimeManager isn't ready yet, don't block rendering; we'll still hook its events later.
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
            this.programs = Array.isArray(window.EDUCATION_PROGRAMS) ? [...window.EDUCATION_PROGRAMS] : [];
            this.skillsData = typeof window.SKILLS === 'object' ? {...window.SKILLS} : {};
            this.fieldSkills = typeof window.FIELD_SKILLS === 'object' ? {...window.FIELD_SKILLS} : {};
            this.prerequisites = typeof window.PREREQUISITES === 'object' ? {...window.PREREQUISITES} : {};
            this.log("Static education data loaded");
        } catch (e) {
            console.error('Error loading education data:', e);
            this.programs = [];
            this.skillsData = {};
            this.fieldSkills = {};
            this.prerequisites = {};
        }
    }

    static loadGameState() {
        try {
            const key = this.getStorageKey();
            const legacyKey = 'educationGameState';
            const savedState = GameStateStorage.load(key) || GameStateStorage.load(legacyKey);
            this.gameState = savedState ? this.validateGameState(savedState) : this.getDefaultGameState();

            // Migrate legacy data into character-scoped key
            if (savedState && !GameStateStorage.load(key)) {
                GameStateStorage.save(key, savedState);
            }
            this.log("Game state loaded");
        } catch (e) {
            console.error(this.ERROR_MESSAGES.STATE_LOAD_FAILED, e);
            this.gameState = this.getDefaultGameState();
            EventManager.addToEventLog(this.ERROR_MESSAGES.STATE_LOAD_FAILED, 'warning');
        }
    }

    static validateGameState(state) {
        try {
            const validated = JSON.parse(JSON.stringify(state));
            
            // Ensure education object exists
            validated.education = validated.education || {};
            
            // Validate arrays and objects
            validated.education.enrolledPrograms = this.validateEnrolledPrograms(
                validated.education.enrolledPrograms || []
            );
            
            validated.education.completedPrograms = this.validateProgramIds(
                validated.education.completedPrograms || []
            );
            
            validated.education.skills = this.initializeSkills(
                validated.education.skills || {}
            );
            
            // Validate GPA with bounds checking
            validated.education.gpa = this.validateGPA(
                validated.education.gpa
            );
            
            // Validate other required fields
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
            programsContainer: document.querySelector('.education-programs-container') || this.getElementById('programsContainer'),
            currentProgress: this.getElementById('currentProgress'),
            skillMeter: this.getElementById('skillMeter'),
            eduLevel: this.getElementById('eduLevel'),
            gpaDisplay: this.getElementById('gpaDisplay'),
            yearDisplay: this.getElementById('yearDisplay'),
            skillsUnlockedCount: this.getElementById('skillsUnlockedCount'),
            balanceDisplay: this.getElementById('balanceDisplay'),
            startProgramBtn: this.getElementById('startProgramBtn'),
            modalTitle: this.getElementById('programDetailsTitle'),
            modalDescription: this.getElementById('programDetailsDescription'),
            modalDuration: this.getElementById('programDetailsDuration'), // Added duration element
            modalCost: this.getElementById('programDetailsCost'),       // Added cost element
            modalSkills: this.getElementById('programDetailsSkills'),
            modalCareers: this.getElementById('programDetailsCareers'),
            modalPrerequisites: this.getElementById('programDetailsPrerequisites'),
            careerSection: this.getElementById('careerRelevanceSection'),
            prereqSection: this.getElementById('prerequisitesSection')
        };

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
    this.removeEventListeners();

    if (this.elements.programsContainer) {
        this.addListener(this.elements.programsContainer, 'click', (e) => {
            // Check if click is on the button or its children
            const button = e.target.closest('.program-action-btn');
            if (button && button.dataset.programId) {
                e.preventDefault();
                e.stopPropagation();
                this.showProgramDetails(button.dataset.programId);
            }
        });
    }

        if (this.elements.startProgramBtn) {
            this.addListener(this.elements.startProgramBtn, 'click', () => {
                if (this.selectedProgram) {
                    this.handleEnroll(this.selectedProgram.id);
                }
            });
        }

        this.addListener(document, 'timeAdvanced', (e) => {
            this.handleTimeAdvanced(e.detail);
        });

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
            if (!timeState || typeof timeState !== 'object') {
                this.log('Invalid timeState object');
                return;
            }

            this.log('Handling time advancement:', timeState);

            this.updateQuarterlyProgress();
            this.updateYearlyProgress();

            this.saveGameState();
            this.debouncedRender();
            
            if (timeState.isNewAge && typeof timeState.age === 'number') {
                this.handleAgeChange(timeState.age);
            }

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
        
        for (let i = education.enrolledPrograms.length - 1; i >= 0; i--) {
            const program = education.enrolledPrograms[i];
            const programData = this.programs.find(p => p.id === program.id);
            if (!programData) continue;
            
            program.totalDuration = this.getDurationInMonths(programData.duration);
            if (program.totalDuration <= 0) {
                console.warn(`Invalid duration for program ${program.id}`);
                continue;
            }
            
            program.monthsCompleted += 3;
            program.progress = Math.min(100, (program.monthsCompleted / program.totalDuration) * 100);

            if (this.shouldDropout(program)) {
                this.handleDropout(program);
                continue;
            }

            if (program.monthsCompleted >= program.totalDuration) {
                this.completeProgram(program.id);
            }
        }

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
        // Assuming a `failureRate` property can be added to program data if needed for dropout mechanics
        const dropoutChance = typeof programData?.failureRate === 'number' ? programData.failureRate : 0; 
        
        const gpaFactor = this.gameState.education.gpa < 2.0 ? 2 : 1;
        return Math.random() < (dropoutChance * gpaFactor);
    }

    static handleDropout(program) {
        if (!program?.id || !program?.cost) return;

        const costLost = program.cost * 0.3; // Example: lose 30% of cost on dropout
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
        // 1. Get the program data
        const program = this.programs.find(p => p.id === programId);
        if (!program) {
            console.error("Program not found:", programId);
            return;
        }

        // 2. DEBUG: Log all possible age sources before we check
        console.group("Age Debugging");
        console.log("Possible age sources:");
        console.log("- Player.instance:", window.player?.age);
        console.log("- Player class:", Player?.state?.player?.age);
        console.log("- TimeManager:", TimeManager?.timeState?.age);
        console.log("- EducationManager:", this.gameState?.age);
        
        // 3. Get age - try EVERY possible source with clear priority
        const characterAge = (
            window.player?.age ||                      // First priority
            Player?.state?.player?.age ||             // Second priority
            TimeManager?.timeState?.age ||            // Third priority
            this.gameState?.age ||                    // Fourth priority
            18                                       // Final fallback (using 18 instead of 14)
        );
        
        console.log("Using age:", characterAge);
        console.log("Program requirements:", {
            id: program.id,
            name: program.name,
            minAge: program.minAge,
            maxAge: program.maxAge
        });
        console.groupEnd();

     const verifiedAge = characterAge;
        // 5. Age verification (using verifiedAge)
        if (program.maxAge && verifiedAge > program.maxAge) {
            const msg = `Too old for ${program.name} (max age ${program.maxAge})`;
            EventManager.addToEventLog(msg, 'warning');
            console.warn(msg, "Your age:", verifiedAge);
            return;
        }

        if (program.minAge && verifiedAge < program.minAge) {
            const msg = program.type === 'high-school' ?
                `Too young for high school (min age ${program.minAge})` :
                `Too young for ${program.name} (min age ${program.minAge})`;
            EventManager.addToEventLog(msg, 'warning');
            console.warn(msg, "Your age:", verifiedAge);
            return;
        }

        // 6. Other checks (unchanged)
        if (this.isProgramEnrolled(programId)) {
            EventManager.addToEventLog(`Already enrolled in ${program.name}`, 'warning');
            return;
        }

        if (this.isProgramCompleted(programId)) {
            EventManager.addToEventLog(`Already completed ${program.name}`, 'warning');
            return;
        }

        const missingPrereqs = this.getMissingPrerequisites(programId);
        if (missingPrereqs.length > 0) {
            const prereqNames = missingPrereqs.map(id => 
                this.programs.find(p => p.id === id)?.name || id
            ).join(', ');
            EventManager.addToEventLog(`Missing prerequisites: ${prereqNames}`, 'danger');
            return;
        }

        if (this.gameState.balance < program.cost) {
            EventManager.addToEventLog(`Need $${program.cost.toLocaleString()} for ${program.name}`, 'danger');
            return;
        }

        // 7. Success
        this.enrollStudent(program);
        EventManager.addToEventLog(`Successfully enrolled in ${program.name}!`, 'success');

    } catch (error) {
        console.error("Enrollment error:", error);
        EventManager.addToEventLog("Enrollment system error", 'danger');
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

        if (program.type === 'master' && this.gameState.education.level !== this.CONSTANTS.EDUCATION_LEVELS.MASTER) {
            this.gameState.education.level = this.CONSTANTS.EDUCATION_LEVELS.MASTER;
        } else if (program.type === 'bachelor' && this.gameState.education.level !== this.CONSTANTS.EDUCATION_LEVELS.BACHELOR && this.gameState.education.level !== this.CONSTANTS.EDUCATION_LEVELS.MASTER) {
            this.gameState.education.level = this.CONSTANTS.EDUCATION_LEVELS.BACHELOR;
        } else if (program.type === 'associate' && this.gameState.education.level !== this.CONSTANTS.EDUCATION_LEVELS.ASSOCIATE && this.gameState.education.level !== this.CONSTANTS.EDUCATION_LEVELS.BACHELOR && this.gameState.education.level !== this.CONSTANTS.EDUCATION_LEVELS.MASTER) {
            this.gameState.education.level = this.CONSTANTS.EDUCATION_LEVELS.ASSOCIATE;
        } else if (['high-school-diploma', 'ged'].includes(program.id) && this.gameState.education.level === this.CONSTANTS.EDUCATION_LEVELS.HIGH_SCHOOL) {
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
                this.elements.programsContainer.innerHTML = '<p class="text-muted">No education programs available for this filter.</p>';
                return;
            }

            const programsToDisplay = filter === 'all' 
                ? filteredPrograms.slice(0, this.visibleProgramsCount)
                : filteredPrograms;

            this.elements.programsContainer.innerHTML = '';
            programsToDisplay.forEach(program => {
                const card = this.createProgramCard(program);
                if (card) {
                    this.elements.programsContainer.appendChild(card);
                }
            });

            this.addLoadMoreButton(filter, filteredPrograms);
        } catch (e) {
            console.error('Error rendering programs:', e);
            this.elements.programsContainer.innerHTML = '<p class="text-danger">Error loading programs.</p>';
        }
    }

    static createProgramCard(program) {
        if (!program?.id || !program?.name || !program?.type || !program?.field || !program?.duration) {
            return null;
        }

        const card = document.createElement('div');
        card.className = 'col-12 col-sm-6 col-lg-4 mb-4'; // Bootstrap grid classes
        
        const cardBody = document.createElement('div');
        cardBody.className = 'education-program-card card h-100 bg-transparent';
        
        const cardContent = document.createElement('div');
        cardContent.className = 'card-body d-flex flex-column p-3';
        
        // Program Header (compact)
        const header = document.createElement('div');
        header.className = 'd-flex justify-content-between align-items-start mb-2 gap-2';
        
        const title = document.createElement('h5');
        title.className = 'card-title mb-0 text-truncate flex-grow-1';
        title.textContent = program.name;
        title.title = program.name; // Tooltip for truncated text
        
        const typeBadge = document.createElement('span');
        typeBadge.className = 'badge text-nowrap';
        // Set badge color based on program type
        const badgeClasses = {
            'high-school': 'bg-info text-dark',
            'certification': 'bg-warning text-dark',
            'associate': 'bg-success',
            'bachelor': 'bg-primary',
            'master': 'bg-purple' // Requires .bg-purple in CSS
        };
        typeBadge.className = `badge ${badgeClasses[program.type] || 'bg-secondary'} text-nowrap`;
        typeBadge.textContent = program.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        header.appendChild(title);
        header.appendChild(typeBadge);
        
        // Compact details grid
        const detailsGrid = document.createElement('div');
        detailsGrid.className = 'grid-container mb-2'; // Requires .grid-container and .grid-cell in CSS
        
        // Field
        const fieldCell = document.createElement('div');
        fieldCell.className = 'grid-cell';
        fieldCell.innerHTML = `<i class="bi bi-tag-fill me-1"></i><span class="text-truncate">${program.field}</span>`;
        
        // Duration
        const durationCell = document.createElement('div');
        durationCell.className = 'grid-cell';
        durationCell.innerHTML = `<i class="bi bi-clock-fill me-1"></i>${program.duration}`;
        
        // Cost
        const costCell = document.createElement('div');
        costCell.className = 'grid-cell';
        costCell.innerHTML = `<i class="bi bi-cash-stack me-1"></i>$${program.cost.toLocaleString()}`;
        
        // Difficulty
        const difficultyCell = document.createElement('div');
        difficultyCell.className = 'grid-cell';
        const difficultyLevel = Math.max(1, Math.min(5, program.difficulty || 1));
        difficultyCell.innerHTML = `<i class="bi bi-speedometer2 me-1"></i>${'*'.repeat(difficultyLevel)}${'.'.repeat(5 - difficultyLevel)}`;
        
        detailsGrid.appendChild(fieldCell);
        detailsGrid.appendChild(durationCell);
        detailsGrid.appendChild(costCell);
        detailsGrid.appendChild(difficultyCell);
        
        // Skills Section (compact)
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'mb-2';
        
        const skillsTitle = document.createElement('h6');
        skillsTitle.className = 'small mb-1 text-muted';
        skillsTitle.textContent = 'Skills:';
        
        const skillsList = document.createElement('div');
        skillsList.className = 'd-flex flex-wrap gap-1';
        
        const programSkills = program.skillsGained || [];
        if (programSkills.length > 0) {
            programSkills.forEach(skill => {
                const skillBadge = document.createElement('span');
                skillBadge.className = 'badge bg-secondary text-truncate';
                skillBadge.style.maxWidth = '100px';
                skillBadge.textContent = skill.replace(/_/g, ' ');
                skillsList.appendChild(skillBadge);
            });
        } else {
            const noSkills = document.createElement('span');
            noSkills.className = 'small text-muted';
            noSkills.textContent = 'General skills';
            skillsList.appendChild(noSkills);
        }
        
        skillsContainer.appendChild(skillsTitle);
        skillsContainer.appendChild(skillsList);
        
        // Action Button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'mt-auto pt-2'; // mt-auto pushes button to bottom
        
        const actionButton = document.createElement('button');
        actionButton.className = 'btn btn-sm btn-outline-primary w-100 program-action-btn';
        actionButton.dataset.programId = program.id;
        actionButton.innerHTML = '<i class="bi bi-info-circle me-1"></i>Details';
        
        buttonContainer.appendChild(actionButton);
        
        // Assemble the card
        cardContent.appendChild(header);
        cardContent.appendChild(detailsGrid);
        cardContent.appendChild(skillsContainer);
        cardContent.appendChild(buttonContainer);
        
        cardBody.appendChild(cardContent);
        card.appendChild(cardBody);
        
        return card;
    }

    static getFilteredPrograms(filter) {
        if (!Array.isArray(this.programs)) return [];
        
        return this.programs.filter(program => {
            if (!program?.type) return false;
            
            switch (filter) {
                case 'all': return true;
                case 'high-school': return program.type === 'high-school';
                case 'certificates': return program.type === 'certification';
                case 'associate': return program.type === 'associate';
                case 'bachelor': return program.type === 'bachelor';
                case 'master': return program.type === 'master';
                default: return false;
            }
        });
    }

    static addLoadMoreButton(filter, filteredPrograms) {
        if (filter !== 'all' || this.visibleProgramsCount >= filteredPrograms.length) return;

        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'loadMoreProgramsBtn';
        loadMoreBtn.className = 'btn btn-outline-primary';
        loadMoreBtn.textContent = `Load More (${filteredPrograms.length - this.visibleProgramsCount} remaining)`;
        
        this.addListener(loadMoreBtn, 'click', () => {
            this.visibleProgramsCount += 6; // Load 6 more programs
            this.renderPrograms(filter);
        });

        const container = document.createElement('div');
        container.className = 'col-12 text-center mt-3'; // Full width column for the button
        container.appendChild(loadMoreBtn);
        
        this.elements.programsContainer.appendChild(container);
    }
    
    static renderCurrentProgress() {
        if (!this.elements.currentProgress) return;

        try {
            const enrolled = this.gameState?.education?.enrolledPrograms || [];
            
            if (enrolled.length === 0) {
                this.elements.currentProgress.innerHTML = `
                    <div class="alert alert-info mb-0">
                        Not currently enrolled in any programs
                    </div>
                `;
                return;
            }

            this.elements.currentProgress.innerHTML = '';
            enrolled.forEach(program => {
                const item = document.createElement('div');
                item.className = 'current-program-item p-3 mb-2 border rounded bg-light';
                item.innerHTML = `
                    <h6 class="mb-1">${program.name} (${program.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())})</h6>
                    <div class="progress mb-1" style="height: 10px;">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${program.progress}%" aria-valuenow="${program.progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <small class="text-muted">${program.monthsCompleted} / ${program.totalDuration} months completed (${program.progress.toFixed(1)}%)</small>
                `;
                this.elements.currentProgress.appendChild(item);
            });
        } catch (e) {
            console.error('Error rendering current progress:', e);
            this.elements.currentProgress.innerHTML = '<p class="text-danger">Error loading current programs.</p>';
        }
    }

    static renderSkills() {
        if (!this.elements.skillMeter) return;

        try {
            const skills = this.gameState?.education?.skills || {};
            const activeSkills = Object.values(skills).filter(s => s?.xp > 0);
            
            if (activeSkills.length === 0) {
                this.elements.skillMeter.innerHTML = `
                    <div class="alert alert-info mb-0">
                        Complete programs to develop skills
                    </div>
                `;
                return;
            }

            this.elements.skillMeter.innerHTML = '';
            activeSkills
                .sort((a, b) => (b?.level || 0) - (a?.level || 0) || (b?.xp || 0) - (a?.xp || 0))
                .forEach(skill => {
                    const skillElement = document.createElement('div');
                    skillElement.className = 'skill-item mb-2';
                    skillElement.innerHTML = `
                        <strong>${skill.name || skill.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> Level ${skill.level || 1}
                        <div class="progress mt-1" style="height: 8px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${((skill.xp % this.CONSTANTS.XP.PER_LEVEL) / this.CONSTANTS.XP.PER_LEVEL) * 100}%" aria-valuenow="${skill.xp % this.CONSTANTS.XP.PER_LEVEL}" aria-valuemin="0" aria-valuemax="${this.CONSTANTS.XP.PER_LEVEL}"></div>
                        </div>
                        <small class="text-muted">${skill.xp % this.CONSTANTS.XP.PER_LEVEL} / ${this.CONSTANTS.XP.PER_LEVEL} XP to next level</small>
                    `;
                    this.elements.skillMeter.appendChild(skillElement);
                });
        } catch (e) {
            console.error('Error rendering skills:', e);
            this.elements.skillMeter.innerHTML = '<p class="text-danger">Error loading skills.</p>';
        }
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
        
        if (this.elements.skillsUnlockedCount) {
            const skills = edu.skills || {};
            const unlockedCount = Object.values(skills).filter(s => s?.xp > 0).length;
            this.elements.skillsUnlockedCount.textContent = unlockedCount > 0
                ? `${unlockedCount} skills active`
                : 'Level them up to land better jobs';
        }
        
        if (this.elements.balanceDisplay) {
            this.elements.balanceDisplay.textContent = `$${typeof this.gameState.balance === 'number' ? 
                this.gameState.balance.toLocaleString() : '0'}`;
        }
    }
    
  static showProgramDetails(programId) {
    try {
        if (!programId) return;

        // Ensure modal instance exists (in case bootstrap wasn't ready during cache)
        if (!this.elements.modal) {
            const modalElement = this.getElementById('programDetailsModal');
            if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                this.elements.modal = new bootstrap.Modal(modalElement);
            }
        }

        if (!this.elements.modal) return;

        const program = this.programs.find(p => p.id === programId);
        if (!program) {
            console.warn(`Program with ID ${programId} not found.`);
            return;
        }

        this.selectedProgram = program;

        // Set basic program info
        if (this.elements.modalTitle) {
            this.elements.modalTitle.textContent = program.name || 'Unknown Program';
        }

        if (this.elements.modalDescription) {
            this.elements.modalDescription.textContent = program.description || 
                `This ${program.type.replace(/-/g, ' ')} program provides comprehensive training in ${program.field}.`;
        }

        if (this.elements.modalDuration) {
            this.elements.modalDuration.textContent = program.duration || '--';
        }

        if (this.elements.modalCost) {
            this.elements.modalCost.textContent = `$${program.cost ? program.cost.toLocaleString() : '0'}`;
        }

        // Add new fields
        if (this.getElementById('programDetailsDifficulty')) {
            const difficultyLevel = Math.max(1, Math.min(5, program.difficulty || 1));
            const difficultyStars = `${'*'.repeat(difficultyLevel)}${'.'.repeat(5 - difficultyLevel)}`;
            this.getElementById('programDetailsDifficulty').textContent = difficultyStars;
        }

        if (this.getElementById('programDetailsField')) {
            this.getElementById('programDetailsField').textContent = program.field || 'General';
        }

        if (this.getElementById('programDetailsType')) {
            this.getElementById('programDetailsType').textContent = program.type?.replace(/-/g, ' ') || 'program';
        }

        // Update skills display
        if (this.elements.modalSkills) {
            this.elements.modalSkills.innerHTML = '';
            const programSkills = program.skillsGained || [];
            const fieldSkills = this.fieldSkills[program.field] || [];
            const allSkills = [...new Set([...programSkills, ...fieldSkills])];

            if (allSkills.length > 0) {
                allSkills.forEach(skillId => {
                    const skillBadge = document.createElement('span');
                    skillBadge.className = 'badge bg-secondary';
                    skillBadge.textContent = skillId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    this.elements.modalSkills.appendChild(skillBadge);
                });
            } else {
                const noSkills = document.createElement('span');
                noSkills.className = 'badge bg-secondary';
                noSkills.textContent = 'General skills';
                this.elements.modalSkills.appendChild(noSkills);
            }
        }

        // Update careers display
        if (this.elements.careerSection && this.elements.modalCareers) {
            const relevantCareers = window.CAREERS?.filter(c => 
                c?.requirements?.education?.includes(program.id)
            ) || [];
            
            if (relevantCareers.length > 0) {
                this.elements.careerSection.style.display = 'block';
                this.elements.modalCareers.innerHTML = '';
                relevantCareers.forEach(career => {
                    const careerBadge = document.createElement('span');
                    careerBadge.className = 'badge bg-info';
                    careerBadge.textContent = career.name;
                    this.elements.modalCareers.appendChild(careerBadge);
                });
            } else {
                this.elements.careerSection.style.display = 'none';
            }
        }

        // Update prerequisites display
        if (this.elements.prereqSection && this.getElementById('programDetailsPrerequisites')) {
            const prereqIds = this.prerequisites[program.id] || [];
            
            if (prereqIds.length > 0) {
                this.elements.prereqSection.style.display = 'block';
                this.getElementById('programDetailsPrerequisites').innerHTML = '';
                prereqIds.forEach(reqId => {
                    const reqProgram = this.programs.find(p => p.id === reqId);
                    const prereqItem = document.createElement('div');
                    prereqItem.className = 'd-flex align-items-center mb-1';
                    
                    const statusBadge = document.createElement('span');
                    statusBadge.className = this.isProgramCompleted(reqId) ? 'badge bg-success me-2' : 'badge bg-danger me-2';
                    statusBadge.innerHTML = this.isProgramCompleted(reqId) ? '<i class="bi bi-check-circle-fill"></i>' : '<i class="bi bi-x-circle-fill"></i>';
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = reqProgram ? reqProgram.name : reqId;
                    
                    prereqItem.appendChild(statusBadge);
                    prereqItem.appendChild(nameSpan);
                    this.getElementById('programDetailsPrerequisites').appendChild(prereqItem);
                });
            } else {
                this.elements.prereqSection.style.display = 'none';
            }
        }

        // Update enrollment status section
        if (this.getElementById('enrollmentStatusSection') && this.getElementById('enrollmentStatusMessage')) {
            const isEnrolled = this.isProgramEnrolled(programId);
            const isCompleted = this.isProgramCompleted(programId);
            const missingPrereqs = this.getMissingPrerequisites(programId);
            const insufficientFunds = this.gameState.balance < program.cost;
            const age = TimeManager?.timeState?.age || 0;
            const tooYoung = program.minAge && age < program.minAge;
            const tooOld = program.maxAge && age > program.maxAge;
            
            let statusMessage = '';
            let statusClass = '';
            
            if (isCompleted) {
                statusMessage = 'You have already completed this program!';
                statusClass = 'text-success';
            } else if (isEnrolled) {
                statusMessage = 'You are currently enrolled in this program!';
                statusClass = 'text-primary';
            } else if (missingPrereqs.length > 0) {
                const prereqNames = missingPrereqs.map(id => 
                    this.programs.find(p => p.id === id)?.name || id
                ).join(', ');
                statusMessage = `Missing prerequisites: ${prereqNames}`;
                statusClass = 'text-danger';
            } else if (insufficientFunds) {
                statusMessage = `Insufficient funds. You need $${(program.cost - this.gameState.balance).toLocaleString()} more.`;
                statusClass = 'text-danger';
            } else if (tooYoung) {
                statusMessage = `Too young. Minimum age: ${program.minAge}. Current age: ${age}.`;
                statusClass = 'text-warning';
            } else if (tooOld) {
                statusMessage = `Too old. Maximum age: ${program.maxAge}. Current age: ${age}.`;
                statusClass = 'text-warning';
            } else {
                statusMessage = 'You meet all requirements for this program!';
                statusClass = 'text-success';
            }
            
            this.getElementById('enrollmentStatusMessage').textContent = statusMessage;
            this.getElementById('enrollmentStatusMessage').className = statusClass;
            this.getElementById('enrollmentStatusSection').style.borderLeftColor = 
                statusClass.includes('success') ? 'var(--bs-success)' :
                statusClass.includes('danger') ? 'var(--bs-danger)' :
                statusClass.includes('warning') ? 'var(--bs-warning)' : 'var(--bs-info)';
        }

        // Update enroll button
        if (this.elements.startProgramBtn) {
            let buttonText = 'Enroll Now';
            let buttonDisabled = false;
            let buttonClass = 'btn-primary';

            if (isCompleted) {
                buttonText = 'Completed';
                buttonDisabled = true;
                buttonClass = 'btn-success';
            } else if (isEnrolled) {
                buttonText = 'Currently Enrolled';
                buttonDisabled = true;
                buttonClass = 'btn-primary';
            } else if (missingPrereqs.length > 0) {
                buttonText = 'Prerequisites Not Met';
                buttonDisabled = true;
                buttonClass = 'btn-danger';
            } else if (insufficientFunds) {
                buttonText = 'Insufficient Funds';
                buttonDisabled = true;
                buttonClass = 'btn-danger';
            } else if (tooYoung) {
                buttonText = `Too Young (Min Age: ${program.minAge})`;
                buttonDisabled = true;
                buttonClass = 'btn-warning';
            } else if (tooOld) {
                buttonText = `Too Old (Max Age: ${program.maxAge})`;
                buttonDisabled = true;
                buttonClass = 'btn-warning';
            }
            
            this.elements.startProgramBtn.disabled = buttonDisabled;
            this.elements.startProgramBtn.textContent = buttonText;
            this.elements.startProgramBtn.className = `btn ${buttonClass}`;
        }

        if (this.elements.modal?.show) {
            this.elements.modal.show();
        }

    } catch (e) {
        console.error('Error showing program details:', e);
        EventManager.addToEventLog('Failed to show program details', 'danger');
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

    static getCharacterId() {
        return localStorage.getItem('currentCharacterId') || localStorage.getItem('lastCharacterId') || 'default';
    }

    static getStorageKey() {
        return `educationGameState_${this.getCharacterId()}`;
    }

    static saveGameState() {
        try {
            if (!this.gameState) return false;
            
            const success = GameStateStorage.save(this.getStorageKey(), this.gameState);
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
        if (lowerDuration.includes('semester')) return num * 6;
        if (lowerDuration.includes('quarter')) return num * 3;
        return num;
    }

    static log(...args) {
        if (this.debug) {
            console.log('[EducationManager]', ...args);
        }
    }
}

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
            if (dataToSave.length > 5000000) {
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

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Ensure necessary managers are initialized before EducationManager, if they have dependencies
        if (typeof TimeManager !== 'undefined') TimeManager.init();
        if (typeof GameManager !== 'undefined') GameManager.init();
        
        EducationManager.init();
    } catch (e) {
        console.error('Education system initialization failed on DOMContentLoaded:', e);
    }
});

document.addEventListener('mainManagerReady', () => {
    // This event listener ensures EducationManager initializes after GameManager is fully ready,
    // especially if EducationManager depends on GameState data populated by GameManager.
    EducationManager.init();
});
