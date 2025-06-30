// relationships.js - Enhanced Relationship Management System
class RelationshipManager {
    // Static Properties
    static RELATIONSHIP_TYPES = {
        FAMILY: 'family',
        FRIEND: 'friend',
        ROMANTIC: 'romantic'
    };

    static COUNTRY_NAMES = {
        US: {
            male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'],
            female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'],
            last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson']
        },
        UK: {
            male: ['Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Noah', 'Charlie', 'William', 'Thomas', 'James'],
            female: ['Olivia', 'Amelia', 'Isla', 'Ava', 'Emily', 'Sophia', 'Grace', 'Lily', 'Mia', 'Poppy'],
            last: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright']
        },
        JP: {
            male: ['Hiroshi', 'Kenji', 'Taro', 'Takashi', 'Shigeru', 'Makoto', 'Yuki', 'Haruto', 'Riku', 'Sota'],
            female: ['Yoko', 'Hanako', 'Akiko', 'Sakura', 'Aoi', 'Hina', 'Mei', 'Yui', 'Rin', 'Mio'],
            last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato']
        },
        IN: {
            male: ['Aarav', 'Vihaan', 'Arjun', 'Reyansh', 'Mohammed', 'Aditya', 'Sai', 'Ishaan', 'Ayaan', 'Atharv'],
            female: ['Saanvi', 'Ananya', 'Diya', 'Aadhya', 'Aanya', 'Ishita', 'Myra', 'Riya', 'Kiara', 'Anika'],
            last: ['Patel', 'Sharma', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Joshi', 'Malhotra', 'Reddy', 'Khan']
        },
        FR: {
            male: ['Jean', 'Pierre', 'Michel', 'Philippe', 'Alain', 'Nicolas', 'Christophe', 'Patrick', 'Eric', 'David'],
            female: ['Marie', 'Nathalie', 'Isabelle', 'Sylvie', 'Catherine', 'Françoise', 'Anne', 'Valérie', 'Sandrine', 'Christine'],
            last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau']
        },
        DE: {
            male: ['Michael', 'Thomas', 'Andreas', 'Stefan', 'Christian', 'Martin', 'Wolfgang', 'Klaus', 'Jürgen', 'Peter'],
            female: ['Maria', 'Ursula', 'Monika', 'Petra', 'Elisabeth', 'Sabine', 'Andrea', 'Claudia', 'Birgit', 'Barbara'],
            last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann']
        },
        MX: {
            male: ['José', 'Juan', 'Carlos', 'Jesús', 'Manuel', 'Miguel', 'Antonio', 'Francisco', 'Luis', 'Alejandro'],
            female: ['María', 'Guadalupe', 'Juana', 'Margarita', 'Rosa', 'Carmen', 'Ana', 'Patricia', 'Elizabeth', 'Verónica'],
            last: ['Hernández', 'García', 'Martínez', 'López', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Flores']
        },
        CA: {
            male: ['Liam', 'Noah', 'Lucas', 'Benjamin', 'Oliver', 'William', 'James', 'Jacob', 'Logan', 'Alexander'],
            female: ['Emma', 'Olivia', 'Charlotte', 'Ava', 'Sophia', 'Amelia', 'Isabella', 'Mia', 'Evelyn', 'Harper'],
            last: ['Smith', 'Brown', 'Tremblay', 'Martin', 'Roy', 'Gagnon', 'Lee', 'Wilson', 'Johnson', 'MacDonald']
        },
        AU: {
            male: ['Oliver', 'Jack', 'William', 'Noah', 'Thomas', 'Lucas', 'James', 'Ethan', 'Alexander', 'Henry'],
            female: ['Charlotte', 'Olivia', 'Ava', 'Amelia', 'Mia', 'Isla', 'Sophia', 'Grace', 'Chloe', 'Emily'],
            last: ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Johnson', 'White', 'Martin', 'Anderson']
        }
    };

    static JOBS_BY_COUNTRY = {
        US: [
            { title: "Doctor", salary: 180000 },
            { title: "Software Engineer", salary: 110000 },
            { title: "Teacher", salary: 55000 },
            { title: "Nurse", salary: 70000 },
            { title: "Construction Worker", salary: 45000 },
            { title: "Accountant", salary: 65000 },
            { title: "Lawyer", salary: 120000 },
            { title: "Police Officer", salary: 60000 }
        ],
        UK: [
            { title: "Doctor", salary: 80000 },
            { title: "Software Engineer", salary: 60000 },
            { title: "Teacher", salary: 35000 },
            { title: "Nurse", salary: 30000 },
            { title: "Construction Worker", salary: 28000 },
            { title: "Accountant", salary: 40000 },
            { title: "Lawyer", salary: 70000 },
            { title: "Police Officer", salary: 35000 }
        ],
        DEFAULT: [
            { title: "Doctor", salary: 60000 },
            { title: "Engineer", salary: 50000 },
            { title: "Teacher", salary: 30000 },
            { title: "Nurse", salary: 35000 },
            { title: "Construction Worker", salary: 25000 },
            { title: "Accountant", salary: 40000 }
        ]
    };

    static INITIAL_RELATIONSHIPS = {
        family: this.generateRandomFamily(),
        friend: [],
        romantic: []
    };

    // DOM Elements
    static domElements = {
        familyList: null,
        friendsList: null,
        romanticList: null,
        makeNewFriendBtn: null,
        startDatingBtn: null,
        relationshipModal: null,
        modalTitle: null,
        modalBody: null,
        interactBtn: null
    };

    // Current Relationship
    static currentRelationship = null;

    // Initialization
    static init() {
        if (!localStorage.getItem('relationships')) {
            this.resetRelationships();
        }
        
        this.cacheDOMElements();
        this.setupEventListeners();
        this.renderAllRelationships();
    }

    static cacheDOMElements() {
        this.domElements = {
            familyList: document.getElementById('familyRelationships'),
            friendsList: document.getElementById('friendRelationships'),
            romanticList: document.getElementById('romanticRelationships'),
            makeNewFriendBtn: document.getElementById('makeNewFriendBtn'),
            startDatingBtn: document.getElementById('startDatingBtn'),
            relationshipModal: new bootstrap.Modal(document.getElementById('relationshipModal')),
            modalTitle: document.getElementById('relationshipModalTitle'),
            modalBody: document.getElementById('relationshipModalBody'),
            interactBtn: document.getElementById('interactBtn')
        };
    }

    static setupEventListeners() {
        if (this.domElements.makeNewFriendBtn) {
            this.domElements.makeNewFriendBtn.addEventListener('click', () => this.makeNewFriend());
        }
        
        if (this.domElements.startDatingBtn) {
            this.domElements.startDatingBtn.addEventListener('click', () => this.startDating());
        }
        
        if (this.domElements.interactBtn) {
            this.domElements.interactBtn.addEventListener('click', () => this.showActivityOptions());
        }
        
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.relationship-card');
            if (card) {
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }

    // Core Relationship Methods
    static resetRelationships() {
        const relationships = {
            family: this.generateRandomFamily(),
            friend: [],
            romantic: []
        };
        localStorage.setItem('relationships', JSON.stringify(relationships));
    }

    static getRelationships() {
        return JSON.parse(localStorage.getItem('relationships')) || this.INITIAL_RELATIONSHIPS;
    }

    static saveRelationships(relationships) {
        localStorage.setItem('relationships', JSON.stringify(relationships));
    }

    // Generation Methods
    static getRandomCountry() {
        const countries = [
            'US', 'US', 'US', 'US', // Higher weight for US
            'UK', 'UK', 'UK',
            'CA', 'CA',
            'AU',
            'JP', 'IN', 'FR', 'DE', 'MX'
        ];
        return countries[Math.floor(Math.random() * countries.length)];
    }

    static generateRandomFamily() {
        const family = [];
        const countryCode = this.getRandomCountry();
        const countryNames = this.COUNTRY_NAMES[countryCode] || this.COUNTRY_NAMES.US;
        const countryData = window.COUNTRIES?.find(c => c.code === countryCode) || { 
            name: 'Unknown', 
            code: 'us'
        };

        const createFamilyMember = (role, name, gender, ageModifier = 0) => {
            const countryJobs = this.JOBS_BY_COUNTRY[countryCode] || this.JOBS_BY_COUNTRY.DEFAULT;
            const randomJob = countryJobs[Math.floor(Math.random() * countryJobs.length)];
            
            const baseSalary = randomJob.salary;
            const experienceFactor = 1 + (Math.random() * 0.5);
            const salary = Math.round(baseSalary * experienceFactor);
            
            return {
                id: `family-${Math.random().toString(36).substring(2, 9)}`,
                name: role,
                fullName: name,
                closeness: 70 + Math.floor(Math.random() * 20),
                age: 40 + Math.floor(Math.random() * 10) + ageModifier,
                gender: gender,
                country: countryData.name,
                countryCode: countryCode,
                description: `Your ${role.toLowerCase()}, ${name.split(' ')[0]}. Originally from ${countryData.name}.`,
                traits: this.generateRandomTraits(),
                job: {
                    title: randomJob.title,
                    salary: salary,
                    currency: this.getCurrencyForCountry(countryCode)
                }
            };
        };

        // Mother
        const motherName = `${countryNames.female[Math.floor(Math.random() * countryNames.female.length)]} ${countryNames.last[Math.floor(Math.random() * countryNames.last.length)]}`;
        family.push(createFamilyMember("Mother", motherName, "Female"));

        // Father (80% chance)
        if (Math.random() > 0.2) {
            const fatherName = `${countryNames.male[Math.floor(Math.random() * countryNames.male.length)]} ${countryNames.last[Math.floor(Math.random() * countryNames.last.length)]}`;
            family.push(createFamilyMember("Father", fatherName, "Male"));
        }

        // Sibling (50% chance)
        if (Math.random() > 0.5) {
            const siblingGender = Math.random() > 0.5 ? "Male" : "Female";
            const siblingFirstName = siblingGender === "Male" 
                ? countryNames.male[Math.floor(Math.random() * countryNames.male.length)]
                : countryNames.female[Math.floor(Math.random() * countryNames.female.length)];
            const siblingName = `${siblingFirstName} ${countryNames.last[Math.floor(Math.random() * countryNames.last.length)]}`;
            
            family.push(createFamilyMember(
                siblingGender === "Male" ? "Brother" : "Sister", 
                siblingName, 
                siblingGender,
                -25
            ));
        }
        
        return family;
    }

    static getCurrencyForCountry(countryCode) {
        const currencies = {
            US: 'USD',
            UK: 'GBP',
            EU: 'EUR',
            JP: 'JPY',
            IN: 'INR',
            CA: 'CAD',
            AU: 'AUD',
            MX: 'MXN',
            BR: 'BRL',
            DEFAULT: 'USD'
        };
        return currencies[countryCode] || currencies.DEFAULT;
    }

    static generateRandomPerson(countryCode = null) {
        const code = countryCode || this.getRandomCountry();
        const countryNames = this.COUNTRY_NAMES[code] || this.COUNTRY_NAMES.US;
        const countryData = window.COUNTRIES?.find(c => c.code === code) || { 
            name: 'Unknown', 
            code: 'us'
        };
        const gender = Math.random() > 0.5 ? "Male" : "Female";
        const firstName = gender === "Male" 
            ? countryNames.male[Math.floor(Math.random() * countryNames.male.length)]
            : countryNames.female[Math.floor(Math.random() * countryNames.female.length)];
        const lastName = countryNames.last[Math.floor(Math.random() * countryNames.last.length)];

        return {
            fullName: `${firstName} ${lastName}`,
            gender: gender,
            country: countryData.name,
            countryCode: code,
            traits: this.generateRandomTraits(),
            description: `${firstName} is from ${countryData.name}. ${this.getRandomDescription(gender)}`
        };
    }

    static getRandomDescription(gender) {
        const descriptions = {
            Male: [
                "He's quite interesting to talk to.",
                "He has a great sense of humor.",
                "He's very knowledgeable about many topics.",
                "He's always up for an adventure.",
                "He's a very loyal person."
            ],
            Female: [
                "She's very easy to get along with.",
                "She has a great sense of style.",
                "She's incredibly intelligent.",
                "She's always there when you need her.",
                "She's very creative and artistic."
            ]
        };
        return descriptions[gender][Math.floor(Math.random() * descriptions[gender].length)];
    }

    static generateRandomTraits() {
        const traits = [
            'Kind', 'Funny', 'Smart', 'Ambitious', 'Creative',
            'Adventurous', 'Patient', 'Honest', 'Loyal', 'Confident',
            'Shy', 'Quirky', 'Artistic', 'Athletic', 'Musical',
            'Analytical', 'Charismatic', 'Compassionate', 'Diligent', 'Empathetic',
            'Generous', 'Humorous', 'Insightful', 'Optimistic', 'Practical'
        ];
        const count = 3 + Math.floor(Math.random() * 3);
        const shuffled = [...traits].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Friend and Romantic Relationship Methods
    static makeNewFriend() {
        const relationships = this.getRelationships();
        const character = JSON.parse(localStorage.getItem('lifeSimCharacter')) || {};
        const person = this.generateRandomPerson(character.countryCode);
        
        const newFriend = {
            id: `friend-${Math.random().toString(36).substring(2, 9)}`,
            name: person.fullName,
            closeness: 30 + Math.floor(Math.random() * 20),
            age: (character.age || 18) + Math.floor(Math.random() * 5) - 2,
            gender: person.gender,
            country: person.country,
            countryCode: person.countryCode,
            description: person.description,
            traits: person.traits
        };
        
        relationships.friend.push(newFriend);
        this.saveRelationships(relationships);
        this.renderRelationshipList(this.RELATIONSHIP_TYPES.FRIEND, relationships.friend);
        
        if (typeof EventManager !== 'undefined') {
            EventManager.addToEventLog(`Made a new friend: ${newFriend.name} from ${newFriend.country}`, 'success');
        }
    }

    static startDating() {
        const relationships = this.getRelationships();
        const character = JSON.parse(localStorage.getItem('lifeSimCharacter')) || {};
        
 if (!this.canDateAgain()) {
        const cooldown = JSON.parse(localStorage.getItem('breakupCooldown'));
        const remainingDays = Math.ceil(cooldown.duration - (new Date().getTime() - cooldown.date) / (1000 * 60 * 60 * 24));
        
        this.domElements.modalTitle.textContent = 'Not Ready to Date';
        this.domElements.modalBody.innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-clock-history"></i>
                <p>You're not emotionally ready to start a new relationship yet.</p>
                <p class="mt-2">You'll be ready to date again in ${remainingDays} days.</p>
            </div>
        `;
        this.domElements.relationshipModal.show();
        return;
    }

        if (relationships.romantic.length > 0) {
            this.domElements.modalTitle.textContent = 'Already in a Relationship';
            this.domElements.modalBody.innerHTML = `
                <div class="alert alert-warning">
                    You're already in a romantic relationship with ${relationships.romantic[0].name}.
                </div>
            `;
            this.domElements.interactBtn.style.display = 'none';
            this.domElements.relationshipModal.show();
            return;
        }
        
        const person = this.generateRandomPerson(character.countryCode);
        const newPartner = {
            id: `romantic-${Math.random().toString(36).substring(2, 9)}`,
            name: person.fullName,
            closeness: 50 + Math.floor(Math.random() * 20),
            age: (character.age || 18) + Math.floor(Math.random() * 5) - 2,
            gender: person.gender,
            country: person.country,
            countryCode: person.countryCode,
            description: `You started dating ${person.fullName.split(' ')[0]} after meeting ${Math.random() > 0.5 ? 'at work' : 'through friends'}. ${person.description}`,
            traits: person.traits
        };
        
        relationships.romantic.push(newPartner);
        this.saveRelationships(relationships);
        this.renderRelationshipList(this.RELATIONSHIP_TYPES.ROMANTIC, relationships.romantic);
        
        if (typeof EventManager !== 'undefined') {
            EventManager.addToEventLog(`Started dating ${newPartner.name} from ${newPartner.country}!`, 'danger');
        }
    }

    // Activity System
    static showActivityOptions() {
        if (!this.currentRelationship) return;
        
        const { id, type } = this.currentRelationship;
        const relationship = this.getRelationships()[type].find(rel => rel.id === id);
        if (!relationship) return;
        
        let activityOptions = [];
        let modalTitle = '';
        
        if (type === this.RELATIONSHIP_TYPES.FAMILY) {
            modalTitle = `Choose Family Activity with ${relationship.name}`;
            const role = relationship.name.toLowerCase();
            
            if (role === 'mother') {
                activityOptions = [
                    { icon: 'bi-chat-heart', text: 'Have a heart-to-heart talk', change: [10, 15] },
                    { icon: 'bi-cup-straw', text: 'Go out for tea/coffee', change: [8, 12] },
                    { icon: 'bi-book', text: 'Look through family albums', change: [12, 18] },
                    { icon: 'bi-basket', text: 'Go grocery shopping together', change: [5, 8] },
                    { icon: 'bi-flower1', text: 'Visit a garden or park', change: [10, 15] },
                    { icon: 'bi-film', text: 'Watch her favorite movie', change: [8, 12] }
                ];
            } else if (role === 'father') {
                activityOptions = [
                    { icon: 'bi-tools', text: 'Work on a project together', change: [10, 15] },
                    { icon: 'bi-tv', text: 'Watch the game together', change: [8, 12] },
                    { icon: 'bi-tree', text: 'Go fishing/camping', change: [12, 18] },
                    { icon: 'bi-car-front', text: 'Go for a drive', change: [5, 10] },
                    { icon: 'bi-joystick', text: 'Play chess or cards', change: [8, 12] },
                    { icon: 'bi-hammer', text: 'Fix something around the house', change: [10, 15] }
                ];
            } else if (role === 'sister' || role === 'brother') {
                activityOptions = [
                    { icon: 'bi-controller', text: 'Play games together', change: [8, 12] },
                    { icon: 'bi-film', text: 'Watch a movie/show', change: [5, 10] },
                    { icon: 'bi-music-note-beamed', text: 'Share music playlists', change: [10, 15] },
                    { icon: 'bi-bicycle', text: 'Exercise/play sports', change: [8, 12] },
                    { icon: 'bi-shop', text: 'Go shopping together', change: [5, 10] },
                    { icon: 'bi-cake', text: 'Bake or cook together', change: [10, 15] }
                ];
            }
        } 
        else if (type === this.RELATIONSHIP_TYPES.FRIEND) {
            modalTitle = `Choose Activity with ${relationship.name}`;
            activityOptions = [
                { icon: 'bi-cup-hot', text: 'Get coffee/lunch', change: [5, 10] },
                { icon: 'bi-ticket-perforated', text: 'Attend an event', change: [10, 15] },
                { icon: 'bi-joystick', text: 'Play video games', change: [8, 12] },
                { icon: 'bi-palette', text: 'Do creative project', change: [10, 15] },
                { icon: 'bi-bicycle', text: 'Play sports together', change: [8, 12] },
                { icon: 'bi-camera', text: 'Go sightseeing', change: [10, 15] },
                { icon: 'bi-book', text: 'Visit a bookstore/library', change: [5, 10] },
                { icon: 'bi-music-note-beamed', text: 'Listen to music together', change: [5, 8] }
            ];
        } 
        else if (type === this.RELATIONSHIP_TYPES.ROMANTIC) {
            modalTitle = `Choose Date with ${relationship.name}`;
            activityOptions = [
                { icon: 'bi-egg-fried', text: 'Romantic dinner', change: [10, 15] },
                { icon: 'bi-film', text: 'Movie night', change: [8, 12] },
                { icon: 'bi-airplane', text: 'Weekend getaway', change: [15, 25] },
                { icon: 'bi-flower1', text: 'Surprise date', change: [12, 20] },
                { icon: 'bi-cup-straw', text: 'Coffee shop date', change: [5, 10] },
                { icon: 'bi-bicycle', text: 'Bike ride together', change: [10, 15] },
                { icon: 'bi-moon-stars', text: 'Stargazing', change: [12, 18] },
                { icon: 'bi-music-note-beamed', text: 'Concert or show', change: [10, 15] }
            ];
        }
        
        // Create modal content with buttons for each activity
        const optionsHTML = activityOptions.map(opt => `
            <button class="btn btn-outline-primary w-100 mb-2 activity-option" 
                    data-change="${Math.floor(Math.random() * (opt.change[1] - opt.change[0] + 1)) + opt.change[0]}">
                <i class="bi ${opt.icon} me-2"></i>
                ${opt.text}
            </button>
        `).join('');
        
        this.domElements.modalTitle.textContent = modalTitle;
        this.domElements.modalBody.innerHTML = `
            <div class="text-center mb-3">
                <h5>What would you like to do?</h5>
                <p class="text-muted">Choose an activity to increase your closeness</p>
            </div>
            <div class="activity-options">
                ${optionsHTML}
            </div>
        `;
        
        // Add event listeners to activity buttons
        this.domElements.modalBody.querySelectorAll('.activity-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const change = parseInt(btn.dataset.change);
                this.performChosenActivity(change, btn.textContent.trim());
            });
        });
        
        this.domElements.interactBtn.style.display = 'none';
        this.domElements.relationshipModal.show();
    }

    static askFriendOnDate(friendId) {
    const relationships = this.getRelationships();
    const friend = relationships.friend.find(f => f.id === friendId);
    
    if (!friend) return false;
    
    // Check if already in a romantic relationship
    if (relationships.romantic.length > 0) {
        this.domElements.modalTitle.textContent = 'Already in a Relationship';
        this.domElements.modalBody.innerHTML = `
            <div class="alert alert-warning">
                You're already in a romantic relationship with ${relationships.romantic[0].name}.
            </div>
        `;
        this.domElements.relationshipModal.show();
        return false;
    }
    
    // Calculate success chance based on closeness (30% base + closeness%)
    const successChance = 30 + friend.closeness;
    const isSuccess = Math.random() * 100 < successChance;
    
    if (isSuccess) {
        // Convert friend to romantic partner
        const newPartner = {
            ...friend,
            id: `romantic-${Math.random().toString(36).substring(2, 9)}`,
            closeness: friend.closeness + 10 // Small closeness boost
        };
        
        // Remove from friends list
        relationships.friend = relationships.friend.filter(f => f.id !== friendId);
        relationships.romantic.push(newPartner);
        this.saveRelationships(relationships);
        
        // Update UI
        this.renderAllRelationships();
        
        // Show success message
        this.domElements.modalTitle.textContent = 'Date Successful!';
        this.domElements.modalBody.innerHTML = `
            <div class="alert alert-success">
                <i class="bi bi-balloon-heart"></i>
                <p>${friend.name} accepted your invitation! You're now dating.</p>
                <p class="mt-2">Your closeness increased to ${newPartner.closeness}%.</p>
            </div>
        `;
        
        if (typeof EventManager !== 'undefined') {
            EventManager.addToEventLog(
                `Started dating ${newPartner.name}!`, 
                'danger'
            );
        }
    } else {
        // Show rejection message
        const rejectionMessages = [
            `${friend.name} says they'd prefer to stay friends.`,
            `${friend.name} politely declines your invitation.`,
            `${friend.name} seems flattered but isn't interested in dating.`,
            `${friend.name} says they're not looking for a relationship right now.`
        ];
        
        this.domElements.modalTitle.textContent = 'Date Rejected';
        this.domElements.modalBody.innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-emoji-frown"></i>
                <p>${rejectionMessages[Math.floor(Math.random() * rejectionMessages.length)]}</p>
                <p class="mt-2">Your closeness decreased slightly.</p>
            </div>
        `;
        
        // Small closeness penalty
        friend.closeness = Math.max(0, friend.closeness - 5);
        this.saveRelationships(relationships);
        this.renderRelationshipList(this.RELATIONSHIP_TYPES.FRIEND, relationships.friend);
    }
    
    this.domElements.relationshipModal.show();
    return isSuccess;
}

    static performChosenActivity(change, activityText) {
        if (!this.currentRelationship) return;
        
        const { id, type } = this.currentRelationship;
        const relationships = this.getRelationships();
        const relationship = relationships[type].find(rel => rel.id === id);
        if (!relationship) return;
        
        const oldCloseness = relationship.closeness;
        relationship.closeness = Math.max(0, Math.min(100, oldCloseness + change));
        this.saveRelationships(relationships);
        
        // Update modal with results
        this.domElements.modalBody.innerHTML += `
            <div class="alert alert-${
                type === this.RELATIONSHIP_TYPES.FAMILY ? 'primary' :
                type === this.RELATIONSHIP_TYPES.FRIEND ? 'success' : 'danger'
            } mt-3">
                <i class="bi ${this.getActivityResultIcon(change)} me-2"></i>
                You ${activityText.toLowerCase()}.<br>
                Closeness changed from ${oldCloseness}% to ${relationship.closeness}%.
            </div>
        `;
        
        if (typeof EventManager !== 'undefined') {
            EventManager.addToEventLog(`You ${activityText.toLowerCase()} with ${relationship.name}`, 
                type === this.RELATIONSHIP_TYPES.FAMILY ? 'info' :
                type === this.RELATIONSHIP_TYPES.FRIEND ? 'success' : 'danger'
            );
        }
        
        this.renderAllRelationships();
    }

    static getActivityResultIcon(change) {
        if (change > 15) return 'bi-stars';
        if (change > 5) return 'bi-emoji-smile';
        if (change < 0) return 'bi-emoji-frown';
        return 'bi-emoji-neutral';
    }

    // Relationship Utility Methods
    static getSharedInterests(relationship) {
        const interests = [
            'music', 'movies', 'sports', 'travel', 'cooking',
            'reading', 'gaming', 'art', 'technology', 'fashion',
            'photography', 'animals', 'history', 'science', 'fitness'
        ];
        
        const shared = [];
        const numShared = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numShared; i++) {
            const available = interests.filter(interest => !shared.includes(interest));
            if (available.length > 0) {
                shared.push(available[Math.floor(Math.random() * available.length)]);
            }
        }
        
        return shared;
    }

    static getCompatibilityScore(relationship) {
        let score = relationship.closeness;
        
        const character = JSON.parse(localStorage.getItem('lifeSimCharacter')) || {};
        if (character.traits) {
            const sharedTraits = relationship.traits.filter(trait => 
                character.traits.includes(trait));
            score += sharedTraits.length * 5;
        }
        
        score += Math.floor(Math.random() * 21) - 10;
        
        return Math.max(0, Math.min(100, score));
    }

    // Rendering Methods
    static renderAllRelationships() {
        const relationships = this.getRelationships();
        this.renderRelationshipList(this.RELATIONSHIP_TYPES.FAMILY, relationships.family);
        this.renderRelationshipList(this.RELATIONSHIP_TYPES.FRIEND, relationships.friend);
        this.renderRelationshipList(this.RELATIONSHIP_TYPES.ROMANTIC, relationships.romantic);
    }

    static renderRelationshipList(type, relationships) {
        const container = this.getContainerForType(type);
        if (!container) return;

        if (relationships.length === 0) {
            container.innerHTML = `<div class="text-muted text-center py-3">No ${type} relationships yet</div>`;
            return;
        }

        container.innerHTML = relationships.map(rel => this.createRelationshipCard(rel, type)).join('');
        
        container.querySelectorAll('.relationship-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn')) {
                    const id = card.dataset.id;
                    this.showRelationshipDetails(id, type);
                }
            });
        });
    }

    static createRelationshipCard(relationship, type) {
    const closenessClass = this.getClosenessClass(relationship.closeness);
    const countryFlag = relationship.countryCode ? 
        `<span class="flag-icon flag-icon-${relationship.countryCode.toLowerCase()} me-1" title="${relationship.country}"></span>` : '';
    
    // Add dating potential indicator for friends
    const datingPotential = type === this.RELATIONSHIP_TYPES.FRIEND ? 
        `<div class="progress mt-1" style="height: 3px;">
            <div class="progress-bar bg-danger" role="progressbar" 
                 style="width: ${30 + relationship.closeness}%" 
                 aria-valuenow="${30 + relationship.closeness}" 
                 aria-valuemin="0" aria-valuemax="100">
            </div>
        </div>` : '';
    
    return `
        <div class="relationship-card card mb-2" data-id="${relationship.id}" data-type="${type}" 
             style="cursor: pointer; transition: transform 0.2s;">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title mb-1">${relationship.name} ${countryFlag}</h5>
                    <small class="text-muted">${relationship.fullName || ''}</small>
                    <div class="d-flex align-items-center mt-2">
                        <div class="progress flex-grow-1 me-2" style="height: 10px;">
                            <div class="progress-bar ${closenessClass}" 
                                 role="progressbar" 
                                 style="width: ${relationship.closeness}%" 
                                 aria-valuenow="${relationship.closeness}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                            </div>
                        </div>
                        <small class="text-muted">${relationship.closeness}%</small>
                    </div>
                    ${datingPotential}
                </div>
                <div>
                    <span class="badge bg-secondary me-1">${relationship.age}yo</span>
                    <span class="badge bg-info">${relationship.gender}</span>
                </div>
            </div>
        </div>
    `;
}

    static getClosenessClass(closeness) {
        if (closeness >= 80) return 'bg-success';
        if (closeness >= 50) return 'bg-primary';
        if (closeness >= 30) return 'bg-warning';
        return 'bg-danger';
    }

    static getContainerForType(type) {
        switch (type) {
            case this.RELATIONSHIP_TYPES.FAMILY: return this.domElements.familyList;
            case this.RELATIONSHIP_TYPES.FRIEND: return this.domElements.friendsList;
            case this.RELATIONSHIP_TYPES.ROMANTIC: return this.domElements.romanticList;
            default: return null;
        }
    }

    // Relationship Details
    static showRelationshipDetails(id, type) {
        const relationships = this.getRelationships();
        const relationship = relationships[type].find(rel => rel.id === id);
        if (!relationship) return;
        
        this.currentRelationship = { id, type };
        
        const typeIcons = {
            family: 'bi-people-fill',
            friend: 'bi-person-arms-up',
            romantic: 'bi-heart-fill'
        };
        this.domElements.modalTitle.innerHTML = `
            <i class="bi ${typeIcons[type] || 'bi-person'} me-2"></i>
            ${relationship.name} <small class="text-muted">${relationship.fullName || ''}</small>
        `;
        
        let relationshipSpecificContent = '';
        let traitsContent = '';
        let jobContent = '';
        let basicInfoContent = '';

        const countryFlag = relationship.countryCode ? 
            `<span class="flag-icon flag-icon-${relationship.countryCode.toLowerCase()} me-1" title="${relationship.country}"></span>` : '';
        
        basicInfoContent = `
            <h5><i class="bi bi-person me-2"></i>Basic Info</h5>
            <p><strong>Name:</strong> ${relationship.fullName || relationship.name}</p>
            <p><strong>Age:</strong> ${relationship.age || 'Unknown'}</p>
            <p><strong>Gender:</strong> ${relationship.gender || 'Unknown'}</p>
            <p><strong>Country:</strong> ${countryFlag} ${relationship.country || 'Unknown'}</p>
            <p><strong>Relationship:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
            ${type !== this.RELATIONSHIP_TYPES.FAMILY ? `
            <p><strong>Shared Interests:</strong> ${this.getSharedInterests(relationship).join(', ') || 'None yet'}</p>
            <p><strong>Compatibility:</strong> ${this.getCompatibilityScore(relationship)}%</p>
            ` : ''}
            <div class="mt-3">
                <h5><i class="bi bi-heart me-2"></i>Closeness</h5>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${this.getClosenessClass(relationship.closeness)}" 
                         role="progressbar" 
                         style="width: ${relationship.closeness}%" 
                         aria-valuenow="${relationship.closeness}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        ${relationship.closeness}%
                    </div>
                </div>
            </div>
        `;

        if (relationship.traits?.length) {
            traitsContent = `
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header bg-secondary text-white">
                            <i class="bi bi-stars me-2"></i> Personality Traits
                        </div>
                        <div class="card-body">
                            <div class="d-flex flex-wrap gap-2">
                                ${relationship.traits.map(trait => `
                                    <span class="badge bg-primary">
                                        <i class="bi bi-check-circle me-1"></i>${trait}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (relationship.job) {
            jobContent = `
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header bg-secondary text-white">
                            <i class="bi bi-briefcase me-2"></i> Career
                        </div>
                        <div class="card-body">
                            <h5><i class="bi bi-building me-2"></i>Profession</h5>
                            <p>${relationship.job.title}</p>
                            <h5 class="mt-3"><i class="bi bi-cash-coin me-2"></i>Salary</h5>
                            <p>${this.formatSalary(relationship.job.salary, relationship.job.currency)}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        

        switch (type) {
            case this.RELATIONSHIP_TYPES.FAMILY:
                const character = JSON.parse(localStorage.getItem('lifeSimCharacter')) || {};
                const ageDifference = relationship.age - (character.age || 20);
                const ageRelation = ageDifference > 25 ? 'much older' : 
                                   ageDifference > 10 ? 'older' : 
                                   ageDifference < -10 ? 'younger' : 
                                   'around the same age as you';
                
                relationshipSpecificContent = `
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="card border-primary">
                                <div class="card-header bg-primary text-white">
                                    <i class="bi bi-info-circle me-2"></i> Family Information
                                </div>
                                <div class="card-body">
                                    <h5><i class="bi bi-tree me-2"></i>Family Background</h5>
                                    <p>${this.generateFamilyBackground(relationship)}</p>
                                    <h5 class="mt-3"><i class="bi bi-people me-2"></i>Family Role</h5>
                                    <p>${relationship.name} is ${ageRelation} (${relationship.age} years old).</p>
                                    ${relationship.description ? `<p>${relationship.description}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case this.RELATIONSHIP_TYPES.FRIEND:
                relationshipSpecificContent = `
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        ${relationship.description || `You met ${relationship.name.split(' ')[0]} in ${relationship.country || 'an unknown location'}`}
                    </div>
                `;
                break;
                
            case this.RELATIONSHIP_TYPES.ROMANTIC:
                relationshipSpecificContent = `
                    <div class="alert alert-danger bg-opacity-10">
                        <i class="bi bi-heart me-2"></i>
                        ${relationship.description || `You're in a relationship with ${relationship.name.split(' ')[0]} from ${relationship.country || 'an unknown location'}`}
                    </div>
                    <div class="card mt-3 border-danger">
                        <div class="card-header bg-danger text-white">
                            <i class="bi bi-heart-pulse me-2"></i> Relationship Status
                        </div>
                        <div class="card-body">
                            <p>You've been dating ${relationship.name.split(' ')[0]} for ${Math.floor(Math.random() * 12) + 1} months.</p>
                            <p>Your closeness level is ${relationship.closeness}%.</p>
                        </div>
                    </div>
                `;
                break;
        }

        this.domElements.modalBody.innerHTML = `
            ${relationshipSpecificContent}
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header bg-secondary text-white">
                            <i class="bi bi-person-lines-fill me-2"></i> Basic Information
                        </div>
                        <div class="card-body">
                            ${basicInfoContent}
                        </div>
                    </div>
                </div>
                ${jobContent || '<div class="col-md-6"></div>'}
            </div>
            ${traitsContent ? `<div class="row">${traitsContent}</div>` : ''}
        `;

        const interactBtn = this.domElements.interactBtn;
        interactBtn.classList.remove('btn-primary', 'btn-success', 'btn-danger');
        interactBtn.style.display = 'block';
        
        switch (type) {
            case this.RELATIONSHIP_TYPES.FAMILY:
                interactBtn.innerHTML = '<i class="bi bi-house-heart me-2"></i> Family Time';
                interactBtn.classList.add('btn-primary');
                break;
            case this.RELATIONSHIP_TYPES.FRIEND:
                interactBtn.innerHTML = '<i class="bi bi-cup-hot me-2"></i> Hang Out';
                interactBtn.classList.add('btn-success');
                break;
            case this.RELATIONSHIP_TYPES.ROMANTIC:
                interactBtn.innerHTML = '<i class="bi bi-balloon-heart me-2"></i> Go on Date';
                interactBtn.classList.add('btn-danger');
                break;
        }

        if (type === this.RELATIONSHIP_TYPES.ROMANTIC) {
        const breakupBtn = document.createElement('button');
        breakupBtn.className = 'btn btn-outline-danger mt-3 w-100';
        breakupBtn.innerHTML = '<i class="bi bi-heartbreak me-2"></i> Break Up';
        breakupBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.domElements.relationshipModal.hide();
            setTimeout(() => {
                if (confirm(`Are you sure you want to break up with ${relationship.name}?`)) {
                    this.breakUp();
                }
            }, 300);
        });
        this.domElements.modalBody.querySelector('.card-body').appendChild(breakupBtn);
    }
          // Add this after the interactBtn setup
    if (type === this.RELATIONSHIP_TYPES.FRIEND) {
        const askDateBtn = document.createElement('button');
        askDateBtn.className = 'btn btn-danger mt-2 w-100';
        askDateBtn.innerHTML = '<i class="bi bi-heart me-2"></i> Ask on Date';
        askDateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.askFriendOnDate(id);
        });
        this.domElements.modalBody.querySelector('.card-body').appendChild(askDateBtn);
        
        // Add success chance indicator
        const friend = relationships[type].find(rel => rel.id === id);
        const successChance = 30 + friend.closeness;
        const chanceElement = document.createElement('div');
        chanceElement.className = 'mt-2 small text-muted';
        chanceElement.innerHTML = `<i class="bi bi-info-circle me-1"></i> Date acceptance chance: ${successChance}%`;
        this.domElements.modalBody.querySelector('.card-body').appendChild(chanceElement);
    }
    
        
        this.domElements.relationshipModal.show();
    }

    static breakUp() {
    const relationships = this.getRelationships();
    
    if (relationships.romantic.length === 0) {
        this.domElements.modalTitle.textContent = 'No Relationship';
        this.domElements.modalBody.innerHTML = `
            <div class="alert alert-warning">
                You're not currently in a romantic relationship.
            </div>
        `;
        this.domElements.relationshipModal.show();
        return false;
    }

    const partner = relationships.romantic[0];
    const breakupSeverity = this.calculateBreakupSeverity(partner.closeness);
    
    // Remove from romantic relationships
    relationships.romantic = [];
    
    // Chance to become friend based on closeness
    if (Math.random() * 100 < partner.closeness / 2) {
        const newFriend = {
            ...partner,
            id: `friend-${Math.random().toString(36).substring(2, 9)}`,
            closeness: Math.max(20, partner.closeness - 30)
        };
        relationships.friend.push(newFriend);
    }
    
    this.saveRelationships(relationships);
    this.renderAllRelationships();
    
    // Show breakup message based on severity
    this.showBreakupMessage(partner, breakupSeverity);
    
    // Add cooldown period
    this.setBreakupCooldown();
    
    return true;
}

static calculateBreakupSeverity(closeness) {
    if (closeness >= 80) return 'devastating';
    if (closeness >= 50) return 'painful';
    if (closeness >= 30) return 'awkward';
    return 'relieving';
}

static showBreakupMessage(partner, severity) {
    const messages = {
        devastating: [
            `Breaking up with ${partner.name} has left you heartbroken.`,
            `You can't believe it's over with ${partner.name}. The pain is unbearable.`,
            `Life without ${partner.name} feels empty. You're not sure how you'll move on.`
        ],
        painful: [
            `Breaking up with ${partner.name} hurts more than you expected.`,
            `You thought ending things with ${partner.name} was the right choice, but now you're not so sure.`,
            `The breakup with ${partner.name} is still fresh and painful.`
        ],
        awkward: [
            `Breaking up with ${partner.name} was awkward but necessary.`,
            `You and ${partner.name} weren't right for each other, but the breakup was still uncomfortable.`,
            `The relationship with ${partner.name} had run its course. Time to move on.`
        ],
        relieving: [
            `Breaking up with ${partner.name} feels like a weight off your shoulders.`,
            `You should have ended things with ${partner.name} sooner. You feel much better now.`,
            `That relationship with ${partner.name} wasn't working. You're glad it's over.`
        ]
    };

    const randomMessage = messages[severity][Math.floor(Math.random() * messages[severity].length)];
    const stayFriends = partner.closeness >= 50 && Math.random() * 100 < partner.closeness / 2;

    this.domElements.modalTitle.textContent = 'Breakup';
    this.domElements.modalBody.innerHTML = `
        <div class="alert alert-${severity === 'relieving' ? 'success' : 'danger'}">
            <i class="bi bi-heartbreak"></i>
            <h4>${randomMessage}</h4>
            ${stayFriends ? 
                `<p class="mt-2">At least you managed to stay friends.</p>` : 
                `<p class="mt-2">You're no longer in contact.</p>`}
            <p class="mt-2 small text-muted">It will take time before you're ready to date again.</p>
        </div>
    `;
    this.domElements.relationshipModal.show();
}

static setBreakupCooldown() {
    const cooldown = {
        date: new Date().getTime(),
        duration: 30 // days
    };
    localStorage.setItem('breakupCooldown', JSON.stringify(cooldown));
}

static canDateAgain() {
    const cooldown = JSON.parse(localStorage.getItem('breakupCooldown'));
    if (!cooldown) return true;
    
    const now = new Date().getTime();
    const elapsedDays = (now - cooldown.date) / (1000 * 60 * 60 * 24);
    return elapsedDays >= cooldown.duration;
}
    

    static formatSalary(amount, currency) {
        const formatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 0
        });
        return formatter.format(amount);
    }

    static generateFamilyBackground(relationship) {
        const role = relationship.name.toLowerCase();
        const firstName = relationship.fullName?.split(' ')[0] || 'your ' + role;
        const country = relationship.country || 'an unknown country';
        const traits = relationship.traits?.join(', ') || 'many wonderful qualities';
        const age = relationship.age || 'unknown age';
        
        let jobInfo = '';
        if (relationship.job) {
            const salaryFormatted = this.formatSalary(relationship.job.salary, relationship.job.currency);
            const yearsExperience = Math.max(5, relationship.age - 22);
            
            jobInfo = `, who works as ${relationship.job.title.match(/^[aeiou]/i) ? 'an' : 'a'} ${relationship.job.title} ` +
                     `earning ${salaryFormatted} annually with ${yearsExperience} years of experience`;
        }

        const personality = [];
        if (relationship.traits) {
            if (relationship.traits.includes('Kind')) personality.push('compassionate nature');
            if (relationship.traits.includes('Funny')) personality.push('great sense of humor');
            if (relationship.traits.includes('Smart')) personality.push('sharp intellect');
            if (relationship.traits.includes('Patient')) personality.push('endless patience');
        }
        const personalityDesc = personality.length > 0 ? 
            ` You've always admired ${personality.join(' and ')}` : 
            '';

        const backgrounds = {
            mother: [
                `Your mother ${relationship.fullName} was born in ${country}${jobInfo}. She raised you with ${traits}.${personalityDesc}`,
                `Originally from ${country}, your mother ${firstName}${jobInfo} worked tirelessly to provide for the family. Her ${relationship.traits?.[0] || 'strength'} shaped your childhood.`,
                `${firstName}, your ${age}-year-old mother from ${country}${jobInfo}, has been your guiding light. Her ${traits} helped you through life's challenges.`,
                `Your mother ${firstName} came from humble beginnings in ${country}${jobInfo}. Despite hardships, her ${traits} created a loving home.`
            ],
            father: [
                `Your father ${relationship.fullName} hails from ${country}${jobInfo}. His ${traits} taught you valuable life lessons.${personalityDesc}`,
                `Born in ${country}, your father ${firstName}${jobInfo} built the family's foundation through hard work. You inherited his ${relationship.traits?.[0] || 'work ethic'}.`,
                `${firstName}, your ${age}-year-old father from ${country}${jobInfo}, showed you the meaning of ${traits.replace(',', ' and')} through his actions.`,
                `Your father ${firstName} carried ${country}'s traditions${jobInfo}. His ${traits} became the pillars of your family.`
            ],
            sister: [
                `Your sister ${relationship.fullName}, born in ${country}${jobInfo}, shares your childhood memories. Her ${traits} made growing up together special.${personalityDesc}`,
                `From ${country} like you, your sister ${firstName}${jobInfo} has been your lifelong companion. You bonded over ${relationship.traits?.slice(0, 2).join(' and ') || 'shared experiences'}.`,
                `Your sister ${firstName}, now ${age} and ${jobInfo ? jobInfo.replace('who works as', 'working as') + ' in ' + country : 'living in ' + country}, remains your closest confidant.`,
                `Though you fought as kids, your sister ${firstName} from ${country}${jobInfo} became your best friend, thanks to her ${traits}.`
            ],
            brother: [
                `Your brother ${relationship.fullName}, raised in ${country}${jobInfo}, stood by you through thick and thin. His ${traits} made him your role model.${personalityDesc}`,
                `Growing up in ${country}, your brother ${firstName}${jobInfo} taught you ${relationship.traits?.[0] ? 'how to be ' + relationship.traits[0].toLowerCase() : 'many life skills'}.`,
                `Your brother ${firstName}, now ${age} and ${jobInfo ? jobInfo.replace('who works as', 'working as') + ' in ' + country : 'living in ' + country}, remains your protector.`,
                `From childhood adventures in ${country} to adulthood, your brother ${firstName}${jobInfo} shared his ${traits} with you.`
            ]
        };

        const defaultBackground = `Your ${role} ${firstName} from ${country}${jobInfo} has influenced your life through their ${traits}.${personalityDesc}`;

        return backgrounds[role]?.[Math.floor(Math.random() * backgrounds[role].length)] || defaultBackground;
    }

    // Time Processing
    static processMonth() {
        const relationships = this.getRelationships();
        let changed = false;
        
        for (const type in relationships) {
            for (const rel of relationships[type]) {
                const change = Math.floor(Math.random() * 11) - 5;
                const newCloseness = Math.max(0, Math.min(100, rel.closeness + change));
                
                if (newCloseness !== rel.closeness) {
                    rel.closeness = newCloseness;
                    changed = true;
                }
            }
        }
        
        if (changed) {
            this.saveRelationships(relationships);
            if (window.location.pathname.endsWith('relationships.html')) {
                this.renderAllRelationships();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    RelationshipManager.init();
});

// Add to MainManager if it exists
if (typeof MainManager !== 'undefined') {
    const originalHandleAdvanceTime = MainManager.handleAdvanceTime;
    MainManager.handleAdvanceTime = function() {
        originalHandleAdvanceTime.apply(this, arguments);
        RelationshipManager.processMonth();
    };
}