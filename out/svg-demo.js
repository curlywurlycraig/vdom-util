(()=>{var h=e=>Array.isArray(e)&&e.length>1&&typeof e[1]=="object"&&!Array.isArray(e[1]),y=(e,t)=>{let[,r]=e._hic||[];return Object.entries(t).forEach(([s,n])=>{r&&typeof r[s]=="function"&&e.removeEventListener(s,r[s]),typeof n=="function"?e.addEventListener(s.toLowerCase(),n):(s==="value"&&(e.value=n),e.setAttribute(s,n))}),e},a=([e,...t],r="http://www.w3.org/1999/xhtml")=>{let n=!Array.isArray(t[0])&&typeof t[0]=="object"?[e,t[0],...t.slice(1)]:[e,{},...t],c=E(n,r);return c._hic=n,c};var E=([e,t,...r],s="http://www.w3.org/1999/xhtml")=>{e==="svg"&&!t.xmlns&&console.warn("Using an SVG without a namespace will result in the SVG not displaying correctly.",'Try adding "xmlns="http://www.w3.org/2000/svg" to the <svg> element.');let n=t.xmlns||s,c=document.createElementNS(n,e),d=y(c,t);return(u=>u.map(o=>Array.isArray(o)&&o.length===0?"":o).map(o=>typeof o=="string"||typeof o=="number"||!o?o:a(o,n)))(r).reduce((u,o)=>(u.append(o),u),d)},p=([e,t,...r])=>{if(typeof e=="function")return p(e({...t,children:r}));let s=r.map(n=>Array.isArray(n)&&n.length?p(n):n);return[e,t,...s]},f=(e,t)=>(e.innerHTML="",e.appendChild(a(p(t))),e),m=(e,t)=>{let r=e.children[0];return!r||r._hic===void 0?f(e,t):g(r,p(t))},g=(e,t)=>{let[r,s,...n]=t,c=e._hic,[d,v,...u]=c;if(d!==r)return f(e.parentNode,t);for(y(e,s),n.forEach((o,l)=>{if(!e.childNodes[l]){let A=h(o)?a(o):document.createTextNode(o);e.appendChild(A);return}if(h(o)){g(e.childNodes[l],o);return}e.childNodes[l].nodeValue=o});e.childNodes.length>n.length;)e.childNodes[n.length].remove();return e._hic=t,e};var i=(e,t,...r)=>{let n=r.length===1&&Array.isArray(r[0])&&!h(r[0])?r[0]:r;return[e,t||{},...n]};var C=i("svg",{version:"1.1",width:"300",height:"200",xmlns:"http://www.w3.org/2000/svg"},i("rect",{width:"100%",height:"100%",fill:"red"}),i("circle",{cx:"150",cy:"100",r:"80",fill:"green"}),i("text",{x:"150",y:"125","font-size":"60","text-anchor":"middle",fill:"transparent",stroke:"white"},"SVG")),w=a(i("div",null));document.querySelector("main").append(w);m(w,C);})();
