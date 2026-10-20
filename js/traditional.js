/**
 * ==============================================================================
 * VERSION A: TRADITIONAL & ELEGANT CONTROLLER
 * Manages the Namaste greeting animation replay, respectful entrance timing,
 * and traditional card interactions.
 * ==============================================================================
 */

(function () {
  'use strict';

  function initTraditionalGreeting() {
    const replayBtn = document.getElementById('btn-replay-namaste');
    const svgContainer = document.getElementById('traditional-svg-container');
    const statusLabel = document.getElementById('traditional-greeting-status');

    if (!replayBtn || !svgContainer) return;

    // Update status label after initial animation sequence completes (~4 seconds)
    setTimeout(function () {
      if (statusLabel) {
        statusLabel.textContent = 'Welcoming pose • Scroll to explore details';
      }
    }, 4200);

    replayBtn.addEventListener('click', function (e) {
      e.preventDefault();
      
      // Force SVG animation re-trigger by resetting the inner SVG or class
      const svg = svgContainer.querySelector('svg');
      if (!svg) return;

      if (statusLabel) {
        statusLabel.textContent = 'Offering Namaste & Bow...';
      }

      // Re-trigger animation cleanly
      svg.style.animation = 'none';
      svg.offsetHeight; /* trigger reflow */
      svg.style.animation = '';

      const animatedElements = svg.querySelectorAll('.entrance-group, .bow-group, .namaste-hands');
      animatedElements.forEach(function (el) {
        const anim = window.getComputedStyle(el).animation;
        el.style.animation = 'none';
        el.offsetHeight; /* reflow */
        el.style.animation = '';
      });

      setTimeout(function () {
        if (statusLabel) {
          statusLabel.textContent = 'Welcoming pose • Scroll to explore details';
        }
      }, 4200);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTraditionalGreeting();
  });
})();
