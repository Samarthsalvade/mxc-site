/* js/cursor.js — smooth custom cursor */
(function () {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let rx = 0, ry = 0; // ring position (lerped)
  let mx = 0, my = 0; // mouse position

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // lerp ring behind cursor
  function lerp(a, b, t) { return a + (b - a) * t; }
  function loop() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  // grow on interactive elements
  document.querySelectorAll('a, button, .m-card, .bento-cell, .testi-card, .p-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width  = '14px';
      dot.style.height = '14px';
      ring.style.width  = '54px';
      ring.style.height = '54px';
      ring.style.borderColor = 'rgba(0,229,255,0.6)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width  = '8px';
      dot.style.height = '8px';
      ring.style.width  = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(0,229,255,0.35)';
    });
  });
})();
