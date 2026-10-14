// Cohort regression: the engine should handle 25 people and 300 unique pairs.
const fs=require('fs'), assert=require('assert');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const code=html.split('// ==ENGINE START==')[1].split('// ==ENGINE END==')[0];
const api=new Function(code+';return {SYN,analyze,converse};')();
(async()=>{
  const base=api.SYN;
  assert(base.length>=6,'expected built-in synthetic fixtures');
  const people=Array.from({length:25},(_,i)=>{
    const p={...base[i%base.length],id:'cohort-'+i,name:'Person '+(i+1)};
    p.analysis=api.analyze(p); return p;
  });
  const seen=new Set(); let pairs=0;
  for(let i=0;i<people.length;i++) for(let j=i+1;j<people.length;j++){
    const key=[people[i].id,people[j].id].sort().join('|');
    assert(!seen.has(key),'duplicate pair: '+key); seen.add(key);
    const r=await api.converse(people[i],people[j],async()=>{});
    assert(r && Array.isArray(r.msgs),'conversation result exists');
    assert.equal(r.msgs.length,8,'each pair has 8 messages');
    assert(Number.isFinite(r.mutual),'mutual score is numeric');
    assert(r.mutual>=0 && r.mutual<=100,'score range');
    pairs++;
  }
  assert.equal(pairs,300); assert.equal(seen.size,300);
  console.log('PASS: 25-person cohort, 300 unique pairs, 8 messages per pair.');
})().catch(e=>{console.error(e);process.exit(1);});
