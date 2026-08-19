document.addEventListener("DOMContentLoaded", () => {
  const LOCAL_CURRENCIES = [
    {code:"nigeria", name:"Nigeria", flag:"🇳🇬", currency:"NGN", symbol:"₦", price:1000, topups:[5000,10000,20000]},
    {code:"usa", name:"USA", flag:"🇺🇸", currency:"USD", symbol:"$", price:1, topups:[5,10,20]},
    {code:"uk", name:"UK", flag:"🇬🇧", currency:"GBP", symbol:"£", price:0.8, topups:[5,10,15]},
    {code:"canada", name:"Canada", flag:"🇨🇦", currency:"CAD", symbol:"C$", price:1.35, topups:[6,13,27]},
    {code:"ghana", name:"Ghana", flag:"🇬🇭", currency:"GHS", symbol:"₵", price:12, topups:[60,120,240]},
  ];

  // 50 COUNTRIES
  const PHONE_COUNTRIES = [
    {code:"usa", name:"USA", flag:"🇺🇸", prefix:"+1"},
    {code:"uk", name:"UK", flag:"🇬🇧", prefix:"+44"},
    {code:"canada", name:"Canada", flag:"🇨🇦", prefix:"+1"},
    {code:"nigeria", name:"Nigeria", flag:"🇳🇬", prefix:"+234"},
    {code:"ghana", name:"Ghana", flag:"🇬🇭", prefix:"+233"},
    {code:"kenya", name:"Kenya", flag:"🇰🇪", prefix:"+254"},
    {code:"southafrica", name:"South Africa", flag:"🇿🇦", prefix:"+27"},
    {code:"india", name:"India", flag:"🇮🇳", prefix:"+91"},
    {code:"germany", name:"Germany", flag:"🇩🇪", prefix:"+49"},
    {code:"france", name:"France", flag:"🇫🇷", prefix:"+33"},
    {code:"spain", name:"Spain", flag:"🇪🇸", prefix:"+34"},
    {code:"italy", name:"Italy", flag:"🇮🇹", prefix:"+39"},
    {code:"netherlands", name:"Netherlands", flag:"🇳🇱", prefix:"+31"},
    {code:"sweden", name:"Sweden", flag:"🇸🇪", prefix:"+46"},
    {code:"norway", name:"Norway", flag:"🇳🇴", prefix:"+47"},
    {code:"poland", name:"Poland", flag:"🇵🇱", prefix:"+48"},
    {code:"turkey", name:"Turkey", flag:"🇹🇷", prefix:"+90"},
    {code:"uae", name:"UAE", flag:"🇦🇪", prefix:"+971"},
    {code:"saudiarabia", name:"Saudi Arabia", flag:"🇸🇦", prefix:"+966"},
    {code:"egypt", name:"Egypt", flag:"🇪🇬", prefix:"+20"},
    {code:"morocco", name:"Morocco", flag:"🇲🇦", prefix:"+212"},
    {code:"australia", name:"Australia", flag:"🇦🇺", prefix:"+61"},
    {code:"brazil", name:"Brazil", flag:"🇧🇷", prefix:"+55"},
    {code:"mexico", name:"Mexico", flag:"🇲🇽", prefix:"+52"},
    {code:"argentina", name:"Argentina", flag:"🇦🇷", prefix:"+54"},
    {code:"colombia", name:"Colombia", flag:"🇨🇴", prefix:"+57"},
    {code:"chile", name:"Chile", flag:"🇨🇱", prefix:"+56"},
    {code:"peru", name:"Peru", flag:"🇵🇪", prefix:"+51"},
    {code:"portugal", name:"Portugal", flag:"🇵🇹", prefix:"+351"},
    {code:"belgium", name:"Belgium", flag:"🇧🇪", prefix:"+32"},
    {code:"switzerland", name:"Switzerland", flag:"🇨🇭", prefix:"+41"},
    {code:"ireland", name:"Ireland", flag:"🇮🇪", prefix:"+353"},
    {code:"newzealand", name:"New Zealand", flag:"🇳🇿", prefix:"+64"},
    {code:"indonesia", name:"Indonesia", flag:"🇮🇩", prefix:"+62"},
    {code:"philippines", name:"Philippines", flag:"🇵🇭", prefix:"+63"},
    {code:"malaysia", name:"Malaysia", flag:"🇲🇾", prefix:"+60"},
    {code:"thailand", name:"Thailand", flag:"🇹🇭", prefix:"+66"},
    {code:"vietnam", name:"Vietnam", flag:"🇻🇳", prefix:"+84"},
    {code:"japan", name:"Japan", flag:"🇯🇵", prefix:"+81"},
    {code:"southkorea", name:"South Korea", flag:"🇰🇷", prefix:"+82"},
    {code:"russia", name:"Russia", flag:"🇷🇺", prefix:"+7"},
    {code:"ukraine", name:"Ukraine", flag:"🇺🇦", prefix:"+380"},
    {code:"cameroon", name:"Cameroon", flag:"🇨🇲", prefix:"+237"},
    {code:"uganda", name:"Uganda", flag:"🇺🇬", prefix:"+256"},
    {code:"tanzania", name:"Tanzania", flag:"🇹🇿", prefix:"+255"},
    {code:"rwanda", name:"Rwanda", flag:"🇷🇼", prefix:"+250"},
    {code:"ethiopia", name:"Ethiopia", flag:"🇪🇹", prefix:"+251"},
    {code:"zambia", name:"Zambia", flag:"🇿🇲", prefix:"+260"},
    {code:"pakistan", name:"Pakistan", flag:"🇵🇰", prefix:"+92"},
    {code:"bangladesh", name:"Bangladesh", flag:"🇧🇩", prefix:"+880"},
  ];

  const SERVICES = [{id:"whatsapp",name:"WhatsApp",icon:"💬",color:"#25D366"},{id:"telegram",name:"Telegram",icon:"✈️",color:"#2AABEE"},{id:"facebook",name:"Facebook",icon:"📘",color:"#1877F2"},{id:"instagram",name:"Instagram",icon:"📸",color:"#E4405F"},{id:"tiktok",name:"TikTok",icon:"🎵",color:"#000"},{id:"google",name:"Google",icon:"🔍",color:"#DB4437"}];
  const $=id=>document.getElementById(id);
  const els={authScreen:$("authScreen"),app:$("app"),toasts:$("toasts"),tabLogin:$("tabLogin"),tabRegister:$("tabRegister"),loginForm:$("loginForm"),registerForm:$("registerForm"),phoneCountryRow:$("phoneCountryRow"),services:$("services"),activeOrder:$("activeOrder"),walletBalance:$("walletBalance"),heroPrice:$("heroPrice"),localBadge:$("localBadge"),servicesTitle:$("servicesTitle"),orderService:$("orderService"),timer:$("timer"),timerProgress:$("timerProgress"),phoneNumber:$("phoneNumber"),orderStatus:$("orderStatus"),otpBox:$("otpBox"),otpCode:$("otpCode"),waitingText:$("waitingText"),topupModal:$("topupModal"),modalCountry:$("modalCountry"),modalBalance:$("modalBalance"),topupOptions:$("topupOptions"),userEmail:$("userEmail"),phoneSearch:$("phoneSearch")};
  let local=LOCAL_CURRENCIES[0], selected=PHONE_COUNTRIES[0], currentUser=null, state={balance:10000,active:null,search:""}, timerInt=null;
  const toast=m=>{const d=document.createElement("div");d.className="toast";d.innerText=m;els.toasts.appendChild(d);setTimeout(()=>d.remove(),2500);};
  const money=a=> local.currency==="NGN"?`${local.symbol}${Number(a).toLocaleString()}`:`${local.symbol}${a}`;
  const getUsers=()=>JSON.parse(localStorage.getItem("otphub_users")||"[]");
  const saveUsers=u=>localStorage.setItem("otphub_users",JSON.stringify(u));
  function showApp(user){currentUser=user; localStorage.setItem("otphub_session",user.id); if(!user.balances){user.balances={}; LOCAL_CURRENCIES.forEach(c=>user.balances[c.code]=c.topups[1]);} state.balance=user.balances[local.code]; state.active=JSON.parse(localStorage.getItem(`otphub_active_${user.id}`)||"null"); els.authScreen.classList.add("hidden"); els.app.classList.remove("hidden"); els.userEmail.textContent=user.email; render(); startTimer();}
  function render(){
    els.walletBalance.textContent=money(state.balance); els.heroPrice.textContent=money(local.price); els.modalCountry.textContent=`${local.flag} ${local.currency}`; els.modalBalance.textContent=money(state.balance);
    els.servicesTitle.textContent=`${PHONE_COUNTRIES.length} Countries - ${money(local.price)} each • ${selected.flag} ${selected.name}`;
    els.phoneCountryRow.innerHTML=""; PHONE_COUNTRIES.filter(c=>c.name.toLowerCase().includes(state.search.toLowerCase())||c.prefix.includes(state.search)).forEach(c=>{
      const b=document.createElement("button"); b.className="country-chip"+(c.code===selected.code?" active":""); b.textContent=`${c.flag} ${c.name} ${c.prefix}`; b.onclick=()=>{selected=c; render();}; els.phoneCountryRow.appendChild(b);
    });
    els.services.innerHTML=""; SERVICES.forEach(s=>{
      const d=document.createElement("div"); d.className="service-card";
      d.innerHTML=`<div class="service-icon" style="background:${s.color}20">${s.icon}</div><div class="service-info"><div class="service-name">${s.name}</div><div class="service-meta">${selected.flag} ${selected.prefix}</div></div><div><div style="font-weight:800">${money(local.price)}</div><button data-id="${s.id}" class="buy-btn">Buy</button></div>`;
      els.services.appendChild(d);
    });
    els.topupOptions.innerHTML=""; local.topups.forEach((a,i)=>{const o=document.createElement("div"); o.className="topup-option"+(i===1?" popular":""); o.innerHTML=`<b>Add ${money(a)}</b><span>${Math.floor(a/local.price)} OTPs</span>`; o.onclick=()=>{state.balance+=a; const us=getUsers(); const idx=us.findIndex(u=>u.id===currentUser.id); us[idx].balances[local.code]=state.balance; saveUsers(us); render(); els.topupModal.classList.add("hidden"); toast("Funded");}; els.topupOptions.appendChild(o);});
    if(!state.active){els.activeOrder.classList.add("hidden");return;} els.activeOrder.classList.remove("hidden"); els.orderService.textContent=state.active.icon+" "+state.active.name; els.phoneNumber.textContent=state.active.phone; els.orderStatus.textContent=selected.name;
    if(state.active.otp){els.otpBox.classList.remove("hidden"); els.waitingText.classList.add("hidden"); els.otpCode.textContent=state.active.otp;}else{els.otpBox.classList.add("hidden"); els.waitingText.classList.remove("hidden");}
  }
  function startTimer(){clearInterval(timerInt); timerInt=setInterval(()=>{if(state.active){const r=Math.max(0,Math.floor((state.active.expiresAt-Date.now())/1000)); els.timer.textContent=`${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`; els.timerProgress.style.width=`${(r/900)*100}%`; if(r<=0){state.active=null; render();}}},1000);}
  els.tabLogin.onclick=()=>{els.tabLogin.classList.add("active");els.tabRegister.classList.remove("active");els.loginForm.classList.remove("hidden");els.registerForm.classList.add("hidden");};
  els.tabRegister.onclick=()=>{els.tabRegister.classList.add("active");els.tabLogin.classList.remove("active");els.registerForm.classList.remove("hidden");els.loginForm.classList.add("hidden");};
  els.registerForm.onsubmit=e=>{e.preventDefault(); const email=$("regEmail").value.trim().toLowerCase(), p=$("regPass").value, p2=$("regPass2").value; if(p!==p2) return toast("Passwords don't match"); if(p.length<6) return toast("Min 6 chars"); const users=getUsers(); if(users.find(u=>u.email===email)) return toast("Email exists"); const nu={id:Date.now().toString(),email,password:p,balances:{}}; LOCAL_CURRENCIES.forEach(c=>nu.balances[c.code]=c.topups[1]); users.push(nu); saveUsers(users); toast("Account created!"); showApp(nu);};
  els.loginForm.onsubmit=e=>{e.preventDefault(); const email=$("loginEmail").value.trim().toLowerCase(), p=$("loginPass").value; const u=getUsers().find(x=>x.email===email && x.password===p); if(!u) return toast("Wrong email or password"); toast("Logged in!"); showApp(u);};
  els.services.onclick=e=>{const b=e.target.closest(".buy-btn"); if(!b) return; if(state.balance<local.price){els.topupModal.classList.remove("hidden"); return toast("Low balance");} state.balance-=local.price; const phone=selected.prefix+" "+Math.floor(7000000000+Math.random()*999999999); state.active={id:Date.now().toString(),name:b.dataset.id,icon:"💬",phone,otp:null,expiresAt:Date.now()+900000}; const us=getUsers(); const i=us.findIndex(u=>u.id===currentUser.id); us[i].balances[local.code]=state.balance; saveUsers(us); localStorage.setItem(`otphub_active_${currentUser.id}`,JSON.stringify(state.active)); render(); startTimer(); setTimeout(()=>{state.active.otp=Math.floor(100000+Math.random()*900000).toString(); localStorage.setItem(`otphub_active_${currentUser.id}`,JSON.stringify(state.active)); render(); toast("OTP Received!");},4000);};
  $("walletBtn").onclick=()=>els.topupModal.classList.remove("hidden");
  $("closeModalBtn").onclick=()=>els.topupModal.classList.add("hidden");
  $("logoutBtn").onclick=()=>{localStorage.removeItem("otphub_session"); location.reload();};
  els.phoneSearch.oninput=e=>{state.search=e.target.value; render();};
  els.otpBox.onclick=()=>{if(state.active?.otp){navigator.clipboard.writeText(state.active.otp); toast("Copied "+state.active.otp);}};
  const sess=localStorage.getItem("otphub_session"); if(sess){const u=getUsers().find(x=>x.id===sess); if(u) showApp(u);} render();
});
