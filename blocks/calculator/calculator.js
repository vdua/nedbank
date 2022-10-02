export default async function decorate(block) {
    const calculatorDiv = document.createElement('div');
    calculatorDiv.classList.add('calculator');

    const leftPanel = document.createElement('div');
    leftPanel.classList.add('left-panel');
    const rtPanel = document.createElement('div');
    rtPanel.classList.add('right-panel');
    calculatorDiv.appendChild(leftPanel);
    calculatorDiv.appendChild(rtPanel);

    const form = document.createElement('form');

    const borrowAmtLbl = document.createElement('p');
    borrowAmtLbl.textContent = 'How much do you want to borrow?';
    form.appendChild(borrowAmtLbl);

    const borrowAmtInputDiv = document.createElement('div');

    const borrowAmtInput = document.createElement('input');
    borrowAmtInput.setAttribute('type', 'text');
    borrowAmtInputDiv.appendChild(borrowAmtInput);

    const borrowAmtInputDesc = document.createElement('div');
    borrowAmtInputDesc.classList.add('field-desc');
    borrowAmtInputDesc.classList.add('text-muted');
    borrowAmtInputDesc.textContent = 'Enter an amount between R2,000 and R300,000';
    borrowAmtInputDiv.appendChild(borrowAmtInputDesc);

    form.appendChild(borrowAmtInputDiv);

    const repaymentTermLbl = document.createElement('p');
    repaymentTermLbl.textContent = 'What’s your preferred repayment term?';
    form.appendChild(repaymentTermLbl);
    const repaymentTermInput = document.createElement('input');
    repaymentTermInput.setAttribute('type', 'range');
    form.appendChild(repaymentTermInput);

    const includeRepaymentLbl = document.createElement('p');
    includeRepaymentLbl.textContent = 'Include insurance in your repayment';
    form.appendChild(includeRepaymentLbl);

    const includeRepaymentYes = document.createElement('input');
    includeRepaymentYes.setAttribute('type', 'radio');
    includeRepaymentYes.setAttribute('name', 'personalInsurance');
    includeRepaymentYes.setAttribute('id', 'personal-insurance-yes');
    form.appendChild(includeRepaymentYes);

    const includeRepaymentYesLbl = document.createElement('label');
    includeRepaymentYesLbl.setAttribute('for', 'personal-insurance-yes');
    includeRepaymentYesLbl.textContent = 'Add R74.25 to the loan amount for insurance';
    form.appendChild(includeRepaymentYesLbl);

    form.appendChild(document.createElement('br'));

    const includeRepaymentNo = document.createElement('input');
    includeRepaymentNo.setAttribute('type', 'radio');
    includeRepaymentNo.setAttribute('name', 'personalInsurance');
    includeRepaymentNo.setAttribute('id', 'personal-insurance-no');
    form.appendChild(includeRepaymentNo);

    const includeRepaymentNoLbl = document.createElement('label');
    includeRepaymentNoLbl.setAttribute('for', 'personal-insurance-no');
    includeRepaymentNoLbl.textContent = 'I have my own insurance';
    form.appendChild(includeRepaymentNoLbl);
    leftPanel.appendChild(form);

    const resultPanel = document.createElement('div');
    resultPanel.classList.add('result-panel');

    const paybackAmtLbl = document.createElement('p');
    paybackAmtLbl.textContent = 'How much you’ll pay back each month?';
    resultPanel.appendChild(paybackAmtLbl);

    const paybackAmt = document.createElement('p');
    paybackAmt.classList.add('calulated-value');
    paybackAmt.classList.add('green');
    paybackAmt.textContent = 'R190.18';
    resultPanel.appendChild(paybackAmt);

    const paybackAmtTotalLbl = document.createElement('p');
    paybackAmtTotalLbl.textContent = 'How much you’ll pay back in total';
    resultPanel.appendChild(paybackAmtTotalLbl);

    const paybackTotalAmt = document.createElement('p');
    paybackTotalAmt.classList.add('calulated-value');
    paybackTotalAmt.textContent = 'R4,564.32';
    resultPanel.appendChild(paybackTotalAmt);

    const exampleInterestLbl = document.createElement('p');
    exampleInterestLbl.textContent = 'Example interest rate';
    resultPanel.appendChild(exampleInterestLbl);

    const exampleInterest = document.createElement('input');
    exampleInterest.setAttribute('type', 'range');
    resultPanel.appendChild(exampleInterest);

    const message = document.createElement('p');
    message.textContent = 'On average, South Africans will pay interest of 18.25% to 25.75%. We’ll offer you an interest rate based on your payment history and risk profile.';
    resultPanel.appendChild(message);
    rtPanel.appendChild(resultPanel);

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('actions');
    actionsDiv.classList.add('button-container');
    const loanDtls = document.createElement('p');
    const loanDtlsLink = document.createElement('a');
    loanDtlsLink.setAttribute('href', '#');
    loanDtlsLink.textContent = 'See loan detail';
    loanDtls.appendChild(loanDtlsLink);
    actionsDiv.appendChild(loanDtls);

    const loanApp = document.createElement('p');
    loanApp.classList.add('button-container');
    const loanAppLink = document.createElement('a');
    loanAppLink.classList.add('button');
    loanAppLink.classList.add('primary');
    loanAppLink.setAttribute('href', '#');
    loanAppLink.textContent = 'Start loan application';
    loanApp.appendChild(loanAppLink);
    actionsDiv.appendChild(loanApp);

    rtPanel.appendChild(actionsDiv);

    block.innerHTML = '';
    block.appendChild(calculatorDiv);

}

