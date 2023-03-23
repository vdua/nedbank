const NEDBANK_HOST = 'personal.nedbank.co.za';
const NEDBANK_HOME_PAGE = `https://${NEDBANK_HOST}/home.html`;

function appendStyles() {
  [
    '/blocks/header/nb-clientlibs-base.css',
    '/blocks/header/nb-clientlibs-site.css',
  ].forEach((item) => {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = item;
    document.head.append(style);
  });
}

function appendScripts(doc) {
  doc.querySelectorAll('script').forEach((item) => {
    let script = document.createElement('script');
    if (item.src) {
      const url = new URL(item.src);
      if (url.host === document.location.host) {
        url.host = NEDBANK_HOST;
        url.port = '';
        url.protocol = 'https';
      }
      script.src = url.href;
      script.async = false;
    } else {
      script = item;
    }
    document.head.appendChild(script);
    item.remove();
  });
}

export function toggleHamburger() {
  document.querySelector('.nbd-hamburger-menu-wrapper').classList.toggle('displayHide');
  document.querySelectorAll('.nbd-hamburger-menu-desk').forEach((item) => {
    item.classList.toggle('displayHide');
  });
  if (window.screen.width < 1025) {
    document.querySelector('.nbd-hamburger-menu-mob > .nbd-hm-l1-wrapper').classList.remove('displayHide');
  } else {
    document.querySelector('.nbd-hamburger-menu-mob > .nbd-hm-l1-wrapper').classList.add('displayHide');
  }
}

export async function loadNavTools() {
  const resp = await fetch(NEDBANK_HOME_PAGE);
  if (resp.ok) {
    const fetchedHtml = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(fetchedHtml, 'text/html');
    appendStyles(doc);
    appendScripts(doc);

    doc.querySelectorAll('img').forEach((img) => {
      if (img.src) {
        img.src = `https://${NEDBANK_HOST}/${new URL(img.src).pathname}`;
      }
    });

    doc.querySelectorAll('a').forEach((a) => {
      if (a.href) {
        const { pathname } = new URL(a.href);
        // Rewrite urls except home page wince its already on Franklin
        if (!pathname.includes('/content/nedbank/za/en/personal/home')) {
          a.href = `https://${NEDBANK_HOST}${pathname}`;
        }
      }
    });

    const hamburgerModal = doc.querySelector('.nbd-hamburger-menu-wrapper');
    hamburgerModal.classList.add('displayHide');
    hamburgerModal.querySelectorAll('.nbd-hamburger-menu-desk').forEach((item) => {
      item.classList.add('displayHide');
    });

    document.body.appendChild(hamburgerModal);
    document.querySelector('.nbd-hamburger-close-icon').addEventListener('click', () => {
      document.querySelector('.nav-hamburger').click();
    });
  }
}

// TODO Avoiding clientlib errors for now. Eventually clientlibs logic needs to be ported.
(function avoidClientlibErrors() {
  // eslint-disable-next-line func-names
  window.debounce = function (b, g) {
    let d;
    // eslint-disable-next-line func-names
    return function () {
      const h = this;
      // eslint-disable-next-line prefer-rest-params
      const f = arguments;
      clearTimeout(d);
      d = setTimeout(() => b.apply(h, f), g);
    };
  };
}());
