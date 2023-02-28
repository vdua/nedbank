import decorateSummary from './summary.js';

export default async function decorateForm(formTag, { form, fragments }, config) {
  const { id } = formTag;
  if (id.toLowerCase() === 'repayments-calculator') {
    const decorateRepaymentsCalculator = (await import(`./${id}.js`)).default;
    decorateRepaymentsCalculator(formTag, { form, fragments });
  }
  if (config.summary) {
    const summarySection = document.querySelector(`[data-id= "${config.summary}"]`);
    decorateSummary(formTag, summarySection);
  }
}
