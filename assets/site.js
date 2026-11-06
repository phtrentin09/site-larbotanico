/* Lar Botânico. Site desenvolvido por Pedro Trentin */
(function(){
"use strict";
var D=document, R=D.documentElement;
var WA=R.getAttribute("data-wa")||"";
var CK="lbt-cookies", TK="lbt-luz";
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
var reduz=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- luz (tema) ---------- */
function escuroAgora(){var t=R.getAttribute("data-theme");if(t)return t==="dark";return window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches}
function rotuloLuz(){D.querySelectorAll("[data-luz]").forEach(function(b){var e=escuroAgora();b.setAttribute("aria-label",e?"Acender as luzes do dia (modo claro)":"Apagar as luzes (modo noturno)");b.setAttribute("title",e?"Modo claro":"Modo noturno")})}
function trocaLuz(){
  var novo=escuroAgora()?"light":"dark";
  var aplica=function(){R.setAttribute("data-theme",novo);store(TK,novo);rotuloLuz()};
  if(D.startViewTransition&&!reduz)D.startViewTransition(aplica);else aplica();
}
D.addEventListener("click",function(e){var b=e.target.closest("[data-luz]");if(b)trocaLuz()});
rotuloLuz();

/* ---------- cabeçalho ---------- */
var top=D.querySelector(".top");
function onScrollTop(){if(top)top.classList.toggle("is-solid",window.scrollY>24||!D.querySelector(".janelas")||D.body.classList.contains("menu-open"))}
window.addEventListener("scroll",onScrollTop,{passive:true});onScrollTop();

/* ---------- menu do celular ---------- */
D.addEventListener("click",function(e){
  var m=e.target.closest(".menu-btn");
  if(m){var o=D.body.classList.toggle("menu-open");m.setAttribute("aria-expanded",o);onScrollTop();return}
  if(e.target.closest(".sheet a")){D.body.classList.remove("menu-open");var mb=D.querySelector(".menu-btn");if(mb)mb.setAttribute("aria-expanded","false");onScrollTop()}
});
D.addEventListener("keydown",function(e){if(e.key==="Escape"&&D.body.classList.contains("menu-open")){D.body.classList.remove("menu-open");onScrollTop()}});

/* ---------- abertura: a janela do meio se abre ---------- */
var J=null;
function iniciaJanelas(){
  var sec=D.querySelector(".janelas");if(!sec)return;
  var abre=sec.querySelector(".abre"),img=abre.querySelector("img"),cen=sec.querySelector(".win--c"),L=sec.querySelector(".win--l"),Rt=sec.querySelector(".win--r"),copy=sec.querySelector(".hero-copy"),stage=sec.querySelector(".janelas__stage");
  function estatico(){return reduz||window.innerHeight<600||(window.innerWidth<861&&window.innerHeight<640)}
  var box=null,ticking=false,last=-1;
  function mede(){
    sec.style.setProperty("--p",0);
    var s=stage.getBoundingClientRect(),c=cen.getBoundingClientRect();
    box={t:c.top-s.top,l:c.left-s.left,r:s.right-c.right,b:s.bottom-c.bottom,w:c.width,h:c.height,W:s.width,H:s.height,cx:c.left-s.left+c.width/2,cy:c.top-s.top+c.height/2};
    box.s0=Math.max(box.w/box.W,box.h/box.H);
  }
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function desenha(){
    ticking=false;
    if(sec.classList.contains("is-static")||!box)return;
    var rect=sec.getBoundingClientRect(),total=sec.offsetHeight-window.innerHeight;
    var raw=Math.min(1,Math.max(0,-rect.top/(total*.82)));
    if(Math.abs(raw-last)<.0005)return;last=raw;
    var p=ease(raw),q=1-p;
    sec.style.setProperty("--p",p.toFixed(4));
    abre.style.setProperty("--t",(box.t*q).toFixed(1)+"px");
    abre.style.setProperty("--l",(box.l*q).toFixed(1)+"px");
    abre.style.setProperty("--r",(box.r*q).toFixed(1)+"px");
    abre.style.setProperty("--b",(box.b*q).toFixed(1)+"px");
    abre.style.setProperty("--rad",(box.w/2*q).toFixed(1)+"px");
    var sc=box.s0+(1-box.s0)*p;
    img.style.transform="translate3d("+((box.cx-box.W/2)*q).toFixed(1)+"px,"+((box.cy-box.H/2)*q).toFixed(1)+"px,0) scale("+sc.toFixed(4)+")";
    var cap=Math.max(0,(raw-.72)/.28);
    abre.style.setProperty("--cap",cap.toFixed(3));sec.style.setProperty("--cap",cap.toFixed(3));
    sec.classList.toggle("is-open",cap>.5);
    var fr=cen.querySelector(".win__frame");if(fr)fr.style.opacity=Math.max(0,1-p*3.2).toFixed(3);
    var sx=window.innerWidth*.6*p;
    if(L){L.style.transform="translate3d("+(-sx)+"px,"+(p*30)+"px,0)";L.style.opacity=(1-p*1.4).toFixed(3)}
    if(Rt){Rt.style.transform="translate3d("+sx+"px,"+(p*30)+"px,0)";Rt.style.opacity=(1-p*1.4).toFixed(3)}
    if(copy){copy.style.transform="translate3d(0,"+(-p*90)+"px,0)";copy.style.opacity=(1-p*1.9).toFixed(3);copy.style.visibility=p>.6?"hidden":"visible"}
  }
  function pede(){if(!ticking){ticking=true;requestAnimationFrame(desenha)}}
  function prepara(){
    if(estatico()){sec.classList.add("is-static");[L,Rt,copy].forEach(function(x){if(x){x.style.transform="";x.style.opacity="";x.style.visibility=""}});return}
    sec.classList.remove("is-static");last=-1;
    mede();desenha();
  }
  prepara();
  window.addEventListener("scroll",pede,{passive:true});
  var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(prepara,120)});
  if(D.fonts&&D.fonts.ready)D.fonts.ready.then(prepara);
  J={prepara:prepara};
}

/* ---------- abas genéricas (equipe e avaliações) ---------- */
function abas(raiz,alvoSel,render){
  if(!raiz)return;
  var bts=[].slice.call(raiz.querySelectorAll("[role=tab]"));
  function sel(b,foco){
    bts.forEach(function(x){var s=x===b;x.setAttribute("aria-selected",s);x.tabIndex=s?0:-1});
    render(b);if(foco)b.focus();
  }
  bts.forEach(function(b,i){
    b.addEventListener("click",function(){sel(b)});
    b.addEventListener("mouseenter",function(){if(raiz.hasAttribute("data-hover")&&window.matchMedia("(hover:hover)").matches)sel(b)});
    b.addEventListener("keydown",function(e){
      var k=e.key,n=null;
      if(k==="ArrowDown"||k==="ArrowRight")n=bts[(i+1)%bts.length];
      if(k==="ArrowUp"||k==="ArrowLeft")n=bts[(i-1+bts.length)%bts.length];
      if(n){e.preventDefault();sel(n,true)}
    });
  });
}
function iniciaEquipe(){
  D.querySelectorAll("[data-equipe]").forEach(function(box){
    var painel=box.querySelector(".equipe__painel > div");
    abas(box.querySelector(".equipe__lista"),null,function(b){
      var t=D.getElementById(b.getAttribute("aria-controls"));if(!t||!painel)return;
      painel.innerHTML=t.innerHTML;painel.classList.remove("in");void painel.offsetWidth;painel.classList.add("in");
    });
  });
}
function iniciaAval(){
  D.querySelectorAll("[data-aval]").forEach(function(box){
    var fig=box.querySelector(".citacao");
    abas(box.querySelector(".aval__nomes"),null,function(b){
      var t=D.getElementById(b.getAttribute("aria-controls"));if(!t||!fig)return;
      fig.innerHTML=t.innerHTML;fig.classList.remove("in");void fig.offsetWidth;fig.classList.add("in");
    });
  });
}

/* ---------- fotos em tela cheia ---------- */
var lb=null,lista=[],idx=0;
function montaLb(){
  if(lb)return;
  lb=D.createElement("dialog");lb.className="lb";lb.setAttribute("aria-label","Foto ampliada");
  var seta='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  lb.innerHTML='<img alt=""><button class="x" type="button" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><button class="ant" type="button" aria-label="Foto anterior">'+seta+'</button><button class="prox" type="button" aria-label="Próxima foto">'+seta+'</button><p class="cont"></p>';
  D.body.appendChild(lb);
  lb.querySelector(".x").onclick=function(){lb.close()};
  lb.querySelector(".ant").onclick=function(){mostra(idx-1)};
  lb.querySelector(".prox").onclick=function(){mostra(idx+1)};
  lb.addEventListener("click",function(e){if(e.target===lb)lb.close()});
  lb.addEventListener("keydown",function(e){if(e.key==="ArrowRight")mostra(idx+1);if(e.key==="ArrowLeft")mostra(idx-1)});
  var x0=null;lb.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener("touchend",function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)mostra(idx+(dx<0?1:-1));x0=null});
}
function mostra(i){
  idx=(i+lista.length)%lista.length;var it=lista[idx];var im=lb.querySelector("img");
  im.src=it.src;im.alt=it.alt;im.style.animation="none";void im.offsetWidth;im.style.animation="";
  lb.querySelector(".cont").textContent=(idx+1)+" de "+lista.length;
  var um=lista.length<2;lb.querySelector(".ant").hidden=um;lb.querySelector(".prox").hidden=um;
}
D.addEventListener("click",function(e){
  var b=e.target.closest("[data-zoom]");if(!b)return;
  var grupo=b.closest("[data-fotos]")||b.parentNode;
  lista=[].slice.call(grupo.querySelectorAll("[data-zoom]")).map(function(x){var i=x.querySelector("img");return{src:x.getAttribute("data-zoom"),alt:i?i.alt:""}});
  montaLb();mostra(lista.findIndex(function(x){return x.src===b.getAttribute("data-zoom")}));
  if(lb.showModal)lb.showModal();else lb.setAttribute("open","");
});

/* ---------- formulários que abrem o WhatsApp ---------- */
D.addEventListener("submit",function(e){
  var f=e.target.closest("[data-wa-form]");if(!f)return;e.preventDefault();
  var tipo=f.getAttribute("data-wa-form"),nome=(f.querySelector("[name=nome]")||{}).value||"";
  nome=nome.trim();var err=f.querySelector(".erro");
  function marcado(n){var x=f.querySelector("[name="+n+"]:checked");return x?x.value:""}
  var msg="";
  if(!nome){if(err){err.hidden=false;err.textContent="Escreva seu nome para a equipe saber com quem está falando."}f.querySelector("[name=nome]").focus();return}
  if(tipo==="trabalho"){
    var area=marcado("area"),turno=marcado("turno");
    if(!area){if(err){err.hidden=false;err.textContent="Escolha a área em que você trabalha."}return}
    msg="Olá! Meu nome é "+nome+" e quero trabalhar no Lar Botânico. Área: "+area+(turno?". Turno de preferência: "+turno:"")+". Posso enviar meu currículo por aqui?";
  }else{
    var o=marcado("assunto");
    msg="Olá! Meu nome é "+nome+". Vim pelo site do Lar Botânico"+(o?" e quero "+o.toLowerCase():"")+".";
  }
  if(err)err.hidden=true;
  var a=D.createElement("a");a.href="https://wa.me/"+WA+"?text="+encodeURIComponent(msg);a.target="_blank";a.rel="noopener";D.body.appendChild(a);a.click();a.remove();
});

/* ---------- cookies e mapa ---------- */
var aviso=D.getElementById("cookies");
function consent(){return store(CK)}
function ligaMapas(){
  D.querySelectorAll("[data-mapa]").forEach(function(m){
    if(m.classList.contains("on"))return;
    m.classList.add("on");m.innerHTML='<iframe title="Mapa do Lar Botânico" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="'+m.getAttribute("data-mapa")+'"></iframe>';
  });
}
function decide(v){store(CK,v);if(aviso){aviso.hidden=true;aviso.remove&&aviso.remove();aviso=null}if(v==="todos")ligaMapas()}
if(aviso){if(consent())aviso.remove();else{
  var mostrou=false,abre=function(){if(mostrou||!aviso)return;mostrou=true;aviso.hidden=false;window.removeEventListener("scroll",rolou)};
  var rolou=function(){if(window.scrollY>window.innerHeight*(D.querySelector(".janelas:not(.is-static)")?1.6:.5))abre()};
  window.addEventListener("scroll",rolou,{passive:true});setTimeout(abre,D.querySelector(".janelas")?9000:2500);
}}
if(consent()==="todos")ligaMapas();
D.addEventListener("click",function(e){
  var a=e.target.closest("[data-cookies]");if(a){decide(a.getAttribute("data-cookies"));return}
  if(e.target.closest("[data-mapa-ok]")){decide("todos");return}
  if(e.target.closest("[data-cookies-rever]")){try{localStorage.removeItem(CK)}catch(x){}location.reload()}
});

/* ---------- navegação da versão de revisão (arquivo único) ---------- */
function rota(){
  var pgs=D.querySelectorAll("[data-pg]");if(!pgs.length)return;
  var h=decodeURIComponent((location.hash||"#inicio").slice(1))||"inicio";
  var alvo=D.querySelector('[data-pg="'+h+'"]');
  if(!alvo){var el=D.getElementById(h);if(el){var dono=el.closest("[data-pg]");if(dono&&dono.hidden){mostraPg(dono,function(){el.scrollIntoView()});}return}alvo=D.querySelector('[data-pg="404"]')}
  mostraPg(alvo);
}
function mostraPg(alvo,depois){
  var troca=function(){
    D.querySelectorAll("[data-pg]").forEach(function(p){p.hidden=p!==alvo});
    D.title=alvo.getAttribute("data-title")||D.title;
    D.querySelectorAll(".nav a,.sheet a").forEach(function(a){a.removeAttribute("aria-current");if(a.getAttribute("href")==="#"+alvo.getAttribute("data-pg"))a.setAttribute("aria-current","page")});
    window.scrollTo(0,0);onScrollTop();if(J&&alvo.querySelector(".janelas"))J.prepara();
    if(depois)depois();
  };
  if(D.startViewTransition&&!reduz&&alvo.hidden)D.startViewTransition(troca);else troca();
}
if(D.querySelector("[data-pg]")){
  window.addEventListener("hashchange",rota);
  D.addEventListener("click",function(e){
    var a=e.target.closest('a[href^="#"]');if(!a)return;
    var h=a.getAttribute("href").slice(1);var p=D.querySelector('[data-pg="'+h+'"]');
    if(p){e.preventDefault();try{history.pushState(null,"","#"+h)}catch(x){}mostraPg(p)}
  });
  rota();
}

iniciaJanelas();iniciaEquipe();iniciaAval();
})();
