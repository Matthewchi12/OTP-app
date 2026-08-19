(() => {
  const LOCAL_CURRENCIES = [
    {code:"nigeria", name:"Nigeria", flag:"🇳🇬", currency:"NGN", symbol:"₦", price:1000, topups:[5000,10000,20000]},
    {code:"usa", name:"USA", flag:"🇺🇸", currency:"USD", symbol:"$", price:1, topups:[5,10,20]},
    {code:"uk", name:"UK", flag:"🇬🇧", currency:"GBP", symbol:"£", price:0.8, topups:[5,10,15]},
    {code:"canada", name:"Canada", flag:"🇨🇦", currency:"CAD", symbol:"C$", price:1.35, topups:[6,13,27]},
    {code:"ghana", name:"Ghana", flag:"🇬🇭", currency:"GHS", symbol:"₵", price:12, topups:[60,120,240]},
    {code:"kenya", name:"Kenya", flag:"🇰🇪", currency:"KES", symbol:"KSh", price:130, topups:[650,1300,2600]},
    {code:"india", name:"India", flag:"🇮🇳", currency:"INR", symbol:"₹", price:70, topups:[350,700,1400]},
  ];

  const PHONE_COUNTRIES = [
    {code:"usa", name:"USA", flag:"🇺🇸", prefix:"+1"},
    {code:"uk", name:"UK", flag:"🇬🇧", prefix:"+44"},
    {code:"canada", name:"Canada", flag:"🇨🇦", prefix:"+1"},
    {code:"nigeria", name:"Nigeria", flag:"🇳🇬", prefix:"+234"},
    {code:"ghana", name:"Ghana", flag:"🇬🇭", prefix:"+233"},
    {code:"kenya", name:"Kenya", flag:"🇰🇪", prefix:"+254"},
    {code:"india", name:"India", flag:"🇮🇳", prefix:"+91"},
    {code:"germany", name:"Germany", flag:"🇩🇪", prefix:"+49"},
    {code:"australia", name:"Australia", flag:"🇦🇺", prefix:"+61"},
    {code:"southafrica", name:"South Africa", flag:"🇿🇦", prefix:"+27"},
    {code:"france", name:"France", flag:"🇫🇷", prefix:"+33"},
    {code:"brazil", name:"Brazil", flag:"🇧🇷", prefix:"+55"},
  ];

  const SERVICES = [
    {id:"whatsapp",name:"WhatsApp",icon:"💬",color:"#25D366"},
    {id:"telegram",name:"Telegram",icon:"✈️",color:"#2AABEE"},
    {id:"facebook",name:"Facebook",icon:"📘",color:"#1877F2"},
    {id:"instagram",name:"Instagram",icon:"📸",color:"#E4405F"},
    {id:"tiktok",name:"TikTok",icon:"🎵",color:"#000"},
    {id:"google",name:"Google",icon:"🔍",color:"#DB4437"},
  ];

  const $ = id => document.getElementById(id);
  const els = {
    authScreen:$("authScreen"),app:$("app"),toasts:$("toasts"),
    tabLogin:$("tabLogin"),tabRegister:$("tabRegister"),
    loginForm:$("loginForm"),registerForm:$("registerForm"),
    phoneCountryRow:$("phoneCountryRow"),services:$("services"),
    activeOrder:$("activeOrder"),walletBalance:$("walletBalance"),
    heroPrice:$("heroPrice"),heroSub:$("heroSub"),localBadge:$("localBadge"),
    servicesTitle:$("servicesTitle"),orderService:$("orderService"),
    timer:$("timer"),timerProgress:$("timerProgress"),phoneNumber:$("phoneNumber"),
    orderStatus:$("orderStatus"),otpBox:$("otpBox"),otpCode:$("otpCode"),
    waitingText:$("waitingText"),topupModal:$("topupModal"),
    modalCountry:$("modalCountry"),modalBalance:$("modalBalance"),
    topupOptions:$("topupOptions"),userEmail:$("userEmail"),phoneSearch:$("phoneSearch")
  };

  let localCurrency = LOCAL_CURRENCIES[0];
  let selectedPhoneCountry = PHONE_COUNTRIES[0];
  let currentUser=null;
  let state={balance: localCurrency.topups[1], activeOrder:null, search:""};
  let timerInt=null;

  const toast=m=>{const t=document.createElement("div");t.className="toast";t.innerText=m;els.toasts.appendChild(t);setTimeout(()=>t.remove(),2500);};
  const money=a=> localCurrency.currency==="NGN"?`${localCurrency.symbol}${Number(a).toLocaleString("en-NG")}`:`${localCurrency.symbol}${Number(a).toFixed(2)}`;

  async function detectLocal(){
    try{
      const res=await fetch("https://ipapi.co/json/");
      const data=await res.json();
      const map={NG:"nigeria",US:"usa",GB:"uk",CA:"canada",GH:"ghana",KE:"kenya",IN:"india",DE:"germany",AU:"australia",ZA:"southafrica",FR:"france",BR:"brazil"};
      const code=map[data.country_code]||"nigeria";
      localCurrency=LOCAL_CURRENCIES.find(c=>c.code===code)||LOCAL_CURRENCIES[0];
      els.localBadge.textContent=`📍 ${localCurrency.flag} Your location: ${localCurrency.name} • Prices in ${localCurrency.currency}`;
    }catch{
      els.localBadge.textContent=`📍 ${localCurrency.flag} ${localCurrency.name} • Prices in ${localCurrency.currency}`;
    }
    renderAll();
  }

  const getUsers=()=>JSON.parse(localStorage.getItem("otphub_users")||"[]");
  const saveUsers=u=>localStorage.setItem("otphub_users",JSON.stringify(u));

  function showApp(user){
    currentUser=user;
    localStorage.setItem("otphub_session",user.id);
    if(!user.balances) user.balances={};
    LOCAL_CURRENCIES.forEach(c=>{ if(user.balances[c.code]==null) user.balances[c.code]=c.topups[1]; });
    state.balance=user.balances[localCurrency.code];
    state.activeOrder=JSON.parse(localStorage.getItem(`otphub_active_${user.id}`)||"null");
    els.authScreen.classList.add("hidden");
    els.app.classList.remove("hidden");
    els.userEmail.textContent=user.email;
    renderAll();
    startTimer();
  }

  function showAuth(){
    els.authScreen.classList.remove("hidden");
    els.app.classList.add("hidden");
    localStorage.removeItem("otphub_session");
    currentUser=null;
  }

  // TABS - FIXED
  els.tabLogin.addEventListener("click", ()=>{
    els.tabLogin.classList.add("active");
    els.tabRegister.classList.remove("active");
    els.loginForm.classList.remove("hidden");
    els.registerForm.classList.add("hidden");
  });
  els.tabRegister.addEventListener("click", ()=>{
    els.tabRegister.classList.add("active");
    els.tabLogin.classList.remove("active");
    els.registerForm.classList.remove("hidden");
    els.loginForm.classList.add("hidden");
  });

  // REGISTER - FIXED
  els.registerForm.addEventListener("submit", e=>{
    e.preventDefault();
    const email=$("regEmail").value.trim().toLowerCase();
    const p=$("regPass").value;
    const p2=$("regPass2").value;
    if(!email.includes("@")) return toast("Invalid email");
    if(p.length<6) return toast("Password min 6 chars");
    if(p!==p2) return toast("Passwords don't match");
    const users=getUsers();
    if(users.find(u=>u.email===email)) return toast("Email already exists");
    const newUser={id:Date.now().toString(), email, password:p, balances:{}};
    LOCAL_CURRENCIES.forEach(c=>newUser.balances[c.code]=c.topups[1]);
    users.push(newUser);
    saveUsers(users);
    toast("Account created!");
    showApp(newUser);
  });

  // LOGIN - FIXED
  els.loginForm.addEventListener("submit", e=>{
    e.preventDefault();
    const email=$("loginEmail").value.trim().toLowerCase();
    const p=$("loginPass").value;
    const users=getUsers();
    const user=users.find(u=>u.email===email && u.password===p);
    if(!user) return toast("Wrong email or password");
    toast("Logged in!");
    showApp(user);
  });

  function renderAll(){
    els.walletBalance.textContent=money(state.balance);
    els.heroPrice.textContent=money(localCurrency.price);
    els.heroSub.textContent=`All numbers cost ${money(localCurrency.price)} in ${localCurrency.currency} • Phone from ${selectedPhoneCountry.name}`;
    els.servicesTitle.textContent=`Services - ${money(localCurrency.price)} each • ${selectedPhoneCountry.flag} ${selectedPhoneCountry.name}`;
    els.modalCountry.textContent=`${localCurrency.flag} ${localCurrency.currency}`;
    els.modalBalance.textContent=money(state.balance);

    const q=state.search.toLowerCase();
    const filtered=PHONE_COUNTRIES.filter(c=>c.name.toLowerCase().includes(q)||c.prefix.includes(q));
    els.phoneCountryRow.innerHTML="";
    filtered.forEach(c=>{
      const b=document.createElement("button");
      b.className="country-chip"+(c.code===selectedPhoneCountry.code?" active":"");
      b.textContent=`${c.flag} ${c.name} ${c.prefix}`;
      b.addEventListener("click", ()=>{ selectedPhoneCountry=c; renderAll(); });
      els.phoneCountryRow.appendChild(b);
    });

    els.services.innerHTML="";
    SERVICES.forEach(s=>{
      const d=document.createElement("div");
      d.className="service-card";
      d.innerHTML=`<div class="service-icon" style="background:${s.color}20">${s.icon}</div><div class="service-info"><div class="service-name">${s.name}</div><div class="service-meta">${selectedPhoneCountry.flag} ${selectedPhoneCountry.name} • ${selectedPhoneCountry.prefix}</div></div><div style="text-align:right"><div style="font-weight:800">${money(localCurrency.price)}</div><button data-service="${s.id}" class="buy-btn">Buy</button></div>`;
      els.services.appendChild(d);
    });

    els.topupOptions.innerHTML="";
    localCurrency.topups.forEach((a,i)=>{
      const o=document.createElement("div");
      o.className="topup-option"+(i===1?" popular":"");
      o.innerHTML=`<b>Add ${money(a)}</b><span>${Math.floor(a/localCurrency.price)} OTPs</span>`;
      o.addEventListener("click", ()=>{
        state.balance+=a;
        const users=getUsers();
        const idx=users.findIndex(u=>u.id===currentUser.id);
        if(idx>=0){ users[idx].balances[localCurrency.code]=state.balance; saveUsers(users); }
        renderAll();
        els.topupModal.classList.add("hidden");
        toast("Wallet funded");
      });
      els.topupOptions.appendChild(o);
    });
    renderActive();
  }

  function renderActive(){
    if(!state.activeOrder){els.activeOrder.classList.add("hidden");return;}
    const o=state.activeOrder;
    const remain=Math.max(0,Math.floor((o.expiresAt-Date.now())/1000));
    if(remain<=0){state.activeOrder=null;localStorage.removeItem(`otphub_active_${currentUser.id}`);els.activeOrder.classList.add("hidden");return;}
    els.activeOrder.classList.remove("hidden");
    els.orderService.textContent=`${o.icon} ${o.name} • ${o.phoneCountry.flag}`;
    els.phoneNumber.textContent=o.phone;
    els.orderStatus.textContent=`${o.phoneCountry.name} • Paid ${money(localCurrency.price)}`;
    els.timer.textContent=`${Math.floor(remain/60)}:${String(remain%60).padStart(2,"0")}`;
    els.timerProgress.style.width=`${(remain/900)*100}%`;
    if(o.otp){els.otpBox.classList.remove("hidden");els.waitingText.classList.add("hidden");els.otpCode.textContent=o.otp;}
    else{els.otpBox.classList.add("hidden");els.waitingText.classList.remove("hidden");}
  }

  function startTimer(){clearInterval(timerInt);timerInt=setInterval(renderActive,1000);}

  els.services.addEventListener("click", e=>{
    const b=e.target.closest(".buy-btn");
    if(!b) return;
    const id=b.dataset.service;
    const s=SERVICES.find(x=>x.id===id);
    if(state.balance<localCurrency.price){toast("Low balance");els.topupModal.classList.remove("hidden");return;}
    state.balance-=localCurrency.price;
    const phone=selectedPhoneCountry.prefix+" "+Math.floor(7000000000+Math.random()*999999999).toString().slice(0,10);
    state.activeOrder={id:Date.now().toString(),name:s.name,icon:s.icon,phone,phoneCountry:selectedPhoneCountry,otp:null,expiresAt:Date.now()+900000};
    const users=getUsers();const idx=users.findIndex(u=>u.id===currentUser.id);
    if(idx>=0){users[idx].balances[localCurrency.code]=state.balance;saveUsers(users);}
    localStorage.setItem(`otphub_active_${currentUser.id}`,JSON.stringify(state.activeOrder));
    renderAll();startTimer();
    setTimeout(()=>{if(state.activeOrder){state.activeOrder.otp=Math.floor(100000+Math.random()*900000).toString();localStorage.setItem(`otphub_active_${currentUser.id}`,JSON.stringify(state.activeOrder));renderActive();toast("OTP Received!");}},6000);
  });

  els.otpBox.addEventListener("click", ()=>{if(state.activeOrder?.otp)navigator.clipboard.writeText(state.activeOrder.otp).then(()=>toast("Copied"));});
  $("walletBtn").addEventListener("click", ()=>els.topupModal.classList.remove("hidden"));
  $("closeModalBtn").addEventListener("click", ()=>els.topupModal.classList.add("hidden"));
  $("logoutBtn").addEventListener("click", ()=>{showAuth();toast("Logged out");});
  els.phoneSearch.addEventListener("input", e=>{state.search=e.target.value;renderAll();});

  detectLocal();
  const sess=localStorage.getItem("otphub_session");
  if(sess){const u=getUsers().find(x=>x.id===sess);if(u)showApp(u);}
})();
