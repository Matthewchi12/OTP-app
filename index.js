document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://otp-backend-amwc.onrender.com";
  
  const LOCAL_CURRENCIES = [
    {code:"nigeria", name:"Nigeria", flag:"🇳🇬", currency:"NGN", symbol:"₦", price:1000, topups:[5000,10000,20000]},
    {code:"usa", name:"USA", flag:"🇺🇸", currency:"USD", symbol:"$", price:1, topups:[5,10,20]},
    {code:"uk", name:"UK", flag:"🇬🇧", currency:"GBP", symbol:"£", price:0.8, topups:[5,10,15]},
    {code:"canada", name:"Canada", flag:"🇨🇦", currency:"CAD", symbol:"C$", price:1.35, topups:[6,13,27]},
    {code:"ghana", name:"Ghana", flag:"🇬🇭", currency:"GHS", symbol:"₵", price:12, topups:[60,120,240]},
  ];
  const PHONE_COUNTRIES = [
    {code:"usa", name:"USA", flag:"🇺🇸", prefix:"+1"}, {code:"uk", name:"UK", flag:"🇬🇧", prefix:"+44"},
    {code:"canada", name:"Canada", flag:"🇨🇦", prefix:"+1"}, {code:"nigeria", name:"Nigeria", flag:"🇳🇬", prefix:"+234"},
    {code:"ghana", name:"Ghana", flag:"🇬🇭", prefix:"+233"}, {code:"kenya", name:"Kenya", flag:"🇰🇪", prefix:"+254"},
    {code:"southafrica", name:"South Africa", flag:"🇿🇦", prefix:"+27"}, {code:"india", name:"India", flag:"🇮🇳", prefix:"+91"},
    {code:"germany", name:"Germany", flag:"🇩🇪", prefix:"+49"}, {code:"france", name:"France", flag:"🇫🇷", prefix:"+33"},
    {code:"spain", name:"Spain", flag:"🇪🇸", prefix:"+34"}, {code:"italy", name:"Italy", flag:"🇮🇹", prefix:"+39"},
    {code:"netherlands", name:"Netherlands", flag:"🇳🇱", prefix:"+31"}, {code:"sweden", name:"Sweden", flag:"🇸🇪", prefix:"+46"},
    {code:"norway", name:"Norway", flag:"🇳🇴", prefix:"+47"}, {code:"poland", name:"Poland", flag:"🇵🇱", prefix:"+48"},
    {code:"turkey", name:"Turkey", flag:"🇹🇷", prefix:"+90"}, {code:"uae", name:"UAE", flag:"🇦🇪", prefix:"+971"},
    {code:"saudiarabia", name:"Saudi Arabia", flag:"🇸🇦", prefix:"+966"}, {code:"egypt", name:"Egypt", flag:"🇪🇬", prefix:"+20"},
    {code:"morocco", name:"Morocco", flag:"🇲🇦", prefix:"+212"}, {code:"australia", name:"Australia", flag:"🇦🇺", prefix:"+61"},
    {code:"brazil", name:"Brazil", flag:"🇧🇷", prefix:"+55"}, {code:"mexico", name:"Mexico", flag:"🇲🇽", prefix:"+52"},
  ];
  const SERVICES = [{id:"whatsapp",name:"WhatsApp",icon:"💬",color:"#25D366"},{id:"telegram",name:"Telegram",icon:"✈️",color:"#2AABEE"},{id:"facebook",name:"Facebook",icon:"📘",color:"#1877F2"},{id:"instagram",name:"Instagram",icon:"📸",color:"#E4405F"},{id:"tiktok",name:"TikTok",icon:"🎵",color:"#000"},{id:"google",name:"Google",icon:"🔍",color:"#DB4437"}];
  const $=id=>document.getElementById(id);
  const els={authScreen:$("authScreen"),app:$("app"),toasts:$("toasts"),tabLogin:$("tabLogin"),tabRegister:$("tabRegister"),loginForm:$("loginForm"),registerForm:$("registerForm"),phoneCountryRow:$("phoneCountryRow"),services:$("services"),activeOrder:$("activeOrder"),walletBalance:$("walletBalance"),heroPrice:$("heroPrice"),localBadge:$("localBadge"),servicesTitle:$("servicesTitle"),orderService:$("orderService"),timer:$("timer"),timerProgress:$("timerProgress"),phoneNumber:$("phoneNumber"),orderStatus:$("orderStatus"),otpBox:$("otpBox"),otpCode:$("otpCode"),waitingText:$("waitingText"),topupModal:$("topupModal"),modalCountry:$("modalCountry"),modalBalance:$("modalBalance"),topupOptions:$("topupOptions"),userEmail:$("userEmail"),phoneSearch:$("phoneSearch")};
  let local=LOCAL_CURRENCIES[0], selected=PHONE_COUNTRIES[0], currentUser=null, state={balance:10000,active:null,search:""}, timerInt=null, pollInt=null;
  const toast=m=>{const d=document.createElement("div");d.className="toast";d.innerText=m;els.toasts.appendChild(d);setTimeout(()=>d.remove(),3000);};
  const money=a=> local.currency==="NGN"?`${local.symbol}${Number(a).toLocaleString()}`:`${local.symbol}${a}`;
  
  function showApp(user, token){
    currentUser=user; 
    if(token) localStorage.setItem("otphub_token", token);
    localStorage.setItem("otphub_user", JSON.stringify(user));
    if(!user.balances){user.balances={}; LOCAL_CURRENCIES.forEach(c=>user.balances[c.code]=c.topups[1]);}
    state.balance=user.balances[local.code] || user.balances.nigeria || 10000;
    els.authScreen.classList.add("hidden"); els.app.classList.remove("hidden"); els.userEmail.textContent=user.email; render(); startTimer();
  }

  function render(){
    els.walletBalance.textContent=money(state.balance); els.heroPrice.textContent=money(local.price); if(els.modalCountry) els.modalCountry.textContent=`${local.flag} ${local.currency}`; if(els.modalBalance) els.modalBalance.textContent=money(state.balance);
    els.servicesTitle.textContent=`${PHONE_COUNTRIES.length} Countries - ${money(local.price)} each • ${selected.flag} ${selected.name}`;
    els.phoneCountryRow.innerHTML=""; PHONE_COUNTRIES.filter(c=>c.name.toLowerCase().includes(state.search.toLowerCase())||c.prefix.includes(state.search)).forEach(c=>{
      const b=document.createElement("button"); b.className="country-chip"+(c.code===selected.code?" active":""); b.textContent=`${c.flag} ${c.name} ${c.prefix}`; b.onclick=()=>{selected=c; render();}; els.phoneCountryRow.appendChild(b);
    });
    els.services.innerHTML=""; SERVICES.forEach(s=>{
      const d=document.createElement("div"); d.className="service-card";
      d.innerHTML=`<div class="service-icon" style="background:${s.color}20">${s.icon}</div><div class="service-info"><div class="service-name">${s.name}</div><div class="service-meta">${selected.flag} ${selected.prefix}</div></div><div><div style="font-weight:800">${money(local.price)}</div><button data-id="${s.id}" class="buy-btn">Buy</button></div>`;
      els.services.appendChild(d);
    });
    if(!state.active){els.activeOrder.classList.add("hidden");return;} els.activeOrder.classList.remove("hidden"); els.orderService.textContent=state.active.icon+" "+state.active.name; els.phoneNumber.textContent=state.active.phone; els.orderStatus.textContent=selected.name + " - REAL NUMBER";
    if(state.active.otp){els.otpBox.classList.remove("hidden"); els.waitingText.classList.add("hidden"); els.otpCode.textContent=state.active.otp;}else{els.otpBox.classList.add("hidden"); els.waitingText.classList.remove("hidden"); els.waitingText.textContent="Waiting for REAL SMS from 5sim...";}
  }

  function startTimer(){clearInterval(timerInt); timerInt=setInterval(()=>{if(state.active){const r=Math.max(0,Math.floor((state.active.expiresAt-Date.now())/1000)); els.timer.textContent=`${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`; els.timerProgress.style.width=`${(r/900)*100}%`; if(r<=0){state.active=null; clearInterval(pollInt); render();}}},1000);}
  
  function startPolling(orderId){
    clearInterval(pollInt);
    pollInt = setInterval(async ()=>{
      try{
        const token = localStorage.getItem("otphub_token");
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if(data.success && data.order && data.order.otp){
          state.active.otp = data.order.otp;
          render();
          toast("REAL OTP Received: " + data.order.otp);
          clearInterval(pollInt);
        }
      }catch(e){console.log("poll error", e)}
    }, 5000);
  }

  window.setAmount = function(val){
    const input = document.getElementById("customAmount");
    if(input) input.value = val;
  }
  window.payCustom = function(){
    const input = document.getElementById("customAmount");
    const amount = input ? input.value : null;
    if(!amount || Number(amount) < 100) return toast("Enter amount minimum ₦100");
    payNow(Number(amount));
  }
  window.payNow = async function(amount){
    const emailInput = document.getElementById("payEmail");
    const status = document.getElementById("payStatus");
    const email = (emailInput && emailInput.value.trim()) || (els.userEmail ? els.userEmail.textContent.trim() : "") || (currentUser ? currentUser.email : "");
    if(!email || !email.includes('@')){ toast("Enter valid email"); return; }
    if(status) status.textContent = "⏳ Redirecting to Paystack...";
    try{
      const res = await fetch(`${API_URL}/api/pay/initialize`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, amount: Number(amount) })
      });
      const data = await res.json();
      if(data.status && data.data && data.data.authorization_url){
        window.location.href = data.data.authorization_url;
      } else {
        if(status) status.textContent = "❌ " + (data.message || JSON.stringify(data));
        toast("Payment error");
      }
    }catch(e){
      if(status) status.textContent = "❌ Network error: " + e.message;
    }
  }

  els.tabLogin.onclick=()=>{els.tabLogin.classList.add("active");els.tabRegister.classList.remove("active");els.loginForm.classList.remove("hidden");els.registerForm.classList.add("hidden");};
  els.tabRegister.onclick=()=>{els.tabRegister.classList.add("active");els.tabLogin.classList.remove("active");els.registerForm.classList.remove("hidden");els.loginForm.classList.add("hidden");};
  
  els.registerForm.onsubmit=async e=>{
    e.preventDefault(); const email=$("regEmail").value.trim().toLowerCase(), p=$("regPass").value, p2=$("regPass2").value; 
    if(p!==p2) return toast("Passwords don't match"); 
    try{
      const res = await fetch(`${API_URL}/api/auth/register`, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({email, password:p})});
      const data = await res.json();
      if(!data.success) return toast(data.message || "Register failed");
      toast("Account created!"); showApp(data.user, data.token);
    }catch{toast("Backend not reachable - check Render link");}
  };
  
  els.loginForm.onsubmit=async e=>{
    e.preventDefault(); const email=$("loginEmail").value.trim().toLowerCase(), p=$("loginPass").value;
    try{
      const res = await fetch(`${API_URL}/api/auth/login`, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({email, password:p})});
      const data = await res.json();
      if(!data.success) return toast(data.message || "Login failed");
      toast("Logged in!"); showApp(data.user, data.token);
    }catch{toast("Backend not reachable - check Render link");}
  };
  
  els.services.onclick=async e=>{
    const b=e.target.closest(".buy-btn"); if(!b) return; 
    // ✅ ADDED: Check if balance less than product price
    if(state.balance < local.price){
      // ✅ ADDED: Show message in phone number area
      els.activeOrder.classList.remove("hidden");
      if(els.orderService) els.orderService.textContent = b.dataset.id + " • " + selected.name;
      if(els.phoneNumber) els.phoneNumber.textContent = "insufficient balance add money";
      if(els.orderStatus) els.orderStatus.textContent = "Low Balance";
      if(els.otpBox) els.otpBox.classList.add("hidden");
      if(els.waitingText) els.waitingText.classList.add("hidden");
      // ✅ ADDED: Open deposit modal
      els.topupModal.classList.remove("hidden");
      toast("insufficient balance add money");
      return;
    }
    const serviceId = b.dataset.id;
    b.textContent="Buying..."; b.disabled=true;
    try{
      const token = localStorage.getItem("otphub_token");
      const res = await fetch(`${API_URL}/api/orders`, {
        method:"POST",
        headers:{"Content-Type":"application/json", "Authorization": `Bearer ${token}`},
        body: JSON.stringify({country: selected.code, service: serviceId})
      });
      const data = await res.json();
      if(!data.success) {
        b.textContent="Buy"; b.disabled=false;
        // ✅ ADDED: Handle backend insufficient balance
        if(data.message && data.message.toLowerCase().includes("insufficient")){
          els.activeOrder.classList.remove("hidden");
          if(els.orderService) els.orderService.textContent = serviceId + " • " + selected.name;
          if(els.phoneNumber) els.phoneNumber.textContent = "insufficient balance add money";
          if(els.orderStatus) els.orderStatus.textContent = "Low Balance";
          if(els.otpBox) els.otpBox.classList.add("hidden");
          if(els.waitingText) els.waitingText.classList.add("hidden");
          els.topupModal.classList.remove("hidden");
          return toast("insufficient balance add money");
        }
        return toast(data.message || "Buy failed - check 5sim balance");
      }
      state.balance-=local.price; 
      if(data.balances) { currentUser.balances = data.balances; localStorage.setItem("otphub_user", JSON.stringify(currentUser)); state.balance = data.balances[local.code] || state.balance; }
      state.active={id:data.order.id, name:serviceId, icon:"💬", phone:data.order.phone, otp:data.order.otp || null, expiresAt:Date.now()+900000};
      render(); startTimer(); startPolling(data.order.id);
      toast("REAL number bought: " + data.order.phone);
    }catch(err){toast("Error buying - backend offline?"); b.textContent="Buy"; b.disabled=false;}
  };

  function openDeposit(){
    els.topupModal.classList.remove("hidden");
    const loggedEmail = els.userEmail ? els.userEmail.textContent : (currentUser ? currentUser.email : "");
    const payEmailInput = document.getElementById("payEmail");
    if(payEmailInput && loggedEmail && loggedEmail.includes('@')) payEmailInput.value = loggedEmail.trim();
  }

  $("walletBtn").onclick=openDeposit;
  $("depositBtn").onclick=openDeposit;
  $("closeModalBtn").onclick=()=>els.topupModal.classList.add("hidden");
  $("logoutBtn").onclick=()=>{localStorage.clear(); location.reload();};
  els.phoneSearch.oninput=e=>{state.search=e.target.value; render();};
  els.otpBox.onclick=()=>{if(state.active?.otp){navigator.clipboard.writeText(state.active.otp); toast("Copied "+state.active.otp);}};
  
  const savedUser = localStorage.getItem("otphub_user");
  const savedToken = localStorage.getItem("otphub_token");
  if(savedUser && savedToken){try{showApp(JSON.parse(savedUser), savedToken);}catch{}} 
  render();
});
