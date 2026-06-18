(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    const activate = (index) => {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => activate(activeIndex + 1), 5200);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        activate(index);
        restart();
      });
    });

    restart();
  }

  const scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach((scope) => {
    const input = scope.querySelector('[data-search-input]');
    const buttons = Array.from(scope.querySelectorAll('[data-filter]'));
    const list = scope.parentElement.querySelector('[data-card-list]');
    const cards = list ? Array.from(list.children) : [];
    let activeFilter = 'all';

    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : '';

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags,
          card.textContent
        ].join(' ').toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesFilter = activeFilter === 'all' || haystack.includes(activeFilter.toLowerCase());
        card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter || 'all';
        buttons.forEach((item) => item.classList.toggle('is-active', item === button));
        apply();
      });
    });
  });
})();
