const API_URL = "https://YOUR-OTPHUB-BACKEND.onrender.com"; // <-- CHANGE THIS TO YOUR REAL RENDER URL
const DEMO_MODE = API_URL.includes("YOUR-OTPHUB");

const COUNTRIES = [
  { code: "nigeria", name: "Nigeria", flag: "🇳🇬", symbol: "₦", prefix: "+234", currency: "NGN", price: 1000, topups: [5000, 10000, 20000] },
  { code: "usa", name: "USA", flag: "🇺🇸", symbol: "$", prefix: "+1", currency: "USD", price: 1, topups: [5, 10, 20] },
  { code: "uk", name: "UK", flag: "🇬🇧", symbol: "£", prefix: "+44", currency: "GBP", price: 0.80, topups: [5, 10, 15] },
  { code: "ghana", name: "Ghana", flag: "🇬🇭", symbol: "₵", prefix: "+233", currency: "GHS", price: 12, topups: [60, 120, 240] },
  { code: "kenya", name: "Kenya", flag: "🇰🇪", symbol: "KSh", prefix: "+254", currency: "KES", price: 130, topups: [650, 1300, 2600] },
  { code: "india", name: "India", flag: "🇮🇳", symbol: "₹", prefix: "+91", currency: "INR", price: 70, topups: [350, 700, 1400] }
];

const SERVICES = [
  { id: "whatsapp", name: "WhatsApp", icon: "💬", color: "#25D366" },
  { id: "telegram", name: "Telegram", icon: "✈️", color: "#2AABEE" },
  { id: "facebook", name: "Facebook", icon: "📘", color: "#1877F2" },
  { id: "instagram", name: "Instagram", icon: "📸", color: "#E4405F" },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "#000000" },
  { id: "google", name: "Google", icon: "🔍", color: "#DB4437" },
  { id: "twitter", name: "Twitter / X", icon: "🐦", color: "#1DA1F2" },
  { id: "discord", name: "Discord", icon: "🎮", color: "#5865F2" }
];

let selectedCountry = COUNTRIES[0];
let balance = 10000;
let activeOrder = null;
let timer = 0;
let timerInterval = null;
let orderInterval = null;

let userId = localStorage.getItem("otphub_user");
if (!userId) {
  userId = "user_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
  localStorage.setItem("otphub_user", userId);
}

function showToast(msg) {
  const c = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = "toast"; t.innerText = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function formatMoney(amount, country) {
  if (country.currency === "NGN") return `${country.symbol}${Number(amount).toLocaleString("en-NG")}`;
  if (country.currency === "INR") return `${country.symbol}${Number(amount).toLocaleString("en-IN")}`;
  if (country.currency === "USD" || country.currency === "GBP") return `${country.symbol}${Number(amount).toFixed(2)}`;
  return `${country.symbol}${Number(amount).toLocaleString()}`;
}

function renderCountries() {
  const container = document.getElementById("countryRow");
  container.innerHTML = "";
  COUNTRIES.forEach(country => {
    const button = document.createElement("button");
    button.className = "country-chip " + (country.code === selectedCountry.code? "active" : "");
    button.innerText = `${country.flag} ${country.name} • ${formatMoney(country.price, country)}`;
    button.onclick = () => changeCountry(country);
    container.appendChild(button);
  });
}

function changeCountry(country) {
  selectedCountry = country;
  balance = country.topups[1];
  activeOrder = null;
  clearTimers();
  updateUI();
  renderCountries();
  showToast(`Switched to ${country.flag} ${country.name}`);
}

function updateUI() {
  document.getElementById("walletBalance").innerText = formatMoney(balance, selectedCountry);
  document.getElementById("heroPrice").innerText = formatMoney(selectedCountry.price, selectedCountry);
  document.getElementById("heroSub").innerText = `Currency auto based on country • ${selectedCountry.flag} ${selectedCountry.name} • ${selectedCountry.currency}`;
  document.getElementById("servicesTitle").innerText = `All Services - ${formatMoney(selectedCountry.price, selectedCountry)} Each`;
  renderServices();
  renderActiveOrder();
}

function renderServices() {
  const container = document.getElementById("services");
  container.innerHTML = "";
  SERVICES.forEach(service => {
    const card = document.createElement("div");
    card.className = "service-card";
    card.innerHTML = `
      <div class="service-icon" style="background:${service.color}18; border:1px solid ${service.color}30">${service.icon}</div>
      <div class="service-info">
        <div class="service-name">${service.name}</div>
        <div class="service-meta">Success 96% • ${selectedCountry.flag} ${selectedCountry.prefix}</div>
      </div>
      <div class="service-right">
        <div class="service-price">${formatMoney(selectedCountry.price, selectedCountry)}</div>
        <button class="buy-btn" id="btn-${service.id}" onclick="buyNumber('${service.id}')">Buy</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- API ---
async function createUser() {
  if (DEMO_MODE) return;
  try {
    const res = await fetch(`${API_URL}/api/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    const data = await res.json();
    if (data.success) { balance = data.user.balance; updateUI(); }
  } catch (e) { console.log("Demo mode - no backend"); }
}

async function loadWallet() {
  if (DEMO_MODE) return;
  try {
    const res = await fetch(`${API_URL}/api/wallet/${userId}`);
    const data = await res.json();
    if (data.success) { balance = data.balance; updateUI(); }
  } catch (e) {}
}

function getMockPhone() {
  const p = selectedCountry.prefix;
  return p + " " + Math.floor(7000000000 + Math.random()*999999999).toString().replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
}

async function buyNumber(serviceId) {
  const service = SERVICES.find(i => i.id === serviceId);
  if (!service) return;
  const price = selectedCountry.price;
  if (balance < price) {
    showToast(`Low balance! Need ${formatMoney(price, selectedCountry)}`);
    openTopup();
    return;
  }

  const btn = document.getElementById(`btn-${serviceId}`);
  if(btn){ btn.innerText = "..."; btn.disabled = true; }

  if (DEMO_MODE) {
    setTimeout(() => {
      balance -= price;
      activeOrder = { id: "demo_"+Date.now(), service, phone: getMockPhone(), otp: null, status: "Waiting for SMS" };
      timer = 900;
      updateUI(); startTimer(); mockOTP();
      showToast(`Number purchased! ${activeOrder.phone}`);
      if(btn){ btn.innerText = "Buy"; btn.disabled = false; }
    }, 700);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, country: selectedCountry.code, service: service.id }) });
    const data = await res.json();
    if (!data.success) { showToast(data.message || "Failed"); if(btn){ btn.innerText="Buy"; btn.disabled=false; } return; }
    balance = data.balance;
    activeOrder = { id: data.order.id, service, phone: data.order.phone, otp: null, status: data.order.status };
    timer = 900; updateUI(); startTimer(); checkOrder();
  } catch (e) {
    showToast("Cannot connect to server - using demo");
    if(btn){ btn.innerText="Buy"; btn.disabled=false; }
  }
}

function mockOTP() {
  setTimeout(() => {
    if (!activeOrder) return;
    activeOrder.otp = Math.floor(100000 + Math.random()*900000).toString();
    activeOrder.status = "OTP Received";
    renderActiveOrder();
    showToast("🔥 OTP Received!");
  }, 6000 + Math.random()*5000);
}

function checkOrder() {
  clearInterval(orderInterval);
  orderInterval = setInterval(async () => {
    if (!activeOrder) { clearInterval(orderInterval); return; }
    try {
      const res = await fetch(`${API_URL}/api/orders/${activeOrder.id}`);
      const data = await res.json();
      if (!data.success) return;
      activeOrder.otp = data.order.otp; activeOrder.status = data.order.status;
      renderActiveOrder();
      if (data.order.otp || data.order.status === "cancelled" || data.order.status === "expired") clearInterval(orderInterval);
    } catch (e) {}
  }, 3000);
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer <= 0) {
      clearInterval(timerInterval);
      if (activeOrder) { activeOrder.status = "Number expired"; }
      renderActiveOrder(); return;
    }
    timer--; renderActiveOrder();
  }, 1000);
}

function clearTimers() { clearInterval(timerInterval); clearInterval(orderInterval); }

function renderActiveOrder() {
  const card = document.getElementById("activeOrder");
  if (!activeOrder) { card.classList.add("hidden"); return; }
  card.classList.remove("hidden");
  const m = Math.floor(timer/60); const s = timer%60;
  document.getElementById("timer").innerText = `${m}:${s.toString().padStart(2,"0")}`;
  document.getElementById("timerProgress").style.width = `${(timer/900)*100}%`;
  document.getElementById("orderService").innerText = `${activeOrder.service.icon} ${activeOrder.service.name}`;
  document.getElementById("phoneNumber").innerText = activeOrder.phone;
  document.getElementById("orderStatus").innerText = `${activeOrder.status} • Paid ${formatMoney(selectedCountry.price, selectedCountry)}`;
  const otpBox = document.getElementById("otpBox");
  const waiting = document.getElementById("waitingText");
  if (activeOrder.otp) {
    otpBox.classList.remove("hidden"); document.getElementById("otpCode").innerText = activeOrder.otp; waiting.classList.add("hidden");
  } else {
    otpBox.classList.add("hidden"); waiting.classList.remove("hidden");
  }
}

function copyOTP() {
  if (!activeOrder?.otp) return;
  navigator.clipboard.writeText(activeOrder.otp).then(() => showToast(`Copied: ${activeOrder.otp}`)).catch(()=> showToast(activeOrder.otp));
}

function openTopup() {
  document.getElementById("topupModal").classList.remove("hidden");
  document.getElementById("modalCountry").innerText = `${selectedCountry.flag} ${selectedCountry.currency}`;
  document.getElementById("modalBalance").innerText = formatMoney(balance, selectedCountry);
  renderTopups();
}
function closeTopup() { document.getElementById("topupModal").classList.add("hidden"); }

function renderTopups() {
  const container = document.getElementById("topupOptions");
  container.innerHTML = "";
  selectedCountry.topups.forEach((amount, index) => {
    const option = document.createElement("div");
    option.className = "topup-option " + (index===1?"popular":"");
    const otpCount = Math.floor(amount/selectedCountry.price);
    option.innerHTML = `<span class="topup-main">Add ${formatMoney(amount, selectedCountry)}</span><span class="topup-sub">${otpCount} OTPs ${index===1?"• Popular":""}</span>`;
    option.onclick = () => topUp(amount);
    container.appendChild(option);
  });
}

async function topUp(amount) {
  if (DEMO_MODE) {
    balance += amount; closeTopup(); updateUI(); showToast(`Wallet funded +${formatMoney(amount, selectedCountry)}`); return;
  }
  try {
    const res = await fetch(`${API_URL}/api/wallet/topup`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({userId, amount}) });
    const data = await res.json();
    if (!data.success) { showToast(data.message||"Top-up failed"); return; }
    balance = data.balance; closeTopup(); updateUI(); showToast(`Funded ${formatMoney(amount, selectedCountry)}`);
  } catch (e) { showToast("Server not reachable"); }
}

async function startApp() { renderCountries(); renderServices(); updateUI(); await createUser(); await loadWallet(); }
startApp();
