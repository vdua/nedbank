import {
  readBlockConfig, decorateIcons, decorateSections, getRootPath, fetchDataAttributesAnchor,
} from '../../scripts/scripts.js';

export function decorateAnchor(element) {
  element.querySelectorAll('a').forEach((a) => {
    fetchDataAttributesAnchor(a);
  });
}

function decorateFooterLinks(footer) {
  let footerLinkGroup = [];
  const footerLinkGroups = [];
  const pattern = /h[1-9]/i;
  footer.querySelectorAll(':scope > .footer-links > div > *').forEach((item) => {
    if (item.tagName.match(pattern) && footerLinkGroup.length > 0) {
      footerLinkGroups.push(footerLinkGroup);
      footerLinkGroup = [];
    }
    footerLinkGroup.push(item);
  });
  if (footerLinkGroup.length > 0) {
    footerLinkGroups.push(footerLinkGroup);
  }
  const footerLinkGroupsDiv = document.createElement('div');
  footerLinkGroupsDiv.classList.add('footer-link-groups');
  footerLinkGroups.forEach((group) => {
    const footerLinkGroupDiv = document.createElement('div');
    footerLinkGroupDiv.classList.add('footer-link-group');
    group.forEach((item) => {
      footerLinkGroupDiv.appendChild(item);
    });
    footerLinkGroupDiv.querySelector('span.icon-down-arrow-f').classList.add('appear');
    footerLinkGroupDiv.querySelector('span.icon-up-arrow-f').classList.remove('appear');
    footerLinkGroupsDiv.appendChild(footerLinkGroupDiv);
    footerLinkGroupDiv.addEventListener('click', () => {
      if (footerLinkGroupDiv.querySelector('ul').classList.contains('appear')) {
        footerLinkGroupDiv.querySelector('ul').classList.remove('appear');
        footerLinkGroupDiv.querySelector('span.icon-down-arrow-f').classList.add('appear');
        footerLinkGroupDiv.querySelector('span.icon-up-arrow-f').classList.remove('appear');
      } else {
        footerLinkGroupsDiv.querySelectorAll('.footer-link-group').forEach((item) => {
          item.querySelector('ul').classList.remove('appear');
          item.querySelector('span.icon-down-arrow-f').classList.add('appear');
          item.querySelector('span.icon-up-arrow-f').classList.remove('appear');
        });
        footerLinkGroupDiv.querySelector('ul').classList.add('appear');
        footerLinkGroupDiv.querySelector('span.icon-up-arrow-f').classList.add('appear');
        footerLinkGroupDiv.querySelector('span.icon-down-arrow-f').classList.remove('appear');
      }
    });
  });
  const parent = footer.querySelector(':scope > .footer-links > div');
  if (parent) {
    parent.innerHTML = '';
    parent.appendChild(footerLinkGroupsDiv);
  }
}

function decorateFooterSocial(footer) {
  const pattern = /h[1-9]/i;
  const footerSocialDiv = document.createElement('div');
  footerSocialDiv.classList.add('footer-social-items');
  footer.querySelectorAll(':scope > .footer-social > div > *').forEach((item) => {
    if (!item.tagName.match(pattern)) {
      footerSocialDiv.appendChild(item);
    }
  });
  const parent = footer.querySelector(':scope > .footer-social > div');
  if (parent) {
    parent.appendChild(footerSocialDiv);
  }

  decorateAnchor(footerSocialDiv);
}
/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || `${getRootPath()}/footer`;
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;
  await decorateSections(footer);
  await decorateIcons(footer);
  decorateFooterLinks(footer);
  decorateFooterSocial(footer);
  block.append(footer);
}
