import {
  readBlockConfig,
  fetchPlaceholders,
  createOptimizedPicture,
} from '../../scripts/scripts.js';

export function buildArticleCard(article, type = 'article', eager = false) {
  const {
    author, readTime, category,
    title, description, image, date,
  } = article;

  const path = article.path.split('.')[0];

  const picture = createOptimizedPicture(image, title, eager, [{ width: '750' }]);
  const pictureTag = picture.outerHTML;
  const card = document.createElement('a');
  card.className = `${type}-card`;
  card.href = path;

  card.innerHTML = `<div class="${type}-card-image">
      ${pictureTag}
    </div>
    <div class="${type}-card-body">
      <p class="${type}-card-author">By ${author}</p>
      <p class="${type}-card-date">Published ${date} in ${category}</p>
      <h3>${title}</h3>
      <p class="${type}-card-description">${description}</p>
      <div class="${type}-card-footer">
        <span class="${type}-card-read">Read</span>
        <span class="${type}-card-time">${readTime}</span>
      </div>
    </div>`;
  return card;
}

export async function fetchBlogArticleIndex() {
  const pageSize = 500;
  window.blogIndex = window.blogIndex || {
    data: [],
    byPath: {},
    offset: 0,
    complete: false,
  };
  if (window.blogIndex.complete) return (window.blogIndex);
  const index = window.blogIndex;
  // const resp =
  //  await fetch(`${getRootPath()}/query-index.json?limit=${pageSize}&offset=${index.offset}`);
  const resp = await fetch(`query-index.json?limit=${pageSize}&offset=${index.offset}`);
  const json = await resp.json();
  const complete = (json.limit + json.offset) === json.total;
  json.data.forEach((post) => {
    index.data.push(post);
    index.byPath[post.path.split('.')[0]] = post;
  });
  index.complete = complete;
  index.offset = json.offset + pageSize;
  return (index);
}

async function filterArticles(config, feed, limit, offset) {
  const result = [];

  /* filter posts by tags */
  let { tags } = config;
  if (tags) {
    tags = tags.split(',');
    tags.forEach((t) => t.toLowerCase().trim());
  }

  while ((feed.data.length < limit + offset) && (!feed.complete)) {
    // eslint-disable-next-line no-await-in-loop
    const index = await fetchBlogArticleIndex();
    const indexChunk = index.data.slice(feed.cursor);

    const feedChunk = indexChunk.filter((article) => {
      if (article.tags) {
        const articleTags = JSON.parse(article.tags);
        return articleTags.some((tag) => tags.indexOf(tag) > -1);
      }
      return false;
    });
    feed.cursor = index.data.length;
    feed.complete = index.complete;
    feed.data = [...feed.data, ...feedChunk];
  }
}

async function decorateArticleFeed(
  articleFeedEl,
  config,
  offset = 0,
  feed = { data: [], complete: false, cursor: 0 },
) {
  let articleCards = articleFeedEl.querySelector('.article-cards');
  if (!articleCards) {
    articleCards = document.createElement('div');
    articleCards.className = 'article-cards';
    articleFeedEl.appendChild(articleCards);
  }
  // display spinner
  const emptyDiv = document.createElement('div');
  emptyDiv.classList.add('article-cards-empty');
  const spinner = document.createElement('div');
  spinner.classList.add('spinner');
  emptyDiv.append(spinner);
  articleCards.append(emptyDiv);
  const placeholders = fetchPlaceholders();
  const limit = 12;
  const pageEnd = offset + limit;
  await filterArticles(config, feed, limit, offset);
  const articles = feed.data;
  if (articles.length) {
    // results were found
    emptyDiv.remove();
  } else if (config.selectedProducts || config.selectedIndustries) {
    // no user filtered results were found
    spinner.remove();
    const noMatches = document.createElement('p');
    noMatches.innerHTML = `<strong>${placeholders['no-matches']}</strong>`;
    const userHelp = document.createElement('p');
    userHelp.classList.add('article-cards-empty-filtered');
    userHelp.textContent = placeholders['user-help'];
    emptyDiv.append(noMatches, userHelp);
  } else {
    // no results were found
    spinner.remove();
    const noResults = document.createElement('p');
    noResults.innerHTML = `<strong>${placeholders['no-results']}</strong>`;
    emptyDiv.append(noResults);
  }
  const max = pageEnd > articles.length ? articles.length : pageEnd;
  for (let i = offset; i < max; i += 1) {
    const article = articles[i];
    const card = buildArticleCard(article);
    articleCards.append(card);
  }

  articleFeedEl.classList.add('appear');
}

function getBounds(el) {
  const bounds = el.getBoundingClientRect();
  return {
    l: bounds.left,
    r: bounds.right,
    w: bounds.width,
  };
}

function slideTo(targetBullet, articleFeedEl) {
  const articles = articleFeedEl.querySelectorAll('.article-card');
  const bullets = articleFeedEl.querySelector('.pagination-bullets');
  const articleCardsContainer = articleFeedEl.querySelector('.article-cards');
  const accBounds = getBounds(articleCardsContainer);
  const articleFeedBounds = getBounds(articleFeedEl);
  const currentActive = bullets.querySelector('.active');
  currentActive.classList.remove('active');
  const { index } = targetBullet.dataset;
  targetBullet.classList.add('active');

  const article = articles.item(index);
  const articleBounds = getBounds(article);
  const lastArticle = articles.item(articles.length - 1);
  const lastArticleBounds = getBounds(lastArticle);
  let shift = articleBounds.l;
  const shiftedLastArticlePosition = lastArticleBounds.r - shift;
  if (shiftedLastArticlePosition < articleFeedBounds.r) {
    shift -= (articleFeedBounds.r - shiftedLastArticlePosition - articleFeedBounds.l);
  }
  const newPosition = accBounds.l - shift;
  const style = `--current-x: ${newPosition}px`;
  articleCardsContainer.setAttribute('style', style);
  const prev = articleFeedEl.querySelector('.pagination-prev');
  const next = articleFeedEl.querySelector('.pagination-next');
  if (targetBullet.previousElementSibling === null) {
    prev.classList.add('disabled');
  } else {
    prev.classList.remove('disabled');
  }
  if (targetBullet.nextElementSibling === null) {
    next.classList.add('disabled');
  } else {
    next.classList.remove('disabled');
  }
}

function createPaginationBullets(articleFeedEl) {
  const articles = articleFeedEl.querySelectorAll('.article-card');
  const bulletContainer = document.createElement('div');
  bulletContainer.classList.add('pagination-bullets');
  const bullets = [...articles].map((article, i) => {
    const span = document.createElement('span');
    span.classList.add('pagination-bullet');
    span.tabindex = 0;
    span.setAttribute('aria-label', `Go to Slide ${i}`);
    span.dataset.index = i;
    span.role = 'button';
    if (i === 0) {
      span.classList.add('active');
    }
    return span;
  });
  bulletContainer.append(...bullets);
  bulletContainer.addEventListener('click', (e) => {
    const { target } = e;
    if (target.classList.contains('pagination-bullet')) {
      slideTo(target, articleFeedEl);
    }
  });
  return bulletContainer;
}

function createNextPrevToolbar(articleFeedEl) {
  const div = document.createElement('div');
  div.classList.add('pagination-toolbar');
  const prev = document.createElement('span');
  prev.classList.add('pagination-prev', 'disabled');
  const next = document.createElement('span');
  next.classList.add('pagination-next');
  div.append(prev, next);
  div.addEventListener('click', (e) => {
    const { target } = e;
    if (target.tagName === 'SPAN' && !target.classList.contains('disabled')) {
      const current = articleFeedEl.querySelector('.pagination-bullet.active');
      let nextBullet = current;
      if (target.classList.contains('pagination-prev')) {
        nextBullet = current.previousElementSibling;
      } else {
        nextBullet = current.nextElementSibling;
      }

      slideTo(nextBullet, articleFeedEl);
    }
  });
  return div;
}

function decorateArticlePagination(articleFeedEl) {
  const articlePagination = document.createElement('div');
  articlePagination.classList.add('article-pagination');
  const bullets = createPaginationBullets(articleFeedEl);
  articlePagination.append(bullets);
  const nextPrev = createNextPrevToolbar(articleFeedEl);
  articlePagination.append(nextPrev);
  articleFeedEl.append(articlePagination);
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = '';
  await decorateArticleFeed(block, config);
  decorateArticlePagination(block);
}
