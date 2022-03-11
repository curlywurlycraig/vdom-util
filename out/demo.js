(()=>{var h=t=>Array.isArray(t)&&t.length>1&&typeof t[1]=="object"&&!Array.isArray(t[1]),C=(t,e)=>{let[,r]=t._hic||[];return Object.entries(e).forEach(([s,n])=>{r&&typeof r[s]=="function"&&t.removeEventListener(s,r[s]),typeof n=="function"?t.addEventListener(s.toLowerCase(),n):(s==="value"&&(t.value=n),t.setAttribute(s,n))}),t},v=([t,...e],r="http://www.w3.org/1999/xhtml")=>{let n=!Array.isArray(e[0])&&typeof e[0]=="object"?[t,e[0],...e.slice(1)]:[t,{},...e],u=L(n,r);return u._hic=n,u},I=t=>{let e={};for(var r=0;r<t.length;r++){let s=t[r];e[s.name]=s.value}return e},E=t=>{if(t._hic)return t._hic;if(t.nodeType!==1)return t.nodeValue;let e=t.tagName,r=t.attributes,s=t.childNodes,n=[];for(var u=0;u<s.length;u++)n.push(E(s[u]));return[e.toLowerCase(),I(r),...n]},L=([t,e,...r],s="http://www.w3.org/1999/xhtml")=>{let n=e.xmlns||s,u=document.createElementNS(n,t),y=C(u,e);return(l=>l.map(a=>Array.isArray(a)&&a.length===0?"":a).map(a=>typeof a=="string"||typeof a=="number"||!a?a:v(a,n)))(r).reduce((l,a)=>(l.append(a),l),y)},i=([t,e,...r])=>{if(typeof t=="function")return i(t({...e,children:r}));let s=r.map(n=>Array.isArray(n)&&n.length?i(n):n);return[t,e,...s]},b=(t,e)=>(t.innerHTML="",t.appendChild(v(i(e))),t),c=(t,e)=>{let r=t.children[0];return!r||r._hic===void 0?b(t,e):w(r,i(e))},w=(t,e)=>{let[r,s,...n]=e,u=t._hic,[y,_,...l]=u;if(y!==r)return b(t.parentNode,e);for(C(t,s),n.forEach((a,f)=>{if(!t.childNodes[f]){let B=h(a)?v(a):document.createTextNode(a);t.appendChild(B);return}if(h(a)){w(t.childNodes[f],a);return}t.childNodes[f].nodeValue=a});t.childNodes.length>n.length;)t.childNodes[n.length].remove();return t._hic=e,t},T=(t,e)=>{let r=E(t),s=i(e({children:r}));b(t,s)},d=t=>{let e={triggers:[],value:t,addTrigger:r=>{e.triggers.push(r)},set:r=>{e.value=r,e.triggers.forEach(s=>s(r,e.set,e))}};return e},g=t=>Object.entries(t).reduce((e,[r,s])=>`${e}; ${r}: ${s}; `,""),o=(t,e,...r)=>{let n=r.length===1&&Array.isArray(r[0])&&!h(r[0])?r[0]:r;return[t,e||{},...n]};var N=document.getElementById("main"),O=document.getElementById("mousepad"),J=document.getElementById("extra"),k=document.getElementById("editor"),S=({children:t})=>o("div",{style:g({border:"1px solid #445",padding:"10px"})},t),A=d(0),$=({count:t,setCount:e})=>o(S,null,o("p",null,"count is ",t),o("button",{click:()=>e(t+1)},"increment"));A.addTrigger((t,e)=>c(N,o($,{count:t,setCount:e})));var F=({count:t,setCount:e})=>o("p",{style:g({color:t>15?"red":t>10?"orange":t>5?"yellow":"white"})},new Array(t).fill(".")),M=({count:t,setCount:e})=>o("input",{input:r=>e(Number(r.target.value)),value:t}),j=(t,e)=>{let r=()=>e(t);Object.values(t).forEach(s=>s.addTrigger(r)),r()};j({count:A},({count:t})=>{let e=r=>{isNaN(r)||t.set(r)};c(k,o(M,{count:t.value,setCount:e}))});A.set(0);var m=d(0);m.addTrigger(t=>c(N,o(F,{count:t})));c(O,o("div",null,o("button",{click:()=>m.set(m.value+1)},"+"),o("button",{click:()=>m.set(Math.max(0,m.value-1))},"-")));T(document.getElementById("ellipse"),({children:t})=>o("p",null,"This used to be: ",t));var x=[{name:"Craig",age:28},{name:"Meg",age:30},{name:"Geordi",age:.4}];for(p=0;p<1e3;p++)x.push({name:`Player_${p}`,age:p});var p,R=({search:t,setSearch:e,items:r})=>{let s=r.filter(n=>n.name.toLowerCase().includes(t.toLowerCase())||n.age.toString().includes(t));return o("div",null,o("input",{placeholder:"Search table",input:n=>e(n.target.value),value:t}),o("table",{style:g({margin:"10px"})},o("thead",null,o("tr",null,o("th",null,"Name"),o("th",null,"Age"),o("th",null,"An input"))),o("tbody",null,s.map(n=>o("tr",null,o("td",null,n.name),o("td",null,n.age),o("td",null,o("input",null)))))))},H=d("");H.addTrigger((t,e)=>c(document.getElementById("searcher"),o(R,{search:t,setSearch:e,items:x})));H.set("");var P=({isFetching:t,result:e,onClickFetch:r})=>o("div",null,t?"fetching...":null,e?`got ${e}`:null,o("button",{click:r},"Click to get the author of this package"));j({isFetching:d(!1),result:d(null)},({isFetching:t,result:e})=>{let r=async()=>{t.set(!0);let n=await(await fetch("package.json")).json();t.set(!1),e.set(n.author)};c(document.getElementById("package-json-fetcher"),o(P,{isFetching:t.value,result:e.value,onClickFetch:r}))});})();
