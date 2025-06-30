// real-estate.js - Real Estate Management System
class RealEstateManager {
    // Property data
     static PROPERTY_DATA = {
        residential: [
            // Ultra Cheap Options
            {
                id: 'tiny-house',
                name: 'Tiny House',
                price: 50000,
                description: 'A minimalist 200 sq ft tiny home with basic amenities. Great for those who want to live simply.',
                type: 'residential',
                image: '🏠',
                bedrooms: 1,
                bathrooms: 1,
                size: '200 sq ft',
                location: 'Rural Area',
                maintenance: 100,
                income: 0,
                appreciationRate: 0.02
            },
            {
                id: 'studio-apartment',
                name: 'Studio Apartment',
                price: 75000,
                description: 'A small studio in an older building. Basic but affordable city living.',
                type: 'residential',
                image: '🏢',
                bedrooms: 0,
                bathrooms: 1,
                size: '400 sq ft',
                location: 'Urban Fringe',
                maintenance: 300,
                income: 500,
                appreciationRate: 0.025
            },
            {
                id: 'mobile-home',
                name: 'Mobile Home',
                price: 40000,
                description: 'A manufactured home in a mobile home park. Low cost housing option.',
                type: 'residential',
                image: '🚚',
                bedrooms: 2,
                bathrooms: 1,
                size: '800 sq ft',
                location: 'Suburban Area',
                maintenance: 200,
                income: 0,
                appreciationRate: 0.01
            },

            // Budget Options
            {
                id: 'small-apartment',
                name: 'Small Apartment',
                price: 150000,
                description: 'A modest 1-bedroom apartment in the city center. Perfect for starting out.',
                type: 'residential',
                image: '🏢',
                bedrooms: 1,
                bathrooms: 1,
                size: '60 sqm',
                location: 'Downtown',
                maintenance: 500,
                income: 800,
                appreciationRate: 0.03
            },
            {
                id: 'fixer-upper',
                name: 'Fixer-Upper House',
                price: 90000,
                description: 'A house in need of repairs. Great potential if you can put in the work.',
                type: 'residential',
                image: '🏚️',
                bedrooms: 3,
                bathrooms: 1,
                size: '1200 sq ft',
                location: 'Transitional Neighborhood',
                maintenance: 600,
                income: 0,
                appreciationRate: 0.05
            },
            {
                id: 'duplex-unit',
                name: 'Duplex Unit',
                price: 180000,
                description: 'One side of a duplex. Live in one unit, rent out the other.',
                type: 'residential',
                image: '🏘️',
                bedrooms: 2,
                bathrooms: 2,
                size: '900 sq ft',
                location: 'Suburban Area',
                maintenance: 700,
                income: 1200,
                appreciationRate: 0.035
            },

            // Mid-Range Options
            {
                id: 'suburban-house',
                name: 'Suburban House',
                price: 300000,
                description: 'A comfortable 3-bedroom house in a quiet neighborhood. Good for families.',
                type: 'residential',
                image: '🏠',
                bedrooms: 3,
                bathrooms: 2,
                size: '120 sqm',
                location: 'Suburbs',
                maintenance: 800,
                income: 0,
                appreciationRate: 0.04
            },
            {
                id: 'townhouse',
                name: 'Townhouse',
                price: 275000,
                description: 'A modern townhouse with shared walls but private entrance.',
                type: 'residential',
                image: '🏘️',
                bedrooms: 3,
                bathrooms: 2.5,
                size: '1600 sq ft',
                location: 'Urban Area',
                maintenance: 650,
                income: 0,
                appreciationRate: 0.038
            },
            {
                id: 'condo',
                name: 'Luxury Condo',
                price: 450000,
                description: 'A high-end condo with amenities like pool and gym.',
                type: 'residential',
                image: '🏢',
                bedrooms: 2,
                bathrooms: 2,
                size: '1300 sq ft',
                location: 'City Center',
                maintenance: 900,
                income: 0,
                appreciationRate: 0.042
            },

            // High-End Options
            {
                id: 'country-villa',
                name: 'Country Villa',
                price: 750000,
                description: 'A spacious villa in the countryside with a large garden. Peaceful living.',
                type: 'residential',
                image: '🏡',
                bedrooms: 4,
                bathrooms: 3,
                size: '300 sqm',
                location: 'Countryside',
                maintenance: 1200,
                income: 0,
                appreciationRate: 0.035
            },
            {
                id: 'waterfront-home',
                name: 'Waterfront Home',
                price: 950000,
                description: 'Beautiful home with direct water access. Great views and privacy.',
                type: 'residential',
                image: '🌊',
                bedrooms: 4,
                bathrooms: 3.5,
                size: '2800 sq ft',
                location: 'Lakefront',
                maintenance: 1500,
                income: 0,
                appreciationRate: 0.045
            },
            {
                id: 'luxury-penthouse',
                name: 'Luxury Penthouse',
                price: 1200000,
                description: 'A high-end penthouse with panoramic views. The ultimate city living experience.',
                type: 'residential',
                image: '🏙️',
                bedrooms: 3,
                bathrooms: 3,
                size: '200 sqm',
                location: 'Uptown',
                maintenance: 2500,
                income: 3000,
                appreciationRate: 0.05
            },

            // Ultra Luxury Options
            {
                id: 'mansion',
                name: 'Luxury Mansion',
                price: 3500000,
                description: 'An expansive mansion with all the amenities - pool, theater, wine cellar and more.',
                type: 'residential',
                image: '🏰',
                bedrooms: 6,
                bathrooms: 5.5,
                size: '8000 sq ft',
                location: 'Exclusive Neighborhood',
                maintenance: 8000,
                income: 0,
                appreciationRate: 0.055
            },
            {
                id: 'private-island',
                name: 'Private Island',
                price: 15000000,
                description: 'Your own private island with multiple residences. The ultimate in privacy and luxury.',
                type: 'residential',
                image: '🏝️',
                bedrooms: 8,
                bathrooms: 7,
                size: '50 acres',
                location: 'Caribbean',
                maintenance: 25000,
                income: 0,
                appreciationRate: 0.065
            },
            {
                id: 'mega-mansion',
                name: 'Mega Mansion',
                price: 25000000,
                description: 'A palatial estate with every imaginable luxury. For the ultra-wealthy.',
                type: 'residential',
                image: '🏯',
                bedrooms: 12,
                bathrooms: 14,
                size: '35000 sq ft',
                location: 'Beverly Hills',
                maintenance: 50000,
                income: 0,
                appreciationRate: 0.06
            }
        ],
        commercial: [
            // Small Commercial
            {
                id: 'small-retail',
                name: 'Small Retail Space',
                price: 150000,
                description: 'A small storefront in a strip mall. Good for small businesses.',
                type: 'commercial',
                image: '🛒',
                size: '800 sq ft',
                location: 'Neighborhood Center',
                maintenance: 800,
                income: 2000,
                appreciationRate: 0.035
            },
            {
                id: 'office-suite',
                name: 'Office Suite',
                price: 225000,
                description: 'A professional office space in a commercial building.',
                type: 'commercial',
                image: '🏢',
                size: '1200 sq ft',
                location: 'Business Park',
                maintenance: 1000,
                income: 2500,
                appreciationRate: 0.038
            },
            {
                id: 'laundromat',
                name: 'Laundromat',
                price: 275000,
                description: 'An established laundromat with steady cash flow.',
                type: 'commercial',
                image: '👕',
                size: '1500 sq ft',
                location: 'Urban Area',
                maintenance: 1200,
                income: 4500,
                appreciationRate: 0.032
            },

            // Medium Commercial
            {
                id: 'retail-shop',
                name: 'Retail Shop',
                price: 350000,
                description: 'A ground-floor retail space in a busy shopping district.',
                type: 'commercial',
                image: '🛍️',
                size: '80 sqm',
                location: 'Shopping District',
                maintenance: 1200,
                income: 2800,
                appreciationRate: 0.04
            },
            {
                id: 'small-hotel',
                name: 'Boutique Hotel',
                price: 1200000,
                description: 'A 12-room boutique hotel in a trendy neighborhood.',
                type: 'commercial',
                image: '🏨',
                size: '8000 sq ft',
                location: 'Tourist Area',
                maintenance: 5000,
                income: 15000,
                appreciationRate: 0.045
            },
            {
                id: 'gas-station',
                name: 'Gas Station',
                price: 950000,
                description: 'A profitable gas station with convenience store.',
                type: 'commercial',
                image: '⛽',
                size: '1 acre',
                location: 'Highway',
                maintenance: 3500,
                income: 12000,
                appreciationRate: 0.042
            },

            // Large Commercial
            {
                id: 'commercial-space',
                name: 'Commercial Space',
                price: 500000,
                description: 'A commercial property that can be rented to businesses for steady income.',
                type: 'commercial',
                image: '🏬',
                size: '150 sqm',
                location: 'Business District',
                maintenance: 1500,
                income: 3500,
                appreciationRate: 0.045
            },
            {
                id: 'office-building',
                name: 'Office Building',
                price: 2000000,
                description: 'A multi-tenant office building with stable long-term leases.',
                type: 'commercial',
                image: '🏢',
                size: '500 sqm',
                location: 'Financial District',
                maintenance: 5000,
                income: 15000,
                appreciationRate: 0.05
            },
            {
                id: 'shopping-center',
                name: 'Shopping Center',
                price: 5000000,
                description: 'A small shopping center with multiple retail tenants.',
                type: 'commercial',
                image: '🛒',
                size: '50000 sq ft',
                location: 'Suburban Area',
                maintenance: 12000,
                income: 40000,
                appreciationRate: 0.048
            },

            // Mega Commercial
            {
                id: 'high-rise-office',
                name: 'High-Rise Office',
                price: 25000000,
                description: 'A downtown high-rise office tower with premium tenants.',
                type: 'commercial',
                image: '🏙️',
                size: '500000 sq ft',
                location: 'CBD',
                maintenance: 100000,
                income: 300000,
                appreciationRate: 0.055
            },
            {
                id: 'regional-mall',
                name: 'Regional Mall',
                price: 75000000,
                description: 'A large regional shopping mall with national retailers.',
                type: 'commercial',
                image: '🏬',
                size: '1.2M sq ft',
                location: 'Suburban Hub',
                maintenance: 250000,
                income: 800000,
                appreciationRate: 0.052
            },
            {
                id: 'industrial-park',
                name: 'Industrial Park',
                price: 100000000,
                description: 'A fully occupied industrial park with long-term leases.',
                type: 'commercial',
                image: '🏭',
                size: '50 acres',
                location: 'Industrial Zone',
                maintenance: 300000,
                income: 1200000,
                appreciationRate: 0.05
            }
        ],
        vacation: [
            // Budget Vacation
            {
                id: 'cabin',
                name: 'Mountain Cabin',
                price: 195000,
                description: 'A rustic cabin in the woods. Great for weekend getaways.',
                type: 'vacation',
                image: '🌲',
                bedrooms: 2,
                bathrooms: 1,
                size: '800 sq ft',
                location: 'Wooded Area',
                maintenance: 400,
                income: 800,
                appreciationRate: 0.04
            },
            {
                id: 'lake-cottage',
                name: 'Lake Cottage',
                price: 275000,
                description: 'A charming cottage near a small lake. Peaceful retreat.',
                type: 'vacation',
                image: '⛵',
                bedrooms: 3,
                bathrooms: 2,
                size: '1200 sq ft',
                location: 'Lakeside',
                maintenance: 600,
                income: 1500,
                appreciationRate: 0.042
            },
            {
                id: 'desert-bungalow',
                name: 'Desert Bungalow',
                price: 225000,
                description: 'A unique property in the desert with stunning views.',
                type: 'vacation',
                image: '🏜️',
                bedrooms: 2,
                bathrooms: 1,
                size: '900 sq ft',
                location: 'Desert',
                maintenance: 500,
                income: 1200,
                appreciationRate: 0.038
            },

            // Mid-Range Vacation
            {
                id: 'mountain-cabin',
                name: 'Mountain Cabin',
                price: 450000,
                description: 'A cozy cabin in the mountains, perfect for weekend getaways.',
                type: 'vacation',
                image: '⛰️',
                bedrooms: 2,
                bathrooms: 1,
                size: '100 sqm',
                location: 'Mountains',
                maintenance: 800,
                income: 2000,
                appreciationRate: 0.055
            },
            {
                id: 'beach-house',
                name: 'Beach House',
                price: 850000,
                description: 'A beautiful beachfront property that can be rented when not in use.',
                type: 'vacation',
                image: '🏖️',
                bedrooms: 3,
                bathrooms: 2,
                size: '180 sqm',
                location: 'Coast',
                maintenance: 1500,
                income: 4000,
                appreciationRate: 0.06
            },
            {
                id: 'vineyard-cottage',
                name: 'Vineyard Cottage',
                price: 650000,
                description: 'A charming cottage on a working vineyard. Wine included!',
                type: 'vacation',
                image: '🍇',
                bedrooms: 3,
                bathrooms: 2,
                size: '1600 sq ft',
                location: 'Wine Country',
                maintenance: 1200,
                income: 3000,
                appreciationRate: 0.05
            },

            // Luxury Vacation
            {
                id: 'ski-chalet',
                name: 'Ski Chalet',
                price: 1500000,
                description: 'Luxury ski-in/ski-out property at a premier resort.',
                type: 'vacation',
                image: '⛷️',
                bedrooms: 5,
                bathrooms: 4.5,
                size: '4000 sq ft',
                location: 'Ski Resort',
                maintenance: 3000,
                income: 10000,
                appreciationRate: 0.065
            },
            {
                id: 'tropical-villa',
                name: 'Tropical Villa',
                price: 2500000,
                description: 'Stunning villa with private beach access in the tropics.',
                type: 'vacation',
                image: '🌴',
                bedrooms: 6,
                bathrooms: 5,
                size: '5000 sq ft',
                location: 'Tropical Island',
                maintenance: 5000,
                income: 15000,
                appreciationRate: 0.07
            },
            {
                id: 'castle',
                name: 'European Castle',
                price: 10000000,
                description: 'A historic castle with modern amenities. The ultimate vacation home.',
                type: 'vacation',
                image: '🏰',
                bedrooms: 12,
                bathrooms: 10,
                size: '30000 sq ft',
                location: 'Europe',
                maintenance: 20000,
                income: 0,
                appreciationRate: 0.075
            }
        ],
        land: [
            // Small Land
            {
                id: 'vacant-lot',
                name: 'Vacant Lot',
                price: 25000,
                description: 'A small empty lot in a developing area. Potential for future building.',
                type: 'land',
                image: '🏗️',
                size: '0.25 acre',
                location: 'Suburban Area',
                maintenance: 50,
                income: 0,
                appreciationRate: 0.05
            },
            {
                id: 'wooded-lot',
                name: 'Wooded Lot',
                price: 40000,
                description: 'A forested parcel perfect for a secluded cabin.',
                type: 'land',
                image: '🌲',
                size: '5 acres',
                location: 'Rural Area',
                maintenance: 100,
                income: 0,
                appreciationRate: 0.04
            },
            {
                id: 'residential-lot',
                name: 'Residential Lot',
                price: 100000,
                description: 'A vacant lot in a developing residential area with good potential.',
                type: 'land',
                image: '🌳',
                size: '500 sqm',
                location: 'Suburban Area',
                maintenance: 100,
                income: 0,
                appreciationRate: 0.07
            },

            // Medium Land
            {
                id: 'farmland',
                name: 'Farmland',
                price: 300000,
                description: 'Agricultural land that can be leased to farmers or held for appreciation.',
                type: 'land',
                image: '🌾',
                size: '5 acres',
                location: 'Rural Area',
                maintenance: 200,
                income: 1500,
                appreciationRate: 0.04
            },
            {
                id: 'commercial-lot',
                name: 'Commercial Lot',
                price: 250000,
                description: 'Prime commercial land in a growing business district.',
                type: 'land',
                image: '🏗️',
                size: '1000 sqm',
                location: 'Developing Area',
                maintenance: 150,
                income: 0,
                appreciationRate: 0.08
            },
            {
                id: 'waterfront-lot',
                name: 'Waterfront Lot',
                price: 500000,
                description: 'Premium land with direct water access. Limited availability.',
                type: 'land',
                image: '🌊',
                size: '1 acre',
                location: 'Lakefront',
                maintenance: 300,
                income: 0,
                appreciationRate: 0.09
            },

            // Large Land
            {
                id: 'ranch',
                name: 'Cattle Ranch',
                price: 1500000,
                description: 'A working cattle ranch with income potential.',
                type: 'land',
                image: '🐄',
                size: '500 acres',
                location: 'Rural Area',
                maintenance: 2000,
                income: 5000,
                appreciationRate: 0.06
            },
            {
                id: 'vineyard',
                name: 'Vineyard',
                price: 3000000,
                description: 'Established vineyard with winemaking facilities.',
                type: 'land',
                image: '🍷',
                size: '50 acres',
                location: 'Wine Country',
                maintenance: 5000,
                income: 15000,
                appreciationRate: 0.065
            },
            {
                id: 'timberland',
                name: 'Timberland',
                price: 2500000,
                description: 'Forested land with sustainable timber harvesting potential.',
                type: 'land',
                image: '🌲',
                size: '1000 acres',
                location: 'Pacific Northwest',
                maintenance: 3000,
                income: 8000,
                appreciationRate: 0.055
            },

            // Mega Land
            {
                id: 'island',
                name: 'Private Island',
                price: 5000000,
                description: 'Small private island with development potential.',
                type: 'land',
                image: '🏝️',
                size: '10 acres',
                location: 'Great Lakes',
                maintenance: 5000,
                income: 0,
                appreciationRate: 0.1
            },
            {
                id: 'mega-ranch',
                name: 'Mega Ranch',
                price: 15000000,
                description: 'Massive ranch property with diverse income streams.',
                type: 'land',
                image: '🐎',
                size: '25000 acres',
                location: 'Western US',
                maintenance: 15000,
                income: 50000,
                appreciationRate: 0.07
            },
            {
                id: 'resort-land',
                name: 'Resort Development Land',
                price: 25000000,
                description: 'Prime land for resort development with ocean views.',
                type: 'land',
                image: '🏖️',
                size: '200 acres',
                location: 'Coastal Area',
                maintenance: 20000,
                income: 0,
                appreciationRate: 0.12
            }
        ]
    };

    // DOM Elements
    static domElements = {
        propertiesContainer: null,
        ownedPropertiesList: null,
        totalPropertiesValue: null,
        monthlyRentalIncome: null,
        monthlyExpenses: null,
        netMonthlyIncome: null,
        propertyModal: null,
        propertyModalTitle: null,
        propertyModalBody: null,
        buyPropertyBtn: null,
        sellPropertyBtn: null,
        typeLinks: null,
        propertySearch: null
    };

    // Current selected property
    static currentProperty = null;

    // Initialization
    static init() {
        this.cacheDOMElements();
        this.setupEventListeners();
        this.loadProperties();
        this.loadOwnedProperties();
    }

    static cacheDOMElements() {
        this.domElements = {
            propertiesContainer: document.getElementById('propertiesContainer'),
            ownedPropertiesList: document.getElementById('ownedPropertiesList'),
            totalPropertiesValue: document.getElementById('totalPropertiesValue'),
            monthlyRentalIncome: document.getElementById('monthlyRentalIncome'),
            monthlyExpenses: document.getElementById('monthlyExpenses'),
            netMonthlyIncome: document.getElementById('netMonthlyIncome'),
            propertyModal: document.getElementById('propertyModal') ? new bootstrap.Modal(document.getElementById('propertyModal')) : null,
            propertyModalTitle: document.getElementById('propertyModalTitle'),
            propertyModalBody: document.getElementById('propertyModalBody'),
            buyPropertyBtn: document.getElementById('buyPropertyBtn'),
            sellPropertyBtn: document.getElementById('sellPropertyBtn'),
            typeLinks: document.querySelectorAll('[data-type]'),
            propertySearch: document.getElementById('propertySearch')
        };
    }

    static setupEventListeners() {
        // Type filter links
        this.domElements.typeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const type = e.currentTarget.dataset.type;
                this.filterPropertiesByType(type);
                
                // Update active state
                this.domElements.typeLinks.forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Search functionality
        if (this.domElements.propertySearch) {
            this.domElements.propertySearch.addEventListener('input', (e) => {
                this.searchProperties(e.target.value);
            });
        }

        // Buy property button
        if (this.domElements.buyPropertyBtn) {
            this.domElements.buyPropertyBtn.addEventListener('click', () => {
                this.buyCurrentProperty();
            });
        }

        // Sell property button
        if (this.domElements.sellPropertyBtn) {
            this.domElements.sellPropertyBtn.addEventListener('click', () => {
                this.sellCurrentProperty();
            });
        }
    }

    // Property Loading and Display
    static loadProperties(type = 'all') {
        if (!this.domElements.propertiesContainer) return;
        
        this.domElements.propertiesContainer.innerHTML = '';
        
        let propertiesToDisplay = [];
        
        if (type === 'all') {
            for (const propType in this.PROPERTY_DATA) {
                propertiesToDisplay = propertiesToDisplay.concat(this.PROPERTY_DATA[propType]);
            }
        } else {
            propertiesToDisplay = this.PROPERTY_DATA[type] || [];
        }
        
        if (propertiesToDisplay.length === 0) {
            this.domElements.propertiesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search" style="font-size: 3rem;"></i>
                    <h4 class="mt-3">No properties found</h4>
                    <p class="text-muted">Try a different type or search term</p>
                </div>
            `;
            return;
        }
        
        this.domElements.propertiesContainer.innerHTML = propertiesToDisplay.map(property => `
            <div class="col">
                <div class="card h-100 property-card" data-id="${property.id}" data-type="${property.type}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="property-icon me-3" style="font-size: 2.5rem;">${property.image}</div>
                            <div class="flex-grow-1">
                                <h5 class="card-title">${property.name}</h5>
                                <p class="card-text text-muted mb-1">
                                    <i class="bi bi-geo-alt"></i> ${property.location}
                                </p>
                                <p class="card-text text-muted mb-1">
                                    <i class="bi bi-arrows-angle-expand"></i> ${property.size}
                                </p>
                                ${property.bedrooms ? `
                                    <p class="card-text text-muted mb-1">
                                        <i class="bi bi-door-open"></i> ${property.bedrooms} bed, ${property.bathrooms} bath
                                    </p>
                                ` : ''}
                                <p class="card-text text-success fw-bold mt-2">
                                    ${this.formatCurrency(property.price)}
                                </p>
                                ${property.income > 0 ? `
                                    <p class="card-text text-info mb-0">
                                        <i class="bi bi-cash-coin"></i> ${this.formatCurrency(property.income)}/mo
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary w-100 mt-3 view-details-btn">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to property cards
        document.querySelectorAll('.property-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('view-details-btn')) {
                    return;
                }
                
                const id = card.dataset.id;
                const type = card.dataset.type;
                this.showPropertyDetails(id, type);
            });
        });
    }

    static filterPropertiesByType(type) {
        this.loadProperties(type);
    }

    static searchProperties(query) {
        if (!this.domElements.propertiesContainer) return;
        
        query = query.toLowerCase();
        
        let results = [];
        for (const type in this.PROPERTY_DATA) {
            results = results.concat(
                this.PROPERTY_DATA[type].filter(property => 
                    property.name.toLowerCase().includes(query) || 
                    property.description.toLowerCase().includes(query) ||
                    property.location.toLowerCase().includes(query)
                )
            );
        }
        
        if (results.length === 0) {
            this.domElements.propertiesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search" style="font-size: 3rem;"></i>
                    <h4 class="mt-3">No properties found</h4>
                    <p class="text-muted">Try a different search term</p>
                </div>
            `;
            return;
        }
        
        this.domElements.propertiesContainer.innerHTML = results.map(property => `
            <div class="col">
                <div class="card h-100 property-card" data-id="${property.id}" data-type="${property.type}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="property-icon me-3" style="font-size: 2.5rem;">${property.image}</div>
                            <div class="flex-grow-1">
                                <h5 class="card-title">${property.name}</h5>
                                <p class="card-text text-muted mb-1">
                                    <i class="bi bi-geo-alt"></i> ${property.location}
                                </p>
                                <p class="card-text text-muted mb-1">
                                    <i class="bi bi-arrows-angle-expand"></i> ${property.size}
                                </p>
                                ${property.bedrooms ? `
                                    <p class="card-text text-muted mb-1">
                                        <i class="bi bi-door-open"></i> ${property.bedrooms} bed, ${property.bathrooms} bath
                                    </p>
                                ` : ''}
                                <p class="card-text text-success fw-bold mt-2">
                                    ${this.formatCurrency(property.price)}
                                </p>
                                ${property.income > 0 ? `
                                    <p class="card-text text-info mb-0">
                                        <i class="bi bi-cash-coin"></i> ${this.formatCurrency(property.income)}/mo
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary w-100 mt-3 view-details-btn">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Reattach event listeners
        document.querySelectorAll('.property-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('view-details-btn')) {
                    return;
                }
                
                const id = card.dataset.id;
                const type = card.dataset.type;
                this.showPropertyDetails(id, type);
            });
        });
    }

    // Property Details and Purchase
    static showPropertyDetails(id, type) {
        if (!this.domElements.propertyModal || !this.domElements.propertyModalTitle || !this.domElements.propertyModalBody) {
            return;
        }
        
        const property = this.PROPERTY_DATA[type].find(p => p.id === id);
        if (!property) return;
        
        this.currentProperty = property;
        
        // Set modal title
        this.domElements.propertyModalTitle.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="me-2" style="font-size: 1.5rem;">${property.image}</span>
                <span>${property.name}</span>
            </div>
        `;
        
        // Generate details content
        let detailsContent = `
            <div class="row">
                <div class="col-md-6">
                    <div class="property-icon text-center mb-3" style="font-size: 5rem;">${property.image}</div>
                    <h4 class="text-success text-center">${this.formatCurrency(property.price)}</h4>
                    <div class="text-center mt-2">
                        <span class="badge bg-${this.getPropertyTypeBadgeColor(property.type)}">
                            ${property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                        </span>
                    </div>
                </div>
                <div class="col-md-6">
                    <p>${property.description}</p>
                    <div class="card mt-3">
                        <div class="card-header">
                            <h5 class="mb-0">Details</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6">
                                    <p><strong>Location:</strong> ${property.location}</p>
                                    <p><strong>Size:</strong> ${property.size}</p>
                                </div>
                                <div class="col-6">
                                    ${property.bedrooms ? `
                                        <p><strong>Bedrooms:</strong> ${property.bedrooms}</p>
                                        <p><strong>Bathrooms:</strong> ${property.bathrooms}</p>
                                    ` : ''}
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-6">
                                    <p><strong>Monthly Maintenance:</strong> ${this.formatCurrency(property.maintenance)}</p>
                                </div>
                                <div class="col-6">
                                    <p><strong>Rental Income:</strong> ${this.formatCurrency(property.income)}</p>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-12">
                                    <p><strong>Projected Appreciation:</strong> ${(property.appreciationRate * 100).toFixed(1)}% annually</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.domElements.propertyModalBody.innerHTML = detailsContent;
        
        // Check if player already owns this property
        const ownedProperties = this.getOwnedProperties();
        const ownedProperty = ownedProperties.find(p => p.id === property.id);
        
        if (this.domElements.buyPropertyBtn && this.domElements.sellPropertyBtn) {
            if (ownedProperty) {
                this.domElements.buyPropertyBtn.classList.add('d-none');
                this.domElements.sellPropertyBtn.classList.remove('d-none');
                this.domElements.sellPropertyBtn.textContent = `Sell for ${this.formatCurrency(ownedProperty.currentValue)}`;
            } else {
                this.domElements.buyPropertyBtn.classList.remove('d-none');
                this.domElements.sellPropertyBtn.classList.add('d-none');
                this.domElements.buyPropertyBtn.textContent = 'Buy Property';
            }
        }
        
        this.domElements.propertyModal.show();
    }

 static buyCurrentProperty() {
    if (!this.currentProperty || !this.domElements.buyPropertyBtn) return;
    
    // Check if player can afford the property using FinancesManager
    const totalBalance = FinancesManager.calculateTotalBalance();
    
    if (totalBalance < this.currentProperty.price) {
        const shortfall = this.currentProperty.price - totalBalance;
        const message = `You need ${this.formatCurrency(shortfall)} more to buy this property`;
        
        // Show notification
        if (typeof EventManager !== 'undefined') {
            EventManager.addToEventLog(message, 'danger');
        } else {
            // Fallback alert if EventManager isn't available
            alert(message);
        }
        
        if (this.domElements.propertyModal) {
            // Keep modal open to let player see the message
            return;
        }
        return;
    }
    
    // Deduct money using FinancesManager
    const success = FinancesManager.makePurchase(
        this.currentProperty.price, 
        `Purchased ${this.currentProperty.name}`
    );
    
    if (!success) {
        const message = `Failed to purchase ${this.currentProperty.name}`;
        if (typeof EventManager !== 'undefined') {
            EventManager.addToEventLog(message, 'danger');
        } else {
            alert(message);
        }
        return;
    }
    
    // Add to owned properties
    const ownedProperties = this.getOwnedProperties();
    ownedProperties.push({
        ...this.currentProperty,
        purchaseDate: new Date().toISOString(),
        purchasePrice: this.currentProperty.price,
        currentValue: this.currentProperty.price
    });
    localStorage.setItem('ownedProperties', JSON.stringify(ownedProperties));
    
    // Show success notification
    const successMessage = `Successfully purchased ${this.currentProperty.name} for ${this.formatCurrency(this.currentProperty.price)}`;
    if (typeof EventManager !== 'undefined') {
        EventManager.addToEventLog(successMessage, 'success');
    } else {
        alert(successMessage);
    }
    
    // Update UI
    this.loadOwnedProperties();
    if (this.domElements.propertyModal) {
        this.domElements.propertyModal.hide();
    }
    
    // Update financial displays
    if (typeof FinancesManager !== 'undefined') {
        FinancesManager.renderAll();
    }
    
    // Update money display if on the page
    const moneyDisplay = document.getElementById('moneyDisplay');
    if (moneyDisplay && typeof FinancesManager !== 'undefined') {
        moneyDisplay.textContent = this.formatCurrency(FinancesManager.calculateTotalBalance());
    }
}

static sellCurrentProperty() {
    if (!this.currentProperty || !this.domElements.sellPropertyBtn) return;
    
    const ownedProperties = this.getOwnedProperties();
    const propertyIndex = ownedProperties.findIndex(p => p.id === this.currentProperty.id);
    
    if (propertyIndex === -1) return;
    
    const property = ownedProperties[propertyIndex];
    
    // Add money from sale using FinancesManager
    FinancesManager.addMoney(
        property.currentValue, 
        `Sale of ${property.name}`, 
        'property_sale'
    );
    
    // Remove from owned properties
    ownedProperties.splice(propertyIndex, 1);
    localStorage.setItem('ownedProperties', JSON.stringify(ownedProperties));
    
    // Update UI
    this.loadOwnedProperties();
    if (this.domElements.propertyModal) {
        this.domElements.propertyModal.hide();
    }
    
    // Log event
    if (typeof EventManager !== 'undefined') {
        EventManager.addToEventLog(
            `Sold ${property.name} for ${this.formatCurrency(property.currentValue)}`, 
            'success'
        );
    }
    
    // Update financial displays
    if (typeof FinancesManager !== 'undefined') {
        FinancesManager.renderAll();
    }
}

    // Owned Properties Management
    static getOwnedProperties() {
        return JSON.parse(localStorage.getItem('ownedProperties')) || [];
    }

    static loadOwnedProperties() {
        if (!this.domElements.ownedPropertiesList || 
            !this.domElements.totalPropertiesValue || 
            !this.domElements.monthlyRentalIncome || 
            !this.domElements.monthlyExpenses || 
            !this.domElements.netMonthlyIncome) {
            return;
        }
        
        const ownedProperties = this.getOwnedProperties();
        
        if (ownedProperties.length === 0) {
            this.domElements.ownedPropertiesList.innerHTML = `
                <p class="text-muted">You don't own any properties yet.</p>
            `;
            this.domElements.totalPropertiesValue.textContent = this.formatCurrency(0);
            this.domElements.monthlyRentalIncome.textContent = this.formatCurrency(0);
            this.domElements.monthlyExpenses.textContent = this.formatCurrency(0);
            this.domElements.netMonthlyIncome.textContent = this.formatCurrency(0);
            return;
        }
        
        this.domElements.ownedPropertiesList.innerHTML = ownedProperties.map(property => `
            <div class="d-flex justify-content-between align-items-center mb-2 property-item" data-id="${property.id}">
                <div>
                    <span class="me-2">${property.image}</span>
                    <span>${property.name}</span>
                </div>
                <div class="text-end">
                    <div class="text-success">${this.formatCurrency(property.currentValue)}</div>
                    <small class="text-muted">Purchased for ${this.formatCurrency(property.purchasePrice)}</small>
                </div>
            </div>
        `).join('');
        
        // Calculate totals
        const totalValue = ownedProperties.reduce((sum, property) => sum + property.currentValue, 0);
        const totalIncome = ownedProperties.reduce((sum, property) => sum + property.income, 0);
        const totalExpenses = ownedProperties.reduce((sum, property) => sum + property.maintenance, 0);
        const netIncome = totalIncome - totalExpenses;
        
        this.domElements.totalPropertiesValue.textContent = this.formatCurrency(totalValue);
        this.domElements.monthlyRentalIncome.textContent = this.formatCurrency(totalIncome);
        this.domElements.monthlyExpenses.textContent = this.formatCurrency(totalExpenses);
        this.domElements.netMonthlyIncome.textContent = this.formatCurrency(netIncome);
        
        // Color net income based on value
        if (netIncome > 0) {
            this.domElements.netMonthlyIncome.classList.add('text-success');
            this.domElements.netMonthlyIncome.classList.remove('text-danger');
        } else if (netIncome < 0) {
            this.domElements.netMonthlyIncome.classList.add('text-danger');
            this.domElements.netMonthlyIncome.classList.remove('text-success');
        } else {
            this.domElements.netMonthlyIncome.classList.remove('text-success', 'text-danger');
        }
        
        // Add click events to owned properties
        document.querySelectorAll('.property-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = item.dataset.id;
                const ownedProperties = this.getOwnedProperties();
                const property = ownedProperties.find(p => p.id === id);
                
                if (property) {
                    this.currentProperty = property;
                    this.showPropertyDetails(property.id, property.type);
                }
            });
        });
    }

    // Time Processing (for property appreciation)
static processMonth() {
    const ownedProperties = this.getOwnedProperties();
    if (ownedProperties.length === 0) return;
    
    let updated = false;
    const updatedProperties = ownedProperties.map(property => {
        // Calculate monthly appreciation (1/12 of annual rate)
        const monthlyAppreciation = property.appreciationRate / 12;
        const appreciationAmount = Math.round(property.currentValue * monthlyAppreciation);
        const newValue = property.currentValue + appreciationAmount;
        
        updated = true;
        return {
            ...property,
            currentValue: newValue
        };
    });
    
    if (updated) {
        localStorage.setItem('ownedProperties', JSON.stringify(updatedProperties));
        if (window.location.pathname.endsWith('real-estate.html')) {
            this.loadOwnedProperties();
        }
        
        // Add monthly rental income to finances
        const totalIncome = updatedProperties.reduce((sum, property) => sum + property.income, 0);
        const totalExpenses = updatedProperties.reduce((sum, property) => sum + property.maintenance, 0);
        const netIncome = totalIncome - totalExpenses;
        
        if (netIncome !== 0) {
            if (typeof FinancesManager !== 'undefined') {
                // Add rental income transaction
                const checkingAccounts = FinancesManager.gameState.accounts.filter(acc => acc.type === 'checking');
                const accountId = checkingAccounts.length > 0 ? checkingAccounts[0].id : null;
                
                if (netIncome > 0) {
                    FinancesManager.addTransaction(
                        'income',
                        'Rental income from properties',
                        netIncome,
                        'rental_income',
                        accountId
                    );
                } else {
                    FinancesManager.addTransaction(
                        'expense',
                        'Property maintenance costs',
                        Math.abs(netIncome),
                        'property_maintenance',
                        accountId
                    );
                }
                
                if (typeof EventManager !== 'undefined') {
                    const eventType = netIncome > 0 ? 'success' : 'danger';
                    const verb = netIncome > 0 ? 'Received' : 'Paid';
                    EventManager.addToEventLog(
                        `${verb} ${this.formatCurrency(Math.abs(netIncome))} from properties this month`,
                        eventType
                    );
                }
            }
        }
    }
}

    // Helper Methods
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static getPropertyTypeBadgeColor(type) {
        switch (type) {
            case 'residential': return 'primary';
            case 'commercial': return 'info';
            case 'vacation': return 'warning';
            case 'land': return 'success';
            default: return 'secondary';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    RealEstateManager.init();
});

// Add to MainManager if it exists
if (typeof MainManager !== 'undefined') {
    const originalHandleAdvanceTime = MainManager.handleAdvanceTime;
    MainManager.handleAdvanceTime = function() {
        originalHandleAdvanceTime.apply(this, arguments);
        RealEstateManager.processMonth();
    };
}