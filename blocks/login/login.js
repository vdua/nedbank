import {
  decorateIcons, makeLinksRelative, decorateButtons, getRootPath,
} from '../../scripts/scripts.js';

export default async function decorate(block) {
  const resp = await fetch(`${getRootPath()}/login.plain.html`);
  if (resp && resp.status === 200) {
    const txt = await resp.text();
    block.innerHTML = txt;

    const loginHeader = document.createElement('div');
    loginHeader.classList.add('login-header');
    const overLayClose = block.querySelector('div p');
    loginHeader.appendChild(overLayClose);

    const loginMain = block.querySelector('.login-main');
    const loginParent = block.querySelector('div');
    loginParent.insertBefore(loginHeader, loginMain);

    if (overLayClose) {
      overLayClose.addEventListener('click', () => {
        const loginEle = document.querySelector('.login-overlay');
        const mainEle = document.querySelector('body');
        loginEle.classList.remove('modal');
        mainEle.classList.remove('overflow-hidden');
      });
    }

    makeLinksRelative(block);
    decorateIcons(block);
    decorateButtons(block);
  }
}
