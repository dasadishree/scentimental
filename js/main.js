// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
}

// Fade sections in as they scroll into view
const revealed = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealed.forEach((el) => io.observe(el));
} else {
  revealed.forEach((el) => el.classList.add('in'));
}

// Instagram gallery arrows
const track = document.querySelector('.insta-track');
document.querySelectorAll('[data-scroll]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const step = track.firstElementChild.offsetWidth + 14;
    track.scrollBy({ left: step * Number(btn.dataset.scroll), behavior: 'smooth' });
  });
});

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
