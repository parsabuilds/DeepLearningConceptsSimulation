// GENERATED single-file bundle (kit.js + scenes-*.js + engine.js merged for publishing).
// Edit the source files, then regenerate this file — do not edit by hand.
const __R = window.__resources || {};
let THREE, OrbitControls;
// Load vendored three.js: three-main.js (module build + OrbitControls) pulls three-core.js
// via dynamic import — window.__resources blob URLs when published, relative URLs in preview.
// No fetch() anywhere: strict artifact hosts block it.
async function __load(url){
  const m = await import(url);
  if (!m.Scene || !m.OrbitControls) throw new Error('incomplete three module: '+url);
  THREE = m; OrbitControls = m.OrbitControls;
}
try { await __load(__R['three-main'] || new URL('./vendor/three-main.js', import.meta.url).href); }
catch(e){
  console.warn('[engine] vendored three failed, trying import map', e);
  THREE = await import('three');
  OrbitControls = (await import('three/addons/controls/OrbitControls.js')).OrbitControls;
}


const REG = {};
const PAL = { bg:0x070b14, input:0x22d3ee, weight:0xf59e0b, neg:0xf43f5e, act:0xffffff, mem:0x34d399, attn:0xa78bfa, enc:0x38bdf8, dec:0xfb923c, dim:0x64748b, err:0xf43f5e };
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const V = (x,y,z)=>new THREE.Vector3(x,y,z);
const sig = x=>1/(1+Math.exp(-x));
const softmax = (a,t=1)=>{const m=Math.max(...a);const e=a.map(v=>Math.exp((v-m)/t));const s=e.reduce((p,c)=>p+c,0);return e.map(v=>v/s);};
const ease = t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const hue = i=>new THREE.Color().setHSL(((i*47)%360)/360,0.68,0.62);

const G = {
  sphere: new THREE.SphereGeometry(1,28,20),
  cyl: new THREE.CylinderGeometry(1,1,1,12,1),
  box: new THREE.BoxGeometry(1,1,1),
  cone: new THREE.ConeGeometry(1,1,16),
};
Object.values(G).forEach(g=>g.userData.shared=true);
const SHARED = G;

function mat(color,{rough=0.38,metal=0.08,em=0.5,opacity=1,flat=false,additive=false}={}) {
  if (additive) return new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
  if (flat){ const m=new THREE.MeshBasicMaterial({color}); if(opacity<1){m.transparent=true;m.opacity=opacity;} return m; }
  const m = new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive:color,emissiveIntensity:em});
  if (opacity<1){ m.transparent=true; m.opacity=opacity; }
  return m;
}
function node(r,color,o={}){ const m=new THREE.Mesh(G.sphere,mat(color,o)); m.scale.setScalar(r); return m; }
function box(w,h,d,color,o={}){ const m=new THREE.Mesh(G.box,mat(color,o)); m.scale.set(w,h,d); return m; }
function orient(m,a,b,r){ const d=V(b.x-a.x,b.y-a.y,b.z-a.z); const len=Math.max(0.001,d.length()); m.scale.set(r,len,r); m.position.set((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2); m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize()); }
function link(a,b,{r=0.05,color=PAL.dim,opacity=1,em=0.4,additive=false}={}) {
  const m=new THREE.Mesh(G.cyl,mat(color,{em,opacity,additive}));
  orient(m,a,b,r); return m;
}
function arrow(a,b,{r=0.05,color=PAL.dim,tip=3,em=0.5,opacity=1}={}) {
  const g=new THREE.Group();
  const dir=b.clone().sub(a); const len=dir.length(); const n=dir.clone().normalize();
  const end=a.clone().add(n.clone().multiplyScalar(Math.max(0.001,len-r*tip*2)));
  g.add(link(a,end,{r,color,em,opacity}));
  const c=new THREE.Mesh(G.cone,mat(color,{em,opacity})); c.scale.set(r*tip,r*tip*2,r*tip);
  c.position.copy(end).add(n.clone().multiplyScalar(r*tip)); c.quaternion.setFromUnitVectors(V(0,1,0),n);
  g.add(c); return g;
}
function tube(points,{r=0.05,color=PAL.dim,em=0.5,opacity=1,segs=64,closed=false}={}) {
  const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,closed),segs,r,8,closed);
  return new THREE.Mesh(geo,mat(color,{em,opacity}));
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function label(text,{h=0.42,color='#dce6f7',bg=null,font=44,bold=600,pad=16,mono=true,opacity=1}={}) {
  const c=document.createElement('canvas'); let ctx=c.getContext('2d');
  const f=`${bold} ${font}px ${mono?'"IBM Plex Mono"':'"Space Grotesk"'}, monospace`;
  ctx.font=f; const tw=Math.ceil(ctx.measureText(text).width);
  c.width=Math.max(8,tw+pad*2); c.height=font+pad*2;
  ctx=c.getContext('2d');
  if(bg){ctx.fillStyle=bg; roundRect(ctx,1,1,c.width-2,c.height-2,Math.min(14,c.height/2)); ctx.fill();}
  ctx.font=f; ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text,c.width/2,c.height/2+2);
  const tex=new THREE.CanvasTexture(c); tex.anisotropy=4; tex.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity,depthWrite:false}));
  s.scale.set(h*c.width/c.height,h,1); return s;
}
class Pulses {
  constructor(parent){ this.parent=parent; this.list=[]; }
  spawn(path,{color=0xffffff,size=0.13,speed=6,onDone=null,onAt=null}={}) {
    const m=new THREE.Mesh(G.sphere,new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.scale.setScalar(size);
    const segs=[]; let total=0;
    for(let i=0;i<path.length-1;i++){const l=path[i].distanceTo(path[i+1]); segs.push(l); total+=l;}
    m.position.copy(path[0]); this.parent.add(m);
    this.list.push({m,path,segs,total,d:0,speed,onDone,onAt});
    return m;
  }
  update(dt){
    for(let i=this.list.length-1;i>=0;i--){ const p=this.list[i]; p.d+=p.speed*dt;
      if(p.d>=p.total){ this.parent.remove(p.m); p.m.material.dispose(); this.list.splice(i,1); p.onDone&&p.onDone(); continue; }
      let d=p.d,j=0; while(j<p.segs.length-1&&d>p.segs[j]){d-=p.segs[j];j++;}
      p.m.position.lerpVectors(p.path[j],p.path[j+1],p.segs[j]?Math.min(1,d/p.segs[j]):0);
      p.onAt&&p.onAt(p.d/p.total,p.m);
    }
  }
  clear(){ this.list.forEach(p=>{this.parent.remove(p.m);p.m.material.dispose();}); this.list=[]; }
}
function voxels(nx,ny,cell,{gap=0.05,depth=0.5}={}) {
  const im=new THREE.InstancedMesh(G.box,new THREE.MeshBasicMaterial({color:0xffffff}),nx*ny);
  const d=new THREE.Object3D(); const s=cell-gap; const base=new THREE.Color(0x0c1424);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ d.position.set((i-(nx-1)/2)*cell,((ny-1)/2-j)*cell,0); d.scale.set(s,s,s*depth); d.updateMatrix(); const k=j*nx+i; im.setMatrixAt(k,d.matrix); im.setColorAt(k,base); }
  im.instanceMatrix.needsUpdate=true;
  const col=new THREE.Color();
  return { mesh:im, nx, ny, cell,
    set(i,j,c,v){ col.set(c).multiplyScalar(Math.max(0.05,Math.min(1,v))); if(v<=0)col.copy(base); im.setColorAt(j*nx+i,col); im.instanceColor.needsUpdate=true; },
    idx(k){ return {i:k%nx, j:Math.floor(k/nx)}; },
    pos(i,j){ return V((i-(nx-1)/2)*cell,((ny-1)/2-j)*cell,0); } };
}
class SceneBase {
  constructor(world){ this.world=world; this.root=new THREE.Group(); this.pick=[]; this.P=new Pulses(this.root); this.t=0; this.playing=true; this.autoRotate=false; this._q=[]; this._tw=[]; }
  build(){} update(dt){} onParam(k,v){} step(){} dispose(){}
  cam(){ return {pos:[0,5,16], target:[0,2,0]}; }
  after(d,fn){ this._q.push({at:this.t+d,fn}); }
  tween(setter,from,to,dur,{ez=ease,done=null}={}){ this._tw.push({setter,from,to,dur,t:0,ez,done}); }
  tick(dt){ this.t+=dt;
    if(this._q.length){ const due=this._q.filter(q=>q.at<=this.t); if(due.length){ this._q=this._q.filter(q=>q.at>this.t); due.forEach(q=>q.fn()); } }
    for(let i=this._tw.length-1;i>=0;i--){ const w=this._tw[i]; w.t+=dt; const k=Math.min(1,w.t/w.dur); w.setter(w.from+(w.to-w.from)*w.ez(k)); if(k>=1){ this._tw.splice(i,1); w.done&&w.done(); } }
    this.update(dt); this.P.update(dt);
  }
  note(text,ms=2600){ this.world.emit('dl-note',{text,ms}); }
  readout(items){ this.world.emit('dl-readout',{items}); }
  add(...o){ o.forEach(x=>this.root.add(x)); return o[0]; }
  lab(t,x,y,z,o={}){ const s=label(t,o); s.position.set(x,y,z); this.root.add(s); return s; }
  calm(){ return this.world.motion==='calm'; }
}
function disposeDeep(o){
  o.traverse(n=>{ if(n.geometry&&!n.geometry.userData.shared) n.geometry.dispose();
    const ms=Array.isArray(n.material)?n.material:(n.material?[n.material]:[]);
    ms.forEach(mm=>{ if(mm.map)mm.map.dispose(); mm.dispose(); }); });
}

{

const ERA = { neuron:0x22d3ee, perceptron:0x22d3ee, mlp:0x22d3ee, train:0x22d3ee, cnn:0xf59e0b, rnn:0x34d399, lstm:0x34d399, seq2seq:0x38bdf8, attn:0x38bdf8, selfattn:0xa78bfa, crossattn:0xa78bfa, transformer:0xa78bfa, gan:0xf43f5e };
const MAIN = ['neuron','perceptron','mlp','train','cnn','rnn','lstm','seq2seq','attn','selfattn','crossattn','transformer'];
const NAMES = { neuron:'Neuron', perceptron:'Perceptron', mlp:'MLP / FFNN', train:'Training', cnn:'CNN', rnn:'RNN', lstm:'LSTM · GRU', seq2seq:'Encoder–Decoder', attn:'+ Attention', selfattn:'Self-Attention', crossattn:'Cross-Attention', transformer:'Transformer', gan:'GAN' };
const WALLS = ['make it DECIDE + learn','XOR: no straight cut','who sets the weights?','images: params explode','no memory for sequences','forgets long range','output len ≠ input len','1-vector bottleneck','make attention THE engine','attend ACROSS sequences','drop the RNN entirely'];

REG.map = class extends SceneBase {
  cam(){ return {pos:[3,28,41], target:[2,0,-1.5]}; }
  build(){
    this.autoRotate=true;
    const f=this.world.scene.fog; this._fog=[f.near,f.far]; f.near=46; f.far=140;
    const P = MAIN.map((id,i)=>V(-24.2+i*4.4, 0, Math.sin(i*0.85)*4.6));
    const gp = V(-7.5,0,-12);
    this.arcs=[];
    MAIN.forEach((id,i)=>this.island(id,P[i],i+1));
    this.island('gan',gp,13);
    for(let i=0;i<MAIN.length-1;i++){
      const a=P[i],b=P[i+1],m=a.clone().add(b).multiplyScalar(0.5); m.y=1.6;
      this.add(tube([a.clone().setY(0.6),m,b.clone().setY(0.6)],{r:0.045,color:0x2b3a58,em:0.5}));
      const tag=this.lab(WALLS[i],m.x,m.y+0.95+(i%2)*0.55,m.z,{h:0.56,font:44,color:'#ffb4c2',bg:'rgba(76,12,28,0.92)'});
      tag.userData=null;
      this.arcs.push([a.clone().setY(0.7),m.clone(),b.clone().setY(0.7)]);
    }
    const cm=P[4].clone().add(gp).multiplyScalar(0.5); cm.y=1.9;
    this.add(tube([P[4].clone().setY(0.6),cm,gp.clone().setY(0.6)],{r:0.045,color:0x3d2030,em:0.5}));
    this.lab('a different question: CREATE data',cm.x,cm.y+0.95,cm.z,{h:0.56,font:44,color:'#ffb4c2',bg:'rgba(76,12,28,0.92)'});
    this.arcs.push([P[4].clone().setY(0.7),cm.clone(),gp.clone().setY(0.7)]);
    this.lab('T H E   L I N E A G E',0,8.4,-3,{h:1.25,font:64,bold:700,mono:false,color:'#eef3ff'});
    this.lab('every architecture is a patch on the previous one\u2019s failure',0,7.1,-3,{h:0.55,font:34,mono:false,color:'#8ea3c8'});
    this.lab('click any island \u00b7 peek inside the globes \u00b7 the red tags are the exam\u2019s \u201cwhy\u201d answers',0,-2.4,6,{h:0.45,font:30,color:'#5c729a'});
    this.startArrow(P[0]);
    this.acc=0;
  }
  startArrow(p){
    const g=this.start=new THREE.Group(); g.position.set(p.x,0,p.z);
    const c=0x7ce8bd;
    const shaft=new THREE.Mesh(SHARED.cyl,mat(c,{em:0.95})); shaft.scale.set(0.16,1.1,0.16); shaft.position.y=1.15; g.add(shaft);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.42,0.75,16),mat(c,{em:0.95})); tip.rotation.x=Math.PI; tip.position.y=0.35; g.add(tip);
    const sign=label('START HERE',{h:0.62,font:52,bold:700,color:'#07202b',bg:'#7ce8bd'}); sign.position.y=2.15; g.add(sign);
    g.position.y=4.35; g.userData={ tip:'begin at 01 \u00b7 The Neuron', onClick:()=>this.world.emit('dl-goto',{id:'neuron'}) };
    this.add(g); this.pick.push(g);
  }
  dispose(){ const f=this.world.scene.fog; if(this._fog){ f.near=this._fog[0]; f.far=this._fog[1]; } }
  island(id,p,num){
    const c=ERA[id];
    const ped=new THREE.Mesh(SHARED.cyl,mat(0x16233c,{em:0.15})); ped.scale.set(1.05,0.5,1.05); ped.position.copy(p).setY(0.25); this.add(ped);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.035,10,40),mat(c,{em:0.9,opacity:0.7})); ring.rotation.x=Math.PI/2; ring.position.copy(p).setY(0.06); this.add(ring);
    const g=new THREE.Group(); g.position.copy(p).setY(1.55);
    const shell=new THREE.Mesh(SHARED.sphere,new THREE.MeshStandardMaterial({color:c,transparent:true,opacity:0.15,roughness:0.12,metalness:0.1,emissive:c,emissiveIntensity:0.22,depthWrite:false}));
    shell.scale.setScalar(0.95); shell.renderOrder=5; g.add(shell);
    const disc=new THREE.Mesh(SHARED.cyl,mat(0x101b30,{em:0.2})); disc.scale.set(0.62,0.05,0.62); disc.position.y=-0.56; g.add(disc);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.02,8,36),mat(c,{em:0.85,opacity:0.55})); rim.rotation.x=Math.PI/2; rim.position.y=-0.53; g.add(rim);
    const inner=this.mini(id); inner.scale.setScalar(1.12); inner.position.y=-0.06; g.add(inner);
    g.userData={ tip:num+'. '+NAMES[id]+' — click to travel', onClick:()=>this.world.emit('dl-goto',{id}), base:1.55, ph:num, inner };
    this.add(g); this.pick.push(g);
    this.lab(String(num).padStart(2,'0'),p.x,2.98,p.z,{h:0.38,color:'#7f95b8'});
    this.lab(NAMES[id],p.x,3.55,p.z,{h:0.56,font:40,bold:700,mono:false,color:'#eef3ff'});
    (this.orbs=this.orbs||[]).push(g);
  }
  mini(id){
    const g=new THREE.Group(), c=ERA[id];
    const N=(r,col,x,y,z,em=0.7)=>{ const n=node(r,col,{em}); n.position.set(x,y,z); g.add(n); return n; };
    const B=(w,h,d,col,x,y,z,o={})=>{ const m=box(w,h,d,col,{em:0.55,...o}); m.position.set(x,y,z); g.add(m); return m; };
    const L=(a,b,o={})=>{ const l=link(a,b,{r:0.02,color:0x3d4f76,em:0.45,...o}); g.add(l); return l; };
    if(id==='neuron'){
      [V(-0.44,0.28,0),V(-0.5,0,0),V(-0.44,-0.28,0)].forEach((p,i)=>{
        N(0.075,PAL.input,p.x,p.y,p.z);
        L(p,V(0.04,0,0),{r:i===0?0.036:0.024,color:i===1?PAL.neg:PAL.weight,em:0.6}); });
      N(0.145,0xdde7ff,0.04,0,0,0.3); L(V(0.04,0,0),V(0.46,0,0)); N(0.085,0xffffff,0.46,0,0,0.6);
    } else if(id==='perceptron'){
      B(0.02,0.46,0.68,PAL.attn,0,0,0,{opacity:0.32,em:0.7});
      N(0.062,PAL.input,-0.3,-0.05,-0.22); N(0.062,PAL.input,-0.34,-0.05,0.18);
      N(0.062,PAL.weight,0.3,-0.05,0.22); N(0.062,PAL.weight,0.34,-0.05,-0.18);
    } else if(id==='mlp'){
      const pos=[]; [[-0.38,2],[0,3],[0.38,2]].forEach(([x,n],li)=>{ const col=[];
        for(let k=0;k<n;k++){ const y=(k-(n-1)/2)*0.26; col.push(V(x,y,0)); N(0.058,li===2?0xdde7ff:c,x,y,0); } pos.push(col); });
      for(let a=0;a<2;a++) pos[a].forEach(p1=>pos[a+1].forEach(p2=>L(p1,p2,{r:0.012,opacity:0.85})));
    } else if(id==='train'){
      const pts=[]; for(let i=0;i<=20;i++){ const x=-0.45+i*0.045; pts.push(V(x,0.5*(x/0.45)*(x/0.45)-0.16,0)); }
      g.add(tube(pts,{r:0.02,color:0x3d4f76,em:0.5,segs:24}));
      N(0.085,0xffffff,-0.3,0.155,0,0.55); N(0.045,PAL.mem,0,-0.13,0,0.9);
    } else if(id==='cnn'){
      const vx=voxels(5,5,0.15); vx.mesh.position.set(0,0.02,0); g.add(vx.mesh);
      [[1,1],[2,1],[3,1],[3,2],[2,3],[2,4]].forEach(([i,j])=>vx.set(i,j,0x9fd8ff,0.95));
      const kp=vx.pos(1,1); B(0.47,0.47,0.18,PAL.weight,kp.x,kp.y+0.02,0.03,{opacity:0.22,em:1});
    } else if(id==='rnn'){
      B(0.3,0.3,0.3,PAL.mem,0,0,0,{opacity:0.95});
      const loop=new THREE.Mesh(new THREE.TorusGeometry(0.26,0.026,8,30,4.9),mat(PAL.mem,{em:0.8}));
      loop.position.set(0,0.33,0); loop.rotation.z=2.4; g.add(loop);
      L(V(-0.52,-0.2,0),V(-0.17,-0.02,0),{color:PAL.input,r:0.024,em:0.6});
      L(V(0.17,0.02,0),V(0.52,0.2,0),{color:0xdde7ff,r:0.024,em:0.5});
    } else if(id==='lstm'){
      B(0.92,0.05,0.13,PAL.mem,0,0.3,0,{em:0.7,opacity:0.95});
      [[-0.3,0],[-0.02,3],[0.26,6]].forEach(([x,hi])=>N(0.06,hue(hi),x,0.37,0,0.85));
      [-0.26,0,0.26].forEach(x=>{ const d=new THREE.Mesh(SHARED.cyl,mat(PAL.weight,{em:0.75}));
        d.scale.set(0.075,0.035,0.075); d.position.set(x,-0.08,0); g.add(d);
        L(V(x,-0.05,0),V(x,0.27,0),{r:0.012,opacity:0.8}); });
    } else if(id==='seq2seq'){
      const xs=[-0.5,-0.32,-0.14];
      xs.forEach((x,i)=>{ N(0.055,PAL.enc,x,-0.02,0); if(i) L(V(xs[i-1]+0.05,-0.02,0),V(x-0.05,-0.02,0),{r:0.013}); });
      L(V(-0.09,-0.02,0),V(0.0,0,0),{r:0.013});
      N(0.125,0xffffff,0.09,0,0,0.85);
      L(V(0.19,0,0),V(0.27,0.02,0),{r:0.013});
      N(0.055,PAL.dec,0.32,0.02,0); N(0.055,PAL.dec,0.5,0.02,0); L(V(0.37,0.02,0),V(0.45,0.02,0),{r:0.013});
    } else if(id==='attn'){
      const tops=[];
      [-0.38,-0.18,0.02].forEach(x=>{ B(0.075,0.3,0.075,PAL.enc,x,-0.12,0); tops.push(V(x,0.03,0)); });
      N(0.08,PAL.dec,0.32,0.28,0);
      tops.forEach((t,i)=>L(V(0.32,0.28,0),t,{additive:true,color:PAL.attn,opacity:0.85,r:[0.034,0.016,0.022][i]}));
    } else if(id==='selfattn'){
      const pts=[]; for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; const p=V(Math.cos(a)*0.34,0.02,Math.sin(a)*0.34);
        pts.push(p); N(0.06,hue(i),p.x,p.y,p.z,0.8); }
      for(let i=0;i<5;i++)for(let j=i+1;j<5;j++) L(pts[i],pts[j],{additive:true,color:PAL.attn,opacity:0.4,r:0.011});
    } else if(id==='crossattn'){
      const bot=[],top=[];
      [-0.26,0,0.26].forEach(x=>{ N(0.06,PAL.enc,x,-0.24,0); bot.push(V(x,-0.24,0)); N(0.06,PAL.dec,x,0.24,0); top.push(V(x,0.24,0)); });
      bot.forEach((b,i)=>L(top[1],b,{additive:true,color:PAL.attn,opacity:0.8,r:[0.018,0.032,0.014][i]}));
    } else if(id==='transformer'){
      [-0.22,0.22].forEach(x=>{ for(let k=0;k<3;k++) B(0.24,0.095,0.17,k===1?PAL.attn:0x35507e,x,-0.2+k*0.17,0,{em:k===1?0.7:0.35}); });
      L(V(-0.22,0.14,0),V(0.22,0.0,0),{additive:true,color:PAL.attn,opacity:0.85,r:0.02});
    } else if(id==='gan'){
      N(0.1,PAL.attn,-0.32,0,0,0.8); N(0.1,PAL.weight,0.32,0,0,0.8);
      g.add(tube([V(-0.28,0.08,0),V(0,0.3,0),V(0.28,0.08,0)],{r:0.018,color:PAL.attn,em:0.7,segs:20}));
      g.add(tube([V(0.28,-0.08,0),V(0,-0.3,0),V(-0.28,-0.08,0)],{r:0.018,color:PAL.err,em:0.7,segs:20}));
      B(0.09,0.09,0.02,0xffffff,0,0.33,0,{em:0.6,opacity:0.95});
    }
    return g;
  }
  update(dt){
    const spin=dt*(this.calm()?0.18:0.4);
    this.orbs.forEach(o=>{ o.position.y=o.userData.base+Math.sin(this.t*1.4+o.userData.ph)*0.09; o.userData.inner.rotation.y+=spin; });
    if(this.start){ this.start.position.y=4.35+Math.sin(this.t*2.2)*0.22;
      const k=1+Math.sin(this.t*2.2)*0.04; this.start.scale.setScalar(k); }
    this.acc+=dt;
    if(this.acc>0.5&&this.playing&&!this.calm()){ this.acc=0;
      const a=this.arcs[Math.floor(Math.random()*this.arcs.length)];
      this.P.spawn(a,{color:0x9fc4ff,size:0.11,speed:5});
    }
  }
};

REG.neuron = class extends SceneBase {
  cam(){ return {pos:[3.4,2.6,14.2], target:[3.0,0.3,0]}; }
  build(){
    this.w=[1.2,-0.8,0.6]; this.b=0; this.act='sigmoid'; this.x=[0.9,0.5,0.25];
    const P=this.ip=[V(-6,2.7,0),V(-6,0,0),V(-6,-2.7,0)];
    this.inputs=P.map((p,i)=>{ const n=node(0.4,PAL.input,{em:0.75}); n.position.copy(p);
      n.userData.tip='input x'+SUB[i+1]+' = '+this.x[i]+'  (a dendrite: raw signal)';
      this.add(n); this.pick.push(n);
      this.lab('x'+SUB[i+1]+' = '+this.x[i],p.x-1.25,p.y,p.z,{h:0.36}); return n; });
    this.edges=P.map((p,i)=>{ const e=link(p,V(0,0,0),{r:0.1,color:PAL.weight});
      e.userData.tip=()=>'weight w'+SUB[i+1]+' = '+this.w[i].toFixed(1)+'  (a synapse: how much x'+SUB[i+1]+' matters)';
      this.add(e); this.pick.push(e); return e; });
    this.wlabs=P.map((p,i)=>this.lab('w'+SUB[i+1],p.x*0.5,p.y*0.55+0.32,0,{h:0.34,color:'#ffd9a0'}));
    this.soma=node(0.95,0xdde7ff,{em:0.22}); this.soma.userData.tip='soma: z = w\u00b7x + b  (weighted sum + bias)';
    this.add(this.soma); this.pick.push(this.soma);
    this.lab('\u03a3 + b',0,-1.3,0,{h:0.42,color:'#9fb4dd'});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,0.07,12,44),mat(PAL.attn,{em:0.85}));
    ring.rotation.y=Math.PI/2; ring.position.set(2.7,0,0); this.add(ring);
    ring.userData.tip='activation f: squashes z into the output a'; this.pick.push(ring);
    this.actLab=this.lab('f = \u03c3',2.7,1.52,0,{h:0.42,color:'#cbb8ff'});
    this.out=node(0.5,PAL.act,{em:0.2}); this.out.position.set(5.8,0,0);
    this.out.userData.tip=()=>'output a = f(z) = '+this.compute().a.toFixed(2)+'  (the axon)';
    this.add(this.out); this.pick.push(this.out);
    this.add(link(V(0,0,0),V(5.8,0,0),{r:0.055,color:0x44557a}));
    this.lab('a',6.6,0,0,{h:0.4,color:'#e8eeff'});
    this.lab('dendrites',-6,3.6,0,{h:0.3,color:'#5c729a'});
    this.lab('axon',4.3,-0.55,0,{h:0.3,color:'#5c729a'});
    this.curve=null; this.plotCurve(); this.acc=99; this.refresh();
  }
  f(z){ return this.act==='sigmoid'?sig(z):this.act==='tanh'?Math.tanh(z):this.act==='relu'?Math.max(0,z):(z>=0?1:0); }
  compute(){ const z=this.w[0]*this.x[0]+this.w[1]*this.x[1]+this.w[2]*this.x[2]+this.b; return {z,a:this.f(z)}; }
  plotCurve(){
    if(this.curve){ this.root.remove(this.curve); this.pick.splice(this.pick.indexOf(this.curve),1); this.curve.material.map.dispose(); this.curve.material.dispose(); if(this.curve.geometry)this.curve.geometry.dispose(); }
    const W=460,H=254,mx=44,mv=27,c=document.createElement('canvas'); c.width=W; c.height=H;
    const ctx=c.getContext('2d'), mid=H/2, vmax=this.act==='relu'?4:1;
    const X=z=>mx+(z+4)/8*(W-2*mx), Y=v=>mid-(v/vmax)*(mid-mv);
    ctx.fillStyle='rgba(13,20,38,0.72)'; ctx.strokeStyle='rgba(92,114,154,0.4)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(1,1,W-2,H-2,16); ctx.fill(); ctx.stroke();
    ctx.font='500 20px "IBM Plex Mono", monospace'; ctx.textBaseline='middle';
    if(vmax===1){ ctx.strokeStyle='rgba(203,184,255,0.28)'; ctx.setLineDash([4,5]); ctx.lineWidth=1.5;
      const gs=this.act==='tanh'?[1,-1]:[1];
      gs.forEach(g=>{ ctx.beginPath(); ctx.moveTo(mx,Y(g)); ctx.lineTo(W-mx,Y(g)); ctx.stroke();
        ctx.fillStyle='rgba(203,184,255,0.55)'; ctx.textAlign='left'; ctx.fillText((g>0?'+1':'\u22121'),W-mx+5,Y(g)); });
      ctx.setLineDash([]); }
    ctx.strokeStyle='rgba(142,163,200,0.35)'; ctx.setLineDash([3,5]); ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(X(0),mv); ctx.lineTo(X(0),H-mv); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle='rgba(142,163,200,0.9)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(mx,mid); ctx.lineTo(W-mx,mid); ctx.stroke();
    ctx.fillStyle='#8ea3c8'; ctx.textAlign='right'; ctx.fillText('0',mx-10,mid);
    ctx.fillStyle='#5c729a'; ctx.font='500 17px "IBM Plex Mono", monospace'; ctx.textAlign='center';
    ctx.fillText('\u22124',X(-4),mid+16); ctx.fillText('z',X(0)+14,mv+2); ctx.fillText('+4',X(4),mid+16);
    ctx.strokeStyle='#c9b4ff'; ctx.lineWidth=4; ctx.lineJoin='round';
    ctx.shadowColor='#c9b4ff'; ctx.shadowBlur=8; ctx.beginPath();
    for(let i=0;i<=112;i++){ const z=-4+i*8/112, y=Y(this.f(z)); i?ctx.lineTo(X(z),y):ctx.moveTo(X(z),y); }
    ctx.stroke(); ctx.shadowBlur=0;
    const tex=new THREE.CanvasTexture(c); tex.anisotropy=8; tex.colorSpace=THREE.SRGBColorSpace;
    this.curve=new THREE.Mesh(new THREE.PlaneGeometry(1.72,0.95),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
    this.curve.rotation.y=Math.PI/2; this.curve.position.set(2.7,0,0);
    this.curve.userData.tip=()=>'f('+'z) over z \u2208 [\u22124,+4] \u2014 the 0 line shows where the output crosses zero';
    this.add(this.curve); this.pick.push(this.curve);
  }
  refresh(){
    const {z,a}=this.compute();
    this.edges.forEach((e,i)=>{ const w=this.w[i];
      orient(e,this.ip[i],V(0,0,0),0.03+Math.abs(w)*0.09);
      const c=w>=0?PAL.weight:PAL.neg; e.material.color.set(c); e.material.emissive.set(c);
      e.material.emissiveIntensity=0.25+Math.min(1,Math.abs(w))*0.4; });
    this.out.material.emissiveIntensity=0.12+Math.max(0,Math.min(1,(a+ (this.act==='tanh'?1:0))/(this.act==='tanh'?2:1)))*0.9;
    this.out.scale.setScalar(0.3+0.4*Math.max(0.05,Math.min(1,Math.abs(a))));
    this.readout([['z = w\u00b7x + b',z.toFixed(2)],['a = f(z)',a.toFixed(2)]]);
  }
  onParam(k,v){
    if(k==='w1')this.w[0]=+v; else if(k==='w2')this.w[1]=+v; else if(k==='w3')this.w[2]=+v;
    else if(k==='b')this.b=+v;
    else if(k==='act'){ this.act=v; const nm={sigmoid:'\u03c3',tanh:'tanh',relu:'ReLU',step:'step'}[v];
      this.actLab.material.map.dispose(); const nl=label('f = '+nm,{h:0.42,color:'#cbb8ff'});
      this.actLab.material.map=nl.material.map; this.actLab.scale.copy(nl.scale); nl.material.dispose();
      this.plotCurve(); }
    this.refresh();
  }
  update(dt){
    this.acc+=dt; if(this.acc<(this.calm()?1.6:0.85)||!this.playing) return; this.acc=0;
    const {a}=this.compute();
    this.ip.forEach((p,i)=>{ const s=Math.abs(this.w[i]*this.x[i]);
      this.P.spawn([p,V(0,0,0)],{color:this.w[i]>=0?PAL.weight:PAL.neg,size:Math.max(0.05+s*0.13,0.1+Math.abs(this.w[i])*0.09),speed:6}); });
    this.after(1.35,()=>{ this.tween(k=>this.soma.scale.setScalar(0.95+Math.sin(k*Math.PI)*0.13),0,1,0.4);
      this.P.spawn([V(0,0,0),V(2.7,0,0),V(5.8,0,0)],{color:0xffffff,size:0.06+Math.min(1,Math.abs(a))*0.13,speed:7}); });
  }
};

const DATA={ AND:[[0,0,-1],[0,1,-1],[1,0,-1],[1,1,1]], OR:[[0,0,-1],[0,1,1],[1,0,1],[1,1,1]], XOR:[[0,0,-1],[0,1,1],[1,0,1],[1,1,-1]] };
REG.perceptron = class extends SceneBase {
  cam(){ return {pos:[9,6.8,11.5], target:[1.2,0.6,0]}; }
  build(){
    this.ds='AND'; this.w=[0.6,-0.4]; this.b=-0.2; this.disp={w1:0.6,w2:-0.4,b:-0.2};
    this.training=false; this.updates=0; this.acc=0;
    const plat=box(6.2,0.14,6.2,0x101b30,{em:0.08}); plat.position.y=-0.09; this.add(plat);
    this.add(arrow(V(-2.9,0.02,-2.9),V(3.4,0.02,-2.9),{r:0.03,color:0x44557a}));
    this.add(arrow(V(-2.9,0.02,-2.9),V(-2.9,0.02,3.4),{r:0.03,color:0x44557a}));
    this.lab('x\u2081',3.8,0.15,-2.9,{h:0.4,color:'#8ea3c8'});
    this.lab('x\u2082',-2.9,0.15,3.8,{h:0.4,color:'#8ea3c8'});
    this.pts=[]; this.halos=[]; this.plabs=[];
    this.plane=box(7.2,2.3,0.07,0xa78bfa,{opacity:0.22,em:0.55}); this.add(this.plane);
    this.plane.userData.tip='decision boundary: w\u00b7x + b = 0 (a straight cut)';
    this.pick.push(this.plane);
    this.narrow=null;
    this.wall=this.lab('T H E   W A L L : no straight cut separates XOR',1.2,4.1,0,{h:0.55,font:40,bold:700,color:'#ff9db0',bg:'rgba(76,12,28,0.94)'});
    this.wall.visible=false;
    this.setData('AND'); this.syncPlane(true);
  }
  world2(u){ return V((u[0]-0.5)*4.4,0.32,(u[1]-0.5)*4.4); }
  setData(ds){
    this.ds=ds; this.wall.visible=false; this.updates=0; this.training=false;
    this.pick=this.pick.filter(o=>!this.pts.includes(o));
    this.pts.forEach(p=>this.root.remove(p)); this.halos.forEach(h=>this.root.remove(h)); this.plabs.forEach(l=>this.root.remove(l));
    this.pts=[]; this.halos=[]; this.plabs=[];
    DATA[ds].forEach(d=>{ const p=node(0.26,d[2]>0?PAL.input:PAL.neg,{em:0.8});
      p.position.copy(this.world2(d)); p.userData.tip='x=('+d[0]+','+d[1]+')  class '+(d[2]>0?'+1':'\u22121');
      this.add(p); this.pick.push(p); this.pts.push(p);
      const h=new THREE.Mesh(new THREE.TorusGeometry(0.45,0.045,10,36),mat(PAL.err,{em:1,opacity:0.9}));
      h.rotation.x=Math.PI/2; h.position.copy(p.position); h.visible=false; this.add(h); this.halos.push(h);
      const l=label((d[0]+','+d[1]),{h:0.28,color:'#7f95b8'}); l.position.copy(p.position).add(V(0,0.62,0)); this.add(l); this.plabs.push(l);
    });
    this.evalErr();
  }
  predict(d,w1=this.w[0],w2=this.w[1],b=this.b){ return (w1*d[0]+w2*d[1]+b)>=0?1:-1; }
  evalErr(){
    const errs=DATA[this.ds].map((d,i)=>this.predict(d)!==d[2]);
    errs.forEach((e,i)=>this.halos[i].visible=e);
    const n=errs.filter(Boolean).length;
    this.readout([['data',this.ds],['errors',String(n)],['updates',String(this.updates)],['w',`(${this.w[0].toFixed(2)}, ${this.w[1].toFixed(2)})`],['b',this.b.toFixed(2)]]);
    return n;
  }
  syncPlane(snap){
    const [w1,w2]=[this.disp.w1,this.disp.w2], b=this.disp.b, n2=w1*w1+w2*w2;
    if(n2<0.004){ this.plane.visible=false; return; } this.plane.visible=true;
    const c=[0.5,0.5], k=(w1*c[0]+w2*c[1]+b)/n2;
    const u=[c[0]-k*w1, c[1]-k*w2];
    this.plane.position.copy(this.world2(u)).setY(1.05);
    const D=V(-w2,0,w1).normalize();
    this.plane.quaternion.setFromUnitVectors(V(1,0,0),D);
    if(this.narrow){ this.root.remove(this.narrow); }
    this.narrow=arrow(this.plane.position.clone(),this.plane.position.clone().add(V(w1,0,w2).normalize().multiplyScalar(1.5)),{r:0.045,color:PAL.input});
    this.add(this.narrow);
  }
  onParam(k,v){
    if(k==='data'){ this.setData(v); }
    else if(k==='train'){ this.training=true; this.updates=0; this.wall.visible=false; this.note('perceptron rule: when wrong, nudge w toward the mistake'); }
    else if(k==='reset'){ this.w=[Math.random()*1.2-0.6,Math.random()*1.2-0.6]; this.b=Math.random()*0.8-0.4; this.training=false; this.updates=0; this.wall.visible=false; this.evalErr(); }
    else if(k==='w1'){ this.w[0]=+v; this.training=false; } else if(k==='w2'){ this.w[1]=+v; this.training=false; }
    else if(k==='b'){ this.b=+v; this.training=false; }
    this.evalErr();
  }
  update(dt){
    ['w1','w2','b'].forEach((k,i)=>{ const t=i<2?this.w[i]:this.b; this.disp[k]+=(t-this.disp[k])*Math.min(1,dt*7); });
    this.syncPlane();
    this.acc+=dt;
    if(this.training&&this.acc>0.3&&this.playing){ this.acc=0;
      const wrong=DATA[this.ds].filter(d=>d[2]*(this.w[0]*d[0]+this.w[1]*d[1]+this.b)<0.15*Math.hypot(this.w[0],this.w[1]));
      if(!wrong.length){ this.training=false; this.note('CONVERGED — 0 errors. Guaranteed, IF linearly separable.'); return; }
      const d=wrong[Math.floor(Math.random()*wrong.length)];
      this.w[0]+=0.5*d[2]*d[0]; this.w[1]+=0.5*d[2]*d[1]; this.b+=0.5*d[2];
      this.updates++; this.evalErr();
      if(this.updates>=42&&this.ds==='XOR'){ this.training=false; this.wall.visible=true; this.note('42 updates. Still wrong. It will NEVER settle on XOR.'); }
    }
  }
};

const XPTS=[[0,0,-1],[0,1,1],[1,0,1],[1,1,-1]];
const H=(x1,x2)=>[sig(6*x1+6*x2-3), sig(9*x1+9*x2-13)];
REG.mlp = class extends SceneBase {
  cam(){ return {pos:[-1.5,4.4,16.5], target:[-4,1.7,0]}; }
  build(){
    this.folded=false; this.acc=0;
    const sizes=[2,4,4,1], xs=[-12,-8.5,-5,-1.5];
    this.layers=sizes.map((s,l)=>{ const arr=[];
      for(let k=0;k<s;k++){ let p;
        if(s<=2) p=V(xs[l],2+(k-(s-1)/2)*2.2,0);
        else { const a=k/s*Math.PI*2; p=V(xs[l],2+Math.cos(a)*1.5,Math.sin(a)*1.5); }
        const c=l===0?PAL.input:l===sizes.length-1?PAL.attn:0xdde7ff;
        const n=node(l===0||l===sizes.length-1?0.4:0.33,c,{em:0.5}); n.position.copy(p);
        n.userData.tip=l===0?'input neuron':l===sizes.length-1?'output neuron':'hidden neuron — one weighted-sum-and-squash, like station 1';
        this.add(n); this.pick.push(n); arr.push(n); }
      return arr; });
    this.edges=[];
    for(let l=0;l<3;l++){ const E=[];
      this.layers[l].forEach(a=>this.layers[l+1].forEach(b=>{
        E.push(this.add(link(a.position,b.position,{r:0.018,color:0x3a4a6b,opacity:0.5}))); }));
      this.edges.push(E); }
    this.lab('input',-12,4.25,0,{h:0.34,color:'#67e8f9'});
    this.lab('hidden layers',-6.75,4.25,0,{h:0.34,color:'#9fb4dd'});
    this.lab('output',-1.5,4.25,0,{h:0.34,color:'#cbb8ff'});
    this.lab('signal flows one way \u2192 \u201cfeedforward\u201d',-6.75,-0.65,0,{h:0.36,color:'#5c729a'});
    const mkPlat=(x,name)=>{ const g=new THREE.Group(); g.position.set(x,0,0);
      const p=box(5,0.16,5,0x18294a,{em:0.22}); p.position.y=-0.08; g.add(p);
      const l=label(name,{h:0.38,color:'#8ea3c8'}); l.position.set(0,-0.7,3.1); g.add(l);
      this.add(g); return g; };
    this.platA=mkPlat(4.5,'input space (x\u2081, x\u2082)');
    this.platB=mkPlat(10.9,'hidden space (h\u2081, h\u2082)');
    const aA=arrow(V(7.2,0.6,0),V(8.2,0.6,0),{r:0.05,color:PAL.weight}); this.add(aA);
    this.lab('hidden layer re-maps',7.7,1.15,0,{h:0.34,color:'#ffd9a0'});
    this.fp=XPTS.map((d,i)=>{ const p=node(0.28,d[2]>0?PAL.input:PAL.neg,{em:0.85});
      p.position.copy(this.ptA(d)); p.userData.tip='('+d[0]+','+d[1]+') class '+(d[2]>0?'+1':'\u22121')+' — press FOLD';
      p.userData.onClick=()=>this.trace(d);
      this.add(p); this.pick.push(p); return p; });
    this.cut=box(4.6,1.7,0.07,0xa78bfa,{opacity:0.28,em:0.6});
    this.cut.position.set(10.9+0.9,4.5,-0.9);
    this.cut.quaternion.setFromUnitVectors(V(1,0,0),V(1,0,1).normalize());
    this.cut.visible=false; this.add(this.cut);
  }
  ptA(d){ return V(4.5+(d[0]-0.5)*3.6, 0.34, (d[1]-0.5)*3.6); }
  ptB(d){ const h=H(d[0],d[1]); return V(10.9+(h[0]-0.5)*3.6, 0.34, (h[1]-0.5)*3.6); }
  trace(d){
    const h=H(d[0],d[1]); const out=sig(20*h[0]-20*h[1]-10);
    const p=this.fp[XPTS.indexOf(d)];
    if(p) this.tween(k=>{ const s=0.28*(1+Math.sin(k*Math.PI)*0.2); p.scale.setScalar(s); p.material.emissiveIntensity=0.85+Math.sin(k*Math.PI)*1.3; },0,1,0.7);
    this.note('x=('+d[0]+','+d[1]+')  \u2192  h=('+h[0].toFixed(2)+','+h[1].toFixed(2)+')  \u2192  \u0177 = '+out.toFixed(2)+(out>0.5?'  (+1)':'  (\u22121)'),3600);
    for(let l=0;l<3;l++) this.after(l*0.34,()=>{
      this.layers[l].forEach(a=>this.layers[l+1].forEach(b=>this.P.spawn([a.position,b.position],{color:0x9fc4ff,size:0.07,speed:11})));
      this.layers[l+1].forEach(n=>this.tween(k=>n.material.emissiveIntensity=0.5+Math.sin(k*Math.PI)*0.7,0,1,0.5));
    });
  }
  onParam(k,v){
    if(k==='fold'&&!this.folded){ this.folded=true;
      this.world.flyTo([11.3,5.8,12.4],[11.1,0.3,0],1.2);
      this.fp.forEach((p,i)=>{ const d=XPTS[i], a=this.ptA(d), b=this.ptB(d);
        if(i===1)b.z-=0.4; if(i===2)b.z+=0.4; // (0,1) & (1,0) map to the SAME h-point — splay so both stay visible
        const h=H(d[0],d[1]);
        const m=a.clone().add(b).multiplyScalar(0.5).setY(2.6);
        this.after(i*0.28,()=>this.tween(t=>{
          const p1=a.clone().lerp(m,Math.min(1,t*2)), p2=m.clone().lerp(b,Math.max(0,t*2-1));
          p.position.copy(t<0.5?p1:p2);
        },0,1,1.1));
        this.after(i*0.28+1.15,()=>{ p.userData.tip='x=('+d[0]+','+d[1]+') \u2192 h=('+h[0].toFixed(2)+','+h[1].toFixed(2)+')  class '+(d[2]>0?'+1':'\u22121')+(i===1||i===2?' — lands on the SAME h-point as its twin (nudged apart here)':''); });
      });
      this.after(1.9,()=>{ this.cut.visible=true; this.cut.position.y=4.5;
        this.tween(y=>this.cut.position.y=y,4.5,1.0,0.9);
        this.note('(0,1) and (1,0) collapse onto the SAME h-point (nudged apart so you see both) — now ONE cut works',0); });
    }
    if(k==='reset'){ this.folded=false; this.cut.visible=false; this.note('',1);
      this.fp.forEach((p,i)=>{ const d=XPTS[i]; p.position.copy(this.ptA(d));
        p.userData.tip='('+d[0]+','+d[1]+') class '+(d[2]>0?'+1':'\u22121')+' — press FOLD'; }); }
  }
  update(dt){
    this.acc+=dt; if(this.acc<(this.calm()?2.8:1.7)||!this.playing) return; this.acc=0;
    for(let l=0;l<3;l++) this.after(l*0.3,()=>{
      this.layers[l].forEach(a=>{ const b=this.layers[l+1][Math.floor(Math.random()*this.layers[l+1].length)];
        this.P.spawn([a.position,b.position],{color:0x7fd8f0,size:0.055,speed:9}); });
    });
  }
};

REG.train = class extends SceneBase {
  cam(){ return {pos:[-0.5,8.2,17.5], target:[-1,1.2,0]}; }
  build(){
    this.lr=0.18; this.steps=0; this.startIdx=0; this.depth=3; this.acc=0; this.bacc=2.4;
    const SG=this.SG=new THREE.Group(); SG.position.set(-6.5,0,0); this.add(SG);
    const geo=new THREE.PlaneGeometry(8.8,8.8,64,64); geo.rotateX(-Math.PI/2);
    const pos=geo.attributes.position; const colors=new Float32Array(pos.count*3);
    let mn=1e9,mx=-1e9; const ys=[];
    for(let i=0;i<pos.count;i++){ const x=pos.getX(i)/1.1, z=pos.getZ(i)/1.1;
      const y=this.f(x,z)*0.55; ys.push(y); mn=Math.min(mn,y); mx=Math.max(mx,y); }
    const stops=[0x0d1830,0x1d4ed8,0x22d3ee,0x34d399,0xfbbf24].map(h=>new THREE.Color(h)), cc=new THREE.Color();
    for(let i=0;i<pos.count;i++){ pos.setY(i,ys[i]);
      const t=Math.pow(1-(ys[i]-mn)/(mx-mn),1.35)*(stops.length-1);
      const s=Math.min(Math.floor(t),stops.length-2);
      cc.copy(stops[s]).lerp(stops[s+1],t-s);
      colors[i*3]=cc.r; colors[i*3+1]=cc.g; colors[i*3+2]=cc.b; }
    geo.setAttribute('color',new THREE.BufferAttribute(colors,3)); geo.computeVertexNormals();
    const surf=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.6,metalness:0.05}));
    surf.userData.tip='the LOSS LANDSCAPE: color = depth. Blue = high loss \u2192 cyan \u2192 green \u2192 amber = lowest. Rings = equal-loss contours.';
    SG.add(surf); this.pick.push(surf); this.addContours(SG);
    this.ball=node(0.24,0xffffff,{em:0.6}); SG.add(this.ball);
    this.ball.userData.tip='the model\u2019s weights (w\u2081,w\u2082) — rolling downhill = gradient descent';
    this.pick.push(this.ball);
    const tg=new THREE.BufferGeometry(); this.trailPos=new Float32Array(500*3);
    tg.setAttribute('position',new THREE.BufferAttribute(this.trailPos,3)); tg.setDrawRange(0,0);
    this.trail=new THREE.Line(tg,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.55}));
    SG.add(this.trail); this.trailN=0;
    this.lab('loss landscape',-6.5,3.6,-3.6,{h:0.44,mono:false,font:38,bold:700,color:'#eef3ff'});
    this.lab('w \u2190 w \u2212 \u03b7\u00b7\u2207L',-6.5,2.95,-3.6,{h:0.36,color:'#8ea3c8'});
    this.NG=new THREE.Group(); this.NG.position.set(2.9,0.4,0); this.add(this.NG);
    this.lab('backprop: blame flows backward',2.9,4.55,0,{h:0.44,mono:false,font:38,bold:700,color:'#eef3ff'});
    this.vanish=this.lab('vanishing: gradient \u2248 0 here',-1.1,4.1,0,{h:0.4,font:34,color:'#ff9db0',bg:'rgba(76,12,28,0.94)'});
    this.vanish.visible=false;
    this.buildNet(); this.resetBall();
  }
  addContours(SG){
    const n=64,R=4.0,H=[]; let mn=1e9,mx=-1e9;
    for(let i=0;i<=n;i++){ H[i]=[]; for(let j=0;j<=n;j++){ const y=this.f(-R+2*R*i/n,-R+2*R*j/n)*0.55; H[i][j]=y; if(y<mn)mn=y; if(y>mx)mx=y; } }
    const minor=[],major=[],NL=14;
    for(let li=1;li<NL;li++){ const L=mn+(mx-mn)*li/NL, out=(li%3===0)?major:minor;
      for(let i=0;i<n;i++) for(let j=0;j<n;j++){
        const x0=-R+2*R*i/n,x1=-R+2*R*(i+1)/n,z0=-R+2*R*j/n,z1=-R+2*R*(j+1)/n;
        const a=H[i][j],b=H[i+1][j],c=H[i+1][j+1],d=H[i][j+1],e=[];
        const X=(v0,v1,p0,p1)=>{ if((v0<L)!==(v1<L)){ const t=(L-v0)/(v1-v0); e.push([p0[0]+(p1[0]-p0[0])*t,p0[1]+(p1[1]-p0[1])*t]); } };
        X(a,b,[x0,z0],[x1,z0]); X(b,c,[x1,z0],[x1,z1]); X(c,d,[x1,z1],[x0,z1]); X(d,a,[x0,z1],[x0,z0]);
        for(let k=0;k+1<e.length;k+=2) out.push(e[k][0]*1.1,L+0.045,e[k][1]*1.1,e[k+1][0]*1.1,L+0.045,e[k+1][1]*1.1);
      } }
    [[minor,0.28],[major,0.7]].forEach(([pts,op])=>{ if(!pts.length) return;
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pts),3));
      SG.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xaef0ff,transparent:true,opacity:op,depthWrite:false})));
    });
  }
  f(x,z){ return 0.09*(x*x+z*z)-1.9*Math.exp(-((x-1.7)**2+(z-1.3)**2)/1.4)-1.1*Math.exp(-((x+1.9)**2+(z+1.6)**2)/1.6)+2.4; }
  grad(x,z){ const g1=Math.exp(-((x-1.7)**2+(z-1.3)**2)/1.4), g2=Math.exp(-((x+1.9)**2+(z+1.6)**2)/1.6);
    return [0.18*x+1.9*g1*2*(x-1.7)/1.4+1.1*g2*2*(x+1.9)/1.6, 0.18*z+1.9*g1*2*(z-1.3)/1.4+1.1*g2*2*(z+1.6)/1.6]; }
  buildNet(){
    while(this.NG.children.length){ const c=this.NG.children.pop(); this.NG.remove(c); }
    const L=this.depth, sp=L>4?1.0:2.0, x0=-(L-1)*sp/2;
    this.nodes=[]; this.nedges=[];
    for(let l=0;l<L;l++){ const col=[];
      for(let k=0;k<3;k++){ const n=node(0.26,l===L-1?PAL.attn:0xdde7ff,{em:0.4});
        n.position.set(x0+l*sp,1.1+k*1.15,0); this.NG.add(n); col.push(n); }
      this.nodes.push(col); }
    for(let l=0;l<L-1;l++){ const E=[];
      this.nodes[l].forEach(a=>this.nodes[l+1].forEach(b=>{
        const e=link(a.position,b.position,{r:0.02,color:0x3a4a6b,opacity:0.55}); this.NG.add(e); E.push(e); }));
      this.nedges.push(E); }
  }
  resetBall(){
    const S=[[-3.3,3.1],[3.4,-3.2],[-3.0,-2.6]][this.startIdx%3];
    this.p=[S[0],S[1]]; this.steps=0; this.trailN=0; this.trail.geometry.setDrawRange(0,0);
    this.placeBall(); this.readout([['\u03b7 (learning rate)',this.lr.toFixed(2)],['steps','0'],['loss',(this.f(...this.p)).toFixed(2)]]);
  }
  placeBall(){ const y=this.f(this.p[0],this.p[1])*0.55; this.ball.position.set(this.p[0]*1.1,y+0.28,this.p[1]*1.1);
    if(this.trailN<499){ const i=this.trailN++;
      this.trailPos[i*3]=this.ball.position.x; this.trailPos[i*3+1]=this.ball.position.y+0.05; this.trailPos[i*3+2]=this.ball.position.z;
      this.trail.geometry.setDrawRange(0,this.trailN); this.trail.geometry.attributes.position.needsUpdate=true; } }
  onParam(k,v){
    if(k==='lr') this.lr=+v;
    else if(k==='drop'){ this.startIdx++; this.resetBall(); }
    else if(k==='depth'){ this.depth=v==='8-layer'?8:3; this.vanish.visible=false; this.buildNet(); this.bacc=2.0; }
  }
  batch(){
    const L=this.depth;
    for(let l=0;l<L-1;l++) this.after(l*0.16,()=>{
      this.nodes[l].forEach(a=>{ const b=this.nodes[l+1][Math.floor(Math.random()*3)];
        this.P.spawn([a.position.clone().add(this.NG.position),b.position.clone().add(this.NG.position)],{color:0x7fd8f0,size:0.06,speed:10}); }); });
    this.after((L-1)*0.16+0.5,()=>{
      for(let l=L-2;l>=0;l--){ const k=(L-2-l), size=0.16*Math.pow(0.55,k);
        this.after((L-2-l)*0.22,()=>{
          this.nedges[l].forEach(e=>{ this.tween(s=>{e.scale.x=0.02*(1+s*3*Math.pow(0.55,k)); e.scale.z=e.scale.x;},1,0,0.5); });
          this.nodes[l].forEach(a=>{ const b=this.nodes[l+1][Math.floor(Math.random()*3)];
            this.P.spawn([b.position.clone().add(this.NG.position),a.position.clone().add(this.NG.position)],{color:PAL.err,size:Math.max(0.012,size),speed:9}); }); });
      }
      if(L>4) this.after((L-2)*0.22+0.4,()=>{ this.vanish.visible=true; });
    });
  }
  update(dt){
    if(!this.playing) return;
    this.acc+=dt;
    if(this.acc>0.2){ this.acc=0;
      const g=this.grad(this.p[0],this.p[1]);
      this.p[0]-=this.lr*g[0]; this.p[1]-=this.lr*g[1]; this.steps++;
      if(Math.abs(this.p[0])>4.2||Math.abs(this.p[1])>4.2){ this.note('DIVERGED — \u03b7 too large: each step overshoots the valley'); this.startIdx++; this.resetBall(); return; }
      this.placeBall();
      const gm=Math.hypot(...g);
      this.readout([['\u03b7 (learning rate)',this.lr.toFixed(2)],['steps',String(this.steps)],['loss',this.f(...this.p).toFixed(3)],['|\u2207L|',gm.toFixed(3)],['grad reaching layer 1',Math.pow(0.55,this.depth-1).toFixed(this.depth>4?4:2)]]);
      if(gm<0.015&&this.f(...this.p)>1.2&&!this._localNoted){ this._localNoted=true; this.note('stuck in a LOCAL minimum — the deeper valley is elsewhere'); }
    }
    this.bacc+=dt;
    if(this.bacc>(this.calm()?4.5:3.0)){ this.bacc=0; this.batch(); }
  }
};

const DIGIT=['..............','..XXXXXXXXXX..','..XXXXXXXXXX..','..........XX..','.........XX...','........XX....','.......XX.....','......XX......','......XX......','.....XX.......','.....XX.......','....XX........','....XX........','..............'];
const KER={ vertical:[[1,0,-1],[2,0,-2],[1,0,-1]], horizontal:[[1,2,1],[0,0,0],[-1,-2,-1]], blur:[[0.11,0.11,0.11],[0.11,0.11,0.11],[0.11,0.11,0.11]] };
const IMGNET=[
  ['pre-CNN ’11',25.8,0x64748b,'hand-engineered features (SIFT + encodings): 25.8% top-5 error — the classic pipeline’s ceiling'],
  ['AlexNet ’12',16.4,0xf59e0b,'8 layers · 16.4%. 5 conv + 3 FC, ReLU, dropout — split across two 3GB GPUs. The 2012 shock that restarted deep learning'],
  ['VGG ’14',7.3,0xf7b13d,'19 layers · 7.3%. Design rules: only 3×3 convs (S1 P1), 2×2 pools, channels ×2 after each pool. Two 3×3 = one 5×5’s receptive field with fewer params (18C² vs 25C²)'],
  ['GoogLeNet ’14',6.7,0xf7b13d,'22 layers · 6.7% — parallel multi-scale “inception” branches inside each block'],
  ['ResNet ’15',3.6,0xffd166,'152 layers · 3.6% — past human level. Shortcut y = F(x)+x: extra layers can fall back to identity, gradients ride the addition (the same additive-highway trick the LSTM belt uses — station 07)']
];
REG.cnn = class extends SceneBase {
  cam(){ return {pos:[2.2,4.3,21.8], target:[2.6,2.2,0]}; }
  build(){
    this.kname='vertical'; this.pad=0; this.stride=1; this.relu=true; this.poolfn='max';
    this.k=0; this.reveal=0; this.pk=0; this.preveal=0; this.phase='conv'; this.hold=0; this.pacc=0;
    this.img=voxels(14,14,0.4); this.img.mesh.position.set(-8.4,3.6,0); this.add(this.img.mesh);
    for(let j=0;j<14;j++)for(let i=0;i<14;i++) this.img.set(i,j,PAL.input,DIGIT[j][i]==='X'?0.95:0.05);
    this.img.mesh.userData.tip=h=>{ const {i,j}=this.img.idx(h.instanceId); return 'pixel['+j+','+i+'] = '+(DIGIT[j][i]==='X'?'1':'0'); };
    this.pick.push(this.img.mesh);
    const RG=this.ring=new THREE.Group(); RG.position.copy(this.img.mesh.position);
    const rmat=mat(0x64748b,{em:0.3,opacity:0.32});
    for(let j=-1;j<=14;j++)for(let i=-1;i<=14;i++){ if(i>=0&&i<14&&j>=0&&j<14) continue;
      const m=new THREE.Mesh(SHARED.box,rmat); m.scale.set(0.35,0.35,0.14);
      m.position.copy(this.img.pos(i,j)); RG.add(m); }
    RG.visible=false;
    RG.userData.tip=()=>this.pad?'zero padding, P=1 — a free border of 0s so the kernel can park on edge pixels. Output stays 14×14 (“same” padding)':null;
    this.add(RG); this.pick.push(RG);
    this.lab('input image 1×14×14',-8.4,7.15,0,{h:0.4,mono:false,font:36,bold:700,color:'#eef3ff'});
    this.lab('same 9 weights at every stop = weight sharing',-8.4,0.1,0,{h:0.34,color:'#ffd9a0'});
    this.frame=new THREE.Group();
    const fr=(x,y,w,h)=>{ const b=box(w,h,0.06,PAL.weight,{additive:true,opacity:0.9}); b.position.set(x,y,0); this.frame.add(b); };
    const s=1.2; fr(0,s/2+0.03,s+0.12,0.06); fr(0,-s/2-0.03,s+0.12,0.06); fr(s/2+0.03,0,0.06,s+0.12); fr(-s/2-0.03,0,0.06,s+0.12);
    this.add(this.frame);
    this.rays=[]; for(let i=0;i<9;i++){ const l=link(V(0,0,0),V(1,1,1),{r:0.012,color:PAL.weight,additive:true,opacity:0.5}); this.add(l); this.rays.push(l); }
    this.pframe=new THREE.Group();
    const pf=(x,y,w,h)=>{ const b=box(w,h,0.06,PAL.mem,{additive:true,opacity:0.9}); b.position.set(x,y,0); this.pframe.add(b); };
    const q=0.8; pf(0,q/2+0.03,q+0.12,0.06); pf(0,-q/2-0.03,q+0.12,0.06); pf(q/2+0.03,0,0.06,q+0.12); pf(-q/2-0.03,0,0.06,q+0.12);
    this.add(this.pframe); this.pframe.visible=false;
    this.prays=[]; for(let i=0;i<4;i++){ const l=link(V(0,0,0),V(1,1,1),{r:0.012,color:PAL.mem,additive:true,opacity:0.55}); this.add(l); this.prays.push(l); }
    this.fm=null; this.pm=null; this.fmLab=null; this.poolLab=null; this.parrow=null;
    this.computeMap(); this.buildMaps(); this.buildPipeline(); this.buildStrip(); this.placeCursor();
  }
  px(i,j){ return (i<0||j<0||i>13||j>13)?0:(DIGIT[j][i]==='X'?1:0); }
  computeMap(){
    const K=KER[this.kname], P=this.pad, S=this.stride;
    const N=this.N=Math.floor((14-3+2*P)/S)+1;
    const raw=[]; let mx=0.001;
    for(let j=0;j<N;j++){ const row=[];
      for(let i=0;i<N;i++){ let v=0;
        for(let u=0;u<3;u++)for(let w=0;w<3;w++) v+=this.px(i*S-P+w,j*S-P+u)*K[u][w];
        row.push(v); mx=Math.max(mx,Math.abs(v)); }
      raw.push(row); }
    this.vals=raw.map(r=>r.map(v=>{ v/=mx; return this.relu?Math.max(0,v):v; }));
    const M=this.M=Math.max(1,Math.floor((N-2)/2)+1);
    this.pvals=[];
    for(let j=0;j<M;j++){ const row=[];
      for(let i=0;i<M;i++){ const c=[this.vals[2*j][2*i],this.vals[2*j][2*i+1],this.vals[2*j+1][2*i],this.vals[2*j+1][2*i+1]];
        row.push(this.poolfn==='max'?Math.max(...c):(c[0]+c[1]+c[2]+c[3])/4); }
      this.pvals.push(row); }
  }
  cellCol(v){ return v>=0?[PAL.mem,v]:[PAL.err,-v]; }
  paintFm(r){ const j=Math.floor(r/this.N), i=r%this.N; const [c,v]=this.cellCol(this.vals[j][i]); this.fm.set(i,j,c,v); }
  paintPool(r){ const j=Math.floor(r/this.M), i=r%this.M; const [c,v]=this.cellCol(this.pvals[j][i]); this.pm.set(i,j,c,v); }
  repaint(){ for(let r=0;r<this.reveal;r++) this.paintFm(r); for(let r=0;r<this.preveal;r++) this.paintPool(r); }
  killLab(l){ if(l){ this.root.remove(l); l.material.map.dispose(); l.material.dispose(); } }
  killMesh(vx){ if(vx){ this.root.remove(vx.mesh); const ix=this.pick.indexOf(vx.mesh); if(ix>=0)this.pick.splice(ix,1); vx.mesh.dispose(); vx.mesh.material.dispose(); } }
  rebuildFmLab(){ this.killLab(this.fmLab);
    this.fmLab=this.lab('feature map '+this.N+'×'+this.N+(this.relu?' · after ReLU':' · raw (red = negative)'),-0.9,3.6+this.N*0.2+0.55,0,{h:0.4,mono:false,font:36,bold:700,color:this.relu?'#eef3ff':'#ffb4c2'}); }
  rebuildPoolLab(){ this.killLab(this.poolLab); const pY=3.6-this.N*0.2-1.35-this.M*0.2;
    this.poolLab=this.lab(this.poolfn+' pool 2×2, S=2 → '+this.M+'×'+this.M+' · 0 params',-0.9,pY-this.M*0.2-0.5,0,{h:0.36,color:'#7ce8bd'}); }
  buildMaps(){
    this.killMesh(this.fm); this.killMesh(this.pm);
    if(this.parrow){ this.root.remove(this.parrow); this.parrow.traverse(m=>m.material&&m.material.dispose()); }
    const N=this.N, M=this.M;
    this.fm=voxels(N,N,0.4); this.fm.mesh.position.set(-0.9,3.6,0); this.add(this.fm.mesh);
    for(let j=0;j<N;j++)for(let i=0;i<N;i++) this.fm.set(i,j,PAL.mem,0);
    this.fm.mesh.userData.tip=h=>{ const {i,j}=this.fm.idx(h.instanceId); const shown=j*N+i<this.reveal;
      return 'feature['+j+','+i+']'+(shown?' = '+this.vals[j][i].toFixed(2):'')+' — click: its 3×3 receptive field'; };
    this.fm.mesh.userData.onClick=(o,h)=>{ const {i,j}=this.fm.idx(h.instanceId);
      this.phase='conv'; this.k=j*N+i; this.reveal=Math.max(this.reveal,this.k+1); this.repaint(); this.hold=this.t+2.5; this.placeCursor();
      this.note('this ONE cell sees only a 3×3 patch — its receptive field. Stack another conv and it grows: 1+L·(K−1)'); };
    this.pick.push(this.fm.mesh);
    const fmB=3.6-N*0.2, pTop=fmB-1.35, pY=pTop-M*0.2;
    this.pm=voxels(M,M,0.4); this.pm.mesh.position.set(-0.9,pY,0); this.add(this.pm.mesh);
    for(let j=0;j<M;j++)for(let i=0;i<M;i++) this.pm.set(i,j,PAL.mem,0);
    this.pm.mesh.userData.tip=h=>{ const {i,j}=this.pm.idx(h.instanceId); const shown=j*M+i<this.preveal;
      return 'pooled['+j+','+i+']'+(shown?' = '+this.pvals[j][i].toFixed(2):'')+' — '+this.poolfn+' of a 2×2 window. Click to see it'; };
    this.pm.mesh.userData.onClick=(o,h)=>{ const {i,j}=this.pm.idx(h.instanceId);
      if(this.reveal<this.N*this.N){ this.reveal=this.N*this.N; this.k=this.N*this.N; this.repaint(); }
      this.phase='pool'; this.pk=j*M+i; this.preveal=Math.max(this.preveal,this.pk+1); this.repaint(); this.hold=this.t+2.5; this.placeCursor();
      this.note(this.poolfn==='max'?'max-pool keeps the strongest response — shift the input 1px and this cell barely changes (invariance). And it has NO weights':'avg-pool blends the window — smoother, less selective. Still no weights'); };
    this.pick.push(this.pm.mesh);
    this.parrow=arrow(V(-0.9,fmB-0.18,0),V(-0.9,pTop+0.14,0),{r:0.045,color:PAL.mem,em:0.6}); this.add(this.parrow);
    this.rebuildFmLab(); this.rebuildPoolLab();
  }
  restart(){ this.k=0; this.reveal=0; this.pk=0; this.preveal=0; this.phase='conv'; this.hold=0;
    for(let j=0;j<this.N;j++)for(let i=0;i<this.N;i++) this.fm.set(i,j,PAL.mem,0);
    for(let j=0;j<this.M;j++)for(let i=0;i<this.M;i++) this.pm.set(i,j,PAL.mem,0);
    this.placeCursor(); }
  placeCursor(){
    const N=this.N, M=this.M;
    if(this.phase==='conv'){
      this.frame.visible=true; this.rays.forEach(r=>r.visible=true);
      this.pframe.visible=false; this.prays.forEach(r=>r.visible=false);
      const kk=Math.max(0,Math.min(N*N-1,Math.floor(this.k)));
      const j=Math.floor(kk/N), i=kk%N, ax=i*this.stride-this.pad, ay=j*this.stride-this.pad;
      const c=this.img.pos(ax+1,ay+1).add(this.img.mesh.position); c.z=0.3;
      this.frame.position.copy(c);
      const tgt=this.fm.pos(i,j).add(this.fm.mesh.position);
      let r=0;
      for(let u=0;u<3;u++)for(let w=0;w<3;w++){
        const src=this.img.pos(ax+w,ay+u).add(this.img.mesh.position); src.z=0.25;
        orient(this.rays[r++],src,tgt,0.012); }
      const shown=kk<this.reveal;
      this.readout([['H′ = ⌊(W−K+2P)/S⌋+1','⌊(14−3+'+(2*this.pad)+')/'+this.stride+'⌋+1 = '+N],['kernel',this.kname+' · 9 shared weights'],['position','('+j+','+i+')'],['value',shown?this.vals[j][i].toFixed(2):'…']]);
    } else {
      this.frame.visible=false; this.rays.forEach(r=>r.visible=false);
      this.pframe.visible=true; this.prays.forEach(r=>r.visible=true);
      const kk=Math.max(0,Math.min(M*M-1,Math.floor(this.pk)));
      const j=Math.floor(kk/M), i=kk%M;
      const c=this.fm.pos(2*i,2*j).add(this.fm.pos(2*i+1,2*j+1)).multiplyScalar(0.5).add(this.fm.mesh.position); c.z=0.3;
      this.pframe.position.copy(c);
      const tgt=this.pm.pos(i,j).add(this.pm.mesh.position);
      let r=0;
      for(let u=0;u<2;u++)for(let w=0;w<2;w++){
        const src=this.fm.pos(2*i+w,2*j+u).add(this.fm.mesh.position); src.z=0.25;
        orient(this.prays[r++],src,tgt,0.012); }
      const shown=kk<this.preveal;
      this.readout([['pool: ⌊(H−K)/S⌋+1','⌊('+N+'−2)/2⌋+1 = '+M],['mode',this.poolfn+' · 0 params'],['window','2×2 @ ('+(2*j)+','+(2*i)+')'],['value',shown?this.pvals[j][i].toFixed(2):'…']]);
    }
  }
  buildPipeline(){
    const G=new THREE.Group(); G.position.set(4.6,3.4,0); G.scale.setScalar(0.75); this.add(G);
    const stage=(x,w,h,d,c,name,tip)=>{ const b=box(w,h,d,c,{opacity:0.2}); b.position.x=x; G.add(b);
      const eg=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w,h,d)),new THREE.LineBasicMaterial({color:c,transparent:true,opacity:0.75}));
      eg.position.x=x; G.add(eg);
      const l=label(name,{h:0.3,color:'#9fb4dd'}); l.position.set(x,-h/2-0.45,0); G.add(l);
      if(tip){ b.userData.tip=tip; this.pick.push(b); } return b; };
    stage(0,2.0,2.0,0.14,PAL.input,'1×14×14','the input, C×H×W (an RGB image would be 3×14×14)');
    stage(1.9,1.7,1.7,0.6,PAL.mem,'conv→ 4×12×12','4 filters, each 1×3×3 — filters always span the FULL input depth. Params: 4·(1·3·3+1) = 40, shared everywhere');
    stage(3.5,0.9,0.9,0.6,PAL.mem,'pool→ 4×6×6','max 2×2, S=2: spatial ÷2, channels kept — and 0 learnable params');
    stage(4.9,0.65,0.65,1.1,PAL.mem,'conv→ 8×4×4','8 filters of 4×3×3. Deeper cells see LARGER receptive fields: 1+L·(K−1), doubled again by pooling');
    stage(6.2,0.16,2.2,0.16,0xdde7ff,'flatten→ 128','unroll 8·4·4 = 128 into a vector — geometry ends here');
    stage(7.3,0.5,1.4,0.3,PAL.attn,'FC→ 10','the dense head (station 03). In LeNet/AlexNet nearly ALL parameters live in these FC layers');
    const probs=softmax([0.5,0.2,0.4,0.3,0.1,0.35,0.25,3.2,0.3,0.5]);
    for(let d=0;d<10;d++){ const b=box(0.16,Math.max(0.05,probs[d]*2.2),0.16,d===7?PAL.input:0x3a4a6b,{em:d===7?0.8:0.2});
      b.position.set(8.6+(d%5)*0.28, probs[d]*1.1-0.8, d<5?0.3:-0.3); G.add(b); }
    const l7=label('“7” — softmax',{h:0.3,color:'#67e8f9'}); l7.position.set(9.2,1.4,0); G.add(l7);
    const tr=label('LeNet-5 recipe (1998): [Conv→ReLU→Pool]×N → flatten → FC · spatial ↓, channels ↑',{h:0.33,color:'#ffd9a0'});
    tr.position.set(4.4,-2.15,0); G.add(tr);
  }
  buildStrip(){
    const y0=-0.75, sc=0.062;
    this.lab('the CNN decade — ImageNet top-5 error (%)',7.4,y0-1.0,0,{h:0.37,mono:false,font:34,bold:700,color:'#eef3ff'});
    IMGNET.forEach((e,i)=>{ const nm=e[0], err=e[1], col=e[2], tip=e[3];
      const h=Math.max(0.16,err*sc), x=5.0+i*1.2;
      const b=box(0.6,h,0.3,col,{em:0.45,opacity:0.92}); b.position.set(x,y0+h/2,0);
      b.userData.tip=tip; b.userData.onClick=()=>this.note(tip,4600); this.add(b); this.pick.push(b);
      this.lab(err.toFixed(1),x,y0+h+0.2,0,{h:0.26,color:'#e8eeff'});
      this.lab(nm,x,y0-0.3,0,{h:0.23,color:'#8ea3c8'});
    });
    const base=box(5.9,0.03,0.03,0x44557a,{em:0.3}); base.position.set(7.4,y0,0); this.add(base);
    const hl=box(5.6,0.022,0.022,0xdde7ff,{em:0.6,opacity:0.8}); hl.position.set(7.4,y0+5.1*sc,0); this.add(hl);
    this.lab('human ≈ 5.1',10.75,y0+5.1*sc,0,{h:0.24,color:'#8ea3c8'});
  }
  onParam(k,v){
    if(k==='kernel'){ this.kname=v; this.computeMap(); this.restart();
      this.note(v==='blur'?'blur kernel: averages — smooths detail away':'this kernel fires on '+v+' edges'+(this.relu?'':' — red = the opposite polarity')); }
    else if(k==='pad'){ this.pad=String(v).indexOf('1')===0?1:0; this.ring.visible=this.pad===1; this.computeMap(); this.buildMaps(); this.restart();
      this.note(this.pad?'“same” padding: P=(K−1)/2=1 → output size = input size. No more shrinking':'no padding: every conv shrinks the map by K−1=2 — deep stacks would erode to nothing'); }
    else if(k==='stride'){ this.stride=+v; this.computeMap(); this.buildMaps(); this.restart();
      this.note(this.stride===2?'stride 2: the kernel jumps 2px → downsampling INSIDE the conv (AlexNet’s first layer used S=4)':'stride 1: every position visited'); }
    else if(k==='relu'){ this.relu=!!v; this.computeMap(); this.repaint(); this.rebuildFmLab();
      this.note(this.relu?'ReLU: max(0,z) — negatives clipped. This nonlinearity is why stacking convs builds anything new':'raw conv outputs: red = negative. Two convs with nothing between = ONE conv (linear∘linear is linear)'); }
    else if(k==='pool'){ this.poolfn=v; this.computeMap(); this.repaint(); this.rebuildPoolLab();
      this.note(v==='max'?'max: keep the single strongest activation per window — invariance to small shifts':'average: blend the window — gentler; modern nets end with global average pooling'); }
  }
  update(dt){
    if(this.playing&&this.t>this.hold){
      if(this.phase==='conv'){
        this.k+=dt*26;
        while(this.reveal<Math.min(this.N*this.N,Math.floor(this.k))) this.paintFm(this.reveal++);
        if(this.k>=this.N*this.N){ this.phase='pool'; this.pk=0; }
      } else {
        this.pk+=dt*9;
        while(this.preveal<Math.min(this.M*this.M,Math.floor(this.pk))) this.paintPool(this.preveal++);
        if(this.pk>=this.M*this.M+3) this.restart();
      }
    }
    this.placeCursor();
    this.pacc+=dt;
    if(this.pacc>2.6&&this.playing&&!this.calm()){ this.pacc=0;
      const xs=[0,1.9,3.5,4.9,6.2,7.3,8.8].map(x=>V(4.6+x*0.75,3.4,0));
      this.P.spawn(xs,{color:0x7fd8f0,size:0.09,speed:5});
    }
  }
};

}
{

const RWORDS=['the','cat','sat','on','a','mat','and','then','it','fell','asleep','after','dark','.'];
REG.rnn = class extends SceneBase {
  cam(){ return {pos:[2.4,4,18], target:[2.4,1.7,0]}; }
  build(){
    this.n=8; this.stepIdx=0; this.unrolled=false; this.acc=0; this.hcol=new THREE.Color(0x34d399);
    const R=this.rolled=new THREE.Group(); this.add(R);
    const cell=box(2.6,1.6,1.1,0x1d4a3c,{em:0.3}); R.add(cell);
    const cl=label('RNN cell',{h:0.4,mono:false,font:36,bold:700,color:'#d7fff0'}); cl.position.set(0,0,0.8); R.add(cl);
    R.add(arrow(V(0,-2.4,0),V(0,-0.9,0),{r:0.05,color:PAL.input})); const xl=label('x\u209c',{h:0.38,color:'#67e8f9'}); xl.position.set(0.6,-1.8,0); R.add(xl);
    R.add(arrow(V(0,0.9,0),V(0,2.4,0),{r:0.05,color:0xdde7ff})); const yl=label('y\u209c',{h:0.38,color:'#e8eeff'}); yl.position.set(0.6,1.9,0); R.add(yl);
    this.loopPts=[V(1.5,0.5,0),V(3.1,1.5,0),V(0,2.9,0.6),V(-3.1,1.5,0),V(-1.5,0.5,0)];
    R.add(tube(this.loopPts,{r:0.06,color:PAL.mem,em:0.7}));
    const tipc=new THREE.Mesh(SHARED.cone,mat(PAL.mem,{em:0.7})); tipc.scale.set(0.18,0.34,0.18);
    tipc.position.set(-1.55,0.62,0); tipc.quaternion.setFromUnitVectors(V(0,1,0),V(1,-0.9,0).normalize()); R.add(tipc);
    const ll=label('h \u2014 the memory \u2014 feeds back',{h:0.36,color:'#7ce8bd'}); ll.position.set(0,3.5,0.6); R.add(ll);
    const hint=label('a network with a LOOP \u2014 press UNROLL',{h:0.42,font:36,color:'#ffd9a0',bg:'rgba(60,40,8,0.9)'}); hint.position.set(0,-3.4,0); R.add(hint);
    cell.userData.tip='ONE cell. It eats x\u209c and its own previous h\u209c\u208b\u2081.'; this.pick.push(cell);
    this.U=null;
  }
  xs(){ const sp=Math.min(2.5,19.5/(this.n-1)); return Array.from({length:this.n},(_,i)=>(i-(this.n-1)/2)*sp); }
  buildUnrolled(){
    if(this.U){ this.root.remove(this.U); this.pick=this.pick.filter(o=>{ let p=o; while(p){ if(p===this.U) return false; p=p.parent; } return true; }); }
    const U=this.U=new THREE.Group(); this.add(U);
    const xs=this.xs(); this.cells=[]; this.chips=[]; this.bars=[]; this.youts=[]; this.wtags=[];
    xs.forEach((x,i)=>{
      const c=box(Math.min(1.7,xs[1]-xs[0]-0.5||1.7),1.15,0.85,0x1d4a3c,{em:0.3}); c.position.set(x,0.6,0); U.add(c); this.cells.push(c);
      c.userData.tip='t='+(i+1)+' — the SAME cell, same W, applied again'; this.pick.push(c);
      const wt=label('W',{h:0.3,color:'#ffd9a0',bold:700}); wt.position.set(x,0.6,0.5); U.add(wt); this.wtags.push(wt);
      const tl=label('t='+(i+1),{h:0.26,color:'#5c729a',bold:700}); tl.position.set(x,-0.35,0); U.add(tl);
      const chip=label(RWORDS[i],{h:0.42,color:'#07202b',bg:'#67e8f9',bold:700}); chip.position.set(x,-1.5,0); chip.material.opacity=0.15; U.add(chip); this.chips.push(chip);
      if(i<this.n-1) U.add(arrow(V(x+ (c.scale.x/2),0.6,0),V(xs[i+1]-(c.scale.x/2),0.6,0),{r:0.04,color:PAL.mem,em:0.6}));
      const bar=box(0.42,0.01,0.42,hue(i).getHex(),{em:0.6}); bar.position.set(x,3.4,0); U.add(bar); this.bars.push(bar);
      const y=node(0.16,0xffffff,{em:0.1}); y.position.set(x,2.0,0); y.visible=false; U.add(y); this.youts.push(y);
    });
    const bl=label('remaining influence of each word on h',{h:0.34,color:'#7f95b8'}); bl.position.set(0,5.1,0); U.add(bl);
    this.wl=label('same W at every step (weight sharing over TIME)',{h:0.36,color:'#ffd9a0'}); this.wl.position.set(0,-2.6,0); this.wl.material.opacity=0; U.add(this.wl);
    this.orb=node(0.3,PAL.mem,{em:0.9}); this.orb.visible=false; U.add(this.orb);
    this.orb.userData.tip='h \u2014 everything the network remembers, in one vector'; this.pick.push(this.orb);
    this.hlab=label('h\u209c \u2014 hidden state',{h:0.28,color:'#7ce8bd'}); this.hlab.visible=false; U.add(this.hlab);
    U.visible=false;
  }
  onParam(k,v){
    if(k==='unroll'&&!this.unrolled) this.doUnroll();
    else if(k==='len'){ this.n=+v; this.stepIdx=0; this.hcol=new THREE.Color(0x34d399);
      if(this.unrolled){ const old=this.U; this.buildUnrolled(); this.U.visible=true;
        if(old){ this.root.remove(old); } } }
    else if(k==='back'){ this.backward(); }
  }
  doUnroll(){
    this.unrolled=true; this.buildUnrolled();
    this.tween(s=>{ this.rolled.scale.setScalar(Math.max(0.001,1-s)); this.rolled.position.y=s*1.5; },0,1,0.8,{done:()=>{ this.rolled.visible=false; }});
    this.after(0.55,()=>{ this.U.visible=true;
      const xs=this.xs();
      this.cells.forEach((c,i)=>{ const fx=xs[i]; c.position.x=0; const wt=this.wtags[i]; wt.position.x=0;
        this.tween(k=>{ c.position.x=fx*k; wt.position.x=fx*k; },0,1,0.7); });
      this.note('the loop, unspooled: one column per time step');
      this.tween(o=>this.wl.material.opacity=o,0,1,0.8);
    });
  }
  step(){
    if(!this.unrolled){ this.doUnroll(); return; }
    if(this.stepIdx>=this.n){ this.note('done — change sentence length, or toggle the backward pass'); return; }
    const i=this.stepIdx++, xs=this.xs(), x=xs[i];
    const chip=this.chips[i]; this.tween(o=>chip.material.opacity=o,0.15,1,0.4);
    this.P.spawn([V(x,-1.3,0),V(x,0.2,0)],{color:PAL.input,size:0.11,speed:5});
    this.after(0.35,()=>{
      this.cells.forEach(c=>this.tween(k=>c.material.emissiveIntensity=0.3+Math.sin(k*Math.PI)*0.6,0,1,0.55)); this.wtags.forEach(w=>this.tween(k=>w.material.opacity=1-Math.sin(k*Math.PI)*0.6,0,1,0.55));
      this.hcol.lerp(hue(i),0.25);
      if(i===0){ this.orb.visible=true; this.orb.position.set(x,0.6,0.75); this.orb.material.color.copy(this.hcol); this.orb.material.emissive.copy(this.hcol); }
      else { const from=V(xs[i-1],0.6,0.75), to=V(x,0.6,0.75);
        this.P.spawn([from,V((from.x+to.x)/2,1.5,0.75),to],{color:this.hcol.getHex(),size:0.2,speed:6,onDone:()=>{ this.orb.position.copy(to); this.orb.material.color.copy(this.hcol); this.orb.material.emissive.copy(this.hcol); }}); }
      for(let j=0;j<=i;j++){ const inf=Math.pow(0.78,i-j);
        const bar=this.bars[j]; this.tween(s=>{ bar.scale.y=Math.max(0.02,s); bar.position.y=3.4+s/2; },bar.scale.y,inf*1.4,0.5); }
      const y=this.youts[i]; y.visible=true; this.tween(k=>{y.material.emissiveIntensity=k; y.scale.setScalar(0.16*(0.6+0.4*k));},0,1,0.4);
      const inf1=Math.pow(0.78,i);
      this.readout([['step',(i+1)+' / '+this.n],['influence of word 1',(inf1*100).toFixed(inf1<0.1?1:0)+'%'],['W','unchanged — only h updates']]);
      if(i===this.n-1&&this.n>=8) this.note('word 1 is at '+(inf1*100).toFixed(1)+'% — the RNN forgot the beginning');
    });
  }
  backward(){
    if(!this.unrolled||this.stepIdx<2) { this.note('unroll + step a few words first'); return; }
    const xs=this.xs();
    for(let k=0;k<this.stepIdx-1;k++){ const i=this.stepIdx-1-k;
      this.after(k*0.28,()=>{ const size=Math.max(0.015,0.2*Math.pow(0.62,k));
        this.P.spawn([V(xs[i],0.6,0.4),V(xs[i-1],0.6,0.4)],{color:PAL.err,size,speed:7}); });
    }
    this.after((this.stepIdx-1)*0.28,()=>this.note('the SAME shrinking, station 4 — depth is now TIME: vanishing through time'));
  }
  update(dt){
    if(this.playing&&this.unrolled&&this.stepIdx<this.n){ this.acc+=dt; if(this.acc>1.2){ this.acc=0; this.step(); } }
    if(this.hlab&&this.orb){ this.hlab.visible=this.orb.visible; if(this.orb.visible) this.hlab.position.set(this.orb.position.x,this.orb.position.y+0.62,this.orb.position.z); }
  }
};

const BT=['Bob','is','nice','.','Dan','is','evil','.'];
const CH=['subject','feeling','sentence open?','(spare)'];
const MSC=[
  {f:[1,1,1,1],            i:[0.95,0.05,0.70,0.05], g:[0.90,0,0.60,0],   o:[0.30,0.10,0.30,0.10]},
  {f:[0.98,0.97,0.96,0.95], i:[0.05,0.05,0.40,0.05], g:[0,0,0.50,0],     o:[0.85,0.20,0.50,0.10]},
  {f:[0.97,0.95,0.95,0.90], i:[0.05,0.92,0.20,0.05], g:[0,0.85,0,0],     o:[0.30,0.60,0.30,0.10]},
  {f:[0.96,0.94,0.15,0.90], i:[0.05,0.05,0.10,0.05], g:[0,0,-0.20,0],    o:[0.20,0.50,0.20,0.10]},
  {f:[0.07,0.90,0.90,0.90], i:[0.96,0.05,0.70,0.05], g:[-0.75,0,0.60,0], o:[0.35,0.10,0.30,0.10]},
  {f:[0.98,0.97,0.96,0.95], i:[0.05,0.05,0.40,0.05], g:[0,0,0.50,0],     o:[0.85,0.20,0.50,0.10]},
  {f:[0.97,0.25,0.95,0.90], i:[0.05,0.95,0.20,0.05], g:[0,-0.90,0,0],    o:[0.30,0.70,0.30,0.10]},
  {f:[0.95,0.93,0.15,0.90], i:[0.05,0.05,0.05,0.05], g:[0,0,0,0],        o:[0.75,0.85,0.20,0.10]}
];
const MNOTE={
  0:'\u201cBob\u201d \u2192 input gate writes the SUBJECT channel (i\u22480.95 there, \u22480 elsewhere)',
  2:'\u201cnice\u201d \u2192 +0.85 onto the FEELING channel \u2014 other channels untouched',
  3:'full stop: the \u201csentence open?\u201d channel is flushed (f\u22480.15). The subject SURVIVES \u2014 f is a vector',
  4:'new subject! f\u22480.07 WIPES \u201cBob\u201d, i\u22480.96 writes \u201cDan\u201d \u2014 the classic Bob\u2192Dan moment',
  6:'\u201cevil\u201d: forget the old feeling (f\u22480.25), write \u22120.90 \u2014 candidates are SIGNED: negatives subtract',
  7:'end: h = o\u2299tanh(C) reveals subject+feeling \u2014 o chose WHAT to show. Try \u201cride the gradient along C\u201d'
};
REG.lstm = class extends SceneBase {
  cam(){ return {pos:[5.5,3.4,22.5], target:[5.5,2.9,0]}; }
  build(){
    this.view=1; this.sing=0.55; this.acc=0; this.tok=0; this.C=[0,0,0,0]; this.memBusy=false; this.fpBusy=false; this.vlabs=[null,null,null,null];
    this.g1=new THREE.Group(); this.g2=new THREE.Group(); this.g3=new THREE.Group();
    this.add(this.g1); this.add(this.g2); this.add(this.g3);
    this.pick1=[]; this.pick2=[]; this.pick3=[];
    this.buildWhy(); this.buildCell(); this.buildMem();
    this.g2.visible=false; this.g3.visible=false; this.pick=this.pick1;
    this.applySing(false);
    this.after(0.9,()=>{ if(this.view===1) this.fireBack(); });
  }
  // ---------- view 1 \u00b7 WHY: gradient flow through the vanilla RNN ----------
  buildWhy(){
    const G=this.g1, P=this.pick1, xs=this.hx=[-8,-4,0,4,8];
    const L=(t,x,y,z,o)=>{ const s=label(t,o); s.position.set(x,y,z); G.add(s); return s; };
    this.hns=[]; this.gbars=[];
    xs.forEach((x,k)=>{
      const n=node(0.52,0x2f6f58,{em:0.5}); n.position.set(x,2.2,0); G.add(n); this.hns.push(n);
      n.userData.tip='hidden state h'+SUB[k]+' \u2014 the vanilla RNN\u2019s ONLY memory, rewritten through W every step'; P.push(n);
      L('h'+SUB[k],x,3.05,0,{h:0.34,color:'#7ce8bd'});
      if(k>0){
        G.add(arrow(V(xs[k-1]+0.65,2.2,0),V(x-0.65,2.2,0),{r:0.045,color:PAL.mem,em:0.6}));
        const tag=L('\u00d7 W\u1d40 \u00b7 tanh\u2032',(x+xs[k-1])/2,1.45,0,{h:0.3,color:'#ffb27a',bg:'rgba(40,22,6,0.92)'});
        tag.userData.tip='one backward hop = one MORE factor of W\u1d40 and tanh\u2032 \u2014 h\u2080\u2019s gradient collects MANY factors of W (and repeated tanh)'; P.push(tag);
        L('x'+SUB[k],x,0.35,0,{h:0.34,color:'#07202b',bg:'#67e8f9',bold:700});
        G.add(arrow(V(x,0.72,0),V(x,1.5,0),{r:0.032,color:PAL.input}));
      }
      const bar=box(0.5,0.03,0.5,PAL.err,{em:0.7}); bar.position.set(x,4.35,0); G.add(bar); this.gbars.push(bar);
      bar.userData.tip=()=>'gradient reaching h'+SUB[k]+' \u2248 \u03c3^'+(4-k)+' = '+Math.pow(this.sing,4-k).toFixed(3); P.push(bar);
    });
    const Lf=node(0.34,PAL.err,{em:0.9}); Lf.position.set(8.9,3.5,0); G.add(Lf);
    Lf.userData.tip='the loss \u2014 every gradient starts here and must swim back to h\u2080'; P.push(Lf);
    L('loss L',8.9,4.25,0,{h:0.34,color:'#ff9db0'});
    G.add(arrow(V(8.7,3.2,0),V(8.25,2.65,0),{r:0.04,color:PAL.err}));
    L('gradient arriving at each step (\u03c3\u1d4f)',0,5.65,0,{h:0.32,color:'#7f95b8'});
    L('the vanilla RNN, unrolled \u2014 every backward hop re-multiplies by W\u1d40 \u00b7 tanh\u2032',0,-0.9,0,{h:0.42,mono:false,font:34,bold:700,color:'#ff9db0'});
    L('\u2202L/\u2202h\u2080 \u221d (W\u1d40tanh\u2032)\u2074 \u00b7 \u03c3max<1 \u2192 VANISH \u00b7 \u03c3max>1 \u2192 EXPLODE',0,-1.75,0,{h:0.34,color:'#ffd9a0'});
    this.ceil=new THREE.Group(); this.ceil.position.set(0,6.7,0); G.add(this.ceil);
    const slab=box(19,0.07,1.1,PAL.err,{opacity:0.4,em:0.8}); this.ceil.add(slab);
    slab.userData.tip='fix #1 \u2014 gradient clipping: rescale when the norm gets too big. Saves EXPLODING; useless against vanishing (you can\u2019t rescale zero)'; P.push(slab);
    const cl=label('gradient clipping ceiling \u2014 rescale if \u2016g\u2016 too big (rescues EXPLODING only)',{h:0.3,color:'#ff9db0'}); cl.position.set(0,0.55,0); this.ceil.add(cl);
    this.clipFlash=label('CLIPPED \u2014 rescaled \u2702',{h:0.4,color:'#0a0f1c',bg:'#ff9db0',bold:700}); this.clipFlash.visible=false; G.add(this.clipFlash);
  }
  applySing(anim){
    const s=this.sing;
    if(this.ceil) this.ceil.visible=s>1.02;
    this.gbars.forEach((b,k)=>{ const h=Math.min(Math.pow(s,4-k)*1.15,2.0);
      if(anim===false){ b.scale.y=Math.max(0.03,h); b.position.y=4.35+b.scale.y/2; }
      else this.tween(v=>{ b.scale.y=Math.max(0.03,v); b.position.y=4.35+v/2; },b.scale.y,h,0.25); });
    this.readout([['\u03c3max(W)',s.toFixed(2)],['after 4 hops','\u03c3\u2074 = '+Math.pow(s,4).toFixed(3)],['regime',s<0.97?'VANISHING':s>1.03?'EXPLODING':'knife-edge']]);
  }
  fireBack(){
    const s=this.sing; let clipped=false;
    for(let k=0;k<4;k++){
      this.after(0.15+k*0.62,()=>{
        let m=Math.pow(s,k+1);
        if(s>1.02&&m>1.3){ if(!clipped){ clipped=true;
            this.clipFlash.visible=true; this.clipFlash.position.set(this.hx[3-k],6.0,0.4);
            this.after(1.1,()=>this.clipFlash.visible=false); }
          m=Math.min(m,1.3); }
        this.P.spawn([V(this.hx[4-k],2.2,0.4),V(this.hx[3-k],2.2,0.4)],{color:PAL.err,size:Math.max(0.028,0.26*Math.min(m,2.0)),speed:5});
        const n=this.hns[3-k]; this.tween(q=>n.material.emissiveIntensity=0.5+Math.sin(q*Math.PI)*0.7,0,1,0.5);
      });
    }
    this.after(2.9,()=>{
      const p4=Math.pow(s,4);
      if(s<0.9) this.note('at h\u2080 only '+(p4*100).toFixed(1)+'% is left \u2014 too weak to teach word 1 anything. Clipping can\u2019t help: the fix is to CHANGE THE CELL \u2192 view 2',3400);
      else if(s>1.1) this.note(clipped?'exploding \u2192 hit the ceiling \u2192 CLIPPED to a sane size (fix #1). Now drag \u03c3 below 1 \u2014 the case clipping can\u2019t save':'exploding \u2014 growing every hop',3200);
      else this.note('\u03c3\u22481 survives\u2026 but training moves W every step \u2014 nobody can sit on the knife-edge',3000);
    });
  }
  // ---------- view 2 \u00b7 INSIDE: the LSTM cell in its chain ----------
  mkValve(p,vert,tip,P){
    const g=new THREE.Group(); g.position.copy(p);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.46,0.055,12,40),mat(PAL.weight,{em:0.85}));
    const plate=new THREE.Mesh(SHARED.cyl,mat(0x0a0f1c,{flat:true}));
    if(vert){ ring.rotation.x=Math.PI/2; } else { ring.rotation.y=Math.PI/2; plate.rotation.z=Math.PI/2; }
    g.add(ring); g.add(plate);
    g.userData.tip=tip; P.push(g);
    const st={g,plate,val:0.5};
    this.paintValve(st,0.5);
    return st;
  }
  paintValve(st,v){ st.val=v; const s=Math.max(0.03,1-v)*0.43; st.plate.scale.set(s,0.05,s); }
  tweenValve(st,v){ const v0=st.val; this.tween(k=>this.paintValve(st,v0+(v-v0)*k),0,1,0.45); }
  buildCell(){
    const G=this.g2, P=this.pick2;
    const L=(t,x,y,z,o)=>{ const s=label(t,o); s.position.set(x,y,z); G.add(s); return s; };
    const seg=(a,b,r,c,op)=>{ const m=link(a,b,{r,color:c,em:0.8,opacity:op===undefined?0.9:op}); G.add(m); return m; };
    const shell=box(11.4,5.6,2.5,0x3a4a6b,{opacity:0.05}); shell.material.depthWrite=false; shell.renderOrder=-1; shell.position.set(0,2.55,0); G.add(shell);
    const eg=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(11.4,5.6,2.5)),new THREE.LineBasicMaterial({color:0x33415e,transparent:true,opacity:0.6})); eg.position.set(0,2.55,0); G.add(eg);
    L('inside the LSTM cell',0,5.9,0,{h:0.46,mono:false,font:36,bold:700,color:'#eef3ff'});
    const tipC='cell state C \u2014 the long-term line. Count what sits on it: one \u2299 and one + \u2014 NO W, no tanh chain';
    this.cIn=seg(V(-7.4,4.2,0),V(-2.06,4.2,0),0.09,PAL.mem); this.cIn.userData.tip=tipC; P.push(this.cIn);
    seg(V(-1.14,4.2,0),V(0.5,4.2,0),0.09,PAL.mem);
    this.cOut=seg(V(1.1,4.2,0),V(6.6,4.2,0),0.09,PAL.mem); this.cOut.userData.tip=tipC; P.push(this.cOut);
    G.add(arrow(V(6.6,4.2,0),V(7.45,4.2,0),{r:0.09,color:PAL.mem,em:0.8}));
    L('C\u209c\u208b\u2081',-6.6,4.65,0,{h:0.4,color:'#7ce8bd',bold:700});
    L('C\u209c',6.75,4.65,0,{h:0.4,color:'#7ce8bd',bold:700});
    L('THE HIGHWAY: C\u209c = f\u2299C\u209c\u208b\u2081 + i\u2299g\u0303 \u2014 only \u2299 and +, no W anywhere on this line',0,5.2,0,{h:0.32,color:'#7ce8bd'});
    this.vF=this.mkValve(V(-1.6,4.2,0),false,'\u2299 forget valve: element-wise multiply by f \u2014 the ONLY thing old memories pass through. f\u22481 \u21d2 memory AND gradient ride through almost untouched',P); G.add(this.vF.g);
    L('\u2299 f',-1.6,3.45,0,{h:0.3,color:'#ffd9a0'});
    const plus=node(0.3,0xf1f5ff,{em:0.7}); plus.position.set(0.8,4.2,0); G.add(plus);
    plus.userData.tip='ADDITION \u2014 the whole secret: backprop passes through + UNCHANGED \u2014 uninterrupted gradient flow, the same trick ResNet uses'; P.push(plus);
    L('+',0.8,4.85,0,{h:0.42,color:'#f1f5ff',bold:700});
    const mult=node(0.17,0xdde7ff,{em:0.6}); mult.position.set(0.8,3.25,0); G.add(mult);
    mult.userData.tip='i \u2299 g\u0303 \u2014 how much (i) of what (g\u0303) gets written into C'; P.push(mult);
    L('i\u2299g\u0303',1.38,3.25,0,{h:0.28,color:'#9fb4dd'});
    G.add(arrow(V(0.8,3.45,0),V(0.8,3.85,0),{r:0.04,color:0xdde7ff}));
    G.add(arrow(V(-7.4,1.0,0),V(-5.3,1.0,0),{r:0.05,color:0xdde7ff}));
    const stackN=node(0.22,0xdde7ff,{em:0.6}); stackN.position.set(-5.0,1.0,0); G.add(stackN);
    stackN.userData.tip='concatenate [h\u209c\u208b\u2081, x\u209c] \u2014 exactly what the vanilla cell eats. Same plug, new insides'; P.push(stackN);
    L('[h\u209c\u208b\u2081, x\u209c]',-5.0,0.38,0,{h:0.3,color:'#9fb4dd'});
    G.add(arrow(V(-5.0,-1.5,0),V(-5.0,0.72,0),{r:0.04,color:PAL.input}));
    L('x\u209c',-5.55,-1.25,0,{h:0.38,color:'#67e8f9',bold:700});
    L('h\u209c\u208b\u2081',-6.6,1.45,0,{h:0.38,color:'#e8eeff',bold:700});
    seg(V(-4.78,1.0,0),V(-3.95,1.0,0),0.05,0xdde7ff);
    this.Wbox=box(1.6,1.6,1.05,PAL.weight,{em:0.5}); this.Wbox.position.set(-3.1,1.0,0); G.add(this.Wbox);
    this.Wbox.userData.tip='the ONE matrix (4h\u00d72h): from [h\u209c\u208b\u2081,x\u209c] it computes ALL FOUR vectors f, i, g\u0303, o in a single multiply'; P.push(this.Wbox);
    L('W',-3.1,1.0,0.6,{h:0.55,color:'#2b1503',bold:700});
    L('4h \u00d7 2h \u2014 the ONLY matrix in the cell',-3.1,-0.08,0,{h:0.26,color:'#ffd9a0'});
    const chip=(t,x,y,role,tip)=>{ const c=L(t,x,y,0,{h:0.38,color:'#ffd9a0',bg:'rgba(58,42,8,0.95)',bold:700}); c.userData.tip=tip; P.push(c); L(role,x,y-0.52,0,{h:0.24,color:'#8ea3c8'}); return c; };
    chip('f \u03c3',-1.6,2.55,'erase?','forget gate f (\u03c3 \u2192 0..1): per channel, what fraction of the OLD memory survives');
    chip('i \u03c3',0.15,2.55,'write?','input gate i: per channel, how much of the new candidate gets written');
    chip('g\u0303 tanh',1.75,2.55,'content \u00b1','candidate g\u0303 = tanh(\u2026): the CONTENT to write, signed \u22121..1 \u2014 negative values SUBTRACT');
    chip('o \u03c3',2.75,1.9,'reveal?','output gate o: how much of C to reveal as h\u209c');
    seg(V(-3.0,1.82,0),V(-1.66,2.32,0),0.028,0x44557a);
    seg(V(-2.8,1.82,0),V(0.05,2.32,0),0.028,0x44557a);
    seg(V(-2.65,1.75,0),V(1.6,2.33,0),0.028,0x44557a);
    seg(V(-2.55,1.5,0),V(2.6,1.83,0),0.028,0x44557a);
    seg(V(-1.6,2.75,0),V(-1.6,3.72,0),0.028,0x44557a);
    seg(V(0.22,2.75,0),V(0.72,3.06,0),0.028,0x44557a);
    seg(V(1.7,2.75,0),V(0.92,3.08,0),0.028,0x44557a);
    seg(V(2.85,2.05,0),V(3.5,2.22,0),0.028,0x44557a);
    seg(V(3.6,4.08,0),V(3.6,3.55,0),0.05,0x67e8f9,0.8);
    const tch=L('tanh',3.6,3.32,0,{h:0.3,color:'#67e8f9',bg:'rgba(14,47,74,0.95)'});
    tch.userData.tip='squash C to \u00b11 before revealing \u2014 a branch OFF the highway, not a tollgate on it'; P.push(tch);
    seg(V(3.6,3.1,0),V(3.6,2.66,0),0.05,0x67e8f9,0.8);
    this.vO=this.mkValve(V(3.6,2.35,0),true,'\u2299 output valve: h\u209c = o \u2299 tanh(C\u209c) \u2014 h is the REDACTED public copy of C',P); G.add(this.vO.g);
    L('\u2299 o',4.35,2.35,0,{h:0.3,color:'#ffd9a0'});
    seg(V(3.6,2.05,0),V(3.6,1.1,0),0.05,0xbde8ff,0.8);
    seg(V(-2.3,1.0,0),V(3.6,1.0,0),0.035,0x44557a,0.22);
    seg(V(3.6,1.0,0),V(6.6,1.0,0),0.06,0xdde7ff);
    G.add(arrow(V(6.6,1.0,0),V(7.45,1.0,0),{r:0.06,color:0xdde7ff}));
    L('h\u209c',6.75,1.45,0,{h:0.38,color:'#e8eeff',bold:700});
    G.add(arrow(V(5.5,1.15,0),V(5.5,2.5,0),{r:0.035,color:0x8ea3c8}));
    L('y\u209c',5.95,2.25,0,{h:0.32,color:'#9fb4dd'});
    L('TWO states leave every step: C (long-term, private) above \u00b7 h (short-term, public \u2014 feeds the output) below',0,-1.15,0,{h:0.3,color:'#8ea3c8'});
    L('\u25a0 amber chips = learned layers (\u03c3/tanh, weights from W) \u00b7 \u25cb rings & + = pointwise ops (\u2299, +) \u2014 NO weights',0,-1.85,0,{h:0.27,color:'#5c729a'});
    // ghost neighbours: the chain
    [[-9.4,'t\u22121'],[9.4,'t+1']].forEach(pr=>{
      const gx=pr[0];
      const gb=box(3.0,4.4,2.2,0x18243c,{opacity:0.22}); gb.material.depthWrite=false; gb.position.set(gx,2.55,0); G.add(gb);
      const ge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.0,4.4,2.2)),new THREE.LineBasicMaterial({color:0x2a3a5c,transparent:true,opacity:0.5})); ge.position.set(gx,2.55,0); G.add(ge);
      gb.userData.tip='the SAME cell at '+pr[1]+' \u2014 one set of gates, one W, reused across time. C and h thread through the whole chain'; P.push(gb);
      L('the same cell',gx,2.75,0,{h:0.3,color:'#5c729a'});
      L(pr[1],gx,2.2,0,{h:0.3,color:'#44557a'});
      seg(V(gx-1.5,4.2,0),V(gx+1.5,4.2,0),0.07,PAL.mem,0.3);
      seg(V(gx-1.5,1.0,0),V(gx+1.5,1.0,0),0.045,0xdde7ff,0.3);
      G.add(arrow(V(gx,-1.1,0),V(gx,0.45,0),{r:0.03,color:0x1a5f70}));
      L(gx<0?'x\u209c\u208b\u2081':'x\u209c\u208a\u2081',gx+0.55,-0.85,0,{h:0.28,color:'#3d7a8a'});
      G.add(arrow(V(gx,4.78,0),V(gx,5.6,0),{r:0.03,color:0x44557a}));
      L(gx<0?'h\u209c\u208b\u2081':'h\u209c\u208a\u2081',gx+0.6,5.45,0,{h:0.28,color:'#5c729a'});
    });
    seg(V(-10.9,4.2,0),V(-7.4,4.2,0),0.07,PAL.mem,0.3); seg(V(7.45,4.2,0),V(10.9,4.2,0),0.07,PAL.mem,0.3);
    seg(V(-10.9,1.0,0),V(-7.4,1.0,0),0.045,0xdde7ff,0.3); seg(V(7.45,1.0,0),V(10.9,1.0,0),0.045,0xdde7ff,0.3);
    this.buildVanCard(G,P); this.buildGruCard(G,P);
  }
  buildVanCard(G,P){
    const g=new THREE.Group(); g.position.set(-4.5,-3.35,0); G.add(g);
    const L=(t,x,y,z,o)=>{ const s=label(t,o); s.position.set(x,y,z); g.add(s); return s; };
    L('the OLD cell (station 06)',0,1.0,0,{h:0.3,mono:false,font:32,bold:700,color:'#ff9db0'});
    L('[h\u209c\u208b\u2081, x\u209c]',-2.6,0,0,{h:0.28,color:'#9fb4dd'});
    g.add(arrow(V(-1.85,0,0),V(-1.2,0,0),{r:0.03,color:0x8ea3c8}));
    const w=box(0.85,0.85,0.55,0xf43f5e,{em:0.45}); w.position.set(-0.7,0,0); g.add(w);
    w.userData.tip='in the vanilla cell EVERYTHING \u2014 memory included \u2014 is shoved through W and tanh, every single step. That\u2019s the crusher from view 1'; P.push(w);
    L('W',-0.7,0,0.35,{h:0.34,color:'#2b0509',bold:700});
    g.add(arrow(V(-0.2,0,0),V(0.42,0,0),{r:0.03,color:0x8ea3c8}));
    L('tanh',0.92,0,0,{h:0.28,color:'#67e8f9',bg:'rgba(14,47,74,0.95)'});
    g.add(arrow(V(1.45,0,0),V(2.1,0,0),{r:0.03,color:0x8ea3c8}));
    L('h\u209c',2.55,0,0,{h:0.3,color:'#e8eeff',bold:700});
    L('ONE state \u2014 memory & workspace in the same vector, rewritten through W+tanh each step',0,-0.85,0,{h:0.25,color:'#c78a96'});
  }
  buildGruCard(G,P){
    const g=new THREE.Group(); g.position.set(4.7,-3.35,0); G.add(g);
    const L=(t,x,y,z,o)=>{ const s=label(t,o); s.position.set(x,y,z); g.add(s); return s; };
    L('GRU \u2014 the economy model',0,1.0,0,{h:0.3,mono:false,font:32,bold:700,color:'#7ce8bd'});
    const tip='GRU (Cho et al. 2014): update gate z blends old\u2194new in ONE move, reset gate r; NO separate C \u2014 cheaper, usually just as good';
    const mk=(x,t)=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.045,10,32),mat(PAL.weight,{em:0.8})); r.rotation.y=Math.PI/2; r.position.set(x,0.05,0); g.add(r); L(t,x,-0.55,0,{h:0.26,color:'#ffd9a0'}); r.userData.tip=tip; P.push(r); return r; };
    mk(-0.9,'z \u00b7 update'); mk(0.6,'r \u00b7 reset');
    const ln=link(V(-2.0,0.05,0),V(1.7,0.05,0),{r:0.05,color:PAL.mem,em:0.6,opacity:0.7}); g.add(ln);
    L('2 gates \u00b7 no separate C \u2014 h does both jobs',0,-1.1,0,{h:0.25,color:'#8fd8c8'});
  }
  forwardPass(){
    if(this.fpBusy||this.view!==2) return; this.fpBusy=true; this.after(5.2,()=>this.fpBusy=false);
    const f=0.93,i=0.62,g=0.8,o=0.55;
    this.note('one tick: [h\u209c\u208b\u2081, x\u209c] \u2192 W \u2192 f, i, g\u0303, o \u2014 then C is EDITED, not rewritten');
    this.P.spawn([V(-7.4,1.0,0),V(-5.0,1.0,0)],{color:0xdde7ff,size:0.12,speed:5});
    this.P.spawn([V(-5.0,-1.5,0),V(-5.0,1.0,0)],{color:PAL.input,size:0.12,speed:5});
    this.after(0.55,()=>{ this.P.spawn([V(-5.0,1.0,0),V(-3.1,1.0,0)],{color:0xdde7ff,size:0.14,speed:5,onDone:()=>{ this.tween(k=>this.Wbox.material.emissiveIntensity=0.5+Math.sin(k*Math.PI)*0.9,0,1,0.6); }}); });
    this.after(1.35,()=>{
      [[-1.6,2.55],[0.15,2.55],[1.75,2.55],[2.75,1.9]].forEach((p,q)=>this.after(q*0.08,()=>this.P.spawn([V(-3.1,1.8,0),V(p[0],p[1],0)],{color:PAL.weight,size:0.1,speed:6})));
    });
    this.after(2.15,()=>{
      this.P.spawn([V(-1.6,2.72,0),V(-1.6,3.9,0)],{color:PAL.weight,size:0.08,speed:6,onDone:()=>this.tweenValve(this.vF,f)});
      this.P.spawn([V(0.2,2.72,0),V(0.8,3.25,0)],{color:PAL.weight,size:0.08,speed:6});
      this.P.spawn([V(1.7,2.72,0),V(0.8,3.25,0)],{color:PAL.input,size:0.08,speed:6});
      this.P.spawn([V(2.85,2.05,0),V(3.6,2.35,0)],{color:PAL.weight,size:0.08,speed:6,onDone:()=>this.tweenValve(this.vO,o)});
    });
    this.after(2.8,()=>{
      this.P.spawn([V(-9.4,4.2,0),V(-1.7,4.2,0)],{color:PAL.mem,size:0.2,speed:6});
      this.after(1.35,()=>this.P.spawn([V(-1.5,4.2,0),V(0.7,4.2,0)],{color:PAL.mem,size:0.2*f,speed:5}));
      this.after(1.45,()=>this.P.spawn([V(0.8,3.3,0),V(0.8,4.15,0)],{color:PAL.input,size:0.11,speed:5}));
      this.after(1.95,()=>{ this.P.spawn([V(0.85,4.2,0),V(10.6,4.2,0)],{color:PAL.mem,size:0.23,speed:6});
        this.after(0.35,()=>this.P.spawn([V(3.6,4.2,0),V(3.6,2.5,0),V(3.6,1.0,0),V(10.6,1.0,0)],{color:0xbde8ff,size:0.14*(0.5+o),speed:6})); });
    });
    this.readout([['f \u00b7 i \u00b7 g\u0303 \u00b7 o',f+' \u00b7 '+i+' \u00b7 +'+g+' \u00b7 '+o],['C\u209c','f\u2299C\u209c\u208b\u2081 + i\u2299g\u0303'],['h\u209c','o \u2299 tanh(C\u209c)']]);
  }
  gradBack2(){
    this.note('backward along C: the gradient meets ONLY + and \u2299f \u2014 no W');
    this.P.spawn([V(10.6,4.2,0.35),V(0.95,4.2,0.35)],{color:PAL.err,size:0.24,speed:4.5,onDone:()=>{
      this.note('\u201c+\u201d hands the gradient through UNCHANGED');
      this.P.spawn([V(0.65,4.2,0.35),V(-1.45,4.2,0.35)],{color:PAL.err,size:0.24,speed:4.5,onDone:()=>{
        this.P.spawn([V(-1.75,4.2,0.35),V(-10.6,4.2,0.35)],{color:PAL.err,size:0.22,speed:4.5});
      }});
    }});
    this.after(3.1,()=>{
      this.note('the h-route must still climb back through W \u2014 watch it get crushed');
      this.P.spawn([V(10.6,1.0,0.35),V(-2.4,1.0,0.35)],{color:PAL.err,size:0.2,speed:5,onDone:()=>{
        this.P.spawn([V(-3.8,1.0,0.35),V(-10.6,1.0,0.35)],{color:PAL.err,size:0.04,speed:4});
      }});
    });
    this.after(5.6,()=>{ this.readout([['\u2202 via C','\u00d7 f \u2248 0.95 per step \u2014 alive'],['\u2202 via W (RNN way)','\u00d7 \u03c3\u00b7tanh\u2032 \u226a 1 \u2014 dead'],['the point','uninterrupted gradient flow \u2014 like ResNet']]);
      this.note('THAT is the whole invention: + and \u2299 make C a gradient highway'); });
  }
  // ---------- view 3 \u00b7 THE MEMORY: C as a vector of channels ----------
  buildMem(){
    const G=this.g3, P=this.pick3;
    const L=(t,x,y,z,o)=>{ const s=label(t,o); s.position.set(x,y,z); G.add(s); return s; };
    this.cx=[-4.2,-2.8,-1.4,0]; this.hxs=[2.6,3.6,4.6,5.6];
    const plat=box(5.6,0.12,1.6,0x123528,{em:0.35}); plat.position.set(-2.1,2.2,0); G.add(plat);
    plat.userData.tip='the belt: C rides forward in time, edited by \u2299f and + \u2014 never shoved through W'; P.push(plat);
    const plat2=box(4.4,0.1,1.3,0x1c2843,{em:0.3}); plat2.position.set(4.1,2.2,0); G.add(plat2);
    plat2.userData.tip='h\u209c = o \u2299 tanh(C\u209c): the short-term working copy \u2014 what the output layer and next step\u2019s W actually read'; P.push(plat2);
    L('cell state C\u209c \u2014 LONG-term memory',-2.1,5.45,0,{h:0.4,mono:false,font:34,bold:700,color:'#7ce8bd'});
    L('a VECTOR: one editable channel per slot',-2.1,4.95,0,{h:0.28,color:'#7f95b8'});
    L('hidden state h\u209c \u2014 SHORT-term',4.1,4.7,0,{h:0.36,mono:false,font:34,bold:700,color:'#bde8ff'});
    L('h\u209c = o \u2299 tanh(C\u209c) \u2014 the public copy',4.1,4.28,0,{h:0.26,color:'#7f95b8'});
    this.cbars=[]; this.shut=[];
    this.cx.forEach((x,k)=>{
      const b=box(0.8,0.03,0.8,0x22304a,{em:0.4}); b.position.set(x,2.28,0); G.add(b); this.cbars.push(b);
      b.userData.tip=()=>'channel \u201c'+CH[k]+'\u201d = '+this.C[k].toFixed(2)+' \u2014 one slot of the C vector (real LSTMs: hundreds, rarely this interpretable)'; P.push(b);
      L(CH[k],x,1.5,0,{h:0.26,color:'#9fb4dd'});
      const sh=box(1.0,2.4,0.06,0xf43f5e,{flat:true,opacity:0.5}); sh.position.set(x,2.2,0.75); sh.material.opacity=0; sh.visible=false; G.add(sh); this.shut.push(sh);
    });
    this.hbars=[];
    this.hxs.forEach((x,k)=>{
      const b=box(0.55,0.03,0.55,0x22304a,{em:0.35}); b.position.set(x,2.28,0); G.add(b); this.hbars.push(b);
      b.userData.tip=()=>'h channel \u201c'+CH[k]+'\u201d = o\u2299tanh(C) \u2014 dark when the o gate keeps it private'; P.push(b);
    });
    G.add(arrow(V(0.75,2.9,0),V(2.0,2.9,0),{r:0.035,color:0x8ea3c8}));
    L('tanh',1.35,3.35,0,{h:0.26,color:'#67e8f9',bg:'rgba(14,47,74,0.95)'});
    L('\u2299 o',1.35,2.45,0,{h:0.26,color:'#ffd9a0'});
    this.tchips=BT.map((w,i)=>{ const c=label(w,{h:0.4,color:'#0a2030',bg:'#8fd8c8',bold:700,opacity:0.4});
      c.position.set(-5.6+i*1.6,-1.5,0); G.add(c);
      c.userData.tip='token '+(i+1)+' \u2014 \u201c'+w+'\u201d'; P.push(c); return c; });
    L('the worked example \u2014 \u201cBob is nice. Dan is evil.\u201d \u2014 press step \u25b8',0,-2.45,0,{h:0.32,color:'#8ea3c8'});
    L('kept (f\u22481)  \u00b7  wiped (f\u22480)  \u00b7  written (i\u2299g\u0303, signed: green +, red \u2212)',-0.4,0.6,0,{h:0.27,color:'#5c729a'});
    for(let k=0;k<4;k++){ this.paintBar(this.cbars[k],0); this.paintBar(this.hbars[k],0); this.setValLab(k,0); }
  }
  paintBar(b,v){
    const h=Math.max(0.035,Math.abs(v)*1.7);
    b.scale.y=h; b.position.y=v>=0?2.28+h/2:2.12-h/2;
    const c=Math.abs(v)<0.02?0x22304a:(v>0?0x34d399:0xf43f5e);
    b.material.color.set(c); b.material.emissive.set(c);
  }
  tweenBar(b,v0,v1){ this.tween(k=>this.paintBar(b,v0+(v1-v0)*k),0,1,0.5); }
  setValLab(k,v){
    const old=this.vlabs[k]; if(old){ this.g3.remove(old); old.material.map.dispose(); old.material.dispose(); }
    const s=label((v>0.005?'+':'')+v.toFixed(2),{h:0.3,color:v>0.02?'#7ce8bd':v<-0.02?'#ff9db0':'#5c729a'});
    s.position.set(this.cx[k],4.45,0); this.g3.add(s); this.vlabs[k]=s;
  }
  flashGate(k,txt,bg){
    const s=label(txt,{h:0.28,color:'#0a0f1c',bg:bg,bold:700});
    s.position.set(this.cx[k],3.55,0.5); this.g3.add(s);
    this.after(1.7,()=>{ this.g3.remove(s); s.material.map.dispose(); s.material.dispose(); });
  }
  stepMem(){
    if(this.memBusy) return;
    if(this.tok>=BT.length){ this.note('sentence done \u2014 \u201crestart sentence\u201d, or \u201cride the gradient along C\u201d to see why this trains'); return; }
    this.memBusy=true; this.after(2.1,()=>this.memBusy=false);
    const t=this.tok++, S=MSC[t], w=BT[t], C0=this.C.slice();
    this.tchips.forEach((c,j)=>{ c.material.opacity=j===t?1:(j<t?0.55:0.4); });
    const newC=C0.map((v,k)=>S.f[k]*v+S.i[k]*S.g[k]);
    this.C=newC;
    this.after(0.15,()=>{ // forget phase
      for(let k=0;k<4;k++){
        if(1-S.f[k]>0.12){ const sh=this.shut[k]; sh.visible=true;
          this.tween(o=>sh.material.opacity=o,0,(1-S.f[k])*0.7,0.3,{done:()=>this.after(0.5,()=>this.tween(o=>{sh.material.opacity=o; if(o<0.02)sh.visible=false;},sh.material.opacity,0,0.35))});
        }
        if(S.f[k]<0.5&&Math.abs(C0[k])>0.1) this.flashGate(k,'f='+S.f[k].toFixed(2),'#ff9db0');
        this.tweenBar(this.cbars[k],C0[k],S.f[k]*C0[k]);
      }
    });
    this.after(0.9,()=>{ // write phase
      for(let k=0;k<4;k++){
        const wv=S.i[k]*S.g[k];
        if(Math.abs(wv)>0.08){
          if(S.i[k]>0.5) this.flashGate(k,'i='+S.i[k].toFixed(2)+' \u00b7 g\u0303='+(S.g[k]>0?'+':'')+S.g[k].toFixed(2),S.g[k]>0?'#7ce8bd':'#ffb27a');
          this.P.spawn([V(-5.6+t*1.6,-1.3,0),V(this.cx[k],wv>0?3.2:1.3,0.2)],{color:wv>0?0x34d399:0xf43f5e,size:0.13,speed:7,onDone:()=>this.tweenBar(this.cbars[k],S.f[k]*C0[k],newC[k])});
        }
      }
      this.after(0.8,()=>{ for(let k=0;k<4;k++) this.setValLab(k,newC[k]); });
    });
    this.after(1.6,()=>{ // reveal phase
      for(let k=0;k<4;k++){ const hv=S.o[k]*Math.tanh(newC[k]);
        const b=this.hbars[k]; const cur=(b.scale.y-0.035)*(b.position.y>=2.28?1:-1)/1.7;
        this.tweenBar(b,cur,hv); }
    });
    this.readout([['token','\u201c'+w+'\u201d ('+(t+1)+'/'+BT.length+')'],['f (keep)',S.f.map(x=>x.toFixed(2)).join('  ')],['i\u2299g\u0303 (write)',S.i.map((x,k)=>{const v=x*S.g[k];return (v>0.005?'+':'')+v.toFixed(2);}).join('  ')],['C now',newC.map(x=>(x>0.005?'+':'')+x.toFixed(2)).join('  ')]]);
    if(MNOTE[t]!==undefined) this.after(1.1,()=>this.note(MNOTE[t],3400));
  }
  restartMem(){
    this.tok=0; this.C=[0,0,0,0]; this.memBusy=false;
    for(let k=0;k<4;k++){ this.paintBar(this.cbars[k],0); this.paintBar(this.hbars[k],0); this.setValLab(k,0); }
    this.tchips.forEach(c=>c.material.opacity=0.4);
    this.note('rewound \u2014 step \u25b8 to replay \u201cBob is nice. Dan is evil.\u201d');
  }
  beltRide(){
    this.note('training: the gradient rides C back in time \u2014 \u00d7f per step, no W. \u201cevil\u201d can still teach the \u201csubject\u201d channel',3400);
    this.P.spawn([V(1.0,3.0,0.5),V(-5.2,3.0,0.5)],{color:PAL.err,size:0.22,speed:2.6});
  }
  // ---------- shared ----------
  setView(n){
    if(this.view===n) return; this.view=n;
    this.g1.visible=n===1; this.g2.visible=n===2; this.g3.visible=n===3;
    this.pick=this['pick'+n];
    const cams={1:{p:[5.5,3.4,22.5],t:[5.5,2.9,0]},2:{p:[3.0,3.0,23],t:[3.0,2.2,0]},3:{p:[3.5,3.4,18],t:[3.5,1.7,0]}};
    const c=cams[n]; this.world.flyTo(c.p,c.t,0.9); this.acc=0;
    if(n===1){ this.applySing(false); this.note('WHY: send a gradient back through the plain RNN \u2014 and drag \u03c3max(W)'); this.after(0.8,()=>{ if(this.view===1) this.fireBack(); }); }
    if(n===2){ this.readout([['interface','[h\u209c\u208b\u2081, x\u209c] in \u2192 h\u209c out \u2014 same plug as station 06'],['new','a SECOND state line: C'],['on C\u2019s path','\u2299 and + only \u2014 no W']]);
      this.note('INSIDE: one W makes four gate vectors \u2014 C gets edited, h gets rewritten'); this.after(0.9,()=>this.forwardPass()); }
    if(n===3){ this.readout([['C','4 channels here \u2014 real LSTMs: hundreds'],['sentence','\u201cBob is nice. Dan is evil.\u201d'],['try','step \u25b8, then \u201cride the gradient along C\u201d']]);
      this.note('THE MEMORY: C is a vector \u2014 watch channels kept, wiped, and overwritten'); }
  }
  onParam(k,v){
    if(k==='view') this.setView((''+v).indexOf('1')===0?1:(''+v).indexOf('2')===0?2:3);
    else if(k==='sing'){ this.sing=+v; if(this.view!==1) this.setView(1); else this.applySing(true); }
    else if(k==='back'){ if(this.view===1) this.fireBack(); else if(this.view===2) this.gradBack2(); else this.beltRide(); }
    else if(k==='restart'){ if(this.view!==3) this.setView(3); this.restartMem(); }
  }
  step(){ if(this.view===1) this.fireBack(); else if(this.view===2) this.forwardPass(); else this.stepMem(); }
  update(dt){
    if(this.playing){
      if(this.view===3&&this.tok<BT.length){ this.acc+=dt; if(this.acc>2.7){ this.acc=0; this.stepMem(); } }
      else if(this.view===2){ this.acc+=dt; if(this.acc>8.5){ this.acc=0; this.forwardPass(); } }
    }
    if(this.cOut) this.cOut.material.emissiveIntensity=0.7+0.25*Math.sin(this.t*3);
  }
};

const FR=['personne','portant','un','chapeau','rouge','dans','la','rue','hier'];
const ENS=['person','wearing','hat','[END]'];
const ENL=['person','wearing','hat','???','\u2026','[END]'];
REG.seq2seq = class extends SceneBase {
  cam(){ return {pos:[2.8,5,19.5], target:[2.8,2.4,0]}; }
  build(){ this.n=4; this.buildAll(); }
  buildAll(){
    if(this.G){ this.root.remove(this.G); }
    const G=this.G=new THREE.Group(); this.add(G); this.pick=[];
    const n=this.n, en=n===4?ENS:ENL;
    const exs=Array.from({length:n},(_,i)=>-2.2-(n-1-i)*1.65);
    const dxs=Array.from({length:en.length},(_,i)=>2.2+i*1.8);
    this.exs=exs; this.dxs=dxs; this.en=en;
    exs.forEach((x,i)=>{ const c=box(1.35,1.0,0.8,0x1a3a5c,{em:0.35}); c.position.set(x,0.6,0); G.add(c); const wt=label('W enc',{h:0.24,color:'#ffd9a0',bold:700}); wt.position.set(x,0.6,0.45); G.add(wt);
      c.userData.tip='encoder step '+(i+1)+' — reads \u201c'+FR[i]+'\u201d into its state — the SAME cell, same W enc, applied again'; this.pick.push(c);
      const w=label(FR[i],{h:0.36,color:'#07202b',bg:'#7fc4f0',bold:700}); w.position.set(x,-0.6,0); G.add(w);
      if(i<n-1) G.add(arrow(V(x+0.7,0.6,0),V(exs[i+1]-0.7,0.6,0),{r:0.035,color:PAL.enc}));
    });
    dxs.forEach((x,i)=>{ const c=box(1.35,1.0,0.8,0x5c3a1a,{em:0.35}); c.position.set(x,0.6,0); G.add(c); const wt=label('W dec',{h:0.24,color:'#ffd9a0',bold:700}); wt.position.set(x,0.6,0.45); G.add(wt);
      c.userData.tip='decoder step '+(i+1)+' — writes the next word — a SECOND cell with its own W dec'; this.pick.push(c);
      if(i<en.length-1) G.add(arrow(V(x+0.7,0.6,0),V(dxs[i+1]-0.7,0.6,0),{r:0.035,color:PAL.dec}));
    });
    const el=label('ENCODER RNN — reads',{h:0.42,mono:false,font:36,bold:700,color:'#7fc4f0'}); el.position.set(exs[Math.floor(n/2)],-1.35,0); G.add(el); const el2=label('(many to one)',{h:0.4,color:'#7fc4f0'}); el2.position.set(exs[Math.floor(n/2)],-1.85,0); G.add(el2);
    const dl=label('DECODER RNN — writes',{h:0.42,mono:false,font:36,bold:700,color:'#ffb27a'}); dl.position.set((dxs[0]+dxs[dxs.length-1])/2,-1.35,0); G.add(dl); const dl2=label('(one to many)',{h:0.4,color:'#ffb27a'}); dl2.position.set((dxs[0]+dxs[dxs.length-1])/2,-1.85,0); G.add(dl2); const wnote=label('just TWO cells, reused at every step — W is frozen here; only h changes',{h:0.34,color:'#8ea3c8'}); wnote.position.set(0,-2.7,0); G.add(wnote);
    this.c=node(0.5,0xffffff,{em:0.4}); this.c.position.set(0,3.6,0); G.add(this.c);
    this.c.userData.tip='c: the ONLY thing the decoder ever sees of the sentence'; this.pick.push(this.c);
    this.ring=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.035,10,44),mat(PAL.err,{em:0.9,opacity:0.85}));
    this.ring.position.copy(this.c.position); G.add(this.ring);
    const cl=label('c — the ONLY bridge',{h:0.42,color:'#ffd9a0'}); cl.position.set(0,4.7,0); G.add(cl);
    const bl=label('fixed size, no matter how long the sentence',{h:0.32,color:'#7f95b8'}); bl.position.set(0,4.2,0); G.add(bl);
    G.add(arrow(V(exs[n-1]+0.75,0.9,0),V(-0.35,3.3,0),{r:0.04,color:0x557a9a}));
    G.add(arrow(V(0.35,3.3,0),V(dxs[0]-0.75,0.95,0),{r:0.04,color:0x557a9a}));
    this.ychips=[]; this.mix=new THREE.Color(0x0b1322); this.done=false;
    this.replay();
  }
  replay(){
    this._q=[]; this.done=false; this.mix=new THREE.Color(0x223344);
    this.c.material.color.set(0x223344); this.c.material.emissive.set(0x223344);
    this.ychips.forEach(y=>this.G.remove(y)); this.ychips=[];
    const n=this.n;
    for(let i=0;i<n;i++) this.after(0.3+i*0.55,()=>{
      if(i<n-1) this.P.spawn([V(this.exs[i],0.6,0),V(this.exs[i+1],0.6,0)],{color:PAL.enc,size:0.14,speed:5});
    });
    this.after(0.3+n*0.55,()=>{ this.note('now squeeze EVERYTHING into c\u2026');
      for(let i=0;i<n;i++){ const inf=Math.pow(0.8,n-1-i);
        this.after(i*0.16,()=>this.P.spawn([V(this.exs[i],1.2,0),V(this.exs[i]/2,2.9,0),this.c.position.clone()],{color:hue(i).getHex(),size:0.06+inf*0.13,speed:6,onDone:()=>{
          this.mix.lerp(hue(i),Math.max(0.12,inf*0.45)); this.c.material.color.copy(this.mix); this.c.material.emissive.copy(this.mix);
        }})); }
    });
    const t0=0.3+n*0.55+n*0.16+1.2;
    this.after(t0,()=>{ this.done=true;
      const w1=Math.pow(0.8,n-1)/Array.from({length:n},(_,i)=>Math.pow(0.8,n-1-i)).reduce((a,b)=>a+b,0);
      this.readout([['input length',n+' words'],['share of word 1 in c',(w1*100).toFixed(0)+'%'],['decoder sees','c and NOTHING else']]);
      if(n>4) this.note('9 words through one small orb: early words barely exist in c');
      this.en.forEach((w,i)=>this.after(0.5+i*0.6,()=>{
        this.P.spawn([this.dxs[i-1]!==undefined?V(this.dxs[i-1],0.6,0):this.c.position.clone(),V(this.dxs[i],0.6,0)],{color:PAL.dec,size:0.12,speed:6});
        const bad=w==='???'||w==='\u2026';
        const chip=label(w,{h:0.42,color:bad?'#8b93a8':'#2b1503',bg:bad?'#2a3040':'#ffb27a',bold:700});
        chip.position.set(this.dxs[i],2.0,0); this.G.add(chip); this.ychips.push(chip);
        if(i<this.en.length-1){ this.after(0.3,()=>this.P.spawn([V(this.dxs[i],2.0,0),V(this.dxs[i]+0.9,0.95,0)],{color:0x8b93a8,size:0.05,speed:7})); }
      }));
    });
  }
  onParam(k,v){ if(k==='len'){ this.n=v==='9 words'?9:4; this.buildAll(); } else if(k==='replay') this.replay(); }
  update(dt){
    if(this.done&&this.n>4){ this.c.material.emissiveIntensity=0.45+0.3*Math.sin(this.t*9);
      this.c.position.x=0.05*Math.sin(this.t*23); }
    this.ring.rotation.y=this.t*0.8; this.ring.position.copy(this.c.position);
  }
};

const A9=[[0.72,0.10,0.06,0.12],[0.08,0.74,0.08,0.10],[0.06,0.12,0.11,0.71],[0.25,0.25,0.25,0.25]];
const EN9=['person','wearing','hat','[END]'];
REG.attn = class extends SceneBase {
  cam(){ return {pos:[2.8,5.5,19.5], target:[2.8,2.8,0]}; }
  build(){
    this.stepIdx=0; this.acc=0; this.fixed=false;
    this.zx=[-8.2,-5.9,-3.6,-1.3]; this.dx=[2.2,4.4,6.6,8.8];
    this.pillars=[]; this.bars=[]; this.fx=new THREE.Group(); this.add(this.fx);
    this.zx.forEach((x,i)=>{
      const p=box(0.62,1.7,0.62,0x1a3a5c,{em:0.45}); p.position.set(x,1.55,0); this.add(p); this.pillars.push(p);
      p.userData.tip='encoder state z'+SUB[i]+' — KEPT, not thrown away'; this.pick.push(p);
      this.lab('z'+SUB[i],x,2.9,0,{h:0.36,color:'#7fc4f0'});
      const w=label(FR[i],{h:0.38,color:'#07202b',bg:'#7fc4f0',bold:700}); w.position.set(x,0.2,0); this.root.add(w);
      const bar=box(0.4,0.01,0.4,PAL.attn,{em:0.8}); bar.position.set(x,3.6,0); this.add(bar); this.bars.push(bar);
    });
    this.lab('ALL encoder states kept',-4.75,4.6,0,{h:0.4,mono:false,font:34,bold:700,color:'#7fc4f0'});
    this.dcells=this.dx.map((x,i)=>{ const c=box(1.5,1.05,0.85,0x5c3a1a,{em:0.35}); c.position.set(x,0.75,0); this.add(c);
      c.userData.tip='decoder step '+(i+1)+' (state h'+SUB[i]+')'; this.pick.push(c);
      if(i<3) this.add(arrow(V(x+0.8,0.75,0),V(this.dx[i+1]-0.8,0.75,0),{r:0.035,color:PAL.dec}));
      return c; });
    this.lab('DECODER',5.5,-0.25,0,{h:0.4,mono:false,font:34,bold:700,color:'#ffb27a'});
    this.corb=node(0.42,0xffffff,{em:0.5}); this.corb.visible=false; this.add(this.corb);
    this.corb.userData.tip='c\u209c — a FRESH context vector, rebuilt for every output word'; this.pick.push(this.corb);
    this.ylabel=null; this.ychips=[];
    this.beams=this.zx.map(()=>{ const b=link(V(0,0,0),V(0,1,0),{r:0.02,color:PAL.attn,additive:true,opacity:0.8}); b.visible=false; this.add(b); return b; });
    this.wlabs=[];
    this.lab('e\u209c,\u1d62 = f_att(h\u209c\u208b\u2081, z\u1d62)   \u2192 softmax \u2192 a   \u2192   c\u209c = \u03a3 a\u1d62 z\u1d62',0.3,6.4,0,{h:0.42,color:'#cbb8ff'});
    this.lab('f_att is a tiny MLP — learned end-to-end, nobody labels alignments',0.3,5.7,0,{h:0.32,color:'#7f95b8'});
  }
  clearFx(){ this.wlabs.forEach(l=>{ this.root.remove(l); l.material.map.dispose(); l.material.dispose(); }); this.wlabs=[]; }
  step(){
    if(this.stepIdx>=4){ this.note('done — click any output word to replay its attention'); return; }
    this.playStep(this.stepIdx++);
  }
  playStep(t){
    this.clearFx();
    const a=A9[t], from=V(this.dx[t],1.4,0);
    if(this.fixed){
      this.beams.forEach(b=>b.visible=false);
      this.bars.forEach(b=>{ b.scale.y=0.01; });
      this.corb.visible=true; this.corb.position.set(0.2,4.4,0);
      this.corb.material.color.set(0x556077); this.corb.material.emissive.set(0x556077);
      this.after(0.4,()=>this.spawnY(t,true));
      this.note('fixed c: same stale summary for every word (this is station 8)');
      return;
    }
    this.beams.forEach((b,i)=>{ b.visible=true; orient(b,from,V(this.zx[i],2.4,0),0.015);
      b.material.color.set(0xdde7ff); b.material.opacity=0.3; });
    this.note('score every z\u1d62 against the decoder state\u2026 then softmax');
    this.after(0.7,()=>{
      this.beams.forEach((b,i)=>{ orient(b,from,V(this.zx[i],2.4,0),0.05+a[i]*0.28);
        b.material.color.set(0xc4b5fd); b.material.opacity=0.55+a[i]*0.45; });
      this.bars.forEach((b,i)=>{ this.tween(s=>{b.scale.y=Math.max(0.02,s); b.position.y=3.6+s/2;},b.scale.y,a[i]*2.4,0.5);
        const l=label((a[i]*100).toFixed(0)+'%',{h:0.34,color:'#cbb8ff'}); l.position.set(this.zx[i],3.7+a[i]*2.4+0.35,0); this.root.add(l); this.wlabs.push(l); });
    });
    this.after(1.3,()=>{
      this.corb.visible=true; this.corb.position.set(0.2,4.4,0);
      const mix=new THREE.Color(0x111111);
      a.forEach((w,i)=>{ mix.add(hue(i).clone().multiplyScalar(w)); });
      this.corb.material.color.copy(mix); this.corb.material.emissive.copy(mix);
      a.forEach((w,i)=>{ for(let r=0;r<Math.round(w*5);r++) this.after(r*0.1,()=>this.P.spawn([V(this.zx[i],2.4,0),this.corb.position.clone()],{color:hue(i).getHex(),size:0.05+w*0.08,speed:8})); });
    });
    this.after(2.0,()=>{ this.P.spawn([this.corb.position.clone(),V(this.dx[t],1.3,0)],{color:0xffffff,size:0.12,speed:7}); this.spawnY(t,false); });
    this.readout([['decoder step',(t+1)+' / 4'],['a (attention row)',a.map(x=>x.toFixed(2)).join('  ')],['most attended',FR[a.indexOf(Math.max(...a))]]]);
  }
  spawnY(t,dim){
    const old=this.ychips[t]; if(old){ this.root.remove(old); }
    const chip=label(EN9[t],{h:0.44,color:dim?'#8b93a8':'#2b1503',bg:dim?'#2a3040':'#ffb27a',bold:700});
    chip.position.set(this.dx[t],2.3,0); this.add(chip); this.ychips[t]=chip;
    chip.userData.tip='click to replay attention for \u201c'+EN9[t]+'\u201d'; chip.userData.onClick=()=>this.playStep(t);
    this.pick.push(chip);
  }
  onParam(k,v){ if(k==='fixed'){ this.fixed=!!v; } else if(k==='restart'){ this.stepIdx=0; this.ychips.forEach(c=>c&&this.root.remove(c)); this.ychips=[]; this.clearFx(); this.beams.forEach(b=>b.visible=false); this.corb.visible=false; } }
  update(dt){ if(this.playing&&this.stepIdx<4){ this.acc+=dt; if(this.acc>2.6){ this.acc=0; this.step(); } } }
};

}
{

const TOK=['The','animal','was','tired','so','it','stopped'];
const SW={
  0:[0.35,0.25,0.10,0.10,0.05,0.08,0.07],
  1:[0.12,0.42,0.08,0.14,0.05,0.06,0.13],
  2:[0.06,0.30,0.30,0.14,0.06,0.08,0.06],
  3:[0.05,0.32,0.12,0.28,0.04,0.05,0.14],
  4:[0.08,0.15,0.12,0.20,0.30,0.05,0.10],
  5:[0.03,0.58,0.05,0.17,0.03,0.10,0.04],
  6:[0.05,0.28,0.07,0.12,0.08,0.12,0.28]};
REG.selfattn = class extends SceneBase {
  cam(){ return {pos:[2,4.5,20], target:[1.8,3.0,0]}; }
  build(){
    this.sel=5; this.pe=false; this.groups=[]; this.order=[0,1,2,3,4,5,6];
    this.beams=[]; this.web=null; this.mat9=null;
    TOK.forEach((w,i)=>{
      const g=new THREE.Group(); g.position.set((i-3)*2.05,0,0); this.add(g); this.groups.push(g);
      const tok=node(0.4,PAL.input,{em:0.6}); tok.position.y=0.6; g.add(tok);
      tok.userData={tip:'token \u201c'+w+'\u201d — click to make it the QUERY',onClick:()=>this.select(i)}; this.pick.push(tok);
      const wl=label(w,{h:0.4,color:'#07202b',bg:'#67e8f9',bold:700}); wl.position.set(0,-0.35,0); g.add(wl);
      const q=new THREE.Mesh(SHARED.cone,mat(PAL.attn,{em:0.7})); q.scale.set(0.17,0.3,0.17); q.position.set(0,3.15,0); g.add(q);
      q.userData={tip:'q'+SUB[i]+' = x'+SUB[i]+'W\u1401 — what \u201c'+w+'\u201d is LOOKING FOR',onClick:()=>this.select(i)}; this.pick.push(q);
      const k=new THREE.Mesh(SHARED.box,mat(PAL.weight,{em:0.6})); k.scale.setScalar(0.26); k.position.set(-0.55,2.25,0); g.add(k);
      k.userData.tip='k'+SUB[i]+' = x'+SUB[i]+'W\u2096 — what \u201c'+w+'\u201d ADVERTISES'; this.pick.push(k);
      const v=node(0.16,PAL.mem,{em:0.7}); v.position.set(0.55,2.25,0); g.add(v);
      v.userData.tip='v'+SUB[i]+' = x'+SUB[i]+'W\u1d65 — what \u201c'+w+'\u201d HANDS OVER'; this.pick.push(v);
      [q,k,v].forEach(s=>{ const p=s.position.clone(); this.after(0.3+i*0.12,()=>this.P.spawn([g.position.clone().add(V(0,0.9,0)),g.position.clone().add(p)],{color:0x9fb4dd,size:0.05,speed:5})); });
      const out=node(0.34,PAL.attn,{em:0.8}); out.position.set(0,6.0,0); out.visible=false; g.add(out);
      out.userData.tip='y'+SUB[i]+' — \u201c'+w+'\u201d AFTER gathering context'; this.pick.push(out);
      const stem=link(V(0,2.7,0),V(0,5.6,0),{r:0.012,color:0x33415e,opacity:0.5}); g.add(stem); stem.visible=false;
      g.userData={tok,q,k,v,out,stem,rings:[]};
    });
    this.lab('every token makes THREE vectors:  q (violet cone) \u00b7 k (amber cube) \u00b7 v (green orb)',0,-1.2,0,{h:0.4,color:'#9fb4dd'});
    this.lab('contextual outputs y\u1d62',0,6.85,0,{h:0.4,mono:false,font:34,bold:700,color:'#cbb8ff'});
    this.lab('e\u1d62\u2c7c = q\u1d62\u00b7k\u2c7c / \u221aD    a = softmax    y\u1d62 = \u03a3\u2c7c a\u1d62\u2c7c v\u2c7c',0,7.6,0,{h:0.4,color:'#cbb8ff'});
    this.after(1.2,()=>this.select(5));
  }
  gpos(i,local){ return this.groups[i].position.clone().add(local); }
  clearBeams(){ this.beams.forEach(b=>{ this.root.remove(b); if(b.material.map)b.material.map.dispose(); b.material.dispose(); if(b.geometry&&!b.geometry.userData.shared)b.geometry.dispose(); }); this.beams=[]; }
  select(i,quiet){
    this.sel=i; this.clearBeams();
    const w=SW[i], qp=this.gpos(i,V(0,3.15,0));
    TOK.forEach((_,j)=>{
      const kp=this.gpos(j,V(-0.55,2.25,0));
      const b=link(qp,kp,{r:0.015+w[j]*0.14,color:PAL.attn,additive:true,opacity:0.3+w[j]*0.7}); this.add(b); this.beams.push(b);
      const wl=label((w[j]*100).toFixed(0)+'%',{h:0.27,color:'#cbb8ff'}); wl.position.copy(kp).add(V(0,0.45,0)); this.add(wl); this.beams.push(wl);
    });
    this.after(0.55,()=>{
      const g=this.groups[i], mix=new THREE.Color(0x080808);
      TOK.forEach((_,j)=>{ mix.add(hue(j).clone().multiplyScalar(w[j]));
        for(let r=0;r<Math.round(w[j]*4);r++) this.after(r*0.09,()=>this.P.spawn([this.gpos(j,V(0.55,2.25,0)),this.gpos(i,V(0,6,0))],{color:hue(j).getHex(),size:0.04+w[j]*0.09,speed:9}));
      });
      this.after(0.5,()=>{ g.userData.out.visible=true; g.userData.stem.visible=true;
        g.userData.out.material.color.copy(mix); g.userData.out.material.emissive.copy(mix);
        this.tween(k=>g.userData.out.scale.setScalar(0.34*(0.5+0.5*k)),0,1,0.4); });
    });
    const top=[...w.keys()].sort((a,b)=>w[b]-w[a]).slice(0,2);
    this.readout([['query','\u201c'+TOK[i]+'\u201d'],['strongest',TOK[top[0]]+' '+(w[top[0]]*100).toFixed(0)+'%'],['then',TOK[top[1]]+' '+(w[top[1]]*100).toFixed(0)+'%']]);
    if(!quiet&&i===5) this.note('\u201cit\u201d asks around \u2014 \u201canimal\u201d answers loudest (58%)');
  }
  onParam(k,v){
    if(k==='all'){ this.clearBeams();
      TOK.forEach((_,i)=>this.after(i*0.22,()=>this.select(i,true)));
      this.after(TOK.length*0.22+0.8,()=>{ this.clearBeams();
        TOK.forEach((_,i)=>TOK.forEach((_,j)=>{ if(SW[i][j]>0.1){
          const b=link(this.gpos(i,V(0,3.15,0)),this.gpos(j,V(-0.55,2.25,0)),{r:0.008+SW[i][j]*0.05,color:PAL.attn,additive:true,opacity:0.1+SW[i][j]*0.3}); this.add(b); this.beams.push(b); }}));
        this.note('ALL rows at once = one matrix multiply. THIS is the parallelism RNNs never had.'); });
    }
    else if(k==='shuffle'){
      const perm=[...this.order]; for(let i=perm.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [perm[i],perm[j]]=[perm[j],perm[i]]; }
      this.order=perm; this.clearBeams();
      this.groups.forEach((g,i)=>{ const slot=perm.indexOf(i); this.tween(x=>g.position.x=x,g.position.x,(slot-3)*2.05,0.8); });
      this.after(1.0,()=>{ this.select(this.sel,true); this.note(this.pe?'with PE the vectors CHANGE when order changes':'same weights, same outputs \u2014 self-attention is ORDER-BLIND'); });
    }
    else if(k==='pe'){ this.pe=!!v;
      this.groups.forEach((g,i)=>{ g.userData.rings.forEach(r=>g.remove(r)); g.userData.rings=[];
        if(this.pe){ const nr=1+(i%3);
          for(let r=0;r<nr;r++){ const ring=new THREE.Mesh(new THREE.TorusGeometry(0.5+r*0.13,0.03,8,32),mat(0xffd9a0,{em:0.9,opacity:0.85}));
            ring.position.y=0.6; ring.rotation.x=Math.PI/2-0.3; g.add(ring); g.userData.rings.push(ring); } } });
      this.note(this.pe?'position stamped INTO each token (added, not appended) \u2014 order is visible again':'positional encoding OFF \u2014 the sentence is just a bag of tokens');
    }
    else if(k==='matrix'){
      if(this.mat9){ this.root.remove(this.mat9); this.mat9=null; return; }
      const g=this.mat9=new THREE.Group(); g.position.set(0,3.6,-4.5); this.add(g);
      const vx=voxels(7,7,0.55); g.add(vx.mesh);
      for(let i=0;i<7;i++)for(let j=0;j<7;j++) vx.set(j,i,PAL.attn,SW[i][j]*1.3);
      const t=label('attention matrix a\u1d62\u2c7c   (rows: query i \u2193 \u00b7 cols: key j \u2192)',{h:0.34,color:'#cbb8ff'}); t.position.set(0,2.6,0); g.add(t);
      TOK.forEach((w,i)=>{ const r=label(w,{h:0.24,color:'#7f95b8'}); r.position.set(-2.8,vx.pos(0,i).y,0); g.add(r);
        const c=label(w,{h:0.24,color:'#7f95b8'}); c.position.set(vx.pos(i,0).x,2.15,0); g.add(c); });
    }
  }
};

const ENC3=['personne','portant','un','chapeau'], DEC3=['person','wearing','hat'];
const A9r=[[0.72,0.10,0.06,0.12],[0.08,0.74,0.08,0.10],[0.06,0.12,0.11,0.71]];
const SELFD=[[1.0],[0.45,0.55],[0.30,0.30,0.40]];
REG.crossattn = class extends SceneBase {
  cam(){ return {pos:[1.8,2.9,16.5], target:[1.8,2.3,0]}; }
  build(){
    this.mode='cross'; this.sel=2; this.fx=[];
    this.egroups=ENC3.map((w,i)=>{ const g=new THREE.Group(); g.position.set((i-1.5)*2.6,4.6,0); this.add(g);
      const o=node(0.38,PAL.enc,{em:0.6}); g.add(o);
      o.userData.tip='encoder output z'+SUB[i]+' \u201c'+w+'\u201d'; this.pick.push(o);
      const wl=label(w,{h:0.36,color:'#07202b',bg:'#7fc4f0',bold:700}); wl.position.set(0,0.75,0); g.add(wl);
      const k=new THREE.Mesh(SHARED.box,mat(PAL.weight,{em:0.6})); k.scale.setScalar(0.22); g.add(k);
      const v=node(0.14,PAL.mem,{em:0.7}); g.add(v);
      g.userData={k,v}; return g; });
    this.dgroups=DEC3.map((w,i)=>{ const g=new THREE.Group(); g.position.set((i-1)*2.6,0.6,0); this.add(g);
      const o=node(0.38,PAL.dec,{em:0.6}); g.add(o);
      o.userData={tip:'decoder token \u201c'+w+'\u201d — click to select its query',onClick:()=>this.select(i)}; this.pick.push(o);
      const wl=label(w,{h:0.36,color:'#2b1503',bg:'#ffb27a',bold:700}); wl.position.set(0,-0.75,0); g.add(wl);
      const q=new THREE.Mesh(SHARED.cone,mat(PAL.attn,{em:0.8})); q.scale.set(0.15,0.28,0.15); q.position.set(0,0.85,0); g.add(q);
      q.userData={tip:'q — from the DECODER: \u201cwhat do I need next?\u201d',onClick:()=>this.select(i)}; this.pick.push(q);
      const k=new THREE.Mesh(SHARED.box,mat(PAL.weight,{em:0.6})); k.scale.setScalar(0.22); g.add(k);
      const v=node(0.14,PAL.mem,{em:0.7}); g.add(v);
      g.userData={k,v}; return g; });
    this.qlab=this.lab('Q \u2190 decoder (h)',-5.0,0.6,0,{h:0.44,mono:false,font:36,bold:700,color:'#cbb8ff'});
    this.kvlab=this.lab('K, V \u2190 encoder (z)',-5.9,4.6,0,{h:0.44,mono:false,font:36,bold:700,color:'#ffd9a0'});
    this.masklab=this.lab('j > i blocked: \u2212\u221e \u2192 softmax 0',1.2,-1.7,0,{h:0.34,color:'#ff9db0'});
    this.masklab.visible=false;
    this.lab('same machinery as station 10 \u2014 only the SOURCING changes',0,6.6,0,{h:0.38,color:'#9fb4dd'});
    this.applyMode(true); this.after(0.8,()=>this.select(2));
  }
  kv(i){ return this.mode==='cross'?this.egroups[i]:this.dgroups[i]; }
  kvCount(){ return this.mode==='cross'?4:3; }
  applyMode(snap){
    const cross=this.mode==='cross';
    this.egroups.forEach((g,i)=>{ const t={k:cross?V(-0.5,-0.85,0):V(0,-0.2,0), v:cross?V(0.5,-0.85,0):V(0,0.2,0)};
      ['k','v'].forEach(key=>{ const m=g.userData[key]; m.visible=cross;
        if(snap) m.position.copy(t[key]); else this.tween(k=>m.position.lerp(t[key],k),0,1,0.6); }); });
    this.dgroups.forEach((g,i)=>{ ['k','v'].forEach((key,kj)=>{ const m=g.userData[key];
      const t=cross?V(0,0,0):V(kj===0?-0.55:0.55,0.0,0.4);
      m.visible=!cross; if(!cross){ if(snap) m.position.copy(t); else this.tween(k=>m.position.lerp(t,k),0,1,0.6); } }); });
    const nk=label(cross?'K, V \u2190 encoder (z)':'K, V \u2190 decoder too (masked!)',{h:0.44,mono:false,font:36,bold:700,color:'#ffd9a0'});
    this.kvlab.material.map.dispose(); this.kvlab.material.map=nk.material.map; this.kvlab.scale.copy(nk.scale); nk.material.dispose();
    this.kvlab.position.y=cross?4.6:1.7;
    this.masklab.visible=!cross;
  }
  clearFx(){ this.fx.forEach(b=>{ this.root.remove(b); if(b.material&&b.material.map)b.material.map.dispose(); b.material&&b.material.dispose(); if(b.geometry&&!b.geometry.userData.shared)b.geometry.dispose(); }); this.fx=[]; }
  select(i){
    this.sel=i; this.clearFx();
    const qp=this.dgroups[i].position.clone().add(V(0,0.85,0));
    const W=this.mode==='cross'?A9r[i]:SELFD[i];
    for(let j=0;j<this.kvCount();j++){
      const tgt=this.kv(j).position.clone().add(this.kv(j).userData.k.position);
      if(this.mode==='self'&&j>i){
        const dir=tgt.clone().sub(qp).normalize();
        const stub=link(qp,qp.clone().add(dir.multiplyScalar(1.1)),{r:0.03,color:PAL.err,additive:true,opacity:0.8}); this.add(stub); this.fx.push(stub);
        const x=label('\u2212\u221e',{h:0.3,color:'#ff9db0'}); x.position.copy(qp).add(tgt.clone().sub(qp).multiplyScalar(0.35)).add(V(0,0.25,0)); this.add(x); this.fx.push(x);
        continue; }
      if(this.mode==='self'&&j>=W.length) continue;
      const w=W[j];
      const b=link(qp,tgt,{r:0.015+w*0.13,color:PAL.attn,additive:true,opacity:0.3+w*0.7}); this.add(b); this.fx.push(b);
      const wl=label((w*100).toFixed(0)+'%',{h:0.27,color:'#cbb8ff'}); wl.position.copy(tgt).add(V(0,this.mode==='cross'?-0.45:0.55,0)); this.add(wl); this.fx.push(wl);
      for(let r=0;r<Math.round(w*4);r++) this.after(0.4+r*0.1,()=>this.P.spawn([this.kv(j).position.clone().add(this.kv(j).userData.v.position),this.dgroups[i].position.clone().add(V(0,1.6,0.3))],{color:hue(j).getHex(),size:0.04+w*0.08,speed:8}));
    }
    const src=this.mode==='cross'?ENC3:DEC3.slice(0,i+1);
    const W2=this.mode==='cross'?A9r[i]:SELFD[i];
    const best=W2.indexOf(Math.max(...W2));
    this.readout([['mode',this.mode==='cross'?'CROSS-attention':'masked SELF-attention'],['query','\u201c'+DEC3[i]+'\u201d'],['strongest',src[best]+' '+(W2[best]*100).toFixed(0)+'%']]);
    if(this.mode==='cross'&&i===2) this.note('\u201chat\u201d \u2192 \u201cchapeau\u201d 71% \u2014 the SAME numbers as station 9. Cross-attention IS that attention.');
  }
  onParam(k,v){
    if(k==='mode'){ this.mode=v; this.applyMode(false); this.after(0.65,()=>this.select(this.sel));
      this.note(v==='cross'?'Q from decoder \u00b7 K,V from ENCODER \u2014 English asking French':'everything from the decoder \u2014 but the FUTURE is masked'); }
  }
};

const BLOCKS={
  emb:'Embedding: each token becomes a D-dim vector. Learned lookup table.',
  pe:'Positional encoding (st.10): sinusoid pattern ADDED into embeddings \u2014 without it, order is invisible.',
  mhsa:'Multi-head self-attention (st.10): h attention runs in parallel subspaces \u2014 different heads learn different relations \u2014 then concat.',
  an:'Add & Norm (st.4): residual bypass + LayerNorm. The gradient highway that lets 100-layer stacks train.',
  ffn:'Feed-forward network (st.3): a tiny 2-layer MLP applied to EACH position independently.',
  mmhsa:'MASKED multi-head self-attention (st.11): scores to future positions set to \u2212\u221e \u2192 softmax 0. Training stays parallel without cheating.',
  cross:'Cross-attention (st.9+11): Q from decoder, K,V from the encoder\u2019s output. The translation bridge.',
  head:'Linear + softmax: project to vocabulary size, pick the next token.'};
REG.transformer = class extends SceneBase {
  cam(){ return {pos:[3.4,6.6,24], target:[3.0,4.8,0]}; }
  build(){
    this.pieces=[]; this.assembled=false; this.flowing=false;
    const slab=(x,y,c,name,key,prov)=>{
      const g=new THREE.Group(); g.position.set(x,y,0); this.add(g);
      const b=box(3.7,0.72,2.2,c,{opacity:0.85,em:0.35}); g.add(b);
      const l=label(name,{h:0.34,bold:700,color:'#f2f5ff'}); l.position.set(0,0,1.25); g.add(l);
      b.userData={tip:BLOCKS[key],onClick:()=>{ this.world.emit('dl-block',{key,name}); this.flash(b);
        if(key==='mmhsa') this.maskDemo(); if(key==='mhsa') this.headsDemo(g); }};
      this.pick.push(b);
      this.pieces.push({g,prov,y}); return g; };
    const ring=(x,y,prov)=>{ const g=new THREE.Group(); g.position.set(x,y,0); this.add(g);
      const r=new THREE.Mesh(new THREE.TorusGeometry(1.5,0.07,10,44),mat(0x67e8f9,{em:0.6,opacity:0.9}));
      r.rotation.x=Math.PI/2; r.scale.z=0.6; g.add(r);
      const l=label('Add & Norm',{h:0.26,color:'#9ff0ff'}); l.position.set(2.6,0,0); g.add(l);
      r.userData={tip:BLOCKS.an,onClick:()=>{ this.world.emit('dl-block',{key:'an',name:'Add & Norm'}); }};
      this.pick.push(r); this.pieces.push({g,prov,y}); return g; };
    const resid=(x,y0,y1,side)=>{ const g=new THREE.Group(); this.add(g);
      g.add(tube([V(x+side*1.9,y0,0),V(x+side*2.75,(y0+y1)/2,0),V(x+side*1.9,y1,0)],{r:0.035,color:0x2a6a7a,em:0.5,opacity:0.8}));
      this.pieces.push({g,prov:null,y:y0}); return g; };
    ENC3.forEach((w,i)=>{ const c=label(w,{h:0.34,color:'#07202b',bg:'#7fc4f0',bold:700}); c.position.set(-4.5+(i-1.5)*1.7,0,0); this.add(c); });
    this.outSlots=[]; this.dinChips=[];
    const start=label('[START]',{h:0.3,color:'#2b1503',bg:'#ffb27a',bold:700}); start.position.set(4.5-1.7,0,0); this.add(start);
    slab(-4.5,1.2,0x155e75,'embedding','emb','embeddings');
    const peG=new THREE.Group(); this.add(peG);
    const pts=[]; for(let i=0;i<=40;i++) pts.push(V(-9.5+i*0.06,1.2+Math.sin(i*0.6)*0.25,0));
    peG.add(tube(pts,{r:0.04,color:PAL.weight,em:0.8}));
    const pel=label('+ positional encoding',{h:0.3,color:'#ffd9a0'}); pel.position.set(-8.3,2.0,0); peG.add(pel);
    this.pieces.push({g:peG,prov:'st.10 — order must be injected',y:1.2});
    slab(-4.5,2.5,0x7c3aed,'multi-head self-attention','mhsa','st.10 — every token attends to every token');
    ring(-4.5,3.35,'st.4 — residuals keep gradients alive'); resid(-4.5,2.1,3.35,-1);
    slab(-4.5,4.2,0x0e7490,'feed-forward (FFN)','ffn','st.3 — a tiny MLP, per position');
    ring(-4.5,5.05,null); resid(-4.5,3.85,5.05,1);
    slab(-4.5,5.9,0x7c3aed,'multi-head self-attention','mhsa',null);
    slab(-4.5,7.0,0x0e7490,'feed-forward (FFN)','ffn',null);
    const encTop=box(1.2,0.22,1.2,PAL.enc,{em:0.7}); encTop.position.set(-4.5,7.9,0); this.add(encTop);
    encTop.userData.tip='encoder output: contextual vectors for ALL French tokens \u2014 becomes K and V';
    this.pick.push(encTop); this.pieces.push({g:encTop,prov:null,y:7.9});
    this.lab('ENCODER  \u00d7N',-7.6,4.6,0,{h:0.5,mono:false,font:40,bold:700,color:'#7fc4f0'});
    slab(4.5,1.2,0x155e75,'embedding','emb',null);
    slab(4.5,2.5,0x581c87,'MASKED self-attention','mmhsa','st.11 — no peeking at future words');
    ring(4.5,3.35,null); resid(4.5,2.1,3.35,1);
    slab(4.5,4.2,0x7c3aed,'cross-attention','cross','st.9 + 11 — Q: decoder \u00b7 K,V: encoder');
    ring(4.5,5.05,null);
    slab(4.5,5.9,0x0e7490,'feed-forward (FFN)','ffn',null);
    ring(4.5,6.75,null); resid(4.5,5.55,6.75,-1);
    slab(4.5,7.6,0x334155,'linear + softmax','head','pick the next word');
    this.lab('DECODER  \u00d7N',7.9,4.6,0,{h:0.5,mono:false,font:40,bold:700,color:'#ffb27a'});
    const bridge=new THREE.Group(); this.add(bridge);
    for(let k=0;k<3;k++) bridge.add(tube([V(-3.9,7.9,0),V(0,6.8+k*0.35,0.4-k*0.4),V(2.6,4.2,0)],{r:0.03,color:PAL.attn,em:0.8,opacity:0.65}));
    const bl=label('K, V',{h:0.34,color:'#cbb8ff'}); bl.position.set(0,7.7,0); bridge.add(bl);
    this.pieces.push({g:bridge,prov:'the encoder feeds every decoder layer',y:6});
    this.bridge=bridge;
    this.lab('Attention(Q,K,V) = softmax(QK\u1d40/\u221aD)\u00b7V',0,10.6,0,{h:0.46,color:'#cbb8ff'});
    this.pieces.forEach(p=>{ p.g.visible=false; });
    this.after(0.6,()=>this.assemble());
  }
  flash(m){ this.tween(k=>m.material.emissiveIntensity=0.35+Math.sin(k*Math.PI)*0.8,0,1,0.8); }
  assemble(){
    if(this.assembled) return; this.assembled=true;
    const ordered=[...this.pieces];
    ordered.forEach((p,i)=>this.after(i*0.42,()=>{
      p.g.visible=true;
      const s0=p.g.scale.clone();
      this.tween(k=>{ p.g.scale.set(s0.x*(0.6+0.4*k),s0.y*(0.6+0.4*k),s0.z*(0.6+0.4*k)); },0,1,0.35);
      if(p.prov){ const chip=label(p.prov,{h:0.36,font:34,color:'#ffe9c2',bg:'rgba(58,38,8,0.95)'});
        chip.position.set(p.g.position?p.g.position.x||0:0,(p.y||2)+1.1,1.8);
        if(p.g.position&&p.g.position.x!==undefined&&Math.abs(p.g.position.x)<0.01&&p.g!==this.bridge) chip.position.x=0;
        this.root.add(chip);
        this.after(2.2,()=>{ this.root.remove(chip); chip.material.map.dispose(); chip.material.dispose(); }); }
    }));
    this.after(ordered.length*0.42+0.5,()=>this.note('nothing here is new \u2014 you met every part on the way'));
  }
  maskDemo(){
    if(this.maskG) return;
    const g=this.maskG=new THREE.Group(); g.position.set(9.8,2.5,0); this.add(g);
    const vx=voxels(4,4,0.5); g.add(vx.mesh);
    for(let i=0;i<4;i++)for(let j=0;j<4;j++) vx.set(j,i,j<=i?0x34d399:0xf43f5e,j<=i?0.75:0.5);
    const t=label('scores: j \u2264 i kept \u00b7 j > i \u2192 \u2212\u221e',{h:0.28,color:'#ff9db0'}); t.position.set(0,1.6,0); g.add(t);
    this.after(4.5,()=>{ this.root.remove(g); this.maskG=null; });
  }
  headsDemo(at){
    if(this.headsG) return;
    const g=this.headsG=new THREE.Group(); g.position.copy(at.position).add(V(0,0,2.8)); this.add(g);
    const cols=[0xa78bfa,0x22d3ee,0xf59e0b,0x34d399];
    cols.forEach((c,i)=>{ const s=box(3.0,0.14,0.7,c,{em:0.6,opacity:0.9}); s.position.set(0,(i-1.5)*0.32,0); g.add(s); });
    const l=label('4 heads \u2014 4 different relation patterns \u2192 concat',{h:0.3,color:'#cbb8ff'}); l.position.set(0,1.1,0); g.add(l);
    this.after(3.5,()=>{ this.root.remove(g); this.headsG=null; });
  }
  onParam(k,v){
    if(k==='assemble'){ this.pieces.forEach(p=>p.g.visible=false); this.assembled=false; this._q=[]; this.assemble(); }
    else if(k==='flow') this.flow();
  }
  flow(){
    if(!this.assembled||this.flowing) return; this.flowing=true;
    this.dinChips.forEach(c=>{ this.root.remove(c); }); this.dinChips=[];
    this.outSlots.forEach(c=>{ this.root.remove(c); }); this.outSlots=[];
    this.note('encoder: ALL 4 tokens rise TOGETHER \u2014 no waiting');
    for(let i=0;i<4;i++) this.P.spawn([V(-4.5+(i-1.5)*0.8,0.3,0.6),V(-4.5+(i-1.5)*0.8,7.9,0.6)],{color:PAL.enc,size:0.09,speed:4});
    this.after(2.2,()=>{ for(let k=0;k<3;k++) this.P.spawn([V(-3.9,7.9,0),V(0,6.8,0.3),V(2.6,4.2,0)],{color:PAL.attn,size:0.09,speed:6}); });
    const words=DEC3;
    words.forEach((w,m)=>this.after(3.2+m*2.0,()=>{
      this.note(m===0?'decoder: one word per step (autoregressive at inference)':'\u201c'+words[m-1]+'\u201d loops back in as input');
      this.P.spawn([V(4.5,0.3,0.6),V(4.5,7.6,0.6)],{color:PAL.dec,size:0.1,speed:5,onDone:()=>{
        const chip=label(w,{h:0.38,color:'#2b1503',bg:'#ffb27a',bold:700}); chip.position.set(4.5+(m-(words.length-1)/2)*1.7,8.6,0); this.add(chip); this.outSlots.push(chip);
        if(m<2){ const inChip=label(w,{h:0.3,color:'#2b1503',bg:'#c98a5a',bold:700}); inChip.position.set(4.5+(m-0.5)*1.7,0,0);
          this.add(inChip); this.dinChips.push(inChip);
          this.P.spawn([V(4.5+(m-(words.length-1)/2)*1.7,8.6,0),V(6.8,4.5,1.2),V(4.5+(m-0.5)*1.7,0.2,0)],{color:0xc98a5a,size:0.07,speed:8}); }
        if(m===words.length-1){ this.flowing=false; this.note('training is different: ALL target words at once \u2014 the mask keeps it honest'); }
      }});
    }));
  }
};

const SEVEN=['..........','.XXXXXXXX.','.XXXXXXXX.','.......XX.','......XX..','.....XX...','....XX....','...XX.....','...XX.....','..........'];
REG.gan = class extends SceneBase {
  cam(){ return {pos:[0.2,4.2,20], target:[-0.5,3.0,0]}; }
  build(){
    this.root.position.set(-1.8,-0.5,0); this.root.scale.setScalar(0.9);
    this.epoch=8; this.acc=0; this.phase=0; this.noise=[];
    for(let j=0;j<10;j++){ const r=[]; for(let i=0;i<10;i++) r.push(Math.random()); this.noise.push(r); }
    this.z=node(0.42,0x8b93a8,{em:0.5}); this.z.position.set(-10,3.2,0); this.add(this.z);
    this.z.userData.tip='z \u2014 pure random noise. The generator\u2019s only ingredient.'; this.pick.push(this.z);
    this.lab('z ~ noise',-10,2.45,0,{h:0.36,color:'#8b93a8'});
    this.gSlabs=[];
    [[.9,-8.3],[1.7,-7.3],[2.5,-6.3]].forEach(([h,x])=>{ const s=box(0.55,h,1.6,0x7c3aed,{em:0.4,opacity:0.9}); s.position.set(x,3.2,0); this.add(s); this.gSlabs.push(s);
      s.userData.tip='GENERATOR G: noise \u2192 image. Never sees real data!'; this.pick.push(s); });
    this.lab('GENERATOR',-7.3,5.05,0,{h:0.46,mono:false,font:38,bold:700,color:'#cbb8ff'});
    this.add(arrow(V(-9.5,3.2,0),V(-8.7,3.2,0),{r:0.04,color:0x8b93a8}));
    this.fake=voxels(10,10,0.34); this.fake.mesh.position.set(-3.4,3.2,0); this.add(this.fake.mesh);
    this.fake.mesh.userData.tip='G(z) \u2014 the FAKE sample'; this.pick.push(this.fake.mesh);
    this.flab=this.lab('fake',-3.4,1.2,0,{h:0.36,color:'#cbb8ff'});
    this.real=voxels(10,10,0.34); this.real.mesh.position.set(0.6,6.9,0); this.add(this.real.mesh);
    for(let j=0;j<10;j++)for(let i=0;i<10;i++) this.real.set(i,j,PAL.input,SEVEN[j][i]==='X'?0.95:0.05);
    this.real.mesh.userData.tip='a REAL sample from the training data'; this.pick.push(this.real.mesh);
    this.lab('real data',0.6,8.9,0,{h:0.36,color:'#67e8f9'});
    this.dSlabs=[];
    [[2.5,2.6],[1.7,3.6],[0.9,4.6]].forEach(([h,x])=>{ const s=box(0.55,h,1.6,0xb45309,{em:0.4,opacity:0.9}); s.position.set(x,3.2,0); this.add(s); this.dSlabs.push(s);
      s.userData.tip='DISCRIMINATOR D: image \u2192 P(real). The detective.'; this.pick.push(s); });
    this.lab('DISCRIMINATOR',4.1,5.05,0,{h:0.46,mono:false,font:38,bold:700,color:'#ffd9a0'});
    const gg=new THREE.Group(); gg.position.set(3.6,-0.4,0); this.add(gg); this.gaugeG=gg;
    const arc=new THREE.Mesh(new THREE.TorusGeometry(1.1,0.05,8,40,Math.PI),mat(0x44557a,{em:0.5})); gg.add(arc);
    this.needle=link(V(0,0,0),V(0,1.05,0),{r:0.045,color:0xffffff}); gg.add(this.needle);
    this.lamp=node(0.3,0x8b93a8,{em:0.8}); this.lamp.position.set(0,-0.8,0); gg.add(this.lamp);
    const g0=label('fake 0',{h:0.28,color:'#ff9db0'}); g0.position.set(-1.5,0.2,0); gg.add(g0);
    const g1=label('real 1',{h:0.28,color:'#7ce8bd'}); g1.position.set(1.5,0.2,0); gg.add(g1);
    this.vlab=this.lab('D(x) = ?',3.6,-2.15,0,{h:0.4,color:'#e8eeff'});
    this.lab('min_G max_D   E[log D(x)] + E[log(1 \u2212 D(G(z)))]',-1,10.0,0,{h:0.44,color:'#cbb8ff'});
    this.lab('the forger learns from the detective\u2019s gradients',-1,9.2,0,{h:0.34,color:'#7f95b8'});
    this.gradPath=[V(3.6,2.0,0.6),V(-0.5,1.4,0.8),V(-3.4,2.2,0.6),V(-7.3,3.2,0.4)];
    this.renderFake(); this.setNeedle(0.5,'?');
  }
  d(real){ const e=Math.min(1,this.epoch/100); return real? 0.96-0.46*e : 0.04+0.46*e; }
  renderFake(){
    const e=Math.pow(Math.min(1,this.epoch/100),0.8);
    for(let j=0;j<10;j++)for(let i=0;i<10;i++){
      const target=SEVEN[j][i]==='X'?0.95:0.05;
      const v=this.noise[j][i]*(1-e)+target*e + (Math.random()-0.5)*0.25*(1-e);
      this.fake.set(i,j,0xbfa8f5,Math.max(0.03,Math.min(1,v))); }
    const df=this.d(false), dr=this.d(true);
    this.readout([['epoch',String(Math.round(this.epoch))],['D(fake)',df.toFixed(2)],['D(real)',dr.toFixed(2)],['G loss  \u2212log D(G(z))',(-Math.log(Math.max(1e-3,df))).toFixed(2)],['equilibrium','D \u2192 0.5 (can\u2019t tell)']]);
  }
  setNeedle(v,txt){
    const ang=Math.PI*(1-v), from=this.curAng===undefined?Math.PI/2:this.curAng;
    this.tween(k=>{ const a=from+(ang-from)*k;
      orient(this.needle,V(0,0,0),V(Math.cos(a)*1.05,Math.sin(a)*1.05,0),0.045); },0,1,0.5,{done:()=>{this.curAng=ang;}});
    const c=v>0.65?0x34d399:v<0.35?0xf43f5e:0xf59e0b;
    this.lamp.material.color.set(c); this.lamp.material.emissive.set(c);
    const nl=label('D(x) = '+(typeof txt==='string'?txt:v.toFixed(2)),{h:0.4,color:'#e8eeff'});
    this.vlab.material.map.dispose(); this.vlab.material.map=nl.material.map; this.vlab.scale.copy(nl.scale); nl.material.dispose();
  }
  onParam(k,v){ if(k==='epoch'){ this.epoch=+v; this.renderFake(); } }
  update(dt){
    this.z.position.x=-10+Math.sin(this.t*13)*0.05; this.z.material.emissiveIntensity=0.4+Math.random()*0.25;
    if(!this.playing) return;
    this.acc+=dt;
    const period=this.calm()?2.6:1.9;
    if(this.acc>period){ this.acc=0; this.phase=(this.phase+1)%3;
      if(this.phase===0){ this.P.spawn([V(0.6,6.9,0),V(3.0,3.4,0)],{color:PAL.input,size:0.12,speed:6,onDone:()=>this.setNeedle(this.d(true))});
        this.dSlabs.forEach(s=>this.tween(k=>s.material.emissiveIntensity=0.4+Math.sin(k*Math.PI)*0.5,0,1,0.7));
        this.note('D trains: \u201creal \u2192 say 1, fake \u2192 say 0\u201d'); }
      else if(this.phase===1){ this.P.spawn([V(-3.4,3.2,0.4),V(2.9,3.2,0.4)],{color:0xbfa8f5,size:0.12,speed:6,onDone:()=>this.setNeedle(this.d(false))}); }
      else { this.gSlabs.forEach(s=>this.tween(k=>s.material.emissiveIntensity=0.4+Math.sin(k*Math.PI)*0.5,0,1,0.7));
        for(let r=0;r<3;r++) this.after(r*0.15,()=>this.P.spawn(this.gradPath,{color:PAL.err,size:0.08,speed:8}));
        this.epoch=Math.min(100,this.epoch+4); this.renderFake();
        this.note(this.epoch>=100?'equilibrium: D stuck at 0.5 \u2014 fakes indistinguishable':'G trains THROUGH D\u2019s gradients \u2014 it never sees a real image'); }
    }
  }
};

}

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
    r.domElement.addEventListener('pointerdown',e=>{this._pdown={x:e.clientX,y:e.clientY};});
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
  _onClick(e){ if(this._pdown&&Math.hypot(e.clientX-this._pdown.x,e.clientY-this._pdown.y)>6) return; this._ndc(e); const r=this._cast(); if(r&&r.o.userData.onClick) r.o.userData.onClick(r.o,r.h); }
  _resize(){ const w=this.clientWidth||2,h=this.clientHeight||2; const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1; this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)*z); this.renderer.setSize(w,h,false); this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); }
}
customElements.define('dl-world',DLWorld);

