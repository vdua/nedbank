import {
  readBlockConfig, decorateIcons, makeLinksRelative, getRootPath,
} from '../../scripts/scripts.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

// Method to decorate nav and primaryNav
function decorateNav(respTxt, type) {
  const html = respTxt;

  // decorate nav/primaryNav DOM
  const nav = document.createElement(type);
  nav.innerHTML = html;
  decorateIcons(nav);
  makeLinksRelative(nav);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((e, j) => {
    const section = nav.children[j];
    if (section) section.classList.add(`nav-${e}`);
  });

  const navSections = [...nav.children][1];
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('mouseover', () => {
        collapseAllNavSections(navSections);
        navSection.setAttribute('aria-expanded', 'true');
      });

      navSection.addEventListener('mouseleave', () => {
        collapseAllNavSections(navSections);
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    document.body.style.overflowY = expanded ? '' : 'hidden';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  decorateIcons(nav);

  return nav;
}

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // Fetch Primary Nav Content
  const primaryNav = cfg.primaryNav || `${getRootPath()}/primary-nav`;
  const primaryNavResp = await fetch(`${primaryNav}.plain.html`);

  // Fetch Secondary Nav Content
  const secNavPath = cfg.nav || `${getRootPath()}/secondary-nav`;
  const secNavResp = await fetch(`${secNavPath}.plain.html`);

  const navDiv = document.createElement('nav'); // Creating Nav element

  if (primaryNavResp.ok) {
    // decorating primary nav
    const html = await primaryNavResp.text();
    const nav = decorateNav(html, 'primary-nav', block);
    navDiv.append(nav);
  }

  if (secNavResp.ok) {
    // decorating secondary nav
    const html = await secNavResp.text();
    const nav = decorateNav(html, 'secondary-nav', block);
    navDiv.append(nav);
  }

  window.addEventListener('scroll', () => {
    if (window.screen.width >= 1025) {
      const element = document.querySelector('secondary-nav');
      if (element) {
        const section = document.querySelector('secondary-nav .nav-tools');

        if (document.documentElement.scrollTop >= element.offsetHeight) {
          element.classList.add('sticky');
          section.classList.add('display-flex');
          section.classList.remove('display-none');
        } else {
          element.classList.remove('sticky');
          section.classList.remove('display-flex');
          section.classList.add('display-none');
        }
      }
    }
  });

  block.append(navDiv);
}
