import { hic, apply, render } from "./vdom.js";
import { withPropMap, withState, compose } from "./hoc.js";
import { style } from "./style.js";

const SplitSpaces = ({ value }) => {
  const strings = value ? value.split(" ") : [];
  return <div>
    { strings.map(s => <p>{s}</p>)}
  </div>;
};

// Demo of a component that doesn't render anything to the DOM.
const LogInc = compose(
  withState({ state: 0 }),

  ({ state, setState }) => {
    console.log('state is', state)
    if (state < 10) {
      setState(state + 1);
    }
  }
)

const Outlined = ({ children, ref }) => {
  return (
    <div ref={ref}>
      <div style={style({border: '1px solid #445', padding: '10px'})}>
        { children }
      </div>
      <LogInc />
    </div>
  );
};

const MyForm = ({ value, onChange, onSubmitClick, ref }) => {
  return <Outlined ref={ref}>
      <input
        style={style({"margin-bottom": "10px"})}
        value={value}
        input={onChange} />

      <button click={() => onSubmitClick(value)}>Submit</button>
  </Outlined>
}

const WrappedForm = compose(
  withState({ formContent: "hello" }),
  withPropMap(
    ({ formContent, setFormContent }) =>
    ({ value: formContent, onChange: e => setFormContent(e.target.value) })
  ),

  MyForm
);

const Main = compose(
  withState({ submittedResult: null }),

  ({ submittedResult, setSubmittedResult, ref }) => {
    return (
      <div ref={ref}>
        <WrappedForm onSubmitClick={setSubmittedResult} />
        <WrappedForm onSubmitClick={setSubmittedResult} />
        <p><SplitSpaces value={submittedResult} /></p>
      </div>
    );
  }
)

const mainEl = document.getElementById("main");
apply(render(<Main />), mainEl);
