// realEstate.js - Comprehensive Real Estate Management System
class RealEstateManager {
    constructor() {
        this.playerProperties = [];
        this.marketConditions = {
            residential: { trend: 'stable', change: 0 },
            commercial: { trend: 'stable', change: 0 },
            rental: { trend: 'stable', change: 0 }
        };
        this.marketHistory = [];
        this.events = [];
        this.selectedProperty = null;
        this.propertyImages = {
            residential: '🏠',
            commercial: '🏢',
            vacation: '🏖️',
            land: '🌄'
        };
    }

   init() {
    this.loadPlayerData();
    this.setupMarketConditions();
    this.setupEventListeners();
    this.setupTimeAdvancementListener(); // Add this line
    this.updateUI();
    this.setupMarketChart();
    return true;
}

setupTimeAdvancementListener() {
    document.addEventListener('timeAdvanced', (event) => {
        const { monthsAdvanced } = event.detail;
        this.advanceTime(monthsAdvanced);
    });
}

    // Data Management
    loadPlayerData() {
        const savedData = localStorage.getItem('realEstateData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.playerProperties = data.properties || [];
            this.marketConditions = data.marketConditions || this.marketConditions;
            this.marketHistory = data.marketHistory || [];
            this.events = data.events || [];
        }
    }

    savePlayerData() {
        const data = {
            properties: this.playerProperties,
            marketConditions: this.marketConditions,
            marketHistory: this.marketHistory,
            events: this.events
        };
        localStorage.setItem('realEstateData', JSON.stringify(data));
    }

    // Market System
    setupMarketConditions() {
        const trends = ['booming', 'growing', 'stable', 'declining', 'crashing'];
        
        for (const type in this.marketConditions) {
            const trend = trends[Math.floor(Math.random() * trends.length)];
            const change = this.getRandomChangeForTrend(trend);
            this.marketConditions[type] = { trend, change };
        }

        this.recordMarketState();
    }

    getRandomChangeForTrend(trend) {
        const ranges = {
            booming: { min: 5, max: 15 },
            growing: { min: 2, max: 7 },
            stable: { min: -1, max: 2 },
            declining: { min: -5, max: -1 },
            crashing: { min: -15, max: -5 }
        };
        const range = ranges[trend];
        return Math.random() * (range.max - range.min) + range.min;
    }

    recordMarketState() {
        this.marketHistory.push({
            timestamp: new Date().toISOString(),
            conditions: JSON.parse(JSON.stringify(this.marketConditions))
        });

        if (this.marketHistory.length > 12) {
            this.marketHistory.shift();
        }
    }

    // Property Management
    showPropertyMarket() {
        const affordableProperties = this.getAffordableProperties();
        
        if (affordableProperties.length === 0) {
            alert("No properties available within your budget.");
            return;
        }

        const randomProperty = affordableProperties[Math.floor(Math.random() * affordableProperties.length)];
        this.selectedProperty = randomProperty;
        this.displayPropertyModal(randomProperty);
    }

    getAffordableProperties() {
        const playerFunds = FinancesManager.getFinancialState().totalBalance;
        const maxPrice = playerFunds * 3;
        
        return PROPERTY_DATA.residential
            .concat(PROPERTY_DATA.commercial)
            .filter(property => property.price <= maxPrice);
    }

    displayPropertyModal(property) {
        document.getElementById('propertyModalTitle').textContent = `Purchase ${property.name}`;
        document.getElementById('propertyModalAddress').textContent = `${property.name} in ${property.neighborhood}`;
        document.getElementById('propertyModalDescription').textContent = property.description;
        document.getElementById('propertyModalType').textContent = property.type.charAt(0).toUpperCase() + property.type.slice(1);
        document.getElementById('propertyModalPrice').textContent = `$${property.price.toLocaleString()}`;
        document.getElementById('propertyModalSize').textContent = property.size;
        document.getElementById('propertyModalRooms').textContent = `${property.bedrooms || 0} bed, ${property.bathrooms || 0} bath`;
        document.getElementById('propertyModalYear').textContent = property.yearBuilt;
        document.getElementById('propertyModalImage').textContent = this.propertyImages[property.type] || '🏠';
        
        this.updateFinanceInfo('cash');
        
        const modal = new bootstrap.Modal(document.getElementById('propertyModal'));
        modal.show();
    }

    updateFinanceInfo(purchaseMethod) {
        if (!this.selectedProperty) return;
        
        const property = this.selectedProperty;
        let cost, message;
        
        switch (purchaseMethod) {
            case 'cash':
                cost = property.price;
                message = `This purchase will use $${cost.toLocaleString()} of your available funds.`;
                break;
            case 'mortgage':
                const downPayment = property.price * 0.2;
                const monthlyPayment = (property.price - downPayment) * 0.004;
                cost = downPayment;
                message = `$${downPayment.toLocaleString()} down payment (20%), monthly payments of $${monthlyPayment.toLocaleString()}.`;
                break;
            case 'investment':
                cost = property.price * 0.1;
                message = `$${cost.toLocaleString()} initial investment (10%), you'll own 50% equity.`;
                break;
        }
        
        document.getElementById('propertyModalFinanceInfo').textContent = message;
    }

   /**
 * Handles property purchase with full financial sync and validation
 * @returns {boolean} True if purchase succeeded, false if failed
 */
purchaseProperty() {
  // Validate selected property exists
  if (!this.selectedProperty) {
    console.error("No property selected for purchase");
    return false;
  }

  const property = JSON.parse(JSON.stringify(this.selectedProperty)); // Deep clone
  const purchasePrice = property.price;
  const playerCash = FinancesManager.getFinancialState().totalBalance;

  // ==== PHASE 1: FINANCIAL VALIDATION ====
  if (purchasePrice <= 0) {
    console.error("Invalid property price:", purchasePrice);
    return false;
  }

  if (playerCash < purchasePrice) {
    this._showPurchaseError(
      `Insufficient funds! Need $${purchasePrice.toLocaleString()} but only have $${playerCash.toLocaleString()}`
    );
    return false;
  }

  // ==== PHASE 2: FINANCIAL TRANSACTION ====
  try {
    // Attempt payment through FinancesManager
    if (!FinancesManager.purchaseAsset(
      property.name,
      purchasePrice,
      'real_estate',
      property.maintenance || 0
    )) {
      throw new Error("Payment processing failed");
    }

    // ==== PHASE 3: PROPERTY RECORD KEEPING ====
    const ownedProperty = {
      ...property,
      id: `prop-${Date.now()}`,
      purchaseDate: new Date().toISOString(),
      purchasePrice,
      currentValue: purchasePrice,
      equity: 1, // Fully owned
      condition: 'new',
      maintenanceLevel: 100,
      tenants: []
    };

    // Add to player's portfolio
    this.playerProperties.push(ownedProperty);
    
    // ==== PHASE 4: SYSTEM SYNC ====
    // Update local storage
    this.savePlayerData();
    
    // Notify other systems
    window.dispatchEvent(new CustomEvent('propertyPurchased', {
      detail: {
        property: ownedProperty,
        newBalance: playerCash - purchasePrice
      }
    }));

    // ==== PHASE 5: UI & FEEDBACK ====
    this._showPurchaseSuccess(
      `Successfully purchased ${property.name} for $${purchasePrice.toLocaleString()}!`
    );
    
    // Reset selection
    this.selectedProperty = null;
    return true;

  } catch (error) {
    console.error("Property purchase failed:", error);
    this._showPurchaseError(
      `Transaction failed: ${error.message || "Unknown error"}`
    );
    return false;
  }
}

// Helper methods
_showPurchaseError(message) {
  if (typeof EventManager !== 'undefined') {
    EventManager.addToEventLog(message, 'danger');
  }
  alert(message);
}

_showPurchaseSuccess(message) {
  if (typeof EventManager !== 'undefined') {
    EventManager.addToEventLog(message, 'success');
  }
  // You might use a toast notification here instead
  console.log(message);
}

    repairProperty() {
        if (!this.selectedProperty) {
            alert("Please select a property first.");
            return;
        }
        
        const property = this.selectedProperty;
        const repairCost = property.currentValue * 0.02;
        
        if (!FinancesManager.makePurchase(repairCost, `Repairs for ${property.name}`)) {
            alert(`You need $${repairCost.toLocaleString()} for repairs.`);
            return;
        }
        
        property.maintenanceLevel = Math.min(100, property.maintenanceLevel + 30);
        property.currentValue = property.price * (1 + (property.maintenanceLevel - 50) / 200);
        
        this.addEvent(`Performed $${repairCost.toLocaleString()} in repairs on ${property.name}`);
        this.updateUI();
        this.savePlayerData();
        alert(`Repairs completed! ${property.name} is in better condition.`);
    }

    showUpgradeOptions() {
        if (!this.selectedProperty) {
            alert("Please select a property first.");
            return;
        }
        
        const property = this.selectedProperty;
        if (!property.renovationOptions || property.renovationOptions.length === 0) {
            alert("No upgrade options available for this property.");
            return;
        }
        
        let optionsHTML = '<h5>Available Upgrades</h5><ul class="list-group mb-3">';
        property.renovationOptions.forEach(option => {
            const permitInfo = option.requiresPermit ? 
                ` (Permit required: $${PERMIT_REQUIREMENTS[property.location]?.renovation?.cost || 0})` : '';
            optionsHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${option.name}
                    <span>
                        Cost: $${option.cost.toLocaleString()}${permitInfo}
                        <button class="btn btn-sm btn-primary ms-2 upgrade-btn" data-upgrade="${option.name}">
                            Upgrade
                        </button>
                    </span>
                </li>
            `;
        });
        optionsHTML += '</ul>';
        
        document.getElementById('upgradeOptionsContainer').innerHTML = optionsHTML;
    }

    performUpgrade(upgradeName) {
        const property = this.selectedProperty;
        const upgrade = property.renovationOptions?.find(opt => opt.name === upgradeName);
        
        if (!upgrade) return;
        
        let totalCost = upgrade.cost;
        if (upgrade.requiresPermit) {
            totalCost += PERMIT_REQUIREMENTS[property.location]?.renovation?.cost || 0;
        }
        
        if (!FinancesManager.makePurchase(totalCost, `Upgrade: ${upgradeName} for ${property.name}`)) {
            alert(`You need $${totalCost.toLocaleString()} for this upgrade.`);
            return;
        }
        
        property.currentValue += upgrade.addsValue;
        property.maintenanceLevel = Math.min(100, property.maintenanceLevel + 10);
        property.renovationOptions = property.renovationOptions.filter(opt => opt.name !== upgradeName);
        
        this.addEvent(`Completed ${upgradeName} upgrade on ${property.name} for $${totalCost.toLocaleString()}`);
        this.updateUI();
        this.savePlayerData();
        alert(`Upgrade completed! ${property.name} has increased in value.`);
        this.showUpgradeOptions();
    }

    findTenants() {
        if (!this.selectedProperty) {
            alert("Please select a property first.");
            return;
        }
        
        const property = this.selectedProperty;
        if (property.tenants?.length > 0) {
            alert("This property already has tenants.");
            return;
        }
        
        const baseRent = property.currentValue * 0.004;
        const marketFactor = 1 + (this.marketConditions.rental.change / 100);
        const monthlyRent = baseRent * marketFactor;
        
        property.tenants = [{
            name: this.generateTenantName(),
            reliability: Math.floor(Math.random() * 5) + 1,
            leaseDuration: Math.floor(Math.random() * 12) + 6,
            monthlyRent: monthlyRent,
            paymentHistory: []
        }];
        
        this.addEvent(`Found tenant ${property.tenants[0].name} for ${property.name} at $${monthlyRent.toLocaleString()}/month`);
        this.updateUI();
        this.savePlayerData();
        alert(`New tenant found: ${property.tenants[0].name} at $${monthlyRent.toLocaleString()}/month`);
    }

    generateTenantName() {
        const firstNames = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }

    evictTenants() {
        if (!this.selectedProperty?.tenants?.length) {
            alert("No tenants to evict.");
            return;
        }
        
        const property = this.selectedProperty;
        const tenantName = property.tenants[0].name;
        
        this.addEvent(`Evicted tenant ${tenantName} from ${property.name}`);
        property.tenants = [];
        this.updateUI();
        this.savePlayerData();
        alert(`Tenant ${tenantName} has been evicted.`);
    }

    // Time Management
    advanceTime(months = 3) {
        for (let i = 0; i < months; i++) {
            this.processMonthlyPropertyEvents();
            if ((new Date().getMonth() + i) % 3 === 0) {
                this.processQuarterlyPropertyEvents();
            }
        }
        
        this.updateMarketConditions();
        this.savePlayerData();
        this.updateUI();
    }

    processMonthlyPropertyEvents() {
        this.playerProperties.forEach(property => {
            // Collect rent
            if (property.tenants?.length > 0) {
                property.tenants.forEach(tenant => {
                    if (Math.random() < tenant.reliability / 5) {
                        FinancesManager.addMoney(
                            tenant.monthlyRent,
                            `Rental income from ${property.name}`,
                            'rental_income'
                        );
                        tenant.paymentHistory.push({
                            date: new Date().toISOString(),
                            amount: tenant.monthlyRent,
                            status: 'paid'
                        });
                    } else {
                        tenant.paymentHistory.push({
                            date: new Date().toISOString(),
                            amount: tenant.monthlyRent,
                            status: 'missed'
                        });
                        this.addEvent(`${tenant.name} missed rent payment for ${property.name}`);
                    }
                    
                    tenant.leaseDuration -= 1;
                    if (tenant.leaseDuration <= 0 && Math.random() < 0.5) {
                        this.addEvent(`${tenant.name} moved out of ${property.name}`);
                        property.tenants = property.tenants.filter(t => t.name !== tenant.name);
                    }
                });
            }
            
            // Property depreciation
            if (property.maintenanceLevel < 70 && Math.random() < 0.3) {
                property.maintenanceLevel = Math.max(0, property.maintenanceLevel - 5);
            }
        });
    }

    processQuarterlyPropertyEvents() {
        this.playerProperties.forEach(property => {
            // Market appreciation/depreciation
            const marketChange = this.marketConditions[property.type]?.change / 100 || 0;
            property.currentValue *= (1 + marketChange);
            
            // Random events
            if (Math.random() < 0.1) {
                const event = this.generateRandomPropertyEvent(property);
                this.addEvent(event.description);
                
                if (event.valueChange) {
                    property.currentValue *= (1 + event.valueChange / 100);
                }
                
                if (event.maintenanceChange) {
                    property.maintenanceLevel = Math.max(0, 
                        Math.min(100, property.maintenanceLevel + event.maintenanceChange));
                }
            }
        });
    }

    updateMarketConditions() {
        const trends = ['booming', 'growing', 'stable', 'declining', 'crashing'];
        
        for (const type in this.marketConditions) {
            if (Math.random() < 0.2) {
                const currentTrend = this.marketConditions[type].trend;
                const currentIndex = trends.indexOf(currentTrend);
                const direction = Math.random() < 0.5 ? -1 : 1;
                this.marketConditions[type].trend = trends[
                    Math.max(0, Math.min(trends.length - 1, currentIndex + direction))
                ];
            }
            
            this.marketConditions[type].change = this.getRandomChangeForTrend(this.marketConditions[type].trend);
        }
        
        this.recordMarketState();
    }

    generateRandomPropertyEvent(property) {
        const events = [
            {
                description: `Neighborhood improvement in ${property.neighborhood} increased property values`,
                valueChange: 5
            },
            {
                description: `New development in ${property.neighborhood} increased demand`,
                valueChange: 3
            },
            {
                description: `Crime report in ${property.neighborhood} decreased property values`,
                valueChange: -4
            },
            {
                description: `Natural disaster caused damage to ${property.name}`,
                valueChange: -8,
                maintenanceChange: -20
            },
            {
                description: `${property.name} was featured in a magazine, increasing its value`,
                valueChange: 7
            },
            {
                description: `Zoning changes affected ${property.name}`,
                valueChange: Math.random() < 0.5 ? 6 : -6
            }
        ];
        
        return events[Math.floor(Math.random() * events.length)];
    }

    // UI Management
    updateUI() {
        // Update summary stats
        document.getElementById('propertiesCount').textContent = this.playerProperties.length;
        
        let totalEquity = 0;
        let totalRentalIncome = 0;
        let totalAppreciation = 0;
        
        this.playerProperties.forEach(property => {
            totalEquity += property.currentValue * (property.equity || 1);
            
            if (property.tenants?.length > 0) {
                totalRentalIncome += property.tenants.reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
            }
            
            const appreciation = (property.currentValue - property.price) / property.price * 100;
            totalAppreciation += appreciation;
        });
        
        document.getElementById('equityValue').textContent = `$${Math.round(totalEquity).toLocaleString()}`;
        document.getElementById('rentalIncome').textContent = `$${Math.round(totalRentalIncome).toLocaleString()}/month`;
        document.getElementById('appreciationValue').textContent = 
            `${Math.round(totalAppreciation / Math.max(1, this.playerProperties.length))}%`;
        
        // Update market trends
        this.updateMarketTrendUI('residential');
        this.updateMarketTrendUI('commercial');
        this.updateMarketTrendUI('rental');
        
        // Update owned properties list
        this.updateOwnedPropertiesList();
        
        // Update events list
        this.updateEventsList();
    }

    updateMarketTrendUI(type) {
        const trendElement = document.getElementById(`${type}Trend`);
        const changeElement = document.getElementById(`${type}Change`);
        const condition = this.marketConditions[type];
        
        trendElement.textContent = condition.trend;
        trendElement.className = `badge bg-${this.getTrendColor(condition.trend)}`;
        changeElement.textContent = `${condition.change > 0 ? '+' : ''}${condition.change.toFixed(1)}%`;
    }

    getTrendColor(trend) {
        switch (trend) {
            case 'booming': return 'success';
            case 'growing': return 'info';
            case 'stable': return 'primary';
            case 'declining': return 'warning';
            case 'crashing': return 'danger';
            default: return 'secondary';
        }
    }

    updateOwnedPropertiesList() {
        const container = document.getElementById('ownedProperties');
        
        if (this.playerProperties.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <div class="alert alert-info mb-0">
                        You don't own any properties yet.
                    </div>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.playerProperties.forEach((property, index) => {
            const hasTenants = property.tenants?.length > 0;
            
            html += `
                <div class="list-group-item list-group-item-action property-item" data-index="${index}">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${property.name}</h5>
                        <small>${property.type}</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-primary me-2">${property.neighborhood}</span>
                            <span class="badge bg-${hasTenants ? 'success' : 'secondary'} me-2">
                                ${hasTenants ? 'Rented' : 'Vacant'}
                            </span>
                            <span>Value: $${property.currentValue.toLocaleString()}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary select-property" data-index="${index}">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    updatePropertyManagementUI() {
        if (!this.selectedProperty) return;
        
        const property = this.selectedProperty;
        const maintenancePercent = property.maintenanceLevel;
        let maintenanceStatus, maintenanceClass;
        
        if (maintenancePercent >= 80) {
            maintenanceStatus = 'Excellent';
            maintenanceClass = 'bg-success';
        } else if (maintenancePercent >= 50) {
            maintenanceStatus = 'Good';
            maintenanceClass = 'bg-info';
        } else if (maintenancePercent >= 30) {
            maintenanceStatus = 'Fair';
            maintenanceClass = 'bg-warning';
        } else {
            maintenanceStatus = 'Poor';
            maintenanceClass = 'bg-danger';
        }
        
        document.getElementById('maintenanceStatus').style.width = `${maintenancePercent}%`;
        document.getElementById('maintenanceStatus').className = `progress-bar ${maintenanceClass}`;
        document.getElementById('maintenanceStatus').textContent = maintenanceStatus;
        
        const tenantContainer = document.getElementById('tenantStatus');
        if (property.tenants?.length > 0) {
            const tenant = property.tenants[0];
            tenantContainer.className = 'alert alert-success';
            tenantContainer.innerHTML = `
                <strong>${tenant.name}</strong><br>
                ${'★'.repeat(tenant.reliability)}${'☆'.repeat(5 - tenant.reliability)} Reliability<br>
                Lease: ${tenant.leaseDuration} months remaining<br>
                Rent: $${tenant.monthlyRent.toLocaleString()}/month
            `;
            document.getElementById('evictTenantsBtn').disabled = false;
        } else {
            tenantContainer.className = 'alert alert-info';
            tenantContainer.textContent = 'No tenants currently';
            document.getElementById('evictTenantsBtn').disabled = true;
        }
    }

    updateEventsList() {
        const container = document.getElementById('realEstateEvents');
        
        if (this.events.length === 0) {
            container.innerHTML = '<div class="list-group-item">No real estate events yet</div>';
            return;
        }
        
        let html = '';
        this.events.slice(0, 10).forEach(event => {
            html += `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <small>${event.description}</small>
                        <small class="text-muted">${new Date(event.timestamp).toLocaleString()}</small>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    setupMarketChart() {
        const ctx = document.getElementById('realEstateChart').getContext('2d');
        
        const labels = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
        const residentialData = Array.from({ length: 12 }, () => Math.random() * 10 - 5);
        const commercialData = Array.from({ length: 12 }, () => Math.random() * 10 - 5);
        const rentalData = Array.from({ length: 12 }, () => Math.random() * 10 - 5);
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Residential',
                        data: residentialData,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    },
                    {
                        label: 'Commercial',
                        data: commercialData,
                        borderColor: 'rgb(54, 162, 235)',
                        tension: 0.1
                    },
                    {
                        label: 'Rental',
                        data: rentalData,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw > 0 ? '+' : ''}${context.raw.toFixed(1)}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return `${value > 0 ? '+' : ''}${value}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.chart) return;
        
        this.chart.data.datasets[0].data = this.marketHistory.map(entry => entry.conditions.residential.change);
        this.chart.data.datasets[1].data = this.marketHistory.map(entry => entry.conditions.commercial.change);
        this.chart.data.datasets[2].data = this.marketHistory.map(entry => entry.conditions.rental.change);
        this.chart.update();
    }

    // Event Management
    addEvent(description) {
        this.events.unshift({
            timestamp: new Date().toISOString(),
            description
        });
        
        if (this.events.length > 20) {
            this.events.pop();
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Property actions
        document.getElementById('buyPropertyBtn').addEventListener('click', () => this.showPropertyMarket());
        document.getElementById('confirmPurchaseBtn').addEventListener('click', () => this.purchaseProperty());
        document.getElementById('repairPropertyBtn').addEventListener('click', () => this.repairProperty());
        document.getElementById('upgradePropertyBtn').addEventListener('click', () => this.showUpgradeOptions());
        document.getElementById('findTenantsBtn').addEventListener('click', () => this.findTenants());
        document.getElementById('evictTenantsBtn').addEventListener('click', () => this.evictTenants());
        
        // Property selection
        document.getElementById('ownedProperties').addEventListener('click', (e) => {
            if (e.target.closest('.select-property')) {
                const button = e.target.closest('.select-property');
                const index = parseInt(button.dataset.index);
                this.selectedProperty = this.playerProperties[index];
                this.updatePropertyManagementUI();
            }
        });
        
        // Upgrade buttons
        document.getElementById('upgradeOptionsContainer').addEventListener('click', (e) => {
            if (e.target.classList.contains('upgrade-btn')) {
                const upgradeName = e.target.dataset.upgrade;
                this.performUpgrade(upgradeName);
            }
        });
        
        // Purchase method change
        document.getElementById('propertyPurchaseMethod').addEventListener('change', (e) => {
            this.updateFinanceInfo(e.target.value);
        });
        
        // Advance time
        document.getElementById('advanceTimeBtn').addEventListener('click', () => {
    TimeManager.advanceTime(3);
});
    }
}

// Initialize when all dependencies are loaded
function initializeRealEstateManager() {
    const requiredDependencies = [
        { name: 'PROPERTY_DATA', obj: window.PROPERTY_DATA },
        { name: 'NEIGHBORHOODS', obj: window.NEIGHBORHOODS },
        { name: 'FinancesManager', obj: window.FinancesManager },
        { name: 'bootstrap', obj: window.bootstrap },
        { name: 'Chart', obj: window.Chart },
        { name: 'TimeManager', obj: window.TimeManager } // Add this line
    ];
    
    const missingDeps = requiredDependencies.filter(dep => !dep.obj);
    
    if (missingDeps.length > 0) {
        console.log('Waiting for dependencies:', missingDeps.map(d => d.name));
        setTimeout(initializeRealEstateManager, 100);
        return;
    }
    
    try {
        window.RealEstateManager = new RealEstateManager();
        window.RealEstateManager.init();
    } catch (error) {
        console.error('Error initializing RealEstateManager:', error);
    }
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRealEstateManager);
} else {
    initializeRealEstateManager();
}
