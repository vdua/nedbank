export default async function decorateForm(form) {
  const id = form.id.toLowerCase();
  if (id === 'repayments-calculator') {
    const decorateRepaymentsCalculator = (await import(`./${id}.js`)).default;
    decorateRepaymentsCalculator(form);
  }
}
