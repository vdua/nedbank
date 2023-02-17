function createTooltipHTML() {
  if (!document.getElementById('field-tooltip-text')) {
    const tooltip = document.createElement('div');
    tooltip.id = 'field-tooltip-text';
    tooltip.dataset.hidden = true;
    document.body.append(tooltip);
  }
}

function showTooltip(target, title) {
  const tooltip = document.getElementById('field-tooltip-text');
  tooltip.innerText = title;
  const targetPos = target.getBoundingClientRect();
  const tooltipPos = tooltip.getBoundingClientRect();

  let left = targetPos.left + (targetPos.width / 2) + window.scrollX - (tooltipPos.width / 2);
  let top = targetPos.top + window.scrollY - (tooltipPos.height + 10);
  let placement = 'top';

  if (left < 0) {
    placement = 'right';
    left = targetPos.left + targetPos.width + window.scrollX + 10;
    top = targetPos.top + (targetPos.height / 2) + window.scrollY - (tooltipPos.height / 2);
  }

  if (left + tooltipPos.width > document.documentElement.clientWidth) {
    placement = 'left';
    left = targetPos.left + window.scrollX - (tooltipPos.width + 10);
    top = targetPos.top + (targetPos.height / 2) + window.scrollY - (tooltipPos.height / 2);
  }

  if (top < 0) {
    placement = 'bottom';
    left = targetPos.left + (targetPos.width / 2) + window.scrollX - (tooltipPos.width / 2);
    top = targetPos.top + targetPos.height + window.scrollY + 10;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  tooltip.className = `field-tooltip-text ${placement}`;
  tooltip.dataset.hidden = false;
}

function createQuestionMark(title) {
  const button = document.createElement('button');
  button.dataset.text = title;
  button.setAttribute('aria-label', title);
  button.className = 'field-tooltip-icon';
  button.type = 'button';

  button.addEventListener('mouseenter', (event) => {
    createTooltipHTML(title);
    showTooltip(event.target, title);
    event.stopPropagation();
  });

  button.addEventListener('mouseleave', (event) => {
    const tooltip = document.getElementById('field-tooltip-text');
    tooltip.dataset.hidden = true;
    event.stopPropagation();
  });

  return button;
}

export default function decorateTooltips(form) {
  form.querySelectorAll('.field-label[title]').forEach((label) => {
    label.append(createQuestionMark(label.title));
    label.removeAttribute('title');
  });
}
