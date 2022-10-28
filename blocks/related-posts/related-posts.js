import {
  loadBlock, buildBlock, decorateBlock, readBlockConfig,
} from '../../scripts/scripts.js';

function buildCarouselCards() {
  const carouselCards = [];
  for (let i = 0; i < 4; i = i + 1) {
    const carouselCard = [];
    const pic = document.createElement('picture');
    pic.innerHTML = `
      <picture>
        <source media="(min-width: 400px)" type="image/webp" srcset="/media_1b4e25ce45be4e1dafab5a032e1fb1fbf97e7270a.png?width=2000&amp;format=webply&amp;optimize=medium">
        <source type="image/webp" srcset="/media_1b4e25ce45be4e1dafab5a032e1fb1fbf97e7270a.png?width=750&amp;format=webply&amp;optimize=medium">
        <source media="(min-width: 400px)" srcset="/media_1b4e25ce45be4e1dafab5a032e1fb1fbf97e7270a.png?width=2000&amp;format=png&amp;optimize=medium">
        <img loading="lazy" alt="" src="/media_1b4e25ce45be4e1dafab5a032e1fb1fbf97e7270a.png?width=750&amp;format=png&amp;optimize=medium">
      </picture>
      `;
    const txt = document.createElement('div');
    txt.textContent = 'How a first-time personal loan application works';
    carouselCard.push(pic);
    carouselCard.push(txt);
    carouselCards.push(carouselCard);
  }
  return carouselCards;
}

export default async function decorate(block) {
  block.innerHTML = '';
  const carouselCards = buildCarouselCards();
  const multiImageCarousel = buildBlock('carousel', carouselCards);
  multiImageCarousel.classList.add('multiImageCarousel');
  block.appendChild(multiImageCarousel);
  decorateBlock(multiImageCarousel);
  await loadBlock(multiImageCarousel);
  return multiImageCarousel;
}
