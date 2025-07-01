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
            interestRate: 0.0005, // 0.6% annual
            minBalance: 0,
            color: '#0d6efd',
            monthlyFee: 5, // Monthly maintenance fee
            canWithdraw: true
        },
        savings: {
            name: "Savings Account",
            interestRate: 0.0015, // 1.8% annual
            minBalance: 500, // Higher minimum balance
            color: '#198754',
            monthlyFee: 0,
            canWithdraw: true,
            withdrawalLimit: 3 // Limited withdrawals per month
        },
        investment: {
            name: "Investment Account",
            interestRate: 0.005, // 6% annual (with volatility)
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
    
    /**
     * Syncs financial data with career information
     */
    static syncWithCareer() {
        if (typeof CareerManager !== 'undefined' && CareerManager.gameState) {
            this.log('Syncing with career data...');
            
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
                        CareerManager.gameState.currentJob.salary * 0.7, // 30% tax
                        'salary',
                        accountId
                    );
                }
            }
            
            this.renderAll();
        }
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
    
    static handleCareerUpdate() {
        this.log('Handling career update...');
        this.syncWithCareer();
        this.renderAll();
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
        
        // Check if player has enough money
        if (typeof MainManager !== 'undefined' && MainManager.getMoney) {
            const currentMoney = MainManager.getMoney();
            if (currentMoney < initialDeposit) {
                alert(`You don't have enough money for this deposit (need $${initialDeposit}, have $${currentMoney})`);
                return;
            }
            MainManager.addMoney(-initialDeposit);
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
        
        this.addTransaction('account', 'Deposit to new account', initialDeposit, 'initial_deposit');
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
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        const modal = new bootstrap.Modal(document.getElementById('actionModal'));
        modal.show();
        
        document.getElementById('confirmActionBtn').addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('actionAmount').value);
            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid amount greater than 0');
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
            
            modal.hide();
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('actionModal').addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
        });
    }
    
    static depositToAccount(accountId, amount, description = 'Deposit', source = 'cash') {
        try {
            if (isNaN(amount)) {
                alert('Please enter a valid amount');
                return false;
            }
            
            amount = parseFloat(amount);
            if (amount <= 0) return false;
            
            const account = this.gameState.accounts.find(acc => acc.id === accountId);
            if (!account) {
                alert('Target account not found');
                return false;
            }
            
            if (source === 'cash') {
                const currentCash = typeof MainManager?.getMoney === 'function' 
                    ? MainManager.getMoney() 
                    : 0;
                
                if (currentCash < amount) {
                    alert(`You don't have enough money for this deposit. You only have $${currentCash.toLocaleString()} available.`);
                    return false;
                }
                
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
                const sourceAccount = this.gameState.accounts.find(acc => acc.id === source);
                if (!sourceAccount) {
                    alert('Source account not found');
                    return false;
                }
                
                if (sourceAccount.balance < amount) {
                    alert(`Insufficient funds in source account. Available balance: $${sourceAccount.balance.toLocaleString()}`);
                    return false;
                }
                
                sourceAccount.balance -= amount;
                account.balance += amount;
                
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
        }
        
        account.balance -= amount;
        
        if (typeof MainManager !== 'undefined' && MainManager.addMoney) {
            MainManager.addMoney(amount);
        }
        
        this.addTransaction('withdrawal', description, -amount, 'withdrawal', accountId);
        
        EventManager.addToEventLog(`Withdrew $${amount.toLocaleString()} from ${account.name}`, 'success');
        return true;
    }
    
    // ===================================================================
    // TIME ADVANCEMENT
    // ===================================================================
    
    static handleTimeAdvanced(timeState) {
        try {
            if (!this.gameState) {
                this.loadGameState();
                if (!this.gameState) {
                    this.gameState = this.getDefaultGameState();
                }
            }
            
            // Process monthly events for each month advanced
            for (let i = 0; i < timeState.monthsAdvanced; i++) {
                this.processMonthlyEvents();
                
                // Process quarterly events every 3 months
                if ((timeState.currentMonth + i) % 3 === 0) {
                    this.processQuarterlyEvents();
                }
            }
            
            this.saveGameState();
            this.renderAll();
        } catch (error) {
            console.error('Error handling time advancement:', error);
            EventManager.addToEventLog('Error processing financial updates', 'danger');
        }
    }
    
    static processMonthlyEvents() {
        // Process salary payment
        if (typeof CareerManager !== 'undefined' && CareerManager.gameState?.currentJob) {
            const monthlySalary = CareerManager.gameState.currentJob.salary;
            const taxRate = this.calculateTaxRate(monthlySalary);
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
        
        // Process monthly expenses
        const monthlyExpenses = this.calculateMonthlyExpenses();
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
        
        // Process account interest
        this.gameState.accounts.forEach(account => {
            if (account.balance > 0) {
                let interestRate = this.accountTypes[account.type].interestRate;
                
                // Add volatility to investments
                if (account.type === 'investment') {
                    const marketFluctuation = (Math.random() * 0.1) - 0.05;
                    interestRate += marketFluctuation;
                    interestRate = Math.max(interestRate, -0.03); // Cap losses at 3%
                }
                
                const interest = account.balance * interestRate;
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
            
            // Charge monthly account fees
            const fee = this.accountTypes[account.type].monthlyFee || 0;
            if (fee > 0) {
                account.balance -= fee;
                this.addTransaction('expense', `Monthly fee - ${account.name}`, fee, 'account_fee', account.id);
            }
        });
        
        // Reset monthly withdrawal counters for savings accounts
        const currentMonth = new Date().toISOString().slice(0, 7);
        Object.keys(this.gameState.accountWithdrawals).forEach(accountId => {
            this.gameState.accountWithdrawals[accountId][currentMonth] = 0;
        });
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
        if (income <= 3000) return 0.20; // 20% for lower incomes
        if (income <= 7000) return 0.30; // 30% for middle incomes
        return 0.40; // 40% for higher incomes
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
        if (!this.elements.moneyDisplay) return;
        
        const totalBalance = this.calculateTotalBalance();
        const monthlyIncome = this.calculateMonthlyIncome();
        const monthlyExpenses = this.calculateMonthlyExpenses();
        const netWorth = this.calculateNetWorth();
        const cashFlow = monthlyIncome - monthlyExpenses;
        const savingsRate = monthlyIncome > 0 ? (cashFlow / monthlyIncome) * 100 : 0;
        
        if (this.elements.incomeDisplay) {
            const baseSalary = CareerManager.gameState?.currentJob?.salary || 0;
            this.elements.incomeDisplay.innerHTML = `
                $${Math.round(monthlyIncome).toLocaleString()}/month<br>
                <small class="text-muted">(Base salary: $${baseSalary.toLocaleString()}/month)</small>
            `;
        }
        
        if (this.elements.expensesDisplay) this.elements.expensesDisplay.textContent = `$${Math.round(monthlyExpenses).toLocaleString()}/month`;
        if (this.elements.netWorthDisplay) this.elements.netWorthDisplay.textContent = `$${Math.round(netWorth).toLocaleString()}`;
        if (this.elements.cashFlowDisplay) this.elements.cashFlowDisplay.textContent = `$${Math.round(cashFlow).toLocaleString()}`;
        if (this.elements.savingsRateDisplay) this.elements.savingsRateDisplay.textContent = `${Math.round(savingsRate)}%`;
        if (this.elements.debtRatioDisplay) this.elements.debtRatioDisplay.textContent = '0%';
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
        return {
            totalBalance: this.calculateTotalBalance(),
            monthlyIncome: this.calculateMonthlyIncome(),
            monthlyExpenses: this.calculateMonthlyExpenses(),
            netWorth: this.calculateNetWorth(),
            accounts: [...this.gameState.accounts],
            assets: [...this.gameState.assets]
        };
    }
    
    static makePurchase(amount, description) {
        const totalBalance = this.calculateTotalBalance();
        
        if (totalBalance >= amount) {
            const checkingAccounts = this.gameState.accounts.filter(acc => acc.type === 'checking');
            
            if (checkingAccounts.length > 0) {
                checkingAccounts[0].balance -= amount;
            } else {
                this.gameState.accounts[0].balance -= amount;
            }
            
            this.addTransaction('expense', description, amount, 'purchase');
            this.saveGameState();
            this.renderAll();
            return true;
        }
        
        return false;
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