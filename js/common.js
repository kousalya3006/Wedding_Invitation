/**
 * ==============================================================================
 * COMMON JAVASCRIPT UTILITIES
 * Shared functions for DOM hydration, Google Maps, Add to Calendar,
 * Countdown Timer, Clipboard copy, and Accessibility.
 * ==============================================================================
 */

(function () {
  'use strict';

  // ----------------------------------------------------------------------------
  // 1. DATA HYDRATION ENGINE
  // Hydrates elements marked with data-wedding attributes from WEDDING_DATA
  // ----------------------------------------------------------------------------
  function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce(function (acc, part) {
      return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, obj);
  }

  function hydrateWeddingContent() {
    if (typeof WEDDING_DATA === 'undefined') {
      console.warn('WEDDING_DATA not found. Using static HTML fallback content.');
      return;
    }

    // Hydrate text nodes: <span data-wedding="couple.bride.fullName"></span>
    const textElements = document.querySelectorAll('[data-wedding]');
    textElements.forEach(function (el) {
      const key = el.getAttribute('data-wedding');
      const val = getNestedValue(WEDDING_DATA, key);
      if (val !== undefined && val !== null) {
        // If element is an input, set value, otherwise textContent
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // Hydrate attributes: <a data-wedding-href="venue.googleMapsUrl"></a>
    const hrefElements = document.querySelectorAll('[data-wedding-href]');
    hrefElements.forEach(function (el) {
      const key = el.getAttribute('data-wedding-href');
      const val = getNestedValue(WEDDING_DATA, key);
      if (val) {
        el.setAttribute('href', val);
      }
    });

    // Hydrate images: <img data-wedding-src="couple.bride.photo" />
    const imgElements = document.querySelectorAll('[data-wedding-src]');
    imgElements.forEach(function (el) {
      const key = el.getAttribute('data-wedding-src');
      const val = getNestedValue(WEDDING_DATA, key);
      if (val) {
        el.setAttribute('src', val);
      }
    });

    // Setup Google Maps links to open securely
    const mapsButtons = document.querySelectorAll('.js-google-maps-btn, [data-action="open-map"]');
    mapsButtons.forEach(function (btn) {
      if (WEDDING_DATA.venue && WEDDING_DATA.venue.googleMapsUrl) {
        btn.setAttribute('href', WEDDING_DATA.venue.googleMapsUrl);
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 2. COUNTDOWN TIMER
  // Real-time countdown to the primary auspicious wedding ceremony
  // ----------------------------------------------------------------------------
  function initCountdownTimer() {
    const timerContainer = document.getElementById('wedding-countdown');
    if (!timerContainer || typeof WEDDING_DATA === 'undefined') return;

    const targetDateStr = WEDDING_DATA.schedule ? WEDDING_DATA.schedule.primaryIsoDate : null;
    if (!targetDateStr) return;

    const targetTime = new Date(targetDateStr).getTime();
    if (isNaN(targetTime)) return;

    const daysEl = timerContainer.querySelector('.countdown-days');
    const hoursEl = timerContainer.querySelector('.countdown-hours');
    const minutesEl = timerContainer.querySelector('.countdown-minutes');
    const secondsEl = timerContainer.querySelector('.countdown-seconds');
    const messageEl = timerContainer.querySelector('.countdown-message');

    function updateTimer() {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
        if (messageEl) {
          messageEl.textContent = 'The wedding celebrations have begun! Blessed moments.';
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = days < 10 ? '0' + days : days;
      if (hoursEl) hoursEl.textContent = hours < 10 ? '0' + hours : hours;
      if (minutesEl) minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
      if (secondsEl) secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // ----------------------------------------------------------------------------
  // 3. COPY ADDRESS TO CLIPBOARD
  // Copies formatted venue address with toast confirmation
  // ----------------------------------------------------------------------------
  function initCopyAddress() {
    const copyBtns = document.querySelectorAll('.js-copy-address-btn');
    copyBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const addressText = WEDDING_DATA && WEDDING_DATA.venue && WEDDING_DATA.venue.fullAddress
          ? WEDDING_DATA.venue.fullAddress
          : (document.getElementById('venue-address-text')
            ? document.getElementById('venue-address-text').textContent.trim()
            : '');

        if (!addressText) return;

        function showSuccessFeedback() {
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span>Copied to Clipboard! &#10003;</span>';
          btn.setAttribute('aria-label', 'Address copied to clipboard');
          btn.classList.add('btn-copied');
          setTimeout(function () {
            btn.innerHTML = originalText;
            btn.classList.remove('btn-copied');
          }, 2500);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(addressText).then(showSuccessFeedback).catch(function () {
            fallbackCopy(addressText, showSuccessFeedback);
          });
        } else {
          fallbackCopy(addressText, showSuccessFeedback);
        }
      });
    });

    function fallbackCopy(text, callback) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        callback();
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    }
  }

  // ----------------------------------------------------------------------------
  // 4. ADD TO CALENDAR GENERATOR (Google Calendar & Apple / Outlook .ics)
  // Generates calendar events natively without third party services
  // ----------------------------------------------------------------------------
  function initAddToCalendar() {
    const calendarBtns = document.querySelectorAll('.js-add-to-calendar');
    calendarBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const type = btn.getAttribute('data-calendar-type') || 'google';
        
        const title = (WEDDING_DATA.couple.bride.firstName || 'Kouslya') + ' & ' +
                      (WEDDING_DATA.couple.groom.firstName || 'Mohan') + ' Wedding';
        const location = WEDDING_DATA.venue ? WEDDING_DATA.venue.fullAddress : 'Chennai, India';
        const details = 'Wedding celebration of ' + 
          (WEDDING_DATA.couple.bride.fullName || 'Kouslya') + ' & ' +
          (WEDDING_DATA.couple.groom.fullName || 'Mohan') + '.\nVenue: ' +
          (WEDDING_DATA.venue.name || 'Wedding Mandapam') + '\nMaps: ' +
          (WEDDING_DATA.venue.googleMapsUrl || '');

        // 2026-11-29 from 09:00 to 14:00 IST (03:30Z to 08:30Z)
        const startIso = '20261129T033000Z';
        const endIso = '20261129T083000Z';

        if (type === 'google') {
          const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
            '&text=' + encodeURIComponent(title) +
            '&dates=' + startIso + '/' + endIso +
            '&details=' + encodeURIComponent(details) +
            '&location=' + encodeURIComponent(location);
          window.open(googleUrl, '_blank', 'noopener,noreferrer');
        } else if (type === 'ics') {
          // Generate .ics standard file
          const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Kouslya and Mohan Wedding Invitation//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'SUMMARY:' + title,
            'DESCRIPTION:' + details.replace(/\n/g, '\\n'),
            'LOCATION:' + location,
            'DTSTART:' + startIso,
            'DTEND:' + endIso,
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
          ].join('\r\n');

          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute('download', 'Kouslya-Mohan-Wedding.ics');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    });
  }

  // ----------------------------------------------------------------------------
  // 5. ACCESSIBILITY & PREFERS-REDUCED-MOTION
  // Checks and updates accessibility states
  // ----------------------------------------------------------------------------
  function checkReducedMotion() {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    function handleMotionPreference(e) {
      if (e.matches) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    }
    handleMotionPreference(motionQuery);
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionPreference);
    }
  }

  // ----------------------------------------------------------------------------
  // 6. IMAGE FALLBACK HANDLER
  // Handles photo load failure gracefully (e.g. before user replaces files)
  // ----------------------------------------------------------------------------
  function initImageFallbacks() {
    const photos = document.querySelectorAll('.couple-photo');
    photos.forEach(function (img) {
      img.addEventListener('error', function () {
        // Fallback to stylized SVG placeholder container
        const isGroom = img.classList.contains('groom-photo');
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent && !parent.querySelector('.photo-fallback')) {
          const fallback = document.createElement('div');
          fallback.className = 'photo-fallback ' + (isGroom ? 'groom-fallback' : 'bride-fallback');
          fallback.setAttribute('role', 'img');
          fallback.setAttribute('aria-label', isGroom ? 'Groom portrait placeholder' : 'Bride portrait placeholder');
          fallback.innerHTML = `
            <div class="fallback-icon">
              <svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
                <circle cx="40" cy="40" r="38" fill="${isGroom ? '#F3EDE2' : '#F9EAE1'}" stroke="${isGroom ? '#C59B27' : '#D4AF37'}" stroke-width="2"/>
                <circle cx="40" cy="30" r="14" fill="${isGroom ? '#4A3B32' : '#8B1E2F'}"/>
                <path d="M18 64 C20 46, 60 46, 62 64" fill="${isGroom ? '#D6C8B4' : '#6B0F1A'}"/>
              </svg>
            </div>
            <span class="fallback-label">${isGroom ? 'Groom' : 'Bride'} Portrait</span>
          `;
          parent.appendChild(fallback);
        }
      });
    });
  }

  // ----------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY
  // ----------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    hydrateWeddingContent();
    initCountdownTimer();
    initCopyAddress();
    initAddToCalendar();
    checkReducedMotion();
    initImageFallbacks();
  });

  // Expose helpers globally if needed
  window.WeddingUtils = {
    hydrate: hydrateWeddingContent,
    getNestedValue: getNestedValue
  };
})();
