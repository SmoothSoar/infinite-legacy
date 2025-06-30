export class Player {
  constructor() {
    this.skills = {
      programming: 0,
      communication: 0,
      leadership: 0,
      // ...other skills
    };
    this.education = [];
    this.jobHistory = [];
    this.age = 18; // Starting age
  }

  // Calculate total work experience in years
  getWorkExperience() {
    return this.jobHistory.reduce((total, job) => {
      const endDate = job.endDate || this.age;
      return total + (endDate - job.startDate);
    }, 0);
  }

  // Monthly update
  processMonth() {
    if (this.currentJob) {
      // Gain job-related skills
      Object.entries(this.currentJob.experienceGain).forEach(([skill, gain]) => {
        this.skills[skill] += gain;
      });
    }
  }
}