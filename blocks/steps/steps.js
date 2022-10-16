export default function decorate(block, blockName) {
  /* apply classes to elements */
  const applyClasses = (elements, classNames) => {
    elements.forEach((cell, i) => {
      cell.className = classNames[i] ? `${blockName}-${classNames[i]}` : '';
    });
  };

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row, idx) => {
    const li = document.createElement('li');
    const step = document.createElement('div');
    const stepTxt = document.createElement('p');
    stepTxt.textContent = `Step ${idx + 1}`;
    step.append(stepTxt);
    li.append(step);
    li.append(row);
    applyClasses([...li.children], ['step', 'body']);
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
