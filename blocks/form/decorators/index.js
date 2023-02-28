export default async function decorateForm(form) {
  const { id } = form;
  if (id.toLowerCase() === 'repayments-calculator') {
    const decorateRepaymentsCalculator = (await import(`./${id}.js`)).default;
    decorateRepaymentsCalculator(form);
  }
}
