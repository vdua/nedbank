import { readBlockConfig, decorateIcons, decorateSections, getRootPath } from '../../scripts/scripts.js';

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
    footerLinkGroupsDiv.appendChild(footerLinkGroupDiv);
  });
  const parent = footer.querySelector(':scope > .footer-links > div');
  parent.innerHTML = '';
  parent.appendChild(footerLinkGroupsDiv);
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
  parent.appendChild(footerSocialDiv);
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
