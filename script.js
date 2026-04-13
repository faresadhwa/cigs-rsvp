/* -------------------------------------------------------------------
   CIGS · VIP Networking Party — RSVP interactions
   ------------------------------------------------------------------- */

// ---------- Countdown ----------
(function countdown() {
  const target = new Date('2026-04-23T18:00:00+08:00').getTime();
  const nums = document.querySelectorAll('#countdown .cd-num');
  if (!nums.length) return;

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      nums.forEach((n) => (n.textContent = '00'));
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    nums.forEach((el) => {
      switch (el.dataset.unit) {
        case 'days':    el.textContent = pad(days);    break;
        case 'hours':   el.textContent = pad(hours);   break;
        case 'minutes': el.textContent = pad(minutes); break;
        case 'seconds': el.textContent = pad(seconds); break;
      }
    });
  }

  tick();
  setInterval(tick, 1000);
})();

// ---------- Smooth scroll for anchor links ----------
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length <= 1) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ---------- RSVP form submission ----------
(function rsvp() {
  const form     = document.getElementById('rsvpForm');
  const success  = document.getElementById('successCard');
  const iframe   = document.getElementById('rsvpTarget');
  if (!form) return;

  const GFORM_ACTION =
    'https://docs.google.com/forms/d/e/1FAIpQLSdl3LzP3s-UGARzP7GFvYctUm5QQaH5DuynDxgjII4HYpWhmg/formResponse';

  const submitBtn = form.querySelector('.btn-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.reportValidity()) return;

    // Ensure at least one F&B option is selected
    const fbChecked = form.querySelectorAll('input[name="entry.1682119069"]:checked');
    if (!fbChecked.length) {
      alert('Please select at least one food & beverage preference.');
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    // Build FormData manually so checkbox arrays post correctly
    const data = new FormData();
    const fields = form.querySelectorAll('input');
    fields.forEach((f) => {
      if (f.type === 'checkbox') {
        if (f.checked) data.append(f.name, f.value);
      } else if (f.name) {
        data.append(f.name, f.value);
      }
    });

    // Submit to Google Forms via hidden iframe (fire-and-forget, CORS-safe)
    const poster = document.createElement('form');
    poster.action = GFORM_ACTION;
    poster.method = 'POST';
    poster.target = 'rsvpTarget';
    poster.style.display = 'none';

    for (const [key, value] of data.entries()) {
      const i = document.createElement('input');
      i.type = 'hidden';
      i.name = key;
      i.value = value;
      poster.appendChild(i);
    }

    document.body.appendChild(poster);

    // Wait for iframe load event (Google responds with its thank-you page)
    const done = new Promise((resolve) => {
      const onLoad = () => {
        iframe.removeEventListener('load', onLoad);
        resolve();
      };
      iframe.addEventListener('load', onLoad);
      // Fallback: treat as success after 3s even if iframe event doesn't fire
      setTimeout(resolve, 3000);
    });

    poster.submit();
    await done;

    poster.remove();

    // Swap form for success card
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();

// ---------- Subtle parallax on orbs (desktop only) ----------
(function parallax() {
  if (window.matchMedia('(max-width: 900px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const orbs = document.querySelectorAll('.orb');
  let tx = 0, ty = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    tx = x * 30;
    ty = y * 20;
  });

  function loop() {
    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;
    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 0.6;
      orb.style.transform = `translate(${cx * factor}px, ${cy * factor}px)`;
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ---------- Reveal on scroll ----------
(function reveal() {
  if (!('IntersectionObserver' in window)) return;
  const items = document.querySelectorAll('.feature, .partner-card, .venue-copy, .venue-map, .rsvp-intro, .rsvp-form, .section-head');
  items.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .6s cubic-bezier(.2,.8,.2,1), transform .6s cubic-bezier(.2,.8,.2,1)';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach((el) => io.observe(el));
})();
