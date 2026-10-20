/**
 * ==============================================================================
 * VERSION C: SIMPLE & MINIMAL CONTROLLER
 * Lightweight scroll reveal observer and minimal interactions.
 * ==============================================================================
 */

(function () {
  'use strict';

  function initSimpleIntersections() {
    if (!('IntersectionObserver' in window)) return;

    const revealElements = document.querySelectorAll('.simple-reveal-on-scroll');
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('simple-fade-up');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15
    });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSimpleIntersections();
  });
})();
