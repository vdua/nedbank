export default async function decorateForm(formTag, { form, fragments }) {
  const { id } = formTag;
  if (id.toLowerCase() === 'repayments-calculator') {
    const decorateRepaymentsCalculator = (await import(`./${id}.js`)).default;
    decorateRepaymentsCalculator(formTag, { form, fragments });
  }
}
