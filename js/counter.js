/* js/counter.js — animated number counters */
(function () {
  const counters = document.querySelectorAll('.stat-num[data-count]');

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count);
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.floor(easeOut(progress) * target);
      // format with K
      el.textContent = value >= 1000
        ? (value / 1000).toFixed(1).replace('.0', '') + 'K'
        : value;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target >= 1000
        ? (target / 1000).toFixed(1).replace('.0', '') + 'K'
        : target;
    }
    requestAnimationFrame(tick);
  }

  // trigger when hero stats come into view
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
})();
