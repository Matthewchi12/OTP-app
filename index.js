(() => {
  const API_URL = "https://YOUR-OTPHUB-BACKEND.onrender.com";
  const IS_DEMO = API_URL.includes("YOUR-OTPHUB");

  const COUNTRIES = [
    {code:"nigeria",name:"Nigeria",flag:"🇳🇬",symbol:"₦",prefix:"+234",currency:"NGN",price:1000,topups:[5000,10000,20000]},
    {code:"usa",name:"USA",flag:"🇺🇸",symbol:"$",prefix:"+1",currency:"USD",price:1,topups:[5,10,20]},
    {code:"uk",name:"UK",flag:"🇬🇧",symbol:"£",prefix:"+44",currency:"GBP",price:0.80,topups:[5,10,15]},
    {code:"ghana",name:"Ghana",flag:"🇬🇭",symbol:"₵",prefix:"+233",currency:"GHS",price:12,topups:[60,120,240]},
    {code:"kenya",name:"Kenya",flag:"🇰🇪",symbol:"KSh",prefix:"+254",currency:"KES",price:130,topups:[650,1300,2600]},
    {code:"india",name:"India",flag:"🇮🇳",symbol:"₹",prefix:"+91",currency:"INR",price:70,topups:[350,700,1400]}
  ];
  const SERVICES = [
    {id:"whatsapp",name:"WhatsApp",icon:"💬",color:"#25D366"},
    {id:"telegram",name:"Telegram",icon:"✈️",color:"#2AABEE"},
    {id:"facebook",name:"Facebook",icon:"📘",color:"#1877F2"},
    {id:"instagram",name:"Instagram",icon:"📸",color:"#E4405F"},
    {id:"tiktok",name:"TikTok",icon:"🎵",color:"#000"},
    {id:"google",name:"Google",icon:"🔍",color:"#DB4437"},
    {id:"twitter",name:"Twitter / X",icon:"🐦",color:"#1DA1F2"},
    {id:"discord",name:"Discord",icon:"🎮",color:"#5865F2"},
  ];

  const $ = id => document.getElementById(id);
  const els = {
    authScreen:$("authScreen"), app:$("app"), toasts:$("toasts"),
    tabLogin:$("tabLogin"), tabRegister:$("tabRegister"), loginForm:$("loginForm"), registerForm:$("registerForm"),
    countryRow:$("countryRow"), services:$("services"), activeOrder:$("activeOrder"),
    walletBalance:$("walletBalance"), heroPrice:$("heroPrice"), heroSub:$("heroSub"), servicesTitle:$("servicesTitle"),
    orderService:$("orderService"), timer:$("timer"), timerProgress:$("timerProgress"), phoneNumber:$("phoneNumber"),
    orderStatus:$("orderStatus"), otpBox:$("otpBox"), otpCode:$("otpCode"), waitingText:$("waitingText"),
    topupModal:$("topupModal"), modalCountry:$("modalCountry"), modalBalance:$("modalBalance"), topupOptions:$("topupOptions"),
    userEmail:$("userEmail")
  };

  const USERS_KEY="otphub_users", SESSION_KEY="otphub_session";
  let currentUser=null;
  let state={country:COUNTRIES[0], balances:{}, activeOrder:null};
  let timerInt=null, mockTimeout=null;

  const toast = m => { const t=document.createElement("div"); t.className="toast"; t.innerText=m; els.toasts.appendChild(t); setTimeout(()=>t.remove(),2500); };
  const money = (a,c)=> c.currency==="NGN"?`${c.symbol}${Number(a).toLocaleString("en-NG")}`:`${c.symbol}${Number(a).toFixed(2)}`;
  const getUsers = ()=> JSON.parse(localStorage.getItem(USERS_KEY)||"[]");
  const saveUsers = u => localStorage.setItem(USERS_KEY, JSON.stringify(u));
  const setSession = id => localStorage.setItem(SESSION_KEY, id);
  const getSession = ()=> localStorage.getItem(SESSION_KEY);

  function loadUserData(user){
    state.balances=user.balances||{};
    COUNTRIES.forEach(c=>{ if(state.balances[c.code]==null) state.balances[c.code]=c.topups[1]; });
    const activeKey=`otphub_active_${user.id}`;
    state.activeOrder=JSON.parse(localStorage.getItem(activeKey)||"null");
    if(state.activeOrder && Date.now()>state.activeOrder.expiresAt){ state.activeOrder=null; localStorage.removeItem(activeKey); }
  }
  function saveUserData(){
    if(!currentUser) return;
    const users=getUsers(); const i=users.findIndex(u=>u.id===currentUser.id);
    if(i>=0){ users[i].balances=state.balances; saveUsers(users); }
    const activeKey=`otphub_active_${currentUser.id}`;
    if(state.activeOrder) localStorage.setItem(activeKey, JSON.stringify(state.activeOrder));
    else localStorage.removeItem(activeKey);
  }

  // AUTH LOGIC
  function showApp(user){
    currentUser=user; setSession(user.id); loadUserData(user);
    els.authScreen.classList.add("hidden"); els.app.classList.remove("hidden");
    els.userEmail.textContent=user.email; renderCountries(); renderAll(); startTimer();
  }
  function showAuth(){
    els.authScreen.classList.remove("hidden"); els.app.classList.add("hidden");
    currentUser=null; localStorage.removeItem(SESSION_KEY); clearInterval(timerInt);
  }

  els.tabLogin.onclick=()=>{ els.tabLogin.classList.add("active"); els.tabRegister.classList.remove("active"); els.loginForm.classList.remove("hidden"); els.registerForm.classList.add("hidden"); };
  els.tabRegister.onclick=()=>{ els.tabRegister.classList.add("active"); els.tabLogin.classList.remove("active"); els.registerForm.classList.remove("hidden"); els.loginForm.classList.add("hidden"); };

  els.registerForm.onsubmit = e => {
    e.preventDefault();
    const email=$("regEmail").value.trim().toLowerCase();
    const pass=$("regPass").value; const pass2=$("regPass2").value;
    if(!email.includes("@")) return toast("Invalid email");
    if(pass.length<6) return toast("Password min 6 chars");
    if(pass!==pass2) return toast("Passwords don't match");

    if(IS_DEMO){
      const users=getUsers();
      if(users.find(u=>u.email===email)) return toast("Email already exists");
      const newUser={id:Date.now().toString(), email, password:pass, balances:{}};
      COUNTRIES.forEach(c=>newUser.balances[c.code]=c.topups[1]);
      users.push(newUser); saveUsers(users);
      toast("Account created! Logging in..."); showApp(newUser);
    } else {
      // REAL BACKEND
      fetch(`${API_URL}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:pass})})
     .then(r=>r.json()).then(d=>{ if(!d.success) throw new Error(d.message); localStorage.setItem("otphub_token", d.token); showApp(d.user); })
     .catch(err=>toast(err.message||"Register failed"));
    }
  };

  els.loginForm.onsubmit = e => {
    e.preventDefault();
    const email=$("loginEmail").value.trim().toLowerCase();
    const pass=$("loginPass").value;
    if(IS_DEMO){
      const user=getUsers().find(u=>u.email===email && u.password===pass);
      if(!user) return toast("Wrong email or password");
      showApp(user);
    } else {
      fetch(`${API_URL}/api/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:pass})})
     .then(r=>r.json()).then(d=>{ if(!d.success) throw new Error(d.message); localStorage.setItem("otphub_token", d.token); showApp(d.user); })
     .catch(err=>toast(err.message||"Login failed"));
    }
  };

  // APP LOGIC
  function renderCountries(){
    els.countryRow.innerHTML="";
    COUNTRIES.forEach(c=>{
      const b=document.createElement("button"); b.className="country-chip"+(c.code===state.country.code?" active":"");
      b.textContent=`${c.flag} ${c.name} • ${money(c.price,c)}`;
      b.onclick=()=>{ state.country=c; saveUserData(); renderAll(); };
      els.countryRow.appendChild(b);
    });
  }
  function renderAll(){
    const c=state.country, bal=state.balances[c.code];
    els.walletBalance.textContent=money(bal,c);
    els.heroPrice.textContent=money(c.price,c);
    els.heroSub.textContent=`${c.flag} ${c.name} • ${c.currency}`;
    els.servicesTitle.textContent=`All Services - ${money(c.price,c)} Each`;
    els.modalCountry.textContent=`${c.flag} ${c.currency}`;
    els.modalBalance.textContent=money(bal,c);
    els.services.innerHTML="";
    SERVICES.forEach(s=>{
      const d=document.createElement("div"); d.className="service-card";
      d.innerHTML=`<div class="service-icon" style="background:${s.color}20">${s.icon}</div><div class="service-info"><div class="service-name">${s.name}</div><div class="service-meta">96% success • ${c.flag}</div></div><div style="text-align:right"><div style="font-weight:800">${money(c.price,c)}</div><button data-service="${s.id}" class="buy-btn">Buy</button></div>`;
      els.services.appendChild(d);
    });
    els.topupOptions.innerHTML="";
    c.topups.forEach((a,i)=>{ const o=document.createElement("div"); o.className="topup-option"+(i===1?" popular":""); o.innerHTML=`<b>Add ${money(a,c)}</b><span>${Math.floor(a/c.price)} OTPs</span>`; o.onclick=()=>{ state.balances[c.code]+=a; saveUserData(); renderAll(); els.topupModal.classList.add("hidden"); toast("Wallet funded"); }; els.topupOptions.appendChild(o); });
    renderActive();
  }
  function renderActive(){
    if(!state.activeOrder){ els.activeOrder.classList.add("hidden"); return; }
    const o=state.activeOrder; const remain=Math.max(0, Math.floor((o.expiresAt-Date.now())/1000));
    if(remain<=0){ state.activeOrder=null; saveUserData(); els.activeOrder.classList.add("hidden"); return; }
    els.activeOrder.classList.remove("hidden");
    els.orderService.textContent=`${o.icon} ${o.name}`; els.phoneNumber.textContent=o.phone; els.orderStatus.textContent=`${o.status}`; els.timer.textContent=`${Math.floor(remain/60)}:${String(remain%60).padStart(2,"0")}`; els.timerProgress.style.width=`${(remain/900)*100}%`;
    if(o.otp){ els.otpBox.classList.remove("hidden"); els.waitingText.classList.add("hidden"); els.otpCode.textContent=o.otp; } else { els.otpBox.classList.add("hidden"); els.waitingText.classList.remove("hidden"); }
  }
  function startTimer(){ clearInterval(timerInt); timerInt=setInterval(renderActive,1000); }
  function buy(id){
    const s=SERVICES.find(x=>x.id===id); const price=state.country.price;
    if(state.balances[state.country.code]<price){ toast("Low balance"); els.topupModal.classList.remove("hidden"); return; }
    state.balances[state.country.code]-=price;
    state.activeOrder={id:Date.now().toString(), name:s.name, icon:s.icon, phone:state.country.prefix+Math.floor(7000000000+Math.random()*999999999).toString().slice(0,10), otp:null, status:"Waiting for SMS", expiresAt:Date.now()+900000};
    saveUserData(); renderAll(); startTimer();
    mockTimeout=setTimeout(()=>{ if(state.activeOrder){ state.activeOrder.otp=Math.floor(100000+Math.random()*900000).toString(); state.activeOrder.status="OTP Received"; saveUserData(); renderActive(); toast("OTP Received!"); } },6000);
  }

  els.services.addEventListener("click", e=>{ const b=e.target.closest(".buy-btn"); if(b) buy(b.dataset.service); });
  els.otpBox.addEventListener("click", ()=>{ if(state.activeOrder?.otp) navigator.clipboard.writeText(state.activeOrder.otp).then(()=>toast("Copied "+state.activeOrder.otp)); });
  $("walletBtn").onclick=()=>els.topupModal.classList.remove("hidden");
  $("closeModalBtn").onclick=()=>els.topupModal.classList.add("hidden");
  $("cancelOrderBtn").onclick=()=>{ state.activeOrder=null; saveUserData(); renderActive(); toast("Cancelled"); };
  $("logoutBtn").onclick=()=>{ showAuth(); toast("Logged out"); };
  $("topupModal").addEventListener("click", e=>{ if(e.target.id==="topupModal") e.target.classList.add("hidden"); });

  // AUTO LOGIN IF SESSION EXISTS
  const sess=getSession();
  if(sess){ const u=getUsers().find(x=>x.id===sess); if(u) showApp(u); }
})();
