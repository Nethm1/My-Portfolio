/* =============================================
   PARTICLE NETWORK CANVAS
   ============================================= */
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, mouse = { x: null, y: null };
  const PARTICLE_COUNT = 80;
  const MAX_DIST = 130;
  const PARTICLE_COLOR = 'rgba(167, 139, 250,'; // purple-400

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x:  randomBetween(0, W),
        y:  randomBetween(0, H),
        vx: randomBetween(-0.35, 0.35),
        vy: randomBetween(-0.35, 0.35),
        r:  randomBetween(1.5, 3),
        alpha: randomBetween(0.3, 0.8),
      });
    }
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = PARTICLE_COLOR + p.alpha + ')';
    ctx.shadowBlur  = 8;
    ctx.shadowColor = 'rgba(167,139,250,0.6)';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawLine(p1, p2, dist) {
    const opacity = (1 - dist / MAX_DIST) * 0.35;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = PARTICLE_COLOR + opacity + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      drawParticle(p);
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) drawLine(particles[i], particles[j], dist);
      }

      // Mouse interaction
      if (mouse.x !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST * 1.5) {
          drawLine(particles[i], mouse, dist);
          // Attract toward mouse slightly
          particles[i].vx += (dx < 0 ? 0.005 : -0.005);
          particles[i].vy += (dy < 0 ? 0.005 : -0.005);
          // Cap speed
          const speed = Math.sqrt(particles[i].vx ** 2 + particles[i].vy ** 2);
          if (speed > 1.2) {
            particles[i].vx = (particles[i].vx / speed) * 1.2;
            particles[i].vy = (particles[i].vy / speed) * 1.2;
          }
        }
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  window.addEventListener('resize', () => { resize(); createParticles(); });

  resize();
  createParticles();
  animate();
})();

/* =============================================
   NAVBAR — scroll + active link
   ============================================= */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');
const allNavLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  highlightActiveSection();
  toggleBackToTop();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open');
  document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
});

allNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    document.body.style.overflow = '';
  });
});

document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && navLinksEl.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    document.body.style.overflow = '';
  }
});

function highlightActiveSection() {
  const sections  = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
    if (!link) return;
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      allNavLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

/* =============================================
   SCROLL REVEAL
   ============================================= */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('visible'), idx * 90);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* =============================================
   BACK TO TOP
   ============================================= */
const backToTopBtn = document.getElementById('back-to-top');
function toggleBackToTop() {
  backToTopBtn.classList.toggle('visible', window.scrollY > 400);
}
backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* =============================================
   SMOOTH SCROLL
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});

/* =============================================
   TYPING EFFECT
   ============================================= */
const roles = [
  'Software Engineer',
  'QA Enthusiast',
  'Full-Stack Developer',
  'Problem Solver'
];

let roleIdx = 0, charIdx = 0, deleting = false;
const typingEl = document.querySelector('.typing-text');

function type() {
  if (!typingEl) return;
  const role = roles[roleIdx];
  typingEl.textContent = deleting ? role.substring(0, charIdx--) : role.substring(0, charIdx++);

  let delay = deleting ? 45 : 85;
  if (!deleting && charIdx === role.length + 1) { delay = 2000; deleting = true; }
  else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 400; }
  setTimeout(type, delay);
}
setTimeout(type, 1200);

/* =============================================
   CONTACT FORM
   ============================================= */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    setTimeout(() => {
      form.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;padding:40px 20px;text-align:center;">
          <i class="fas fa-check-circle" style="font-size:3rem;color:#a855f7;margin-bottom:16px;text-shadow:0 0 20px rgba(168,85,247,0.6);"></i>
          <h3 style="font-size:1.2rem;font-weight:700;color:#f1f5f9;margin-bottom:8px;">Message Sent!</h3>
          <p style="font-size:0.9rem;color:#94a3b8;">Thanks for reaching out. I'll get back to you soon.</p>
        </div>`;
    }, 1500);
  });
}

/* =============================================
   JOURNEY IN MAKING — strip + modal
   ============================================= */
(function () {

  /* ---------- Project data ---------- */
  const projects = {
    campusx: {
      title: 'CampusX',
      type:  'Smart Campus Management System',
      image: 'images/projects/campusx.jpg',
      icon:  'fa-university',
      tech:  ['Spring Boot', 'React.js', 'MySQL', 'JWT Auth', 'Google OAuth 2.0', 'REST API'],
      features: [
        'Smart resource booking with conflict detection',
        'Incident reporting with threaded comments',
        'Role-based access (Student / Admin / Technician)',
        'Real-time notifications & email alerts',
        'Facilities & availability management',
        'Google OAuth 2.0 authentication',
      ],
      description: 'A full-stack campus management platform that digitalises facility bookings, incident tracking, and user administration — all accessible through a clean, role-aware dashboard.',
      backstory: 'Built as a group academic project at SLIIT to address real campus resource management problems. Focused on security architecture, clean API design, and a polished React UI.',
      github: 'https://github.com/Nethm1/CampusX-Smart-Campus-System',
    },
    habix: {
      title: 'HabiX',
      type:  'Android Habit Tracking App',
      image: 'images/projects/habix.jpg',
      icon:  'fa-android',
      tech:  ['Kotlin', 'MVVM Architecture', 'Android Studio', 'LiveData', 'Room DB'],
      features: [
        'Daily habit tracking with streaks',
        'Progress analytics & charts',
        'Custom reminders & notifications',
        'Clean Material Design UI',
        'Offline-first with local storage',
      ],
      description: 'A native Android application that helps users build and maintain positive habits through daily check-ins, streak tracking, and visual progress analytics.',
      backstory: 'Created to explore Kotlin and MVVM architecture in a real mobile context. The goal was to deliver a smooth, native Android experience with clean separation of concerns.',
      github: 'https://github.com/Nethm1/HabiX',
    },
    unilink: {
      title: 'UniLink',
      type:  'Lecturer Appointment Booking System',
      image: null,
      icon:  'fa-calendar-check',
      tech:  ['Spring Boot', 'React.js', 'MySQL', 'REST API'],
      features: [
        'Lecturer availability slot management',
        'Student appointment booking portal',
        'Real-time booking status updates',
        'Email confirmation notifications',
        'Admin dashboard for oversight',
      ],
      description: 'A full-stack web application that streamlines how students book appointments with lecturers, replacing manual email chains with a structured, automated workflow.',
      backstory: 'Developed to solve a real pain point at SLIIT — students struggling to reach lecturers. Focused on clear UX flows and reliable backend scheduling logic.',
      github: 'https://github.com/Nethm1/UniLink-',
    },
    qa: {
      title: 'QA Automation Project',
      type:  'End-to-End Test Automation Suite',
      image: 'images/projects/qa.jpg',
      icon:  'fa-robot',
      tech:  ['Python', 'Playwright', 'Pytest', 'Page Object Model'],
      features: [
        'Automated UI interaction testing',
        'Form validation test coverage',
        'API response assertion suite',
        'Page Object Model pattern',
        'HTML test reports generation',
      ],
      description: 'A Playwright-based automation suite covering end-to-end web testing scenarios — from UI interactions and form flows to API response validation with structured reports.',
      backstory: 'Built as part of SLIIT IT3040 assignment to apply QA engineering principles in a real automation context. Reinforced understanding of test design and the POM pattern.',
      github: 'https://github.com/Nethm1/IT3040-Assignment1',
    },
    inventory: {
      title: 'Inventory Management System',
      type:  'Full-Stack MERN Application',
      image: 'images/projects/inventory.jpg',
      icon:  'fa-boxes-stacked',
      tech:  ['MongoDB', 'Express.js', 'React.js', 'Node.js'],
      features: [
        'Real-time stock level tracking',
        'Order creation & management',
        'Delivery status monitoring',
        'Analytics dashboard with charts',
        'Admin user & role management',
      ],
      description: 'A full-featured MERN stack system for managing inventory and deliveries, with real-time stock tracking, order workflows, and an analytics dashboard for business insights.',
      backstory: 'A collaborative group project at SLIIT exploring the full MERN stack end-to-end. Contributed to backend API design, state management, and the analytics module.',
      github: 'https://github.com/Rashini0926/Project1',
    },
    trendify: {
      title: 'Trendify',
      type:  'Clothing Store Mobile App',
      image: 'images/projects/trendify.jpg',
      icon:  'fa-shirt',
      tech:  ['Kotlin', 'MVVM + Clean Architecture', 'Jetpack Components', 'Room DB', 'Retrofit', 'Hilt'],
      features: [
        'Product browsing & advanced filtering',
        'Shopping cart with quantity management',
        'User authentication & profile management',
        'Wishlist & favorites',
        'Order management & payment integration',
        'Push notifications for promotions',
      ],
      description: 'A modern Android e-commerce app providing a seamless shopping experience with product browsing, cart management, secure authentication, and a clean Material Design UI.',
      backstory: 'Built to practice Clean Architecture with MVVM pattern in a real e-commerce context. Focused on offline-first design with Room DB, dependency injection with Hilt, and smooth navigation flows.',
      github: 'https://github.com/Nethm1/Trendify_clothing_store',
    },
  };

  /* ---------- Modal ---------- */
  const backdrop = document.getElementById('jm-backdrop');
  const grid     = document.getElementById('jm-modal-grid');
  const closeBtn = document.getElementById('jm-close');

  function openModal(key) {
    const p = projects[key];
    if (!p) return;

    const imgSrc = p.image || null;
    const imgContent = imgSrc
      ? `<img src="${imgSrc}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;object-position:top;display:block;" />`
      : `<div class="note-image-placeholder"><i class="fas ${p.icon}"></i></div>`;

    grid.innerHTML = `
      <div class="jm-note note-image" style="min-height:280px;">${imgContent}</div>
      <div class="jm-note note-tech">
        <p class="jm-note-title">Tech Stack</p>
        <ul>${p.tech.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="jm-note note-features">
        <p class="jm-note-title">Features</p>
        <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
      </div>
      <div class="jm-note note-desc">
        <p class="jm-note-title">Description</p>
        <p>${p.description}</p>
      </div>
      <div class="jm-note note-backstory">
        <p class="jm-note-title">Backstory</p>
        <p>${p.backstory}</p>
      </div>
      <div class="jm-note note-links">
        <p class="jm-note-title">Links</p>
        <a href="${p.github}" target="_blank" rel="noopener" class="jm-note-link">
          <i class="fab fa-github"></i> GitHub Repository
        </a>
      </div>`;

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Attach click to marquee cards — deduplicated by dataset.project */
  document.querySelectorAll('.jm-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.project));
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

})();

console.log('Portfolio loaded. Built with 💜 by Nethmi Wasana.');
