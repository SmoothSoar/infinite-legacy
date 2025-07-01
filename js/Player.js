export class Player {
  constructor() {
    // Load saved data with comprehensive fallbacks
    const savedData = JSON.parse(localStorage.getItem('lifeSimCharacter')) || {};
    const timeState = JSON.parse(localStorage.getItem('timeState')) || {};

    // Core character information
    this.name = savedData.name || 'Player';
    this.gender = savedData.gender || 'Unknown';
    this.age = savedData.age || timeState.age || 18;
    
    // Country handling - supports both old and new save formats
    this.country = {
      code: savedData.country || 'UN',
      name: savedData.countryName || this.getCountryName(savedData.country) || 'Unknown'
    };
    
    // Culture handling
    this.culture = {
      name: savedData.culture || 'Unknown',
      code: savedData.cultureCode || 'UNK'
    };

    // Skills system
    this.skills = {
      programming: savedData.skills?.programming || 0,
      communication: savedData.skills?.communication || 0,
      leadership: savedData.skills?.leadership || 0,
      // Add other skills as needed
    };

    // Character stats
    this.stats = {
      health: savedData.stats?.health || 100,
      happiness: savedData.stats?.happiness || 75,
      education: savedData.stats?.education || 50,
      wealth: savedData.stats?.wealth || 25
    };

    // Life progression
    this.education = savedData.education || [];
    this.jobHistory = savedData.jobHistory || [];
    this.relationships = savedData.relationships || [];
    this.assets = savedData.assets || [];
    
    // Game state
    this.createdAt = savedData.createdAt || new Date().toISOString();
    this.lastPlayed = new Date().toISOString();
  }

  // Helper method to get country name from code
  getCountryName(code) {
    if (!window.COUNTRIES) return null;
    const country = window.COUNTRIES.find(c => c.code === code);
    return country ? country.name : null;
  }

  // Experience calculation
  getWorkExperience() {
    return this.jobHistory.reduce((total, job) => {
      const endDate = job.endDate || this.age;
      return total + (endDate - job.startDate);
    }, 0);
  }

  // Monthly update handler
  processMonth() {
    if (this.currentJob) {
      Object.entries(this.currentJob.experienceGain).forEach(([skill, gain]) => {
        this.skills[skill] = (this.skills[skill] || 0) + gain;
      });
    }
    
    // Age synchronization
    const timeState = JSON.parse(localStorage.getItem('timeState')) || {};
    if (timeState.age) this.age = timeState.age;
  }

  // Save current state
  save() {
    const saveData = {
      name: this.name,
      gender: this.gender,
      age: this.age,
      country: this.country.code,
      countryName: this.country.name,
      culture: this.culture.name,
      cultureCode: this.culture.code,
      skills: this.skills,
      stats: this.stats,
      education: this.education,
      jobHistory: this.jobHistory,
      relationships: this.relationships,
      assets: this.assets,
      createdAt: this.createdAt
    };
    
    localStorage.setItem('lifeSimCharacter', JSON.stringify(saveData));
  }
}