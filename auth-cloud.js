(() => {
  const SUPABASE_URL = "https://edlysmrqqnxvvdnizrpz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_uD-cWg7KAxCTXVIZ5OB8wA_OFAC-O_S";
  const SESSION_KEY = "koreanCloudSessionV1";
  const DEVICE_KEY = "koreanCloudDeviceV1";
  const EXCLUDED = new Set([SESSION_KEY, DEVICE_KEY]);
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);
  let session = readJSON(SESSION_KEY, null);
  let syncTimer = null;
  let syncing = false;

  function readJSON(key, fallback){ try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
  function writeJSON(key, value){ originalSetItem(key, JSON.stringify(value)); }
  function esc(s){ return String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function apiHeaders(token){ return {"apikey":SUPABASE_KEY,"Content-Type":"application/json",...(token?{"Authorization":`Bearer ${token}`}:{})}; }
  function isAppKey(k){ return !EXCLUDED.has(k) && !k.startsWith("sb-") && !k.startsWith("supabase"); }

  function snapshot(){
    const out={};
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i); if(!k || !isAppKey(k)) continue;
      try { out[k]=JSON.parse(localStorage.getItem(k)); }
      catch { out[k]=localStorage.getItem(k); }
    }
    return out;
  }

  function restore(data){
    if(!data || typeof data!=="object") return;
    Object.entries(data).forEach(([k,v])=>{ if(isAppKey(k)) originalSetItem(k, typeof v==="string"?v:JSON.stringify(v)); });
  }

  async function authFetch(path, options={}){
    const r=await fetch(SUPABASE_URL+path,{...options,headers:{...apiHeaders(options.token),...(options.headers||{})}});
    const text=await r.text(); let data={}; try{data=text?JSON.parse(text):{}}catch{data={message:text}};
    if(!r.ok) throw new Error(data.msg||data.message||data.error_description||data.error||`Request failed (${r.status})`);
    return data;
  }

  function saveSession(data){
    const expiresAt = data.expires_at || (data.expires_in ? Math.floor(Date.now()/1000)+data.expires_in : session?.expires_at);
    session={access_token:data.access_token,refresh_token:data.refresh_token||session?.refresh_token,expires_at:expiresAt,user:data.user||session?.user};
    writeJSON(SESSION_KEY,session); renderAccount();
  }

  async function ensureSession(){
    if(!session?.access_token) return null;
    const now=Math.floor(Date.now()/1000);
    if(session.expires_at && session.expires_at-now>90) return session;
    if(!session.refresh_token){ logoutLocal(); return null; }
    try{
      const data=await authFetch("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:JSON.stringify({refresh_token:session.refresh_token})});
      saveSession(data); return session;
    }catch(e){ logoutLocal(); return null; }
  }

  async function signUp(email,password){
    return authFetch("/auth/v1/signup",{method:"POST",body:JSON.stringify({email,password,data:{app:"korean-study"}})});
  }
  async function signIn(email,password){
    const data=await authFetch("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email,password})});
    saveSession(data); await initialCloudSync(); return data;
  }
  async function signOut(){
    const s=await ensureSession();
    if(s) try{await authFetch("/auth/v1/logout",{method:"POST",token:s.access_token,body:"{}"});}catch{}
    logoutLocal();
  }
  function logoutLocal(){ session=null; originalRemoveItem(SESSION_KEY); renderAccount(); }

  async function getCloudRow(){
    const s=await ensureSession(); if(!s?.user?.id) return null;
    const q=`/rest/v1/user_progress?select=progress,display_name,updated_at&user_id=eq.${encodeURIComponent(s.user.id)}&limit=1`;
    const rows=await authFetch(q,{method:"GET",token:s.access_token,headers:{"Accept":"application/json"}});
    return rows?.[0]||null;
  }

  async function uploadCloud(showStatus=false){
    const s=await ensureSession(); if(!s?.user?.id || syncing) return;
    syncing=true; setSyncStatus(showStatus?"Saving…":"Syncing…");
    try{
      const payload={user_id:s.user.id,display_name:s.user.email?.split("@")[0]||"Learner",progress:snapshot(),updated_at:new Date().toISOString()};
      await authFetch("/rest/v1/user_progress?on_conflict=user_id",{method:"POST",token:s.access_token,headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(payload)});
      setSyncStatus("Synced ✓");
      writeJSON(DEVICE_KEY,{user_id:s.user.id,last_sync:Date.now()});
    }catch(e){setSyncStatus("Sync error");console.error(e);}finally{syncing=false;}
  }

  async function downloadCloud(){
    const row=await getCloudRow();
    if(row?.progress && Object.keys(row.progress).length){ restore(row.progress); writeJSON(DEVICE_KEY,{user_id:session.user.id,last_sync:Date.now()}); return true; }
    return false;
  }

  async function initialCloudSync(){
    const s=await ensureSession(); if(!s?.user?.id)return;
    const device=readJSON(DEVICE_KEY,null);
    const row=await getCloudRow();
    if(row?.progress && Object.keys(row.progress).length){
      if(!device || device.user_id!==s.user.id){ restore(row.progress); writeJSON(DEVICE_KEY,{user_id:s.user.id,last_sync:Date.now()}); setSyncStatus("Cloud progress loaded ✓"); setTimeout(()=>location.reload(),500); }
      else { await uploadCloud(); }
    }else{
      await uploadCloud(true);
    }
  }

  function scheduleSync(){
    if(!session?.access_token) return;
    clearTimeout(syncTimer); syncTimer=setTimeout(()=>uploadCloud(false),1200);
  }

  localStorage.setItem=function(k,v){ originalSetItem(k,v); if(isAppKey(k)) scheduleSync(); };
  localStorage.removeItem=function(k){ originalRemoveItem(k); if(isAppKey(k)) scheduleSync(); };

  const style=document.createElement("style");
  style.textContent=`
    .account-wrap{display:grid;gap:14px}.account-card{border:1px solid rgba(255,255,255,.9);background:linear-gradient(145deg,rgba(255,255,255,.8),rgba(247,233,238,.68));border-radius:22px;padding:22px;box-shadow:var(--small-shadow)}
    .account-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.account-card h3{margin:0 0 10px;color:#654b55}.account-card p{color:var(--muted);line-height:1.55}.auth-fields{display:grid;gap:10px;margin-top:14px}.auth-fields input{min-height:48px;border:1px solid var(--border);border-radius:14px;background:rgba(255,255,255,.72);padding:0 14px;color:var(--text);outline:none}.auth-fields input:focus{border-color:#dca7bb}.auth-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}.auth-btn{min-height:44px;border:1px solid var(--border);border-radius:999px;background:linear-gradient(145deg,#fffafd,#efd0db);padding:0 16px;color:var(--text);font-weight:650}.auth-btn.secondary{background:rgba(255,255,255,.5)}.account-email{font-size:18px;font-weight:700;color:#654b55}.sync-status{color:#9a7080;font-size:13px;margin-top:7px}.auth-message{min-height:20px;color:#9a7080;font-size:14px;margin-top:9px}.cloud-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(205,153,173,.3);border-radius:999px;padding:5px 9px;background:rgba(255,255,255,.6);font-size:12px;color:#8d6877}
    @media(max-width:760px){.account-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function addAccountTab(){
    const nav=document.querySelector(".tabs"); if(!nav)return;
    if(!nav.querySelector('[data-tab="accountSection"]')){
      const b=document.createElement("button"); b.className="tab"; b.dataset.tab="accountSection"; b.textContent="Account"; nav.appendChild(b);
      b.onclick=()=>{ if(typeof activateTab==="function") activateTab("accountSection"); renderAccount(); };
    }
    if(!document.getElementById("accountSection")){
      const s=document.createElement("section"); s.className="section"; s.id="accountSection"; document.querySelector("main.app").appendChild(s);
    }
  }

  function setSyncStatus(text){ const el=document.getElementById("cloudSyncStatus"); if(el)el.textContent=text; }
  function msg(text){ const el=document.getElementById("authMessage"); if(el)el.textContent=text||""; }

  function renderAccount(){
    const sec=document.getElementById("accountSection"); if(!sec)return;
    if(session?.user){
      sec.innerHTML=`<div class="section-head"><h2>Account</h2><p>Your Korean progress is saved to your private cloud profile.</p></div><div class="account-wrap"><div class="account-card"><span class="cloud-badge">☁ Cloud sync on</span><div class="account-email" style="margin-top:12px">${esc(session.user.email||"Signed in")}</div><div id="cloudSyncStatus" class="sync-status">Synced across devices</div><div class="auth-actions"><button class="auth-btn" id="syncNowBtn">Sync now</button><button class="auth-btn secondary" id="loadCloudBtn">Load cloud copy</button><button class="auth-btn secondary" id="signOutBtn">Sign out</button></div><div class="auth-message" id="authMessage"></div></div><div class="account-grid"><div class="account-card"><h3>What is synced</h3><p>Level test, My Plan, learned words, mistakes, favorites, decks, notes, streak, statistics, daily activity, SRS state and app preferences.</p></div><div class="account-card"><h3>Privacy</h3><p>Each account can access only its own progress row. Row Level Security is enabled in the database.</p></div></div></div>`;
      document.getElementById("syncNowBtn").onclick=()=>uploadCloud(true);
      document.getElementById("loadCloudBtn").onclick=async()=>{msg("Loading cloud copy…");const ok=await downloadCloud();if(ok){msg("Loaded. Refreshing…");setTimeout(()=>location.reload(),400)}else msg("No cloud copy found yet.");};
      document.getElementById("signOutBtn").onclick=signOut;
    }else{
      sec.innerHTML=`<div class="section-head"><h2>Account</h2><p>Create an account to keep your progress safe and sync it between devices.</p></div><div class="account-grid"><div class="account-card"><h3>Sign in</h3><div class="auth-fields"><input id="loginEmail" type="email" autocomplete="email" placeholder="Email"><input id="loginPassword" type="password" autocomplete="current-password" placeholder="Password"></div><div class="auth-actions"><button class="auth-btn" id="loginBtn">Log in</button></div><div class="auth-message" id="authMessage"></div></div><div class="account-card"><h3>Create account</h3><p>Your current device progress will become the first cloud copy after your first successful login.</p><div class="auth-fields"><input id="signupEmail" type="email" autocomplete="email" placeholder="Email"><input id="signupPassword" type="password" autocomplete="new-password" placeholder="Password (6+ characters)"></div><div class="auth-actions"><button class="auth-btn" id="signupBtn">Sign up</button></div><div class="auth-message" id="signupMessage"></div></div></div>`;
      document.getElementById("loginBtn").onclick=async()=>{const email=document.getElementById("loginEmail").value.trim(),password=document.getElementById("loginPassword").value;msg("Signing in…");try{await signIn(email,password);msg("Signed in ✓");renderAccount()}catch(e){msg(e.message)}};
      document.getElementById("signupBtn").onclick=async()=>{const email=document.getElementById("signupEmail").value.trim(),password=document.getElementById("signupPassword").value,el=document.getElementById("signupMessage");el.textContent="Creating account…";try{const data=await signUp(email,password);if(data.session||data.access_token){saveSession(data.session||data);await initialCloudSync();el.textContent="Account created ✓";renderAccount()}else{el.textContent="Account created. Check your email to confirm it, then come back and log in."}}catch(e){el.textContent=e.message}};
    }
  }

  async function init(){
    addAccountTab();
    if(session?.access_token){ await ensureSession(); }
    renderAccount();
    if(session?.access_token) setTimeout(()=>initialCloudSync(),700);
  }
  setTimeout(init,500);
})();
