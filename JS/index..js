
/* ==========================================================================
   THE NOLEEN HOMEWARE — script.js
   Vanilla JS only. No frameworks/libraries.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* Confirm JS is running before enabling the hidden/animate-in reveal state.
     Content is visible by default in CSS regardless of this — see style.css. */
  document.body.classList.add('reveal-ready');

  /* ---------------- Sticky navbar ---------------- */
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    backToTop && backToTop.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-overlay');
  function closeMobile(){ hamburger?.classList.remove('active'); mobileMenu?.classList.remove('open'); overlay?.classList.remove('open'); }
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay?.addEventListener('click', closeMobile);
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));

  /* ---------------- Button ripple effect ---------------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------------- Back to top ---------------- */
  backToTop?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  /* ---------------- Single-page navigation ---------------- */
  const pageSections = document.querySelectorAll('.page-section');
  const pageLinks = document.querySelectorAll('[data-page]');

  function setActiveNavLink(page){
    document.querySelectorAll('.nav-links a[data-page], .mobile-menu a[data-page]').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });
  }

  function switchPage(page){
    const target = document.getElementById('page-' + page);
    if (!target) return;
    pageSections.forEach(s => s.classList.remove('active'));
    target.classList.add('active');
    setActiveNavLink(page);
    window.scrollTo(0, 0);
    closeMobile();
    initRevealForActivePage();
    initCountersForActivePage();
    updateCartCount();
  }

  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchPage(link.dataset.page);
    });
  });

  /* ---------------- Scroll reveal (scoped to the active page-section) ---------------- */
  let revealObserver;
  function initRevealForActivePage(){
    if (revealObserver) revealObserver.disconnect();
    const activeSection = document.querySelector('.page-section.active');
    if (!activeSection) return;
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); revealObserver.unobserve(en.target); } });
    }, { threshold: 0.15 });
    activeSection.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  /* ---------------- Animated counters (scoped to the active page-section) ---------------- */
  let counterObserver;
  function initCountersForActivePage(){
    if (counterObserver) counterObserver.disconnect();
    const activeSection = document.querySelector('.page-section.active');
    if (!activeSection) return;
    counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10) || 0;
          const suffix = el.dataset.suffix || '';
          let cur = 0;
          const step = Math.max(1, Math.ceil(target / 60));
          const timer = setInterval(() => {
            cur += step;
            if (cur >= target) { cur = target; clearInterval(timer); }
            el.textContent = cur + suffix;
          }, 25);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    activeSection.querySelectorAll('.counter-item .num').forEach(el => counterObserver.observe(el));
  }

  // Initialize on load — always start on Home.
  switchPage('home');

  /* ---------------- Hero slider ---------------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  let heroIndex = 0, heroTimer;
  function showHero(i){
    heroSlides.forEach(s => s.classList.remove('active'));
    heroDots.forEach(d => d.classList.remove('active'));
    heroIndex = (i + heroSlides.length) % heroSlides.length;
    heroSlides[heroIndex].classList.add('active');
    heroDots[heroIndex]?.classList.add('active');
  }
  function nextHero(){ showHero(heroIndex + 1); }
  function startHeroAuto(){ heroTimer = setInterval(nextHero, 5000); }
  if (heroSlides.length){
    showHero(0);
    startHeroAuto();
    document.querySelector('.hero-next')?.addEventListener('click', () => { nextHero(); clearInterval(heroTimer); startHeroAuto(); });
    document.querySelector('.hero-prev')?.addEventListener('click', () => { showHero(heroIndex - 1); clearInterval(heroTimer); startHeroAuto(); });
    heroDots.forEach((dot, i) => dot.addEventListener('click', () => { showHero(i); clearInterval(heroTimer); startHeroAuto(); }));
  }

  /* ---------------- Testimonial slider ---------------- */
  const tSlides = document.querySelectorAll('.testimonial-slide');
  const tDots = document.querySelectorAll('.testimonial-dots .dot');
  let tIndex = 0;
  function showTestimonial(i){
    tSlides.forEach(s => s.classList.remove('active'));
    tDots.forEach(d => d.classList.remove('active'));
    tIndex = (i + tSlides.length) % tSlides.length;
    tSlides[tIndex].classList.add('active');
    tDots[tIndex]?.classList.add('active');
  }
  if (tSlides.length){
    showTestimonial(0);
    setInterval(() => showTestimonial(tIndex + 1), 6000);
    tDots.forEach((d,i) => d.addEventListener('click', () => showTestimonial(i)));
  }

  /* ---------------- Countdown timer (Monthly Specials) ---------------- */
  const countdownEl = document.querySelector('.countdown-banner');
  if (countdownEl){
    // Countdown to the end of the current month — update this logic monthly if needed.
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    const sEl = document.getElementById('cd-secs');
    function tick(){
      const diff = Math.max(0, endOfMonth - new Date());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (dEl) dEl.textContent = String(d).padStart(2,'0');
      if (hEl) hEl.textContent = String(h).padStart(2,'0');
      if (mEl) mEl.textContent = String(m).padStart(2,'0');
      if (sEl) sEl.textContent = String(s).padStart(2,'0');
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- Wishlist ---------------- */
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const active = btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      if (icon) icon.className = active ? 'bx bxs-heart' : 'bx bx-heart';
    });
  });

  /* ---------------- Cart (persisted in memory for the session via localStorage-free simple state) ---------------- */
  const CART_KEY = 'noleen_cart_demo';
  function getCart(){
    try { return JSON.parse(sessionStorage.getItem(CART_KEY)) || []; } catch(e){ return []; }
  }
  function saveCart(cart){ try { sessionStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e){} }
  function updateCartCount(){
    const cart = getCart();
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
  }
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-name]');
      if (!card) return;
      const name = card.dataset.name;
      const price = card.dataset.price;
      const img = card.dataset.img;
      let cart = getCart();
      const existing = cart.find(i => i.name === name);
      if (existing) existing.qty += 1;
      else cart.push({ name, price, img, qty: 1 });
      saveCart(cart);
      updateCartCount();
      const original = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(() => btn.textContent = original, 1200);
    });
  });
  updateCartCount();

  /* ---------------- Render cart on shopping.html ---------------- */
  const cartContainer = document.querySelector('.cart-items-list');
  if (cartContainer){
    function renderCart(){
      const cart = getCart();
      const emptyState = document.querySelector('.empty-cart');
      const summaryBox = document.querySelector('.order-summary');
      if (!cart.length){
        cartContainer.innerHTML = '';
        emptyState && (emptyState.style.display = 'block');
        summaryBox && (summaryBox.style.display = 'none');
        updateSummary(0);
        return;
      }
      emptyState && (emptyState.style.display = 'none');
      summaryBox && (summaryBox.style.display = 'block');
      cartContainer.innerHTML = cart.map((item, idx) => `
        <div class="cart-item reveal visible">
          <img src="${item.img}" alt="${item.name}">
          <div>
            <h4>${item.name}</h4>
            <p style="color:#888;font-size:0.85rem;">R${item.price}.00 each</p>
          </div>
          <div class="qty-selector">
            <button data-act="dec" data-idx="${idx}">–</button>
            <input type="text" readonly value="${item.qty}">
            <button data-act="inc" data-idx="${idx}">+</button>
          </div>
          <div style="font-weight:600;">R${(item.price * item.qty).toFixed(2)}</div>
          <button class="remove-btn" data-idx="${idx}"><i class="bx bx-trash"></i></button>
        </div>
      `).join('');
      cartContainer.querySelectorAll('button[data-act]').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.dataset.idx, 10);
          const cart = getCart();
          if (b.dataset.act === 'inc') cart[idx].qty += 1;
          else cart[idx].qty = Math.max(1, cart[idx].qty - 1);
          saveCart(cart); renderCart(); updateCartCount();
        });
      });
      cartContainer.querySelectorAll('.remove-btn').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.dataset.idx, 10);
          const cart = getCart();
          cart.splice(idx, 1);
          saveCart(cart); renderCart(); updateCartCount();
        });
      });
      const subtotal = cart.reduce((s,i) => s + (i.price * i.qty), 0);
      updateSummary(subtotal);
    }
    function updateSummary(subtotal){
      const shipping = subtotal > 0 ? (subtotal > 1500 ? 0 : 150) : 0;
      const subtotalEl = document.getElementById('sum-subtotal');
      const shippingEl = document.getElementById('sum-shipping');
      const totalEl = document.getElementById('sum-total');
      if (subtotalEl) subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
      if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `R${shipping.toFixed(2)}`;
      if (totalEl) totalEl.textContent = `R${(subtotal + shipping).toFixed(2)}`;
    }
    renderCart();

    document.querySelector('.coupon-box button')?.addEventListener('click', (e) => {
      e.preventDefault();
      const input = document.querySelector('.coupon-box input');
      const msg = document.querySelector('.coupon-msg');
      if (msg) msg.textContent = input.value.trim() ? 'Coupon applied — 10% off will reflect at checkout.' : 'Please enter a coupon code.';
    });

    document.querySelector('.checkout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const cart = getCart();
      if (!cart.length){ alert('Your cart is empty. Add some beautiful décor first!'); return; }
      const summary = cart.map(i => `${i.qty} x ${i.name}`).join('%0A');
      const msg = `Hi Noleen Homeware! I'd like to order:%0A${summary}%0A%0APlease send me delivery & payment details.`;
      window.open(`https://wa.me/27849222193?text=${msg}`, '_blank');
    });
  }

  /* ---------------- Product search & filter (catalog page) ---------------- */
  const searchInput = document.querySelector('.catalog-search-input');
  const catalogCards = document.querySelectorAll('.catalog-grid .product-card');
  const categoryChecks = document.querySelectorAll('.filter-category');
  const sortSelect = document.querySelector('.sort-select');
  const catalogGrid = document.querySelector('.catalog-grid');

  function filterProducts(){
    const term = (searchInput?.value || '').toLowerCase();
    const checked = Array.from(categoryChecks).filter(c => c.checked).map(c => c.value);
    catalogCards.forEach(card => {
      const name = card.dataset.name?.toLowerCase() || '';
      const cat = card.dataset.category || '';
      const matchesSearch = name.includes(term);
      const matchesCat = checked.length === 0 || checked.includes(cat);
      card.style.display = (matchesSearch && matchesCat) ? '' : 'none';
    });
  }
  searchInput?.addEventListener('input', filterProducts);
  categoryChecks.forEach(c => c.addEventListener('change', filterProducts));

  sortSelect?.addEventListener('change', () => {
    if (!catalogGrid) return;
    const cards = Array.from(catalogGrid.querySelectorAll('.product-card'));
    const val = sortSelect.value;
    cards.sort((a,b) => {
      const pa = parseFloat(a.dataset.price), pb = parseFloat(b.dataset.price);
      if (val === 'low') return pa - pb;
      if (val === 'high') return pb - pa;
      if (val === 'popular') return (parseFloat(b.dataset.rating)||0) - (parseFloat(a.dataset.rating)||0);
      return 0; // newest = original order
    });
    cards.forEach(c => catalogGrid.appendChild(c));
  });

  /* ---------------- Color swatch selection ---------------- */
  document.querySelectorAll('.color-swatches span').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.parentElement.querySelectorAll('span').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
    });
  });

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question')?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---------------- Contact form ---------------- */
  const contactForm = document.querySelector('.contact-form');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const successEl = document.querySelector('.form-success');
    contactForm.reset();
    if (successEl){
      successEl.style.display = 'block';
      setTimeout(() => successEl.style.display = 'none', 5000);
    }
  });

  /* ---------------- Newsletter ---------------- */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input.value.trim()){
        input.value = '';
        input.placeholder = 'Thank you for subscribing!';
        setTimeout(() => input.placeholder = 'Your email address', 3000);
      }
    });
  });

  /* ---------------- Quick view (simple alert-style modal via native dialog behaviour) ---------------- */
  document.querySelectorAll('.quickview-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-name]');
      if (card) showQuickView(card.dataset.name, card.dataset.price, card.dataset.img);
    });
  });
  function showQuickView(name, price, img){
    let modal = document.querySelector('.qv-modal');
    if (!modal){
      modal = document.createElement('div');
      modal.className = 'qv-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(20,20,20,0.6);display:flex;align-items:center;justify-content:center;z-index:2000;opacity:0;transition:opacity .3s;';
      modal.innerHTML = `
        <div style="background:#fff;border-radius:20px;max-width:520px;width:90%;padding:36px;position:relative;display:flex;gap:24px;flex-wrap:wrap;">
          <button class="qv-close" style="position:absolute;top:16px;right:20px;font-size:1.4rem;"><i class="bx bx-x"></i></button>
          <img class="qv-img" style="width:180px;height:180px;object-fit:cover;border-radius:14px;flex-shrink:0;">
          <div style="flex:1;min-width:180px;">
            <h3 class="qv-name" style="font-family:'Playfair Display',serif;margin-bottom:10px;"></h3>
            <p class="qv-price" style="font-size:1.3rem;color:#D4AF37;font-weight:700;margin-bottom:16px;"></p>
            <p style="color:#666;font-size:0.9rem;margin-bottom:20px;">Premium quality, made to elevate any room. Contact us for size and colour options.</p>
            <a href="https://wa.me/27849222193" target="_blank" style="display:inline-block;background:#D4AF37;color:#fff;padding:12px 26px;border-radius:999px;font-weight:600;">Enquire on WhatsApp</a>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('.qv-close').addEventListener('click', () => modal.style.opacity = 0);
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.opacity = 0; });
    }
    modal.querySelector('.qv-name').textContent = name;
    modal.querySelector('.qv-price').textContent = `R${price}.00`;
    modal.querySelector('.qv-img').src = img;
    requestAnimationFrame(() => modal.style.opacity = 1);
  }

  /* ---------------- Set current year in footer ---------------- */
  document.querySelectorAll('.current-year').forEach(el => el.textContent = new Date().getFullYear());

});

const authOverlay = document.getElementById('authOverlay');
const userMenuBtn = document.getElementById('userMenuBtn');
const authClose = document.getElementById('authClose');

function openAuth(tab){
  authOverlay?.classList.add('open');
  if (tab) setAuthTab(tab);
}
function closeAuth(){ authOverlay?.classList.remove('open'); }
function setAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.authTab === tab));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById(tab + 'Form')?.classList.add('active');
}

userMenuBtn?.addEventListener('click', () => openAuth('signin'));
authClose?.addEventListener('click', closeAuth);
authOverlay?.addEventListener('click', (e) => { if (e.target === authOverlay) closeAuth(); });
document.querySelectorAll('[data-auth-tab]').forEach(el => {
  el.addEventListener('click', (e) => { e.preventDefault(); setAuthTab(el.dataset.authTab); });
});

document.getElementById('signinForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  closeAuth();
  alert('Thanks for signing in! (Demo only — connect this to your real authentication backend.)');
});
document.getElementById('signupForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  closeAuth();
  alert('Account created! (Demo only — connect this to your real authentication backend.)');
});
document.getElementById('googleSignIn')?.addEventListener('click', () => {
  alert('Continue with Google (Demo only — connect this to real Google OAuth via your backend).');
});
document.getElementById('googleSignUp')?.addEventListener('click', () => {
  alert('Continue with Google (Demo only — connect this to real Google OAuth via your backend).');
});
