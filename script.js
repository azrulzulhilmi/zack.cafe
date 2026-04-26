(function () {
  'use strict';

  /* ── NAVBAR SCROLL ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', onScroll, { passive: true });

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveLink();
  }

  /* ── MOBILE MENU ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', function () {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
  });

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ── ACTIVE LINK SCROLL SPY ── */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    sections.forEach(function (sec) {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        navItems.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id);
        });
      }
    });
  }

  /* ── MENU TABS ── */
  const tabs = document.querySelectorAll('.menu-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      document.querySelectorAll('.menu-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  /* ── CART STATE ── */
  var cart = [];

  function getItem(name) { return cart.find(function(i){ return i.name === name; }); }

  function addToCart(name, price, img) {
    var item = getItem(name);
    if (item) {
      item.qty++;
    } else {
      cart.push({ name: name, price: parseFloat(price), img: img, qty: 1 });
    }
    renderCart();
    showToast('Added: ' + name);
    bumpCount();
  }

  function changeQty(name, delta) {
    var item = getItem(name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(function(i){ return i.name !== name; });
    renderCart();
  }

  function removeItem(name) {
    cart = cart.filter(function(i){ return i.name !== name; });
    renderCart();
  }

  /* ── RENDER CART ── */
  var countEl    = document.getElementById('cart-count');
  var itemsEl    = document.getElementById('cart-items');
  var emptyEl    = document.getElementById('cart-empty');
  var footerEl   = document.getElementById('cart-footer');
  var subtotalEl = document.getElementById('cart-subtotal');

  function renderCart() {
    var total = cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0);
    var count = cart.reduce(function(s,i){ return s + i.qty; }, 0);

    countEl.textContent = count;

    emptyEl.style.display  = cart.length === 0 ? 'block' : 'none';
    itemsEl.style.display  = cart.length === 0 ? 'none'  : 'flex';
    footerEl.style.display = cart.length === 0 ? 'none'  : 'block';

    itemsEl.innerHTML = '';
    cart.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML =
        '<img src="' + item.img + '" alt="' + item.name + '" class="cart-item-img" />' +
        '<div class="cart-item-details">' +
          '<div class="cart-item-name">' + item.name + '</div>' +
          '<div class="cart-item-price">RM ' + (item.price * item.qty).toFixed(2) + '</div>' +
          '<div class="cart-item-controls">' +
            '<button class="qty-btn" data-action="dec" data-name="' + item.name + '" aria-label="Decrease">−</button>' +
            '<span class="qty-num">' + item.qty + '</span>' +
            '<button class="qty-btn" data-action="inc" data-name="' + item.name + '" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>' +
        '<button class="cart-item-remove" data-name="' + item.name + '" aria-label="Remove ' + item.name + '">🗑</button>';
      itemsEl.appendChild(li);
    });

    subtotalEl.textContent = 'RM ' + total.toFixed(2);

    // Event delegation for qty/remove inside cart
    itemsEl.querySelectorAll('.qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        changeQty(btn.dataset.name, btn.dataset.action === 'inc' ? 1 : -1);
      });
    });
    itemsEl.querySelectorAll('.cart-item-remove').forEach(function (btn) {
      btn.addEventListener('click', function () { removeItem(btn.dataset.name); });
    });
  }

  /* ── CART DRAWER OPEN/CLOSE ── */
  var drawer  = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  var cartBtn = document.getElementById('cart-btn');
  var closeBtn= document.getElementById('cart-close');

  function openCart() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  closeBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeCart(); });

  /* ── ADD TO CART BUTTONS ── */
  document.querySelectorAll('.add-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      addToCart(btn.dataset.name, btn.dataset.price, btn.dataset.img);
      btn.textContent = '✓ Added';
      btn.classList.add('added');
      setTimeout(function () {
        btn.textContent = '+ Add';
        btn.classList.remove('added');
      }, 1200);
    });
  });

  /* ── CHECKOUT BUTTON — WhatsApp order ── */
  document.getElementById('checkout-btn').addEventListener('click', function () {
    if (cart.length === 0) return;
    var total = cart.reduce(function(s,i){ return s + i.price*i.qty; }, 0);

    // Build the WhatsApp message
    var lines = ['🌿 *Order from Zack Cafe* 🌿', ''];
    cart.forEach(function(item) {
      lines.push('• ' + item.name + ' x' + item.qty + ' — RM ' + (item.price * item.qty).toFixed(2));
    });
    lines.push('');
    lines.push('*Total: RM ' + total.toFixed(2) + '*');
    lines.push('');
    lines.push('Please confirm my order. Thank you! 😊');

    var message = encodeURIComponent(lines.join('\n'));
    var waUrl   = 'https://wa.me/60126915745?text=' + message;

    // Open WhatsApp in a new tab
    window.open(waUrl, '_blank');
  });

  /* ── TOAST ── */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2500);
  }

  /* ── CART COUNT BUMP ── */
  function bumpCount() {
    countEl.classList.remove('bump');
    void countEl.offsetWidth; // reflow
    countEl.classList.add('bump');
    setTimeout(function(){ countEl.classList.remove('bump'); }, 300);
  }

  /* ── INTERSECTION OBSERVER fade-in ── */
  var style = document.createElement('style');
  style.textContent = '.visible{opacity:1!important;transform:translateY(0)!important}';
  document.head.appendChild(style);

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { rootMargin:'0px 0px -60px 0px', threshold:0.1 });

  document.querySelectorAll('.item-card, .about-image-wrap, .about-content, .info-block, .visit-map').forEach(function(el, i){
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition= 'opacity .55s ease '+(i*0.06)+'s, transform .55s ease '+(i*0.06)+'s';
    obs.observe(el);
  });

  /* ── INIT ── */
  renderCart();
  onScroll();

})();
