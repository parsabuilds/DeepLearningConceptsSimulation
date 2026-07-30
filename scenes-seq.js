import { REG, PAL, SUB, SceneBase, V, THREE, SHARED, node, box, link, arrow, tube, label, mat, orient, sig, softmax, ease, hue } from './kit.js';

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
