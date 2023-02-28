import decorateSummary from './summary.js';

export default async function decorateForm(form, config) {
  const id = form.id.toLowerCase();
  if (id === 'repayments-calculator') {
    const decorateRepaymentsCalculator = (await import(`./${id}.js`)).default;
    decorateRepaymentsCalculator(form);
  }
  if (config.summary) {
    const summarySection = document.querySelector(`[data-id= "${config.summary}"]`);
    decorateSummary(form, summarySection);
  }
}
