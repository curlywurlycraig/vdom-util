import { hic, apply, render } from "./vdom.js";
import { withState, compose } from "./hoc.js";
import { ParseContext, parseC } from "./parse/parser.js";

const Editor = compose(
  withState({ width: 0 }),

  ({ value, onChange, ref }) => {
    const computeSpans = () => {
      const tok = new ParseContext(value);
      parseResult = parseC(tok);
      
      if (tok.tokens.length === 0) {
        return [value];
      }
      
      return tok.tokens.reduce((resultEls, currToken, currIdx, orig) => {
        const prevToken = orig[currIdx - 1];
        const soFar = prevToken?.end || 0;
        
        if (currToken.start > soFar) {
          resultEls.push(value.slice(soFar, currToken.start));
        }

        const className = `parsed_${currToken.type}`;
        const spanContents = value.slice(currToken.start, currToken.end);
        resultEls.push(<span class={className}>{ spanContents }</span>);

        if (currIdx === orig.length - 1) {
          resultEls.push(value.slice(currToken.end));
        }
        return resultEls;
      }, []);
    }

    return (
      <div ref={ref} class="editor_container">
        <textarea class="editor_textarea" value={value} input={e => onChange(e.target.value)} />
        <pre class="editor_draw">
          <code>
            { computeSpans() }
          </code>
        </pre>
      </div>
    );
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
