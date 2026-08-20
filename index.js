document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "https://otp-backend-amwc.onrender.com";

  // =========================
  // FIXED STYLES
  // =========================

  const fixStyle = document.createElement("style");

  fixStyle.textContent = `
    .hidden {
      display: none !important;
    }

    #authScreen {
      position: fixed;
      inset: 0;
      z-index: 9999;
      overflow-y: auto;
      background: #0f0f0f;
    }

    #app {
      min-height: 100vh;
      max-width: 100vw;
      overflow-x: hidden;
    }

    #successModal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #successModal .box {
      background: #1a1a1a;
      padding: 24px;
      border-radius: 16px;
      text-align: center;
      max-width: 340px;
      width: 90%;
    }
  `;

  document.head.appendChild(fixStyle);


  // =========================
  // CURRENCIES
  // =========================

  const LOCAL_CURRENCIES = [
    {
      code: "nigeria",
      name: "Nigeria",
      flag: "🇳🇬",
      currency: "NGN",
      symbol: "₦",
      price: 1000,
      topups: [5000, 10000, 20000]
    },
    {
      code: "usa",
      name: "USA",
      flag: "🇺🇸",
      currency: "USD",
      symbol: "$",
      price: 1,
      topups: [5, 10, 20]
    },
    {
      code: "uk",
      name: "UK",
      flag: "🇬🇧",
      currency: "GBP",
      symbol: "£",
      price: 0.8,
      topups: [5, 10, 15]
    },
    {
      code: "canada",
      name: "Canada",
      flag: "🇨🇦",
      currency: "CAD",
      symbol: "C$",
      price: 1.35,
      topups: [6, 13, 27]
    },
    {
      code: "ghana",
      name: "Ghana",
      flag: "🇬🇭",
      currency: "GHS",
      symbol: "₵",
      price: 12,
      topups: [60, 120, 240]
    }
  ];


  // =========================
  // PHONE COUNTRIES
  // =========================

  const PHONE_COUNTRIES = [
    {code:"usa",name:"USA",flag:"🇺🇸",prefix:"+1"},
    {code:"uk",name:"UK",flag:"🇬🇧",prefix:"+44"},
    {code:"canada",name:"Canada",flag:"🇨🇦",prefix:"+1"},
    {code:"nigeria",name:"Nigeria",flag:"🇳🇬",prefix:"+234"},
    {code:"ghana",name:"Ghana",flag:"🇬🇭",prefix:"+233"},
    {code:"kenya",name:"Kenya",flag:"🇰🇪",prefix:"+254"},
    {code:"southafrica",name:"South Africa",flag:"🇿🇦",prefix:"+27"},
    {code:"india",name:"India",flag:"🇮🇳",prefix:"+91"},
    {code:"germany",name:"Germany",flag:"🇩🇪",prefix:"+49"},
    {code:"france",name:"France",flag:"🇫🇷",prefix:"+33"},
    {code:"spain",name:"Spain",flag:"🇪🇸",prefix:"+34"},
    {code:"italy",name:"Italy",flag:"🇮🇹",prefix:"+39"},
    {code:"netherlands",name:"Netherlands",flag:"🇳🇱",prefix:"+31"},
    {code:"sweden",name:"Sweden",flag:"🇸🇪",prefix:"+46"},
    {code:"norway",name:"Norway",flag:"🇳🇴",prefix:"+47"},
    {code:"poland",name:"Poland",flag:"🇵🇱",prefix:"+48"},
    {code:"turkey",name:"Turkey",flag:"🇹🇷",prefix:"+90"},
    {code:"uae",name:"UAE",flag:"🇦🇪",prefix:"+971"},
    {code:"saudiarabia",name:"Saudi Arabia",flag:"🇸🇦",prefix:"+966"},
    {code:"egypt",name:"Egypt",flag:"🇪🇬",prefix:"+20"},
    {code:"morocco",name:"Morocco",flag:"🇲🇦",prefix:"+212"},
    {code:"australia",name:"Australia",flag:"🇦🇺",prefix:"+61"},
    {code:"brazil",name:"Brazil",flag:"🇧🇷",prefix:"+55"},
    {code:"mexico",name:"Mexico",flag:"🇲🇽",prefix:"+52"}
  ];


  // =========================
  // SERVICES
  // =========================

  const SERVICES = [
    {
      id:"whatsapp",
      name:"WhatsApp",
      icon:"💬",
      color:"#25D366"
    },
    {
      id:"telegram",
      name:"Telegram",
      icon:"✈️",
      color:"#2AABEE"
    },
    {
      id:"facebook",
      name:"Facebook",
      icon:"📘",
      color:"#1877F2"
    },
    {
      id:"instagram",
      name:"Instagram",
      icon:"📸",
      color:"#E4405F"
    },
    {
      id:"tiktok",
      name:"TikTok",
      icon:"🎵",
      color:"#000"
    },
    {
      id:"google",
      name:"Google",
      icon:"🔍",
      color:"#DB4437"
    }
  ];


  // =========================
  // ELEMENTS
  // =========================

  const $ = id => document.getElementById(id);

  const els = {
    authScreen: $("authScreen"),
    app: $("app"),
    toasts: $("toasts"),

    tabLogin: $("tabLogin"),
    tabRegister: $("tabRegister"),

    loginForm: $("loginForm"),
    registerForm: $("registerForm"),

    phoneCountryRow: $("phoneCountryRow"),
    services: $("services"),

    activeOrder: $("activeOrder"),

    walletBalance: $("walletBalance"),
    heroPrice: $("heroPrice"),
    localBadge: $("localBadge"),
    servicesTitle: $("servicesTitle"),

    orderService: $("orderService"),
    timer: $("timer"),
    timerProgress: $("timerProgress"),

    phoneNumber: $("phoneNumber"),
    orderStatus: $("orderStatus"),

    otpBox: $("otpBox"),
    otpCode: $("otpCode"),
    waitingText: $("waitingText"),

    topupModal: $("topupModal"),
    modalCountry: $("modalCountry"),
    modalBalance: $("modalBalance"),
    topupOptions: $("topupOptions"),

    userEmail: $("userEmail"),
    phoneSearch: $("phoneSearch")
  };


  // =========================
  // STATE
  // =========================

  let local = LOCAL_CURRENCIES[0];

  let selected =
    PHONE_COUNTRIES.find(
      c => c.code === "nigeria"
    ) || PHONE_COUNTRIES[0];

  let currentUser = null;

  let state = {
    balance: 0,
    active: null,
    search: ""
  };

  let timerInt = null;
  let pollInt = null;


  // =========================
  // TOAST
  // =========================

  const toast = message => {

    if (!els.toasts) {
      alert(message);
      return;
    }

    const d = document.createElement("div");

    d.className = "toast";
    d.innerText = message;

    els.toasts.appendChild(d);

    setTimeout(() => {
      d.remove();
    }, 4000);
  };


  // =========================
  // MONEY
  // =========================

  const money = amount => {

    const value = Number(amount) || 0;

    if (local.currency === "NGN") {
      return `${local.symbol}${value.toLocaleString()}`;
    }

    return `${local.symbol}${value}`;
  };


  // =========================
  // GET FRESH BALANCE
  // =========================

  async function refreshBalance() {

    const token =
      localStorage.getItem("otphub_token");

    if (!token) return;

    try {

      const res = await fetch(
        `${API_URL}/api/user/balance`,
        {
          headers: {
            "Authorization":
              `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        return;
      }

      if (!currentUser) {
        currentUser = {};
      }

      currentUser.balances =
        data.balances || {};

      localStorage.setItem(
        "otphub_user",
        JSON.stringify(currentUser)
      );

      state.balance =
        Number(
          data.balances?.[local.code] ??
          data.balances?.nigeria ??
          0
        );

      render();

    } catch (error) {

      console.log(
        "Balance refresh error:",
        error
      );

    }
  }


  // =========================
  // PAYMENT SUCCESS MODAL
  // =========================

  function showPaymentSuccess(
    amount,
    balances
  ) {

    let modal =
      document.getElementById(
        "successModal"
      );

    if (!modal) {

      modal =
        document.createElement("div");

      modal.id =
        "successModal";

      modal.innerHTML = `
        <div class="box">

          <div style="font-size:48px">
            ✅
          </div>

          <h2 style="color:#fff;margin:12px 0">
            Payment Successful!
          </h2>

          <p
            id="successText"
            style="color:#aaa"
          ></p>

          <div
            id="successBal"
            style="
              font-size:22px;
              font-weight:800;
              color:#25D366;
              margin:12px 0;
            "
          ></div>

          <button
            id="successClose"
            style="
              background:#25D366;
              color:#fff;
              border:none;
              padding:12px 24px;
              border-radius:10px;
              width:100%;
              font-weight:700;
            "
          >
            Continue
          </button>

        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector(
        "#successClose"
      ).onclick = () => {

        modal.classList.add(
          "hidden"
        );

      };

      modal.onclick = e => {

        if (
          e.target.id ===
          "successModal"
        ) {

          modal.classList.add(
            "hidden"
          );

        }

      };

    }

    const nigeriaBalance =
      balances &&
      balances.nigeria != null
        ? Number(balances.nigeria)
        : Number(state.balance) || 0;

    modal.querySelector(
      "#successText"
    ).textContent =
      `₦${Number(amount || 0).toLocaleString()} added to your wallet`;

    modal.querySelector(
      "#successBal"
    ).textContent =
      `New Balance: ₦${nigeriaBalance.toLocaleString()}`;

    modal.classList.remove(
      "hidden"
    );
  }


  // =========================
  // SHOW APP
  // =========================

  function showApp(user, token) {

    currentUser = user;

    if (token) {
      localStorage.setItem(
        "otphub_token",
        token
      );
    }

    if (!user.balances) {
      user.balances = {};
    }

    LOCAL_CURRENCIES.forEach(
      c => {

        if (
          user.balances[c.code] ===
          undefined ||
          user.balances[c.code] ===
          null
        ) {

          user.balances[c.code] = 0;

        }

      }
    );

    localStorage.setItem(
      "otphub_user",
      JSON.stringify(user)
    );

    state.balance =
      Number(
        user.balances[local.code] ??
        user.balances.nigeria ??
        0
      );

    if (els.authScreen) {

      els.authScreen.classList.add(
        "hidden"
      );

      els.authScreen.style.display =
        "none";

    }

    document.body.style.overflow =
      "auto";

    document.body.classList.remove(
      "auth-active"
    );

    if (els.app) {

      els.app.classList.remove(
        "hidden"
      );

      els.app.style.display =
        "block";

    }

    if (els.userEmail) {

      els.userEmail.textContent =
        user.email || "";

    }

    const payEmail =
      document.getElementById(
        "payEmail"
      );

    if (
      payEmail &&
      user.email
    ) {

      payEmail.value =
        user.email;

    }

    render();

    startTimer();

    // Always get real balance from DB
    refreshBalance();

    window.scrollTo(
      0,
      0
    );
  }


  // =========================
  // RENDER
  // =========================

  function render() {

    if (els.walletBalance) {

      els.walletBalance.textContent =
        money(state.balance);

    }

    if (els.heroPrice) {

      els.heroPrice.textContent =
        money(local.price);

    }

    if (els.modalCountry) {

      els.modalCountry.textContent =
        `${local.flag} ${local.currency}`;

    }

    if (els.modalBalance) {

      els.modalBalance.textContent =
        money(state.balance);

    }

    if (els.servicesTitle) {

      els.servicesTitle.textContent =
        `${PHONE_COUNTRIES.length} Countries - ${money(local.price)} each • ${selected.flag} ${selected.name}`;

    }


    // COUNTRIES

    if (els.phoneCountryRow) {

      els.phoneCountryRow.innerHTML =
        "";

      PHONE_COUNTRIES
        .filter(c =>
          c.name
            .toLowerCase()
            .includes(
              state.search.toLowerCase()
            ) ||
          c.prefix.includes(
            state.search
          )
        )
        .forEach(c => {

          const b =
            document.createElement(
              "button"
            );

          b.className =
            "country-chip" +
            (
              c.code ===
              selected.code
                ? " active"
                : ""
            );

          b.textContent =
            `${c.flag} ${c.name} ${c.prefix}`;

          b.onclick = () => {

            selected = c;

            render();

          };

          els.phoneCountryRow
            .appendChild(b);

        });

    }


    // SERVICES

    if (els.services) {

      els.services.innerHTML =
        "";

      SERVICES.forEach(
        service => {

          const d =
            document.createElement(
              "div"
            );

          d.className =
            "service-card";

          d.innerHTML = `
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
                ${selected.flag}
                ${selected.prefix}
              </div>

            </div>

            <div>

              <div style="font-weight:800">
                ${money(local.price)}
              </div>

              <button
                data-id="${service.id}"
                class="buy-btn"
              >
                Buy
              </button>

            </div>
          `;

          els.services.appendChild(d);

        }
      );

    }


    // ACTIVE ORDER

    if (!state.active) {

      if (els.activeOrder) {

        els.activeOrder.classList.add(
          "hidden"
        );

      }

      return;
    }

    if (els.activeOrder) {

      els.activeOrder.classList.remove(
        "hidden"
      );

    }

    if (els.orderService) {

      els.orderService.textContent =
        `${state.active.icon} ${state.active.name}`;

    }

    if (els.phoneNumber) {

      els.phoneNumber.textContent =
        state.active.phone;

    }

    if (els.orderStatus) {

      els.orderStatus.textContent =
        `${selected.name} - REAL NUMBER`;

    }

    if (state.active.otp) {

      if (els.otpBox) {

        els.otpBox.classList.remove(
          "hidden"
        );

      }

      if (els.waitingText) {

        els.waitingText.classList.add(
          "hidden"
        );

      }

      if (els.otpCode) {

        els.otpCode.textContent =
          state.active.otp;

      }

    } else {

      if (els.otpBox) {

        els.otpBox.classList.add(
          "hidden"
        );

      }

      if (els.waitingText) {

        els.waitingText.classList.remove(
          "hidden"
        );

        els.waitingText.textContent =
          "Waiting for REAL SMS...";

      }

    }

  }


  // =========================
  // TIMER
  // =========================

  function startTimer() {

    clearInterval(timerInt);

    timerInt =
      setInterval(() => {

        if (!state.active) {
          return;
        }

        const remaining =
          Math.max(
            0,
            Math.floor(
              (
                state.active.expiresAt -
                Date.now()
              ) / 1000
            )
          );

        if (els.timer) {

          els.timer.textContent =
            `${Math.floor(remaining / 60)}:${String(
              remaining % 60
            ).padStart(2,"0")}`;

        }

        if (els.timerProgress) {

          const percentage =
            Math.max(
              0,
              Math.min(
                100,
                (remaining / 900) *
                100
              )
            );

          els.timerProgress.style.width =
            `${percentage}%`;

        }

        if (remaining <= 0) {

          state.active =
            null;

          clearInterval(
            pollInt
          );

          render();

        }

      }, 1000);
  }


  // =========================
  // OTP POLLING
  // =========================

  function startPolling(orderId) {

    clearInterval(
      pollInt
    );

    pollInt =
      setInterval(
        async () => {

          try {

            const token =
              localStorage.getItem(
                "otphub_token"
              );

            if (!token) {

              clearInterval(
                pollInt
              );

              return;

            }

            const res =
              await fetch(
                `${API_URL}/api/orders/${orderId}`,
                {
                  headers: {
                    "Authorization":
                      `Bearer ${token}`
                  }
                }
              );

            const data =
              await res.json();

            if (
              data.success &&
              data.order &&
              data.order.otp
            ) {

              if (state.active) {

                state.active.otp =
                  data.order.otp;

              }

              render();

              toast(
                "REAL OTP Received: " +
                data.order.otp
              );

              clearInterval(
                pollInt
              );

            }

          } catch (error) {

            console.log(
              "OTP polling error:",
              error
            );

          }

        },
        5000
      );
  }


  // =========================
  // AMOUNT
  // =========================

  window.setAmount =
    function(value) {

      const input =
        document.getElementById(
          "customAmount"
        );

      if (input) {
        input.value =
          value;
      }

    };


  window.payCustom =
    function() {

      const input =
        document.getElementById(
          "customAmount"
        );

      const amount =
        input
          ? Number(input.value)
          : 0;

      if (
        !amount ||
        amount < 100
      ) {

        toast(
          "Enter amount minimum ₦100"
        );

        return;
      }

      payNow(amount);

    };


  // =========================
  // PAY NOW
  // =========================

  window.payNow =
    async function(amount) {

      const emailInput =
        document.getElementById(
          "payEmail"
        );

      const status =
        document.getElementById(
          "payStatus"
        );

      const token =
        localStorage.getItem(
          "otphub_token"
        );

      const email =
        (
          emailInput &&
          emailInput.value.trim()
        ) ||
        (
          currentUser &&
          currentUser.email
        ) ||
        "";

      if (
        !email ||
        !email.includes("@")
      ) {

        toast(
          "Enter valid email"
        );

        return;
      }

      if (!token) {

        toast(
          "Please login again"
        );

        return;
      }

      if (status) {

        status.textContent =
          "⏳ Redirecting to Paystack...";

      }

      try {

        const res =
          await fetch(
            `${API_URL}/api/pay/initialize`,
            {
              method:"POST",

              headers:{
                "Content-Type":
                  "application/json",

                "Authorization":
                  `Bearer ${token}`
              },

              body:JSON.stringify({
                amount:
                  Number(amount)
              })
            }
          );

        const data =
          await res.json();

        if (
          data.status &&
          data.data &&
          data.data.authorization_url
        ) {

          window.location.href =
            data.data.authorization_url;

        } else {

          const message =
            data.message ||
            "Payment initialization failed";

          if (status) {

            status.textContent =
              "❌ " + message;

          }

          toast(
            "Payment error: " +
            message
          );

        }

      } catch (error) {

        if (status) {

          status.textContent =
            "❌ Network error";

        }

        toast(
          "Payment connection failed"
        );

      }

    };


  // =========================
  // CHECK PAYMENT RETURN
  // =========================

  async function checkPaymentReturn() {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const reference =
      params.get("reference");

    if (!reference) {
      return;
    }

    const token =
      localStorage.getItem(
        "otphub_token"
      );

    if (!token) {

      toast(
        "Please login again to verify payment"
      );

      return;
    }

    toast(
      "Verifying payment..."
    );

    try {

      const res =
        await fetch(
          `${API_URL}/api/pay/verify?reference=${encodeURIComponent(reference)}`,
          {
            headers:{
              "Authorization":
                `Bearer ${token}`
            }
          }
        );

      const data =
        await res.json();

      if (data.success) {

        if (currentUser) {

          currentUser.balances =
            data.balances ||
            {};

          localStorage.setItem(
            "otphub_user",
            JSON.stringify(
              currentUser
            )
          );

        }

        state.balance =
          Number(
            data.balances?.nigeria ??
            0
          );

        render();

        showPaymentSuccess(
          data.amount,
          data.balances ||
          {}
        );

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

      } else {

        toast(
          data.message ||
          "Payment verification failed"
        );

      }

    } catch (error) {

      console.error(
        "Payment verification error:",
        error
      );

      toast(
        "Payment verification failed"
      );

    }

  }


  // =========================
  // LOGIN TAB
  // =========================

  if (els.tabLogin) {

    els.tabLogin.onclick =
      () => {

        els.tabLogin.classList.add(
          "active"
        );

        els.tabRegister.classList.remove(
          "active"
        );

        els.loginForm.classList.remove(
          "hidden"
        );

        els.registerForm.classList.add(
          "hidden"
        );

      };

  }


  // =========================
  // REGISTER TAB
  // =========================

  if (els.tabRegister) {

    els.tabRegister.onclick =
      () => {

        els.tabRegister.classList.add(
          "active"
        );

        els.tabLogin.classList.remove(
          "active"
        );

        els.registerForm.classList.remove(
          "hidden"
        );

        els.loginForm.classList.add(
          "hidden"
        );

      };

  }


  // =========================
  // REGISTER
  // =========================

  if (els.registerForm) {

    els.registerForm.onsubmit =
      async e => {

        e.preventDefault();

        const email =
          $("regEmail")
            .value
            .trim()
            .toLowerCase();

        const password =
          $("regPass").value;

        const password2 =
          $("regPass2").value;

        if (
          password.length < 6
        ) {

          toast(
            "Password must be at least 6 characters"
          );

          return;
        }

        if (
          password !== password2
        ) {

          toast(
            "Passwords don't match"
          );

          return;
        }

        try {

          const res =
            await fetch(
              `${API_URL}/api/auth/register`,
              {
                method:"POST",

                headers:{
                  "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                  email,
                  password
                })
              }
            );

          const data =
            await res.json();

          if (!data.success) {

            toast(
              data.message ||
              "Register failed"
            );

            return;
          }

          showApp(
            data.user,
            data.token
          );

          toast(
            "Account created!"
          );

        } catch (error) {

          toast(
            "Backend not reachable"
          );

        }

      };

  }


  // =========================
  // LOGIN
  // =========================

  if (els.loginForm) {

    els.loginForm.onsubmit =
      async e => {

        e.preventDefault();

        const email =
          $("loginEmail")
            .value
            .trim()
            .toLowerCase();

        const password =
          $("loginPass").value;

        try {

          const res =
            await fetch(
              `${API_URL}/api/auth/login`,
              {
                method:"POST",

                headers:{
                  "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                  email,
                  password
                })
              }
            );

          const data =
            await res.json();

          if (!data.success) {

            toast(
              data.message ||
              "Login failed"
            );

            return;
          }

          showApp(
            data.user,
            data.token
          );

          toast(
            "Logged in!"
          );

        } catch (error) {

          toast(
            "Backend not reachable"
          );

        }

      };

  }


  // =========================
  // BUY OTP
  // =========================

  if (els.services) {

    els.services.onclick =
      async e => {

        const button =
          e.target.closest(
            ".buy-btn"
          );

        if (!button) {
          return;
        }

        await refreshBalance();

        if (
          state.balance <
          Number(local.price)
        ) {

          if (els.activeOrder) {

            els.activeOrder.classList.remove(
              "hidden"
            );

          }

          if (els.phoneNumber) {

            els.phoneNumber.textContent =
              "insufficient balance add money";

          }

          if (els.orderStatus) {

            els.orderStatus.textContent =
              "Low Balance";

          }

          if (els.topupModal) {

            els.topupModal.classList.remove(
              "hidden"
            );

          }

          toast(
            "Insufficient balance. Add money."
          );

          return;
        }

        const serviceId =
          button.dataset.id;

        button.textContent =
          "Buying...";

        button.disabled =
          true;

        try {

          const token =
            localStorage.getItem(
              "otphub_token"
            );

          if (!token) {

            toast(
              "Please login again"
            );

            button.textContent =
              "Buy";

            button.disabled =
              false;

            return;
          }

          const res =
            await fetch(
              `${API_URL}/api/orders`,
              {
                method:"POST",

                headers:{
                  "Content-Type":
                    "application/json",

                  "Authorization":
                    `Bearer ${token}`
                },

                body:JSON.stringify({
                  country:
                    selected.code,

                  service:
                    serviceId
                })
              }
            );

          const data =
            await res.json();

          if (!data.success) {

            button.textContent =
              "Buy";

            button.disabled =
              false;

            toast(
              data.message ||
              "Buy failed"
            );

            return;
          }

          if (data.balances) {

            if (!currentUser) {
              currentUser = {};
            }

            currentUser.balances =
              data.balances;

            localStorage.setItem(
              "otphub_user",
              JSON.stringify(
                currentUser
              )
            );

            state.balance =
              Number(
                data.balances[
                  local.code
                ] ??
                data.balances.nigeria ??
                0
              );

          }

          const serviceInfo =
            SERVICES.find(
              s =>
                s.id === serviceId
            );

          state.active = {

            id:
              data.order.id,

            name:
              serviceInfo
                ? serviceInfo.name
                : serviceId,

            icon:
              serviceInfo
                ? serviceInfo.icon
                : "💬",

            phone:
              data.order.phone,

            otp:
              data.order.otp ||
              null,

            expiresAt:
              Date.now() +
              900000

          };

          render();

          startTimer();

          startPolling(
            data.order.id
          );

          toast(
            "REAL number bought: " +
            data.order.phone
          );

        } catch (error) {

          console.error(
            error
          );

          toast(
            "Error buying number"
          );

          button.textContent =
            "Buy";

          button.disabled =
            false;

        }

      };

  }


  // =========================
  // DEPOSIT
  // =========================

  function openDeposit() {

    if (!els.topupModal) {
      return;
    }

    els.topupModal.classList.remove(
      "hidden"
    );

    const loggedEmail =
      currentUser?.email ||
      (
        els.userEmail
          ? els.userEmail.textContent
          : ""
      );

    const payEmailInput =
      document.getElementById(
        "payEmail"
      );

    if (
      payEmailInput &&
      loggedEmail &&
      loggedEmail.includes("@")
    ) {

      payEmailInput.value =
        loggedEmail.trim();

    }

  }


  const walletBtn =
    $("walletBtn");

  if (walletBtn) {

    walletBtn.onclick =
      openDeposit;

  }


  const depositBtn =
    $("depositBtn");

  if (depositBtn) {

    depositBtn.onclick =
      openDeposit;

  }


  // =========================
  // CLOSE MODAL
  // =========================

  const closeModalBtn =
    $("closeModalBtn");

  if (closeModalBtn) {

    closeModalBtn.onclick =
      () => {

        if (els.topupModal) {

          els.topupModal.classList.add(
            "hidden"
          );

        }

      };

  }


  // =========================
  // OTP COPY
  // =========================

  if (els.otpBox) {

    els.otpBox.onclick =
      () => {

        if (
          state.active &&
          state.active.otp
        ) {

          navigator.clipboard.writeText(
            state.active.otp
          );

          toast(
            "Copied " +
            state.active.otp
          );

        }

      };

  }


  // =========================
  // SEARCH
  // =========================

  if (els.phoneSearch) {

    els.phoneSearch.oninput =
      e => {

        state.search =
          e.target.value;

        render();

      };

  }


  // =========================
  // LOGOUT
  // =========================

  const logoutBtn =
    $("logoutBtn");

  if (logoutBtn) {

    logoutBtn.onclick =
      () => {

        localStorage.removeItem(
          "otphub_token"
        );

        localStorage.removeItem(
          "otphub_user"
        );

        location.reload();

      };

  }


  // =========================
  // RESTORE LOGIN
  // =========================

  const savedUser =
    localStorage.getItem(
      "otphub_user"
    );

  const savedToken =
    localStorage.getItem(
      "otphub_token"
    );

  if (
    savedUser &&
    savedToken
  ) {

    try {

      const user =
        JSON.parse(
          savedUser
        );

      showApp(
        user,
        savedToken
      );

    } catch (error) {

      localStorage.removeItem(
        "otphub_user"
      );

      localStorage.removeItem(
        "otphub_token"
      );

    }

  }


  // =========================
  // PAYMENT RETURN
  // =========================

  checkPaymentReturn();


  // =========================
  // INITIAL RENDER
  // =========================

  render();

});
