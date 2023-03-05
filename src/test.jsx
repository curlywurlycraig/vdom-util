import { hic, apply, render } from "./vdom.js";
import { withState, compose, withWhen } from "./hoc.js";

const BasicExample = () => {
  return <p>basic example</p>
}

const testBasic = (pass, fail) => {
  const result = apply(render(
    <BasicExample />
  ));

  setTimeout(() => {
    if (result.childNodes.length !== 1) {
      console.error('expected 1 child but got ', result.childNodes.length);
      fail();
      return;
    }

    if (result.childNodes[0].textContent !== 'basic example') {
      console.error('expected "basic example" but got', result.childNodes[0].textContent);
      fail();
      return;
    }

    pass();
  }, 100)
}

const WithWhenExample = compose(
  withState({ value: 0, evenValue: 0, effectCallCount: 0 }),
  withWhen(['evenValue'], ({ setEffectCallCount, effectCallCount }) => {
    setEffectCallCount(effectCallCount + 1);
  }),

  ({ value, setEvenValue, setValue, effectCallCount, ref }) => {
    if (value > 10) {
      return <p ref={ref}>{ effectCallCount }</p>
    }

    setValue(value + 1);

    if (value % 2 === 0) {
      setEvenValue(value);
    }

    return <p ref={ref}>{ effectCallCount }</p>
  }
)

const testWithWhen = (pass, fail) => {
  const result = apply(render(
    <WithWhenExample />
  ));

  setTimeout(() => {
    if (result.childNodes.length !== 1) {
      console.error('expected 1 child but got ', result.childNodes.length);
      fail();
      return;
    }

    // 0, 2, 4, 6, 8, 10
    if (result.childNodes[0].textContent !== '6') {
      console.error('expected 6 but got', result.childNodes[0].textContent);
      fail();
      return;
    }

    pass();
  }, 100);
}

const testCases = [
  testBasic,
  testWithWhen
]

const runTests = () => {
  const results = [];
  const resultsEl = apply(
    render(<TestResults results={results} />),
    document.getElementById("test_results")
  );

  const pass = (testCase) => {
    console.log('case passed', testCase.name);
    results.push('.');
    apply(render(<TestResults results={results} />), resultsEl);
  };

  const fail = (testCase) => {
    console.error('case failed', testCase.name);
    results.push('F');
    apply(render(<TestResults results={results} />), resultsEl);
  };

  testCases.forEach(testCase => {
    testCase(
      () => pass(testCase),
      () => fail(testCase));
  })
}

const TestResults = compose(
  ({ results }) => {
    return <div id="test_results">
      <p>
        { results.map(res => {
            const className = res === 'F' ? "result_fail" : "result_pass";
            return <span class={className}>{ res }</span>;
          }
        )}
      </p>
    </div>;
  }
)

runTests();
