/* js/car.js
   Detailed wireframe sports car — fixed background, full viewport.
   Scroll drives Y rotation. Mouse tilts pitch + roll.
*/
(function () {
  const canvas = document.getElementById('car-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, dpr;
  let scrollY = 0, mouseX = 0.5, mouseY = 0.5;
  let rotY = 0, tiltX = 0, tiltZ = 0;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll',    () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('mousemove', e  => { mouseX = e.clientX/W; mouseY = e.clientY/H; });

  /* ══════════════════════════════════════════════════════
     VERTICES  — low-poly sports car (side profile ~5.5m)
     x = length (front +), y = height (up +), z = width (right +)
  ══════════════════════════════════════════════════════ */
  const V = [
    // ── 0-3  CHASSIS FLOOR ──
    [-2.6,-0.75,-1.05], [ 2.6,-0.75,-1.05],
    [ 2.6,-0.75, 1.05], [-2.6,-0.75, 1.05],

    // ── 4-7  SILL RAIL ──
    [-2.6, -0.1,-1.05], [ 2.6, -0.1,-1.05],
    [ 2.6, -0.1, 1.05], [-2.6, -0.1, 1.05],

    // ── 8-11 CABIN BASE ──
    [-1.25, -0.1,-0.88], [ 1.25, -0.1,-0.88],
    [ 1.25, -0.1, 0.88], [-1.25, -0.1, 0.88],

    // ── 12-15 CABIN ROOF ──
    [-0.85, 1.05,-0.72], [ 0.85, 1.05,-0.72],
    [ 0.85, 1.05, 0.72], [-0.85, 1.05, 0.72],

    // ── 16-19 A-PILLAR (front cabin uprights) ──
    [ 1.25, -0.1,-0.88], [ 1.25, -0.1, 0.88],
    [ 0.85,  1.05,-0.72], [ 0.85, 1.05, 0.72],

    // ── 20-23 C-PILLAR (rear cabin uprights) ──
    [-1.25, -0.1,-0.88], [-1.25, -0.1, 0.88],
    [-0.85,  1.05,-0.72], [-0.85,  1.05, 0.72],

    // ── 24-27 WINDSCREEN MIDLINE ──
    [ 1.05,  0.0,-0.88], [ 1.05,  0.0, 0.88],
    [ 0.85,  1.05,-0.72], [ 0.85, 1.05, 0.72],

    // ── 28-35 HOOD (bonnet) ──
    [ 1.25, -0.1,-0.88],[ 2.6, -0.1,-0.88],
    [ 2.6,  -0.1, 0.88],[ 1.25,-0.1, 0.88],
    [ 1.25, -0.1,-0.5 ],[ 2.6, -0.1,-0.5 ],   // hood crease left
    [ 2.6,  -0.1, 0.5 ],[ 1.25,-0.1, 0.5 ],   // hood crease right

    // ── 36-43 FRONT FASCIA ──
    [ 2.6,  -0.1,-0.88],[ 2.75,-0.1,-0.7 ],
    [ 2.75,-0.1, 0.7 ],[ 2.6, -0.1, 0.88],
    [ 2.75,-0.1,-0.7 ],[ 2.75,-0.1, 0.7 ],     // bumper centre span
    [ 2.75,-0.55,-0.7],[ 2.75,-0.55, 0.7],     // lower bumper

    // ── 44-49 FRONT SPLITTER ──
    [ 2.75,-0.55,-0.65],[ 2.75,-0.55, 0.65],
    [ 2.9, -0.75,-0.65],[ 2.9, -0.75, 0.65],
    [ 2.75,-0.75,-0.65],[ 2.75,-0.75, 0.65],

    // ── 50-57 HEADLIGHT FRAMES ──
    [ 2.55,-0.05,-0.95],[ 2.75,-0.05,-0.95],   // left outer
    [ 2.75,-0.05,-0.6 ],[ 2.55,-0.05,-0.6 ],
    [ 2.55,-0.05, 0.95],[ 2.75,-0.05, 0.95],   // right outer
    [ 2.75,-0.05, 0.6 ],[ 2.55,-0.05, 0.6 ],

    // ── 58-65 REAR FASCIA ──
    [-2.6, -0.1,-0.88],[-2.75,-0.1,-0.7 ],
    [-2.75,-0.1, 0.7 ],[-2.6, -0.1, 0.88],
    [-2.75,-0.1,-0.7 ],[-2.75,-0.1, 0.7 ],
    [-2.75,-0.55,-0.7],[-2.75,-0.55, 0.7],

    // ── 66-71 REAR DIFFUSER ──
    [-2.75,-0.55,-0.65],[-2.75,-0.55, 0.65],
    [-2.9, -0.75,-0.65],[-2.9, -0.75, 0.65],
    [-2.75,-0.75,-0.65],[-2.75,-0.75, 0.65],

    // ── 72-79 TAIL LIGHTS ──
    [-2.55,-0.05,-0.95],[-2.75,-0.05,-0.95],
    [-2.75,-0.05,-0.6 ],[-2.55,-0.05,-0.6 ],
    [-2.55,-0.05, 0.95],[-2.75,-0.05, 0.95],
    [-2.75,-0.05, 0.6 ],[-2.55,-0.05, 0.6 ],

    // ── 80-83 ROOF SCOOP / SUNROOF ──
    [-0.3,  1.06,-0.45],[ 0.3,  1.06,-0.45],
    [ 0.3,  1.06, 0.45],[-0.3,  1.06, 0.45],

    // ── 84-91 REAR SPOILER ──
    [-1.5,  1.1,-0.9 ],[-0.85, 1.1,-0.9 ],
    [-0.85, 1.1, 0.9 ],[-1.5,  1.1, 0.9 ],    // blade
    [-1.5,  1.05,-0.9],[-1.5,  0.85,-0.9],    // left end plate
    [-1.5,  1.05, 0.9],[-1.5,  0.85, 0.9],    // right end plate

    // ── 92-99 DOOR PANEL LINES ──
    [ 0.25,-0.1,-1.05],[ 0.25, 0.82,-1.05],   // front door left
    [ 0.25,-0.1, 1.05],[ 0.25, 0.82, 1.05],
    [-0.25,-0.1,-1.05],[-0.25, 0.82,-1.05],   // rear door left
    [-0.25,-0.1, 1.05],[-0.25, 0.82, 1.05],

    // ── 100-107 SIDE SKIRTS ──
    [ 2.4,-0.55,-1.05],[ 2.4,-0.75,-1.05],
    [-2.4,-0.55,-1.05],[-2.4,-0.75,-1.05],
    [ 2.4,-0.55, 1.05],[ 2.4,-0.75, 1.05],
    [-2.4,-0.55, 1.05],[-2.4,-0.75, 1.05],

    // ── 108-111 SIDE VENTS (behind front wheel) ──
    [ 1.7,-0.1,-1.05],[ 1.9,-0.1,-1.05],
    [ 1.9,-0.4,-1.05],[ 1.7,-0.4,-1.05],

    // ── 112-115 SIDE VENTS right ──
    [ 1.7,-0.1, 1.05],[ 1.9,-0.1, 1.05],
    [ 1.9,-0.4, 1.05],[ 1.7,-0.4, 1.05],

    // ── 116-123 WINDOW FRAMES ──
    [ 1.05, 0.05,-0.87],[ 0.95, 1.0,-0.71],   // front left
    [ 0.95, 1.0,-0.71],[-0.85, 1.0,-0.71],
    [-0.85, 1.0,-0.71],[-1.1,  0.05,-0.87],
    [ 1.05, 0.05, 0.87],[ 0.95, 1.0, 0.71],   // front right
    [ 0.95, 1.0, 0.71],[-0.85, 1.0, 0.71],
    [-0.85, 1.0, 0.71],[-1.1,  0.05, 0.87],

    // ── 128-131 UNDERCARRIAGE ──
    [ 2.0,-0.75,-0.8],[ 2.0,-0.75, 0.8],
    [-2.0,-0.75,-0.8],[-2.0,-0.75, 0.8],

    // ── 132-135 EXHAUST TIPS ──
    [-2.75,-0.58,-0.55],[-2.75,-0.58,-0.38],
    [-2.75,-0.58, 0.38],[-2.75,-0.58, 0.55],

    // ── 136-143 WHEEL ARCH DETAIL front ──
    [ 1.85, 0.0,-1.05],[ 1.85,-0.75,-1.05],
    [ 1.15, 0.0,-1.05],[ 1.15,-0.75,-1.05],
    [ 1.85, 0.0, 1.05],[ 1.85,-0.75, 1.05],
    [ 1.15, 0.0, 1.05],[ 1.15,-0.75, 1.05],

    // ── 144-151 WHEEL ARCH DETAIL rear ──
    [-1.15, 0.0,-1.05],[-1.15,-0.75,-1.05],
    [-1.85, 0.0,-1.05],[-1.85,-0.75,-1.05],
    [-1.15, 0.0, 1.05],[-1.15,-0.75, 1.05],
    [-1.85, 0.0, 1.05],[-1.85,-0.75, 1.05],

    // ── 152-155 WHEEL CENTRES ──
    [ 1.5,-0.75,-1.05],[ 1.5,-0.75, 1.05],
    [-1.5,-0.75,-1.05],[-1.5,-0.75, 1.05],
  ];

  const EDGES = [
    // chassis
    [0,1],[1,2],[2,3],[3,0], [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7],
    // cabin
    [8,9],[9,10],[10,11],[11,8],
    [12,13],[13,14],[14,15],[15,12],
    [8,12],[9,13],[10,14],[11,15],
    // A-pillars
    [16,18],[17,19],
    // C-pillars
    [20,22],[21,23],
    // windscreen mid
    [24,26],[25,27],
    // hood outline + creases
    [28,29],[29,30],[30,31],[31,28],
    [32,33],[34,35],[32,35],[33,34],
    // front fascia
    [36,37],[37,38],[38,39],
    [40,41],[42,43],[40,42],[41,43],
    // front splitter
    [44,45],[46,47],[44,46],[45,47],[44,48],[45,49],
    // headlights left
    [50,51],[51,52],[52,53],[53,50],
    // headlights right
    [54,55],[55,56],[56,57],[57,54],
    // rear fascia
    [58,59],[59,60],[60,61],
    [62,63],[64,65],[62,64],[63,65],
    // diffuser
    [66,67],[68,69],[66,68],[67,69],[66,70],[67,71],
    // tail lights left
    [72,73],[73,74],[74,75],[75,72],
    // tail lights right
    [76,77],[77,78],[78,79],[79,76],
    // roof scoop
    [80,81],[81,82],[82,83],[83,80],
    // spoiler blade
    [84,85],[85,86],[86,87],[87,84],
    // spoiler endplates
    [84,88],[88,89],[86,90],[90,91],
    // doors
    [92,93],[94,95],[96,97],[98,99],
    [92,96],[93,97],
    // side skirts
    [100,101],[102,103],[104,105],[106,107],
    [100,102],[101,103],[104,106],[105,107],
    // side vents left
    [108,109],[109,110],[110,111],[111,108],
    // side vents right
    [112,113],[113,114],[114,115],[115,112],
    // window frames
    [116,117],[117,118],[118,119],
    [120,121],[121,122],[122,123],
    // undercarriage cross
    [128,129],[130,131],[128,130],[129,131],
    // exhaust
    [132,133],[134,135],
    // wheel arches front
    [136,137],[138,139],[136,138],[137,139],
    [140,141],[142,143],[140,142],[141,143],
    // wheel arches rear
    [144,145],[146,147],[144,146],[145,147],
    [148,149],[150,151],[148,150],[149,151],
  ];

  // wheel centre indices
  const WHEELS = [152, 153, 154, 155];

  /* ── projection ── */
  function project(v, rY, rX, rZ, cx, cy, scale) {
    let [x,y,z] = v;
    let cosY=Math.cos(rY),sinY=Math.sin(rY);
    let x1= x*cosY+z*sinY, z1=-x*sinY+z*cosY;
    let cosX=Math.cos(rX),sinX=Math.sin(rX);
    let y2= y*cosX-z1*sinX, z2= y*sinX+z1*cosX;
    let cosZ=Math.cos(rZ),sinZ=Math.sin(rZ);
    let x3= x1*cosZ-y2*sinZ, y3= x1*sinZ+y2*cosZ;
    const fov=5.5, pz=z2+fov;
    return [(x3/pz)*scale+cx, (-y3/pz)*scale+cy, pz, z2];
  }
  function lerp(a,b,t){ return a+(b-a)*t; }

  /* ── draw ── */
  function draw() {
    ctx.clearRect(0,0,W,H);

    const pageH = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const sf    = Math.min(1, scrollY / pageH);
    const tgtY  = sf * Math.PI * 4 + (mouseX-0.5)*0.7;
    const tgtX  = (mouseY-0.5)*0.45;
    const tgtZ  = (mouseX-0.5)*0.18;

    rotY  = lerp(rotY,  tgtY,  0.035);
    tiltX = lerp(tiltX, tgtX,  0.055);
    tiltZ = lerp(tiltZ, tgtZ,  0.055);

    const scale = Math.min(W,H) * 0.40;
    const cx = W*0.5, cy = H*0.53;

    const P = V.map(v => project(v, rotY, tiltX, tiltZ, cx, cy, scale));

    // ── draw edges with depth-based brightness ──
    EDGES.forEach(([a,b]) => {
      const [ax,ay,,az]=P[a], [bx,by,,bz]=P[b];
      const depth = (az+bz)*0.5;
      const alpha = Math.max(0.04, 0.6-depth*0.065);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth   = 0.7;
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
    });

    // ── headlight glow rects ──
    [[50,52],[54,56]].forEach(([a,b]) => {
      const [ax,ay]=P[a], [bx,by]=P[b];
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(Math.min(ax,bx)-2, Math.min(ay,by)-2,
                   Math.abs(bx-ax)+4, Math.abs(by-ay)+4);
    });

    // ── tail light glow rects (warm tint) ──
    [[72,74],[76,78]].forEach(([a,b]) => {
      const [ax,ay]=P[a], [bx,by]=P[b];
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#ff3030';
      ctx.fillRect(Math.min(ax,bx)-2, Math.min(ay,by)-2,
                   Math.abs(bx-ax)+4, Math.abs(by-ay)+4);
    });

    // ── wheels ──
    WHEELS.forEach((i,wi) => {
      const [px,py,pz]=P[i];
      const r = scale * 0.24 / Math.max(pz,0.5);
      // tyre
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth   = 1.0;
      ctx.beginPath(); ctx.ellipse(px,py, r, r*0.27, 0, 0, Math.PI*2); ctx.stroke();
      // rim ring
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.ellipse(px,py, r*0.65, r*0.65*0.27, 0, 0, Math.PI*2); ctx.stroke();
      // spokes
      for (let s=0;s<6;s++){
        const a=(s/6)*Math.PI*2 + rotY*(wi<2?2.8:-2.8);
        ctx.globalAlpha = 0.22;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px+Math.cos(a)*r, py+Math.sin(a)*r*0.27);
        ctx.stroke();
      }
      // centre hub dot
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2); ctx.fill();
    });

    // ── vertex glow dots ──
    ctx.fillStyle = '#00e5ff';
    P.forEach(([px,py,,depth],i) => {
      if(i > 131) return; // skip wheel-arch extra verts
      const a = Math.max(0.04, 0.45-depth*0.055);
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(px,py,1.3,0,Math.PI*2); ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
