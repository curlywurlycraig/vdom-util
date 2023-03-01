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

const Main = ({ value, onChange }) => {
  const ContainerEl = value === "test" ? "div" : Outlined;
  const result = (
    <ContainerEl>
      <input value={value} input={onChange}></input>
      <ContainerEl><p>{ value }</p></ContainerEl>
    </ContainerEl>
  );
  return result;
}

const content = atom("")
let newEl = apply(expand(<div></div>), mainEl);

content.addTrigger(v => {
  const onChange = (e) => {
    content.set(e.target.value);
  }

  const expanded = expand(<Main value={v} onChange={onChange} />);
  newEl = apply(expanded, newEl);
})

content.set("hello, world!")