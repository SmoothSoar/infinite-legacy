// Universal CareerManager.js - Works Across All Pages
class CareerManager {
    // Configuration
    static debug = true;
    static initialized = false;
    
    // State management
    static gameState = null;
    static careersData = [];
    static selectedJob = null;
    
    // UI elements cache (optional, only used on career page)
    static elements = {};
    
    // Event listeners for cleanup
    static eventListeners = [];
    
    // Constants
    static PERFORMANCE_RANGE = { min: 0, max: 100 };
    static DEFAULT_SATISFACTION = 50;
    static MIN_SATISFACTION = 0;
    static MAX_SATISFACTION = 100;
    static PROMOTION_THRESHOLD = 80;
    static BASE_PERFORMANCE_INCREASE = 1;
    static MAX_PERFORMANCE_INCREASE = 5;

    /**
     * Initializes the CareerManager system
     */
    static init() {
        try {
            if (this.initialized) {
                this.log('Already initialized');
                return;
            }
            
            this.log('Initializing CareerManager...');
            
            // Load data with validation
            this.loadCareerData();
            this.validateCareerData();
            
            // Load and validate game state
            this.loadGameState();
            this.validateGameState();
            
            // Setup UI only if on career page
            if (this.isCareerPage()) {
                this.cacheElements();
                this.setupEventListeners();
                this.renderAll();
            } else {
                // Universal setup for other pages
                this.setupUniversalListeners();
            }
            
            // Register debug method
            window.reloadCareerData = () => this.reloadCareerData();
            
            this.initialized = true;
            this.log('Initialization complete');
        } catch (error) {
            console.error('CareerManager initialization failed:', error);
            this.fallbackInitialization();
            throw error;
        }
    }

    /**
     * Sets up universal event listeners for all pages
     */
  static setupUniversalListeners() {
    // Time advancement listener
    const timeAdvancedListener = (e) => {
        this.handleTimeAdvanced(e.detail);
    };
    document.addEventListener('timeAdvanced', timeAdvancedListener);
    this.eventListeners.push({
        element: document,
        type: 'timeAdvanced',
        listener: timeAdvancedListener
    });
    
    // Enhanced storage listener
    const storageListener = (e) => {
        if (e.key === 'careerGameState') {
            try {
                const newState = JSON.parse(e.newValue);
                if (newState && newState.lastUpdated !== this.gameState.lastUpdated) {
                    this.gameState = newState;
                    if (this.isCareerPage()) this.renderAll();
                    this.log('State updated from storage');
                }
            } catch (error) {
                console.error('Error parsing career state:', error);
            }
        }
    };
    
    window.addEventListener('storage', storageListener);
    this.eventListeners.push({
        element: window,
        type: 'storage',
        listener: storageListener
    });
}

    /**
     * Fallback initialization when main init fails
     */
    static fallbackInitialization() {
        this.careersData = [];
        this.gameState = this.getDefaultGameState();
        this.initialized = false;
    }

    static cleanup() {
        // Remove event listeners if any
        this.removeEventListeners();
        
        // Clear any cached elements
        this.elements = {};
        
        // Reset initialization flag
        this.initialized = false;
        
        // Log the cleanup
        if (this.debug) {
            console.log('[CareerManager] Cleaned up successfully');
        }
    }

    static removeEventListeners() {
        this.eventListeners.forEach(({element, type, listener}) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];
    }

    // ===================================================================
    // DATA MANAGEMENT
    // ===================================================================

    /**
     * Loads career data from window.CAREERS with validation
     */
    static loadCareerData() {
        try {
            // Initialize as empty array if not set
            if (!Array.isArray(this.careersData)) {
                this.careersData = [];
            }
            
            // Only overwrite if window.CAREERS is valid
            if (Array.isArray(window.CAREERS)) {
                this.careersData = [...window.CAREERS]; // Create copy
                this.log(`Loaded ${this.careersData.length} careers`);
            } else {
                console.warn('window.CAREERS is not an array, using existing data');
            }
        } catch (e) {
            this.log('Error loading career data:', e);
            if (!Array.isArray(this.careersData)) {
                this.careersData = [];
            }
        }
    }

    /**
     * Validates loaded career data structure
     */
    static validateCareerData() {
        if (!Array.isArray(this.careersData)) {
            console.error('Invalid career data - initializing empty array');
            this.careersData = [];
            return;
        }
        
        // Basic validation for each career entry
        this.careersData = this.careersData.filter(job => {
            const isValid = 
                typeof job.id === 'string' &&
                typeof job.title === 'string' &&
                typeof job.salary === 'number' &&
                typeof job.description === 'string';
            
            if (!isValid) {
                console.warn('Removing invalid career entry:', job);
            }
            return isValid;
        });
    }

    /**
     * Reloads career data (debug/recovery)
     */
    static reloadCareerData() {
        try {
            this.log('Reloading career data...');
            const currentJobId = this.gameState.currentJob?.id;
            const savedState = {...this.gameState};
            
            this.loadCareerData();
            this.validateCareerData();
            
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
            if (this.isCareerPage()) this.renderAll();
            return true;
        } catch (e) {
            console.error('Error reloading career data:', e);
            return false;
        }
    }

    // ===================================================================
    // STATE MANAGEMENT
    // ===================================================================

    /**
     * Loads game state from localStorage
     */
    static loadGameState() {
        try {
            const savedState = localStorage.getItem('careerGameState');
            if (!savedState) {
                this.gameState = this.getDefaultGameState();
            } else {
                this.gameState = JSON.parse(savedState);
                this.validateGameState();
            }
            this.log("Game state loaded");
        } catch (e) {
            console.error('Error loading game state:', e);
            this.gameState = this.getDefaultGameState();
        }
    }

    /**
     * Validates game state structure
     */
    static validateGameState() {
        if (!this.gameState) {
            this.gameState = this.getDefaultGameState();
            return;
        }
        
        // Ensure all required properties exist
        const defaults = this.getDefaultGameState();
        for (const key in defaults) {
            if (this.gameState[key] === undefined) {
                this.gameState[key] = defaults[key];
            }
        }
        
        // Validate current job if exists
        if (this.gameState.currentJob) {
            const requiredProps = ['id', 'title', 'salary', 'performance', 'monthsWorked'];
            const isValid = requiredProps.every(prop => prop in this.gameState.currentJob);
            
            if (!isValid) {
                console.warn('Invalid current job - resetting');
                this.gameState.currentJob = null;
            }
        }
    }

    /**
     * Returns default game state structure
     */
    static getDefaultGameState() {
        return {
            currentJob: null,
            jobHistory: [],
            experience: {},
            skills: {},
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Saves current game state to localStorage
     */
static saveGameState() {
    try {
        // Update timestamp
        this.gameState.lastUpdated = Date.now();
        
        // Save to localStorage
        localStorage.setItem('careerGameState', JSON.stringify(this.gameState));
        
        // Trigger storage event (for cross-tab sync)
        localStorage.setItem('careerUpdateTrigger', Date.now().toString());
        
        this.log('Game state saved');
        return true;
    } catch (e) {
        console.error('Error saving game state:', e);
        return false;
    }
}

    // In CareerManager.js, modify the getCurrentDateString method:
static getCurrentDateString() {
    if (window.timeState?.currentDate) {
        return formatDate(window.timeState.currentDate);
    }
    if (typeof TimeManager !== 'undefined' && TimeManager.getCurrentDateString) {
        return TimeManager.getCurrentDateString();
    }
    
    // Fallback implementation
    const now = new Date();
    return now.toLocaleDateString();
}

    // ===================================================================
    // CORE FUNCTIONALITY
    // ===================================================================

    /**
     * Gets current job or null if unemployed
     */
    static getCurrentJob() {
        return this.gameState?.currentJob || null;
    }

    /**
     * Checks if player meets all requirements for a job
     */
    static canApplyForJob(jobId) {
        try {
            if (typeof jobId !== 'string' || !jobId.trim()) {
                console.error('Invalid jobId:', jobId);
                return false;
            }
            
            if (!Array.isArray(this.careersData)) {
                console.error('Invalid careersData');
                return false;
            }
            
            const job = this.careersData.find(j => j.id === jobId);
            if (!job) {
                console.warn(`Job not found: ${jobId}`);
                return false;
            }
            
            const playerAge = TimeManager?.timeState?.age || 18;
            const playerEducation = window.EducationManager?.gameState?.education?.completedPrograms || [];
            const playerSkills = window.EducationManager?.gameState?.education?.skills || {};
            
            return this.checkAgeRequirement(job, playerAge) &&
                   this.checkEducationRequirement(job, playerEducation) &&
                   this.checkSkillRequirements(job, playerSkills) &&
                   this.checkExperienceRequirements(job);
        } catch (error) {
            console.error(`Error in canApplyForJob:`, error);
            return false;
        }
    }

    /**
     * Checks age requirement for a job
     */
    static checkAgeRequirement(job, playerAge) {
        if (!job.requirements?.age) return true;
        if (playerAge >= job.requirements.age) return true;
        
        this.log(`Age requirement not met: ${playerAge} < ${job.requirements.age}`);
        return false;
    }

    /**
     * Checks education requirement for a job
     */
    static checkEducationRequirement(job, playerEducation) {
        if (!job.requirements?.education) return true;
        if (job.requirements.education.includes('none')) return true;
        
        const hasEducation = job.requirements.education.some(edu => 
            playerEducation.includes(edu)
        );
        
        if (!hasEducation) {
            this.log('Education requirement not met');
        }
        return hasEducation;
    }

    /**
     * Checks skill requirements for a job
     */
    static checkSkillRequirements(job, playerSkills) {
        if (!job.requirements?.skills) return true;
        
        return job.requirements.skills.every(skill => {
            const skillData = playerSkills[skill];
            return skillData && skillData.level > 0;
        });
    }

    /**
     * Checks experience requirements for a job
     */
    static checkExperienceRequirements(job) {
        if (!job.requirements?.experience) return true;
        
        return job.requirements.experience.every(exp => 
            this.gameState.experience[exp] > 0
        );
    }

    /**
     * Gets missing requirements for a job
     */
    static getMissingRequirements(jobId) {
        const missing = {
            age: false,
            education: [],
            skills: [],
            experience: []
        };

        try {
            if (typeof jobId !== 'string' || !jobId.trim()) {
                console.error('Invalid jobId:', jobId);
                return missing;
            }
            
            if (!Array.isArray(this.careersData)) {
                console.error('Invalid careersData');
                return missing;
            }
            
            const job = this.careersData.find(j => j.id === jobId);
            if (!job) {
                console.warn(`Job not found: ${jobId}`);
                return missing;
            }
            
            const playerAge = TimeManager?.timeState?.age || 18;
            const playerEducation = window.EducationManager?.gameState?.education?.completedPrograms || [];
            const playerSkills = window.EducationManager?.gameState?.education?.skills || {};
            
            // Check age
            if (job.requirements?.age && playerAge < job.requirements.age) {
                missing.age = job.requirements.age;
            }
            
            // Check education
            if (job.requirements?.education && !job.requirements.education.includes('none')) {
                missing.education = job.requirements.education.filter(edu => 
                    !playerEducation.includes(edu)
                );
            }
            
            // Check skills
            if (job.requirements?.skills) {
                missing.skills = job.requirements.skills.filter(skill => {
                    const skillData = playerSkills[skill];
                    return !skillData || skillData.level === 0;
                });
            }
            
            // Check experience
            if (job.requirements?.experience) {
                missing.experience = job.requirements.experience.filter(exp => 
                    !this.gameState.experience[exp] || this.gameState.experience[exp] === 0
                );
            }
            
            return missing;
        } catch (error) {
            console.error(`Error in getMissingRequirements:`, error);
            return missing;
        }
    }

    /**
     * Applies for a job
     */
    static applyForJob(jobId) {
        if (!this.canApplyForJob(jobId)) {
            return false;
        }
        
        const job = this.careersData.find(j => j.id === jobId);
        if (!job) {
            return false;
        }
        
        // Create new job record
        const newJob = { 
            ...job,
            startDate: this.getCurrentDateString(),
            performance: 50, // Starting performance
            monthsWorked: 0
        };
        
        // Add current job to history if exists
        if (this.gameState.currentJob) {
            this.addJobToHistory(this.gameState.currentJob);
        }
        
        // Set new job
        this.gameState.currentJob = newJob;
        this.saveGameState();
        
        // Update UI if on career page
        if (this.isCareerPage()) {
            this.renderAll();
            this.hideModal();
        }
        
        EventManager.addToEventLog(`Started new job as ${job.title}`, 'success');
        
        // Dispatch event to notify other systems
        document.dispatchEvent(new CustomEvent('careerUpdated', {
            detail: {
                jobChanged: true,
                newJob: newJob
            }
        }));
        
        return true;
    }

    /**
     * Adds current job to history with end date
     */
    static addJobToHistory(job) {
        this.gameState.jobHistory.push({
            ...job,
            endDate: this.getCurrentDateString()
        });
    }

    /**
     * Quits current job
     */
    static quitJob() {
        if (!this.gameState.currentJob) {
            return;
        }
        
        const jobTitle = this.gameState.currentJob.title;
        this.addJobToHistory(this.gameState.currentJob);
        this.gameState.currentJob = null;
        this.saveGameState();
        
        // Update UI if on career page
        if (this.isCareerPage()) {
            this.renderAll();
        }
        
        EventManager.addToEventLog(`Quit job as ${jobTitle}`, 'warning');
        
        // Dispatch event to notify other systems
        document.dispatchEvent(new CustomEvent('careerUpdated', {
            detail: {
                jobChanged: true,
                newJob: null
            }
        }));
    }

    /**
     * Handles time advancement events (universal across all pages)
     */
  static handleTimeAdvanced(timeState) {
    if (!this.gameState.currentJob) return;

    // Track months advanced (default to 3 if not specified)
    const monthsAdvanced = timeState.monthsAdvanced || 3;

    // Update job duration
    this.gameState.currentJob.monthsWorked += monthsAdvanced;

    // Process salary payment (3 months at a time)
    const salaryPayment = this.gameState.currentJob.salary * monthsAdvanced;
    this.processSalaryPayment(salaryPayment);

    // Update performance and check for promotion
    this.updatePerformance(monthsAdvanced);
    this.gainExperience(monthsAdvanced);
    this.gainSkills(monthsAdvanced);
    
    // Handle quarterly events
    if (timeState.isQuarterly) {
        this.handleQuarterTransition();
    }

    // Check for promotion after all updates
    this.checkForPromotion();

    // Save career state and trigger sync
    this.saveGameState();

    // Update UI if on career page
    if (this.isCareerPage()) {
        this.renderAll();
    }

    // Notify other systems
    document.dispatchEvent(new CustomEvent('careerUpdated', {
        detail: {
            jobChanged: false,
            performanceChanged: true,
            monthsAdvanced: monthsAdvanced
        }
    }));
}

static handleQuarterTransition() {
    if (!this.gameState.currentJob) return;
    
    // Add quarterly performance review
    const performanceChange = Math.floor(Math.random() * 10) - 3; // -3 to +6
    this.gameState.currentJob.performance = Math.max(0, 
        Math.min(100, this.gameState.currentJob.performance + performanceChange));
    
    // Add quarterly satisfaction adjustment
    const satisfactionChange = Math.floor(Math.random() * 8) - 2; // -2 to +5
    const currentSatisfaction = this.calculateJobSatisfaction();
    this.gameState.currentJob.satisfaction = Math.max(0, 
        Math.min(100, currentSatisfaction + satisfactionChange));
    
    // Save changes
    this.saveGameState();
    
    // Add to event log
    if (typeof EventManager !== 'undefined') {
        EventManager.addToEventLog(
            `Quarterly review: Performance ${performanceChange > 0 ? '+' : ''}${performanceChange}%`, 
            'info'
        );
    }
}

    /**
     * Universal salary payment processor
     */
  static processSalaryPayment(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
        console.error('Invalid salary amount:', amount);
        return;
    }

    try {
        // Try FinancesManager first
        if (typeof FinancesManager !== 'undefined' && FinancesManager.addMoney) {
            FinancesManager.addMoney(amount, 'Salary payment', 'salary');
            this.log('Processed salary via FinancesManager');
        } 
        // Fallback to direct character storage
        else {
            try {
                const currentCharId = localStorage.getItem('currentCharacterId');
                if (currentCharId) {
                    const characterKey = `lifeSimCharacter_${currentCharId}`;
                    const character = JSON.parse(localStorage.getItem(characterKey)) || {};
                    
                    // Initialize finances if not exists
                    if (!character._finances) {
                        character._finances = { 
                            cash: 0, 
                            bank: 0,
                            monthlyIncome: 0,
                            monthlyExpenses: 0
                        };
                    }
                    
                    // Add salary to cash
                    character._finances.cash = (character._finances.cash || 0) + amount;
                    localStorage.setItem(characterKey, JSON.stringify(character));
                    this.log('Processed salary via direct storage');
                } else {
                    // Ultimate fallback to simple storage
                    const finances = JSON.parse(localStorage.getItem('characterFinances')) || { 
                        cash: 0, 
                        bank: 0 
                    };
                    finances.cash += amount;
                    localStorage.setItem('characterFinances', JSON.stringify(finances));
                    this.log('Processed salary via fallback storage');
                }
            } catch (e) {
                console.error('Error processing salary payment:', e);
                throw e; // Re-throw to be caught by outer try-catch
            }
        }
        
        // Add to event log if available
        if (typeof EventManager !== 'undefined' && EventManager.addToEventLog) {
            EventManager.addToEventLog(`Received salary: $${amount.toLocaleString()}`, 'success');
        }
    } catch (error) {
        console.error('Salary payment processing failed completely:', error);
        if (typeof EventManager !== 'undefined' && EventManager.addToEventLog) {
            EventManager.addToEventLog('Failed to process salary payment', 'error');
        }
    }
}

    // In GameManager class, update the updateTimeDisplay method:
static updateTimeDisplay() {
    const timeState = TimeManager.getTimeState();
    const month = timeState.currentDate.getMonth() + 1;
    const quarter = timeState.quarter; // Use the stored quarter from TimeManager
    const year = timeState.currentDate.getFullYear();
    
    // Update all age displays
    document.querySelectorAll('.age-display, .characterAge').forEach(el => {
        el.textContent = `Age ${timeState.age}`;
    });
    
    // Update all date displays
    document.querySelectorAll('.time-display').forEach(el => {
        el.textContent = `Year ${year}, Q${quarter} (${timeState.currentDate.toLocaleString('default', { month: 'long' })})`;
    });
}

    /**
     * Updates job performance
     */
    static updatePerformance(monthsAdvanced) {
        const increase = Math.floor(Math.random() * this.MAX_PERFORMANCE_INCREASE) + this.BASE_PERFORMANCE_INCREASE;
        this.gameState.currentJob.performance = Math.min(
            this.PERFORMANCE_RANGE.max,
            this.gameState.currentJob.performance + increase
        );
    }

    /**
     * Gains experience from current job
     */
    static gainExperience(monthsAdvanced) {
        if (!this.gameState.currentJob.experienceGained) {
            return;
        }
        
        this.gameState.currentJob.experienceGained.forEach(exp => {
            this.gameState.experience[exp] = (this.gameState.experience[exp] || 0) + monthsAdvanced;
        });
    }

    /**
     * Gains skills from current job
     */
    static gainSkills(monthsAdvanced) {
        if (!window.EducationManager?.gameState || !this.gameState.currentJob.skillsGained) {
            return;
        }
        
        this.gameState.currentJob.skillsGained.forEach(skill => {
            if (window.EducationManager.gameState.education.skills[skill]) {
                window.EducationManager.gameState.education.skills[skill].xp += 100 * monthsAdvanced;
                window.EducationManager.gameState.education.skills[skill].level = 
                    Math.floor(window.EducationManager.gameState.education.skills[skill].xp / 1000) + 1;
            }
        });
    }

    /**
     * Checks if player qualifies for promotion
     */
    static checkForPromotion() {
        if (!this.gameState.currentJob?.nextPositions || 
            this.gameState.currentJob.performance < this.PROMOTION_THRESHOLD) {
            return;
        }
        
        if (!Array.isArray(this.careersData)) {
            console.error('Cannot check promotions - invalid careersData');
            return;
        }
        
        // Find available promotions
        const possiblePromotions = this.gameState.currentJob.nextPositions
            .filter(pos => this.canApplyForJob(pos));
        
        if (possiblePromotions.length > 0) {
            this.applyForJob(possiblePromotions[0]);
            EventManager.addToEventLog(`Promoted to ${this.gameState.currentJob.title}!`, 'success');
        }
    }

    /**
     * Calculates job satisfaction (0-100)
     */
    static calculateJobSatisfaction() {
        if (!this.gameState.currentJob) {
            return 0;
        }
        
        const job = this.gameState.currentJob;
        let satisfaction = this.DEFAULT_SATISFACTION;
        
        // Adjust based on performance
        satisfaction += (job.performance - 50) * 0.3;
        
        // Adjust based on duration
        satisfaction -= Math.min(30, job.monthsWorked * 0.2);
        
        // Ensure within bounds
        return Math.max(this.MIN_SATISFACTION, Math.min(this.MAX_SATISFACTION, satisfaction));
    }

    // ===================================================================
    // UI MANAGEMENT (Only used on career page)
    // ===================================================================

    /**
     * Checks if current page is career page
     */
    static isCareerPage() {
        return !!document.querySelector('.job-listings-container');
    }

    /**
     * Caches DOM elements (only on career page)
     */
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

    /**
     * Sets up event listeners (only on career page)
     */
    static setupEventListeners() {
        this.removeEventListeners();
        
        // Job click listener
        if (this.elements.jobsContainer) {
            const jobClickListener = (e) => {
                const button = e.target.closest('.job-action-btn');
                if (button) {
                    e.preventDefault();
                    this.showJobDetails(button.dataset.jobId);
                }
            };
            
            this.elements.jobsContainer.addEventListener('click', jobClickListener);
            this.eventListeners.push({
                element: this.elements.jobsContainer,
                type: 'click',
                listener: jobClickListener
            });
        }
        
        // Apply job button
        if (this.elements.applyJobBtn) {
            const applyClickListener = () => {
                if (this.selectedJob) {
                    this.applyForJob(this.selectedJob.id);
                }
            };
            
            this.elements.applyJobBtn.addEventListener('click', applyClickListener);
            this.eventListeners.push({
                element: this.elements.applyJobBtn,
                type: 'click',
                listener: applyClickListener
            });
        }
    }

    /**
     * Hides the job details modal
     */
    static hideModal() {
        this.elements.modal?.hide();
    }

    // ===================================================================
    // RENDERING (Only used on career page)
    // ===================================================================

    /**
     * Renders all UI components
     */
    static renderAll() {
        if (!this.isCareerPage()) return;
        
        this.renderJobListings();
        this.renderCurrentJob();
        this.renderJobHistory();
        this.updateStats();
    }

    /**
     * Renders job listings
     */
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

    /**
     * Renders current job details
     */
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

    /**
     * Renders job history
     */
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

    /**
     * Updates stats displays
     */
    static updateStats() {
        if (!this.isCareerPage()) return;
        
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

    /**
     * Shows job details in modal
     */
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

    /**
     * Gets current date string
     */
    static getCurrentDateString() {
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

    /**
     * Logs messages if debug is enabled
     */
    static log(...args) {
        if (this.debug) {
            console.log('[CareerManager]', ...args);
        }
    }
}

// Initialize when DOM is loaded (works on all pages)
document.addEventListener('DOMContentLoaded', () => {
    CareerManager.init();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    CareerManager.cleanup();
});

// Make CareerManager globally available
window.CareerManager = CareerManager;