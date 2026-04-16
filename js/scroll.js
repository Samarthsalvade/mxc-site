/* js/scroll.js — all scroll-driven animations */
(function () {

  /* ── NAV scroll state ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ── Hero staggered entrance ── */
  const animEls = document.querySelectorAll('[data-anim]');
  animEls.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('animated'), 200 + delay);
  });

  /* ── Apple-style sticky word reveal ── */
  const stickyBlock = document.getElementById('sticky-block');
  const words = document.querySelectorAll('#sticky-words .w');
  const totalWords = words.length;

  function updateWords() {
    if (!stickyBlock) return;
    const rect  = stickyBlock.getBoundingClientRect();
    const scrolled = -rect.top;
    const total = stickyBlock.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrolled / total));
    const litCount = Math.round(progress * (totalWords + 2));
    words.forEach((w, i) => w.classList.toggle('lit', i < litCount));
  }

  /* ── IntersectionObserver for bento/testi/pricing ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  window.addEventListener('scroll', updateWords, { passive: true });
  updateWords();

})();
