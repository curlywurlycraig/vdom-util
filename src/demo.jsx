import { style, atom, hic, apply } from "./utils.js";

const mainEl = document.getElementById("main");
const mousepadEl = document.getElementById("mousepad");
const extraEl = document.getElementById("extra");
const counterEditorEl = document.getElementById("editor");

const UpsideDown = ({ children }) => (
  <div style={style({transform: 'rotate(180deg)'})}>
    { children }
  </div>
);

const myAtom = atom(0);
const Counter = ({ count, setCount }) => (
  <UpsideDown>
    <p>count is {count}</p>
    <button click={() => setCount(count + 1)}>increment</button>
  </UpsideDown>
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
cursorPositionAtom.addTrigger((pos, setPos) => apply(mousepadEl, <Mousepad pos={pos} setPos={setPos} />));
cursorPositionAtom.set([0, 0]);

myAtom.addTrigger((count, setCount) => apply(mainEl, <Counter count={count} setCount={setCount} />));

/**
   An example of a custom component being rendered within a component.
*/
const ManyDots = ({ count, setCount }) => (
  <UpsideDown>
    <p>
      { new Array(count).fill('.') }
    </p>
  </UpsideDown>
);
cursorPositionAtom.addTrigger((pos) => apply(mainEl, <ManyDots count={pos[0]} />));

// Let's add a text box too
const CounterEditor = ({ count, setCount }) => (
  <input input={(e) => setCount(Number(e.target.value))} value={count} />
);

myAtom.addTrigger((count, setCount) => apply(counterEditorEl, <CounterEditor count={count} setCount={setCount} />));

myAtom.set(0);

// setInterval(() => {
//     myAtom.set(myAtom.value + 1);
// }, 1000);

