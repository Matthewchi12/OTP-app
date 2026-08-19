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
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "💬",
    color: "#25D366"
  },

  {
    id: "telegram",
    name: "Telegram",
    icon: "✈️",
    color: "#2AABEE"
  },

  {
    id: "facebook",
    name: "Facebook",
    icon: "📘",
    color: "#1877F2"
  },

  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "#E4405F"
  },

  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "#000000"
  },

  {
    id: "google",
    name: "Google",
    icon: "🔍",
    color: "#DB4437"
  },

  {
    id: "twitter",
    name: "Twitter / X",
    icon: "🐦",
    color: "#1DA1F2"
  },

  {
    id: "discord",
    name: "Discord",
    icon: "🎮",
    color: "#5865F2"
  }
];

let selectedCountry = COUNTRIES[0];

let balance = 10000;

let activeOrder = null;

let timer = 0;

let timerInterval = null;

let otpTimeout = null;


/* -------------------------
   MONEY FORMAT
------------------------- */

function formatMoney(amount, country) {

  if (country.currency === "NGN") {
    return `${country.symbol}${amount.toLocaleString("en-NG")}`;
  }

  if (country.currency === "INR") {
    return `${country.symbol}${amount.toLocaleString("en-IN")}`;
  }

  if (
    country.currency === "USD" ||
    country.currency === "GBP"
  ) {
    return `${country.symbol}${Number(amount).toFixed(2)}`;
  }

  return `${country.symbol}${amount.toLocaleString()}`;
}


/* -------------------------
   COUNTRY LIST
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
      `${country.flag} ${country.name} • ${formatMoney(country.price, country)}`;

    button.onclick = () => changeCountry(country);

    container.appendChild(button);

  });
}


/* -------------------------
   CHANGE COUNTRY
------------------------- */

function changeCountry(country) {

  selectedCountry = country;

  balance = country.topups[1];

  activeOrder = null;

  clearTimers();

  updateUI();

  renderCountries();

}


/* -------------------------
   UPDATE UI
------------------------- */

function updateUI() {

  document.getElementById("walletBalance").innerText =
    formatMoney(balance, selectedCountry);

  document.getElementById("heroPrice").innerText =
    formatMoney(selectedCountry.price, selectedCountry);

  document.getElementById("heroSub").innerText =
    `Currency auto based on country • ${selectedCountry.flag} ${selectedCountry.name} • ${selectedCountry.currency}`;

  document.getElementById("servicesTitle").innerText =
    `All Services - ${formatMoney(selectedCountry.price, selectedCountry)} Each`;

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
          ${formatMoney(selectedCountry.price, selectedCountry)}
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
   BUY NUMBER
------------------------- */

function buyNumber(serviceId) {

  const service = SERVICES.find(
    item => item.id === serviceId
  );

  const price = selectedCountry.price;

  if (balance < price) {

    alert(
      `You need ${formatMoney(price, selectedCountry)} ` +
      `but you have ${formatMoney(balance, selectedCountry)}`
    );

    openTopup();

    return;
  }

  balance -= price;

  const randomNumber =
    Math.floor(
      7000000000 +
      Math.random() * 999999999
    );

  activeOrder = {

    id: Date.now(),

    service: service,

    phone:
      `${selectedCountry.prefix} ${randomNumber}`,

    otp: null,

    status: "Waiting for SMS..."

  };

  timer = 900;

  updateUI();

  startTimer();

  /*
     DEMO OTP

     In the real application,
     this must be replaced by your
     SMS/virtual-number API.
  */

  otpTimeout = setTimeout(() => {

    if (!activeOrder) return;

    activeOrder.otp =
      Math.floor(
        100000 +
        Math.random() * 900000
      ).toString();

    activeOrder.status =
      "OTP Received!";

    renderActiveOrder();

  }, 6000);

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

  clearTimeout(otpTimeout);

}


/* -------------------------
   RENDER ACTIVE ORDER
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

  navigator.clipboard
    .writeText(activeOrder.otp)
    .then(() => {
      alert("OTP copied!");
    })
    .catch(() => {
      alert(`OTP: ${activeOrder.otp}`);
    });

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

  selectedCountry.topups.forEach((amount, index) => {

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
        Add ${formatMoney(amount, selectedCountry)}
      </span>

      <span class="topup-sub">
        ${otpCount} OTPs
        ${index === 1 ? " • Popular" : ""}
      </span>

    `;

    option.onclick = () => {

      /*
        DEMO ONLY.

        Real application:
        redirect user to Paystack,
        Flutterwave, Stripe, etc.
      */

      balance += amount;

      closeTopup();

      updateUI();

    };

    container.appendChild(option);

  });

}


/* -------------------------
   START APP
------------------------- */

renderCountries();

renderServices();

updateUI();
