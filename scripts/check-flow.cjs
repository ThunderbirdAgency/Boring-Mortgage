const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync(require('path').join(__dirname,'../dist/motion.js'),'utf8').split('\n').slice(1).join('\n');
for(const goal of ['buy','refi','review'])for(const when of ['soon','later','looking'])for(const worry of ['payment','cash','surprises']){
 const els={};const el=id=>els[id]??=( {hidden:false,handlers:{},addEventListener(k,f){this.handlers[k]=f},focus(){},textContent:''});
 const fields=['goal','when','worry'].map(name=>({name,hidden:false,selected:null,querySelector(q){return q==='input:checked'?this.selected:q==='legend'?{focus(){}}:{reportValidity(){return false}}}}));
 const form=el('mortgage-check');form.querySelectorAll=()=>fields;el('check-result').hidden=true;
 const document={getElementById:el,querySelector:()=>el('progress-wrapper')};
 vm.runInNewContext(code,{document,FormData:class{get(name){return fields.find(f=>f.name===name).selected.value}}});
 const submit=()=>form.handlers.submit({preventDefault(){}});
 assert.equal(fields.filter(f=>!f.hidden).length,1);submit();assert.equal(els['check-step'].textContent,'QUESTION 1 OF 3');
 fields[0].selected={value:goal};submit();assert.equal(els['check-step'].textContent,'QUESTION 2 OF 3');els['check-back'].handlers.click();assert.equal(fields[0].selected.value,goal);submit();fields[1].selected={value:when};submit();fields[2].selected={value:worry};submit();
 assert.equal(form.hidden,true);assert.equal(els['check-result'].hidden,false);assert.equal(els['result-link'].href,{buy:'/buy/',refi:'/refinance/',review:'/double_checker/'}[goal]);assert.ok(els['result-question'].textContent);assert.ok(els['result-timing'].textContent);
 els['check-reset'].handlers.click();assert.equal(form.hidden,false);assert.equal(fields[0].selected.value,goal);assert.equal(els['check-step'].textContent,'QUESTION 1 OF 3');
}
console.log('Passed all 27 answer combinations, missing answer, back, and edit-answer checks.');
