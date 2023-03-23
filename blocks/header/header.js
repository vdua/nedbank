import {
  readBlockConfig, decorateIcons, makeLinksRelative, getRootPath,
} from '../../scripts/scripts.js';

import {
  loadNavTools,
  toggleHamburger,
} from './nav-utils.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

function injectNavTool(tools, name, icon, type) {
  let tool;
  if (type === 'primary-nav') {
    tool = `
    <span>${name}</span>
    <img src='/icons/${icon}.svg'></img>
`;
  } else {
    tool = `
    <img src='/icons/${icon}.svg'></img>
`;
  }

  const div = document.createElement('div');
  div.classList.add(`nav-tools-${name.toLowerCase()}`);
  div.innerHTML = tool;
  tools.append(div);
}

function injectNavTools(nav, type) {
  const tools = nav.querySelector(':scope > .nav-tools');
  tools.innerHTML = '';
  injectNavTool(tools, 'Search', 'search', type);
  injectNavTool(tools, 'Login', 'lock', type);
}

function addLoginEventListener(nav) {
  const loginButton = nav.querySelector('.nav-tools-login');

  if (loginButton) {
    loginButton.addEventListener('click', () => {
      const loginEle = document.querySelector('.login-overlay');
      const bodyEle = document.querySelector('body');
      const eleDisplay = window.getComputedStyle(loginEle).getPropertyValue('display');

      if (eleDisplay === 'none') {
        loginEle.classList.add('modal');
        window.scrollTo(0, 0); // Scrolling to Top
        bodyEle.classList.add('overflow-hidden');
      } else if (loginEle.classList.contains('modal')) {
        loginEle.classList.remove('modal');
        bodyEle.classList.remove('overflow-hidden');
      }
    });
  }
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

  injectNavTools(nav, type);

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

  addLoginEventListener(nav);
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  decorateIcons(nav);

  return nav;
}

async function delayedNavTools() {
  await loadNavTools();

  ['primary-nav', 'secondary-nav'].forEach((item) => {
    const nav = document.querySelector(item);
    const hamburger = nav.querySelector('.nav-hamburger');
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        document.body.classList.remove('overflowY-hidden');
      } else {
        document.body.classList.add('overflowY-hidden');
      }
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      toggleHamburger();
    });
  });
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

  // Delayed load to reduct TBT impact
  setTimeout(delayedNavTools, 3000);
}
