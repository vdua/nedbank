function setCookie(name, value, timeInMillis, path) {
  const date = new Date();
  date.setTime(date.getTime() + (timeInMillis));
  const expiry = `expires=${date.toGMTString()}`;
  const cookie = `${name}=${value}; ${expiry}; path=${path}; SameSite=None; Secure`;
  document.cookie = cookie;
}

function handleCloseButtonClick() {
  const banner = document.querySelector('.banner-placeholder');
  banner.classList.remove('appear');
  document.cookie = 'oldSitePopUpCookies=true';
  setCookie('oldSitePopUpCookies', true, 86400000, '/');
}

export default function decorate(block) {
  const closeButton = block.querySelector('.icon-close');
  closeButton.addEventListener('click', handleCloseButtonClick);
}
