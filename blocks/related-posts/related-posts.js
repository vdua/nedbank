import {
  loadBlock, buildBlock, decorateBlock, readBlockConfig,
} from '../../scripts/scripts.js';

const carouselCards = [];

function formatDate(date) {
  const d = new Date(Math.round((+date - (1 + 25567 + 1)) * 86400 * 1000));
  d.setMonth(d.getMonth());
  const monthName = d.toLocaleString('default', { month: 'short' });
  const dateNew = `${d.getDate()} ${monthName}  ${d.getFullYear()}`;
  return dateNew;
}

export default async function decorate(block) {
  block.innerHTML = '';
  const response = await fetch('/query-index.json')
  const json = await response.json();
  var dataArr = json.data;
  for (const itr of dataArr) {
    const carouselCard = [];
    const pic = document.createElement('picture');
    pic.innerHTML = `
                    <picture>
                        <source media="(min-width: 400px)" type="image/webp" srcset="${itr.image}">
                        <source type="image/webp" srcset="${itr.image}">
                        <source media="(min-width: 400px)" srcset="${itr.image}">
                        <img loading="lazy" alt="" src="${itr.image}">
                    </picture>
                    `;
    const title = document.createElement('h2');
    const desc = document.createElement('p');
    const description = document.createElement('strong');
    const author = document.createElement('h5');
    const pdate = document.createElement("p");
    const publishDate = document.createElement('em');

    const readTime = document.createElement('h6');
    const readLink = document.createElement('h4');
    const a = document.createElement('a');
    
    title.textContent = itr.title;
    description.textContent = itr.description;
    author.textContent = "By " + itr.author;
    publishDate.textContent = 'Published ' + formatDate(itr.date) + ' in Loans';
    readTime.textContent = itr.readTime;
    readLink.textContent = "Read > "
    a.href = itr.path;
    a.appendChild(readLink);
    carouselCard.push(pic);

    var read = document.createElement("div");
    var carouselText = document.createElement("div");
    carouselText.appendChild(author);
    pdate.appendChild(publishDate);
    carouselText.appendChild(pdate);
    carouselText.appendChild(title);
    desc.appendChild(description);
    carouselText.appendChild(desc);

    read.appendChild(a);
    read.appendChild(readTime);
    carouselText.appendChild(read);

    carouselCard.push(carouselText);
    carouselCards.push(carouselCard);
  }
  const multiImageCarousel = buildBlock('carousel', carouselCards);
  multiImageCarousel.classList.add('multiImageCarousel');
  block.appendChild(multiImageCarousel);
  decorateBlock(multiImageCarousel);
  await loadBlock(multiImageCarousel);
  return multiImageCarousel;
}
