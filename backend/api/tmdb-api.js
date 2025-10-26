const api_key = process.env.TMDB_API_KEY;

let defaultParams = {};

let isHomePage = true;
let isSearchPage = false;

let passedMovie = 0;
let MovieSkipped = 0;
let filterAdult = true;

async function initGetMoviesApp(queryParams) {
  defaultParams = { ...queryParams, api_key: api_key };
  if (defaultParams.query) {
    isSearchPage = true;
    isHomePage = false;
  } else {
    isHomePage = true;
    isSearchPage = false;
  }
  console.log('defaultParams in initGetMoviesApp:', defaultParams);
  try {
    console.log('initGetMoviesApp called');
    return getMovies(sortMovies());
  } catch (error) {
    console.error('Error initGetMoviesApp:', error);
  }
}

const sortMovies = () => {
  return defaultParams;
};

async function getMovieDetails(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}`;
  const params = {
    api_key: api_key,
    append_to_response:
      'credits,videos,images,recommendations,similar,release_dates,keywords,alternative_titles,watch/providers',
  };

  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${url}?${query}`);
  const data = await response.json();
  return data;
}

async function getMovies(sortedMovies) {
  let query = sortedMovies;
  if (!query) {
    console.log('no query');
    return;
  } else {
    console.log('query');
  }

  try {
    const discoverUrl = 'https://api.themoviedb.org/3/discover/movie';
    const SearchUrl = 'https://api.themoviedb.org/3/search/movie';

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

    const data = await response.json();

    console.log('data length', data.results.length)

    if (data.results.length === 0) {
      console.log('data', 0);
      if (data === previousData) return;
    }

    let filteredMovies = [];
    async function processMovies(movies) {
      let filteredIds = [];
      for (const movie of movies) {
        if (filterAdult) {
          if (movie.adult === true) {
            console.warn(
              'adult movie',
              movie.adult,
              'title',
              movie.title,
              movie
            );

            continue;
          }

          const adultKeywords = [
            'xxx',
            'erotic',
            'porn',
            '18\\+',
            'hardcore',
            'softcore',
            'adult',
            'tit',
            'breast',
            'boob',
            'cock',
            'dick',
            'puss',
            'vagin',
            'penis',
            'nud',
            'sex',
            'erot',
            'obscene',
            'lewd',
            'suggestive',
            'smut',
            'seduc',
            'bust',
            'massag',
            'genital',
            'lust',
            'bisexual',
            'bisex',
            'boobi',
            'sexual',
            'sexualit',
            'nudit',
            'sexo',
            'sexolog',
            'sexiest',
            'porno',
            'sextoy',
          ];

          const descriptors = [
            'big',
            'hot',
            'sexy',
            'naked',
            'bare',
            'full',
            'curvy',
            'young',
            'erotic',
          ];

          const keywordRequireDescriptors = [
            'girl',
            'women',
            'servic',
            'club',
            'massag',
          ];

          const adultRegex = new RegExp(
            `\\b(${adultKeywords.join('|')})(y|e|s|es|ed|ing|tive)?\\b` +
              `|\\b(${descriptors.join(
                '|'
              )})\\s+(${keywordRequireDescriptors.join(
                '|'
              )})(y|e|s|es|ed|ing|tive)?\\b`,
            'gi'
          );

          const text = movie.title + ' ' + movie.overview;
          const matches = [...text.matchAll(adultRegex)];

          if (matches.length > 0) {
            matches.forEach((match) => {
              const standaloneKeyword = match[1] || null;
              const descriptor = match[3] || null;
              const descriptorKeyword = match[4] || null;
              console.log(
                `adult movie, skipping > reason: Descriptor: ${descriptor}, Keyword: ${descriptorKeyword}, Standalone Keyword: ${standaloneKeyword}, 'Title:',
                ${movie.title}`
              );
            });

            MovieSkipped++;
            continue;
          }

          filteredIds.push(movie.id);
        }
      }

      // Filter Movies by keywords after getting individual data of each movies.
      const detailedMovies = await Promise.all(
        filteredIds.map((id) => getMovieDetails(id))
      );


      console.log('filteredIds', filteredIds.length);
      console.log('detailedMovies', detailedMovies.length);

      if (detailedMovies.length < 0) return;

      for (const movie of detailedMovies) {
        const hasAdultKeyword = movie.keywords?.keywords?.some(
          (k) =>
            k.id === 155477 ||
            k.id === 321739 ||
            k.id === 264386 ||
            k.id === 738 ||
            k.id === 596 ||
            k.id === 190370 ||
            k.id === 256466 ||
            k.id === 159551
        );
        if (hasAdultKeyword) {
          console.log('(keyword) Adult movie, skipping:', movie.title);
          MovieSkipped++;
          continue; // stops processing this movie, moves to next
        }
        filteredMovies.push(movie);
        passedMovie++;
      }
      console.log('filteredMovies', filteredMovies.length)
      console.log('skippedMovies', MovieSkipped);
      console.log('passedMovie', passedMovie);
    }

    await processMovies(data.results);

    let finalData = {
      page: data.page,
      results: filteredMovies,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };

    return finalData;
  } catch (error) {
    console.error('Error fetching torrents:', error);
  }
}

module.exports = {
  initGetMoviesApp,
};
