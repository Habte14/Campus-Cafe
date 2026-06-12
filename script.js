const MENU = [
  // FOOD ITEMS
  {id:1,name:'Beye-ayinet',price:100,desc:'Assorted Ethiopian cuisine served with injera',img:'beye-ayinetu.webp'},
  {id:2,name:'Enkulal-Firfir',price:120,desc:'Spicy egg firfir with rich flavor',img:'enkulal- firfr.jpg'},
  {id:3,name:'Firfir',price:80,desc:'Classic firfir with warm spices',img:'firfir.jpg'},
  {id:4,name:'Dinich',price:90,desc:'Savory dinich wet with tender potatoes',img:'dinich-wet.jpg'},
  {id:5,name:'Pasta with Sugo-Recipe',price:100,desc:'Tomato sugo pasta with aromatic herbs',img:'pasta-with-sugu-recipe.jpg'},
  {id:6,name:'Pasta with Egg',price:130,desc:'Pasta tossed with egg and spices',img:'past be enkulal.jpg'},
  {id:7,name:'Shiro',price:110,desc:'Creamy shiro stew with traditional spices',img:'shiro.webp'},
  {id:8,name:'Tegabino',price:130,desc:'Flavorful tegabino stew with spices',img:'tegabino.webp'},
  {id:9,name:'Timatim-Lebleb',price:90,desc:'Tomato and chickpea mix with fresh herbs',img:'tima-lebleb.jpg'},
  {id:10,name:'Timatim-Sils',price:90,desc:'Tomato sils served with fresh bread',img:'timatim-sils.jpg'},
  
  // HOT DRINKS
  {id:11,name:'Coffee',price:30,desc:'Rich and aromatic freshly brewed coffee',img:'coffee.webp',category:'Hot Drinks'},
  {id:12,name:'Tea',price:20,desc:'Warm, soothing cup of traditional tea',img:'Tea.webp',category:'Hot Drinks'},
  {id:13,name:'Espresso',price:25,desc:'Strong bold shot of espresso',img:'esprisso.png',category:'Hot Drinks'},
  {id:14,name:'Ginger Tea',price:25,desc:'Warm ginger tea with fresh spices',img:'Ginger-Tea.jpeg',category:'Hot Drinks'},
  {id:15,name:'Makiato',price:50,desc:'Smooth makiato with creamy milk foam',img:'makiato.jpg',category:'Hot Drinks'},
  
  // SOFT DRINKS
  {id:16,name:'Soft Drink',price:40,desc:'Choose your favorite soda',img:'soft-drinks.webp',category:'Soft Drinks',options:[
    {label:'Fanta',price:40},
    {label:'Coca-Cola',price:40},
    {label:'Apple',price:40},
    {label:'Mirinda',price:40},
    {label:'Sprite',price:40},
    {label:'Pepsi',price:40},
    {label:'Tonic',price:40}
  ]},
  {id:17,name:'Water',price:20,desc:'Select water size',img:'water.webp',category:'Soft Drinks',options:[
    {label:'1/2 L',price:20},
    {label:'1 L',price:30},
    {label:'2 L',price:50}
  ]}
];

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

let cart = JSON.parse(localStorage.getItem('cafe_cart')||'[]');

function formatCurrency(n){return 'ETB '+n.toFixed(2)}

function renderMenu(){
  const foodGrid = $('#food-grid');
  const hotGrid = $('#hot-drink-grid');
  const softGrid = $('#soft-drink-grid');

  const renderGrid = (items, grid) => {
    grid.innerHTML = items.length ? '' : '<p class="empty-note">No items available.</p>';
    items.forEach(item=>{
      const el = document.createElement('div'); el.className='card';
      const optionsMarkup = item.options ? `
        <label class="option-label">Choose:</label>
        <select class="option-select" data-item="${item.id}">
          ${item.options.map((opt,index)=>`<option value="${index}">${opt.label} - ${formatCurrency(opt.price)}</option>`).join('')}
        </select>
      ` : '';
      el.innerHTML = `
        <div class="thumb" style="background-image:url('${item.img}')"></div>
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
        ${optionsMarkup}
        <div class="price">${item.options ? 'From ' + formatCurrency(item.price) : formatCurrency(item.price)}</div>
        <div class="actions">
          <button class="btn ghost" data-id="${item.id}">Details</button>
          <button class="btn primary" data-add="${item.id}">Add</button>
        </div>
      `;
      grid.appendChild(el);
    });
  };

  renderGrid(MENU.filter(item=> !item.category || item.category==='Food'), foodGrid);
  renderGrid(MENU.filter(item=> item.category==='Hot Drinks'), hotGrid);
  renderGrid(MENU.filter(item=> item.category==='Soft Drinks'), softGrid);
}

function saveCart(){localStorage.setItem('cafe_cart',JSON.stringify(cart));}

function updateCartBadge(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  $('#cart-count').textContent = count;
}

function addToCart(id, optionIndex){
  const item = MENU.find(m=>m.id==id); if(!item) return;
  const choice = item.options && item.options[optionIndex !== undefined ? optionIndex : 0];
  const name = choice ? `${item.name} (${choice.label})` : item.name;
  const price = choice ? choice.price : item.price;
  const cartId = choice ? `${id}-${choice.label}` : id;
  const existing = cart.find(c=>c.cartId===cartId);
  if(existing) existing.qty++;
  else cart.push({cartId, id, name, price, qty:1});
  saveCart(); updateCartBadge();
}

function renderCart(){
  const out = $('#cartItems'); out.innerHTML='';
  if(cart.length===0){ out.innerHTML='<p style="opacity:.8">Cart is empty</p>'; $('#cartTotal').textContent = formatCurrency(0); return }
  cart.forEach(ci=>{
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `<div class="meta"><h5>${ci.name}</h5><small>${ci.qty} × ${formatCurrency(ci.price)}</small></div><div class="meta-right"><strong>${formatCurrency(ci.qty*ci.price)}</strong><div style="height:8px"></div><button class="btn ghost" data-remove="${ci.cartId}">Remove</button></div>`;
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

function getSelectedOptionIndex(id){
  const select = document.querySelector(`.option-select[data-item="${id}"]`);
  return select ? Number(select.value) : undefined;
}

document.addEventListener('click',e=>{
  if(e.target.matches('[data-add]')){
    const id = Number(e.target.dataset.add);
    addToCart(id, getSelectedOptionIndex(id));
  }
  if(e.target.matches('#cartBtn')||e.target.matches('#cart-count')) openCart();
  if(e.target.matches('#closeCart')) closeCart();
  if(e.target.matches('[data-remove]')){
    const cartId = e.target.dataset.remove;
    cart = cart.filter(c=>c.cartId!==cartId);
    saveCart(); renderCart(); updateCartBadge();
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

  // theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  if(savedTheme === 'dark') html.classList.add('dark-mode');
  
  themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark-mode');
    const theme = html.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
  
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
});
