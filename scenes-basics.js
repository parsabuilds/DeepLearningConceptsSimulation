import { REG, PAL, SUB, SceneBase, V, THREE, SHARED, node, box, link, arrow, tube, label, mat, orient, voxels, sig, softmax, ease, hue } from './kit.js';

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
