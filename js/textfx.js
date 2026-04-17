/* js/textfx.js
   Word-by-word scramble using requestAnimationFrame (not setInterval).
   - RAF gives buttery smooth timing tied to display refresh
   - Slower resolve (60 frames per char instead of 4 ticks)
   - Chars fade out smoothly via opacity rather than hard replacement
   - Layout never shifts: min-width locked on each word span
*/
(function () {

  const CHARS   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const FPS     = 60;
  const FRAMES_PER_CHAR = 7; // higher = slower, smoother resolve

  /* ─────────────────────────────────────
     SCRAMBLE WORD  (RAF-based)
  ───────────────────────────────────── */
  function scrambleWord(span) {
    if (span._running) return;
    span._running = true;

    const original = span.dataset.original;
    const len      = original.length;
    let   tick     = 0;
    const total    = len * FRAMES_PER_CHAR;

    function frame() {
      if (!span._running) return;

      // how many chars have resolved from the left
      const resolved = Math.floor(tick / FRAMES_PER_CHAR);
      let out = '';

      for (let i = 0; i < len; i++) {
        if (original[i] === ' ') { out += ' '; continue; }
        if (i < resolved) {
          out += original[i];
        } else {
          // blend: chars near the resolve front look almost right
          const proximity = (tick - i * FRAMES_PER_CHAR) / FRAMES_PER_CHAR;
          if (proximity > 0.6 && Math.random() > 0.4) {
            out += original[i]; // peek through
          } else {
            out += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
      }

      span.textContent = out;
      tick++;

      if (tick <= total + FRAMES_PER_CHAR) {
        span._raf = requestAnimationFrame(frame);
      } else {
        span.textContent = original;
        span._running    = false;
      }
    }

    cancelAnimationFrame(span._raf);
    span._raf = requestAnimationFrame(frame);
  }

  function restoreWord(span) {
    cancelAnimationFrame(span._raf);
    span._running    = false;
    span.textContent = span.dataset.original;
  }

  /* ─────────────────────────────────────
     SPLIT HEADING into .fx-word spans
     Preserves <br>, <span class="grad">
  ───────────────────────────────────── */
  function splitHeading(el) {
    if (el.dataset.fxSplit) return;
    el.dataset.fxSplit = '1';

    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(tok => {
          if (/^\s+$/.test(tok)) {
            el.appendChild(document.createTextNode(tok));
          } else if (tok) {
            el.appendChild(makeWordSpan(tok, null));
          }
        });

      } else if (node.nodeName === 'BR') {
        el.appendChild(document.createElement('br'));

      } else {
        // coloured child span (e.g. .grad)
        const wrapper = node.cloneNode(false);
        node.textContent.split(/(\s+)/).forEach(tok => {
          if (/^\s+$/.test(tok)) {
            wrapper.appendChild(document.createTextNode(tok));
          } else if (tok) {
            wrapper.appendChild(makeWordSpan(tok, node));
          }
        });
        el.appendChild(wrapper);
      }
    });
  }

  function makeWordSpan(text, parentNode) {
    const span = document.createElement('span');
    span.className        = 'fx-word';
    span.textContent      = text;
    span.dataset.original = text;

    // inherit gradient style from parent if needed
    if (parentNode) {
      const cs = window.getComputedStyle(parentNode);
      span.style.background             = cs.background;
      span.style.webkitBackgroundClip   = 'text';
      span.style.webkitTextFillColor    = 'transparent';
      span.style.backgroundClip         = 'text';
    }

    // lock width after paint so scramble never causes reflow
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const w = span.getBoundingClientRect().width;
        if (w > 0) span.style.minWidth = w + 'px';
      });
    });

    span.addEventListener('mouseenter', () => scrambleWord(span));
    span.addEventListener('mouseleave', () => restoreWord(span));
    return span;
  }

  /* ─────────────────────────────────────
     MAGNETIC  (whole heading moves gently)
  ───────────────────────────────────── */
  function addMagnetic(el) {
    el.style.display    = 'block';
    el.style.willChange = 'transform';
    el.style.transition = 'transform 0.5s cubic-bezier(.16,1,.3,1)';

    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.05;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.05;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  }

  /* ─────────────────────────────────────
     INIT
  ───────────────────────────────────── */
  function init() {
    document.querySelectorAll('.hero-title, .section-title, .cta-title').forEach(el => {
      if (el.closest('a')) return;
      splitHeading(el);
      addMagnetic(el);
    });

    // magnetic on stat numbers
    document.querySelectorAll('.stat-num, .stat-plus').forEach(el => {
      el.style.display    = 'inline-block';
      el.style.willChange = 'transform';
      el.style.transition = 'transform 0.4s cubic-bezier(.16,1,.3,1)';
      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.1}px,${(e.clientY-r.top-r.height/2)*.1}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200); // wait for fonts
  }

})();