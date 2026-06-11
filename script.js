const MENU = [
  {id:1,name:'Espresso',price:1.5,desc:'Rich & bold espresso',img:'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1'},
  {id:2,name:'Cappuccino',price:2.5,desc:'Steamed milk with foam',img:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2'},
  {id:3,name:'Latte',price:2.75,desc:'Smooth milk and espresso',img:'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3'},
  {id:4,name:'Injera Combo',price:5.5,desc:'Traditional injera with sides',img:'https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=4'},
  {id:5,name:'Shawarma',price:4.25,desc:'Spiced chicken wrap',img:'https://images.unsplash.com/photo-1604908177522-8f1b7b0b9a0d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=5'},
  {id:6,name:'Burger',price:4.0,desc:'Beef burger with fries',img:'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=6'}
];

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

let cart = JSON.parse(localStorage.getItem('cafe_cart')||'[]');

function formatCurrency(n){return '$'+n.toFixed(2)}

function renderMenu(){
  const grid = $('#menu-grid');
  grid.innerHTML='';
  MENU.forEach(item=>{
    const el = document.createElement('div');el.className='card';
    el.innerHTML = `
      <div class="thumb" style="background-image:url('${item.img}')"></div>
      <h4>${item.name}</h4>
      <p>${item.desc}</p>
      <div class="price">${formatCurrency(item.price)}</div>
      <div class="actions">
        <button class="btn ghost" data-id="${item.id}">Details</button>
        <button class="btn primary" data-add="${item.id}">Add</button>
      </div>
    `;
    grid.appendChild(el);
  });
}

function saveCart(){localStorage.setItem('cafe_cart',JSON.stringify(cart));}

function updateCartBadge(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  $('#cart-count').textContent = count;
}

function addToCart(id){
  const item = MENU.find(m=>m.id==id); if(!item) return;
  const existing = cart.find(c=>c.id==id);
  if(existing) existing.qty++;
  else cart.push({id:id,name:item.name,price:item.price,qty:1});
  saveCart(); updateCartBadge();
}

function renderCart(){
  const out = $('#cartItems'); out.innerHTML='';
  if(cart.length===0){ out.innerHTML='<p style="opacity:.8">Cart is empty</p>'; $('#cartTotal').textContent = formatCurrency(0); return }
  cart.forEach(ci=>{
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `<div class="meta"><h5>${ci.name}</h5><small>${ci.qty} × ${formatCurrency(ci.price)}</small></div><div class="meta-right"><strong>${formatCurrency(ci.qty*ci.price)}</strong><div style="height:8px"></div><button class="btn ghost" data-remove="${ci.id}">Remove</button></div>`;
    out.appendChild(row);
  });
  const total = cart.reduce((s,i)=>s+i.qty*i.price,0);
  $('#cartTotal').textContent = formatCurrency(total);
}

function openCart(){
  $('#cartModal').style.display='flex'; $('#cartModal').setAttribute('aria-hidden','false'); renderCart();
}
function closeCart(){
  $('#cartModal').style.display='none'; $('#cartModal').setAttribute('aria-hidden','true');
}

document.addEventListener('click',e=>{
  if(e.target.matches('[data-add]')) addToCart(Number(e.target.dataset.add));
  if(e.target.matches('#cartBtn')||e.target.matches('#cart-count')) openCart();
  if(e.target.matches('#closeCart')) closeCart();
  if(e.target.matches('[data-remove]')){
    const id = Number(e.target.dataset.remove); cart = cart.filter(c=>c.id!==id); saveCart(); renderCart(); updateCartBadge();
  }
  if(e.target.matches('#clearCart')){ cart = []; saveCart(); renderCart(); updateCartBadge(); }
  if(e.target.matches('#checkout')){ localStorage.setItem('checkout_cart', JSON.stringify(cart)); window.location.href='checkout.html'; }
});

document.addEventListener('DOMContentLoaded',()=>{
  renderMenu(); updateCartBadge();
  $('#viewMenu').addEventListener('click',()=>{ document.getElementById('menu').scrollIntoView({behavior:'smooth'}); });
  $('#cartBtn').addEventListener('click',openCart);
  $('#closeCart').addEventListener('click',closeCart);
  document.getElementById('year').textContent = new Date().getFullYear();
  // delegate add buttons inside cards
  document.getElementById('menu-grid').addEventListener('click',e=>{
    if(e.target.matches('[data-add]')){ addToCart(Number(e.target.dataset.add)); updateCartBadge(); }
  });
  // smooth nav link highlighting
  document.querySelectorAll('.nav-link').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href');
      if(href && href.startsWith('#')){
        e.preventDefault(); document.querySelector(href).scrollIntoView({behavior:'smooth'});
      }
      document.querySelectorAll('.nav-link').forEach(n=>n.classList.remove('active'));
      a.classList.add('active');
    });
  });

  // reveal elements on scroll
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('show'); })
  },{threshold:0.12});
  document.querySelectorAll('.card, .hero-inner, .section-title').forEach(el=>io.observe(el));

  // contact form handling
  const cf = document.getElementById('contactForm');
  if(cf){
    cf.addEventListener('submit', e=>{
      e.preventDefault();
      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const msg = document.getElementById('cf-message').value.trim();
      const status = document.getElementById('cf-status');
      if(!name || !/.+@.+\..+/.test(email) || !msg){ status.textContent = 'Please complete all fields.'; return }
      // pretend to send — store locally
      const contactStore = JSON.parse(localStorage.getItem('cafe_contacts')||'[]');
      contactStore.push({name,email,msg,when:new Date().toISOString()});
      localStorage.setItem('cafe_contacts', JSON.stringify(contactStore));
      status.textContent = 'Thanks! We will contact you shortly.'; cf.reset();
    });
    document.getElementById('cf-clear').addEventListener('click', ()=>{ cf.reset(); document.getElementById('cf-status').textContent=''; });
  }
});
