import { defaultParams, globalParams, resultsContainer, getMovies, sortMovies } from './script.js';

function filterMovies() {
  const dropdowns = document.querySelectorAll('.dropdown');

  const genresArray = [];
  
  dropdowns.forEach((dd) => {
    const checkboxes = dd.querySelectorAll('input[type="checkbox"]');
    const radios = dd.querySelectorAll('input[type="radio"]');
    const toggle = dd.querySelector('.dropdown-toggle');
    const toggleText = toggle.textContent;
    const selectAllBtn = dd.querySelector('.selectAll');

    let IS_CHECKBOX_SELECTED = false;
    let IS_RADIO_SELECTED = false;

    dd.addEventListener('click', (e) => {
      if (IS_CHECKBOX_SELECTED || IS_RADIO_SELECTED) {
        dd.classList.add('bg-checked');
        dd.classList.remove('bg-clicked');
      }
      if (e.target.closest('.dropdown-menu')) return;

      dd.classList.toggle('open');

      if (!IS_CHECKBOX_SELECTED && !IS_RADIO_SELECTED) {
        if (dd.classList.contains('open')) {
          dd.classList.add('bg-clicked');
        } else {
          dd.classList.remove('bg-clicked');
        }
      }
    });

    selectAllBtn.addEventListener('click', () => {
      checkboxes.forEach((c) => (c.checked = false));
      radios.forEach((r) => (r.checked = false));
      IS_CHECKBOX_SELECTED = false;
      IS_RADIO_SELECTED = false;
      dd.classList.remove('bg-checked');
      dd.classList.remove('bg-clicked');
      dd.classList.remove('open');
      toggle.textContent = toggleText;
      if (dd.classList.contains('genre')) {
        defaultParams.with_genres = '';
      } else if (dd.classList.contains('rating-minimum')) {
        defaultParams['vote_average.lte'] = 10;
      } else if (dd.classList.contains('rating-maximum')) {
        defaultParams['vote_average.gte'] = 0;
      } else if (dd.classList.contains('language')) {
        defaultParams.with_original_language = 'en';
      }
      globalParams.default.page = 1;
      globalParams.search.page = 1;
      resultsContainer.innerHTML = '';
      getMovies(sortMovies());
    });

    checkboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        console.log('cb', dd);

        if (dd.classList.contains('genre')) {
          const genreId = cb.getAttribute('data-id');
          if (cb.checked) {
            if (!genresArray.includes(genreId)) genresArray.push(genreId);
          } else {
            const index = genresArray.indexOf(genreId);
            if (index > -1) genresArray.splice(index, 1);
          }
          defaultParams.with_genres = genresArray.join(',');
        }

        const selected = Array.from(checkboxes)
          .filter((i) => i.checked)
          .map((i) => i.parentElement.textContent.trim());

        IS_CHECKBOX_SELECTED = selected.length > 0;
        toggle.textContent = selected.length
          ? selected.length + ' ' + toggleText
          : toggleText;

        dd.classList.toggle('bg-checked', IS_CHECKBOX_SELECTED);
        dd.classList.toggle('bg-clicked', !IS_CHECKBOX_SELECTED);

        globalParams.default.page = 1;
        globalParams.search.page = 1;
        resultsContainer.innerHTML = '';
        getMovies(sortMovies());
      });
    });

    radios.forEach((radio) => {
      radio.addEventListener('change', () => {
        const selected = Array.from(radios)
          .filter((i) => i.checked)
          .map((i) => i.parentElement.textContent.trim());
        if (selected.length) {
          IS_RADIO_SELECTED = true;
          if (radio.checked) {
            if (dd.classList.contains('rating')) {
              toggle.textContent = `${toggleText}: ${selected[0]}`;
              const radioId = radio.getAttribute('value');
              if (dd.classList.contains('rating-minimum')) {
                defaultParams['vote_average.lte'] = radioId;
              } else if (dd.classList.contains('rating-maximum')) {
                defaultParams['vote_average.gte'] = radioId;
              }
            } else if (dd.classList.contains('language')) {
              console.warn('languge?');
              const languageId = radio.getAttribute('data-id');
              if (!defaultParams.with_original_language.includes(languageId))
                defaultParams.with_original_language = languageId;
            }
          }
          dd.classList.add('bg-checked');
          dd.classList.remove('bg-clicked');
        }
        globalParams.default.page = 1;
        globalParams.search.page = 1;
        resultsContainer.innerHTML = '';
        getMovies(sortMovies());
      });
    });
  });

  document.addEventListener('click', (e) => {
    dropdowns.forEach((dd) => {
      const toggleSign = dd.querySelector('.dropdown-sign');
      if (dd.contains(e.target)) return;
      if (dd.classList.contains('open')) {
        dd.classList.toggle('open');
        toggleSign.style.transform = 'scaleY(1)';
        dd.classList.remove('bg-clicked');
      }
    });
  });
}

export { filterMovies };