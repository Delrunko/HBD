// À charger APRÈS GSAP et APRÈS ton script existant (juste avant </body>)
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const inputs = $$('.in input');

  // Titre découpé en lettres
  const h1 = $('.card1 h1');
  if (h1) {
    const t = h1.textContent.trim(); h1.textContent = '';
    [...t].forEach(c => { const s = document.createElement('span'); s.textContent = c === ' ' ? '\u00A0' : c; h1.appendChild(s); });
  }

  // Touches spéciales : * = effacer, # = valider
  $$('.nb').forEach(b => { const v = b.textContent.trim(); if (v === '*' || v === '#') b.classList.add('special'); });

  // Cœurs flottants
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('div');
    h.className = 'fx-heart'; h.textContent = '♥';
    h.style.left = gsap.utils.random(0, 100) + 'vw';
    h.style.fontSize = gsap.utils.random(14, 36) + 'px';
    document.body.appendChild(h);
    gsap.to(h, { y: -(innerHeight + 100), x: '+=' + gsap.utils.random(-40, 40), rotation: gsap.utils.random(-40, 40),
      duration: gsap.utils.random(8, 15), delay: gsap.utils.random(0, 8), repeat: -1, ease: 'none' });
  }

  // Intro
  const intro = gsap.timeline({ paused: document.body.hasAttribute('data-start') })
    .from('.card1', { y: -80, autoAlpha: 0, duration: .9, ease: 'back.out(1.6)' })
    .from('.card1 h1 span', { y: 40, autoAlpha: 0, rotation: () => gsap.utils.random(-25, 25), stagger: .045, duration: .6, ease: 'back.out(2.5)' }, '-=.5')
    .from('.nombre', { y: 80, autoAlpha: 0, duration: .9, ease: 'back.out(1.6)' }, '-=.9')
    .from('.nombre h2', { autoAlpha: 0, y: 10, duration: .5 }, '-=.4')
    .from(inputs, { scale: 0, stagger: .08, duration: .5, ease: 'back.out(3)' }, '-=.3')
    .from('.nb', { scale: 0, autoAlpha: 0, stagger: .035, duration: .5, ease: 'back.out(2.2)' }, '-=.3')
    .add(() => {
      gsap.to('.card1 h1 span', { y: -6, duration: .6, ease: 'sine.inOut', stagger: { each: .08, repeat: -1, yoyo: true } });
      gsap.to('.pict img', { objectPosition: '50% 25%', duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });

  // Mini-cœurs qui jaillissent du doigt
  function burst(x, y) {
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('i');
      p.className = 'fx-pop'; p.textContent = '♥';
      p.style.left = x + 'px'; p.style.top = y + 'px';
      document.body.appendChild(p);
      gsap.to(p, { x: gsap.utils.random(-50, 50), y: gsap.utils.random(-80, -30), rotation: gsap.utils.random(-60, 60),
        opacity: 0, scale: gsap.utils.random(.6, 1.4), duration: .8, ease: 'power2.out', onComplete: () => p.remove() });
    }
  }

  if (document.body.hasAttribute('data-start')) addEventListener('maria:start', () => intro.play(), { once: true });

  // Touches : rebond + ripple + cœurs + vibration
  $$('.nb').forEach(b => {
    b.addEventListener('pointerdown', e => {
      gsap.to(b, { scale: .86, duration: .1 });
      const r = b.getBoundingClientRect(), rip = document.createElement('span');
      rip.className = 'rip';
      rip.style.left = (e.clientX - r.left) + 'px'; rip.style.top = (e.clientY - r.top) + 'px';
      b.appendChild(rip);
      gsap.fromTo(rip, { scale: 0, opacity: 1 }, { scale: 9, opacity: 0, duration: .6, onComplete: () => rip.remove() });
      burst(e.clientX, e.clientY); buzz(12);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
      b.addEventListener(ev, () => gsap.to(b, { scale: 1, duration: .5, ease: 'elastic.out(1.2,.4)' })));
    b.addEventListener('click', () => { // s'exécute après ta logique
      if (b.textContent.trim() === '*') gsap.fromTo(inputs, { rotation: -12 }, { rotation: 0, stagger: .05, duration: .6, ease: 'elastic.out(1,.3)' });
      else popLast();
    });
  });

  function popLast() {
    const filled = inputs.filter(i => i.value !== '');
    const last = filled[filled.length - 1];
    if (last) gsap.fromTo(last, { scale: .5 }, { scale: 1, duration: .5, ease: 'elastic.out(1.4,.4)' });
  }
  inputs.forEach(i => i.addEventListener('input', popLast)); // clavier physique

  // Réaction au résultat, sans toucher à ta logique
  const msg = $('#message'); let done = false;
  new MutationObserver(() => {
    if (msg.classList.contains('error')) {
      buzz([60, 40, 60]);
      gsap.fromTo('.in', { x: -12 }, { x: 0, duration: .6, ease: 'elastic.out(1,.15)' });
      gsap.fromTo(inputs, { borderColor: '#ff3b5c', backgroundColor: 'rgba(0,0,0,.28)' },
        { borderColor: 'rgba(255,255,255,.7)', backgroundColor: 'rgba(255,255,255,.15)', duration: 1.4 });
    }
    if (msg.classList.contains('success') && !done) {
      done = true; buzz([20, 30, 20, 30, 80]);
      gsap.timeline()
        .to(inputs, { scale: 1.25, backgroundColor: '#fff', color: '#D90429', stagger: .07, duration: .25, yoyo: true, repeat: 1 })
        .to('.nb', { scale: 0, autoAlpha: 0, stagger: .02, duration: .35, ease: 'back.in(2)' }, 0.2)
        .fromTo('.card1', { scale: .95 }, { scale: 1, duration: .9, ease: 'elastic.out(1,.4)' }, 0.2)
        .to('.contain', { autoAlpha: 0, scale: 1.05, duration: .6, ease: 'power2.in' }, 2.4); // fondu avant la redirection
      confetti();
    }
  }).observe(msg, { attributes: true, attributeFilter: ['class'] });

  function confetti() {
    const cols = ['#fff', '#FFD166', '#D90429', '#FF8FA3', '#06D6A0', '#118AB2'];
    for (let i = 0; i < 100; i++) {
      const c = document.createElement('i');
      c.className = 'fx-conf'; c.style.background = gsap.utils.random(cols);
      document.body.appendChild(c);
      gsap.timeline({ onComplete: () => c.remove() })
        .to(c, { x: gsap.utils.random(-180, 180), y: gsap.utils.random(-380, -120), rotation: gsap.utils.random(-540, 540), duration: .8, ease: 'power3.out' })
        .to(c, { y: '+=' + (innerHeight + 100), x: '+=' + gsap.utils.random(-60, 60), rotation: '+=360', duration: gsap.utils.random(2, 3.2), ease: 'power1.in' }, '>-.1');
    }
  }

  // Inclinaison 3D de la carte (uniquement quand le doigt est dessus)
  const card = $('.card1');
  if (card) {
    gsap.set(card, { transformPerspective: 700 });
    const rx = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3' });
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      rx(((e.clientX - r.left) / r.width - .5) * 22);
      ry(-((e.clientY - r.top) / r.height - .5) * 22);
    });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(ev => card.addEventListener(ev, () => { rx(0); ry(0); }));
  }
  console.log('✅ animations.js chargé');
})();
