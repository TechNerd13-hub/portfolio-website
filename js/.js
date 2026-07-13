// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close mobile menu after a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const setActiveLink = () => {
  let currentId = sections[0]?.id;
  const scrollPos = window.scrollY + 120;

  sections.forEach(section => {
    if (section.offsetTop <= scrollPos) {
      currentId = section.id;
    }
  });

  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${currentId}`;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

// ===== Accessible contact form validation =====
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

const validators = {
  name: value => value.trim().length >= 2 ? '' : 'Please enter your full name.',
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address.',
  subject: value => value.trim().length >= 3 ? '' : 'Please enter a subject.',
  message: value => value.trim().length >= 10 ? '' : 'Message should be at least 10 characters.'
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let isValid = true;

  Object.keys(validators).forEach(field => {
    const input = document.getElementById(field);
    const errorEl = document.getElementById(`${field}Error`);
    const message = validators[field](input.value);

    errorEl.textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');

    if (message) isValid = false;
  });

  if (!isValid) {
    formStatus.textContent = 'Please fix the errors above before submitting.';
    formStatus.className = 'form-status error';
    return;
  }

  // No backend wired up yet — simulate a successful send.
  formStatus.textContent = 'Thanks! Your message has been sent successfully.';
  formStatus.className = 'form-status success';
  form.reset();
});