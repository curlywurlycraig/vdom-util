import { hic, apply, render } from "./vdom.js";
import { withState, compose } from "./hoc.js";

const TestBasic = compose(
  withState({ value: "", hasRun: false }),

  ({ value, setValue, pass, fail, hasRun, setHasRun, key, ref }) => {
    const onRef = (e) => {
      ref(e);
      if (!hasRun) {
        setHasRun(true);
        pass();
      }
    }

    return <input ref={onRef} value={value} input={e => setValue(e.target.value)} />
  }
)

const testCases = [
  TestBasic,
]

const Test = compose(
  withState({ testResults: [] }),

  ({ testResults, setTestResults, ref }) => {
    const pass = () => {
      setTestResults([...testResults, "."]);
    };
    const fail = () => {
      setTestResults([...testResults, "F"]);
    };

    return <div class="test_container" ref={ref}>
      <div class="test_results">
        <p>
          { testResults.map(res => {
              const className = res === 'F' ? "result_fail" : "result_pass";
              return <span class={className}>{ res }</span>;
            }
          )}
        </p>
      </div>

      <div class="test_stage">
        { testCases.map(Case => <Case pass={pass} fail={fail} />) }
      </div>
    </div>
  }
)

const mainEl = document.getElementById("main");
apply(render(<Test />), mainEl);
