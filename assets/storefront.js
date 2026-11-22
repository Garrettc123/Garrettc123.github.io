(() => {
  'use strict';
  const search = document.getElementById('catalog-search');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-product]')];
  const counter = document.getElementById('result-count');
  const empty = document.getElementById('empty-results');
  const clear = document.getElementById('clear-search');
  if (!search || !cards.length) return;
  let category = 'all';
  const normalize = value => (value || '').toLocaleLowerCase().trim();
  function update() {
    const query = normalize(search.value);
    let visible = 0;
    for (const card of cards) {
      const categoryMatches = category === 'all' || card.dataset.category === category;
      const searchMatches = !query || normalize(card.dataset.search).includes(query);
      card.hidden = !(categoryMatches && searchMatches);
      if (!card.hidden) visible += 1;
    }
    counter.textContent = visible + ' of ' + cards.length + ' catalog entries';
    empty.hidden = visible !== 0;
    clear.hidden = query.length === 0 && category === 'all';
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    update();
  }));
  search.addEventListener('input', update);
  clear.addEventListener('click', () => {
    search.value = '';
    category = 'all';
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === 'all')));
    update();
    search.focus();
  });
  window.addEventListener('keydown', event => {
    const tag = event.target && event.target.tagName;
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT','TEXTAREA','SELECT'].includes(tag)) {
      event.preventDefault();
      search.focus();
    }
  });
  update();
})();
