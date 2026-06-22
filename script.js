const body = document.body;
const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
const progress = document.querySelector('[data-scroll-progress]');
let lastScrollY = window.scrollY;

const updateHeader = () => {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 24);

  if (y > 250 && y > lastScrollY && !body.classList.contains('menu-open')) {
    header?.classList.add('header-hidden');
  } else {
    header?.classList.remove('header-hidden');
  }

  lastScrollY = y;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (y / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${percentage}%`;
};

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const closeMenu = () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menu?.classList.remove('open');
  body.classList.remove('menu-open');
};

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menu?.classList.toggle('open', !isOpen);
  body.classList.toggle('menu-open', !isOpen);
  header?.classList.remove('header-hidden');
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((item) => revealObserver.observe(item));
} else {
  reveals.forEach((item) => item.classList.add('is-visible'));
}

const serviceRows = document.querySelectorAll('.service-row');
serviceRows.forEach((row) => {
  const button = row.querySelector('.service-toggle');
  const detail = row.querySelector('.service-detail');
  const icon = row.querySelector('.service-icon');

  button?.addEventListener('click', () => {
    const willOpen = button.getAttribute('aria-expanded') !== 'true';

    serviceRows.forEach((otherRow) => {
      const otherButton = otherRow.querySelector('.service-toggle');
      const otherDetail = otherRow.querySelector('.service-detail');
      const otherIcon = otherRow.querySelector('.service-icon');
      otherButton?.setAttribute('aria-expanded', 'false');
      if (otherDetail) otherDetail.hidden = true;
      if (otherIcon) otherIcon.textContent = '+';
    });

    if (willOpen) {
      button.setAttribute('aria-expanded', 'true');
      if (detail) detail.hidden = false;
      if (icon) icon.textContent = '−';
    }
  });
});

const messageField = document.querySelector('textarea[name="message"]');
document.querySelectorAll('[data-prefill]').forEach((link) => {
  link.addEventListener('click', () => {
    if (messageField && !messageField.value.trim()) messageField.value = link.dataset.prefill || '';
  });
});

const contactForm = document.querySelector('[data-contact-form]');
const formNote = document.querySelector('[data-form-note]');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const stage = String(data.get('stage') || '').trim();
  const message = String(data.get('message') || '').trim();

  const subject = encodeURIComponent(`Glasswall project inquiry — ${name || 'New project'}`);
  const emailBody = encodeURIComponent(
`Name / artist: ${name}\nEmail: ${email}\nStage: ${stage}\n\nWhat I am building:\n${message}`
  );

  window.location.href = `mailto:hello@glasswallrecords.com?subject=${subject}&body=${emailBody}`;
  if (formNote) formNote.textContent = 'Your email draft is ready. Review it, then send.';
});

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();
