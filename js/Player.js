export class Player {
    constructor() {
        // Load with verbose debugging
        const savedData = this.loadCharacterData();
        
        // Core properties with fallbacks
        this.name = savedData.name || 'Player';
        this.gender = savedData.gender || 'Unknown';
        this.age = savedData.age || 18;
        
        // Country handling with deep fallbacks
        this.country = {
            code: savedData.country?.code || 'UN',
            name: savedData.country?.name || this.getCountryName(savedData.country?.code) || 'Unknown'
        };
        
        // Culture handling
        this.culture = {
            name: savedData.culture?.name || 'Unknown',
            code: savedData.culture?.code || 'UNK'
        };
        
        // Skills system
        this.skills = savedData.skills || {
            programming: 0,
            communication: 0,
            leadership: 0
        };
        
        // Stats
        this.stats = savedData.stats || {
            health: 100,
            happiness: 75,
            education: 50,
            wealth: 25
        };
        
        // Life progression
        this.education = savedData.education || [];
        this.jobHistory = savedData.jobHistory || [];
        
        // Debug output
        console.log("Player initialized:", this);
    }
    
    loadCharacterData() {
        try {
            const data = JSON.parse(localStorage.getItem('lifeSimCharacter'));
            console.log("Loaded from localStorage:", data);
            return data || {};
        } catch (e) {
            console.error("Error loading character data:", e);
            return {};
        }
    }
    
    getCountryName(code) {
        if (!code || !window.COUNTRIES) return null;
        const country = window.COUNTRIES.find(c => c.code === code);
        return country?.name || null;
    }
    
    save() {
        const saveData = {
            name: this.name,
            gender: this.gender,
            age: this.age,
            country: this.country,
            culture: this.culture,
            skills: this.skills,
            stats: this.stats,
            education: this.education,
            jobHistory: this.jobHistory,
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('lifeSimCharacter', JSON.stringify(saveData));
        console.log("Character saved:", saveData);
    }
}