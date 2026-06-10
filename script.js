const themes = ['night', 'clear', 'tape'];
const body = document.body;
const themeButton = document.querySelector('[data-theme-toggle]');
const storedTheme = localStorage.getItem('glasswall-theme');
if (storedTheme && themes.includes(storedTheme)) body.dataset.theme = storedTheme;

themeButton?.addEventListener('click', () => {
  const current = body.dataset.theme || 'night';
  const next = themes[(themes.indexOf(current) + 1) % themes.length];
  body.dataset.theme = next;
  localStorage.setItem('glasswall-theme', next);
  themeButton.textContent = next === 'night' ? 'Theme' : next[0].toUpperCase() + next.slice(1);
});

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach((item) => observer.observe(item));

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const intakeForm = document.querySelector('[data-intake-form]');
const recommendation = document.querySelector('[data-recommendation]');
const recommendations = {
  beginner: {
    title: 'Beginner Starter Session',
    body: 'Start with one low-pressure session. Pick your references, make or choose one beat, record a rough idea, and leave with a simple 30-day plan.'
  },
  demos: {
    title: 'Demo-to-Release Sprint',
    body: 'Choose the strongest demo, finish the record, make the cover/content list, and build a rollout that does not depend on luck.'
  },
  release: {
    title: 'Release & Product Launch',
    body: 'Lock metadata, visuals, short-form clips, store ideas, email capture, and one physical or event-based offer around the music.'
  },
  manager: {
    title: 'Manager Support Plan',
    body: 'Build a clean one-sheet: artist position, rollout calendar, needed assets, potential partners, and next revenue plays.'
  },
  money: {
    title: 'Monetization Readiness Audit',
    body: 'Review streaming, YouTube, merch, show, sponsorship, and direct-to-fan paths. Then pick the fastest honest revenue move.'
  },
  events: {
    title: 'Studio / Event Buildout',
    body: 'Shape a listening room, content day, writing camp, or small showcase that gives the artist a real-world moment.'
  }
};

intakeForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(intakeForm);
  const stage = data.get('stage');
  const need = data.get('need');
  const pick = recommendations[need] && (need === 'money' || need === 'events') ? recommendations[need] : recommendations[stage];
  recommendation.innerHTML = `<p class="card-kicker">Recommendation</p><h3>${pick.title}</h3><p>${pick.body}</p><a class="button ghost" href="#contact">Send this inquiry</a>`;
});

const contactForm = document.querySelector('[data-contact-form]');
const formNote = document.querySelector('[data-form-note]');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get('name')?.toString().trim() || 'Artist inquiry';
  const email = data.get('email')?.toString().trim() || '';
  const message = data.get('message')?.toString().trim() || '';
  const subject = encodeURIComponent(`GlassWall inquiry — ${name}`);
  const body = encodeURIComponent(`Name / artist name: ${name}\nEmail: ${email}\n\nWhat I'm building:\n${message}\n\nSent from the GlassWall website starter form.`);
  window.location.href = `mailto:hello@glasswallrecords.com?subject=${subject}&body=${body}`;
  formNote.textContent = 'Email draft opened. Change hello@glasswallrecords.com to your real inbox before publishing.';
});
