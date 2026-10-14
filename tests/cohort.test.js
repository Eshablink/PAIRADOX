// Extra engine tests: missing evidence, edited-profile invalidation, duplicate pairs, per-participant rankings, 25-record cohort.
const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const code=html.split('// ==ENGINE START==')[1].split('// ==ENGINE END==')[0];
const api=new Function(code+';return {SYN,analyze,converse,pairsOf};')();
const mk=(id,li,ig)=>({id,name:id[0].toUpperCase()+id.slice(1),linkedinUrl:'https://www.linkedin.com/in/'+id,instagramUrl:'https://www.instagram.com/'+id,linkedinText:li,instagramText:ig,synthetic:true,removed:[]});
const withA=p=>({...p,analysis:api.analyze(p)});
const rank=(me,P,res)=>P.filter(o=>o.id!==me.id).map(o=>({o,r:res[me.id+'|'+o.id]||res[o.id+'|'+me.id]})).sort((a,b)=>b.r.mutual-a.r.mutual);
async function runAll(P){const res={};for(const [a,b] of api.pairsOf(P)){res[a.id+'|'+b.id]=await api.converse(a,b,async()=>{});}return res;}
(async()=>{
  // 1. missing evidence: empty profile never invents facts, still converses, flagged unknown
  const empty=withA(mk('nobody','',''));
  assert.equal(empty.analysis.interests.length,0);assert.equal(empty.analysis.values.length,0);
  assert(empty.analysis.intent===null&&empty.analysis.location===null);
  assert(empty.analysis.uncertainties.length>0,'gaps listed as uncertainties');
  const rich=withA(api.SYN[0]);
  const r=await api.converse(empty,rich,async()=>{});
  assert.equal(r.msgs.length,8);assert(r.mutual>=0&&r.mutual<=100);
  assert(Object.values(r.dimMutual).every(d=>d.known===false||d.score>=0),'dimensions present');
  const both=await api.converse(withA(mk('n1','','')),withA(mk('n2','','')),async()=>{});
  assert(Object.values(both.dimMutual).every(d=>!d.known&&d.score===50),'all-unknown pair scores neutral 50 per dimension');
  // 2. edited-profile: analysis follows edits and removals (UI invalidates conversations on both)
  const base=withA(mk('edit','Designer\nI am a hiker and climber who loves the outdoors.','')) ;
  const keys=base.analysis.interests.map(i=>i.key);assert(keys.includes('hiking'));
  const removed=api.analyze({...base,removed:['i:hiking']});
  assert(!removed.interests.some(i=>i.key==='hiking'),'removed item is gone');
  const edited=api.analyze({...base,linkedinText:'Designer\nI paint and play guitar.'});
  assert(!edited.interests.some(i=>i.key==='hiking')&&edited.interests.length>0,'edited text re-extracts');
  assert(html.includes('function invalidate(){S.convos={};S.done=false;S.confirmed=false;'),'UI clears results on edit');
  // 3. duplicate / self pairs
  const six=api.SYN.map(withA);let pairs=api.pairsOf(six);
  assert.equal(pairs.length,15);
  const seen=new Set();pairs.forEach(([a,b])=>{assert.notEqual(a.id,b.id);const k=[a.id,b.id].sort().join('|');assert(!seen.has(k),'dup '+k);seen.add(k);});
  // 4. rankings for every participant, in order, no self
  const res6=await runAll(six);
  six.forEach(me=>{const rk=rank(me,six,res6);assert.equal(rk.length,5);assert(rk.every(x=>x.o.id!==me.id&&x.r));for(let i=1;i<rk.length;i++)assert(rk[i-1].r.mutual>=rk[i].r.mutual);});
  // 5. 25-record cohort (synthetic generated, includes blanks)
  const LI=['Product designer who cares about sustainability.','Software engineer. I value honesty and community.','Teacher and volunteer mentor. I love learning.','Doctor, based in Mumbai.','Chef who loves travel and street food.'];
  const IG=['Weekend hiker and climber.','Yoga, meditation and long runs.','Guitar, concerts and vinyl. Looking for something serious.','Board games and chess nights. Just keeping it casual.','Photography and travelling.'];
  const P=[];for(let i=0;i<25;i++)P.push(withA(mk('c'+i,i%7===6?'':LI[i%5],i%9===8?'':IG[(i*2)%5])));
  const t0=Date.now();const res=await runAll(P);const ms=Date.now()-t0;
  assert.equal(Object.keys(res).length,300);
  Object.values(res).forEach(x=>{assert.equal(x.msgs.length,8);assert(Number.isFinite(x.mutual)&&x.mutual>=0&&x.mutual<=100);});
  P.forEach(me=>{const rk=rank(me,P,res);assert.equal(rk.length,24);});
  console.log('cohort of 25: 300 pairs in',ms,'ms');
  console.log('COHORT TESTS PASSED');
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
