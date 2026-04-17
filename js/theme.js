/* js/theme.js
   Theme toggle sequence:
   1. Tire button spins (ease-out-expo, 3 rotations, 900ms)
   2. At spin midpoint (~450ms): car.js flips lighting ONLY on the car
   3. After spin completes: CSS class toggled → page transitions over 600ms via CSS
   4. Page elements fade through via a ::after overlay wipe
*/
(function () {

  /* ── inject button ── */
  const btn = document.createElement('button');
  btn.id    = 'theme-toggle';
  btn.title = 'Toggle theme';
  btn.innerHTML = `
    <svg id="tire-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13"  stroke="currentColor" stroke-width="1.4"/>
      <circle cx="16" cy="16" r="8"   stroke="currentColor" stroke-width="1.0"/>
      <circle cx="16" cy="16" r="2.5" fill="currentColor"/>
      <line x1="16" y1="3"  x2="16" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="16" y1="19" x2="16" y2="29" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="3"  y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="19" y1="16" x2="29" y2="16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="8.5"  y1="8.5"  x2="13.5" y2="13.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="18.5" y1="18.5" x2="23.5" y2="23.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
  document.querySelector('nav').appendChild(btn);

  const tireSvg = document.getElementById('tire-svg');
  let spinning  = false;
  let angle     = 0;

  /* ── ease-out-expo ── */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function spinTire(duration, onCarFlip, onPageFlip) {
    if (spinning) return;
    spinning = true;

    const startAngle = angle;
    const totalDeg   = 1080;
    const start      = performance.now();
    let   carFlipped = false;

    function frame(now) {
      const t    = Math.min((now - start) / duration, 1);
      const ease = easeOutExpo(t);
      angle = startAngle + ease * totalDeg;
      tireSvg.style.transform = `rotate(${angle}deg)`;

      // car lighting flips at 45% through spin
      if (!carFlipped && t >= 0.45) {
        carFlipped = true;
        if (onCarFlip) onCarFlip();
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinning = false;
        if (onPageFlip) onPageFlip();
      }
    }
    requestAnimationFrame(frame);
  }

  /* ── page wipe overlay ── */
  function createWipe(color, onMidpoint) {
    // a full-screen div that scales in from center then out
    const wipe = document.createElement('div');
    Object.assign(wipe.style, {
      position:       'fixed',
      inset:          '0',
      zIndex:         '8999',
      background:     color,
      transformOrigin:'center center',
      transform:      'scaleY(0)',
      transition:     'transform 0.32s cubic-bezier(.76,0,.24,1)',
      pointerEvents:  'none',
    });
    document.body.appendChild(wipe);

    // scale in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wipe.style.transform = 'scaleY(1)';
      });
    });

    // at midpoint: apply theme class, then scale out
    setTimeout(() => {
      if (onMidpoint) onMidpoint();
      wipe.style.transition = 'transform 0.38s cubic-bezier(.76,0,.24,1)';
      wipe.style.transform  = 'scaleY(0)';
      setTimeout(() => wipe.remove(), 420);
    }, 340);
  }

  btn.addEventListener('click', () => {
    if (spinning) return;

    const goingLight = !document.body.classList.contains('light');
    const wipeColor  = goingLight ? '#e8ecf5' : '#04080f';

    spinTire(
      920,
      /* onCarFlip — car 3D lighting switches while tire is mid-spin */
      () => {
        // tell car.js to flip lighting for the car only
        // we pass a flag so car.js knows page hasn't changed yet
        if (window.flipCarLighting) window.flipCarLighting(goingLight);
      },
      /* onPageFlip — after spin, wipe the page */
      () => {
        createWipe(wipeColor, () => {
          document.body.classList.toggle('light');
          localStorage.setItem('mxc-theme',
            document.body.classList.contains('light') ? 'light' : 'dark');
          // now tell car.js page theme matches
          if (window.triggerThemeBurst) window.triggerThemeBurst();
        });
      }
    );
  });

  // restore on load
  if (localStorage.getItem('mxc-theme') === 'light') {
    document.body.classList.add('light');
    setTimeout(() => {
      if (window.triggerThemeBurst) window.triggerThemeBurst();
    }, 800);
  }

})();