import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { REG, PAL, disposeDeep, ease } from './kit.js';
import './scenes-basics.js';
import './scenes-seq.js';
import './scenes-attn.js';

class DLWorld extends HTMLElement {
  connectedCallback(){
    if(this._up){ this._restart(); return; } this._up=true;
    this.motion='full';
    if(!this.style.position) this.style.position='relative';
    this.style.display='block'; this.style.overflow='hidden';
    if(!this.style.width) this.style.width='100%';
    if(!this.style.height) this.style.height='100%';
    const r=this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
    r.setClearColor(PAL.bg); r.setPixelRatio(Math.min(devicePixelRatio,2));
    r.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;';
    this.appendChild(r.domElement);
    this.scene=new THREE.Scene(); this.scene.fog=new THREE.Fog(PAL.bg,34,110);
    this.camera=new THREE.PerspectiveCamera(45,1,0.1,400); this.camera.position.set(0,26,44);
    this.controls=new OrbitControls(this.camera,r.domElement);
    this.controls.enableDamping=true; this.controls.dampingFactor=0.08;
    this.controls.maxDistance=90; this.controls.minDistance=2.5; this.controls.autoRotateSpeed=0.7;
    const amb=new THREE.AmbientLight(0x8899bb,0.6), d1=new THREE.DirectionalLight(0xffffff,1.15), d2=new THREE.DirectionalLight(0x88aaff,0.4);
    d1.position.set(6,14,9); d2.position.set(-9,7,-7); this.scene.add(amb,d1,d2);
    const grid=new THREE.GridHelper(160,80,0x1b2a45,0x0d1728); grid.position.y=-3.4; this.scene.add(grid);
    this.tip=document.createElement('div');
    this.tip.style.cssText='position:absolute;pointer-events:none;background:rgba(8,12,24,.94);border:1px solid rgba(148,163,184,.28);color:#dce6f7;font:500 12px "IBM Plex Mono",monospace;padding:6px 10px;border-radius:8px;opacity:0;transition:opacity .15s;z-index:5;max-width:260px;left:0;top:0;';
    this.appendChild(this.tip);
    this.ray=new THREE.Raycaster(); this.mouse=new THREE.Vector2(); this._hover=null;
    r.domElement.addEventListener('pointermove',e=>this._onMove(e));
    r.domElement.addEventListener('click',e=>this._onClick(e));
    new ResizeObserver(()=>this._resize()).observe(this); this._resize();
    this._last=performance.now();
    window.addEventListener('error',e=>console.error('UNCAUGHT',e.message,(e.filename||'').split('/').pop()+':'+e.lineno));
    const tickBody=()=>{
      try{      const now=performance.now(); const dt=Math.min((now-this._last)/1000,0.05); this._last=now;
      if(this._fly){ this._fly.t+=dt/this._fly.dur; const k=ease(Math.min(1,this._fly.t));
        this.camera.position.lerpVectors(this._fly.p0,this._fly.p1,k);
        this.controls.target.lerpVectors(this._fly.t0,this._fly.t1,k);
        if(this._fly.t>=1) this._fly=null; }
      this.controls.autoRotate=!!(this.current&&this.current.autoRotate&&this.motion!=='calm'&&!this._fly);
      this.controls.update();
      if(this.current){ try{ this.current.tick(dt); }catch(e){ const k='scene:'+String(e&&e.message||e); if(this._lastErr!==k){ this._lastErr=k; console.error('SCENE ERROR:',e&&e.stack||k); } } }
      r.render(this.scene,this.camera);
      this._beat=performance.now();
      }catch(e){ const k=String(e&&e.message||e); if(this._lastErr!==k){ this._lastErr=k; console.error('LOOP ERROR:',e&&e.stack||k); } } };
    this._tick=tickBody;
    const loop=()=>{ this._raf=requestAnimationFrame(loop); tickBody(); };
    this._loop=loop;
    loop();
    this._fallback=setInterval(()=>{ if(performance.now()-(this._beat||0)>140) tickBody(); },66);
    Promise.all(['600 44px "IBM Plex Mono"','500 44px "Space Grotesk"'].map(f=>document.fonts.load(f))).catch(()=>{}).then(()=>{
      this._fontsReady=true; this.emit('dl-ready',{});
      if(this._pendingStation){ const s=this._pendingStation; this._pendingStation=null; this.setStation(s); }
    });
  }
  disconnectedCallback(){ cancelAnimationFrame(this._raf); clearInterval(this._fallback); setTimeout(()=>{ if(this.isConnected) this._restart(); },0); }
  _restart(){ if(!this._loop) return; cancelAnimationFrame(this._raf); clearInterval(this._fallback); this._last=performance.now(); this._loop(); this._fallback=setInterval(()=>{ if(performance.now()-(this._beat||0)>140) this._tick(); },66); this._resize(); }
  setStation(id){
    if(!this._up||!this._fontsReady||!REG[id]){ this._pendingStation=id; return; }
    if(this.current){ this.current.P.clear(); this.scene.remove(this.current.root); this.current.dispose(); disposeDeep(this.current.root); this.current=null; }
    this.emit('dl-readout',{items:[]}); this.tip.style.opacity=0; this._hover=null;
    const S=new REG[id](this); S.id=id; this.current=S; S.build(); this.scene.add(S.root);
    const c=S.cam(); this.flyTo(c.pos,c.target,1.15);
  }
  flyTo(p,t,dur=1){ this._fly={p0:this.camera.position.clone(),p1:new THREE.Vector3(...p),t0:this.controls.target.clone(),t1:new THREE.Vector3(...t),t:0,dur}; }
  setParam(k,v){ this.current&&this.current.onParam(k,v); }
  step(){ this.current&&this.current.step(); }
  setPlaying(b){ if(this.current) this.current.playing=b; }
  emit(n,d){ this.dispatchEvent(new CustomEvent(n,{detail:d})); }
  _ndc(e){ const b=this.renderer.domElement.getBoundingClientRect(); this.mouse.set(((e.clientX-b.left)/b.width)*2-1,-((e.clientY-b.top)/b.height)*2+1); return b; }
  _cast(){ if(!this.current||!this.current.pick.length) return null;
    this.ray.setFromCamera(this.mouse,this.camera);
    const hits=this.ray.intersectObjects(this.current.pick,true);
    for(const h of hits){ let o=h.object; while(o){ if(o.userData.tip||o.userData.onClick) return {o,h}; o=o.parent; } }
    return null; }
  _onMove(e){ const b=this._ndc(e); const r=this._cast(); const o=r&&r.o;
    this.renderer.domElement.style.cursor=o&&o.userData.onClick?'pointer':'grab';
    if(o&&o.userData.tip){ const t=typeof o.userData.tip==='function'?o.userData.tip(r.h):o.userData.tip;
      if(t){ this.tip.textContent=t; this.tip.style.opacity=1;
        const z=b.width/(this.renderer.domElement.clientWidth||b.width)||1;
        this.tip.style.left=Math.min((e.clientX-b.left)/z+14,b.width/z-270)+'px'; this.tip.style.top=((e.clientY-b.top)/z+12)+'px'; }
      else this.tip.style.opacity=0; }
    else this.tip.style.opacity=0;
    if(this._hover&&this._hover!==o&&this._hover.userData.onHover) this._hover.userData.onHover(false);
    if(o&&o.userData.onHover&&this._hover!==o) o.userData.onHover(true);
    this._hover=o; }
  _onClick(e){ this._ndc(e); const r=this._cast(); if(r&&r.o.userData.onClick) r.o.userData.onClick(r.o,r.h); }
  _resize(){ const w=this.clientWidth||2,h=this.clientHeight||2; const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1; this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)*z); this.renderer.setSize(w,h,false); this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); }
}
customElements.define('dl-world',DLWorld);
