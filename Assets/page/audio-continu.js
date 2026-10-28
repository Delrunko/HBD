/* ============================================================
   Lecture audio continue entre les pages du site
   - Sauvegarde régulièrement la position de lecture et l'état muet
   - La page suivante reprend automatiquement à cette position
   - Gère l'autoplay bloqué par les navigateurs (bascule en muet
     puis réactive le son au premier geste de l'utilisateur)
   ============================================================ */
(function () {
    const AUDIO_ID = 'birthday-audio';
    const CLE_TEMPS = 'bday_audio_time';
    const CLE_MUET = 'bday_audio_muted';

    document.addEventListener('DOMContentLoaded', function () {
        const audio = document.getElementById(AUDIO_ID);
        if (!audio) return;

        audio.volume = 0.6;

        // Reprendre là où la lecture s'est arrêtée sur la page précédente
        const tempsSauvegarde = parseFloat(sessionStorage.getItem(CLE_TEMPS));
        if (!isNaN(tempsSauvegarde) && tempsSauvegarde > 0 && isFinite(tempsSauvegarde)) {
            try { audio.currentTime = tempsSauvegarde; } catch (e) { /* ignore */ }
        }
        audio.muted = sessionStorage.getItem(CLE_MUET) === 'true';

        function tenterLecture() {
            const p = audio.play();
            if (p && typeof p.catch === 'function') {
                p.catch(() => {
                    // Lecture bloquée par le navigateur : on démarre en muet
                    audio.muted = true;
                    audio.play().catch(() => {});
                });
            }
        }
        tenterLecture();

        function activerSonAuPremierGeste() {
            audio.muted = false;
            if (audio.paused) audio.play().catch(() => {});
            retirerEcouteurs();
        }
        function retirerEcouteurs() {
            document.removeEventListener('click', activerSonAuPremierGeste);
            document.removeEventListener('touchstart', activerSonAuPremierGeste);
            document.removeEventListener('scroll', activerSonAuPremierGeste);
            document.removeEventListener('keydown', activerSonAuPremierGeste);
        }
        document.addEventListener('click', activerSonAuPremierGeste, { passive: true });
        document.addEventListener('touchstart', activerSonAuPremierGeste, { passive: true });
        document.addEventListener('scroll', activerSonAuPremierGeste, { passive: true });
        document.addEventListener('keydown', activerSonAuPremierGeste, { passive: true });

        // Sauvegarde régulière de la position / état muet, pour reprise sur la page suivante
        const intervalSauvegarde = setInterval(sauvegarderEtat, 400);
        function sauvegarderEtat() {
            sessionStorage.setItem(CLE_TEMPS, String(audio.currentTime || 0));
            sessionStorage.setItem(CLE_MUET, String(audio.muted));
        }

        // Sauvegarde juste avant de quitter la page (changement de page)
        window.addEventListener('pagehide', sauvegarderEtat);
        window.addEventListener('beforeunload', sauvegarderEtat);
    });
})();