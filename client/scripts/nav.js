import { hideBackdrop, showBackdrop } from './utils.js';

const bars = document.querySelector('.bars');
const barContainer = document.querySelector('.bar-container');
const optionContainer = document.querySelector('.option-container');

let isScaleZero = true;

const toggleBarOptions = () => {
  const bar1 = bars.firstElementChild;
  const bar2 = bar1.nextElementSibling;
  const bar3 = bar2.nextElementSibling;

  if (isScaleZero) {
    barContainer.style.position = 'absolute';
    bars.style.position = 'absolute';
    bars.style.margin = '10px';
    optionContainer.style.transform = 'scale(1)';
    isScaleZero = !isScaleZero;
    [bar1, bar2, bar3].forEach((bar) => (bar.style.backgroundColor = 'red'));
  } else {
    barContainer.style.position = 'relative';
    bars.style.position = 'relative';
    bars.style.margin = '';
    optionContainer.style.transform = 'scale(0)';
    isScaleZero = !isScaleZero;
    [bar1, bar2, bar3].forEach((bar) => (bar.style.backgroundColor = 'white'));
  }

  optionContainer.style.transform === 'scale(0)'
    ? (optionContainer.style.backgroundColor = 'transparent')
    : (optionContainer.style.backgroundColor = 'rgb(47, 47, 47)');

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

// const toggleScroll = () => {
//   const body = document.body;
//   if (!isScaleZero) {
//     body.style.overflow = 'hidden';
//   } else {
//     body.style.overflow = '';
//   }
// };

const executeOnHide = () => {
  toggleBarOptions();
  // toggleScroll();
};

bars.addEventListener('click', () => {
  toggleBarOptions(),
  //  toggleScroll(), 
   showBackdrop(barContainer, executeOnHide);
});
