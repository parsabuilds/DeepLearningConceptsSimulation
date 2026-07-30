import * as THREE from 'three';
export { THREE };
export const REG = {};
export const PAL = { bg:0x070b14, input:0x22d3ee, weight:0xf59e0b, neg:0xf43f5e, act:0xffffff, mem:0x34d399, attn:0xa78bfa, enc:0x38bdf8, dec:0xfb923c, dim:0x64748b, err:0xf43f5e };
export const SUB = '₀₁₂₃₄₅₆₇₈₉';
export const V = (x,y,z)=>new THREE.Vector3(x,y,z);
export const sig = x=>1/(1+Math.exp(-x));
export const softmax = (a,t=1)=>{const m=Math.max(...a);const e=a.map(v=>Math.exp((v-m)/t));const s=e.reduce((p,c)=>p+c,0);return e.map(v=>v/s);};
export const ease = t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export const hue = i=>new THREE.Color().setHSL(((i*47)%360)/360,0.68,0.62);

const G = {
  sphere: new THREE.SphereGeometry(1,28,20),
  cyl: new THREE.CylinderGeometry(1,1,1,12,1),
  box: new THREE.BoxGeometry(1,1,1),
  cone: new THREE.ConeGeometry(1,1,16),
};
Object.values(G).forEach(g=>g.userData.shared=true);
export const SHARED = G;

export function mat(color,{rough=0.38,metal=0.08,em=0.5,opacity=1,flat=false,additive=false}={}) {
  if (additive) return new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
  if (flat){ const m=new THREE.MeshBasicMaterial({color}); if(opacity<1){m.transparent=true;m.opacity=opacity;} return m; }
  const m = new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive:color,emissiveIntensity:em});
  if (opacity<1){ m.transparent=true; m.opacity=opacity; }
  return m;
}
export function node(r,color,o={}){ const m=new THREE.Mesh(G.sphere,mat(color,o)); m.scale.setScalar(r); return m; }
export function box(w,h,d,color,o={}){ const m=new THREE.Mesh(G.box,mat(color,o)); m.scale.set(w,h,d); return m; }
export function orient(m,a,b,r){ const d=V(b.x-a.x,b.y-a.y,b.z-a.z); const len=Math.max(0.001,d.length()); m.scale.set(r,len,r); m.position.set((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2); m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize()); }
export function link(a,b,{r=0.05,color=PAL.dim,opacity=1,em=0.4,additive=false}={}) {
  const m=new THREE.Mesh(G.cyl,mat(color,{em,opacity,additive}));
  orient(m,a,b,r); return m;
}
export function arrow(a,b,{r=0.05,color=PAL.dim,tip=3,em=0.5,opacity=1}={}) {
  const g=new THREE.Group();
  const dir=b.clone().sub(a); const len=dir.length(); const n=dir.clone().normalize();
  const end=a.clone().add(n.clone().multiplyScalar(Math.max(0.001,len-r*tip*2)));
  g.add(link(a,end,{r,color,em,opacity}));
  const c=new THREE.Mesh(G.cone,mat(color,{em,opacity})); c.scale.set(r*tip,r*tip*2,r*tip);
  c.position.copy(end).add(n.clone().multiplyScalar(r*tip)); c.quaternion.setFromUnitVectors(V(0,1,0),n);
  g.add(c); return g;
}
export function tube(points,{r=0.05,color=PAL.dim,em=0.5,opacity=1,segs=64,closed=false}={}) {
  const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,closed),segs,r,8,closed);
  return new THREE.Mesh(geo,mat(color,{em,opacity}));
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
export function label(text,{h=0.42,color='#dce6f7',bg=null,font=44,bold=600,pad=16,mono=true,opacity=1}={}) {
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
export class Pulses {
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
export function voxels(nx,ny,cell,{gap=0.05,depth=0.5}={}) {
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
export class SceneBase {
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
export function disposeDeep(o){
  o.traverse(n=>{ if(n.geometry&&!n.geometry.userData.shared) n.geometry.dispose();
    const ms=Array.isArray(n.material)?n.material:(n.material?[n.material]:[]);
    ms.forEach(mm=>{ if(mm.map)mm.map.dispose(); mm.dispose(); }); });
}
