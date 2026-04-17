/* js/modal.js — showcase modal with animated highlights */

const PLANS = {
  starter: {
    tag: 'Starter Plan',
    title: 'STARTER',
    desc: 'Perfect for new server owners looking to dip their toes into premium FiveM assets without a huge commitment.',
    color: '#22d3ee',
    highlights: [
      { icon: 'package',      title: '5 Scripts',  desc: 'Hand-picked starter scripts',  num: '5',     color: '#22d3ee' },
      { icon: 'zap',          title: 'Fast Setup',  desc: 'Plug and play in minutes',     num: '<5min', color: '#3b82f6' },
      { icon: 'shield-check', title: 'Support',     desc: 'Standard ticket support',      num: '24h',   color: '#6366f1' },
    ],
    bars: [
      { label: 'Script Quality', val: 80 },
      { label: 'Support Speed',  val: 60 },
      { label: 'Content Access', val: 30 },
    ]
  },
  collector: {
    tag: 'Most Popular',
    title: 'COLLECTOR',
    desc: 'Trusted by thousands of serious server owners. Unlock everything MXC has to offer — scripts, maps, interiors, and more.',
    color: '#1e60ff',
    highlights: [
      { icon: 'key',        title: 'All Products',  desc: 'Every script and map included',     num: '50+',   color: '#00e5ff' },
      { icon: 'gauge',      title: 'Zero FPS Drop', desc: 'Obsessively optimized',              num: '0.00ms',color: '#1e60ff' },
      { icon: 'rocket',     title: 'Early Access',  desc: 'New releases before anyone else',   num: '1st',   color: '#7c3aed' },
    ],
    bars: [
      { label: 'Script Quality', val: 100 },
      { label: 'Support Speed',  val: 90  },
      { label: 'Content Access', val: 100 },
    ]
  },
  enterprise: {
    tag: 'Enterprise Plan',
    title: 'ENTERPRISE',
    desc: 'Built for large networks and development studios that demand custom work, private assets, and a dedicated support agent.',
    color: '#7c3aed',
    highlights: [
      { icon: 'pen-tool', title: 'Custom Mods',     desc: 'Modifications built for your server', num: '∞',       color: '#7c3aed' },
      { icon: 'headphones',title: 'Dedicated Agent',desc: 'Your personal support line',          num: '1-on-1',  color: '#00e5ff' },
      { icon: 'lock',     title: 'Private Assets',  desc: 'Exclusive content only for you',      num: 'Private', color: '#1e60ff' },
    ],
    bars: [
      { label: 'Script Quality', val: 100 },
      { label: 'Support Speed',  val: 100 },
      { label: 'Content Access', val: 100 },
    ]
  }
};

function openModal(planKey) {
  const plan    = PLANS[planKey];
  const overlay = document.getElementById('modal-overlay');
  const box     = document.getElementById('modal-box');
  const closeBtn = document.getElementById('modal-close');

  // Build inner HTML
  box.innerHTML = `
    <button class="modal-close" id="modal-close-inner">✕</button>

    <!-- hero strip with mini canvas -->
    <div class="m-hero-strip" style="background: linear-gradient(135deg, #04080f, #060d1e);">
      <canvas id="modal-canvas"></canvas>
      <div class="modal-particles" id="modal-particles"></div>
      <span class="m-hero-label">${plan.title}</span>
    </div>

    <div class="modal-content">
      <div class="modal-plan-tag">${plan.tag}</div>
      <h2 class="modal-plan-title">${plan.title}</h2>
      <p class="modal-plan-desc">${plan.desc}</p>

      <!-- HIGHLIGHT CARDS -->
      <div class="modal-highlights">
        ${plan.highlights.map((h, i) => `
          <div class="m-hl" style="--hl-color:${h.color}; animation-delay:${i * 0.1}s;">
            <div class="m-hl-icon"><i data-lucide="${h.icon}"></i></div>
            <div class="m-hl-title">${h.title}</div>
            <div class="m-hl-desc">${h.desc}</div>
            <div class="m-hl-num">${h.num}</div>
          </div>
        `).join('')}
      </div>

      <!-- STAT BARS -->
      <div class="modal-bars">
        <h3>Performance Metrics</h3>
        ${plan.bars.map(b => `
          <div class="bar-row">
            <div class="bar-label"><span>${b.label}</span><span>${b.val}%</span></div>
            <div class="bar-track"><div class="bar-fill" data-val="${b.val}"></div></div>
          </div>
        `).join('')}
      </div>

      <!-- CTA -->
      <div class="modal-cta-row">
        <button class="btn-primary" onclick="closeModal()">Subscribe — €${planKey === 'starter' ? 9 : planKey === 'collector' ? 29 : 79}/mo</button>
        <button class="btn-ghost" onclick="closeModal()">Learn More →</button>
      </div>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // render lucide icons injected into modal HTML
  if (window.lucide) lucide.createIcons();

  // close buttons
  box.querySelector('#modal-close-inner').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  // animate bars after open
  setTimeout(() => {
    box.querySelectorAll('.bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.val + '%';
    });
  }, 500);

  // spawn floating particles
  spawnParticles(plan.color);

  // mini canvas animation in hero strip
  startModalCanvas(plan.color);
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  // stop modal canvas
  if (window._modalRaf) cancelAnimationFrame(window._modalRaf);
}

function spawnParticles(color) {
  const container = document.getElementById('modal-particles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'm-particle';
    const size = 40 + Math.random() * 80;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${4 + Math.random() * 5}s;
      animation-delay: ${-Math.random() * 6}s;
      background: radial-gradient(circle, ${color}55, transparent 70%);
    `;
    container.appendChild(p);
  }
}

function startModalCanvas(accentColor) {
  const canvas = document.getElementById('modal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 780;
  const H = canvas.offsetHeight || 200;
  canvas.width  = W;
  canvas.height = H;

  // draw sweeping scan lines + grid for a techy feel
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = 'rgba(0,229,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // scanning line
    const scanX = ((t * 0.6) % (W + 60)) - 30;
    const grad = ctx.createLinearGradient(scanX - 40, 0, scanX + 40, 0);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, accentColor + '55');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(scanX - 40, 0, 80, H);

    // corner brackets
    const bSize = 18, bGap = 14;
    ctx.strokeStyle = accentColor + 'aa';
    ctx.lineWidth = 1.5;
    [[bGap, bGap], [W - bGap, bGap], [W - bGap, H - bGap], [bGap, H - bGap]].forEach(([cx, cy], i) => {
      const sx = cx + (i === 0 || i === 3 ? 0 : -bSize) + (i === 0 || i === 3 ? 0 : bSize);
      ctx.beginPath();
      const dx = (i === 1 || i === 2) ? -1 : 1;
      const dy = (i === 2 || i === 3) ? -1 : 1;
      ctx.moveTo(cx, cy + dy * bSize);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * bSize, cy);
      ctx.stroke();
    });

    t++;
    window._modalRaf = requestAnimationFrame(draw);
  }
  draw();
}

// expose globally
window.openModal  = openModal;
window.closeModal = closeModal;
