// Get input elements
const loanAmountInput = document.getElementById('loanAmount');
const interestRateInput = document.getElementById('interestRate');
const loanTermInput = document.getElementById('loanTerm');
const calculateBtn = document.getElementById('calculateBtn');
const resultsSection = document.getElementById('resultsSection');
const errorMessage = document.getElementById('errorMessage');

// Get result elements
const monthlyPaymentEl = document.getElementById('monthlyPayment');
const totalInterestEl = document.getElementById('totalInterest');
const totalAmountEl = document.getElementById('totalAmount');
const tableBody = document.getElementById('tableBody');

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Calculate monthly payment using loan formula
// M = P * [r(1+r)^n] / [(1+r)^n - 1]
// M = Monthly payment
// P = Loan amount
// r = Monthly interest rate (annual rate / 12)
// n = Total number of payments (years * 12)
function calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;

    if (monthlyRate === 0) {
        // If interest rate is 0
        return principal / numberOfPayments;
    }

    const monthlyPayment = 
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return monthlyPayment;
}

// Generate amortization schedule
function generateAmortizationSchedule(principal, annualRate, years, monthlyPayment) {
    const schedule = [];
    let balance = principal;
    const monthlyRate = annualRate / 100 / 12;

    for (let i = 1; i <= years * 12; i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;

        // Avoid negative balance due to rounding
        if (balance < 0) balance = 0;

        schedule.push({
            paymentNumber: i,
            paymentAmount: monthlyPayment,
            principal: principalPayment,
            interest: interestPayment,
            balance: Math.max(balance, 0)
        });
    }

    return schedule;
}

// Display results
function displayResults(principal, annualRate, years) {
    // Validate inputs
    if (principal <= 0 || annualRate < 0 || years <= 0) {
        showError('Please enter valid values for all fields.');
        return;
    }

    errorMessage.style.display = 'none';

    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
    const totalPayment = monthlyPayment * years * 12;
    const totalInterest = totalPayment - principal;

    // Update summary cards
    monthlyPaymentEl.textContent = formatCurrency(monthlyPayment);
    totalInterestEl.textContent = formatCurrency(totalInterest);
    totalAmountEl.textContent = formatCurrency(totalPayment);

    // Generate and display amortization schedule
    const schedule = generateAmortizationSchedule(principal, annualRate, years, monthlyPayment);
    displayAmortizationTable(schedule);

    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display amortization table
function displayAmortizationTable(schedule) {
    tableBody.innerHTML = '';

    schedule.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>&#8358;${row.paymentNumber}</td>
            <td>&#8358;${formatCurrency(row.paymentAmount)}</td>
            <td>&#8358;${formatCurrency(row.principal)}</td>
            <td>&#8358;${formatCurrency(row.interest)}</td>
            <td>&#8358;${formatCurrency(row.balance)}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    resultsSection.style.display = 'none';
}

// Event listener for calculate button
calculateBtn.addEventListener('click', () => {
    const principal = parseFloat(loanAmountInput.value);
    const annualRate = parseFloat(interestRateInput.value);
    const years = parseFloat(loanTermInput.value);

    displayResults(principal, annualRate, years);
});

// Allow Enter key to calculate
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        calculateBtn.click();
    }
});

// Calculate on page load with default values
window.addEventListener('load', () => {
    calculateBtn.click();
});
