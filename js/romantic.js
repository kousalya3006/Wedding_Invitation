/**
 * ==============================================================================
 * VERSION B: CUTE & ROMANTIC CONTROLLER
 * Manages waving animation replay, WhatsApp RSVP link generation, and optional
 * playful floating hearts on tap.
 * ==============================================================================
 */

(function () {
  'use strict';

  function initRomanticGreeting() {
    const replayBtn = document.getElementById('btn-replay-wave');
    const svgContainer = document.getElementById('romantic-svg-container');

    if (!replayBtn || !svgContainer) return;

    replayBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const svg = svgContainer.querySelector('svg');
      if (!svg) return;

      const animatedElements = svg.querySelectorAll('.r-entrance, .waving-arm-bride, .waving-hand');
      animatedElements.forEach(function (el) {
        el.style.animation = 'none';
        el.offsetHeight; /* trigger reflow */
        el.style.animation = '';
      });
    });
  }

  function initWhatsAppRsvp() {
    const whatsappBtn = document.getElementById('js-whatsapp-rsvp');
    if (!whatsappBtn || typeof WEDDING_DATA === 'undefined') return;

    const number = WEDDING_DATA.rsvp ? WEDDING_DATA.rsvp.whatsappNumber : '919876543210';
    const message = WEDDING_DATA.rsvp && WEDDING_DATA.rsvp.whatsappPrefilledMessage
      ? WEDDING_DATA.rsvp.whatsappPrefilledMessage
      : 'Hello! Delighted to RSVP for the wedding of Kouslya and Mohan: ';

    const url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
    whatsappBtn.setAttribute('href', url);
    whatsappBtn.setAttribute('target', '_blank');
    whatsappBtn.setAttribute('rel', 'noopener noreferrer');
  }

  // Playful floating heart burst on tapping couple photos
  function initPlayfulHeartEffect() {
    const photoCards = document.querySelectorAll('.romantic-photo-frame');
    photoCards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        createFloatingHeart(e.clientX, e.clientY);
      });
    });

    function createFloatingHeart(x, y) {
      const heart = document.createElement('span');
      heart.textContent = ['💖', '✨', '🌸', '💕'][Math.floor(Math.random() * 4)];
      heart.style.position = 'fixed';
      heart.style.left = (x || (window.innerWidth / 2)) + 'px';
      heart.style.top = (y || (window.innerHeight / 2)) + 'px';
      heart.style.fontSize = '24px';
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '9999';
      heart.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
      document.body.appendChild(heart);

      requestAnimationFrame(function () {
        heart.style.transform = 'translate(' + ((Math.random() - 0.5) * 80) + 'px, -90px) scale(1.4)';
        heart.style.opacity = '0';
      });

      setTimeout(function () {
        if (heart.parentElement) {
          heart.parentElement.removeChild(heart);
        }
      }, 1200);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initRomanticGreeting();
    initWhatsAppRsvp();
    initPlayfulHeartEffect();
  });
})();
