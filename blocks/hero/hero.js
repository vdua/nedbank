export default async function decorate(block) {
  block.querySelectorAll(':scope > div > div').forEach(() => {

  });
  const heroPic = block.querySelector(':scope picture');
  if (heroPic) {
    block.querySelector(':scope > div').append(heroPic);
  }
  return block;
}
