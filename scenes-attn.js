import { REG, PAL, SUB, SceneBase, V, THREE, SHARED, node, box, link, arrow, tube, label, mat, orient, voxels, sig, softmax, ease, hue } from './kit.js';

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
