import { hic, apply, render } from "./vdom.js";
import { withState, compose, withWhen } from "./hoc.js";

const BasicExample = () => {
  return <p>basic example</p>
}

const testBasic = () => {
  const stageEl = document.getElementById("test_stage");

  const result = apply(render(
    <BasicExample />
  ), stageEl);

  setTimeout(() => {
    console.log(result)
    if (result.childNodes.length !== 1) {
      console.error('expected 1 child but got ', result.childNodes.length);
    }

    if (result.childNodes[0].textContent !== 'basic example') {
      console.error('expected "basic example" but got', result.childNodes[0].textContent);
    }
  }, 10)
}

const WithWhenExample = compose(
  withState({ value: 0, evenValue: 0, effectCallCount: 0 }),
  withWhen(['evenValue'], ({ setEffectCallCount, effectCallCount, onWhen }) => {
    onWhen();
    setEffectCallCount(effectCallCount + 1);
  }),

  ({ value, setEvenValue, setValue, onDone, ref }) => {
    if (value >= 10) {
      onDone();
      return <p>done.</p>
    }

    setValue(value + 1);

    if (value % 2 === 0) {
      setEvenValue(value);
    }

    return <p ref={ref}>test</p>
  }
)

const testWithWhen = () => {
  let effectCallCount = 0;
  const stageEl = document.getElementById("test_stage");

  apply(render(
    <WithWhenExample
      onWhen={() => {
        effectCallCount++;
      }}
      onDone={() => {
        if (effectCallCount !== 5) {
          console.error("expected 5 side effect calls but got", effectCallCount);
        }
      }}
    />
  ), stageEl);
}

const testCases = [
  testBasic,
  testWithWhen
]

testCases.forEach(testCase => {
  testCase();
})

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

// const mainEl = document.getElementById("main");
// apply(render(<Test />), mainEl);
