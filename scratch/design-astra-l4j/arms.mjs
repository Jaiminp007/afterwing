import { B, D, FLIP, H, LINES, SD, SIGN, SWITCH } from './world.mjs';

const vec = n => new Float64Array(n);
const clip = (x, a, b) => Math.max(a, Math.min(b, x));
const phi = 1 - 2 * H / 4;
export const biases = [-4, -1, 0, 1, 4];
export const fixed = [
  ...[false, true].flatMap(warm => [.08,.25,.55,.85,1].map(a => ({
    name: `${warm ? 'LAST':'COLD'}_${a}`, kind:'fixed', a, warm }))),
  ...[.5,1,2].map(r => ({name:`LINEAR_${r}`, kind:'linear', r})),
];
export const l2s = [.08,.25,.55].flatMap(a => [.7,1.5,3].flatMap(h => biases.map(b => ({
  name:`EDIT_${a}_${h}_${b}`, kind:'edit', a, h, b }))));
export const other = [
  {name:'LOCAL_BAYES',kind:'local'},
  ...['top','quantile'].map(method => ({name:`JOINT_${method}`,kind:'joint',method})),
];
export const shares = base => [.02,.2].flatMap(share => [.5,2].map(eta =>
  ({...base, name:`SHARE_${share}_${eta}`, kind:'share', share, eta})));

function local(spec, st) {
  const w = vec(D), v = vec(D).fill(1), last = new Int32Array(D);
  if (st) w.set(st);
  let t = 0, p = 0, predVar = 0;
  const decay = i => Math.pow(phi, t - last[i]);
  return {
    predict(i) {
      t++;
      if (spec.kind === 'fixed') return w[i];
      const d = decay(i);
      predVar = d*d*v[i] + (1-d*d); return (p = d*w[i]);
    },
    observe(i, y) {
      if (spec.kind === 'fixed') w[i] += spec.a * (y - w[i]);
      else if (spec.kind === 'local') {
        const l = Math.tanh(y / (SD*SD)); w[i] = (p + l) / (1 + p*l);
      } else {
        const gain = predVar / (predVar + SD*SD*spec.r);
        w[i] = p + gain*(y-p); v[i] = (1-gain)*predVar;
      }
      last[i] = t;
    },
    inherit() { return spec.kind === 'fixed' ? (spec.warm ? w.slice() : vec(0))
      : w.map((x,i) => x*decay(i)); },
  };
}

function edit(spec, st, r) {
  const w = vec(D), c = vec(8);
  if (st?.length) { w.set(st.subarray(0,D)); c.set(st.subarray(D,D+8)); }
  let bias = spec.b, writes = 0, tested = 0, ticket = -1, trigger = -1;
  const forecast = vec(4), memory = ['meta','sham','evo'].includes(spec.kind);
  if (memory && st) bias = st[24];
  if (spec.kind === 'evo') {
    if (!st) bias = biases[Math.floor(r()*biases.length)];
    else if (r() < spec.pm) bias = clip(bias + (r()<.5 ? -1:1)*2,-4,4);
  }
  const track = spec.kind === 'meta' || spec.kind === 'sham';
  let hrow = 0, hcol = 0;
  const adjust = () => {
    hrow = spec.h*Math.exp(Math.max(0,-bias)); hcol = spec.h*Math.exp(Math.max(0,bias));
  };
  adjust();
  return {
    predict: i => w[i], get writes() {return writes;}, get tested() {return tested;},
    observe(i,y,axis) {
      const row = i >> 2, col = 4 + i%4;
      if (track && i !== trigger && (row === ticket || col === ticket)) {
        const p = forecast[ticket < 4 ? i%4 : row];
        if (p !== 0) {
          const credible = spec.kind === 'sham' ? (r()<.5 ? -1:1) : Math.sign(p*y);
          bias = clip(bias + .75*(ticket < 4 ? 1:-1)*credible,-4,4); adjust(); tested++;
        }
        ticket = -1;
      }
      if (spec.kind === 'oracle') { bias = spec.map[axis]; adjust(); }
      // Half the squared-error advantage of flipping the incumbent prediction.
      const gain = -2*y*clip(w[i],-1,1);
      c[row] = Math.max(0,c[row]+gain); c[col] = Math.max(0,c[col]+gain);
      const a = c[row]/hrow, b = c[col]/hcol;
      if (Math.max(a,b) >= 1) {
        const line = a === b ? (r() < .5 ? row:col) : a > b ? row:col;
        for (let k=0;k<4;k++) {
          const j = LINES[line][k];
          w[j] = -w[j]; forecast[k] = w[j];
          c[line < 4 ? 4+j%4 : j>>2] = 0;
        }
        c[line]=0; ticket=line; trigger=i; writes++;
      }
      w[i] += spec.a*(y-w[i]);
    },
    inherit() {
      const pack=vec(memory ? B : D+8); pack.set(w); pack.set(c,D);
      if (memory) pack[24]=bias; return pack;
    },
  };
}

function share(spec, st, r) {
  const es = biases.map(b => edit({...spec,kind:'edit',b}, st?.subarray(0,D), r));
  const p = st ? st.slice(D,D+5) : vec(5).fill(.2), z = vec(5), score = vec(5);
  return {
    predict(i) { let s=0; for(let k=0;k<5;k++) s+=p[k]*(z[k]=es[k].predict(i)); return s; },
    observe(i,y) {
      let max=-Infinity, norm=0;
      for(let k=0;k<5;k++) {
        score[k]=Math.log(p[k])-.5*spec.eta*(y-z[k])**2/(SD*SD); max=Math.max(max,score[k]);
        es[k].observe(i,y);
      }
      for(let k=0;k<5;k++) norm+=(p[k]=Math.exp(score[k]-max));
      for(let k=0;k<5;k++) p[k]=(1-spec.share)*p[k]/norm+spec.share/5;
    },
    inherit() {
      const out=vec(D+5);
      for(let i=0;i<D;i++) for(let k=0;k<5;k++) out[i]+=p[k]*es[k].predict(i);
      out.set(p,D); return out;
    },
  };
}

// Two hidden axes times 128 gauge-fixed sign maps. All transition rows
// have a diagonal and four neighbors, not 256 outgoing edges.
export function joint(spec, st) {
  let p=vec(256).fill(1/256), q=vec(256), newborn=!!st, expect=0;
  if(st && spec.method==='top') {
    const mass=[st[0],1-st[0]], n=[128,128];
    for(let j=1;j<25;j+=2) { const a=st[j]>>7; mass[a]-=st[j+1]; n[a]--; }
    for(let s=0;s<256;s++) p[s]=Math.max(0,mass[s>>7])/n[s>>7];
    for(let j=1;j<25;j+=2) p[st[j]]=st[j+1];
  } else if(st) {
    p.fill(0); for(const s of st) p[s]+=1/st.length;
  }
  return {
    predict(i) {
      if(newborn) {
        for(let s=0;s<128;s++){
          const dx=SWITCH*(p[128+s]-p[s]); p[s]+=dx; p[128+s]-=dx;
        }
        newborn=false;
      }
      let e=0; const sg=SIGN[i], h=H/4;
      for(let s=0;s<128;s++) {
        const k=s+128;
        const u=q[s]=(1-H)*p[s]+h*(p[s^1]+p[s^2]+p[s^4]+p[s^8]);
        const v=q[k]=(1-H)*p[k]+h*(p[k^16]+p[k^32]+p[k^64]+p[k^127]);
        e+=(u+v)*sg[s];
      }
      [p,q]=[q,p]; return (expect=e);
    },
    observe(i,y) {
      const l=Math.tanh(y/(SD*SD)), den=1+l*expect, a=(1+l)/den, b=(1-l)/den;
      const sg=SIGN[i];
      for(let s=0;s<128;s++) { const f=sg[s]>0?a:b; p[s]*=f; p[s+128]*=f; }
    },
    inherit() {
      const pack=vec(B);
      if(spec.method==='top') {
        for(let s=0;s<128;s++) pack[0]+=p[s];
        const top=Array.from({length:256},(_,s)=>s).sort((a,b)=>p[b]-p[a]).slice(0,12);
        top.forEach((s,j)=>{pack[1+2*j]=s;pack[2+2*j]=p[s];});
      } else {
        let s=0,c=p[0];
        for(let j=0;j<B;j++) { while(c<(j+.5)/B && s<255) c+=p[++s]; pack[j]=s; }
      }
      return pack;
    },
  };
}
export function make(spec,st,r) {
  if (spec.kind==='joint') return joint(spec,st);
  if (['fixed','linear','local'].includes(spec.kind)) return local(spec,st);
  if (spec.kind==='share') return share(spec,st,r);
  return edit(spec,st,r);
}
