(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- FOOTER YEAR ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- MOBILE MENU ---------- */
  const navToggle = $('.nav-toggle');
  const mobileMenu = $('#mobileMenu');

  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    mobileMenu.hidden = open;
  });

  $$('#mobileMenu a').forEach(a =>
    a.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.hidden = true;
    })
  );


  /* ---------- CARD COVER IMAGES ---------- */
  $$('.card').forEach(card => {
    const first = (card.dataset.images || '').split('|')[0];
    if (!first) return;
    const media = card.querySelector('.card-media');
    const glyph = card.querySelector('.card-glyph');
    media.style.background = `url('${first}') center/cover no-repeat`;
    if (glyph) glyph.style.display = 'none';
  });

  /* ---------- APPLE-TV CARD MODAL ---------- */
  const cards = $$('.card');
  const modal = $('#serviceModal');
  const backdrop = $('#modalBackdrop');
  const modalClose = $('#modalClose');
  const modalTitle = $('#modalTitle');
  const modalDesc = $('#modalDesc');
  const modalKicker = $('#modalKicker');
  const carouselTrack = $('#carouselTrack');
  const carouselDots = $('#carouselDots');

  let currentCard = null;
  let slideInterval = null;
  let currentSlide = 0;

  const easeIOSSpring = 'cubic-bezier(0.32, 0.72, 0, 1)';

  const getModalTargetRect = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = Math.min(1100, vw - 48);
    const maxH = Math.min(660, vh - 48);
    const w = Math.min(maxW, maxH * 1.7);
    const h = Math.min(maxH, w / 1.7);
    return {
      width: w,
      height: h,
      top: (vh - h) / 2,
      left: (vw - w) / 2,
    };
  };

  const setCarousel = (images) => {
    carouselTrack.innerHTML = '';
    carouselDots.innerHTML = '';
    currentSlide = 0;

    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');
      slide.style.backgroundImage = `url('${src}')`;
      carouselTrack.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Imagem ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      carouselDots.appendChild(dot);
    });

    if (images.length > 1) {
      slideInterval = setInterval(() => {
        goToSlide((currentSlide + 1) % images.length);
      }, 4200);
    }
  };

  const goToSlide = (i) => {
    const slides = $$('.carousel-slide', carouselTrack);
    const dots = $$('.carousel-dot', carouselDots);
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
    currentSlide = i;
  };

  const openCard = (card) => {
    if (currentCard) return;
    currentCard = card;

    const startRect = card.getBoundingClientRect();
    const endRect = getModalTargetRect();

    modalTitle.textContent = card.dataset.title;
    modalDesc.textContent = card.dataset.description;
    modalKicker.textContent = 'Serviço enom';
    setCarousel(card.dataset.images.split('|'));

    modal.style.transition = 'none';
    modal.style.top = startRect.top + 'px';
    modal.style.left = startRect.left + 'px';
    modal.style.width = startRect.width + 'px';
    modal.style.height = startRect.height + 'px';
    modal.style.borderRadius = getComputedStyle(card).borderRadius;

    card.classList.add('opening');
    document.body.classList.add('modal-open');
    backdrop.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        modal.style.transition = `top 520ms ${easeIOSSpring}, left 520ms ${easeIOSSpring}, width 520ms ${easeIOSSpring}, height 520ms ${easeIOSSpring}, border-radius 520ms ${easeIOSSpring}`;
        modal.style.top = endRect.top + 'px';
        modal.style.left = endRect.left + 'px';
        modal.style.width = endRect.width + 'px';
        modal.style.height = endRect.height + 'px';
        modal.style.borderRadius = '28px';
        modal.classList.add('active');
      });
    });
  };

  const closeCard = () => {
    if (!currentCard) return;
    const card = currentCard;
    const startRect = card.getBoundingClientRect();

    modal.style.transition = `top 420ms ${easeIOSSpring}, left 420ms ${easeIOSSpring}, width 420ms ${easeIOSSpring}, height 420ms ${easeIOSSpring}, border-radius 420ms ${easeIOSSpring}`;
    modal.style.top = startRect.top + 'px';
    modal.style.left = startRect.left + 'px';
    modal.style.width = startRect.width + 'px';
    modal.style.height = startRect.height + 'px';
    modal.style.borderRadius = getComputedStyle(card).borderRadius;

    modal.classList.remove('active');
    backdrop.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
      card.classList.remove('opening');
      document.body.classList.remove('modal-open');
      currentCard = null;
      if (slideInterval) { clearInterval(slideInterval); slideInterval = null; }
      modal.removeAttribute('style');
    }, 430);
  };

  cards.forEach(card => {
    card.addEventListener('click', () => openCard(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard(card);
      }
    });
  });

  modalClose.addEventListener('click', closeCard);
  backdrop.addEventListener('click', closeCard);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentCard) closeCard();
  });

  const modalCta = $('#modalCta');
  modalCta.addEventListener('click', (e) => {
    e.preventDefault();
    const servico = modalTitle.textContent;
    const msg = `Olá! Tenho interesse no serviço de *${servico}* e gostaria de solicitar um orçamento.`;
    const url = `https://wa.me/5521979120606?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    closeCard();
  });

  window.addEventListener('resize', () => {
    if (!currentCard) return;
    const endRect = getModalTargetRect();
    modal.style.transition = `top 250ms ${easeIOSSpring}, left 250ms ${easeIOSSpring}, width 250ms ${easeIOSSpring}, height 250ms ${easeIOSSpring}`;
    modal.style.top = endRect.top + 'px';
    modal.style.left = endRect.left + 'px';
    modal.style.width = endRect.width + 'px';
    modal.style.height = endRect.height + 'px';
  });

  /* ---------- CONTACT FORM ---------- */
  const form = $('#contactForm');
  const feedback = $('#formFeedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nome = (data.get('nome') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();

    if (!nome || !email) {
      feedback.textContent = 'Preencha nome e e-mail para continuar.';
      feedback.classList.remove('success');
      return;
    }

    feedback.textContent = `Obrigado, ${nome.split(' ')[0]}. Entraremos em contato em breve.`;
    feedback.classList.add('success');
    form.reset();
  });

  /* ---------- HEADER HERO / NORMAL TRANSITION ---------- */
  const header = $('#siteHeader');
  const heroSection = $('.hero');

  // Start in hero state if page loads at the top
  if (heroSection) {
    header.classList.add('header--hero');

    const observer = new IntersectionObserver((entries) => {
      const inHero = entries[0].isIntersecting;
      header.classList.toggle('header--hero', inHero);
      header.style.top = inHero ? '16px' : '10px';
    }, {
      root: null,
      // Trigger when the bottom 20% of the hero exits the viewport
      rootMargin: '0px 0px -80% 0px',
      threshold: 0,
    });

    observer.observe(heroSection);
  }

  /* ---------- SMOOTH SCROLL OFFSET FOR FIXED HEADER ---------- */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
