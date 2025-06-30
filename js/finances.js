// finances.js - Financial Management System
class FinancesManager {
    static gameState = null;
    static initialized = false;
    static elements = {};
    static chart = null;
    
    // Event listener references for cleanup
    static eventListeners = [];
    
    // Configuration
    static debug = true;
    
    // Account types and categories
 static accountTypes = {
    checking: {
        name: "Checking Account",
        interestRate: 0.001, // Reduced from 0.005 (~1.2% annual)
        minBalance: 0,
        color: '#0d6efd'
    },
    savings: {
        name: "Savings Account",
        interestRate: 0.0025, // Reduced from 0.01 (~3% annual)
        minBalance: 100,
        color: '#198754'
    },
    investment: {
        name: "Investment Account",
        interestRate: 0.0075, // Reduced from 0.02 (~9.3% annual)
        minBalance: 500,
        color: '#6f42c1'
    }
};

    /**
     * Initializes the FinancesManager system
     */
    static init() {
        try {
            if (this.initialized) return;
            
            this.log('Initializing FinancesManager...');
            
            // Load state first
            this.loadGameState();
            
            // Setup UI
            this.cacheElements();
            this.setupEventListeners();
            this.renderAll();
            
            // Sync with career data if available
            this.syncWithCareer();
            
            this.initialized = true;
            this.log('FinancesManager initialized successfully');
        } catch (error) {
            console.error('FinancesManager initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Syncs financial data with career information
     */
    static syncWithCareer() {
    if (typeof CareerManager !== 'undefined' && CareerManager.gameState) {
        this.log('Syncing with career data...');
        
        // If we have a current job but no salary transactions, add them
        if (CareerManager.gameState.currentJob) {
            const hasSalaryTx = this.gameState.transactions.some(
                tx => tx.category === 'salary' && 
                tx.description.includes(CareerManager.gameState.currentJob.title)
            );
            
            if (!hasSalaryTx) {
                const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
                const accountId = checkingAccounts.length > 0 ? checkingAccounts[0].id : null;
                
                this.addTransaction(
                    'income', 
                    `Salary from ${CareerManager.gameState.currentJob.title}`, 
                    CareerManager.gameState.currentJob.salary, 
                    'salary',
                    accountId
                );
            }
        }
        
        this.renderAll();
    }
}
    
    /**
     * Cleans up resources
     */
    static cleanup() {
        this.log('Cleaning up FinancesManager...');
        this.removeEventListeners();
        this.elements = {};
        this.initialized = false;
         if (this.chart) {
        this.chart.destroy();
        this.chart = null;
    }}
    
    // ===================================================================
    // DATA & STATE MANAGEMENT
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
        
        // Always sync with career after loading
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
    }
    
    static getDefaultGameState() {
        return {
            accounts: [],
            assets: [],
            transactions: [],
            financialEvents: [],
            lastUpdated: new Date().toISOString()
        };
    }
    
    static saveGameState() {
        try {
            this.gameState.lastUpdated = new Date().toISOString();
            localStorage.setItem('financesGameState', JSON.stringify(this.gameState));
            this.log('Game state saved');
            
            // Trigger storage event to sync across tabs
            window.dispatchEvent(new Event('storage'));
            
            return true;
        } catch (e) {
            this.log('Error saving game state:', e);
            return false;
        }
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
    
    // Initialize modals if they exist
    const accountModal = getElement('accountModal');
    if (accountModal) {
        this.elements.accountModal = new bootstrap.Modal(accountModal);
    }
    
    // Log missing elements for debugging
    if (this.debug) {
        for (const [key, value] of Object.entries(this.elements)) {
            if (!value) {
                this.log(`Element not found: ${key}`);
            }
        }
    }
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
    
    /**
     * Handles career updates from CareerManager
     */
    static handleCareerUpdate() {
        this.log('Handling career update...');
        this.syncWithCareer();
        this.renderAll();
    }
    
    // ===================================================================
    // CORE FUNCTIONALITY
    // ===================================================================
    
    /**
     * Creates a new financial account
     */
    static createAccount() {
        const accountType = this.elements.accountType.value;
        const initialDeposit = parseFloat(this.elements.initialDeposit.value) || 0;
        const accountName = this.elements.accountName.value || this.accountTypes[accountType].name;
        
        if (!accountType) {
            alert('Please select an account type');
            return;
        }
        
        // Check if player has enough money
        if (initialDeposit > 0) {
            if (typeof MainManager !== 'undefined' && MainManager.getMoney) {
                const currentMoney = MainManager.getMoney();
                if (currentMoney < initialDeposit) {
                    alert('You don\'t have enough money for this deposit');
                    return;
                }
                MainManager.addMoney(-initialDeposit);
            }
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
        
        // Add transaction record
        this.addTransaction('account', 'Deposit to new account', initialDeposit, 'initial_deposit');
        
        // Add financial event
        EventManager.addToEventLog(`Opened new ${this.accountTypes[accountType].name}: ${accountName}`, 'success');
        
        // Close modal and reset form
        this.elements.accountModal.hide();
        this.elements.accountForm.reset();
        
        // Update UI
        this.renderAll();
    }
    
    /**
     * Adds a financial transaction
     * @param {string} type - Type of transaction (income/expense/transfer)
     * @param {string} description - Description of transaction
     * @param {number} amount - Transaction amount
     * @param {string} category - Transaction category
     * @param {string} [accountId] - Optional account ID for account-specific transactions
     */
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
        
        // If this is an account-specific transaction, update the account balance
        if (accountId) {
            const account = this.gameState.accounts.find(acc => acc.id === accountId);
            if (account) {
                if (type === 'income' || type === 'deposit') {
                    account.balance += amount;
                } else if (type === 'expense' || type === 'withdrawal') {
                    account.balance -= amount;
                }
                account.transactions.push(transaction.id);
            }
        }
        
        this.saveGameState();
        
        // Update UI
        this.renderTransactions();
        this.updateFinancialStats();
    }
    
    /**
     * Calculates total balance across all accounts
     * @returns {number} Total balance
     */
    static calculateTotalBalance() {
        return this.gameState.accounts.reduce((total, account) => total + account.balance, 0);
    }
    
    /**
     * Calculates monthly income (salary + other income)
     * @returns {number} Monthly income
     */
   static calculateMonthlyIncome() {
    let income = 0;
    
    // Check for salary transactions in our records first
    const salaryTransactions = this.gameState.transactions.filter(
        tx => tx.category === 'salary'
    );
    
    if (salaryTransactions.length > 0) {
        // Use the most recent salary transaction amount
        income += salaryTransactions[0].amount;
    }
    // Fallback to checking CareerManager if no salary transactions found
    else if (typeof CareerManager !== 'undefined' && 
             CareerManager.getCurrentJob && 
             CareerManager.getCurrentJob()) {
        const currentJob = CareerManager.getCurrentJob();
        income += currentJob.salary || 0;
        
        // Add a salary transaction if we found a job but no transaction exists
        if (currentJob.salary) {
            const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
            const accountId = checkingAccounts.length > 0 ? checkingAccounts[0].id : null;
            
            this.addTransaction(
                'income', 
                `Salary from ${currentJob.title}`, 
                currentJob.salary, 
                'salary',
                accountId
            );
        }
    }
    
    // Add investment income
    const investmentAccounts = this.gameState.accounts.filter(acc => acc.type === 'investment');
    investmentAccounts.forEach(account => {
        income += account.balance * (this.accountTypes.investment.interestRate / 12);
    });
    
    return income;
}
    
    /**
     * Calculates monthly expenses
     * @returns {number} Monthly expenses
     */
   /**
 * Calculates monthly expenses including living costs, asset maintenance, and other recurring expenses
 * @returns {number} Total monthly expenses
 */
static calculateMonthlyExpenses() {
    // Check if player has any housing assets (has moved out)
    const hasHousing = this.gameState.assets.some(asset => 
        asset.category === 'house' || 
        asset.category === 'apartment' ||
        asset.name.toLowerCase().includes('house') ||
        asset.name.toLowerCase().includes('apartment')
    );

    // If player hasn't moved out, no expenses (living with parents)
    if (!hasHousing) {
        return 0;
    }

    // Higher base living costs (scales with income rather than net worth)
    const currentIncome = this.calculateMonthlyIncome();
    const baseLivingCosts = 200 + (currentIncome * 0.3); // 30% of income
    
    // Housing costs (minimum $500)
    let housingCosts = 500;
    if (currentIncome > 3000) housingCosts = 1000;
    if (currentIncome > 6000) housingCosts = 1500;
    
    // Asset maintenance costs (increased)
    const assetCosts = this.gameState.assets.reduce((sum, asset) => {
        return sum + (asset.maintenanceCost || (asset.purchasePrice * 0.02)); // 2% of value
    }, 0);
    
    // Recurring expenses
    const recurringExpenses = this.gameState.transactions
        .filter(tx => tx.category === 'recurring_expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Calculate total monthly expenses (with minimum)
    const totalExpenses = baseLivingCosts + housingCosts + assetCosts + recurringExpenses;
    
    return Math.max(totalExpenses, 1000); // Minimum $1000/month expenses
}
    
    /**
     * Calculates net worth (assets + cash - liabilities)
     * @returns {number} Net worth
     */
    static calculateNetWorth() {
        let netWorth = this.calculateTotalBalance();
        
        // Add asset values
        this.gameState.assets.forEach(asset => {
            netWorth += asset.currentValue || asset.purchasePrice;
        });
        
        return netWorth;
    }

    /**
     * Shows the deposit/withdraw modal
     * @param {string} accountId - ID of the account
     * @param {string} actionType - 'deposit' or 'withdraw'
     */
    static showDepositWithdrawModal(accountId, actionType) {
    const account = this.gameState.accounts.find(acc => acc.id === accountId);
    if (!account) return;

    

    // Get all eligible source accounts (for deposits only)
    const sourceAccounts = actionType === 'deposit' 
        ? this.gameState.accounts.filter(acc => 
            acc.id !== accountId && 
            acc.type !== 'investment' && 
            acc.balance > 0
        ) 
        : [];

    // Create the modal
    const modalHtml = `
        <div class="modal fade" id="actionModal" tabindex="-1" aria-hidden="true">
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
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmActionBtn">Confirm ${actionType}</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('actionModal'));
    modal.show();

    // Handle confirm button click
    document.getElementById('confirmActionBtn').addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('actionAmount').value);
        if (isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }

        if (amount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }

        if (actionType === 'deposit') {
            const sourceType = sourceAccounts.length > 0 
                ? document.getElementById('sourceType').value 
                : 'cash';
            this.depositToAccount(accountId, amount, `Deposit to ${account.name}`, sourceType);
        } else {
            this.withdrawFromAccount(accountId, amount, `Withdrawal from ${account.name}`);
        }

        // Clean up
        modal.hide();
        document.body.removeChild(modalContainer);
    });

    // Clean up when modal is closed
    document.getElementById('actionModal').addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modalContainer);
    });
}
    
    /**
     * Deposits money into a specific account
     * @param {string} accountId - ID of the account to deposit to
     * @param {number} amount - Amount to deposit
     * @param {string} [description='Deposit'] - Description of the deposit
     * @param {string} [source='cash'] - Source of funds ('cash' or account ID)
     * @returns {boolean} True if successful
     */
static depositToAccount(accountId, amount, description = 'Deposit', source = 'cash') {
    try {
        // Validate amount
        if (isNaN(amount)) {  // <-- Remove the extra parenthesis here
            alert('Please enter a valid amount');
            return false;
        }

        amount = parseFloat(amount);
        if (amount <= 0) {
            alert('Amount must be greater than 0');
            return false;
        }

        const account = this.gameState.accounts.find(acc => acc.id === accountId);
        if (!account) {
            alert('Target account not found');
            return false;
        }

        // Handle different source types
        if (source === 'cash') {
            // Get player's current cash from MainManager
            const currentCash = typeof MainManager?.getMoney === 'function' 
                ? MainManager.getMoney() 
                : 0;

            // Validate available funds
            if (currentCash < amount) {
                alert(`You don't have enough money for this deposit. You only have $${currentCash.toLocaleString()} available.`);
                return false;
            }

            // Deduct from cash and add to account
            if (typeof MainManager !== 'undefined' && MainManager.addMoney) {
                MainManager.addMoney(-amount);
                account.balance += amount;
                this.addTransaction('deposit', description, amount, 'deposit', accountId);
                EventManager.addToEventLog(`Deposited $${amount.toLocaleString()} to ${account.name}`, 'success');
                this.saveGameState();
                this.renderAll();
                return true;
            }
        } else {
            // Source is another account
            const sourceAccount = this.gameState.accounts.find(acc => acc.id === source);
            if (!sourceAccount) {
                alert('Source account not found');
                return false;
            }

            if (sourceAccount.balance < amount) {
                alert(`Insufficient funds in source account. Available balance: $${sourceAccount.balance.toLocaleString()}`);
                return false;
            }

            // Transfer between accounts
            sourceAccount.balance -= amount;
            account.balance += amount;
            
            // Record both transactions
            this.addTransaction('transfer', `Transfer to ${account.name}`, -amount, 'account_transfer', sourceAccount.id);
            this.addTransaction('deposit', description, amount, 'deposit', accountId);
            
            EventManager.addToEventLog(`Transferred $${amount.toLocaleString()} from ${sourceAccount.name} to ${account.name}`, 'success');
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

    /**
     * Withdraws money from a specific account
     * @param {string} accountId - ID of the account to withdraw from
     * @param {number} amount - Amount to withdraw
     * @param {string} [description='Withdrawal'] - Description of the withdrawal
     * @returns {boolean} True if successful
     */
    static withdrawFromAccount(accountId, amount, description = 'Withdrawal') {
        const account = this.gameState.accounts.find(acc => acc.id === accountId);
        if (!account) {
            console.error('Account not found');
            return false;
        }

        if (account.balance < amount) {
            alert(`Insufficient funds in this account. Available balance: $${account.balance.toLocaleString()}`);
            return false;
        }

        // For savings accounts, check minimum balance
        if (account.type === 'savings') {
            const minBalance = this.accountTypes.savings.minBalance;
            if ((account.balance - amount) < minBalance) {
                alert(`Savings accounts require a minimum balance of $${minBalance.toLocaleString()}`);
                return false;
            }
        }

        // For other accounts, just withdraw to cash
        account.balance -= amount;
        
        // Add money back to player's wallet
        if (typeof MainManager !== 'undefined' && MainManager.addMoney) {
            MainManager.addMoney(amount);
        }

        this.addTransaction('transfer', description, -amount, 'withdrawal', accountId);
        
        EventManager.addToEventLog(`Withdrew $${amount.toLocaleString()} from ${account.name}`, 'success');
        return true;
    }
    
    /**
     * Handles time advancement (called from EventManager)
     * @param {Object} timeState - Current time state
     */
static handleTimeAdvanced(timeState) {
    try {
        // Ensure gameState is initialized
        if (!this.gameState) {
            this.log('Game state not initialized, loading...');
            this.loadGameState();
            
            if (!this.gameState) {
                this.gameState = this.getDefaultGameState();
                this.log('Created default game state');
            }
        }

        // Process interest on accounts
        this.gameState.accounts.forEach(account => {
            if (account.balance > 0) {
                let interestRate = this.accountTypes[account.type].interestRate;
                
                // Add volatility to investments
                if (account.type === 'investment') {
                    const marketFluctuation = (Math.random() * 0.1) - 0.05;
                    interestRate += marketFluctuation;
                    interestRate = Math.max(interestRate, -0.03);
                }
                
                const interest = account.balance * interestRate * timeState.monthsAdvanced;
                account.balance += interest;
                
                if (interest !== 0) {
                    this.addTransaction(
                        interest > 0 ? 'income' : 'expense', 
                        `${interest > 0 ? 'Interest' : 'Loss'} on ${account.name}`, 
                        Math.abs(interest), 
                        account.type === 'investment' ? 'investment_return' : 'interest', 
                        account.id
                    );
                }
            }
        });
        
        
        // Process salary payment if employed - quarterly (every 3 months)
        if (typeof CareerManager !== 'undefined' && 
            CareerManager.gameState && 
            CareerManager.gameState.currentJob) {
            
            const quartersAdvanced = Math.floor(timeState.monthsAdvanced / 3);
           // In handleTimeAdvanced method, replace the salary section with:
if (typeof CareerManager !== 'undefined' && 
    CareerManager.gameState && 
    CareerManager.gameState.currentJob) {
    
    const monthlySalary = CareerManager.gameState.currentJob.salary;
    
    // Progressive tax calculation (higher taxes)
    let taxRate = 0.20; // Base 20%
    if (monthlySalary > 5000) taxRate = 0.30;
    if (monthlySalary > 10000) taxRate = 0.40;
    
    const taxAmount = monthlySalary * taxRate;
    const netSalary = monthlySalary - taxAmount;
    
    const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
    const accountId = checkingAccounts.length > 0 
        ? checkingAccounts[0].id 
        : this.createDefaultCheckingAccount();
    
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
}
        }
        
        // Process monthly expenses (multiplied by months advanced)
        const monthlyExpenses = this.calculateMonthlyExpenses() * timeState.monthsAdvanced;
        if (monthlyExpenses > 0) {
            const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
            const accountId = checkingAccounts.length > 0 
                ? checkingAccounts[0].id 
                : this.createDefaultCheckingAccount();
            
            this.addTransaction(
                'expense', 
                'Monthly living expenses', 
                monthlyExpenses, 
                'living_expenses',
                accountId
            );
        }
        
        // Process quarterly events if we've advanced at least 3 months
        if (timeState.monthsAdvanced >= 3) {
            this.processQuarterlyEvents(timeState);
        }
        
        this.saveGameState();
        this.renderAll();
    } catch (error) {
        console.error('Error handling time advancement:', error);
        EventManager.addToEventLog('Error processing financial updates', 'danger');
    }
}
    
    /**
     * Creates a default checking account if none exists
     * @returns {string} The ID of the created or existing checking account
     */
    static createDefaultCheckingAccount() {
        const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
        if (checkingAccounts.length > 0) {
            return checkingAccounts[0].id;
        }
        
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
    
    /**
     * Processes quarterly financial events
     * @param {Object} timeState - Current time state
     */
static processQuarterlyEvents(timeState) {
    try {
        this.log('Processing quarterly financial events');
        
        // 1. Process quarterly investment returns with fees
        const investmentAccounts = this.gameState.accounts.filter(acc => acc.type === 'investment');
        investmentAccounts.forEach(account => {
            if (account.balance > 0) {
                // Apply 1% management fee
                const fee = account.balance * 0.01;
                account.balance -= fee;
                this.addTransaction('expense', 
                    `Investment management fee - ${account.name}`, 
                    fee, 
                    'investment_fee', 
                    account.id
                );
                
                // Apply investment return (with more volatility)
                const baseReturn = this.accountTypes.investment.interestRate;
                const quarterlyReturn = account.balance * ((baseReturn / 4) + (Math.random() * 0.1 - 0.05));
                account.balance += quarterlyReturn;
                
                if (quarterlyReturn !== 0) {
                    this.addTransaction(
                        quarterlyReturn > 0 ? 'income' : 'expense', 
                        `Quarterly investment ${quarterlyReturn > 0 ? 'return' : 'loss'} - ${account.name}`, 
                        Math.abs(quarterlyReturn), 
                        'investment_return', 
                        account.id
                    );
                }
            }
        });
        
        // 2. Process quarterly bonus (10-15% of quarterly salary)
        if (typeof CareerManager !== 'undefined' && CareerManager.gameState?.currentJob) {
    const quarterlySalary = CareerManager.gameState.currentJob.salary * 3;
    const bonusChance = 0.4; // Reduced from 0.7 (40% chance)
    const bonusAmount = quarterlySalary * (0.05 + (Math.random() * 0.05)); // 5-10% of quarterly salary
    
    if (Math.random() < bonusChance) {
                const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
                const accountId = checkingAccounts.length > 0 ? checkingAccounts[0].id : null;
                
                this.addTransaction('income', 'Quarterly performance bonus', bonusAmount, 'bonus', accountId);
                EventManager.addToEventLog(
                    `Received $${bonusAmount.toLocaleString()} quarterly bonus!`,
                    'success'
                );
            }
        }
        
        // 3. Process asset depreciation (5% quarterly)
     // In processQuarterlyEvents method:
this.gameState.assets.forEach(asset => {
    if (asset.currentValue > asset.purchasePrice * 0.1) {
        const depreciation = asset.currentValue * 0.075; // Increased from 0.05 (7.5%)
        asset.currentValue -= depreciation;
        asset.currentValue = Math.max(asset.currentValue, asset.purchasePrice * 0.1);
        
        this.addTransaction('expense', `Depreciation - ${asset.name}`, 
                          depreciation, 'asset_depreciation');
    }
});
        
        // 4. Process quarterly account fees for accounts below minimum balance
        this.gameState.accounts.forEach(account => {
            const minBalance = this.accountTypes[account.type]?.minBalance || 0;
            if (account.balance < minBalance) {
                const fee = 25; // $25 quarterly fee
                account.balance -= fee;
                
                this.addTransaction('expense', `Low balance fee - ${account.name}`, 
                                  fee, 'account_fee', account.id);
                EventManager.addToEventLog(
                    `Charged $${fee.toLocaleString()} fee for low balance in ${account.name}`,
                    'danger'
                );
            }
        });
        
        this.saveGameState();
        this.renderAll();
        
    } catch (error) {
        this.log('Error processing quarterly events:', error);
        EventManager.addToEventLog('Error processing quarterly financial events', 'danger');
    }

    this.gameState.transactions
    .filter(tx => ['living_expenses', 'recurring_expense'].includes(tx.category))
    .forEach(tx => {
        tx.amount *= 1.01;
    });
EventManager.addToEventLog("Prices increased due to inflation (1%)", 'warning');

    
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
        
        // Filter accounts by type
        const bankAccounts = this.gameState.accounts.filter(acc => 
            acc.type === 'checking' || acc.type === 'savings'
        );
        
        const investmentAccounts = this.gameState.accounts.filter(acc => 
            acc.type === 'investment'
        );
        
        // Render bank accounts
        if (bankAccounts.length === 0) {
            this.elements.bankAccountsContainer.innerHTML = `
                <div class="alert alert-info">No bank accounts yet.</div>
            `;
        } else {
            this.elements.bankAccountsContainer.innerHTML = bankAccounts.map(account => `
                <div class="account-card" data-account-id="${account.id}">
                    <div class="account-header">
                        <div>
                            <div class="account-name">${account.name}</div>
                            <div class="account-type">${this.accountTypes[account.type].name}</div>
                        </div>
                        <span class="badge bg-${account.type === 'checking' ? 'primary' : 'success'}">${account.type}</span>
                    </div>
                    <div class="account-balance">$${account.balance.toLocaleString()}</div>
                    <div class="text-muted small">Opened: ${account.openedDate}</div>
                    <div class="account-actions mt-2">
                        <button class="btn btn-sm btn-outline-primary deposit-btn">Deposit</button>
                        <button class="btn btn-sm btn-outline-secondary withdraw-btn">Withdraw</button>
                    </div>
                </div>
            `).join('');
        }
        
        // Render investment accounts
        if (investmentAccounts.length === 0) {
            this.elements.investmentsContainer.innerHTML = `
                <div class="alert alert-info">No investment accounts yet.</div>
            `;
        } else {
            this.elements.investmentsContainer.innerHTML = investmentAccounts.map(account => `
                <div class="account-card" data-account-id="${account.id}">
                    <div class="account-header">
                        <div>
                            <div class="account-name">${account.name}</div>
                            <div class="account-type">${this.accountTypes[account.type].name}</div>
                        </div>
                        <span class="badge bg-purple">${account.type}</span>
                    </div>
                    <div class="account-balance">$${account.balance.toLocaleString()}</div>
                    <div class="text-muted small">Opened: ${account.openedDate}</div>
                    <div class="account-actions mt-2">
                        <button class="btn btn-sm btn-outline-primary deposit-btn">Deposit</button>
                        <button class="btn btn-sm btn-outline-secondary withdraw-btn">Withdraw</button>
                    </div>
                </div>
            `).join('');
        }
        
        // Add event listeners for the new buttons
        document.querySelectorAll('.deposit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const accountCard = e.target.closest('.account-card');
                const accountId = accountCard.dataset.accountId;
                this.showDepositWithdrawModal(accountId, 'deposit');
            });
        });
        
        document.querySelectorAll('.withdraw-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const accountCard = e.target.closest('.account-card');
                const accountId = accountCard.dataset.accountId;
                this.showDepositWithdrawModal(accountId, 'withdraw');
            });
        });
        
        // Render assets
        if (this.gameState.assets.length === 0) {
            this.elements.assetsContainer.innerHTML = `
                <div class="alert alert-info">No assets yet.</div>
            `;
        } else {
            this.elements.assetsContainer.innerHTML = this.gameState.assets.map(asset => `
                <div class="account-card">
                    <div class="account-header">
                        <div>
                            <div class="account-name">${asset.name}</div>
                            <div class="account-type">${this.assetCategories[asset.category] || 'Asset'}</div>
                        </div>
                        <span class="badge bg-warning text-dark">Asset</span>
                    </div>
                    <div class="account-balance">Value: $${asset.currentValue?.toLocaleString() || asset.purchasePrice.toLocaleString()}</div>
                    <div class="text-muted small">Purchased: ${asset.purchaseDate}</div>
                    <div class="account-actions">
                        <button class="btn btn-sm btn-outline-danger">Sell</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    static renderTransactions() {
        if (!this.elements.transactionsList) return;
        
        if (this.gameState.transactions.length === 0) {
            this.elements.transactionsList.innerHTML = `
                <div class="list-group-item">No transactions yet</div>
            `;
            return;
        }
        
        this.elements.transactionsList.innerHTML = this.gameState.transactions.slice(0, 10).map(txn => `
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
        
        // Get financial events from EventManager if available
        let events = [];
        if (typeof EventManager !== 'undefined' && EventManager.getEvents) {
            events = EventManager.getEvents().filter(event => 
                event.message.includes('$') || 
                event.message.includes('salary') || 
                event.message.includes('purchased') ||
                event.message.includes('account')
            );
        }
        
        if (events.length === 0) {
            this.elements.financialEventLog.innerHTML = `
                <div class="list-group-item">No financial events yet</div>
            `;
            return;
        }
        
        this.elements.financialEventLog.innerHTML = events.slice(0, 10).map(event => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <span>${event.message}</span>
                    <small class="text-muted">${new Date(parseInt(event.timestamp)).toLocaleTimeString()}</small>
                </div>
            </div>
        `).join('');
    }
    
   static updateFinancialStats() {
    if (!this.elements.moneyDisplay) return;
    
    const totalBalance = this.calculateTotalBalance();
    const monthlyIncome = this.calculateMonthlyIncome();
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const netWorth = this.calculateNetWorth();
    const cashFlow = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (cashFlow / monthlyIncome) * 100 : 0;
    
    // Calculate quarterly salary projection
    let quarterlySalary = 0;
    let bonusPotential = 0;
    if (typeof CareerManager !== 'undefined' && CareerManager.gameState?.currentJob) {
        quarterlySalary = CareerManager.gameState.currentJob.salary * 3;
        bonusPotential = quarterlySalary * 0.125; // Average 12.5% bonus
    }
    
    // Update displays with proper formatting
  if (this.elements.incomeDisplay) {
    const baseSalary = CareerManager.gameState?.currentJob?.salary || 0;
    this.elements.incomeDisplay.innerHTML = `
        $${Math.round(monthlyIncome).toLocaleString()}/month<br>
        <small class="text-muted">(Base salary: $${baseSalary.toLocaleString()}/month, 
        $${Math.round(baseSalary * 3).toLocaleString()} quarterly + $${Math.round(bonusPotential).toLocaleString()} potential bonus)</small>
    `;
}
    if (this.elements.expensesDisplay) this.elements.expensesDisplay.textContent = `$${Math.round(monthlyExpenses).toLocaleString()}/month`;
    if (this.elements.netWorthDisplay) this.elements.netWorthDisplay.textContent = `$${Math.round(netWorth).toLocaleString()}`;
    if (this.elements.cashFlowDisplay) this.elements.cashFlowDisplay.textContent = `$${Math.round(cashFlow).toLocaleString()}`;
    if (this.elements.savingsRateDisplay) this.elements.savingsRateDisplay.textContent = `${Math.round(savingsRate)}%`;
    if (this.elements.debtRatioDisplay) this.elements.debtRatioDisplay.textContent = '0%'; // Placeholder for future debt system
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

    /**
     * Gets the current financial state
     * @returns {Object} Financial state
     */
    static getFinancialState() {
        return {
            totalBalance: this.calculateTotalBalance(),
            monthlyIncome: this.calculateMonthlyIncome(),
            monthlyExpenses: this.calculateMonthlyExpenses(),
            netWorth: this.calculateNetWorth(),
            accounts: [...this.gameState.accounts],
            assets: [...this.gameState.assets]
        };
    }

    /**
     * Makes a purchase if sufficient funds are available
     * @param {number} amount - Purchase amount
     * @param {string} description - Purchase description
     * @returns {boolean} True if purchase was successful
     */
    static makePurchase(amount, description) {
        const totalBalance = this.calculateTotalBalance();
        
        if (totalBalance >= amount) {
            // Deduct from accounts (simple implementation - could be enhanced to deduct from specific accounts)
            const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
            
            if (checkingAccounts.length > 0) {
                // Deduct from first checking account for simplicity
                checkingAccounts[0].balance -= amount;
            } else {
                // If no checking account, deduct from first available account
                this.gameState.accounts[0].balance -= amount;
            }
            
            this.addTransaction('expense', description, amount, 'purchase');
            this.saveGameState();
            this.renderAll();
            return true;
        }
        
        return false;
    }

    /**
     * Adds money to the player's financial accounts
     * @param {number} amount - Amount to add
     * @param {string} [description='Income'] - Description of the income
     * @param {string} [category='misc_income'] - Category of the income
     */
    static addMoney(amount, description = 'Income', category = 'misc_income') {
        // First try to add to a checking account
        const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
        
        if (checkingAccounts.length > 0) {
            checkingAccounts[0].balance += amount;
        } else if (this.gameState.accounts.length > 0) {
            // Fallback to any account if no checking account exists
            this.gameState.accounts[0].balance += amount;
        } else {
            // Create a default checking account if no accounts exist
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
        
        // Update MainManager's display if available
        if (typeof MainManager !== 'undefined' && MainManager.updateMoneyDisplay) {
            MainManager.updateMoneyDisplay();
        }
    }

    /**
     * Purchases an asset and adds it to the inventory
     * @param {string} name - Asset name
     * @param {number} purchasePrice - Purchase price
     * @param {string} category - Asset category
     * @param {number} [maintenanceCost=0] - Monthly maintenance cost
     * @returns {boolean} True if purchase was successful
     */
    static purchaseAsset(name, purchasePrice, category, maintenanceCost = 0) {
        if (!this.makePurchase(purchasePrice, `Purchased ${name}`)) {
            return false;
        }
        
        const newAsset = {
            id: 'asset-' + Date.now(),
            name,
            category,
            purchasePrice,
            currentValue: purchasePrice * 0.9, // Assets depreciate slightly immediately
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