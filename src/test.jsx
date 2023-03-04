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
  withWhen(['evenValue'], ({ setEffectCallCount, effectCallCount, value, pass, fail }) => {
    setEffectCallCount(effectCallCount + 1);
    if (value === 10) {
      if (effectCallCount === 5) {
        pass();
      } else {
        fail();
      }
    }
  }),

  ({ value, setEvenValue, setValue, ref }) => {
    if (value < 10) {
      setValue(value + 1);
    }

    if (value % 2 === 0) {
      setEvenValue(value);
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
      testResults.push('.');
      setTestResults(testResults);
    };

    const fail = () => {
      testResults.push('F');
      setTestResults(testResults);
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
