const root=document.documentElement;
const theme=document.getElementById("themeToggle");
const saved=localStorage.getItem("ap-theme");
if(saved) root.dataset.theme=saved;

function themeIcon(){
  if(theme) theme.textContent=root.dataset.theme==="light"?"☾":"☼";
}
themeIcon();

theme?.addEventListener("click",()=>{
  root.dataset.theme=root.dataset.theme==="light"?"dark":"light";
  localStorage.setItem("ap-theme",root.dataset.theme);
  themeIcon();
});

const progress=document.querySelector(".progress span");
const glow=document.querySelector(".cursor-glow");
const nav=document.querySelector(".nav");
const hero=document.querySelector(".hero");
const mobile=document.querySelector(".mobile-menu");
const menu=document.querySelector(".menu");
const navLinks=[...document.querySelectorAll(".desktop-nav a")];
let ticking=false;
let pageMax=1;
let navHidePoint=0;

const cacheScrollMetrics=()=>{
  const d=document.documentElement;
  pageMax=Math.max(1,d.scrollHeight-d.clientHeight);
  navHidePoint=hero
    ? Math.max(hero.offsetHeight*.55,window.innerHeight*.7)
    : window.innerHeight*.7;
};

const updateScrollUI=()=>{
  ticking=false;
  const y=window.scrollY;

  if(progress) progress.style.transform=`scaleX(${Math.min(1,y/pageMax)})`;

  if(nav && hero){
    const hidden=y>navHidePoint;
    nav.classList.toggle("nav-hidden",hidden);
    if(hidden) mobile?.classList.remove("open");
  }
};

const requestScrollUI=()=>{
  if(!ticking){
    ticking=true;
    requestAnimationFrame(updateScrollUI);
  }
};
window.addEventListener("scroll",requestScrollUI,{passive:true});
window.addEventListener("resize",()=>{
  cacheScrollMetrics();
  requestScrollUI();
},{passive:true});

window.addEventListener("load",()=>{
  cacheScrollMetrics();
  requestScrollUI();
},{once:true});

cacheScrollMetrics();
updateScrollUI();

/* Cursor glow only runs on real mouse/trackpad devices. */
const hasFinePointer=window.matchMedia("(pointer:fine)").matches;
if(hasFinePointer && glow){
  let glowX=0, glowY=0, glowTick=false;
  window.addEventListener("pointermove",e=>{
    glowX=e.clientX; glowY=e.clientY;
    if(!glowTick){
      glowTick=true;
      requestAnimationFrame(()=>{
        glow.style.transform=`translate3d(${glowX}px,${glowY}px,0) translate(-50%,-50%)`;
        glowTick=false;
      });
    }
  },{passive:true});
}else if(glow){
  glow.remove();
}

/* Reveal animations */
const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("in");
      revealObserver.unobserve(e.target);
    }
  });
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>revealObserver.observe(el));

/* Magnetic buttons only on mouse/trackpad. */
if(hasFinePointer){
  document.querySelectorAll(".magnetic").forEach(el=>{
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`;
    });
    el.addEventListener("pointerleave",()=>el.style.transform="");
  });
}

menu?.addEventListener("click",()=>mobile?.classList.toggle("open"));
mobile?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobile.classList.remove("open")));

document.getElementById("contactForm")?.addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  const subject=encodeURIComponent(`Portfolio enquiry — ${f.get("name")}${f.get("company")?" / "+f.get("company"):""}`);
  const body=encodeURIComponent(`Name: ${f.get("name")}\nEmail: ${f.get("email")}\nCompany / Organisation: ${f.get("company")||"Not provided"}\n\nMessage:\n${f.get("message")}`);
  document.getElementById("formStatus").textContent="Opening your email client…";
  window.location.href=`mailto:ayusmanpradhan1306@gmail.com?subject=${subject}&body=${body}`;
});

/* Navigation section highlighting */
const sections=["about","work","skills","contact"]
  .map(id=>document.getElementById(id))
  .filter(Boolean);

const sectionObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+entry.target.id));
  });
},{rootMargin:"-35% 0px -55% 0px",threshold:0});
sections.forEach(section=>sectionObserver.observe(section));

/* PocketPilot enters once when it reaches the viewport. */
const pocketPilot=document.querySelector(".project-main");
if(pocketPilot){
  const pocketObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        pocketPilot.classList.add("in");
        pocketObserver.unobserve(pocketPilot);
      }
    });
  },{threshold:.18});
  pocketObserver.observe(pocketPilot);
}
