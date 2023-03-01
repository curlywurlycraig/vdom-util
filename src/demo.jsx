import { hic, apply, render } from "./vdom.js";
import { atom } from "./atom.js";
import { style } from "./style.js";

const mainEl = document.getElementById("main");
const Outlined = ({ children }) => {
  return (
    <div>
      <div style={style({border: '1px solid #445', padding: '10px'})}>
        { children }
      </div>
    </div>
  );
};

const Main = ({ value, onChange }) => {
  const result = (
    <Outlined>
      <input
        style={style({"margin-bottom": "10px"})}
        value={value}
        input={onChange} />

      <Outlined><p>{ value }</p></Outlined>
    </Outlined>
  );
  return result;
}

const content = atom("")
let newEl = apply(render(<div></div>), mainEl);

content.addTrigger(v => {
  const onChange = (e) => {
    content.set(e.target.value);
  }

  const rendered = render(<Main value={v} onChange={onChange} />);
  newEl = apply(rendered, newEl);
})

content.set("hello, world!")
