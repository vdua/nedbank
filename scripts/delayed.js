// eslint-disable-next-line import/no-cycle
import {
  getLanguage,
  getMetadata,
  sampleRUM,
} from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

const LANG_DISPLAY_MAP = {
  en: 'English',
  de: 'German',
  fr: 'French',
  ko: 'Korean',
  es: 'Spanish',
  it: 'Italian',
  jp: 'Japanese',
  br: 'Breton',
};

function getSystemType() {
  let sysEnv = 'mobile';

  if (window.innerWidth > 1024) {
    sysEnv = 'desktop';
  } else if (window.innerWidth >= 768) {
    sysEnv = 'tablet';
  }

  return sysEnv;
}

function getWebsiteEnv() {
  const mainPath = document.location.origin;
  const hostName = document.location.hostname;
  if (hostName === 'localhost') {
    return 'development';
  }
  if (mainPath.endsWith('.page')) {
    return 'stage';
  }
  return 'production';
}

function getWebsiteInstanceId() {
  const mainPath = document.location.origin;
  const hostName = document.location.hostname;
  const name = 'nedbank';
  let env = '';

  if (hostName === 'localhost') {
    env = 'development';
  } else if (mainPath.endsWith('.page')) {
    env = 'stage';
  } else {
    env = 'prod';
  }
  return `${name}-${env}`;
}

function capitalizeFirstLetters(str) {
  const arr = str.split('-');

  for (let i = 0; i < arr.length; i += 1) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return arr.join(' ');
}

function createDigitalData() {
  if (!window.digitalData) {
    window.digitalData = {};
  }
  const templatePath = getMetadata('template-path');
  const templatePathSplit = templatePath ? templatePath.split('/') : [];
  const templateName = templatePathSplit.length ? templatePathSplit[templatePathSplit.length - 1] : '';
  const pagePath = window.location.pathname || '';
  const pagePathSplit = pagePath.split('/');

  const language = getLanguage() || 'en';
  const languagePageIndex = pagePathSplit.indexOf(language);
  const pageName = pagePathSplit[pagePathSplit.length - 1];
  const websiteEnvironment = getWebsiteEnv();
  const pageKeywords = getMetadata('keywords') || '';
  const primaryCategory = getMetadata('primary-category') || '';
  const websiteName = getMetadata('website-name') || 'Nedbank';
  const websiteInstanceID = getWebsiteInstanceId();
  const websiteID = document.location.host || 'personal.nedbank.co.za';
  const pageTitle = getMetadata('og:title') || '';
  const description = getMetadata('description') || '';
  const sysEnv = getSystemType();

  let pageHierarchy = '';
  let pageCategoryFromURL = '';
  let subCategory1 = '';
  let subCategory2 = '';
  let subCategory3 = '';
  let subCategory4 = '';
  let pageErrorType = '';

  if (languagePageIndex > -1) {
    const tempArray = pagePath.split('/').slice(languagePageIndex + 1);
    pageHierarchy = tempArray.join(':');
    [pageCategoryFromURL] = tempArray;
    const tempArrayLength = tempArray.length;
    subCategory1 = tempArrayLength > 1 ? tempArray.splice(0, 2).join(':') : '';
    subCategory2 = tempArrayLength > 2 ? tempArray.splice(0, 3).join(':') : '';
    subCategory3 = tempArrayLength > 3 ? tempArray.splice(0, 4).join(':') : '';
    subCategory4 = tempArrayLength > 4 ? tempArray.splice(0, 5).join(':') : '';
  } else {
    pageHierarchy = pagePath.replace(/\//g, ':');
  }

  if (primaryCategory === 'errors' || pagePath.indexOf('error') > -1 || pagePath.indexOf('errors') > -1) {
    pageErrorType = pageName;
  }

  window.digitalData.page = {
    pageInstanceId: `${websiteEnvironment}-${pagePath}`,
    pageInfo: {
      destinationUrl: document.location.origin + document.location.pathname,
      metaTitle: pageTitle,
      metaDescription: description || '',
      metaKeywords: pageKeywords,
      pageName,
      pageUrlPath: pagePath,
      pageUrlHierarchy: pageHierarchy,
      primaryCategory: primaryCategory || pageCategoryFromURL || '',
      subCategory1,
      subCategory2,
      subCategory3,
      subCategory4,
      referringUrl: document.referrer,
      pageErrorType,
      sysEnv,
    },
    pageAttributes: {
      language: LANG_DISPLAY_MAP[language],
      template: templateName,
      version: '1.0',
    },
  };

  window.digitalData.website = {
    websiteName,
    websiteInstanceID,
    websiteID,
    websiteEnvironment,
  };

  const productpagetag = pageKeywords;

  if ((productpagetag) && ((productpagetag.indexOf('Product') !== -1) || (productpagetag.indexOf('product') !== -1))) {
    const URLfilename = document.location.pathname.split(/[\\/]/).pop().replace(/\.[^/.]+/, '');
    const productTypeSubCat = subCategory2 ? subCategory2.split(':').pop() : '';
    const category = productTypeSubCat ? productTypeSubCat.split('-').pop() : '';
    const productSegment = getMetadata('product-segment') || 'Product Sales';
    const productCategory = getMetadata('product-category') || category;
    const productType = getMetadata('product-type') || capitalizeFirstLetters(productTypeSubCat);
    const productName = getMetadata('product-name') || capitalizeFirstLetters(URLfilename);

    window.digitalData.product = {
      segment: productSegment,
      category: productCategory,
      productType,
      product: productName,
      subProduct: '',
      merchantName: '',
      feature: '',
      featureValue: '0.00',
      multiProduct: '',
      valueAddedServices: '',
    };
  }
}

// add more delayed functionality here
(function adobeotm() {
  const adobeotmscript = document.createElement('script');
  createDigitalData();
  adobeotmscript.setAttribute('src', 'https://assets.adobedtm.com/6422e0f550a2/017d80491d7e/launch-1e8527b948f6-development.min.js');
  document.head.append(adobeotmscript);
}());
