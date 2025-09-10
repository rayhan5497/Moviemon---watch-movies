const bars = document.querySelector('.bars');

let isScaleZero = true;

const toggleBarOptions = () => {
  const optionContainer = document.querySelector('.option-container');
  const bar1 = bars.firstElementChild;
  const bar2 = bar1.nextElementSibling;
  const bar3 = bar2.nextElementSibling;
  const backdrop = document.querySelector('.backdrop');
  const searchBar = document.querySelector('.search-bar');

  if (isScaleZero) {
    optionContainer.style.transform = 'scale(1)';
    isScaleZero = !isScaleZero;
    [bar1, bar2, bar3].forEach((bar) => (bar.style.backgroundColor = 'red'));
    backdrop.style.display = 'block';
    searchBar.style.zIndex = '10';
  } else {
    optionContainer.style.transform = 'scale(0)';
    isScaleZero = !isScaleZero;
    [bar1, bar2, bar3].forEach((bar) => (bar.style.backgroundColor = 'white'));
    backdrop.style.display = 'none';
    searchBar.style.zIndex = '20';
  }

  optionContainer.style.transform === 'scale(0)'
    ? (optionContainer.style.backgroundColor = 'transparent')
    : (optionContainer.style.backgroundColor = 'rgb(96, 96, 96)');

  if (optionContainer.style.transform === 'scale(1)') {
    bar1.style.transform = 'rotate(-135deg) translate(-25%, -10px)';
    bar2.style.opacity = '0';
    bar3.style.transform = 'rotate(135deg) translate(-25%, 10px)';
  } else {
    bar1.style.transform = 'rotate(0deg) translate(0)';
    bar2.style.opacity = '1';
    bar3.style.transform = 'rotate(0) translate(0)';
  }
};

const toggleScroll = () => {
  const html = document.documentElement;
  const body = document.body;
  if (!isScaleZero) {
    // html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
  } else {
    // html.style.overflow = '';
    body.style.overflow = '';
  }
};

const backdrop = document.querySelector('.backdrop');
backdrop.addEventListener('click', () => {
  toggleBarOptions();
  toggleScroll();
});

bars.addEventListener('click', () => {
  toggleBarOptions(), toggleScroll();
});
