const API_URL = "https://YOUR-OTPHUB-BACKEND.onrender.com";

const COUNTRIES = [
  {
    code: "nigeria",
    name: "Nigeria",
    flag: "🇳🇬",
    symbol: "₦",
    prefix: "+234",
    currency: "NGN",
    price: 1000,
    topups: [5000, 10000, 20000]
  },
  {
    code: "usa",
    name: "USA",
    flag: "🇺🇸",
    symbol: "$",
    prefix: "+1",
    currency: "USD",
    price: 1,
    topups: [5, 10, 20]
  },
  {
    code: "uk",
    name: "UK",
    flag: "🇬🇧",
    symbol: "£",
    prefix: "+44",
    currency: "GBP",
    price: 0.80,
    topups: [5, 10, 15]
  },
  {
    code: "ghana",
    name: "Ghana",
    flag: "🇬🇭",
    symbol: "₵",
    prefix: "+233",
    currency: "GHS",
    price: 12,
    topups: [60, 120, 240]
  },
  {
    code: "kenya",
    name: "Kenya",
    flag: "🇰🇪",
    symbol: "KSh",
    prefix: "+254",
    currency: "KES",
    price: 130,
    topups: [650, 1300, 2600]
  },
  {
    code: "india",
    name: "India",
    flag: "🇮🇳",
    symbol: "₹",
    prefix: "+91",
    currency: "INR",
    price: 70,
    topups: [350, 700, 1400]
  }
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

/* -------------------------
   USER
------------------------- */

let userId = localStorage.getItem("otphub_user");

if (!userId) {
  userId =
    "user_" +
    Date.now() +
    "_" +
    Math.floor(Math.random() * 10000);

  localStorage.setItem("otphub_user", userId);
}

/* -------------------------
   MONEY
------------------------- */

function formatMoney(amount, country) {
  if (country.currency === "NGN") {
    return `${country.symbol}${Number(amount).toLocaleString("en-NG")}`;
  }

  if (country.currency === "INR") {
    return `${country.symbol}${Number(amount).toLocaleString("en-IN")}`;
  }

  if (
    country.currency === "USD" ||
    country.currency === "GBP"
  ) {
    return `${country.symbol}${Number(amount).toFixed(2)}`;
  }

  return `${country.symbol}${Number(amount).toLocaleString()}`;
}

/* -------------------------
   COUNTRY
------------------------- */

function renderCountries() {
  const container = document.getElementById("countryRow");

  container.innerHTML = "";

  COUNTRIES.forEach(country => {
    const button = document.createElement("button");

    button.className =
      "country-chip " +
      (country.code === selectedCountry.code ? "active" : "");

    button.innerText =
      `${country.flag} ${country.name} • ${formatMoney(
        country.price,
        country
      )}`;

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
}

/* -------------------------
   UI
------------------------- */

function updateUI() {
  document.getElementById("walletBalance").innerText =
    formatMoney(balance, selectedCountry);

  document.getElementById("heroPrice").innerText =
    formatMoney(selectedCountry.price, selectedCountry);

  document.getElementById("heroSub").innerText =
    `Currency auto based on country • ${selectedCountry.flag} ${selectedCountry.name} • ${selectedCountry.currency}`;

  document.getElementById("servicesTitle").innerText =
    `All Services - ${formatMoney(
      selectedCountry.price,
      selectedCountry
    )} Each`;

  renderServices();
  renderActiveOrder();
}

/* -------------------------
   SERVICES
------------------------- */

function renderServices() {
  const container = document.getElementById("services");

  container.innerHTML = "";

  SERVICES.forEach(service => {
    const card = document.createElement("div");

    card.className = "service-card";

    card.innerHTML = `
      <div
        class="service-icon"
        style="background:${service.color}20"
      >
        ${service.icon}
      </div>

      <div class="service-info">
        <div class="service-name">
          ${service.name}
        </div>

        <div class="service-meta">
          Success 96% •
          ${selectedCountry.flag}
          ${selectedCountry.prefix}
        </div>
      </div>

      <div class="service-right">

        <div class="service-price">
          ${formatMoney(
            selectedCountry.price,
            selectedCountry
          )}
        </div>

        <button
          class="buy-btn"
          onclick="buyNumber('${service.id}')"
        >
          Buy
        </button>

      </div>
    `;

    container.appendChild(card);
  });
}

/* -------------------------
   CREATE USER
------------------------- */

async function createUser() {
  try {
    const response = await fetch(
      `${API_URL}/api/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      balance = data.user.balance;
      updateUI();
    }

  } catch (error) {
    console.error("User error:", error);
  }
}

/* -------------------------
   GET WALLET
------------------------- */

async function loadWallet() {
  try {
    const response = await fetch(
      `${API_URL}/api/wallet/${userId}`
    );

    const data = await response.json();

    if (data.success) {
      balance = data.balance;
      updateUI();
    }

  } catch (error) {
    console.error("Wallet error:", error);
  }
}

/* -------------------------
   BUY NUMBER
------------------------- */

async function buyNumber(serviceId) {
  const service = SERVICES.find(
    item => item.id === serviceId
  );

  if (!service) return;

  const price = selectedCountry.price;

  if (balance < price) {
    alert(
      `You need ${formatMoney(
        price,
        selectedCountry
      )} but you have ${formatMoney(
        balance,
        selectedCountry
      )}`
    );

    openTopup();

    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/orders`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          userId,
          country: selectedCountry.code,
          service: service.id
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      alert(data.message || "Unable to create order");
      return;
    }

    balance = data.balance;

    activeOrder = {
      id: data.order.id,
      service,
      phone: data.order.phone,
      otp: null,
      status: data.order.status
    };

    timer = 900;

    updateUI();

    startTimer();

    checkOrder();

  } catch (error) {
    console.error(error);

    alert(
      "Unable to connect to OTPHub server."
    );
  }
}

/* -------------------------
   CHECK OTP
------------------------- */

function checkOrder() {
  clearInterval(orderInterval);

  orderInterval = setInterval(
    async () => {

      if (!activeOrder) {
        clearInterval(orderInterval);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/orders/${activeOrder.id}`
        );

        const data = await response.json();

        if (!data.success) return;

        const order = data.order;

        activeOrder.otp = order.otp;
        activeOrder.status = order.status;

        renderActiveOrder();

        if (
          order.otp ||
          order.status === "cancelled" ||
          order.status === "expired"
        ) {
          clearInterval(orderInterval);
        }

      } catch (error) {
        console.error(
          "OTP check error:",
          error
        );
      }

    },
    3000
  );
}

/* -------------------------
   TIMER
------------------------- */

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {

    if (timer <= 0) {
      clearInterval(timerInterval);

      if (activeOrder) {
        activeOrder.status =
          "Number expired";
      }

      renderActiveOrder();

      return;
    }

    timer--;

    renderActiveOrder();

  }, 1000);
}

/* -------------------------
   CLEAR TIMERS
------------------------- */

function clearTimers() {
  clearInterval(timerInterval);
  clearInterval(orderInterval);
}

/* -------------------------
   ACTIVE ORDER
------------------------- */

function renderActiveOrder() {
  const card =
    document.getElementById("activeOrder");

  if (!activeOrder) {
    card.classList.add("hidden");
    return;
  }

  card.classList.remove("hidden");

  const minutes =
    Math.floor(timer / 60);

  const seconds =
    timer % 60;

  document.getElementById("timer").innerText =
    `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

  document.getElementById("orderService").innerText =
    `${activeOrder.service.icon} ${activeOrder.service.name}`;

  document.getElementById("phoneNumber").innerText =
    activeOrder.phone;

  document.getElementById("orderStatus").innerText =
    `${activeOrder.status} • Paid ${formatMoney(
      selectedCountry.price,
      selectedCountry
    )}`;

  const otpBox =
    document.getElementById("otpBox");

  const waiting =
    document.getElementById("waitingText");

  if (activeOrder.otp) {

    otpBox.classList.remove("hidden");

    document.getElementById("otpCode").innerText =
      activeOrder.otp;

    waiting.classList.add("hidden");

  } else {

    otpBox.classList.add("hidden");

    waiting.classList.remove("hidden");
  }
}

/* -------------------------
   COPY OTP
------------------------- */

function copyOTP() {
  if (!activeOrder || !activeOrder.otp) {
    return;
  }

  if (navigator.clipboard) {

    navigator.clipboard
      .writeText(activeOrder.otp)
      .then(() => {
        alert("OTP copied!");
      })
      .catch(() => {
        alert(`OTP: ${activeOrder.otp}`);
      });

  } else {
    alert(`OTP: ${activeOrder.otp}`);
  }
}

/* -------------------------
   TOP UP
------------------------- */

function openTopup() {
  document
    .getElementById("topupModal")
    .classList.remove("hidden");

  document.getElementById("modalCountry").innerText =
    `${selectedCountry.flag} ${selectedCountry.currency}`;

  document.getElementById("modalBalance").innerText =
    formatMoney(balance, selectedCountry);

  renderTopups();
}

function closeTopup() {
  document
    .getElementById("topupModal")
    .classList.add("hidden");
}

/* -------------------------
   TOP UP OPTIONS
------------------------- */

function renderTopups() {
  const container =
    document.getElementById("topupOptions");

  container.innerHTML = "";

  selectedCountry.topups.forEach(
    (amount, index) => {

      const option =
        document.createElement("div");

      option.className =
        "topup-option " +
        (index === 1 ? "popular" : "");

      const otpCount =
        Math.floor(
          amount / selectedCountry.price
        );

      option.innerHTML = `
        <span class="topup-main">
          Add ${formatMoney(
            amount,
            selectedCountry
          )}
        </span>

        <span class="topup-sub">
          ${otpCount} OTPs
          ${index === 1 ? " • Popular" : ""}
        </span>
      `;

      option.onclick = () =>
        topUp(amount);

      container.appendChild(option);
    }
  );
}

/* -------------------------
   TOP UP
------------------------- */

async function topUp(amount) {
  try {

    /*
      TEMPORARY DEMO TOP-UP.

      Later replace this with
      Paystack payment initialization.
    */

    const response = await fetch(
      `${API_URL}/api/wallet/topup`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          userId,
          amount
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      alert(data.message || "Top-up failed");
      return;
    }

    balance = data.balance;

    closeTopup();

    updateUI();

    alert(
      `Wallet funded with ${formatMoney(
        amount,
        selectedCountry
      )}`
    );

  } catch (error) {

    console.error(error);

    alert(
      "Unable to connect to server."
    );
  }
}

/* -------------------------
   START APP
------------------------- */

async function startApp() {

  renderCountries();

  renderServices();

  updateUI();

  await createUser();

  await loadWallet();
}

startApp();
