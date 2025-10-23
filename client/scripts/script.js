import { filterMovies } from './filterMovies.js';
import { showBackdrop } from './utils.js';

const api_key = '';
const globalParams = {
  default: {
    page: 1,
  },
  search: {
    page: 1,
  },
};

const defaultParams = {
  api_key: api_key,
  'vote_average.lte': 10,
  'vote_average.gte': 0,
  with_genres: '',
  with_original_language: 'en',
  sort_by: 'popularity.desc',
  include_adult: false,
};

const getDefaultParameter = () => {
  return {
    api_key: api_key,
    page: globalParams.default.page,
    'vote_average.lte': defaultParams['vote_average.lte'],
    'vote_average.gte': defaultParams['vote_average.gte'],
    with_genres: defaultParams.with_genres,
    with_original_language: defaultParams.with_original_language,
    sort_by: defaultParams.sort_by,
    include_adult: defaultParams.include_adult,
  };
};

const getSearchParameter = () => {
  const searchValue = searchInput.value;
  const query = encodeURIComponent(searchValue);
  return {
    api_key: api_key,
    query: query,
    page: globalParams.search.page,
    include_adult: false,
  };
};

let data;
let tempData = [];
let isHomePage = true;
let isSearchPage = false;
let isSearchBtnClicked = false;
let isLoading = false;
let isScrolledToEnd = false;
let isAdultConfirmed = true;

const modal = document.getElementById('movieModal');
const modalContent = document.querySelector('.modal-content');
const searchInput = document.getElementById('searchInput');
const moviePoster = document.getElementById('moviePoster');
const noPosterText = moviePoster.nextElementSibling;
const container = document.querySelector('.container');
const resultsContainer = document.getElementById('results');

async function initApp() {
  function populateDropdown(tmdbData, type) {
    const dropdownMenu = document.querySelector(`.${type} .dropdown-menu`);

    dropdownMenu.querySelectorAll('label').forEach((el) => el.remove());

    let items = [];

    if (type === 'language') {
      items = tmdbData.languages.map((lang) => ({
        id: lang.iso_639_1,
        label: lang.english_name,
        value: lang.english_name.toLowerCase(),
        inputType: 'radio',
      }));
    } else if (type === 'genre') {
      items = tmdbData.genres.map((genre) => ({
        id: genre.id,
        label: genre.name,
        value: genre.name.toLowerCase(),
        inputType: 'checkbox',
      }));
    }

    items.forEach((item) => {
      if (!item.id || !item.label) return;

      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = item.inputType;
      input.name = type; // groups radios, but checkboxes still work fine
      input.value = item.value;
      input.setAttribute('data-id', item.id);

      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + item.label));
      dropdownMenu.appendChild(label);
    });
  }
  try {
    const response = await fetch('/json/tmdbData.jsonc');
    const tmdbData = await response.json();
    populateDropdown(tmdbData, 'language');
    populateDropdown(tmdbData, 'genre');

    document.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const clientHeight = document.documentElement.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      if (scrollTop + clientHeight >= scrollHeight + -5) {
        onScrollToEnd();
      }
    });

    const onScrollToEnd = () => {
      if (isLoading) return;
      isLoading = true;
      isScrolledToEnd = true;
      getMovies(sortMovies()).finally(() => {
        isLoading = false;
        isScrolledToEnd = false;
      });
    };

    document.getElementById('searchBtn').addEventListener('click', () => {
      const searchValue = searchInput.value;
      if (searchValue.length === 0) return;

      isSearchBtnClicked = true;
      isSearchPage = true;
      isHomePage = false;
      globalParams.search.page = 1;
      globalParams.default.page = 1;
      getMovies(sortMovies());
    });

    function getTransformOrigin(button, modalContent) {
      const btnRect = button.getBoundingClientRect();
      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;

      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const offsetX = btnCenterX - viewportCenterX;
      const offsetY = btnCenterY - viewportCenterY;

      const originX = 50 + (offsetX / modalContent.offsetWidth) * 100;
      const originY = 50 + (offsetY / modalContent.offsetHeight) * 100;

      return `${originX}% ${originY}%`;
    }

    function animateModalClose() {
      modalContent.style.transform = 'translate(-50%, -50%) scale(0)';
      modal.classList.add('reset-blur');

      let timeoutId = setTimeout(() => {
        cleanup();
      }, 400);
      function cleanup() {
        clearTimeout(timeoutId);
        modal.classList.remove('show');
        modal.classList.remove('reset-blur');
        document.body.style.overflow = '';
      }
      modalContent.addEventListener(
        'transitionend',
        (e) => {
          if (e.propertyName === 'transform') {
            cleanup();
          }
        },
        { once: true }
      );
    }

    function closeModal() {
      animateModalClose();
    }

    function LoadingModal() {
      moviePoster.classList.add('poster-loading');
      modal.classList.add('data-loading');
      moviePoster.src = '';
      document.getElementById('movieTitle').innerText = 'Loading...';
      document.getElementById('movieDescription').innerText = 'Loading...';
      document.getElementById('movieYear').innerText = 'Loading...';
      document.getElementById('movieRating').innerText = 'Loading...';
      document.getElementById('movieGenres').innerText = 'Loading...';
      document.getElementById('movieRuntime').innerText = 'Loading...';
    }

    function fillModal(movie) {
      if (movie.poster_path === null) {
        noPosterText.style.opacity = 1;
      }

      moviePoster.src = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '';

      if (!moviePoster.getAttribute('src')) {
        modal.classList.remove('data-loading');
      }
      moviePoster.addEventListener('load', () => {
        moviePoster.classList.remove('poster-loading');
        modal.classList.remove('data-loading');
        noPosterText.style.opacity = 0;
      });

      document.getElementById('movieTitle').innerText = movie.title;
      document.getElementById('movieDescription').innerText =
        movie.overview || 'No description available';
      document.getElementById('movieYear').innerText =
        movie.release_date || 'Unknown';
      document.getElementById('movieRating').innerText =
        movie.vote_average || 'Not rated';
      document.getElementById('movieGenres').innerText =
        movie.genres?.map((g) => g.name).join(', ') || 'Unknown';
      document.getElementById('movieRuntime').innerText =
        movie.runtime + ` Min` || 'Unknown';
    }

    function openModal(movieId, button) {
      document.body.style.overflow = 'hidden';
      noPosterText.style.opacity = 0;
      LoadingModal();
      if (!modal.classList.contains('show')) {
        modal.classList.add('show');
        if (button) {
          modalContent.style.transformOrigin = getTransformOrigin(
            button,
            modalContent
          );
        } else {
          modalContent.style.transformOrigin = '50% 50%';
        }
        modalContent.style.transform = 'translate(-50%, -50%) scale(0)';
        requestAnimationFrame(() => {
          modalContent.style.transform = 'translate(-50%, -50%) scale(1)';
        });
      }

      const movie = tempData.find((movie) => movie.id == movieId);
      fillModal(movie);
    }

    getMovies(sortMovies());

    const videoPlayer = document.getElementById('videoPlayer');
    const playerContainer = document.querySelector('.player-container');
    resultsContainer.addEventListener('click', (event) => {
      const target = event.target;
      if (target.classList.contains('result-item')) {
        const movieId = target.getAttribute('data-id');
        openModal(movieId, target);
      }
      if (target.classList.contains('download-btn')) {
        const movieId = target.getAttribute('data-id');
        const selectedResolution = document.getElementById(
          `resolution-${movieId}`
        ).value;
        window.open(selectedResolution, '_blank');
      }
      if (target.classList.contains('play-btn')) {
        showBackdrop(playerContainer, () => false);
        console.log('playing');
        const movieId = target.getAttribute('data-id');

        // I'm aware that using vidsrc.to might have legal and ethical implications. but I'm using it here solely for educational purposes and personal experimentation.
        // videoPlayer.src = `https://multiembed.mov/?video_id=${imdbId}`;
        // videoPlayer.src = `https://gomo.to/movie/${imdbId}`;
        // videoPlayer.src = `https://www.2embed.cc/embed/${imdbId}`;
        videoPlayer.src = `https://vidsrc.to/embed/movie/${movieId}`;
        playerContainer.style.display = 'block';
        container.style.filter = 'blur(20px)';
        container.style.pointerEvents = 'none';
      }
    });

    const closePlayer = document.querySelector('.close-player');
    closePlayer.addEventListener('click', () => {
      showBackdrop(playerContainer, () => false);
      playerContainer.style.display = 'none';
      container.style.filter = 'none';
      container.style.pointerEvents = 'all';
      videoPlayer.src = 'about:blank';
      console.warn('player closed');
    });

    document.getElementById('closeModal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (!modalContent.contains(e.target)) {
        closeModal();
      }
    });
  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}

const sortMovies = () => {
  if (isSearchPage) {
    return getSearchParameter();
  } else {
    return getDefaultParameter();
  }
};

function pageNumber() {
  if (!isSearchPage) {
    globalParams.default.page++;
    globalParams.search.page = 1;
  } else {
    if (!isSearchBtnClicked) {
      globalParams.search.page++;
    } else {
      globalParams.search.page++;
      isSearchBtnClicked = false;
    }
  }
}

async function getMovies(sortedMovies) {
  if (!isScrolledToEnd) {
    tempData = [];
    console.log('cleared tempData', tempData);
  }

  if (isSearchPage) {
    console.log('isHomePage', isHomePage);
    globalParams.default.page = 1;
  } else {
    console.log('isSearchPage', isSearchPage);
    globalParams.search.page = 1;
  }

  const showMore = document.querySelector('.show-more');
  if (showMore) showMore.remove();

  let query = sortedMovies;
  if (!query) {
    console.log('no query', query);
    return;
  } else {
    console.log('query', query);
  }

  const resultItem = resultsContainer.querySelector('.result-item');

  if (!resultItem) {
    const showMore = document.createElement('h1');
    showMore.classList.add('show-more');
    showMore.textContent = 'Loading Movie...';
    container.appendChild(showMore);
  } else {
    const showMore = document.createElement('h1');
    showMore.classList.add('show-more');
    showMore.textContent = 'Loading More Movies...';
    container.appendChild(showMore);
  }
  try {
    console.log('ps', globalParams.search.page);
    console.log('ph', globalParams.default.page);

    const BASE_URL = import.meta.env.VITE_API_URL;

    const discoverUrl = `${BASE_URL}/movies`;
    const SearchUrl = `${BASE_URL}/movies`;

    const params = query;

    // Convert params object to query string
    const queryString = new URLSearchParams(params).toString();

    async function getResponse() {
      if (isSearchPage) {
        isHomePage = false;
        const fullUrl = `${SearchUrl}?${queryString}`;
        return await fetch(fullUrl);
      } else {
        isHomePage = true;
        const fullUrl = `${discoverUrl}?${queryString}`;
        return await fetch(fullUrl);
      }
    }

    const response = await getResponse();

    const previousData = data;

    data = await response.json();

    data.results.forEach((movie) => tempData.push(movie));

    if (isSearchBtnClicked) {
      console.log('isScrollToEnd', isScrolledToEnd);
      resultsContainer.innerHTML = '';
    }

    let showMore = document.querySelector('.show-more');
    if (data.results.length === 0) {
      console.log('data', 0);

      if (data === previousData) return;

      if (isSearchBtnClicked) {
        resultsContainer.innerHTML = '';
        showMore.textContent = 'No Movie Found!';
        isSearchBtnClicked = false;
      } else {
        const resultItem = resultsContainer.querySelector('.result-item');
        if (!resultItem) {
          showMore.textContent = 'No Movie Found!';
          return;
        }
        showMore.textContent = 'No More Movies!';
      }

      return;
    }
    if (isSearchBtnClicked) {
      resultsContainer.innerHTML = '';
      showMore.textContent = 'Loading Movies...';
      isSearchBtnClicked = false;
    }
    showMore = document.querySelector('.show-more');

    pageNumber();

    let current = 0;
    async function processMovies(movies) {
      for (const movie of movies) {
        const itemWrapper = document.createElement('div');
        itemWrapper.classList.add('result-item-wrapper');
        const item = document.createElement('div');
        item.classList.add('result-item');

        const moviePoster = `url(https://image.tmdb.org/t/p/w185/${movie.poster_path})`;

        item.style.backgroundImage = moviePoster;

        const bgs = [
          document.getElementById('bg1'),
          document.getElementById('bg2'),
        ];

        // SET BG BACKGROUND WHEN MOVIES STARTED ADDING TO DOM
        bgs[0].style.backgroundImage = `url(https://image.tmdb.org/t/p/w185/${data?.results[1]?.poster_path})`;
        bgs[0].classList.add('active');
        bgs[1].classList.remove('active');

        item.addEventListener('mouseenter', () => {
          const next = (current + 1) % 2;

          bgs[next].style.backgroundImage = moviePoster;
          bgs[next].classList.add('active');
          bgs[current].classList.remove('active');

          current = next;
        });
        const dateString = movie.release_date;
        const date = new Date(dateString);
        const year = date.getFullYear();
        item.setAttribute('data-id', movie.id);
        item.innerHTML = `         
                <p class="year"> ${year}</p>
                <div class="play-btn" data-id="${movie.id}" imdb-id="${
          movie.imdb_code
        }"></div> 
            <p class="rating-value"> ${
              movie.vote_average.length > 4 || 5
                ? movie.vote_average.toString().substring(0, 3)
                : movie.vote_average
            }</p>
                
                <div class="buttons dm-btns">

                <button class="download-btn" data-id="${
                  movie.id
                }">Download</button>
                </div>
            `;
        const h3 = document.createElement('h3');
        h3.classList.add('title');
        h3.textContent =
          movie.title.length > 17
            ? movie.title.substring(0, 17) + '...'
            : movie.title;
        itemWrapper.appendChild(item);
        itemWrapper.appendChild(h3);
        resultsContainer.appendChild(itemWrapper);
      }
    }
    await processMovies(data.results);
  } catch (error) {
    console.error('Error fetching torrents:', error);
    const showMore = document.querySelector('.show-more');
    if (!resultItem) {
      showMore.textContent = 'Error Loading Movies. Please Try Again Later!';
    } else if (showMore) {
      showMore.remove();
    }
  }

  console.log('CURRENT SEARCH PAGE', globalParams.search.page - 1);
  console.log('CURRENT HOME PAGE', globalParams.default.page - 1);

  // CHANGE BG WHEN MOVIES STOPPED ADDING
  let current = 0;
  const moviePoster = `url(https://image.tmdb.org/t/p/w185/${data?.results[0]?.poster_path})`;
  const bgs = [document.getElementById('bg1'), document.getElementById('bg2')];
  const next = (current + 1) % 2;
  if (!bgs[current].classList.contains('active')) {
    bgs[current].style.backgroundImage = moviePoster;
    bgs[next].classList.remove('active');
    bgs[current].classList.add('active');
  } else {
    bgs[next].style.backgroundImage = moviePoster;
    bgs[next].classList.add('active');
    bgs[current].classList.remove('active');
    current = next;
  }
}

initApp().then(() => {
  filterMovies();
});

// Style result-item on touch click
(() => {
  let activeItem = null;
  let activePlayBtn = null;
  let clickable = false;

  document.addEventListener('pointerdown', (e) => {
    const item = e.target.closest('.result-item');
    if (!item) return;

    const playBtn = item.querySelector('.play-btn');
    if (!playBtn) return;

    // 🖱️ Mouse: normal behavior
    if (e.pointerType === 'mouse') return;

    // If playBtn is already active → allow clicks normally
    if (item === activeItem && clickable) return;

    // Touch: first tap → show play button only
    if (activePlayBtn) activePlayBtn.classList.remove('play-btn-active');
    if (activeItem) {
      activeItem.style.backgroundBlendMode = '';
      activeItem.style.transform = 'scale(1)';
    }

    item.style.backgroundBlendMode = 'soft-light';
    item.style.transform = 'scale(1.04)';
    playBtn.classList.add('play-btn-active');

    // ❗Important: let click pass through to .result-item
    playBtn.style.pointerEvents = 'none';
    clickable = false;

    activeItem = item;
    activePlayBtn = playBtn;
  });

  document.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch' || !activePlayBtn) return;

    // After finger lifted, make playBtn clickable
    setTimeout(() => {
      activePlayBtn.style.pointerEvents = 'auto';
      clickable = true;
    }, 50);
  });

  document.addEventListener(
    'click',
    (e) => {
      const playBtn = e.target.closest('.play-btn');
      if (!playBtn) return;

      // On touch: block first accidental click
      if (
        'ontouchstart' in window &&
        (!clickable || playBtn !== activePlayBtn)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      console.log('Play button clicked!');
    },
    true
  );

  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.pointerType !== 'touch') return;
      if (!e.target.closest('.result-item')) {
        if (activePlayBtn) activePlayBtn.classList.remove('play-btn-active');
        if (activeItem) {
          activeItem.style.backgroundBlendMode = '';
          activeItem.style.transform = 'scale(1)';
        }
        activePlayBtn = null;
        activeItem = null;
        clickable = false;
      }
    },
    { capture: true }
  );
})();

// Login page
const loginPage = document.getElementById('loginPage');
const loginBtn = document.getElementById('navLoginBtn');

const toggleLoginPage = (e) => {
  if (loginPage.style.display !== 'flex') {
    if (loginBtn.contains(e.target)) {
      loginPage.style.display = 'flex';
      showBackdrop(loginPage, toggleLoginPage);
    }
  }

  if (loginPage.style.display !== 'none') {
    if (e.target !== loginBtn && !loginPage.contains(e.target)) {
      loginPage.style.display = 'none';
    }
  }
};

// Toggle between signup and login
const spwLoginBtn = document.getElementById('spwLoginBtn');
const lpwSignupBtn = document.getElementById('lpwSignupBtn');
const loginContainer = document.querySelector('.login-container');
const signupContainer = document.querySelector('.signup-container');
const signupPageWlcm = document.querySelector('.signup-page-wlcm');
const loginPageWlcm = document.querySelector('.login-page-wlcm');

const toggleLoginPageContent = (e) => {
  if (spwLoginBtn.contains(e.target)) {
    signupContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    loginPageWlcm.style.display = 'flex';
    signupPageWlcm.style.display = 'none';
  } else if (lpwSignupBtn.contains(e.target)) {
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'flex';
    signupPageWlcm.style.display = 'flex';
    loginPageWlcm.style.display = 'none';
  }
};

// Toggle aside nav
const userSection = document.getElementById('user');
const closeBtn = document.querySelector('.close-btn');

const closeUserSection = (e) => {
  if (closeBtn.contains(e.target)) {
    userSection.style.display = 'none';
  }
};

document.addEventListener('click', (e) => {
  toggleLoginPage(e);
  if (e.target.closest('.login-page')) {
    toggleLoginPageContent(e);
  }
  if (e.target.matches('.close-btn')) {
    closeUserSection(e);
  }
});

// Signup form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent normal form submission

    // Collect form data
    const formData = {
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const response = await fetch('http://localhost:3000/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Success:', result);
        form.reset();
      } else {
        console.log('Error:', result);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  });
});

// Login form submission
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Collect login form data
    const loginData = {
      email: loginForm.email.value,
      password: loginForm.password.value,
    };

    try {
      const response = await fetch('http://localhost:3000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session management,
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Login successful:', result);
        // Redirect or do something after login
        loginForm.reset();
        // Example: window.location.href = '/dashboard';
      } else {
        console.error('Login failed:', result.message || result);
      }
    } catch (err) {
      console.error('Fetch error during login:', err);
    }
  });
});

export { defaultParams, globalParams, resultsContainer, getMovies, sortMovies };
