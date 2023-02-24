// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
(function adobeotm() {
  const adobeotmscript = document.createElement('script');
  adobeotmscript.setAttribute('src', 'https://assets.adobedtm.com/6422e0f550a2/017d80491d7e/launch-1e8527b948f6-development.min.js');
  document.head.append(adobeotmscript);
}());
