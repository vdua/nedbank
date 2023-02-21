export default function decorate(block, blockName) {
    let closeButton = block.querySelector('.icon-close');
    closeButton.addEventListener('click', handleCloseButtonClick);
}

function handleCloseButtonClick(event) {
    let banner = document.querySelector('.banner-placeholder');
    banner.style.display = 'none';
    document.cookie = 'oldSitePopUpCookies=true';
    setCookie('oldSitePopUpCookies', true, 86400000, '/');
}

function setCookie(name, value, timeInMillis, path) {
    var date=new Date();
    date.setTime(date.getTime()+(timeInMillis));
    let expiry = `expires=${date.toGMTString()}`;
    let cookie = `${name}=${value}; ${expiry}; path=${path}; SameSite=None; Secure`;
    document.cookie = cookie;
}