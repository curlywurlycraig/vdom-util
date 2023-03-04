import { hic, apply, render } from "./vdom.js";
import { withState, compose, withWhen } from "./hoc.js";

const TestBasic = compose(
  withState({ value: "" }),

  ({ value, setValue, pass, fail, ref }) => {
    const onRef = (e) => {
      ref(e);
      pass();
    }

    return <input ref={onRef} value={value} input={e => setValue(e.target.value)} />
  }
)

const TestWithWhen = compose(
  withState({ value: 0, evenValue: 0, effectCallCount: 0 }),
  withWhen(['evenValue'], ({ runCount, evenValue, setEffectCallCount, effectCallCount, value, pass, fail }) => {
    console.log('evenValue changed!', evenValue, effectCallCount);
    setEffectCallCount(effectCallCount + 1);
    if (value === 10) {
      if (effectCallCount === 5) {
        console.log('alright!')
        pass();
      } else {
        fail();
      }
    }
  }),

  ({ value, setEvenValue, setValue, ref }) => {
    console.log('rendering with value', value);
    if (value < 10) {
      setValue(value + 1);

      if (value % 2 === 0) {
        console.log('setting even value as ', value);
        setEvenValue(value);
      }
    }

    return <p>test</p>
  }
)

const testCases = [
  TestBasic,
  TestWithWhen
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

    return <div class="test_container" ref={(v) => { console.log('ref', v); ref(v)}}>
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
