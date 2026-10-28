// À charger APRÈS GSAP et APRÈS ton <script> existant (juste avant </body>)
(() => {
  if (typeof gsap === 'undefined') return;
  if (typeof window.showScreen !== 'function') { console.warn('showScreen introuvable : charge ce script APRÈS ton <script> principal'); return; }
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const R = gsap.utils.random;
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  let loops = [];
  let resetAnswer = () => {};
  const loop = t => { loops.push(t); return t; };

  // ---- Cœurs flottants en fond ----
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('div');
    h.className = 'fx-heart'; h.textContent = '♥';
    h.style.left = R(0, 100) + 'vw'; h.style.fontSize = R(14, 36) + 'px';
    document.body.appendChild(h);
    gsap.to(h, { y: -(innerHeight + 100), x: '+=' + R(-40, 40), rotation: R(-40, 40),
      duration: R(8, 15), delay: R(0, 8), repeat: -1, ease: 'none' });
  }

  // ---- Petits effets réutilisables ----
  function burst(x, y, n = 6) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'fx-pop'; p.textContent = '♥';
      p.style.left = x + 'px'; p.style.top = y + 'px';
      document.body.appendChild(p);
      gsap.to(p, { x: R(-60, 60), y: R(-90, -30), rotation: R(-60, 60), opacity: 0, scale: R(.6, 1.5),
        duration: .9, ease: 'power2.out', onComplete: () => p.remove() });
    }
  }
  document.addEventListener('pointerdown', e => burst(e.clientX, e.clientY, 5), { passive: true });

  function confetti() {
    const cols = ['#fff', '#FFD166', '#D90429', '#FF8FA3', '#06D6A0', '#118AB2'];
    for (let i = 0; i < 100; i++) {
      const c = document.createElement('i');
      c.className = 'fx-conf'; c.style.background = gsap.utils.random(cols);
      document.body.appendChild(c);
      gsap.timeline({ onComplete: () => c.remove() })
        .to(c, { x: R(-180, 180), y: R(-340, -100), rotation: R(-540, 540), duration: .8, ease: 'power3.out' })
        .to(c, { y: '+=' + (innerHeight + 100), x: '+=' + R(-60, 60), rotation: '+=360', duration: R(2, 3.2), ease: 'power1.in' }, '>-.1');
    }
  }

  function petals() {
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('i');
      p.className = 'fx-pop'; p.textContent = i % 2 ? '♥' : '🌸';
      p.style.left = R(0, 100) + 'vw'; p.style.top = '-20px'; p.style.fontSize = R(14, 26) + 'px';
      document.body.appendChild(p);
      gsap.to(p, { y: innerHeight + 60, x: R(-80, 80), rotation: R(-180, 180), duration: R(5, 8), delay: R(0, 2.5),
        ease: 'sine.inOut', onComplete: () => p.remove() });
    }
  }

  // ---- Lettre : découpe en mots (les <br> sont conservés) ----
  const lp = $('#screen-letter .letter-card p');
  if (lp) {
    const frag = document.createDocumentFragment();
    [...lp.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) frag.appendChild(document.createTextNode(' '));
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = tok; frag.appendChild(s); }
        });
      } else frag.appendChild(n.cloneNode(true));
    });
    lp.replaceChildren(frag);
  }

  // ---- Animations par écran ----
  const rots = [-6, 3, -2, 5, -4];
  const peekBob = () => loop(gsap.to('#letter-peek', { y: -5, duration: .7, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

  const enter = {
    hearts() {
      gsap.fromTo('#screen-hearts .title', { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: 'back.out(2)' });
      gsap.fromTo('#screen-hearts .subtitle', { autoAlpha: 0, y: 10 }, { autoAlpha: .9, y: 0, duration: .6, delay: .2 });
      gsap.fromTo('.heart-box', { scale: 0, rotation: -25, autoAlpha: 0 },
        { scale: 1, rotation: 0, autoAlpha: 1, duration: 1.1, ease: 'elastic.out(1,.5)', stagger: .15, delay: .3 });
    },
    envelope() {
      const env = $('#envelope');
      gsap.fromTo('#screen-envelope .title', { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, ease: 'back.out(2)' });
      gsap.fromTo(env, { y: -220, rotation: -12, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: 1.1, ease: 'bounce.out' });
      gsap.fromTo('#envelope-hint', { autoAlpha: 0 }, { autoAlpha: .85, duration: .6, delay: .9 });
      if (env.classList.contains('open')) peekBob();
      else loop(gsap.to(env, { scale: 1.05, duration: .9, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.3 }));
    },
    letter() {
      const card = $('#screen-letter .letter-card');
      gsap.set(card, { transformPerspective: 900, transformOrigin: '50% 0' });
      const tl = gsap.timeline();
      tl.fromTo(card, { rotationX: -85, autoAlpha: 0, y: -20 }, { rotationX: 0, autoAlpha: 1, y: 0, duration: 1, ease: 'back.out(1.4)' })
        .fromTo('#screen-letter h2', { autoAlpha: 0, scale: .7 }, { autoAlpha: 1, scale: 1, duration: .7, ease: 'back.out(2.5)' }, '-=.4')
        .fromTo('#screen-letter .w', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .4, stagger: .035, ease: 'power2.out' }, '-=.1')
        .fromTo('#screen-letter .back-btn', { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 });
      card.onclick = () => tl.progress(1); // un tap = afficher tout le texte
      loop(gsap.to('.deco-heart', { scale: 1.25, duration: .7, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: .2 }));
      petals();
    },
    gallery() {
      const ps = $$('.polaroid');
      gsap.fromTo('#screen-gallery .title', { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: 'back.out(2)' });
      ps.forEach((p, i) => {
        const r = rots[i % rots.length], d = .25 + i * .15;
        gsap.fromTo(p, { y: -340, autoAlpha: 0, rotation: r - 25, scale: .8, zIndex: 1 },
          { y: 0, autoAlpha: 1, rotation: r, scale: 1, duration: 1.1, ease: 'bounce.out', delay: d });
        loop(gsap.to(p, { y: -5, duration: R(1.6, 2.4), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: d + 1.3 }));
        p.onclick = () => openLB(i);
        p.onpointerdown = () => gsap.to(p, { scale: .94, duration: .1 });
        p.onpointerup = p.onpointerleave = () => gsap.to(p, { scale: 1, rotation: r, duration: .5, ease: 'elastic.out(1.2,.4)' });
      });
      gsap.fromTo('#screen-gallery .back-btn', { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, delay: 1.6 });
    },
    announcement() {
      resetAnswer();
      gsap.fromTo('.announcement', { scale: .85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .9, ease: 'back.out(1.5)' });
      loop(gsap.fromTo('.announcement-image', { scale: 1 }, { scale: 1.12, duration: 8, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      gsap.timeline({ delay: .4 })
        .fromTo('.announcement .subtitle', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .8 })
        .fromTo('.plane-line', { x: -280, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' }, '-=.2')
        .fromTo('.destination', { scale: .2, autoAlpha: 0, rotation: -8 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 1.2, ease: 'elastic.out(1,.45)' }, '-=.2')
        .fromTo('.answer-row', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'back.out(2)' }, '-=.3')
        .add(() => { confetti(); buzz([20, 30, 20]); })
        .add(() => {
          loop(gsap.to('.plane-line', { x: 14, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
          loop(gsap.to('.destination', { textShadow: '0 0 22px rgba(255,244,79,.95)', duration: 1, yoyo: true, repeat: -1 }));
        });
      gsap.fromTo('#screen-announcement .back-btn', { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, delay: 2 });
    }
  };

  // ---- Faux <video> pointant vers une image → <img> ----
  $$('.photo-placeholder video').forEach(v => {
    const src = v.getAttribute('src') || '';
    if (/\.(jpe?g|png|webp|gif)$/i.test(src)) { const im = document.createElement('img'); im.src = src; im.alt = ''; v.replaceWith(im); }
  });

  // ---- Visionneur de photos (flèches, swipe, clavier) ----
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.innerHTML = '<button class="lb-close" aria-label="Fermer">✕</button>' +
    '<button class="lb-nav lb-prev" aria-label="Précédente">‹</button>' +
    '<div class="lb-stage"><figure class="lb-fig"><div class="lb-media"></div><figcaption class="lb-cap"></figcaption></figure></div>' +
    '<button class="lb-nav lb-next" aria-label="Suivante">›</button><div class="lb-count"></div>';
  document.body.appendChild(lb);
  const lbStage = lb.querySelector('.lb-stage'), lbFig = lb.querySelector('.lb-fig'),
        lbMedia = lb.querySelector('.lb-media'), lbCap = lb.querySelector('.lb-cap'), lbCount = lb.querySelector('.lb-count');
  let items = [], cur = 0, lbBusy = false, lbOpen = false;

  function collect() {
    items = $$('.polaroid').map(p => {
      const m = p.querySelector('img, video');
      const cap = [...p.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
      return { src: m ? m.getAttribute('src') : '', poster: m ? m.getAttribute('poster') : '', cap };
    });
  }
  function fill(n) {
    cur = n; const it = items[n]; lbMedia.innerHTML = '';
    const isVid = /\.(mp4|webm|mov)$/i.test(it.src);
    const el = document.createElement(isVid ? 'video' : 'img');
    el.src = it.src;
    if (isVid) { el.autoplay = el.loop = el.muted = el.playsInline = el.controls = true; if (it.poster) el.poster = it.poster; } else el.alt = it.cap;
    lbMedia.appendChild(el);
    lbCap.textContent = it.cap; lbCount.textContent = (n + 1) + ' / ' + items.length;
  }
  function go(n, dir) {
    if (lbBusy) return; lbBusy = true; n = (n + items.length) % items.length;
    if (!dir) {
      fill(n);
      gsap.fromTo(lbFig, { scale: .8, autoAlpha: 0, x: 0 }, { scale: 1, autoAlpha: 1, duration: .5, ease: 'back.out(1.6)', onComplete: () => lbBusy = false });
      return;
    }
    gsap.to(lbFig, { x: -dir * 90, autoAlpha: 0, duration: .22, ease: 'power2.in', onComplete: () => {
      fill(n);
      gsap.fromTo(lbFig, { x: dir * 90, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .35, ease: 'power3.out', onComplete: () => lbBusy = false });
    } });
    buzz(8);
  }
  function openLB(i) {
    collect(); lbOpen = true; lbBusy = false;
    document.body.style.overflow = 'hidden';
    gsap.to(lb, { autoAlpha: 1, duration: .3 });
    go(i, 0); buzz(12);
  }
  function closeLB() {
    lbOpen = false; document.body.style.overflow = '';
    gsap.to(lb, { autoAlpha: 0, duration: .25 });
  }
  lb.querySelector('.lb-close').onclick = closeLB;
  lb.querySelector('.lb-prev').onclick = () => go(cur - 1, -1);
  lb.querySelector('.lb-next').onclick = () => go(cur + 1, 1);
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  addEventListener('keydown', e => {
    if (!lbOpen) return;
    if (e.key === 'ArrowRight') go(cur + 1, 1);
    else if (e.key === 'ArrowLeft') go(cur - 1, -1);
    else if (e.key === 'Escape') closeLB();
  });
  let sx = null;
  lbStage.addEventListener('pointerdown', e => { sx = e.clientX; });
  lbStage.addEventListener('pointermove', e => { if (sx !== null && !lbBusy) gsap.set(lbFig, { x: (e.clientX - sx) * .6 }); });
  const endSwipe = e => {
    if (sx === null) return; const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 60) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    else gsap.to(lbFig, { x: 0, duration: .4, ease: 'elastic.out(1,.5)' });
  };
  lbStage.addEventListener('pointerup', endSwipe);
  lbStage.addEventListener('pointercancel', endSwipe);

  // ---- On enveloppe ta fonction showScreen sans la modifier ----
  const orig = window.showScreen;
  window.showScreen = function (name) {
    loops.forEach(t => t.kill()); loops = [];
    orig(name);
    if (enter[name]) enter[name]();
  };

  // ---- Cœurs : appui + survol ----
  const canHover = matchMedia('(hover: hover)').matches;
  $$('.heart-box').forEach(b => {
    b.addEventListener('pointerdown', () => { gsap.to(b, { scale: .88, duration: .1 }); buzz(15); });
    ['pointerup', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => gsap.to(b, { scale: 1, duration: .5, ease: 'elastic.out(1.2,.4)' })));
    if (canHover) {
      b.addEventListener('pointerenter', () => gsap.to(b, { y: -6, scale: 1.06, duration: .3 }));
      b.addEventListener('pointerleave', () => gsap.to(b, { y: 0, scale: 1, duration: .4 }));
    }
  });

  // ---- Ouverture de l'enveloppe ----
  const env = $('#envelope'); let wasOpen = env.classList.contains('open');
  new MutationObserver(() => {
    if (env.classList.contains('open') && !wasOpen) {
      wasOpen = true; loops.forEach(t => t.kill()); loops = [];
      gsap.to(env, { scale: 1, duration: .3 });
      gsap.fromTo(env, { rotation: -5 }, { rotation: 0, duration: .9, ease: 'elastic.out(1,.2)' });
      gsap.fromTo('#envelope-hint', { autoAlpha: 0, y: 6 }, { autoAlpha: .85, y: 0, duration: .5 });
      const r = env.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 12); buzz([15, 30, 15]);
      setTimeout(peekBob, 700);
    }
  }).observe(env, { attributes: true, attributeFilter: ['class'] });

  // ---- Réponse finale : « Oui » célèbre, « Non » s'enfuit ----
  const yes = $('#yes-btn'), no = $('#no-btn');
  if (yes && no) {
    let flees = 0, answered = false;
    resetAnswer = () => {
      answered = false; flees = 0;
      const f = $('.final-msg'); if (f) f.remove();
      gsap.set([yes, no], { clearProps: 'all' });
      no.style.pointerEvents = '';
      gsap.set('.announcement-overlay > *', { clearProps: 'opacity,visibility,transform' });
    };
    const flee = () => {
      if (answered) return;
      flees++; buzz(10);
      const a = $('.announcement').getBoundingClientRect(), r = no.getBoundingClientRect();
      const tx = R(a.left + 50, a.right - 50) - (r.left + r.width / 2);
      const ty = R(a.top + 70, a.bottom - 70) - (r.top + r.height / 2);
      gsap.to(no, { x: '+=' + tx, y: '+=' + ty, rotation: R(-25, 25), scale: Math.max(.55, 1 - flees * .07), duration: .35, ease: 'back.out(2)' });
      gsap.to(yes, { scale: Math.min(1.5, 1 + flees * .08), duration: .4, ease: 'elastic.out(1,.5)' });
      if (flees >= 8) gsap.to(no, { autoAlpha: 0, scale: 0, duration: .4, onComplete: () => { no.style.pointerEvents = 'none'; } });
    };
    ['pointerenter', 'pointerdown'].forEach(ev => no.addEventListener(ev, flee));
    no.addEventListener('click', e => { e.preventDefault(); flee(); });
    yes.addEventListener('click', () => {
      if (answered) return; answered = true; buzz([30, 40, 30, 40, 120]);
      gsap.to('.announcement-overlay > *', { autoAlpha: 0, y: -20, duration: .4, stagger: .05 });
      const f = document.createElement('div');
      f.className = 'final-msg';
      f.innerHTML = '<div class="final-heart">💖</div><p>Tu as dit oui !</p><span>Le voyage commence ici ✈️</span>';
      $('.announcement-overlay').appendChild(f);
      gsap.fromTo(f, { scale: .3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, delay: .35, ease: 'elastic.out(1,.5)' });
      gsap.to('.final-heart', { scale: 1.2, duration: .5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.4 });
      confetti(); setTimeout(confetti, 600); setTimeout(confetti, 1300); petals();
    });
  }

  enter.hearts(); // animation d'arrivée de la première page
  console.log('✅ surprise-animations.js chargé');
})();
