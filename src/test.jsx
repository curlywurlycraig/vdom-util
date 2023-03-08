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

const ChangingChildrenExample = compose(
  withState({ childValues: [<span>test1</span>, " test2 ", <span>test3</span>] }),
  withWhen([], ({ setChildValues }) => {
    setChildValues(["test0 ", <span>test1</span>, " test2 ", <span>test3</span>]);
  }),

  ({ ref, childValues }) => {
    return <div ref={ref}>
      { childValues }
    </div>;
  }
);

const testChangeChildren = (pass, fail) => {
  const result = apply(render(<ChangingChildrenExample />));

  setTimeout(() => {
    if (result.textContent !== 'test0 test1 test2 test3') {
      console.error(`expected "test0 test1 test2 test3" but was "${result.textContent}"`);
      fail();
      return;
    }

    pass();
  }, 100);
}

const ShrinkingChildrenExample = compose(
  withState({ childValues: [<span>test1</span>, " test2 ", <span>test3</span>] }),
  withWhen([], ({ setChildValues }) => {
    setChildValues(["test2"]);
  }),

  ({ ref, childValues }) => {
    return <div ref={ref}>
      { childValues }
    </div>;
  }
);

const testShrinkChildren = (pass, fail) => {
  const result = apply(render(<ShrinkingChildrenExample />));

  setTimeout(() => {
    if (result.textContent !== 'test2') {
      console.error(`expected "test2" but was "${result.textContent}"`);
      fail();
      return;
    }

    pass();
  }, 100);
}

const DifferentElementChild1 = compose(
  withState({ value: 0 }),
  withWhen([], ({ setValue }) => {
    setValue(1);
  }),
  ({ ref, value }) => {
    return <p ref={ref}>{ value }</p>;
  }
)

const DifferentElementChild2 = compose(
  withState({ foo: 10 }),
  withWhen([], ({ setFoo }) => {
    setFoo(20);
  }),
  ({ ref, foo }) => {
    return <p ref={ref}>{ foo }</p>;
  }
)

const DifferentElementExample = compose(
  withState({ currentChild: 0 }),
  withWhen([], ({ setCurrentChild }) => {
    setCurrentChild(1);
  }),
  ({ ref, currentChild }) => {
    if (currentChild === 0) {
      return <div ref={ref}>
          <DifferentElementChild1 />
        </div>;
    } else {
      return <div ref={ref}>
        <DifferentElementChild2 />
      </div>;
    }
  }
)

const testChangingElementChild = (pass, fail) => {
  const result = apply(render(<DifferentElementExample />));

  setTimeout(() => {
    if (result.textContent !== '20') {
      console.error(`expected "20" but was "${result.textContent}"`);
      fail();
      return;
    }

    pass();
  }, 100);
}

const testCases = [
  testBasic,
  testWithWhen,
  testChangeChildren,
  testShrinkChildren,
  testChangingElementChild
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
