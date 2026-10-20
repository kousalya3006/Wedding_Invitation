/**
 * ==============================================================================
 * WEBSITE 2: CUTE & ROMANTIC APPLICATION LOGIC
 * Standalone logic for hydration, countdown, maps, calendar, wave replay,
 * WhatsApp RSVP, and interactive heart bursts.
 * ==============================================================================
 */

(function () {
  'use strict';

  function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce(function (acc, part) {
      return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, obj);
  }

  function hydrateWeddingContent() {
    if (typeof WEDDING_DATA === 'undefined') return;

    document.querySelectorAll('[data-wedding]').forEach(function (el) {
      const key = el.getAttribute('data-wedding');
      const val = getNestedValue(WEDDING_DATA, key);
      if (val !== undefined && val !== null) {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-wedding-href]').forEach(function (el) {
      const key = el.getAttribute('data-wedding-href');
      const val = getNestedValue(WEDDING_DATA, key);
      if (val) el.setAttribute('href', val);
    });

    document.querySelectorAll('[data-wedding-src]').forEach(function (el) {
      const key = el.getAttribute('data-wedding-src');
      const val = getNestedValue(WEDDING_DATA, key);
      if (val) el.setAttribute('src', val);
    });

    document.querySelectorAll('.js-google-maps-btn').forEach(function (btn) {
      const mapsUrl = (WEDDING_DATA.location && WEDDING_DATA.location.googleMapsUrl) ||
                      (WEDDING_DATA.venue && WEDDING_DATA.venue.googleMapsUrl);
      if (mapsUrl) {
        btn.setAttribute('href', mapsUrl);
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

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
        if (messageEl) messageEl.textContent = 'The wedding celebration has begun! Wishing endless love.';
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

  function initCopyAddress() {
    const copyBtns = document.querySelectorAll('.js-copy-address-btn');
    copyBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const addressText = (WEDDING_DATA.location && WEDDING_DATA.location.address) ||
          (WEDDING_DATA.venue && WEDDING_DATA.venue.fullAddress) ||
          (document.querySelector('.romantic-hall-address') ? document.querySelector('.romantic-hall-address').textContent.trim() : '');

        if (!addressText) return;

        function showSuccessFeedback() {
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span>Address Copied! &#10003;</span>';
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

  function initAddToCalendar() {
    const calendarBtns = document.querySelectorAll('.js-add-to-calendar');
    calendarBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const type = btn.getAttribute('data-calendar-type') || 'google';
        const locName = (WEDDING_DATA.location && WEDDING_DATA.location.name) ||
          (WEDDING_DATA.venue && WEDDING_DATA.venue.name) || 'Geetha Citadel Wedding & Conventions';
        const locAddress = (WEDDING_DATA.location && WEDDING_DATA.location.address) ||
          (WEDDING_DATA.venue && WEDDING_DATA.venue.fullAddress) || 'Paruthipattu, Avadi';
        const mapsUrl = (WEDDING_DATA.location && WEDDING_DATA.location.googleMapsUrl) ||
          (WEDDING_DATA.venue && WEDDING_DATA.venue.googleMapsUrl) || 'https://share.google/IbbWh7woegGU9tjHQ';
        const title = 'Kousalya & Mohan Wedding Celebration';
        const location = locName + ', ' + locAddress;
        const details = 'Celebrating the wedding of Kousalya & Mohan.\n' + locName + '\n' + locAddress + '\nGoogle Maps: ' + mapsUrl;

        const startIso = '20261115T020000Z';
        const endIso = '20261115T033000Z';

        if (type === 'google') {
          const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
            '&text=' + encodeURIComponent(title) +
            '&dates=' + startIso + '/' + endIso +
            '&details=' + encodeURIComponent(details) +
            '&location=' + encodeURIComponent(location);
          window.open(googleUrl, '_blank', 'noopener,noreferrer');
        } else if (type === 'ics') {
          const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Kouslya and Mohan Romantic Wedding//EN',
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
          link.setAttribute('download', 'Kouslya-Mohan-Romantic-Wedding.ics');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    });
  }

  function initWaveReplay() {
    const replayBtn = document.getElementById('btn-replay-wave');
    const svgContainer = document.getElementById('romantic-svg-container');

    if (!replayBtn || !svgContainer) return;

    replayBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const obj = svgContainer.querySelector('object');
      if (obj) {
        const src = obj.getAttribute('data');
        obj.setAttribute('data', '');
        obj.setAttribute('data', src);
      }
    });
  }

  function initWhatsAppRsvp() {
    const whatsappBtn = document.getElementById('js-whatsapp-rsvp');
    if (!whatsappBtn || typeof WEDDING_DATA === 'undefined') return;

    const number = WEDDING_DATA.rsvp ? WEDDING_DATA.rsvp.whatsappNumber : '919876543210';
    const message = WEDDING_DATA.rsvp && WEDDING_DATA.rsvp.whatsappPrefilledMessage
      ? WEDDING_DATA.rsvp.whatsappPrefilledMessage
      : 'Hello Kouslya & Mohan! RSVP: Attending with joy!';

    const url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
    whatsappBtn.setAttribute('href', url);
    whatsappBtn.setAttribute('target', '_blank');
    whatsappBtn.setAttribute('rel', 'noopener noreferrer');
  }

  function initInteractiveHearts() {
    document.querySelectorAll('.romantic-photo-frame').forEach(function (card) {
      card.addEventListener('click', function (e) {
        const heart = document.createElement('span');
        heart.textContent = ['💖', '✨', '🌸', '💕'][Math.floor(Math.random() * 4)];
        heart.style.position = 'fixed';
        heart.style.left = (e.clientX || (window.innerWidth / 2)) + 'px';
        heart.style.top = (e.clientY || (window.innerHeight / 2)) + 'px';
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
          if (heart.parentElement) heart.parentElement.removeChild(heart);
        }, 1200);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    hydrateWeddingContent();
    initCountdownTimer();
    initCopyAddress();
    initAddToCalendar();
    initWaveReplay();
    initWhatsAppRsvp();
    initInteractiveHearts();
  });
})();
