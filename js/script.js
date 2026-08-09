const root=document.documentElement;
const theme=document.getElementById("themeToggle");
const saved=localStorage.getItem("ap-theme");
if(saved) root.dataset.theme=saved;
function themeIcon(){theme.textContent=root.dataset.theme==="light"?"☾":"☼"}
themeIcon();
theme?.addEventListener("click",()=>{root.dataset.theme=root.dataset.theme==="light"?"dark":"light";localStorage.setItem("ap-theme",root.dataset.theme);themeIcon()});

const progress=document.querySelector(".progress span");
window.addEventListener("scroll",()=>{const d=document.documentElement;const max=d.scrollHeight-d.clientHeight;progress.style.width=(max?d.scrollTop/max*100:0)+"%"},{passive:true});

const glow=document.querySelector(".cursor-glow");
window.addEventListener("pointermove",e=>{if(glow){glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px"}},{passive:true});

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("in")}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>revealObserver.observe(el));

document.querySelectorAll(".magnetic").forEach(el=>{
  el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`});
  el.addEventListener("pointerleave",()=>el.style.transform="");
});

const menu=document.querySelector(".menu"), mobile=document.querySelector(".mobile-menu");
menu?.addEventListener("click",()=>mobile.classList.toggle("open"));
mobile?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobile.classList.remove("open")));

document.getElementById("contactForm")?.addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  const subject=encodeURIComponent(`Portfolio enquiry — ${f.get("name")}${f.get("company")?" / "+f.get("company"):""}`);
  const body=encodeURIComponent(`Name: ${f.get("name")}\nEmail: ${f.get("email")}\nCompany / Organisation: ${f.get("company")||"Not provided"}\n\nMessage:\n${f.get("message")}`);
  document.getElementById("formStatus").textContent="Opening your email client…";
  window.location.href=`mailto:ayusmanpradhan1306@gmail.com?subject=${subject}&body=${body}`;
});


// Navigation stays pinned and reflects the section currently in view.
const nav=document.querySelector('.nav');
const navLinks=[...document.querySelectorAll('.desktop-nav a')];
const sections=['about','work','skills','contact'].map(id=>document.getElementById(id)).filter(Boolean);
const hero=document.querySelector('.hero');
const setNavState=()=>{if(!nav||!hero)return;const hidden=window.scrollY>Math.max(hero.offsetHeight*.55,window.innerHeight*.7);nav.classList.toggle('nav-hidden',hidden);if(hidden)mobile?.classList.remove('open')};
setNavState();
window.addEventListener('scroll',setNavState,{passive:true});
window.addEventListener('resize',setNavState);
const sectionObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));
  });
},{rootMargin:'-35% 0px -55% 0px',threshold:0});
sections.forEach(section=>sectionObserver.observe(section));

// Slight parallax on the hero typography keeps the first screen feeling alive without hurting readability.
const heroDisplay=document.querySelector('.display');
window.addEventListener('scroll',()=>{
  if(!heroDisplay)return;
  const y=Math.min(window.scrollY*.08,26);
  heroDisplay.style.transform=`translate3d(0,${y}px,0)`;
},{passive:true});


/* =========================================================
   POCKETPILOT PRODUCT SCROLL MOTION
   ========================================================= */
const pocketPilot = document.querySelector(".project-main");

if (pocketPilot) {
  const pocketObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        pocketPilot.classList.add("in");
        pocketObserver.unobserve(pocketPilot);
      }
    });
  }, { threshold: 0.22 });

  pocketObserver.observe(pocketPilot);
}
