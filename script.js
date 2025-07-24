const searchInput = document.getElementById('searchInput');

let pagecount = 1;

const parameters = {
  limit: ['50'],
  page: pagecount,
  sort_by: ['year', 'date_added', 'seeds', 'peers', 'rating', 'download_count', 'like_count'],
  genre: ['adventure', 'action'],
};

document.getElementById('searchBtn').addEventListener('click', () => {
  getMovies(sortMovies());
});

let isSearched = false;
let isFirstLoad = false;
document.addEventListener('DOMContentLoaded', () => {
  isSearched = false;
  getMovies(sortMovies());
  isFirstLoad = true;
});

document.addEventListener('scroll', () => {
  if (isSearched) return;

  const scrollTop = window.scrollY || window.pageYOffset;
  const clientHeight = document.documentElement.clientHeight;
  const scrollHeight = document.documentElement.scrollHeight;

  if (scrollTop + clientHeight >= scrollHeight + -5) {
    onScrollToEnd();
  }
});


let isLoading = false;
let isScrolledToEnd = false;

const onScrollToEnd = () => {
  if (isLoading) return;
  isLoading = true;
  if (searchInput.value) {
    searchInput.value = '';
  }

  getMovies(sortMovies()).finally(() => {
    isLoading = false;
    isScrolledToEnd = true;
  });
};

const getDefaultParameter = () => {
  return `limit=${parameters.limit}&sort_by=${parameters.sort_by[6]}&page=${parameters.page}`;
};

const sortMovies = () => {
  const searchValue = searchInput.value;
  const query = `query_term=${encodeURIComponent(searchValue)}`;
  if (searchValue.length > 0) {
    isSearched = true;
    return query;
  } else {
    return getDefaultParameter();
  }
};

async function getMovies(sortedMovies) {
  const query = sortedMovies;

  if (!query) return;

  const container = document.querySelector('.container');
  const resultsContainer = document.getElementById('results');
  const resultItem = resultsContainer.querySelector('.result-item');
  if (!resultItem) {
    resultsContainer.innerHTML = '<p class="loading">Loading...</p>';
  } else {
    const showMore = document.createElement('h1');
    showMore.classList.add('show-more');
    showMore.textContent = 'Loading More Movies';
    container.appendChild(showMore);
    console.log(showMore);
  }

  try {
    const response = await fetch(
      `https://yts.mx/api/v2/list_movies.json?${sortedMovies}`
    );

    if (isSearched) {
      resultsContainer.innerHTML = '';
    }

    if (searchInput.value) {
      searchInput.value = '';
      pagecount = 1;
    }

    console.log(pagecount);
    if (isScrolledToEnd || isFirstLoad) {
      pagecount = pagecount + 1;
    }
    parameters.page = pagecount;

    const data = await response.json();
    console.log('data', data);

    const loading = document.querySelector('.loading');
    const showMore = document.querySelector('.show-more');

    if (loading) {
      resultsContainer.innerHTML = '';

      if (data.data.movies.length === 0) {
        resultsContainer.innerHTML =
          '<p class="loading">No torrents found.</p>';
        return;
      }
    } else if (showMore) {
      showMore.remove();
    }

    let current = 0;
    data.data.movies.forEach((movie) => {
      const item = document.createElement('div');
      item.classList.add('result-item');

      const resolutionSelect = movie.torrents
        .map((torrent) => {
          return `<option value="${torrent.url}">${torrent.quality}</option>`;
        })
        .join('');

      item.style.backgroundImage = `url(${movie.large_cover_image})`;
      item.style.backgroundSize = 'cover';

      const bgs = [
        document.getElementById('bg1'),
        document.getElementById('bg2'),
      ];

              const next = (current + 1) % 2;
              const poster = movie.large_cover_image;

      bgs[current].style.backgroundImage = `url(${poster})`;
      if (!bgs[current].classList.contains('active')) {
        bgs[next].classList.remove('active');
        bgs[current].classList.add('active');
      } else {
        bgs[next].style.backgroundImage = `url(${poster})`;
        bgs[next].classList.add('active');
        bgs[current].classList.remove('active');
        current = next;
      }
      item.addEventListener('mouseenter', () => {
        const next = (current + 1) % 2;

        bgs[next].style.backgroundImage = `url(${poster})`;
        bgs[next].classList.add('active');
        bgs[current].classList.remove('active');

        current = next;
      });

      item.innerHTML = `      
                <div class="year-and-rating-container">          
                <p><strong>Year:</strong> ${movie.year}</p>
                <p><strong>Rating:</strong> ${movie.rating}</p>
                </div>
                <div class="play-btn" data-id="${movie.id}" imdb-id="${movie.imdb_code}"></div> 
                <div class="title-and-btn-container">
                <h3>${movie.title}</h3>
                <div class="buttons">
                <select id="resolution-${movie.id}" class="resolution-select">
                ${resolutionSelect}
                </select>
                <button class="download-btn" data-id="${movie.id}">Download</button>
                <button class="more-info-btn" data-id="${movie.id}">!</button>
                </div>
                </div>
            `;
      resultsContainer.appendChild(item);
    });

    document.querySelectorAll('.download-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        const movieId = event.target.getAttribute('data-id');
        const selectedResolution = document.getElementById(
          `resolution-${movieId}`
        ).value;
        window.open(selectedResolution, '_blank');
      });
    });

    const playBtns = document.querySelectorAll('.play-btn');
    const videoPlayer = document.getElementById('videoPlayer');
    const playerContainer = document.querySelector('.player-container');
    const container = document.querySelector('.container');

    playBtns.forEach((btn) => {
      btn.addEventListener('click', async (event) => {
        try {
          const imdbId = event.target.getAttribute('imdb-id');

          if (imdbId) {
            videoPlayer.src = `https://multiembed.mov/?video_id=${imdbId}`;
            playerContainer.style.display = 'block';
            container.style.filter = 'blur(20px)';
            container.style.pointerEvents = 'none';
          }
        } catch (err) {
          console.error('Failed to fetch or play video:', err);
        }
      });
    });
    
    const closePlayer = document
    .querySelector('.close-player')
    .addEventListener('click', () => {
      playerContainer.style.display = 'none';
      container.style.filter = 'none';
      container.style.pointerEvents = 'all';
        videoPlayer.src = 'about:blank';
      });

    document.querySelectorAll('.more-info-btn').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const movieId = event.target.getAttribute('data-id');
        const movie = data.data.movies.find((m) => m.id == movieId);
        console.log(movie);

        const modal = document.getElementById('movieModal');
        document.getElementById('moviePoster').src = movie.large_cover_image;
        document.getElementById('movieTitle').innerText = movie.title;
        document.getElementById('movieDescription').innerText =
          movie.description_full || 'No description available';
        document.getElementById('movieYear').innerText =
          movie.year || 'Unknown';
        document.getElementById('movieRating').innerText =
          movie.rating || 'Not rated';
        document.getElementById('movieGenres').innerText =
          movie.genres.join(', ') || 'Unknown';

        modal.style.display = 'block';
      });
    });

    document.getElementById('closeModal').addEventListener('click', () => {
      document.getElementById('movieModal').style.display = 'none';
    });
    document.getElementById('backdrop').addEventListener('click', () => {
      document.getElementById('movieModal').style.display = 'none';
    });
  } catch (error) {
    console.error('Error fetching torrents:', error);
    const showMore = document.querySelector('.show-more');
    if (!resultItem) {
      resultsContainer.innerHTML =
        '<p class="loading">Error fetching torrents. Try again later.</p>';
    } else if (showMore) {
      showMore.remove();
    }
  }
}
