// Runs the engine section of index.html in Node (no browser needed).
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const code=html.split('// ==ENGINE START==')[1].split('// ==ENGINE END==')[0];
const api=new Function(code+';return {SYN,analyze,converse,W,LEX};')();
const assert=require('assert');
(async()=>{
  const P=api.SYN.map(p=>({...p,analysis:api.analyze(p)}));
  const g=id=>P.find(p=>p.id===id);
  // Negation and missing-evidence regressions
  const negative={id:'negative',name:'Negative example',linkedinText:'Designer\\nI do not like hiking and I am not interested in running.',instagramText:'No interest in gardening.',removed:[]};
  const na=api.analyze(negative);
  assert(!na.interests.some(i=>['hiking','running','gardening'].includes(i.key)),'explicitly rejected interests must not be extracted');
  const positive={id:'positive',name:'Positive example',linkedinText:'Designer\\nI like hiking and running.',instagramText:'',removed:[]};
  const pa=api.analyze(positive);
  assert(pa.interests.some(i=>i.key==='hiking')&&pa.interests.some(i=>i.key==='running'),'positive interest mentions remain extractable');
  const allUnknown=await api.converse({...negative,analysis:na},{...negative,id:'negative2',name:'Negative two',analysis:na},async()=>{});
  assert.equal(allUnknown.ev.negative.total,50,'all-unknown dimensions use a neutral fallback, clearly marked by zero coverage');
  assert.equal(allUnknown.ev.negative.coverage,0,'all-unknown dimensions have zero evidence coverage');
  // extraction honesty
  assert(g('tara').analysis.values.length===0,'Tara has no stated values');
  assert(g('tara').analysis.intent===null && g('tara').analysis.location===null,'Tara intent/location stay unknown');
  assert(g('asha').analysis.intent.cls==='serious');
  assert(g('meera').analysis.intent.cls==='serious','negated casual => serious');
  assert(g('kabir').analysis.intent.cls==='casual');
  assert(!g('asha').analysis.interests.some(i=>i.key==='outdoors'),'partner wants are not own interests');
  assert(g('asha').analysis.wants.keys.includes('outdoors'));
  const res={};
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){
    let n=0;const r=await api.converse(P[i],P[j],async()=>{n++;});
    assert.equal(n,8);assert.equal(r.msgs.length,8);
    res[P[i].id+'-'+P[j].id]=r;
  }
  const cap=res['meera-kabir'];assert(cap.dimMutual.intent.score===15&&cap.mutual<=55,'intent clash lowers and caps score');
  // agent isolation: payloads, not profiles
  const m=res['asha-rohan'].msgs[0];assert(m.payload&&!m.payload.evidence&&Array.isArray(m.payload.interests));
  console.log('pairs:',Object.keys(res).length);
  Object.entries(res).sort((a,b)=>b[1].mutual-a[1].mutual).forEach(([k,r])=>console.log(k.padEnd(14),r.mutual,r.capped?'(capped)':'',Object.fromEntries(Object.entries(r.dimMutual).map(([d,v])=>[d,v.score+(v.known?'':'?')]))));
  console.log('sample transcript (asha-rohan):');res['asha-rohan'].msgs.forEach(x=>console.log(' -',x.kind+':',x.text));
  console.log('ALL ASSERTIONS PASSED');
})().catch(e=>{console.error('FAIL',e);process.exit(1);});