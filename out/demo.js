(()=>{var A=t=>Array.isArray(t)&&t.length>1&&typeof t[1]=="object"&&!Array.isArray(t[1]),v=(t,e)=>{let[,r]=t._hic?t._hic:[];return Object.entries(e).forEach(([n,o])=>{r&&typeof r[n]=="function"&&t.removeEventListener(n,r[n]),typeof o=="function"?t.addEventListener(n.toLowerCase(),o):n==="value"?t.value=o:t.setAttribute(n,o)}),t},d=([t,...e])=>{let n=!Array.isArray(e[0])&&typeof e[0]=="object"?[t,e[0],...e.slice(1)]:[t,{},...e],o=w(...n);return o._hic=n,o},w=(t,e,...r)=>{let n=v(document.createElement(t),e);return(i=>i.map(s=>Array.isArray(s)&&s.length===0?"":s).map(s=>typeof s=="string"||typeof s=="number"?s:d(s)))(r).reduce((i,s)=>(i.append(s),i),n)},p=([t,e,...r])=>{if(typeof t=="function")return p(t({...e,children:r}));let n=r.map(o=>Array.isArray(o)&&o.length?p(o):o);return[t,e,...n]},C=(t,e)=>(t.innerHTML="",t.appendChild(d(p(e))),t),c=(t,e)=>{let r=t.children[0];return!r||r._hic===void 0?C(t,e):E(r,p(e))},E=(t,e)=>{let[r,n,...o]=e,i=t._hic,[s,I,...L]=i;if(s!==r)return C(t,e);let H=v(t,n),T=o.map((a,g)=>A(a)?t.children[g]?E(t.children[g],a):d(a):a);return t.replaceChildren(...T),t._hic=e,t},y=t=>{let e={triggers:[],value:t,addTrigger:r=>{e.triggers.push(r)},set:r=>{e.value=r,e.triggers.forEach(n=>n(r,e.set,e))}};return e},m=t=>Object.entries(t).reduce((e,[r,n])=>`${e}; ${r}: ${n}; `,""),u=(t,e,...r)=>{let o=r.length===1&&Array.isArray(r[0])&&!A(r[0])?r[0]:r;return[t,e||{},...o]};var b=document.getElementById("main"),_=document.getElementById("mousepad"),O=document.getElementById("extra"),M=document.getElementById("editor"),h=({children:t})=>u("div",{style:m({transform:"rotate(180deg)"})},t),f=y(0),$=({count:t,setCount:e})=>u(h,null,u("p",null,"count is ",t),u("button",{click:()=>e(t+1)},"increment")),l=y([0,0]),j=({pos:[t,e],setPos:r})=>{let n=100*Math.min(t/200,1),o=255*Math.min(e/200,1),i=m({position:"relative",opacity:`${n}%`,color:`rgb(${o}, 255, 255)`});return u("div",{style:"width: 100%; height: 100%",mousemove:s=>r([s.offsetX,s.offsetY])},u("p",{style:i},"Cursor pos is ",t," ",e))};l.addTrigger((t,e)=>c(_,u(j,{pos:t,setPos:e})));l.set([0,0]);f.addTrigger((t,e)=>c(b,u($,{count:t,setCount:e})));var B=({count:t,setCount:e})=>u(h,null,u("p",null,new Array(t).fill(".")));l.addTrigger(t=>c(b,u(B,{count:t[0]})));var D=({count:t,setCount:e})=>u("input",{input:r=>e(Number(r.target.value)),value:t});f.addTrigger((t,e)=>c(M,u(D,{count:t,setCount:e})));f.set(0);})();
