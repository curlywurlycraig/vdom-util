import { hic, apply, render } from "./vdom.js";
import { withState, compose } from "./hoc.js";

const Editor = compose(
  withState({ width: 0 }),

  ({ value, onChange, ref }) => {
    const computeSpans = () => {
      return value.split(" ").map(word => {
        const className = (word === "if" || word === "else") ? "editor_span editor_keyword" : "editor_span";
        return <span class={className}>{ word + " " }</span>
      });
    }

    return <div ref={ref} class="editor_container">
      <textarea class="editor_textarea" value={value} input={e => onChange(e.target.value)} />
      <pre class="editor_draw">
        <code>
          { computeSpans() }
        </code>
      </pre>
    </div>
  }
)

const Main = compose(
  withState({
    editorContent: ""
  }),

  ({ editorContent, setEditorContent, ref }) => {
    return (
      <div ref={ref}>
        <Editor onChange={setEditorContent} value={editorContent} />
      </div>
    );
  }
)

const mainEl = document.getElementById("main");
apply(render(<Main />), mainEl);
