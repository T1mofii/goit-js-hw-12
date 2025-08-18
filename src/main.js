
import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const searchForm = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('.load-more');

const PER_PAGE = 15;

let query = '';
let page = 1;
let totalHits = 0;
let loaded = 0; 

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();

  const newQuery = e.currentTarget.elements.searchQuery.value.trim();
  if (!newQuery) {
    iziToast.warning({ message: 'Please enter a search term!' });
    return;
  }

  query = newQuery;
  page = 1;
  loaded = 0;

  clearGallery();
  hideLoadMoreButton(); 
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = Number(data.totalHits) || 0;

    if (!data.hits || data.hits.length === 0) {
      iziToast.info({ message: 'No images found. Try another search.' });
      return;
    }

    createGallery(data.hits);
    loaded = data.hits.length;

    if (loaded < totalHits) {
      showLoadMoreButton();
      loadMoreBtn.disabled = false;
    } else {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({
      message: `Something went wrong. ${error?.message || ''}`.trim(),
    });
  } finally {
    hideLoader();
  }
}

async function onLoadMore() {
  hideLoadMoreButton();
  loadMoreBtn.disabled = true;

  page += 1;
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    const hits = data?.hits || [];

    if (hits.length === 0) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
      return;
    }

    createGallery(hits);
    loaded += hits.length;

    smoothScroll();

    if (loaded < totalHits) {
      showLoadMoreButton();
      loadMoreBtn.disabled = false;
    } else {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({
      message: `Error loading more images. ${error?.message || ''}`.trim(),
    });

    if (loaded < totalHits) {
      showLoadMoreButton();
      loadMoreBtn.disabled = false;
    }
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const firstCard = document.querySelector('.gallery li');
  if (!firstCard) return;

  const { height: cardHeight } = firstCard.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
