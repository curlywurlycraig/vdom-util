import { style, atom, hic, apply } from "./utils.js";

const mainEl = document.getElementById("main");
const mousepadEl = document.getElementById("mousepad");
const extraEl = document.getElementById("extra");
const counterEditorEl = document.getElementById("editor");

const Outlined = ({ children }) => (
  <div style={style({border: '1px solid #445', padding: '10px'})}>
    { children }
  </div>
);

const counterAtom = atom(0);
const Counter = ({ count, setCount }) => (
  <Outlined>
    <p>count is {count}</p>
    <button click={() => setCount(count + 1)}>increment</button>
  </Outlined>
);

const cursorPositionAtom = atom([0, 0]);
const Mousepad = ({ pos: [x, y], setPos: setCursorPosition }) => {
  const opacity = 100 * Math.min(x / 200, 1);
  const red = 255 * Math.min(y / 200, 1);
  const pStyle = style({
    position: 'relative',
    opacity: `${opacity}%`,
    color: `rgb(${red}, 255, 255)`,
  });

  return (
    <div style="width: 100%; height: 100%" mousemove={e => setCursorPosition([e.offsetX, e.offsetY])}>
      <p style={pStyle}>Cursor pos is { x } { y }</p>
    </div>
  );
};
// cursorPositionAtom.addTrigger((pos, setPos) => apply(mousepadEl, <Mousepad pos={pos} setPos={setPos} />));
// cursorPositionAtom.set([0, 0]);

counterAtom.addTrigger((count, setCount) => apply(mainEl, <Counter count={count} setCount={setCount} />));

/**
   An example of a custom component being rendered within a component.
*/
const ManyDots = ({ count, setCount }) => (
  <p style={style({
       color: count > 5 ? 'yellow' : 'white'
     })}>
    { new Array(count).fill('.') }
  </p>
);

// Let's add a text box too
const CounterEditor = ({ count, setCount }) => (
  <input input={(e) => setCount(Number(e.target.value))} value={count} />
);

counterAtom.addTrigger((count, setCount) => apply(counterEditorEl, <CounterEditor count={count} setCount={setCount} />));

counterAtom.set(0);

const otherCounterAtom = atom(0);
otherCounterAtom.addTrigger((value) => apply(mainEl, <ManyDots count={value} />));

apply(mousepadEl, <div>
                    <button click={() => otherCounterAtom.set(otherCounterAtom.value + 1)}>+</button>
                    <button click={() => otherCounterAtom.set(Math.max(0, otherCounterAtom.value - 1))}>-</button>
                  </div>
     );


// setInterval(() => {
//   counterAtom.set(counterAtom.value + 1);
// }, 1000);

