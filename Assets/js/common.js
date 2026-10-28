// Bouton son + écran « Touche pour commencer » (déverrouille la musique sur mobile)
(() => {
  const audio = document.getElementById('birthday-audio');
  const body = document.body;

  // Bouton musique (🔊 / 🔇)
  const btn = document.createElement('button');
  btn.id = 'sound-btn';
  btn.setAttribute('aria-label', 'Activer ou couper la musique');
  body.appendChild(btn);
  const sync = () => { btn.textContent = (!audio || audio.paused || audio.muted) ? '🔇' : '🔊'; };
  if (audio) { ['play', 'pause', 'volumechange'].forEach(ev => audio.addEventListener(ev, sync)); sync(); }
  btn.addEventListener('click', () => {
    if (!audio) return;
    const wantOn = audio.paused || audio.muted;
    // setTimeout : s'applique après les écouteurs « premier geste » déjà présents sur la page
    setTimeout(() => {
      if (wantOn) { audio.muted = false; audio.volume = .6; audio.play().catch(() => {}); }
      else audio.muted = true;
      sync();
    }, 0);
  });

  // Écran de démarrage (uniquement si <body data-start>)
  if (body.hasAttribute('data-start')) {
    const ov = document.createElement('div');
    ov.id = 'start-screen';
    ov.innerHTML = '<div><div class="st-gift">🎁</div><p class="st-title">Une surprise t’attend</p><p class="st-sub">Touche pour commencer</p></div>';
    body.appendChild(ov);
    const hasG = typeof gsap !== 'undefined';
    if (hasG) gsap.to('.st-gift', { scale: 1.15, rotation: 8, yoyo: true, repeat: -1, duration: .8, ease: 'sine.inOut' });
    const finish = () => { ov.remove(); window.dispatchEvent(new Event('maria:start')); };
    ov.addEventListener('pointerdown', () => {
      if (audio) { audio.muted = false; audio.volume = .6; audio.play().catch(() => {}); }
      try { navigator.vibrate && navigator.vibrate(15); } catch (e) {}
      if (hasG) gsap.to(ov, { autoAlpha: 0, scale: 1.12, duration: .6, ease: 'power2.in', onComplete: finish });
      else finish();
    }, { once: true });
  }
  console.log('✅ common.js chargé');
})();
