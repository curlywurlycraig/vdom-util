import { hic, apply, expand } from "./vdom.js";
import { atom } from "./atom.js";
import { style } from "./style.js";

const mainEl = document.getElementById("main");
const Outlined = ({ children }) => {
  return (
  <div>
    <div style={style({border: '1px solid #445', padding: '10px'})}>
      { children }
    </div>

    <div style={style({border: '1px solid #445', padding: '10px'})}>
      { children }
    </div>
  </div>
)};

const el = <Outlined><Outlined><p>Hello world!</p></Outlined></Outlined>;
const expanded = expand(el);

const newEl = apply(expanded, mainEl);

apply(expanded, newEl);