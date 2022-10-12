import {
  loadBlock, buildBlock, decorateBlock, readBlockConfig,
} from '../../scripts/scripts.js';

function buildRepayCalcTab(config) {
  const calc = document.createElement('div');

  calc.innerHTML = `
  <h4 id='repayment-calculator'>${config['repayment-calculator-title']}</h4>
  <p>${config['repayment-calculator-description']}</p>
  <div class='calculator'>
    <div class="left-panel">
      <form>
        <p>${config['repayment-calculator-amount-field-label']}</p>
        <div>
          <input type="text">
          <div class="field-desc text-muted">${config['repayment-calculator-amount-field-description']}</div>
        </div>
        <p>${config['repayment-calculator-term-field-label']}</p>
        <input type="range">
        <p>${config['repayment-calculator-insurance-field-label']}</p>
        <input type="radio" name="personalInsurance" id="personal-insurance-yes">
        <label for="personal-insurance-yes">Add R74.25 to the loan amount for insurance</label>
        <br>
        <input type="radio" name="personalInsurance" id="personal-insurance-no">
        <label for="personal-insurance-no">I have my own insurance</label>
      </form>
    </div>
    <div class="right-panel">
      <div class="result-panel">
        <p>How much you’ll pay back each month?</p>
        <p class="calulated-value green">R190.18</p>
        <p>How much you’ll pay back in total</p>
        <p class="calulated-value">R4,564.32</p>
        <p>Example interest rate</p>
        <input type="range">
        <p>On average, South Africans will pay interest of 18.25% to 25.75%. We’ll offer you an interest rate based on your payment history and risk profile.</p>
      </div>
      <div class="actions">
        <a href="#">See loan detail</a>
        <a class="button primary" href="#">Start loan application</a>
      </div>
    </div>
  </div>
  `;
  return calc;
}

function buildLoanCalcTab(config) {
  const calc = document.createElement('div');
  calc.innerHTML = `
      <h4 id='loan-consolidation-calculator'>${config['loan-consolidation-calculator-title']}</h4>
      <p>${config['loan-consolidation-calculator-description']}</p>
      <div class='calculator'>
      <div class="left-panel">
        <form>
          <p>Loan 1 Details</p>
          <p>What type of loan is it?</p>
          <input type="text">
          <p>Amount you still owe</p>
          <div>
            <input type="text">
            <div class="field-desc text-muted">Enter an amount between R2,000 and R300,000</div>
          </div>
          <p>What’s your preferred repayment term?</p>
          <input type="range">
          <p>Include insurance in your repayment</p>
          <input type="radio" name="personalInsurance" id="personal-insurance-yes">
          <label for="personal-insurance-yes">Add R74.25 to the loan amount for insurance</label>
          <br>
          <input type="radio" name="personalInsurance" id="personal-insurance-no">
          <label for="personal-insurance-no">I have my own insurance</label>
        </form>
      </div>
      <div class="right-panel">
        <div class="result-panel">
          <p>Total Amount</p>
          <p class="calulated-value">R20000</p>
          <p>How much you’ll pay back each month</p>
          <p class="calulated-value">R4,564.32</p>

          <p>How much you’ll be saving</p>
          <p>A single, easy to manage instalment will mean you spend less each month on fees.</p>

          <p>Example interest rate</p>
          <p class="calulated-value">19.25%</p>
        </div>
        <div class="actions">
          <a href="#">See loan detail</a>
          <a class="button primary" href="#">Get Started</a>
        </div>
      </div>
    </div>
  `;
  return calc;
}

export default async function decorate(block) {
  const blockCfg = readBlockConfig(block);
  block.innerHTML = '';
  const tabs = buildBlock('tabs', [[buildRepayCalcTab(blockCfg)], [buildLoanCalcTab(blockCfg)]]);
  tabs.classList.add('tabs');
  block.appendChild(tabs);
  decorateBlock(tabs);
  loadBlock(tabs);
  return tabs;
}
