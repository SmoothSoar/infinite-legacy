// careerManager.js - Career System (Redesigned for Finances Integration)
class CareerManager {
    static gameState = null;
    static initialized = false;
    static elements = {};
    static selectedJob = null;
    static careersData = {};
    
    // Event listener references for cleanup
    static eventListeners = [];
    
    // Configuration
    static debug = true;

    /**
     * Initializes the CareerManager system
     */
 /**
 * Initializes the CareerManager system
 */
static init() {
    try {
        if (this.initialized) return;
        
        this.log('Initializing CareerManager...');
        
        // Load data first with validation
        this.loadCareerData();
        
        // Validate loaded data
        if (!Array.isArray(this.careersData)) {
            console.error('Career data failed to load properly - initializing empty array');
            this.careersData = [];
        } else {
            this.log(`Successfully loaded ${this.careersData.length} careers`);
        }
        
        // Then load state
        this.loadGameState();
        
        // Validate game state
        this.validateGameState();
        
        // Setup UI only if on career page
        if (document.querySelector('.job-listings-container')) {
            this.cacheElements();
            this.setupEventListeners();
            this.renderAll();
        }
        
        // Register reload method for debugging
        window.reloadCareerData = () => this.reloadCareerData();
        
        this.initialized = true;
        this.log('CareerManager initialized successfully');
    } catch (error) {
        console.error('CareerManager initialization failed:', error);
        
        // Fallback initialization
        this.careersData = [];
        this.gameState = this.getDefaultGameState();
        this.initialized = false;
        
        throw error;
    }
}

/**
 * Reloads career data (for debugging/recovery)
 */
static reloadCareerData() {
    try {
        this.log('Reloading career data...');
        const currentJobId = this.gameState.currentJob?.id;
        
        // Save current state
        const savedState = this.gameState;
        
        // Reload data
        this.loadCareerData();
        
        // Validate loaded data
        if (!Array.isArray(this.careersData)) {
            console.error('Failed to reload career data - using empty array');
            this.careersData = [];
        }
        
        // Restore current job if it still exists
        if (currentJobId) {
            const currentJob = this.careersData.find(j => j.id === currentJobId);
            if (currentJob) {
                this.gameState.currentJob = {
                    ...currentJob,
                    startDate: savedState.currentJob.startDate,
                    performance: savedState.currentJob.performance,
                    monthsWorked: savedState.currentJob.monthsWorked
                };
            }
        }
        
        this.log(`Reloaded ${this.careersData.length} careers`);
        this.renderAll();
        return true;
    } catch (e) {
        console.error('Error reloading career data:', e);
        return false;
    }
}

/**
 * Validates the game state structure
 */
static validateGameState() {
    if (!this.gameState) {
        this.gameState = this.getDefaultGameState();
        return;
    }
    
    // Ensure all required properties exist
    if (!this.gameState.currentJob) this.gameState.currentJob = null;
    if (!Array.isArray(this.gameState.jobHistory)) this.gameState.jobHistory = [];
    if (typeof this.gameState.experience !== 'object') this.gameState.experience = {};
    if (typeof this.gameState.skills !== 'object') this.gameState.skills = {};
    
    // Validate current job structure if exists
    if (this.gameState.currentJob) {
        const requiredJobProps = ['id', 'title', 'salary', 'performance', 'monthsWorked'];
        const isValidJob = requiredJobProps.every(prop => prop in this.gameState.currentJob);
        
        if (!isValidJob) {
            console.warn('Invalid current job structure - resetting');
            this.gameState.currentJob = null;
        }
    }
}

    static getCurrentJob() {
    return this.gameState?.currentJob || null;
}

    /**
     * Load career data with fallback
     */
static loadCareerData() {
    try {
        // Initialize as empty array if not already set
        if (!Array.isArray(this.careersData)) {
            this.careersData = [];
        }
        
        // Only overwrite if window.CAREERS is a valid array
        if (Array.isArray(window.CAREERS)) {
            this.careersData = [...window.CAREERS]; // Create a new array copy
        } else {
            console.warn('window.CAREERS is not an array, using existing career data');
        }
        this.log(`Loaded ${this.careersData.length} careers`);
    } catch (e) {
        this.log('Error loading career data:', e);
        // Maintain existing data if possible
        if (!Array.isArray(this.careersData)) {
            this.careersData = [];
        }
    }
}

    /**
     * Cleans up resources
     */
    static cleanup() {
        this.log('Cleaning up CareerManager...');
        this.removeEventListeners();
        this.elements = {};
        this.initialized = false;
    }

    // ===================================================================
    // DATA & STATE MANAGEMENT
    // ===================================================================

    static loadGameState() {
        try {
            const savedState = localStorage.getItem('careerGameState');
            if (!savedState) {
                this.gameState = this.getDefaultGameState();
            } else {
                const parsedState = JSON.parse(savedState);
                this.gameState = parsedState;
                this.validateGameState();
            }
            this.log("Game state loaded");
        } catch (e) {
            console.error('Error loading game state:', e);
            this.gameState = this.getDefaultGameState();
        }
    }

    static validateGameState() {
        if (!this.gameState.currentJob) this.gameState.currentJob = null;
        if (!this.gameState.jobHistory) this.gameState.jobHistory = [];
        if (!this.gameState.experience) this.gameState.experience = {};
        if (!this.gameState.skills) this.gameState.skills = {};
    }

    static getDefaultGameState() {
        return {
            currentJob: null,
            jobHistory: [],
            experience: {},
            skills: {}
        };
    }

    static saveGameState() {
        try {
            localStorage.setItem('careerGameState', JSON.stringify(this.gameState));
            localStorage.setItem('careerUpdateTrigger', Date.now().toString());
            this.log('Game state saved and sync triggered');
        } catch (e) {
            this.log('Error saving game state:', e);
            throw e;
        }
    }

    // ===================================================================
    // UI MANAGEMENT
    // ===================================================================

    static cacheElements() {
        const getElement = (id) => document.getElementById(id) || null;
        
        this.elements = {
            jobsContainer: document.querySelector('.job-listings-container'),
            currentJob: getElement('currentJob'),
            salaryDisplay: getElement('salaryDisplay'),
            performanceDisplay: getElement('performanceDisplay'),
            satisfactionDisplay: getElement('satisfactionDisplay'),
            currentJobDetails: getElement('currentJobDetails'),
            jobHistory: getElement('jobHistory'),
            applyJobBtn: getElement('applyJobBtn'),
            modalTitle: getElement('jobDetailsTitle'),
            modalDescription: getElement('jobDetailsDescription'),
            modalSalary: getElement('jobDetailsSalary'),
            modalRequirements: getElement('jobDetailsRequirements'),
            modalSkills: getElement('jobDetailsSkills')
        };

        // Initialize modal if exists
        const modalElement = getElement('jobDetailsModal');
        if (modalElement) {
            this.elements.modal = new bootstrap.Modal(modalElement);
        }
    }

    static setupEventListeners() {
        const jobClickListener = (e) => {
            const button = e.target.closest('.job-action-btn');
            if (button) {
                e.preventDefault();
                this.showJobDetails(button.dataset.jobId);
            }
        };

        const timeAdvancedListener = (e) => this.handleTimeAdvanced(e.detail);
        document.addEventListener('timeAdvanced', timeAdvancedListener);
        this.eventListeners.push({
            element: document,
            type: 'timeAdvanced',
            listener: timeAdvancedListener
        });

        const applyClickListener = () => {
            if (this.selectedJob) {
                this.applyForJob(this.selectedJob.id);
            }
        };

        const storageListener = (e) => {
            if (e.key === 'careerGameState' || e.key === 'careerUpdateTrigger') {
                this.log('Detected career state change from storage');
                this.loadGameState();
                this.renderAll();
            }
        };

        if (this.elements.jobsContainer) {
            this.elements.jobsContainer.addEventListener('click', jobClickListener);
            this.eventListeners.push({
                element: this.elements.jobsContainer,
                type: 'click',
                listener: jobClickListener
            });
        }

        if (this.elements.applyJobBtn) {
            this.elements.applyJobBtn.addEventListener('click', applyClickListener);
            this.eventListeners.push({
                element: this.elements.applyJobBtn,
                type: 'click',
                listener: applyClickListener
            });
        }

        window.addEventListener('storage', storageListener);
        this.eventListeners.push({
            element: window,
            type: 'storage',
            listener: storageListener
        });
    }

    static removeEventListeners() {
        this.eventListeners.forEach(({ element, type, listener }) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];
    }

    // ===================================================================
    // CORE FUNCTIONALITY
    // ===================================================================

    /**
     * Checks if player meets job requirements
     * @param {string} jobId - ID of the job to check
     * @returns {boolean} True if player meets all requirements
     */
/**
 * Checks if player meets job requirements
 * @param {string} jobId - ID of the job to check
 * @returns {boolean} True if player meets all requirements
 */
static canApplyForJob(jobId) {
    try {
        // Validate input
        if (typeof jobId !== 'string' || jobId.trim() === '') {
            console.error('Invalid jobId:', jobId);
            return false;
        }

        // Ensure careersData is valid
        if (!Array.isArray(this.careersData)) {
            console.error('careersData is not an array');
            return false;
        }

        // Find the job
        const job = this.careersData.find(j => j.id === jobId);
        if (!job) {
            console.warn(`Job not found: ${jobId}`);
            return false;
        }

        // Get player data with safe checks
        const playerAge = TimeManager?.timeState?.age || 18;
        const playerEducation = window.EducationManager?.gameState?.education?.completedPrograms || [];
        const playerSkills = window.EducationManager?.gameState?.education?.skills || {};

        // Age check
        if (job.requirements?.age && playerAge < job.requirements.age) {
            this.log(`Age requirement not met for ${jobId}: ${playerAge} < ${job.requirements.age}`);
            return false;
        }

        // Education check - special case for "none" requirement
        if (job.requirements?.education) {
            if (job.requirements.education.includes('none')) {
                // No education required
            } else {
                const hasEducation = job.requirements.education.some(edu => 
                    playerEducation.includes(edu)
                );
                if (!hasEducation) {
                    this.log(`Education requirement not met for ${jobId}`);
                    return false;
                }
            }
        }

        // Skills check
        if (job.requirements?.skills) {
            const hasSkills = job.requirements.skills.every(skill => {
                const skillData = playerSkills[skill];
                return skillData && skillData.level > 0;
            });
            if (!hasSkills) {
                this.log(`Skill requirement not met for ${jobId}`);
                return false;
            }
        }

        // Experience check
        if (job.requirements?.experience) {
            const hasExperience = job.requirements.experience.every(exp => 
                this.gameState.experience[exp] && this.gameState.experience[exp] > 0
            );
            if (!hasExperience) {
                this.log(`Experience requirement not met for ${jobId}`);
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error(`Error in canApplyForJob(${jobId}):`, error);
        return false;
    }
}

/**
 * Gets missing requirements for a job
 * @param {string} jobId - ID of the job to check
 * @returns {Object} Object with arrays of missing requirements by type
 */
static getMissingRequirements(jobId) {
    const missing = {
        age: false,
        education: [],
        skills: [],
        experience: []
    };

    try {
        // Validate input
        if (typeof jobId !== 'string' || jobId.trim() === '') {
            console.error('Invalid jobId:', jobId);
            return missing;
        }

        // Ensure careersData is valid
        if (!Array.isArray(this.careersData)) {
            console.error('careersData is not an array');
            return missing;
        }

        const job = this.careersData.find(j => j.id === jobId);
        if (!job) {
            console.warn(`Job not found: ${jobId}`);
            return missing;
        }

        // Get player data with safe checks
        const playerAge = TimeManager?.timeState?.age || 18;
        const playerEducation = window.EducationManager?.gameState?.education?.completedPrograms || [];
        const playerSkills = window.EducationManager?.gameState?.education?.skills || {};

        // Age check
        if (job.requirements?.age && playerAge < job.requirements.age) {
            missing.age = job.requirements.age;
        }

        // Education check - special case for "none" requirement
        if (job.requirements?.education && !job.requirements.education.includes('none')) {
            missing.education = job.requirements.education.filter(edu => 
                !playerEducation.includes(edu)
            );
        }

        // Skills check
        if (job.requirements?.skills) {
            missing.skills = job.requirements.skills.filter(skill => {
                const skillData = playerSkills[skill];
                return !skillData || skillData.level === 0;
            });
        }

        // Experience check
        if (job.requirements?.experience) {
            missing.experience = job.requirements.experience.filter(exp => 
                !this.gameState.experience[exp] || this.gameState.experience[exp] === 0
            );
        }

        return missing;
    } catch (error) {
        console.error(`Error in getMissingRequirements(${jobId}):`, error);
        return missing;
    }
}

    /**
     * Gets missing requirements for a job
     * @param {string} jobId - ID of the job to check
     * @returns {Object} Object with arrays of missing requirements by type
     */
    static getMissingRequirements(jobId) {
        const job = this.careersData.find(j => j.id === jobId);
        if (!job) return {};

        const missing = {
            age: false,
            education: [],
            skills: [],
            experience: []
        };

        // Get player data with safe checks
        const playerAge = TimeManager?.timeState?.age || 18;
        const playerEducation = window.EducationManager?.gameState?.education?.completedPrograms || [];
        const playerSkills = window.EducationManager?.gameState?.education?.skills || {};

        // Age check
        if (job.requirements?.age && playerAge < job.requirements.age) {
            missing.age = job.requirements.age;
        }

        // Education check - special case for "none" requirement
        if (job.requirements?.education && !job.requirements.education.includes('none')) {
            missing.education = job.requirements.education.filter(edu => 
                !playerEducation.includes(edu)
            );
        }

        // Skills check
        if (job.requirements?.skills) {
            missing.skills = job.requirements.skills.filter(skill => {
                const skillData = playerSkills[skill];
                return !skillData || skillData.level === 0;
            });
        }

        // Experience check
        if (job.requirements?.experience) {
            missing.experience = job.requirements.experience.filter(exp => 
                !this.gameState.experience[exp] || this.gameState.experience[exp] === 0
            );
        }

        return missing;
    }

    /**
     * Applies for a job
     * @param {string} jobId - ID of the job to apply for
     * @returns {boolean} True if application was successful
     */
    static applyForJob(jobId) {
        if (!this.canApplyForJob(jobId)) return false;
        
        const job = this.careersData.find(j => j.id === jobId);
        if (!job) return false;

        // Create new job record
        const newJob = { 
            ...job,
            startDate: this.getCurrentDateString(),
            performance: 50, // Starting performance (0-100)
            monthsWorked: 0
        };

        // If currently employed, add to history
        if (this.gameState.currentJob) {
            this.gameState.jobHistory.push({
                ...this.gameState.currentJob,
                endDate: this.getCurrentDateString()
            });
        }

        // Set new job
        this.gameState.currentJob = newJob;
        this.saveGameState();
        
        // Update UI
        this.renderAll();
        this.elements.modal?.hide();
        
        // Log event
        EventManager.addToEventLog(`Started new job as ${job.title}`, 'success');
        return true;
    }

    /**
     * Quits current job
     */
    static quitJob() {
        if (!this.gameState.currentJob) return;
        
        const jobTitle = this.gameState.currentJob.title;
        
        // Add to history
        this.gameState.jobHistory.push({
            ...this.gameState.currentJob,
            endDate: this.getCurrentDateString()
        });

        // Clear current job
        this.gameState.currentJob = null;
        this.saveGameState();
        
        if (typeof FinancesManager !== 'undefined') {
    FinancesManager.renderAll(); // Force FinancesManager to update
}
        // Update UI
        this.renderAll();
        
        // Log event
        EventManager.addToEventLog(`Quit job as ${jobTitle}`, 'warning');
    }

    /**
     * Handles time advancement (called from EventManager)
     * @param {Object} timeState - Current time state
     */
    static handleTimeAdvanced(timeState) {
    if (!this.gameState.currentJob) return;

    // Update job duration
    this.gameState.currentJob.monthsWorked += timeState.monthsAdvanced;
    
    // Update performance (random 1-5 points)
    this.gameState.currentJob.performance = Math.min(
        100, 
        this.gameState.currentJob.performance + Math.floor(Math.random() * 5) + 1
    );

    // Gain experience
    this.gameState.currentJob.experienceGained?.forEach(exp => {
        this.gameState.experience[exp] = (this.gameState.experience[exp] || 0) + timeState.monthsAdvanced;
    });

    // Gain skills if EducationManager is available
    if (window.EducationManager?.gameState && this.gameState.currentJob.skillsGained) {
        this.gameState.currentJob.skillsGained.forEach(skill => {
            if (window.EducationManager.gameState.education.skills[skill]) {
                window.EducationManager.gameState.education.skills[skill].xp += 100 * timeState.monthsAdvanced;
                window.EducationManager.gameState.education.skills[skill].level = 
                    Math.floor(window.EducationManager.gameState.education.skills[skill].xp / 1000) + 1;
            }
        });
    }

    // Process salary payment through FinancesManager
    if (this.gameState.currentJob.salary) {
        const salaryPayment = this.gameState.currentJob.salary * timeState.monthsAdvanced;
        
        // First try FinancesManager if available
        if (typeof FinancesManager !== 'undefined' && FinancesManager.addMoney) {
            try {
                FinancesManager.addMoney(salaryPayment, 'Salary payment', 'salary');
                EventManager.addToEventLog(`Received salary payment: $${salaryPayment.toLocaleString()}`, 'success');
            } catch (e) {
                console.error('Error adding money via FinancesManager:', e);
                // Fallback to direct storage
                this.addMoneyFallback(salaryPayment);
            }
        } else {
            // Fallback if FinancesManager isn't available
            this.addMoneyFallback(salaryPayment);
        }
    }

    // Check for promotions
    this.checkForPromotion();

    // Save state
    this.saveGameState();
    this.renderAll();
}

// Fallback method for adding money when FinancesManager isn't available
static addMoneyFallback(amount) {
    try {
        const currentMoney = parseInt(localStorage.getItem('characterMoney') || '0');
        localStorage.setItem('characterMoney', (currentMoney + amount).toString());
        EventManager.addToEventLog(`Received salary payment: $${amount.toLocaleString()}`, 'success');
    } catch (e) {
        console.error('Error in money fallback:', e);
        EventManager.addToEventLog(`Salary payment failed to process`, 'danger');
    }
}

    /**
     * Checks if player qualifies for a promotion
     */
static checkForPromotion() {
    if (!this.gameState.currentJob?.nextPositions) return;
    
    // Ensure careersData is valid
    if (!Array.isArray(this.careersData)) {
        console.error('Cannot check promotions - careersData is invalid');
        return;
    }
    
    // Check performance threshold (e.g., 80+)
    if (this.gameState.currentJob.performance < 80) return;
    
    // Find available promotions
    const possiblePromotions = this.gameState.currentJob.nextPositions
        .filter(pos => this.canApplyForJob(pos));

    if (possiblePromotions.length > 0) {
        // Automatically promote to first available position
        this.applyForJob(possiblePromotions[0]);
        EventManager.addToEventLog(`Promoted to ${this.gameState.currentJob.title}!`, 'success');
    }
}

static reloadCareerData() {
    this.log('Reloading career data...');
    this.loadCareerData();
    if (!Array.isArray(this.careersData)) {
        this.careersData = [];
        console.error('Failed to reload career data - using empty array');
    }
    this.renderAll();
}

    /**
     * Calculates job satisfaction (0-100)
     * @returns {number} Satisfaction percentage
     */
    static calculateJobSatisfaction() {
        if (!this.gameState.currentJob) return 0;
        
        const job = this.gameState.currentJob;
        let satisfaction = 50; // Base satisfaction
        
        // Adjust based on performance
        satisfaction += (job.performance - 50) * 0.3;
        
        // Adjust based on duration (longer duration decreases satisfaction)
        satisfaction -= Math.min(30, job.monthsWorked * 0.2);
        
        // Ensure within bounds
        return Math.max(0, Math.min(100, satisfaction));
    }

    // ===================================================================
    // RENDERING
    // ===================================================================

    static renderAll() {
        this.renderJobListings();
        this.renderCurrentJob();
        this.renderJobHistory();
        this.updateStats();
    }

    static renderJobListings() {
        if (!this.elements.jobsContainer) return;

        this.elements.jobsContainer.innerHTML = this.careersData.map(job => {
            const canApply = this.canApplyForJob(job.id);
            const isCurrentJob = this.gameState.currentJob?.id === job.id;
            
            let buttonText = 'View Details';
            let buttonDisabled = false;
            let statusBadge = '';

            if (isCurrentJob) {
                statusBadge = '<span class="badge bg-primary">Current Job</span>';
                buttonDisabled = true;
            } else if (!canApply) {
                statusBadge = '<span class="badge bg-secondary">Requirements Not Met</span>';
            }
            
            return `
                <div class="col-md-6">
                    <div class="job-card">
                        ${statusBadge}
                        <div class="job-card-header">
                            <h3>${job.title}</h3>
                            <span class="badge bg-success">$${job.salary.toLocaleString()}/month</span>
                        </div>
                        <p>${job.description}</p>
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            ${(job.skillsGained || []).map(skill => 
                                `<span class="badge bg-info">${window.SKILLS?.[skill]?.name || skill}</span>`
                            ).join('')}
                        </div>
                        <button class="btn btn-primary job-action-btn w-100" 
                                data-job-id="${job.id}" ${buttonDisabled ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    static renderCurrentJob() {
        if (!this.elements.currentJobDetails) return;

        if (!this.gameState.currentJob) {
            this.elements.currentJobDetails.innerHTML = `
                <div class="alert alert-info mb-0">
                    You are not currently employed.
                </div>
            `;
            return;
        }

        const job = this.gameState.currentJob;
        const satisfaction = this.calculateJobSatisfaction();
        
        this.elements.currentJobDetails.innerHTML = `
            <div class="current-job-item">
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <div class="d-flex justify-content-between mb-2">
                    <span><strong>Salary:</strong> $${job.salary.toLocaleString()}/month</span>
                    <span><strong>Performance:</strong> ${job.performance}%</span>
                </div>
                <div class="progress mb-2" style="height: 10px;">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${job.performance}%" 
                         aria-valuenow="${job.performance}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span><strong>Satisfaction:</strong> ${Math.round(satisfaction)}%</span>
                    <span><strong>Duration:</strong> ${job.monthsWorked} months</span>
                </div>
                <div class="d-flex flex-wrap gap-1 mb-3">
                    ${(job.skillsGained || []).map(skill => 
                        `<span class="badge bg-info">${window.SKILLS?.[skill]?.name || skill}</span>`
                    ).join('')}
                </div>
                <button class="btn btn-danger w-100" id="quitJobBtn">
                    Quit Job
                </button>
            </div>
        `;

        // Add quit job button listener
        const quitBtn = document.getElementById('quitJobBtn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitJob());
        }
    }

    static renderJobHistory() {
        if (!this.elements.jobHistory) return;

        if (this.gameState.jobHistory.length === 0) {
            this.elements.jobHistory.innerHTML = `
                <div class="alert alert-info mb-0">
                    No employment history yet.
                </div>
            `;
            return;
        }

        this.elements.jobHistory.innerHTML = this.gameState.jobHistory.map(job => `
            <div class="job-history-item">
                <div class="d-flex justify-content-between">
                    <strong>${job.title}</strong>
                    <span>$${job.salary.toLocaleString()}/month</span>
                </div>
                <div class="d-flex justify-content-between text-muted small">
                    <span>${job.startDate} - ${job.endDate}</span>
                    <span>${job.monthsWorked} months</span>
                </div>
            </div>
        `).join('');
    }

    static updateStats() {
        if (this.elements.currentJob) {
            this.elements.currentJob.textContent = this.gameState.currentJob?.title || 'Unemployed';
        }
        if (this.elements.salaryDisplay) {
            this.elements.salaryDisplay.textContent = this.gameState.currentJob ? 
                `$${this.gameState.currentJob.salary.toLocaleString()}/month` : '$0/month';
        }
        if (this.elements.performanceDisplay) {
            this.elements.performanceDisplay.textContent = this.gameState.currentJob ? 
                `${this.gameState.currentJob.performance}%` : '0%';
        }
        if (this.elements.satisfactionDisplay) {
            const satisfaction = this.calculateJobSatisfaction();
            this.elements.satisfactionDisplay.textContent = this.gameState.currentJob ? 
                `${Math.round(satisfaction)}%` : '0%';
        }
    }

    static showJobDetails(jobId) {
        const job = this.careersData.find(j => j.id === jobId);
        if (!job || !this.elements.modal) return;

        this.selectedJob = job;

        // Populate modal content
        this.elements.modalTitle.textContent = job.title;
        this.elements.modalDescription.textContent = job.description;
        this.elements.modalSalary.textContent = `$${job.salary.toLocaleString()}/month`;

        // Populate requirements
        const missingReqs = this.getMissingRequirements(jobId);
        this.elements.modalRequirements.innerHTML = '';

        // Age requirement
        if (job.requirements?.age) {
            const met = TimeManager?.timeState?.age >= job.requirements.age;
            this.elements.modalRequirements.innerHTML += `
                <li class="${met ? 'met' : 'unmet'}">
                    Minimum Age: ${job.requirements.age} 
                    ${met ? '✓' : `✗ (Current: ${TimeManager?.timeState?.age || 0})`}
                </li>
            `;
        }

        // Education requirements
        if (job.requirements?.education) {
            if (job.requirements.education.includes('none')) {
                this.elements.modalRequirements.innerHTML += `
                    <li class="met">
                        Education: None required ✓
                    </li>
                `;
            } else {
                job.requirements.education.forEach(edu => {
                    const met = window.EducationManager?.gameState?.education?.completedPrograms?.includes(edu) || false;
                    this.elements.modalRequirements.innerHTML += `
                        <li class="${met ? 'met' : 'unmet'}">
                            Education: ${edu} 
                            ${met ? '✓' : '✗'}
                        </li>
                    `;
                });
            }
        }

        // Skill requirements
        if (job.requirements?.skills) {
            job.requirements.skills.forEach(skill => {
                const skillData = window.EducationManager?.gameState?.education?.skills?.[skill];
                const met = skillData && skillData.level > 0;
                this.elements.modalRequirements.innerHTML += `
                    <li class="${met ? 'met' : 'unmet'}">
                        Skill: ${window.SKILLS?.[skill]?.name || skill} 
                        ${met ? '✓' : '✗'}
                    </li>
                `;
            });
        }

        // Experience requirements
        if (job.requirements?.experience) {
            job.requirements.experience.forEach(exp => {
                const met = this.gameState.experience[exp] > 0;
                this.elements.modalRequirements.innerHTML += `
                    <li class="${met ? 'met' : 'unmet'}">
                        Experience: ${exp} 
                        ${met ? '✓' : '✗'}
                    </li>
                `;
            });
        }

        // Populate skills gained
        this.elements.modalSkills.innerHTML = (job.skillsGained || []).map(skill => {
            const skillName = window.SKILLS?.[skill]?.name || skill;
            return `<li>${skillName}</li>`;
        }).join('') || '<li>No specific skills listed</li>';

        // Update apply button
        const canApply = this.canApplyForJob(jobId);
        const isCurrentJob = this.gameState.currentJob?.id === jobId;
        
        this.elements.applyJobBtn.disabled = !canApply || isCurrentJob;
        this.elements.applyJobBtn.textContent = 
            isCurrentJob ? 'Current Job' :
            !canApply ? 'Requirements Not Met' :
            'Apply';

        this.elements.modal.show();
    }

    // ===================================================================
    // UTILITIES
    // ===================================================================

    static getCurrentDateString() {
        // Try to use TimeManager if available
        if (typeof TimeManager !== 'undefined' && TimeManager.getCurrentDateString) {
            return TimeManager.getCurrentDateString();
        }
        
        // Fallback implementation
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const quarter = Math.floor(month / 3) + 1;
        return `Year ${year - 2023 + 1}, Q${quarter}`;
    }

    static log(...args) {
        if (this.debug) {
            console.log('[CareerManager]', ...args);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if on career page
    if (document.querySelector('.job-listings-container')) {
        CareerManager.init();
    }
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    CareerManager.cleanup();
});