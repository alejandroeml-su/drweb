// =============================================
// main.js - Script principal del sitio
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // Actualizar año en el footer automáticamente
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Manejo del formulario de contacto
  const form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = form.querySelector('#nombre')?.value.trim();
      const email  = form.querySelector('#email')?.value.trim();

      if (!nombre || !email) {
        alert('Por favor completa todos los campos requeridos.');
        return;
      }

      // Aquí iría la lógica de envío (fetch, etc.)
      alert(`¡Gracias, ${nombre}! Tu mensaje ha sido enviado.`);
      form.reset();
    });
  }

  // Menú hamburguesa móvil (si existe)
  const menuToggle = document.querySelector('.nav__toggle');
  const navLinks   = document.querySelector('.nav__links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('nav__links--open');
      menuToggle.setAttribute(
        'aria-expanded',
        navLinks.classList.contains('nav__links--open')
      );
    });
  }

  // Scroll suave para enlaces de anclaje
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Animación de aparición al hacer scroll (Intersection Observer)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section, .card, .hero').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

});
