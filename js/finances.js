// finances.js - Balanced Financial Management System
class FinancesManager {
    static gameState = null;
    static initialized = false;
    static elements = {};
    static chart = null;
    static eventListeners = [];
    static debug = true;
    
    // Realistic account types with lower interest rates
    static accountTypes = {
        checking: {
            name: "Checking Account",
            interestRate: 0.0002, // 0.6% annual
            minBalance: 0,
            color: '#0d6efd',
            monthlyFee: 5, // Monthly maintenance fee
            canWithdraw: true
        },
        savings: {
            name: "Savings Account",
            interestRate: 0.0008, // 1.8% annual
            minBalance: 500, // Higher minimum balance
            color: '#198754',
            monthlyFee: 0,
            canWithdraw: true,
            withdrawalLimit: 3 // Limited withdrawals per month
        },
        investment: {
            name: "Investment Account",
            interestRate: 0.003, // 6% annual (with volatility)
            minBalance: 1000, // Higher minimum investment
            color: '#6f42c1',
            monthlyFee: 10, // Account maintenance fee
            canWithdraw: false, // Must transfer to checking first
            riskFactor: 0.15 // Chance of quarterly loss
        }
    };

    

    /**
     * Initializes the FinancesManager system
     */
    static init() {
        try {
            if (this.initialized) return;
            
            this.log('Initializing FinancesManager...');
            
            this.loadGameState();
            this.cacheElements();
            this.setupEventListeners();
            this.renderAll();
            this.syncWithCareer();
            
            this.initialized = true;
            this.log('FinancesManager initialized successfully');
        } catch (error) {
            console.error('FinancesManager initialization failed:', error);
            throw error;
        }
    }

static processSalary(monthsAdvanced) {
    // Check if CareerManager exists and player has a job
    if (typeof CareerManager === 'undefined' || !CareerManager.gameState?.currentJob?.salary) {
        console.warn("No job or CareerManager not found - no salary processed");
        return;
    }

    // Base salary with random fluctuations (-5% to +5%)
    const baseSalary = CareerManager.gameState.currentJob.salary;
    const fluctuation = (Math.random() * 0.1) - 0.05; // -5% to +5%
    const salaryPayment = baseSalary * (1 + fluctuation) * monthsAdvanced;
    
    // Progressive tax system (higher tax for higher incomes)
    const taxRate = this.calculateTaxRate(baseSalary);
    const taxAmount = salaryPayment * taxRate;
    
    // Living expenses (30-50% of salary)
    const livingExpenseRate = 0.3 + (Math.random() * 0.2);
    const livingExpenses = salaryPayment * livingExpenseRate;
    
    const netSalary = salaryPayment - taxAmount - livingExpenses;

    // Rest of the method remains the same...
    const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
    const accountId = checkingAccounts.length > 0 
        ? checkingAccounts[0].id 
        : this.createDefaultCheckingAccount();

    // Update account balance
    const account = this.gameState.accounts.find(acc => acc.id === accountId);
    if (account) {
        account.balance += netSalary;
    }

    // Record transactions
    this.addTransaction(
        'income', 
        `Salary from ${CareerManager.gameState.currentJob.title}`, 
        netSalary, 
        'salary',
        accountId
    );

    this.addTransaction(
        'expense',
        `Income tax withholding`,
        taxAmount,
        'taxes',
        accountId
    );

    this.addTransaction(
        'expense',
        `Living expenses`,
        livingExpenses,
        'living_costs',
        accountId
    );

    // Notify player
    if (typeof EventManager !== 'undefined') {
        EventManager.addToEventLog(`Received salary: $${netSalary.toLocaleString()} (after taxes and expenses)`, 'success');
    }

    this.saveGameState();
    this.renderAll();
}
    
    static cleanup() {
        this.log('Cleaning up FinancesManager...');
        this.removeEventListeners();
        this.elements = {};
        this.initialized = false;
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

  // In FinancesManager.js, modify the getCurrentDateString method:
static getCurrentDateString() {
    if (window.timeState?.currentDate) {
        return formatDate(window.timeState.currentDate);
    }
    return new Date().toLocaleDateString();
}

    
    
    // ===================================================================
    // STATE MANAGEMENT
    // ===================================================================
    
    static loadGameState() {
        try {
            const savedState = localStorage.getItem('financesGameState');
            if (!savedState) {
                this.gameState = this.getDefaultGameState();
            } else {
                const parsedState = JSON.parse(savedState);
                this.gameState = parsedState;
                this.validateGameState();
            }
            
            this.syncWithCareer();
            this.log("Game state loaded");
        } catch (e) {
            console.error('Error loading game state:', e);
            this.gameState = this.getDefaultGameState();
        }
    }
    
    
    static validateGameState() {
        if (!this.gameState.accounts) this.gameState.accounts = [];
        if (!this.gameState.assets) this.gameState.assets = [];
        if (!this.gameState.transactions) this.gameState.transactions = [];
        if (!this.gameState.financialEvents) this.gameState.financialEvents = [];
        if (!this.gameState.accountWithdrawals) this.gameState.accountWithdrawals = {};
    }
    
    static getDefaultGameState() {
        return {
            accounts: [],
            assets: [],
            transactions: [],
            financialEvents: [],
            accountWithdrawals: {}, // Track monthly withdrawals for savings accounts
            lastUpdated: new Date().toISOString()
        };
    }
    
    static saveGameState() {
        try {
            this.gameState.lastUpdated = new Date().toISOString();
            localStorage.setItem('financesGameState', JSON.stringify(this.gameState));
            this.log('Game state saved');
            window.dispatchEvent(new Event('storage'));
            return true;
        } catch (e) {
            this.log('Error saving game state:', e);
            return false;
        }
    }

  static syncWithCareer() {
    this.log('Syncing with career data...');
    
    // If we have a current job but no salary transaction, add one
    if (typeof CareerManager !== 'undefined' && CareerManager.gameState?.currentJob) {
        const hasSalaryTx = this.gameState.transactions.some(
            tx => tx.category === 'salary' && 
            tx.description.includes(CareerManager.gameState.currentJob.title)
        );
        
        if (!hasSalaryTx) {
            this.processSalary(1); // Process one month's salary
        }
    }
    
    this.renderAll();
}
    
    // ===================================================================
    // UI MANAGEMENT
    // ===================================================================
    
    static cacheElements() {
        const getElement = (id) => document.getElementById(id) || null;
        
        this.elements = {
            moneyDisplay: getElement('moneyDisplay'),
            incomeDisplay: getElement('incomeDisplay'),
            expensesDisplay: getElement('expensesDisplay'),
            netWorthDisplay: getElement('netWorthDisplay'),
            bankAccountsContainer: getElement('bankAccountsContainer'),
            investmentsContainer: getElement('investmentsContainer'),
            assetsContainer: getElement('assetsContainer'),
            transactionsList: getElement('transactionsList'),
            financialEventLog: getElement('financialEventLog'),
            openAccountBtn: getElement('openAccountBtn'),
            newInvestmentBtn: getElement('newInvestmentBtn'),
            purchaseAssetBtn: getElement('purchaseAssetBtn'),
            accountForm: getElement('accountForm'),
            accountType: getElement('accountType'),
            initialDeposit: getElement('initialDeposit'),
            accountName: getElement('accountName'),
            confirmAccountBtn: getElement('confirmAccountBtn'),
            cashFlowDisplay: getElement('cashFlowDisplay'),
            savingsRateDisplay: getElement('savingsRateDisplay'),
            debtRatioDisplay: getElement('debtRatioDisplay'),
            financeChart: getElement('financePieChart')
        };
        
        const accountModal = getElement('accountModal');
        if (accountModal) {
            this.elements.accountModal = new bootstrap.Modal(accountModal);
        }
        
        if (this.debug) {
            for (const [key, value] of Object.entries(this.elements)) {
                if (!value) this.log(`Element not found: ${key}`);
            }
        }
    }

    static handleCareerUpdate() {
    this.log('Handling career update...');
    
    // If we have a current job but no salary transaction, add one
    if (CareerManager.gameState?.currentJob) {
        const hasSalaryTx = this.gameState.transactions.some(
            tx => tx.category === 'salary' && 
            tx.description.includes(CareerManager.gameState.currentJob.title)
        );
    }
    
    this.renderAll();
}

static updateDisplay() {
    this.renderAll(); // Since renderAll already updates all displays
}
    
    static setupEventListeners() {
        const openAccountListener = () => this.showAccountModal();
        const confirmAccountListener = () => this.createAccount();
        const timeAdvancedListener = (e) => this.handleTimeAdvanced(e.detail);
        const careerUpdateListener = () => this.handleCareerUpdate();
        
        if (this.elements.openAccountBtn) {
            this.elements.openAccountBtn.addEventListener('click', openAccountListener);
            this.eventListeners.push({
                element: this.elements.openAccountBtn,
                type: 'click',
                listener: openAccountListener
            });
        }
        
        if (this.elements.confirmAccountBtn) {
            this.elements.confirmAccountBtn.addEventListener('click', confirmAccountListener);
            this.eventListeners.push({
                element: this.elements.confirmAccountBtn,
                type: 'click',
                listener: confirmAccountListener
            });
        }
        
        document.addEventListener('timeAdvanced', timeAdvancedListener);
        this.eventListeners.push({
            element: document,
            type: 'timeAdvanced',
            listener: timeAdvancedListener
        });
        
        document.addEventListener('careerUpdated', careerUpdateListener);
        this.eventListeners.push({
            element: document,
            type: 'careerUpdated',
            listener: careerUpdateListener
        });
    }
    
    static removeEventListeners() {
        this.eventListeners.forEach(({ element, type, listener }) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];
    }
    
    // ===================================================================
    // ACCOUNT MANAGEMENT
    // ===================================================================
    
   static createAccount() {
    const accountType = this.elements.accountType.value;
    const initialDeposit = parseFloat(this.elements.initialDeposit.value) || 0;
    const accountName = this.elements.accountName.value || this.accountTypes[accountType].name;
    
    if (!accountType) {
        alert('Please select an account type');
        return;
    }
    
    // Check minimum deposit requirements
    const minDeposit = this.accountTypes[accountType].minBalance;
    if (initialDeposit < minDeposit) {
        alert(`Minimum deposit for this account type is $${minDeposit}`);
        return;
    }
    
    // Check if player has enough money (either in cash or checking account)
    let hasFunds = false;
    
    // Check cash first
    if (typeof MainManager !== 'undefined' && MainManager.getMoney) {
        const currentCash = MainManager.getMoney();
        if (currentCash >= initialDeposit) {
            hasFunds = true;
            MainManager.addMoney(-initialDeposit);
        }
    }
    
    // If not enough cash, check checking accounts
    if (!hasFunds) {
        const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
        for (const account of checkingAccounts) {
            if (account.balance >= initialDeposit) {
                account.balance -= initialDeposit;
                hasFunds = true;
                this.addTransaction(
                    'expense',
                    `Initial deposit for new ${this.accountTypes[accountType].name}`,
                    initialDeposit,
                    'account_opening',
                    account.id
                );
                break;
            }
        }
    }
    
    if (!hasFunds) {
        alert(`You don't have enough funds for this deposit (need $${initialDeposit})`);
        return;
    }
    
    const newAccount = {
        id: 'acc-' + Date.now(),
        type: accountType,
        name: accountName,
        balance: initialDeposit,
        openedDate: this.getCurrentDateString(),
        transactions: []
    };
    
    this.gameState.accounts.push(newAccount);
    this.saveGameState();
    
    this.addTransaction('account', 'Deposit to new account', initialDeposit, 'initial_deposit', newAccount.id);
    EventManager.addToEventLog(`Opened new ${this.accountTypes[accountType].name}: ${accountName}`, 'success');
    
    this.elements.accountModal.hide();
    this.elements.accountForm.reset();
    this.renderAll();
}
    
    // ===================================================================
    // TRANSACTION MANAGEMENT
    // ===================================================================
    
    static addTransaction(type, description, amount, category, accountId = null) {
        const transaction = {
            id: 'txn-' + Date.now(),
            type,
            description,
            amount,
            category,
            date: this.getCurrentDateString(),
            timestamp: Date.now(),
            accountId
        };
        
        this.gameState.transactions.unshift(transaction);
        
        if (accountId) {
            const account = this.gameState.accounts.find(acc => acc.id === accountId);
            if (account) {
                if (type === 'income' || type === 'deposit') {
                    account.balance += amount;
                } else if (type === 'expense' || type === 'withdrawal') {
                    account.balance -= amount;
                    
                    // Track withdrawals for savings accounts
                    if (account.type === 'savings' && type === 'withdrawal') {
                        const month = new Date().toISOString().slice(0, 7);
                        this.gameState.accountWithdrawals[account.id] = this.gameState.accountWithdrawals[account.id] || {};
                        this.gameState.accountWithdrawals[account.id][month] = 
                            (this.gameState.accountWithdrawals[account.id][month] || 0) + 1;
                    }
                }
                account.transactions.push(transaction.id);
            }
        }
        
        this.saveGameState();
        this.renderTransactions();
        this.updateFinancialStats();
    }
    
    static calculateTotalBalance() {
        return this.gameState.accounts.reduce((total, account) => total + account.balance, 0);
    }
    
    static calculateMonthlyIncome() {
        let income = 0;
        
        // Salary income (with taxes already deducted)
        const salaryTransactions = this.gameState.transactions.filter(
            tx => tx.category === 'salary'
        );
        
        if (salaryTransactions.length > 0) {
            income += salaryTransactions[0].amount;
        } else if (typeof CareerManager !== 'undefined' && CareerManager.getCurrentJob) {
            const currentJob = CareerManager.getCurrentJob();
            if (currentJob) {
                income += (currentJob.salary || 0) * 0.7; // 30% tax
                
                const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
                const accountId = checkingAccounts.length > 0 ? checkingAccounts[0].id : null;
                
                this.addTransaction(
                    'income', 
                    `Salary from ${currentJob.title}`, 
                    currentJob.salary * 0.7, 
                    'salary',
                    accountId
                );
            }
        }
        
        // Investment income (calculated separately in time advancement)
        return income;
    }
    
    static calculateMonthlyExpenses() {
        // Base living costs (scales with income)
        const currentIncome = this.calculateMonthlyIncome();
        let expenses = 0;
        
        // Housing costs only if player has moved out
        const hasHousing = this.gameState.assets.some(asset => 
            asset.category === 'house' || asset.category === 'apartment'
        );
        
        if (hasHousing) {
            // Housing costs (30-50% of income)
            expenses += currentIncome * (0.3 + (Math.random() * 0.2));
            
            // Utility costs (5-10% of income)
            expenses += currentIncome * (0.05 + (Math.random() * 0.05));
        }
        
        // Asset maintenance costs (1-3% of asset value)
        expenses += this.gameState.assets.reduce((sum, asset) => {
            return sum + (asset.maintenanceCost || (asset.currentValue * (0.01 + (Math.random() * 0.02))));
        }, 0);
        
        // Account fees
        expenses += this.gameState.accounts.reduce((sum, account) => {
            return sum + (this.accountTypes[account.type].monthlyFee || 0);
        }, 0);
        
        // Minimum expenses if player has moved out
        if (hasHousing) {
            expenses = Math.max(expenses, 800); // $800 minimum monthly expenses
        }
        
        return expenses;
    }
    
    static calculateNetWorth() {
        let netWorth = this.calculateTotalBalance();
        
        this.gameState.assets.forEach(asset => {
            netWorth += asset.currentValue || asset.purchasePrice * 0.9;
        });
        
        return netWorth;
    }
    
    // ===================================================================
    // ACCOUNT ACTIONS
    // ===================================================================
    
   static showDepositWithdrawModal(accountId, actionType) {
    const account = this.gameState.accounts.find(acc => acc.id === accountId);
    if (!account) return;

    // For withdrawals, check if account allows them
    if (actionType === 'withdraw' && !this.accountTypes[account.type].canWithdraw) {
        alert('This account type does not allow direct withdrawals. Transfer to checking first.');
        return;
    }

    // For savings withdrawals, check monthly limit
    if (actionType === 'withdraw' && account.type === 'savings') {
        const month = new Date().toISOString().slice(0, 7);
        const withdrawalsThisMonth = this.gameState.accountWithdrawals[account.id]?.[month] || 0;
        const withdrawalLimit = this.accountTypes.savings.withdrawalLimit;
        
        if (withdrawalsThisMonth >= withdrawalLimit) {
            alert(`You've reached your monthly withdrawal limit (${withdrawalLimit}) for this savings account.`);
            return;
        }
    }

    // Get source accounts for deposits
    const sourceAccounts = actionType === 'deposit' 
        ? this.gameState.accounts.filter(acc => 
            acc.id !== accountId && 
            acc.balance > 0 &&
            this.accountTypes[acc.type].canWithdraw
        ) 
        : [];

    // Create modal container with unique ID
    const modalId = `actionModal-${Date.now()}`;
    const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${actionType === 'deposit' ? 'Deposit to' : 'Withdraw from'} ${account.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="actionAmount" class="form-label">Amount</label>
                            <div class="input-group">
                                <span class="input-group-text">$</span>
                                <input type="number" class="form-control" id="actionAmount" min="0" step="0.01">
                            </div>
                            <small class="text-muted">Current balance: $${account.balance.toLocaleString()}</small>
                        </div>
                        ${actionType === 'deposit' && sourceAccounts.length > 0 ? `
                        <div class="mb-3">
                            <label for="sourceType" class="form-label">Fund from:</label>
                            <select class="form-select" id="sourceType">
                                <option value="cash">Cash (wallet)</option>
                                ${sourceAccounts.map(acc => `
                                    <option value="${acc.id}">${acc.name} ($${acc.balance.toLocaleString()})</option>
                                `).join('')}
                            </select>
                        </div>
                        ` : ''}
                        ${actionType === 'withdraw' && account.type === 'savings' ? `
                        <div class="alert alert-warning">
                            <small>Savings accounts have a monthly withdrawal limit (${this.accountTypes.savings.withdrawalLimit}). 
                            Used: ${this.gameState.accountWithdrawals[account.id]?.[new Date().toISOString().slice(0, 7)] || 0}</small>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmActionBtn">Confirm ${actionType}</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // Get modal instance
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);

    // Store references for cleanup
    let modalCleanup = () => {
        if (modalContainer && document.body.contains(modalContainer)) {
            document.body.removeChild(modalContainer);
        }
    };

    // Handle modal show/hide events
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalCleanup();
    });

    modalElement.addEventListener('shown.bs.modal', () => {
        // Focus on amount input when modal is shown
        const amountInput = modalElement.querySelector('#actionAmount');
        if (amountInput) amountInput.focus();
    });

    // Handle confirm button click
    modalElement.querySelector('#confirmActionBtn').addEventListener('click', () => {
        const amount = parseFloat(modalElement.querySelector('#actionAmount').value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount greater than 0');
            return;
        }

        if (actionType === 'deposit') {
            const sourceType = sourceAccounts.length > 0 
                ? modalElement.querySelector('#sourceType').value 
                : 'cash';
            this.depositToAccount(accountId, amount, `Deposit to ${account.name}`, sourceType);
        } else {
            this.withdrawFromAccount(accountId, amount, `Withdrawal from ${account.name}`);
        }

        modal.hide();
    });

    // Show the modal
    modal.show();
}
    
static setupEventListeners() {
    // Remove any existing listeners first
    this.removeEventListeners();

    // Open account modal listener
    const openAccountListener = () => this.showAccountModal();
    if (this.elements.openAccountBtn) {
        this.elements.openAccountBtn.addEventListener('click', openAccountListener);
        this.eventListeners.push({
            element: this.elements.openAccountBtn,
            type: 'click',
            listener: openAccountListener
        });
    }

    // Confirm account creation listener
    const confirmAccountListener = () => this.createAccount();
    if (this.elements.confirmAccountBtn) {
        this.elements.confirmAccountBtn.addEventListener('click', confirmAccountListener);
        this.eventListeners.push({
            element: this.elements.confirmAccountBtn,
            type: 'click',
            listener: confirmAccountListener
        });
    }

    // Time advancement listener
    const timeAdvancedListener = (e) => this.handleTimeAdvanced(e.detail);
    document.addEventListener('timeAdvanced', timeAdvancedListener);
    this.eventListeners.push({
        element: document,
        type: 'timeAdvanced',
        listener: timeAdvancedListener
    });

    // Career update listener
    const careerUpdateListener = () => {
        this.log('Career update event received');
        this.syncWithCareer();
        this.renderAll();
    };
    document.addEventListener('careerUpdated', careerUpdateListener);
    this.eventListeners.push({
        element: document,
        type: 'careerUpdated',
        listener: careerUpdateListener
    });

    // Storage event listener for cross-tab sync
    const storageListener = (e) => {
        if (e.key === 'financesGameState') {
            this.log('Detected finances state change from storage');
            this.loadGameState();
            this.renderAll();
        }
    };
    window.addEventListener('storage', storageListener);
    this.eventListeners.push({
        element: window,
        type: 'storage',
        listener: storageListener
    });

    // Add listeners for dynamically created account action buttons
    const accountActionListener = (e) => {
        const depositBtn = e.target.closest('.deposit-btn');
        const withdrawBtn = e.target.closest('.withdraw-btn');
        
        if (depositBtn) {
            const accountId = e.target.closest('.account-card').dataset.accountId;
            this.showDepositWithdrawModal(accountId, 'deposit');
        } else if (withdrawBtn) {
            const accountId = e.target.closest('.account-card').dataset.accountId;
            this.showDepositWithdrawModal(accountId, 'withdraw');
        }
    };

    // Use event delegation for dynamically created buttons
    if (this.elements.bankAccountsContainer) {
        this.elements.bankAccountsContainer.addEventListener('click', accountActionListener);
        this.eventListeners.push({
            element: this.elements.bankAccountsContainer,
            type: 'click',
            listener: accountActionListener
        });
    }

    if (this.elements.investmentsContainer) {
        this.elements.investmentsContainer.addEventListener('click', accountActionListener);
        this.eventListeners.push({
            element: this.elements.investmentsContainer,
            type: 'click',
            listener: accountActionListener
        });
    }
}

 static depositToAccount(accountId, amount, description = 'Deposit', source = 'cash') {
    try {
        // Validate amount
        if (isNaN(amount)) {
            alert('Please enter a valid amount');
            return false;
        }
        
        amount = parseFloat(amount);
        if (amount <= 0) return false;
        
        const targetAccount = this.gameState.accounts.find(acc => acc.id === accountId);
        if (!targetAccount) {
            alert('Target account not found');
            return false;
        }
        
        if (source === 'cash') {
            // Handle cash deposit
            const currentCash = typeof MainManager?.getMoney === 'function' 
                ? MainManager.getMoney() 
                : 0;
            
            if (currentCash < amount) {
                alert(`You don't have enough money for this deposit. You only have $${currentCash.toLocaleString()} available.`);
                return false;
            }
            
            if (typeof MainManager !== 'undefined' && MainManager.addMoney) {
                MainManager.addMoney(-amount);
                targetAccount.balance += amount;
                this.addTransaction('deposit', description, amount, 'deposit', accountId);
                EventManager.addToEventLog(`Deposited $${amount.toLocaleString()} to ${targetAccount.name}`, 'success');
                this.saveGameState();
                this.renderAll();
                return true;
            }
        } else {
            // Handle transfer from another account
            const sourceAccount = this.gameState.accounts.find(acc => acc.id === source);
            if (!sourceAccount) {
                alert('Source account not found');
                return false;
            }
            
            if (sourceAccount.balance < amount) {
                alert(`Insufficient funds in source account. Available balance: $${sourceAccount.balance.toLocaleString()}`);
                return false;
            }
            
            if (!this.accountTypes[sourceAccount.type].canWithdraw) {
                alert(`Cannot transfer from ${sourceAccount.name} - this account type doesn't allow withdrawals`);
                return false;
            }
            
            const minBalance = this.accountTypes[sourceAccount.type].minBalance;
            if ((sourceAccount.balance - amount) < minBalance) {
                const maxTransfer = sourceAccount.balance - minBalance;
                alert(`Cannot transfer $${amount.toLocaleString()}. Maximum you can transfer is $${maxTransfer.toLocaleString()} to maintain minimum balance of $${minBalance.toLocaleString()}`);
                return false;
            }
            
            if (sourceAccount.type === 'savings') {
                const month = new Date().toISOString().slice(0, 7);
                const withdrawalsThisMonth = this.gameState.accountWithdrawals[sourceAccount.id]?.[month] || 0;
                const withdrawalLimit = this.accountTypes.savings.withdrawalLimit;
                
                if (withdrawalsThisMonth >= withdrawalLimit) {
                    alert(`You've reached your monthly withdrawal limit (${withdrawalLimit}) for this savings account.`);
                    return false;
                }
                
                this.gameState.accountWithdrawals[sourceAccount.id] = this.gameState.accountWithdrawals[sourceAccount.id] || {};
                this.gameState.accountWithdrawals[sourceAccount.id][month] = (this.gameState.accountWithdrawals[sourceAccount.id][month] || 0) + 1;
            }
            
            sourceAccount.balance -= amount;
            targetAccount.balance += amount;
            
            this.addTransaction(
                'transfer', 
                `Transfer to ${targetAccount.name}`, 
                amount, 
                'account_transfer', 
                sourceAccount.id
            );
            this.addTransaction(
                'deposit', 
                description, 
                amount, 
                'deposit', 
                targetAccount.id
            );
            
            EventManager.addToEventLog(
                `Transferred $${amount.toLocaleString()} from ${sourceAccount.name} to ${targetAccount.name}`, 
                'success'
            );
            this.saveGameState();
            this.renderAll();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error in depositToAccount:', error);
        EventManager.addToEventLog('Error processing deposit', 'danger');
        return false;
    }
}
    
    static withdrawFromAccount(accountId, amount, description = 'Withdrawal') {
    const account = this.gameState.accounts.find(acc => acc.id === accountId);
    if (!account) {
        alert('Account not found');
        return false;
    }
    
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than 0');
        return false;
    }
    
    amount = parseFloat(amount);
    
    if (account.balance < amount) {
        alert(`Insufficient funds in this account. Available balance: $${account.balance.toLocaleString()}`);
        return false;
    }
    
    // Check minimum balance requirements
    const minBalance = this.accountTypes[account.type].minBalance;
    if ((account.balance - amount) < minBalance) {
        alert(`This account requires a minimum balance of $${minBalance.toLocaleString()}`);
        return false;
    }
    
    // For savings accounts, check withdrawal limit
    if (account.type === 'savings') {
        const month = new Date().toISOString().slice(0, 7);
        const withdrawalsThisMonth = this.gameState.accountWithdrawals[account.id]?.[month] || 0;
        const withdrawalLimit = this.accountTypes.savings.withdrawalLimit;
        
        if (withdrawalsThisMonth >= withdrawalLimit) {
            alert(`You've reached your monthly withdrawal limit (${withdrawalLimit}) for this savings account.`);
            return false;
        }
        
        // Track the withdrawal
        this.gameState.accountWithdrawals[account.id] = this.gameState.accountWithdrawals[account.id] || {};
        this.gameState.accountWithdrawals[account.id][month] = (this.gameState.accountWithdrawals[account.id][month] || 0) + 1;
    }
    
    // Perform the withdrawal
    account.balance -= amount;
    
    if (typeof MainManager !== 'undefined' && MainManager.addMoney) {
        MainManager.addMoney(amount);
    }
    
    this.addTransaction('withdrawal', description, amount, 'withdrawal', accountId);
    
    EventManager.addToEventLog(`Withdrew $${amount.toLocaleString()} from ${account.name}`, 'success');
    this.saveGameState();
    this.renderAll();
    return true;
}
    
    // ===================================================================
    // TIME ADVANCEMENT
    // ===================================================================
    
static handleTimeAdvanced(timeState) {
    if (!this.gameState.currentJob) return; // No job = no salary

    // Update job duration
    this.gameState.currentJob.monthsWorked += timeState.monthsAdvanced;

    // Process salary via FinancesManager (if available)
    if (typeof FinancesManager !== 'undefined') {
        FinancesManager.processSalary(timeState.monthsAdvanced);
    } else {
        console.warn("FinancesManager not found - salary not processed");
    }

    // Update performance, experience, etc.
    this.updatePerformance(timeState.monthsAdvanced);
    this.gainExperience(timeState.monthsAdvanced);
    this.gainSkills(timeState.monthsAdvanced);
    this.checkForPromotion();

    // Save changes
    this.saveGameState();
}
    
static processMonthlyEvents() {
    // Only process salary if employed
    if (typeof CareerManager !== 'undefined' && CareerManager.gameState?.currentJob) {
        const monthlySalary = CareerManager.gameState.currentJob.salary;
        const taxRate = this.calculateTaxRate(monthlySalary);
        const taxAmount = monthlySalary * taxRate;
        const netSalary = monthlySalary - taxAmount;
        
        // Deposit to checking account
        const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
        const accountId = checkingAccounts.length > 0 
            ? checkingAccounts[0].id 
            : this.createDefaultCheckingAccount();
        
        const account = this.gameState.accounts.find(acc => acc.id === accountId);
        if (account) {
            account.balance += netSalary;
        }
        
        this.addTransaction(
            'income', 
            `Salary from ${CareerManager.gameState.currentJob.title}`, 
            netSalary, 
            'salary',
            accountId
        );
    }
    
    // Process monthly expenses (living costs still apply)
    const monthlyExpenses = this.calculateMonthlyExpenses();
    if (monthlyExpenses > 0) {
        const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
        if (checkingAccounts.length > 0) {
            checkingAccounts[0].balance -= monthlyExpenses;
            this.addTransaction(
                'expense',
                'Monthly living expenses',
                monthlyExpenses,
                'living_expenses',
                checkingAccounts[0].id
            );
        }
    }
}
    
    static processQuarterlyEvents() {
        try {
            this.log('Processing quarterly financial events');
            
            // 1. Process investment returns with higher volatility
            const investmentAccounts = this.gameState.accounts.filter(acc => acc.type === 'investment');
            investmentAccounts.forEach(account => {
                if (account.balance > 0) {
                    // 20% chance of quarterly loss
                    if (Math.random() < this.accountTypes.investment.riskFactor) {
                        const loss = account.balance * (0.05 + (Math.random() * 0.05)); // 5-10% loss
                        account.balance -= loss;
                        this.addTransaction('expense', `Investment loss - ${account.name}`, loss, 'investment_loss', account.id);
                    } else {
                        const baseReturn = this.accountTypes.investment.interestRate;
                        const quarterlyReturn = account.balance * ((baseReturn / 4) + (Math.random() * 0.1 - 0.05));
                        account.balance += quarterlyReturn;
                        
                        if (quarterlyReturn > 0) {
                            this.addTransaction('income', `Investment return - ${account.name}`, quarterlyReturn, 'investment_return', account.id);
                        }
                    }
                    
                    // Apply management fee (1% quarterly)
                    const fee = account.balance * 0.01;
                    account.balance -= fee;
                    this.addTransaction('expense', `Investment management fee - ${account.name}`, fee, 'investment_fee', account.id);
                }
            });
            
            // 2. Process quarterly bonus (5-10% chance, 5-10% of quarterly salary)
            if (typeof CareerManager !== 'undefined' && CareerManager.gameState?.currentJob) {
                if (Math.random() < 0.08) { // 8% chance of bonus
                    const quarterlySalary = CareerManager.gameState.currentJob.salary * 3;
                    const bonusAmount = quarterlySalary * (0.05 + (Math.random() * 0.05)); // 5-10% of quarterly salary
                    
                    const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
                    const accountId = checkingAccounts.length > 0 ? checkingAccounts[0].id : null;
                    
                    this.addTransaction('income', 'Quarterly performance bonus', bonusAmount, 'bonus', accountId);
                    EventManager.addToEventLog(`Received $${bonusAmount.toLocaleString()} quarterly bonus!`, 'success');
                }
            }
            
            // 3. Process asset depreciation (5-10% quarterly)
            this.gameState.assets.forEach(asset => {
                if (asset.currentValue > asset.purchasePrice * 0.1) {
                    const depreciation = asset.currentValue * (0.05 + (Math.random() * 0.05)); // 5-10% depreciation
                    asset.currentValue -= depreciation;
                    asset.currentValue = Math.max(asset.currentValue, asset.purchasePrice * 0.1);
                    
                    this.addTransaction('expense', `Depreciation - ${asset.name}`, depreciation, 'asset_depreciation');
                }
            });
            
            // 4. Process inflation (1% price increase)
            this.gameState.transactions
                .filter(tx => ['living_expenses', 'recurring_expense'].includes(tx.category))
                .forEach(tx => {
                    tx.amount *= 1.01;
                });
            
            EventManager.addToEventLog("Prices increased due to inflation (1%)", 'warning');
            this.saveGameState();
            
        } catch (error) {
            this.log('Error processing quarterly events:', error);
            EventManager.addToEventLog('Error processing quarterly financial events', 'danger');
        }
    }
    
   static calculateTaxRate(income) {
    // Progressive tax system
    if (income <= 1000) return 0.10;  // 10% for lower incomes
    if (income <= 2000) return 0.20;  // 20% for middle incomes
    if (income <= 3000) return 0.30;  // 30% for higher middle incomes
    return 0.40;                      // 40% for highest incomes
}
    
    static createDefaultCheckingAccount() {
        const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
        if (checkingAccounts.length > 0) return checkingAccounts[0].id;
        
        const newAccount = {
            id: 'acc-' + Date.now(),
            type: 'checking',
            name: 'Primary Checking',
            balance: 0,
            openedDate: this.getCurrentDateString(),
            transactions: []
        };
        
        this.gameState.accounts.push(newAccount);
        this.saveGameState();
        return newAccount.id;
    }

    static _updateFinancialDisplays() {
    const { financialSummaryContainer } = this.state.elements;
    if (!financialSummaryContainer || typeof FinancesManager === 'undefined') return;
    
    this._withErrorHandling(() => {
        if (!FinancesManager.gameState) {
            FinancesManager.loadGameState?.();
        }
        
        const financialState = FinancesManager.getFinancialState?.() || {
            totalBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            netWorth: 0
        };
        
        // Use FinancesManager's method to generate the HTML
        financialSummaryContainer.innerHTML = FinancesManager.generateFinancialSummaryHTML?.(financialState) || 
            this._generateFinancialSummaryHTML(financialState);
    }, 'financial display update');
}


    generateFinancialSummaryHTML() {
        // Calculate financial metrics
        const monthlyCashFlow = this.income - this.expenses;
        const savingsRate = this.income > 0 ? (monthlyCashFlow / this.income * 100) : 0;
        const debtToIncome = this.income > 0 ? (this.debt / this.income * 100) : 0;
        
        // Format values for display
        const formattedCashFlow = this.formatCurrency(monthlyCashFlow);
        const formattedSavingsRate = savingsRate.toFixed(1) + '%';
        const formattedDebtRatio = debtToIncome.toFixed(1) + '%';
        
        // Generate HTML for the financial summary section
        return `
            <p class="mb-1"><strong>Monthly Cash Flow:</strong> <span id="cashFlowDisplay">${formattedCashFlow}</span></p>
            <p class="mb-1"><strong>Savings Rate:</strong> <span id="savingsRateDisplay">${formattedSavingsRate}</span></p>
            <p class="mb-1"><strong>Debt-to-Income:</strong> <span id="debtRatioDisplay">${formattedDebtRatio}</span></p>
        `;
    }

    // Helper method to format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    
    // ===================================================================
    // RENDERING
    // ===================================================================
    
    static renderAll() {
        this.renderAccounts();
        this.renderTransactions();
        this.renderFinancialEvents();
        this.updateFinancialStats();
        this.updateChart();
    }
    
    static renderAccounts() {
        if (!this.elements.bankAccountsContainer || !this.elements.investmentsContainer) return;
        
        const bankAccounts = this.gameState.accounts.filter(acc => 
            acc.type === 'checking' || acc.type === 'savings'
        );
        
        const investmentAccounts = this.gameState.accounts.filter(acc => 
            acc.type === 'investment'
        );
        
        // Render bank accounts
        this.elements.bankAccountsContainer.innerHTML = bankAccounts.length === 0
            ? `<div class="alert alert-info">No bank accounts yet.</div>`
            : bankAccounts.map(account => this.renderAccountCard(account)).join('');
        
        // Render investment accounts
        this.elements.investmentsContainer.innerHTML = investmentAccounts.length === 0
            ? `<div class="alert alert-info">No investment accounts yet.</div>`
            : investmentAccounts.map(account => this.renderAccountCard(account)).join('');
        
        // Add event listeners for account actions
        document.querySelectorAll('.deposit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const accountId = e.target.closest('.account-card').dataset.accountId;
                this.showDepositWithdrawModal(accountId, 'deposit');
            });
        });
        
        document.querySelectorAll('.withdraw-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const accountId = e.target.closest('.account-card').dataset.accountId;
                this.showDepositWithdrawModal(accountId, 'withdraw');
            });
        });
        
        // Render assets
        this.elements.assetsContainer.innerHTML = this.gameState.assets.length === 0
            ? `<div class="alert alert-info">No assets yet.</div>`
            : this.gameState.assets.map(asset => this.renderAssetCard(asset)).join('');
    }
    
    static renderAccountCard(account) {
        const accountType = this.accountTypes[account.type];
        const withdrawalInfo = account.type === 'savings' 
            ? `<small class="text-muted d-block">Withdrawals this month: ${this.gameState.accountWithdrawals[account.id]?.[new Date().toISOString().slice(0, 7)] || 0}/${accountType.withdrawalLimit || '∞'}</small>`
            : '';
        
        return `
            <div class="account-card" data-account-id="${account.id}">
                <div class="account-header">
                    <div>
                        <div class="account-name">${account.name}</div>
                        <div class="account-type">${accountType.name}</div>
                    </div>
                    <span class="badge bg-${account.type === 'checking' ? 'primary' : account.type === 'savings' ? 'success' : 'purple'}">${account.type}</span>
                </div>
                <div class="account-balance">$${account.balance.toLocaleString()}</div>
                ${withdrawalInfo}
                <div class="text-muted small">Opened: ${account.openedDate}</div>
                <div class="account-actions mt-2">
                    <button class="btn btn-sm btn-outline-primary deposit-btn">Deposit</button>
                    ${accountType.canWithdraw ? `<button class="btn btn-sm btn-outline-secondary withdraw-btn">Withdraw</button>` : ''}
                </div>
            </div>
        `;
    }
    
    static renderAssetCard(asset) {
        return `
            <div class="account-card">
                <div class="account-header">
                    <div>
                        <div class="account-name">${asset.name}</div>
                        <div class="account-type">${asset.category}</div>
                    </div>
                    <span class="badge bg-warning text-dark">Asset</span>
                </div>
                <div class="account-balance">Value: $${asset.currentValue?.toLocaleString() || asset.purchasePrice.toLocaleString()}</div>
                <div class="text-muted small">Purchased: ${asset.purchaseDate}</div>
                <div class="account-actions">
                    <button class="btn btn-sm btn-outline-danger">Sell</button>
                </div>
            </div>
        `;
    }
    
    static renderTransactions() {
        if (!this.elements.transactionsList) return;
        
        this.elements.transactionsList.innerHTML = this.gameState.transactions.length === 0
            ? `<div class="list-group-item">No transactions yet</div>`
            : this.gameState.transactions.slice(0, 10).map(txn => `
                <div class="list-group-item transaction-item">
                    <div class="d-flex justify-content-between">
                        <div>
                            <div>${txn.description}</div>
                            <small class="transaction-date">${txn.date}</small>
                        </div>
                        <div class="transaction-amount ${txn.type}">
                            ${txn.type === 'expense' ? '-' : ''}$${txn.amount.toLocaleString()}
                        </div>
                    </div>
                </div>
            `).join('');
    }
    
    static renderFinancialEvents() {
        if (!this.elements.financialEventLog) return;
        
        let events = [];
        if (typeof EventManager !== 'undefined' && EventManager.getEvents) {
            events = EventManager.getEvents().filter(event => 
                event.message.includes('$') || 
                event.message.includes('salary') || 
                event.message.includes('purchased') ||
                event.message.includes('account')
            );
        }
        
        this.elements.financialEventLog.innerHTML = events.length === 0
            ? `<div class="list-group-item">No financial events yet</div>`
            : events.slice(0, 10).map(event => `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${event.message}</span>
                        <small class="text-muted">${new Date(parseInt(event.timestamp)).toLocaleTimeString()}</small>
                    </div>
                </div>
            `).join('');
    }
    
  static updateFinancialStats() {
    const totalBalance = this.calculateTotalBalance();
    const monthlyIncome = this.calculateMonthlyIncome();
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const netWorth = this.calculateNetWorth();
    const cashFlow = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (cashFlow / monthlyIncome) * 100 : 0;
    
    // Safely update all possible displays
    const updateDisplay = (id, content) => {
        const el = document.getElementById(id);
        if (el) el.textContent = content;
    };
    
    // Update all financial displays
    updateDisplay('moneyDisplay', `$${Math.round(totalBalance).toLocaleString()}`);
    updateDisplay('incomeDisplay', `$${Math.round(monthlyIncome).toLocaleString()}/month`);
    updateDisplay('expensesDisplay', `$${Math.round(monthlyExpenses).toLocaleString()}/month`);
    updateDisplay('netWorthDisplay', `$${Math.round(netWorth).toLocaleString()}`);
    updateDisplay('cashFlowDisplay', `$${Math.round(cashFlow).toLocaleString()}`);
    updateDisplay('savingsRateDisplay', `${Math.round(savingsRate)}%`);
    updateDisplay('debtRatioDisplay', '0%');
    
    // Special case for income display with salary info
    const incomeEl = document.getElementById('incomeDisplay');
    if (incomeEl && typeof CareerManager !== 'undefined' && CareerManager.gameState?.currentJob) {
        const baseSalary = CareerManager.gameState.currentJob.salary;
        incomeEl.innerHTML = `$${Math.round(monthlyIncome).toLocaleString()}/month<br>
            <small class="text-muted">(Base salary: $${baseSalary.toLocaleString()}/month)</small>`;
    }
}
    
    static updateChart() {
        // Chart implementation would go here
    }
    
    // ===================================================================
    // UTILITY METHODS
    // ===================================================================
    
    static showAccountModal() {
        if (this.elements.accountModal) {
            this.elements.accountModal.show();
        }
    }
    
    static getCurrentDateString() {
        return new Date().toLocaleDateString();
    }
    
    static log(message) {
        if (this.debug) {
            console.log(`[FinancesManager] ${message}`);
        }
    }
    
    // ===================================================================
    // PUBLIC API
    // ===================================================================
    
  static getFinancialState() {
    // Ensure we have a game state
    if (!this.gameState) {
        this.loadGameState();
    }
    
    return {
        totalBalance: this.calculateTotalBalance(),
        monthlyIncome: this.calculateMonthlyIncome(),
        monthlyExpenses: this.calculateMonthlyExpenses(),
        netWorth: this.calculateNetWorth(),
        accounts: [...(this.gameState?.accounts || [])],
        assets: [...(this.gameState?.assets || [])]
    };
}
    
    static makePurchase(amount, description) {
  const totalBalance = this.calculateTotalBalance();
  
  if (totalBalance < amount) {
    return false; // Not enough funds
  }

  // Deduct from the primary checking account
  const checkingAccount = this.gameState.accounts.find(acc => acc.type === 'checking');
  if (checkingAccount) {
    checkingAccount.balance -= amount;
  } else {
    return false; // No account to deduct from
  }

  // Record transaction
  this.addTransaction('expense', description, amount, 'property_purchase');
  
  // Notify other systems
  window.dispatchEvent(new CustomEvent('moneyChanged', { 
    detail: { amount: -amount } 
  }));

  return true;
}
    
    static addMoney(amount, description = 'Income', category = 'misc_income') {
        const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
        
        if (checkingAccounts.length > 0) {
            checkingAccounts[0].balance += amount;
        } else if (this.gameState.accounts.length > 0) {
            this.gameState.accounts[0].balance += amount;
        } else {
            const newAccount = {
                id: 'acc-' + Date.now(),
                type: 'checking',
                name: 'Default Checking Account',
                balance: amount,
                openedDate: this.getCurrentDateString(),
                transactions: []
            };
            this.gameState.accounts.push(newAccount);
        }
        
        this.addTransaction('income', description, amount, category);
        this.saveGameState();
        this.renderAll();
        
        if (typeof MainManager !== 'undefined' && MainManager.updateMoneyDisplay) {
            MainManager.updateMoneyDisplay();
        }
    }
    
    static purchaseAsset(name, purchasePrice, category, maintenanceCost = 0) {
        if (!this.makePurchase(purchasePrice, `Purchased ${name}`)) {
            return false;
        }
        
        const newAsset = {
            id: 'asset-' + Date.now(),
            name,
            category,
            purchasePrice,
            currentValue: purchasePrice * 0.9,
            purchaseDate: this.getCurrentDateString(),
            maintenanceCost
        };
        
        this.gameState.assets.push(newAsset);
        this.saveGameState();
        
        EventManager.addToEventLog(`Purchased ${name} for $${purchasePrice.toLocaleString()}`, 'success');
        this.renderAll();
        
        return true;
    }
}



// Initialize when DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        FinancesManager.init();
    });
}