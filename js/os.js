/* =========================================================
   AYUSMAN_OS — boot sequence + tiny window manager
   ========================================================= */
(function(){
  "use strict";

  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seenBoot=sessionStorage.getItem("ap-os-boot-seen");

  /* ---------------- BOOT SEQUENCE: white greeting -> terminal -> hero ---------------- */
  const boot=document.getElementById("boot");
  const greetScreen=document.getElementById("greetScreen");
  const bootTerminal=document.getElementById("bootTerminal");
  const bootLog=document.getElementById("bootLog");

  const greetWords=["Hello","नमस्ते","こんにちは","Bonjour","안녕하세요","¡Hola!"];
  const bootLines=[
    ["> AYUSMAN_OS v2.2 — session start",false],
    ["> checking hardware… OK",true],
    ["> mounting /projects /skills /credentials /contact",true],
    ["> starting window manager…",true],
    ["> welcome back, guest.",false],
  ];

  /* ---------------- HERO NAME (hero view) ---------------- */
  const heroView=document.getElementById("heroView");
  const heroName=document.getElementById("heroName");
  function buildHeroName(){
    if(!heroName) return;
    const words=["Ayusman","Pradhan"];
    let i=0;
    words.forEach((word,wi)=>{
      const line=document.createElement("div");
      line.className="hero-line";
      [...word].forEach(ch=>{
        const span=document.createElement("span");
        span.className="hl"+(wi===1?" hl-accent":"");
        span.style.setProperty("--i",i);
        span.textContent=ch;
        line.appendChild(span);
        i++;
      });
      heroName.appendChild(line);
    });
  }
  buildHeroName();
  function triggerHeroIn(){
    heroView?.classList.add("hero-in");
    // once the CSS entrance animation finishes, cancel it so it doesn't
    // keep overriding any later inline style changes via its forwards fill
    const letters=heroName?heroName.querySelectorAll(".hl"):[];
    const settle=letters.length*38+900;
    setTimeout(()=>{
      letters.forEach(el=>{ el.style.animation="none"; el.style.opacity="1"; el.style.transform="none"; });
    },settle);
  }

  function runBoot(){
    if(!boot){ triggerHeroIn(); return; }
    if(seenBoot || reduceMotion){
      boot.classList.add("boot-hidden");
      triggerHeroIn();
      return;
    }
    document.documentElement.style.overflow="hidden";
    let skipped=false,timer=null;

    const finishAll=()=>{
      boot.classList.add("boot-exit");
      sessionStorage.setItem("ap-os-boot-seen","1");
      document.documentElement.style.overflow="";
      triggerHeroIn();
      setTimeout(()=>boot.classList.add("boot-hidden"),600);
    };

    const runTerminal=()=>{
      boot.classList.add("boot-phase-terminal");
      bootTerminal.classList.add("show");
      let idx=0;
      const step=()=>{
        if(skipped) return;
        if(idx>=bootLines.length){ timer=setTimeout(finishAll,450); return; }
        const [text,dim]=bootLines[idx];
        const line=document.createElement("div");
        line.className="boot-line"+(dim?" dim":"");
        line.textContent=text;
        bootLog.appendChild(line);
        idx++;
        timer=setTimeout(step,220);
      };
      step();
    };

    const runGreeting=()=>{
      const wordEl=greetScreen.querySelector(".greet-word");
      let wi=0;
      const cycleWord=()=>{
        if(skipped) return;
        if(wi>=greetWords.length){ advanceToTerminal(); return; }
        wordEl.textContent=greetWords[wi];
        wordEl.classList.remove("pop"); void wordEl.offsetWidth; wordEl.classList.add("pop");
        wi++;
        timer=setTimeout(cycleWord,460);
      };
      cycleWord();
    };

    const advanceToTerminal=()=>{
      if(skipped) return;
      clearTimeout(timer);
      greetScreen.classList.add("greet-exit");
      setTimeout(()=>{ greetScreen.classList.add("greet-hidden"); runTerminal(); },400);
    };

    const skip=()=>{
      if(skipped) return;
      skipped=true;
      clearTimeout(timer);
      finishAll();
    };

    boot.querySelector(".boot-skip")?.addEventListener("click",skip);
    window.addEventListener("keydown",skip,{once:true});
    runGreeting();
  }
  runBoot();

  /* ---------------- AMBIENT BACKDROP ---------------- */
  function buildAmbient(containerId,withClouds){
    const ambient=document.getElementById(containerId);
    if(!ambient||reduceMotion) return;
    const starLayer=document.createElement("div");
    for(let i=0;i<(withClouds?26:40);i++){
      const s=document.createElement("span");
      s.className="ambient-star";
      s.style.left=Math.random()*100+"%";
      s.style.top=Math.random()*100+"%";
      s.style.setProperty("--tw",(0.4+Math.random()*0.6).toFixed(2));
      s.style.animationDelay=(-Math.random()*4).toFixed(2)+"s";
      s.style.animationDuration=(2.6+Math.random()*3).toFixed(2)+"s";
      starLayer.appendChild(s);
    }
    ambient.appendChild(starLayer);
    if(withClouds){
      ["cloud-a","cloud-b","cloud-c"].forEach(c=>{
        const d=document.createElement("div");
        d.className="ambient-cloud "+c;
        ambient.appendChild(d);
      });
    }
  }
  buildAmbient("ambient",true);

  /* ---------------- ENTER OS: hero -> desktop, click-triggered (no scroll) ---------------- */
  const osView=document.getElementById("osView");
  const enterOsBtn=document.getElementById("enterOsBtn");
  let osOpened=false;
  function enterOs(){
    if(osOpened) return;
    osOpened=true;
    heroView?.classList.add("hero-leaving");
    osView?.classList.add("os-active");
    setTimeout(()=>{ heroView?.classList.add("hero-gone"); },650);
    openDefaults();
  }
  enterOsBtn?.addEventListener("click",enterOs);

  /* ---------------- CLOCK ---------------- */
  const clockEl=document.getElementById("mbClock");
  function tickClock(){
    if(!clockEl) return;
    const d=new Date();
    clockEl.textContent=d.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})+" · "+
      d.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});
  }
  tickClock();
  setInterval(tickClock,15000);

  /* ---------------- THEME (light desktop default / dark desktop toggle) ---------------- */
  const themeBtn=document.getElementById("mbTheme");
  const savedOsTheme=localStorage.getItem("ap-os-theme"); // "dark" or "" (light, default)
  if(savedOsTheme==="dark") document.documentElement.dataset.osTheme="dark";
  function themeGlyph(){ if(themeBtn) themeBtn.textContent=document.documentElement.dataset.osTheme==="dark"?"☼":"☾"; }
  themeGlyph();
  themeBtn?.addEventListener("click",()=>{
    const goingDark=document.documentElement.dataset.osTheme!=="dark";
    if(goingDark) document.documentElement.dataset.osTheme="dark";
    else delete document.documentElement.dataset.osTheme;
    localStorage.setItem("ap-os-theme",goingDark?"dark":"");
    themeGlyph();
  });

  /* ---------------- BRAND NAME LETTER WAVE ---------------- */
  (function wrapLogoLetters(){
    const el=document.querySelector("#menubar .mb-logo .mb-text");
    if(!el) return;
    const text=el.textContent;
    el.innerHTML="";
    [...text].forEach((ch,i)=>{
      const b=document.createElement("b");
      b.style.setProperty("--i",i);
      b.textContent=ch===" "?"\u00A0":ch;
      el.appendChild(b);
    });
  })();

  /* ---------------- DRAGGABLE DESKTOP ICONS ---------------- */
  document.querySelectorAll(".desk-icon").forEach(icon=>{
    let startX,startY,moved=false,dragging=false;
    icon.addEventListener("pointerdown",e=>{
      if(isMobile()) return;
      dragging=true;moved=false;
      startX=e.clientX-icon.getBoundingClientRect().left;
      startY=e.clientY-icon.getBoundingClientRect().top;
      icon.setPointerCapture(e.pointerId);
    });
    icon.addEventListener("pointermove",e=>{
      if(!dragging) return;
      moved=true;
      icon.classList.add("dragging");
      icon.style.left=(e.clientX-startX)+"px";
      icon.style.top=(e.clientY-startY)+"px";
      icon.style.right="auto";
    });
    icon.addEventListener("pointerup",e=>{
      dragging=false;
      icon.classList.remove("dragging");
      try{icon.releasePointerCapture(e.pointerId);}catch(_){}
      if(moved){
        // dragged — swallow the click that follows so it doesn't also open the window
        const swallow=ce=>{ ce.stopPropagation(); ce.preventDefault(); icon.removeEventListener("click",swallow,true); };
        icon.addEventListener("click",swallow,true);
      }
    });
  });

  /* ---------------- WINDOW MANAGER ---------------- */
  const desktop=document.getElementById("desktop");
  let zTop=10;
  const openWindows={};

  function isMobile(){ return window.matchMedia("(max-width:700px)").matches; }

  function focusWindow(win){
    document.querySelectorAll(".win.focused").forEach(w=>w.classList.remove("focused"));
    zTop+=1;
    win.style.zIndex=zTop;
    win.classList.add("focused");
  }

  function positionWindow(win,fromEl){
    const count=Object.keys(openWindows).length;
    const baseX=80+ (count*34)%320;
    const baseY=54+ (count*28)%220;
    win.style.left=baseX+"px";
    win.style.top=baseY+"px";
  }

  function makeDraggable(win){
    const bar=win.querySelector(".win-bar");
    let dragging=false,offX=0,offY=0;
    bar.addEventListener("pointerdown",e=>{
      if(isMobile()||win.classList.contains("maximized")) return;
      if(e.target.closest(".win-dots")) return;
      dragging=true;
      const r=win.getBoundingClientRect();
      offX=e.clientX-r.left; offY=e.clientY-r.top;
      focusWindow(win);
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener("pointermove",e=>{
      if(!dragging) return;
      win.style.left=Math.max(4,e.clientX-offX)+"px";
      win.style.top=Math.max(4,e.clientY-offY-38)+"px";
    });
    bar.addEventListener("pointerup",e=>{ dragging=false; try{bar.releasePointerCapture(e.pointerId);}catch(_){} });
    bar.addEventListener("dblclick",e=>{ if(!e.target.closest(".win-dots")) toggleMaximize(win); });
  }

  function toggleMaximize(win){
    win.classList.toggle("maximized");
  }

  function closeWindow(id){
    const win=openWindows[id];
    if(!win) return;
    win.classList.add("closing");
    document.querySelectorAll(`[data-open="${id}"]`).forEach(el=>el.classList.remove("running"));
    setTimeout(()=>{ win.remove(); delete openWindows[id]; },260);
  }

  function openWindow(id){
    if(openWindows[id]){ focusWindow(openWindows[id]); bounceDock(id); return; }
    const tpl=document.getElementById("tpl-"+id);
    if(!tpl) return;
    bounceDock(id);
    const win=document.createElement("div");
    win.className="win";
    win.dataset.id=id;
    const titleMap={
      about:"About.txt", pocketpilot:"PocketPilot.app", voyara:"Voyara.app", aerocast:"Aerocast.app",
      skills:"Skills.sys", credentials:"Credentials.cert", resume:"Resume.pdf", contact:"Contact.app",
      folder:"Ayusman_Pradhan/", ai:"Ask_AI.app"
    };
    win.innerHTML=`
      <div class="win-bar">
        <div class="win-dots">
          <button class="wd-close" title="Close" aria-label="Close"></button>
          <button class="wd-min" title="Minimize" aria-label="Minimize"></button>
          <button class="wd-max" title="Maximize" aria-label="Maximize"></button>
        </div>
        <div class="win-title">${titleMap[id]||id}</div>
      </div>
      <div class="win-body"></div>`;
    win.querySelector(".win-body").appendChild(tpl.content.cloneNode(true));
    desktop.appendChild(win);
    positionWindow(win);
    if(isMobile()) win.classList.add("maximized");
    else{
      win.style.width= (win.dataset.id==="skills"||win.dataset.id==="credentials")?"460px":
                        (win.dataset.id==="folder")?"420px":
                        (win.dataset.id==="ai")?"460px":"520px";
    }
    makeDraggable(win);
    win.querySelector(".wd-close").addEventListener("click",()=>closeWindow(id));
    win.querySelector(".wd-min").addEventListener("click",()=>closeWindow(id));
    win.querySelector(".wd-max").addEventListener("click",()=>toggleMaximize(win));
    win.addEventListener("pointerdown",()=>focusWindow(win));
    focusWindow(win);
    openWindows[id]=win;
    document.querySelectorAll(`[data-open="${id}"]`).forEach(el=>el.classList.add("running"));
    if(id==="ai") initAIApp(win);
    if(id==="contact") initContactForm(win);
  }

  function bounceDock(id){
    const els=document.querySelectorAll(`[data-open="${id}"]`);
    if(!els.length) return;
    els.forEach(el=>{ el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce"); });
  }

  document.addEventListener("click",e=>{
    const trigger=e.target.closest("[data-open]");
    if(trigger) openWindow(trigger.getAttribute("data-open"));
  });

  /* Open About + PocketPilot by default once the OS view opens, so the desktop never looks empty */
  const openDefaults=()=>{
    openWindow("about");
    setTimeout(()=>openWindow("pocketpilot"),260);
  };

  /* ---------------- CONTACT FORM (mailto) — bound per-window since it's cloned from a <template> ---------------- */
  function initContactForm(win){
    const form=win.querySelector("#osContactForm");
    const status=win.querySelector("#osFormStatus");
    form?.addEventListener("submit",e=>{
      e.preventDefault();
      const f=new FormData(e.currentTarget);
      const subject=encodeURIComponent(`Portfolio enquiry — ${f.get("name")}`);
      const body=encodeURIComponent(`Name: ${f.get("name")}\nEmail: ${f.get("email")}\n\nMessage:\n${f.get("message")}`);
      if(status) status.textContent="Opening your email client…";
      window.location.href=`mailto:ayusmanpradhan1306@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  /* ---------------- ASK_AI — small local rule-based assistant ---------------- */
  const AI_RULES=[
    { kws:["skill","tech","stack","language","know","use"],
      a:"Ayusman works mainly with React, React Native, Django and Python for backend logic, plus JavaScript, HTML5/CSS3 across the stack. Day-to-day tools are Git/GitHub, REST APIs and Vercel for deployment." },
    { kws:["pocketpilot","pocket pilot"],
      a:"PocketPilot is Ayusman's Android app for personal finance — it tracks expenses and lets you fire off UPI payments straight from the app, auto-sorting spending by source and category. Built with React Native + Expo." },
    { kws:["voyara"],
      a:"Voyara is a React travel-explorer app — curated journeys, a recommendation score, multi-currency filtering and motion-led browsing. Built with React, Vite and Framer Motion." },
    { kws:["aerocast","weather"],
      a:"Aerocast is a fast, lightweight weather app built in vanilla JavaScript, hosted on GitHub Pages." },
    { kws:["contact","email","reach","hire","linkedin","github"],
      a:"Best way in is the Contact.app window — it opens a pre-filled email. He's also on GitHub (TechNerd13-hub) and LinkedIn — links are in Contact.app too." },
    { kws:["intern","opportunit","open to","hiring","available","job"],
      a:"Yes — Ayusman is currently open to full-stack and mobile-development internship opportunities." },
    { kws:["certif","credential","award","achievement","debate"],
      a:"Certifications: Generative AI Mastermind (OutSkill) and Claude Code in Action (Anthropic). Achievements: District-Level Debate Champion and State-Level Debate Award Winner — see Credentials.cert." },
    { kws:["educat","college","university","study","student","degree","cse"],
      a:"He's a Computer Science Engineering student at ITER, SOA University, Bhubaneswar." },
    { kws:["resume","cv"],
      a:"Grab it from Resume.pdf on the desktop or in the dock — opens straight in a new tab." },
    { kws:["who are you","what are you","real ai","gpt","llm","model"],
      a:"I'm not a real AI model — just a small local script matching keywords, styled to fit the OS. No data leaves this page." },
    { kws:["hi","hello","hey","namaste","yo"],
      a:"Hey! Ask me about Ayusman's skills, his projects (PocketPilot / Voyara / Aerocast), certifications, or how to contact him." },
  ];
  function aiRespond(q){
    const s=q.toLowerCase();
    for(const rule of AI_RULES){ if(rule.kws.some(k=>s.includes(k))) return rule.a; }
    return "I don't have a canned answer for that — try asking about skills, a specific project, certifications, or how to get in touch. Or just email Ayusman directly via Contact.app.";
  }
  function initAIApp(win){
    const log=win.querySelector("#aiLog");
    const form=win.querySelector("#aiForm");
    const input=win.querySelector("#aiInput");
    if(!log||!form||!input) return;

    function addMsg(role,text,typewriter){
      const row=document.createElement("div");
      row.className="ai-msg "+role;
      row.innerHTML=`<div class="ai-avatar">${role==="user"?"YOU":"AI"}</div><div class="ai-bubble"></div>`;
      log.appendChild(row);
      log.scrollTop=log.scrollHeight;
      const bubble=row.querySelector(".ai-bubble");
      if(!typewriter){ bubble.textContent=text; return; }
      let i=0;
      const tick=()=>{
        bubble.textContent=text.slice(0,i);
        log.scrollTop=log.scrollHeight;
        i++;
        if(i<=text.length) requestAnimationFrame(()=>setTimeout(tick,14));
      };
      tick();
    }
    function addTyping(){
      const row=document.createElement("div");
      row.className="ai-msg bot";
      row.innerHTML=`<div class="ai-avatar">AI</div><div class="ai-bubble ai-typing"><span></span><span></span><span></span></div>`;
      log.appendChild(row);
      log.scrollTop=log.scrollHeight;
      return row;
    }
    function ask(q){
      if(!q.trim()) return;
      addMsg("user",q);
      input.value="";
      const typingRow=addTyping();
      setTimeout(()=>{
        typingRow.remove();
        addMsg("bot",aiRespond(q),true);
      },500+Math.random()*400);
    }
    form.addEventListener("submit",e=>{ e.preventDefault(); ask(input.value); });
    win.querySelectorAll(".ai-chip").forEach(chip=>{
      chip.addEventListener("click",()=>ask(chip.textContent));
    });
  }
})();
