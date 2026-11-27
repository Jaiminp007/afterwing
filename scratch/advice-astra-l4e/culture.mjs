import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bite, inherit, founder, wval, ERR, H, SLIP } from './machine.mjs';

const cap=256, pulses=2000, cohort=16, cache=new Map();
const prob=Float64Array.from({length:16},(_,h)=>(1+wval(h<<12))/2);
function stream(seed,salt) {
  let x=(seed^salt)>>>0;
  return ()=>{x=(x+0x6d2b79f5)>>>0;let y=x;y=Math.imul(y^(y>>>15),y|1);
    y^=y+Math.imul(y^(y>>>7),y|61);return ((y^(y>>>14))>>>0)/4294967296;};
}
function world(seed) {
  assert(Number.isInteger(seed)&&seed>=3201&&seed<=3232);
  if(cache.has(seed))return cache.get(seed);
  const latent=stream(seed,0x5a17),obs=stream(seed,0x38a1),cost=stream(seed,0x1193),eggs=stream(seed,0x47b2);
  const y=new Uint8Array(cap*pulses), price=new Float32Array(cap*pulses);
  const hint=new Uint8Array(pulses), sign=new Uint8Array(pulses), accel=new Int8Array(pulses);
  const coin=new Float64Array(cap*pulses/cohort), token=new Uint8Array(coin.length);
  let s=latent()<.5?-1:1,v=latent()<.5?-1:1,a=latent()<.5?-1:1;
  for(let t=0;t<pulses;t++){
    sign[t]=+(s>0);accel[t]=a;hint[t]=+(s*v*a>0);
    for(let i=t*cap;i<(t+1)*cap;i++){y[i]=sign[t]^+(obs()<ERR);price[i]=cost();}
    a*=latent()<H?-1:1;v*=a*(latent()<SLIP?-1:1);s*=v;
  }
  for(let i=0;i<coin.length;i++){coin[i]=eggs();token[i]=Math.floor(256*eggs());}
  const hash=createHash('sha256').update(y).update(new Uint8Array(price.buffer)).update(hint)
    .update(new Uint8Array(coin.buffer)).update(token).digest('hex');
  const x={y,price,hint,sign,accel,coin,token,hash};cache.set(seed,x);return x;
}
export function run(seed,image,end=pulses) {
  assert(end>0&&end<=pulses&&Number.isInteger(end));
  const e=world(seed), gain=new Float64Array(cap);
  let n=64, state=new Uint16Array(cap), kids=new Uint16Array(cap), eggs=0,deaths=0;
  for(let i=0;i<n;i++)state[i]=founder(image,i);
  let sum=0,samples=0,atCap=0,seen=0,lateGain=0,sse=0,reads=0;
  for(let t=0;t<end;t++){
    const h=image.oracle?e.hint[t]:0, off=t*cap;
    for(let i=0;i<n;i++){
      const word=state[i], p=prob[word>>>12], price=e.price[off+i], taste=e.y[off+i];
      const net=p>price?taste-price:0;
      gain[i]+=net;state[i]=bite(image.next,word,taste,h);
      if(t>=1000){seen++;lateGain+=net;sse+=(p-(ERR+(1-2*ERR)*e.sign[t]))**2;}
    }
    reads+=n;
    if((t+1)%cohort===0){
      const base=(t>>4)*cap, density=1+n/65;
      let count=0, dropped=false;
      for(let i=0;i<n;i++){
        const k=Math.floor(Math.max(0,(1.6+4*gain[i]/cohort)/density)+e.coin[base+i]);
        for(let j=0;j<k;j++){
          if(count===cap){dropped=true;break;}
          kids[count]=inherit(image.born,state[i],e.token[base+count]);count++;
        }
      }
      if(dropped||count===cap)atCap++;
      eggs+=count;deaths+=n;n=count;[kids,state]=[state,kids];gain.fill(0);
    }
    if(t+1>1000&&(t+1)%10===0){sum+=n;samples++;}
  }
  assert.equal(64+eggs-deaths,n);
  if(end===pulses)assert.equal(samples,100);
  return {seed,sum,samples,end:n,eggs,deaths,atCap,seen,lateGain,sse,reads,world:e.hash};
}
