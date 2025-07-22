document.getElementById('searchBtn').addEventListener('click', searchTorrents);

async function searchTorrents() {
  const query = document.getElementById('searchInput').value;
  if (!query) return;

  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '<p class="loading">Loading...</p>';

  try {
    const response = await fetch(
      `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();

    resultsContainer.innerHTML = '';
    console.log('data', data);

    if (data.data.movies.length === 0) {
      resultsContainer.innerHTML = '<p class="loading">No torrents found.</p>';
      return;
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

      item.addEventListener('mouseenter', () => {
        const poster = movie.large_cover_image;
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
          }

        } catch (err) {
          console.error('Failed to fetch or play video:', err);
        }
      });
    });

    const closePlayer = document
      .querySelector('.close-player')
      .addEventListener(
        'click',
        () => {
          playerContainer.style.display = 'none';
          container.style.filter = 'none';
          videoPlayer.src= 'about:blank';
        }
      );

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
  } catch (error) {
    console.error('Error fetching torrents:', error);
    resultsContainer.innerHTML =
      '<p class="loading">Error fetching torrents. Try again later.</p>';
  }
}
