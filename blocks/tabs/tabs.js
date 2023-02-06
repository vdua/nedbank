// mobile vs desktop
const mediaQueryPhone = window.matchMedia('(max-width: 599px)');

function openTab(e) {
  const { target } = e;
  const selected = target.getAttribute('aria-selected') === 'true';
  let parent = target.parentNode;

  // accordion nested one level deeper
  if (parent.classList.contains('accordion')) parent = parent.parentNode;

  // no bubbling plz, stopPropagation wasn't working ¯\_(ツ)_/¯
  if (!target.classList.contains('tabs-title')) return;

  if (!selected) {
    // close all open tabs
    const openTitles = parent.querySelectorAll('.tabs-title[aria-selected="true"]');
    const openContent = parent.querySelectorAll('.tabs-content[aria-hidden="false"]');
    openTitles.forEach((tab) => tab.setAttribute('aria-selected', false));
    openContent.forEach((tab) => tab.setAttribute('aria-hidden', true));

    // open clicked tab
    target.setAttribute('aria-selected', true);
    const content = parent.querySelector(`[aria-labelledby="${target.id}"]`);
    content.setAttribute('aria-hidden', false);
  } else if ((mediaQueryPhone.matches && !parent.classList.contains('style-1') && !parent.classList.contains('style-2'))
    || parent.classList.contains('style-3')) {
    target.setAttribute('aria-selected', false);
    const content = parent.querySelector(`[aria-labelledby="${target.id}"]`);
    content.setAttribute('aria-hidden', true);
  }
}

export default function decorate(block) {
  [...block.children].forEach((tab) => {
    // setup tab title
    const title = tab.querySelector(':is(h2,h3,h4,h5,h6)');
    const open = title.querySelector('strong') !== null; // bold title indicates auto-open tab
    const titleElement = title;
    titleElement.innerHTML = title.textContent;
    titleElement.addEventListener('click', openTab);

    titleElement.classList.add('tabs-title');
    titleElement.setAttribute('aria-selected', open);

    // setup tab content
    const content = tab.querySelector('div');
    content.classList.add('tabs-content');
    content.setAttribute('aria-labelledby', titleElement.id);
    content.setAttribute('aria-hidden', !open);
    // move tab and content to block root
    block.append(titleElement, content);
    tab.remove();
  });
  // if no tabs are open, open first tab by default
  if (!block.querySelector('.tabs-title[aria-selected="true"]')) {
    block.querySelector('.tabs-title').setAttribute('aria-selected', true);
    block.querySelector('.tabs-title + .tabs-content').setAttribute('aria-hidden', false);
    block.querySelector('.tabs-dots-dot')?.setAttribute('aria-selected', true);
  }
  block.setAttribute('role', 'tablist');
}
