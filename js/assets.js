// assets.js - Assets Management System
class AssetsManager {
    static gameState = null;
    static initialized = false;
    static elements = {};
    static eventListeners = [];
    static debug = true;
    
    // Vehicle categories with realistic pricing
    static vehicleCategories = {
        cars: {
            name: "Cars",
            icon: "bi-car-front",
            assets: [
                {
                    id: "sedan",
                    name: "Compact Sedan",
                    description: "Reliable daily commuter with good fuel economy",
                    price: 25000,
                    image: "https://via.placeholder.com/300x200?text=Compact+Sedan",
                    maintenance: 100,
                    depreciation: 0.15
                },
                {
                    id: "suv",
                    name: "Mid-size SUV",
                    description: "Versatile family vehicle with ample space",
                    price: 40000,
                    image: "https://via.placeholder.com/300x200?text=Mid-size+SUV",
                    maintenance: 150,
                    depreciation: 0.12
                },
                {
                    id: "luxury",
                    name: "Luxury Sedan",
                    description: "Premium comfort and performance",
                    price: 80000,
                    image: "https://via.placeholder.com/300x200?text=Luxury+Sedan",
                    maintenance: 300,
                    depreciation: 0.20
                },
                {
                    id: "sports",
                    name: "Sports Car",
                    description: "High-performance driving experience",
                    price: 120000,
                    image: "https://via.placeholder.com/300x200?text=Sports+Car",
                    maintenance: 500,
                    depreciation: 0.25
                }
            ]
        },
        boats: {
            name: "Boats",
            icon: "bi-water",
            assets: [
                {
                    id: "fishing",
                    name: "Fishing Boat",
                    description: "Reliable boat for fishing and recreation",
                    price: 35000,
                    image: "https://via.placeholder.com/300x200?text=Fishing+Boat",
                    maintenance: 200,
                    depreciation: 0.18
                },
                {
                    id: "speedboat",
                    name: "Speed Boat",
                    description: "Fast and fun for water sports",
                    price: 75000,
                    image: "https://via.placeholder.com/300x200?text=Speed+Boat",
                    maintenance: 400,
                    depreciation: 0.22
                },
                {
                    id: "yacht",
                    name: "Luxury Yacht",
                    description: "Premium yacht for entertaining",
                    price: 500000,
                    image: "https://via.placeholder.com/300x200?text=Luxury+Yacht",
                    maintenance: 5000,
                    depreciation: 0.15
                }
            ]
        },
        planes: {
            name: "Aircraft",
            icon: "bi-airplane",
            assets: [
                {
                    id: "cessna",
                    name: "Cessna 172",
                    description: "Reliable single-engine aircraft",
                    price: 300000,
                    image: "https://via.placeholder.com/300x200?text=Cessna+172",
                    maintenance: 2000,
                    depreciation: 0.10
                },
                {
                    id: "helicopter",
                    name: "Helicopter",
                    description: "Versatile personal helicopter",
                    price: 1200000,
                    image: "https://via.placeholder.com/300x200?text=Helicopter",
                    maintenance: 10000,
                    depreciation: 0.12
                },
                {
                    id: "jet",
                    name: "Private Jet",
                    description: "Luxury private jet for business travel",
                    price: 8000000,
                    image: "https://via.placeholder.com/300x200?text=Private+Jet",
                    maintenance: 50000,
                    depreciation: 0.08
                }
            ]
        },
        motorcycles: {
            name: "Motorcycles",
            icon: "bi-bicycle",
            assets: [
                {
                    id: "cruiser",
                    name: "Cruiser Motorcycle",
                    description: "Classic style for comfortable riding",
                    price: 15000,
                    image: "https://via.placeholder.com/300x200?text=Cruiser+Motorcycle",
                    maintenance: 80,
                    depreciation: 0.20
                },
                {
                    id: "sportbike",
                    name: "Sport Bike",
                    description: "High-performance motorcycle",
                    price: 25000,
                    image: "https://via.placeholder.com/300x200?text=Sport+Bike",
                    maintenance: 120,
                    depreciation: 0.25
                },
                {
                    id: "touring",
                    name: "Touring Motorcycle",
                    description: "Comfortable for long-distance travel",
                    price: 30000,
                    image: "https://via.placeholder.com/300x200?text=Touring+Motorcycle",
                    maintenance: 150,
                    depreciation: 0.18
                }
            ]
        }
    };

    

    /**
     * Initializes the AssetsManager system
     */
 static init() {
    try {
        if (this.initialized) return;
        
        this.log('Initializing AssetsManager...');
        
        this.cacheElements();
        this.setupEventListeners();
        this.renderAll();
        
        // Add time listener
        document.addEventListener('timeAdvanced', (e) => {
            this.handleTimeAdvanced(e.detail);
        });
        
        this.initialized = true;
        this.log('AssetsManager initialized successfully');
    } catch (error) {
        console.error('AssetsManager initialization failed:', error);
        throw error;
    }
}
    
    static cleanup() {
        this.log('Cleaning up AssetsManager...');
        this.removeEventListeners();
        this.elements = {};
        this.initialized = false;
    }

    static handleTimeAdvanced(timeState) {
    // Process monthly depreciation
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
        this.renderAllRelationships();
    }
}
    
    // ===================================================================
    // UI MANAGEMENT
    // ===================================================================
    
    static cacheElements() {
        const getElement = (id) => document.getElementById(id) || null;
        
        this.elements = {
            currentAssetsContainer: getElement('currentAssets'),
            vehiclesList: getElement('vehiclesList'),
            electronicsList: getElement('electronicsList'),
            furnitureList: getElement('furnitureList'),
            collectiblesList: getElement('collectiblesList'),
            purchaseModal: new bootstrap.Modal(getElement('purchaseModal')),
            purchaseModalTitle: getElement('purchaseModalTitle'),
            purchaseModalImage: getElement('purchaseModalImage'),
            purchaseModalName: getElement('purchaseModalName'),
            purchaseModalDescription: getElement('purchaseModalDescription'),
            purchaseModalPrice: getElement('purchaseModalPrice'),
            purchaseModalCategory: getElement('purchaseModalCategory'),
            quantityInput: getElement('quantityInput'),
            confirmPurchaseBtn: getElement('confirmPurchaseBtn')
        };
        
        if (this.debug) {
            for (const [key, value] of Object.entries(this.elements)) {
                if (!value) this.log(`Element not found: ${key}`);
            }
        }
    }
    
    static setupEventListeners() {
        const confirmPurchaseListener = () => this.confirmPurchase();
        
        if (this.elements.confirmPurchaseBtn) {
            this.elements.confirmPurchaseBtn.addEventListener('click', confirmPurchaseListener);
            this.eventListeners.push({
                element: this.elements.confirmPurchaseBtn,
                type: 'click',
                listener: confirmPurchaseListener
            });
        }
    }
    
    static removeEventListeners() {
        this.eventListeners.forEach(({ element, type, listener }) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];
    }
    
    // ===================================================================
    // ASSET MANAGEMENT
    // ===================================================================
    
    static showPurchaseModal(asset, category) {
        if (!this.elements.purchaseModal) return;
        
        this.elements.purchaseModalTitle.textContent = `Purchase ${asset.name}`;
        this.elements.purchaseModalImage.src = asset.image;
        this.elements.purchaseModalImage.alt = asset.name;
        this.elements.purchaseModalName.textContent = asset.name;
        this.elements.purchaseModalDescription.textContent = asset.description;
        this.elements.purchaseModalPrice.textContent = `$${asset.price.toLocaleString()}`;
        this.elements.purchaseModalCategory.textContent = category.name;
        this.elements.quantityInput.value = 1;
        
        // Store current asset data for purchase confirmation
        this.currentPurchase = {
            asset,
            category: category.id
        };
        
        this.elements.purchaseModal.show();
    }
    
    static confirmPurchase() {
        if (!this.currentPurchase) return;
        
        const quantity = parseInt(this.elements.quantityInput.value) || 1;
        const totalPrice = this.currentPurchase.asset.price * quantity;
        
        // Check if player has enough money
        if (typeof FinancesManager !== 'undefined' && FinancesManager.getFinancialState) {
            const finances = FinancesManager.getFinancialState();
            
            if (finances.totalBalance < totalPrice) {
                alert(`You don't have enough money for this purchase. You need $${totalPrice.toLocaleString()} but only have $${finances.totalBalance.toLocaleString()}.`);
                return;
            }
            
            // Make the purchase through FinancesManager
            if (FinancesManager.purchaseAsset(
                this.currentPurchase.asset.name,
                totalPrice,
                this.currentPurchase.category,
                this.currentPurchase.asset.maintenance
            )) {
                // Add the asset to the player's inventory
                const newAsset = {
                    id: 'asset-' + Date.now(),
                    name: this.currentPurchase.asset.name,
                    category: this.currentPurchase.category,
                    purchasePrice: totalPrice,
                    currentValue: totalPrice * (1 - this.currentPurchase.asset.depreciation),
                    purchaseDate: new Date().toLocaleDateString(),
                    maintenanceCost: this.currentPurchase.asset.maintenance * quantity,
                    quantity: quantity,
                    image: this.currentPurchase.asset.image,
                    description: this.currentPurchase.asset.description
                };
                
                // Close the modal
                this.elements.purchaseModal.hide();
                
                // Re-render assets
                this.renderAll();
            }
        } else {
            alert('Financial system not available. Cannot complete purchase.');
        }
    }
    
    // ===================================================================
    // RENDERING
    // ===================================================================
    
    static renderAll() {
        this.renderCurrentAssets();
        this.renderVehicleCategories();
    }
    
    static renderCurrentAssets() {
        if (!this.elements.currentAssetsContainer) return;
        
        if (typeof FinancesManager !== 'undefined' && FinancesManager.getFinancialState) {
            const finances = FinancesManager.getFinancialState();
            
            if (finances.assets.length === 0) {
                this.elements.currentAssetsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info">
                            You don't own any assets yet. Browse the categories below to make your first purchase!
                        </div>
                    </div>
                `;
                return;
            }
            
            this.elements.currentAssetsContainer.innerHTML = finances.assets
                .filter(asset => ['cars', 'boats', 'planes', 'motorcycles'].includes(asset.category))
                .map(asset => this.renderAssetCard(asset))
                .join('');
        } else {
            this.elements.currentAssetsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        Financial data not available. Please try again later.
                    </div>
                </div>
            `;
        }
    }
    
    static renderAssetCard(asset) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <img src="${asset.image || 'https://via.placeholder.com/300x200?text=No+Image'}" class="card-img-top" alt="${asset.name}">
                    <div class="card-body">
                        <h5 class="card-title">${asset.name}</h5>
                        <p class="card-text text-muted">${asset.description || 'No description available'}</p>
                        <ul class="list-group list-group-flush mb-3">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Purchase Price:</span>
                                <span>$${asset.purchasePrice.toLocaleString()}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Current Value:</span>
                                <span>$${asset.currentValue.toLocaleString()}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Monthly Cost:</span>
                                <span>$${asset.maintenanceCost.toLocaleString()}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="card-footer bg-transparent">
                        <small class="text-muted">Purchased on ${asset.purchaseDate}</small>
                    </div>
                </div>
            </div>
        `;
    }
    
   static renderVehicleCategories() {
    // Render cars
    if (this.elements.vehiclesList) {
        this.elements.vehiclesList.innerHTML = this.vehicleCategories.cars.assets
            .map(asset => this.renderVehicleItem(asset, this.vehicleCategories.cars))
            .join('');
    }
    
    // Render boats
    if (this.elements.electronicsList) { // This should probably be boatsList
        this.elements.electronicsList.innerHTML = this.vehicleCategories.boats.assets
            .map(asset => this.renderVehicleItem(asset, this.vehicleCategories.boats))
            .join('');
    }
    
    // Render planes
    if (this.elements.furnitureList) { // This should probably be planesList
        this.elements.furnitureList.innerHTML = this.vehicleCategories.planes.assets
            .map(asset => this.renderVehicleItem(asset, this.vehicleCategories.planes))
            .join('');
    }
    
    // Render motorcycles
    if (this.elements.collectiblesList) { // This should probably be motorcyclesList
        this.elements.collectiblesList.innerHTML = this.vehicleCategories.motorcycles.assets
            .map(asset => this.renderVehicleItem(asset, this.vehicleCategories.motorcycles))
            .join('');
    }
    
    // Add event listeners to purchase buttons
    document.querySelectorAll('.purchase-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const assetId = e.target.closest('.vehicle-card').dataset.assetId;
            const categoryId = e.target.closest('.vehicle-card').dataset.categoryId;
            
            const category = this.vehicleCategories[categoryId];
            const asset = category.assets.find(a => a.id === assetId);
            
            if (asset && category) {
                this.showPurchaseModal(asset, category);
            }
        });
    });
}
    
    static renderVehicleItem(asset, category) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card vehicle-card h-100" data-asset-id="${asset.id}" data-category-id="${category.id}">
                    <img src="${asset.image}" class="card-img-top" alt="${asset.name}">
                    <div class="card-body">
                        <h5 class="card-title">${asset.name}</h5>
                        <p class="card-text text-muted">${asset.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-success fw-bold">$${asset.price.toLocaleString()}</span>
                            <span class="badge bg-primary">${category.name}</span>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-primary w-100 purchase-btn">
                            <i class="bi bi-cart"></i> Purchase
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ===================================================================
    // UTILITY METHODS
    // ===================================================================
    
    static log(message) {
        if (this.debug) {
            console.log(`[AssetsManager] ${message}`);
        }
    }
}

// Initialize when DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        AssetsManager.init();
    });
}