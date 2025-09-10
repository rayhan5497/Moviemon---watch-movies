const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach((dd) => {
  const checkboxes = dd.querySelectorAll('input[type="checkbox"]');
  const radios = dd.querySelectorAll('input[type="radio"]');
  const toggleContainer = dd.querySelector('.dropdown-toggle-container');
  const toggle = dd.querySelector('.dropdown-toggle');
  const toggleSign = dd.querySelector('.dropdown-sign');
  const toggleText = toggle.textContent;

  // Toggle open/close
  dd.addEventListener('click', (e) => {
    if (e.target.closest('.dropdown-menu')) return;
    dd.classList.toggle('open');
    toggleSign.style.transform = dd.classList.contains('open')
      ? 'scaleY(-1)'
      : 'scaleY(1)';

  });

  // Checkbox changes
  checkboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      const selected = Array.from(checkboxes)
        .filter((i) => i.checked)
        .map((i) => i.parentElement.textContent.trim());

      if (selected.length) {
        toggle.textContent = selected.length + ' ' + toggleText;
        toggleContainer.style.backgroundColor = '#48c5fff1';

        toggle.style.color = 'black';
        toggleSign.style.color = 'black';
      } else {
        toggle.textContent = toggleText;
        toggleContainer.style.backgroundColor = 'rgb(106 106 106)';

        toggle.style.color = 'white';
        toggleSign.style.color = 'white';
      }
    });
  });

  // Radio changes
  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const selected = Array.from(radios)
        .filter((i) => i.checked)
        .map((i) => i.parentElement.textContent.trim());

      if (selected.length) {
        toggle.textContent = 'Rating: ' + selected[0];
        toggleContainer.style.backgroundColor = '#48c5fff1';
        toggle.style.color = 'black';
        toggleSign.style.color = 'black';
      } else {
        toggle.textContent = 'Rating';
        toggleContainer.style.backgroundColor = 'rgb(106 106 106)';
        toggle.style.color = 'white';
        toggleSign.style.color = 'white';
      }
    });
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  dropdowns.forEach((dd) => {
    if (!dd.contains(e.target)) {
      dd.classList.remove('open');
      const toggleSign = dd.querySelector('.dropdown-sign');
      toggleSign.style.transform = 'scaleY(1)';
    }
  });
});
