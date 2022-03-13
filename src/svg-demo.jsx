import { hic, insert, append, replace } from "./utils/vdom.js";
import { style } from "./utils/style.js";
import { atom, dep } from "./utils/atom.js";

const Svg = ({ children, ...props }) => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>{children}</svg>
);

// Example 1

const MySvg = ({ width, height, r }) => (
  <Svg width={width} height={height}>
    <rect width="100%" height="100%" fill="transparent" stroke="#ddf" />
    <circle cx="150" cy="100" r={r} fill="transparent" stroke="#ddf" />
    <text
      x="150"
      y={height / 2.0 + r / 3.0}
      font-size={r * 0.8}
      text-anchor="middle"
      stroke="#ddf"
      fill="transparent">SVG</text>
  </Svg>
);

const Example1 = ({ circleRadius, setCircleRadius }) => (
  <div style={style({
         display: 'flex',
         'flex-direction': 'column'
       })}>
    <MySvg width={300} height={200} r={circleRadius} />
    <input
      style={style({
        'max-width': '300px'
      })}
      type="range"
      min="10"
      max="80"
      value={circleRadius}
      input={e => setCircleRadius(e.target.value)}
    />
  </div>
) ;

const example1Container = document.getElementById('example-1-contents');
dep(
  {
    circleRadius: atom(80)
  },
  ({ circleRadius }) => {
    insert(
      example1Container,
      <Example1 circleRadius={circleRadius.value} setCircleRadius={circleRadius.set} />
    );
  }
);


// Example 2

const Example2 = () => (
  <Svg viewBox="0 0 1 1" width="200" height="200">
    <rect x="0.1" width="0.8" height="0.8" y="0.1" fill="#aa85" />
    <rect x="0.15" width="0.8" height="0.8" y="0.15" fill="none" stroke="#aa8" stroke-width="0.01" stroke-dasharray="0.05,0.05" />
  </Svg>
);

insert(
  document.getElementById('example-2-contents'),
  <Example2 />
);

// Example 3

const Example3 = () => (
  <Svg viewBox="0 0 1 1" width="200" height="200">
    <defs>
      <pattern id="diamond" viewBox="0 0 10 10" width="0.05" height="0.05" patternUnits="userSpaceOnUse">
        <polygon points="5,1 9,5 5,9 1,5" fill="#88aa" />
      </pattern>
    </defs>

    <rect x="0" width="1" height="1" y="0" fill="url(#diamond)" stroke="#aa8" stroke-width="0.01" />
  </Svg>
);

insert(
  document.getElementById('example-3-contents'),
  <Example3 />
);


// Example 4

const Example4 = () => (
  <Svg viewBox="0 0 1 1" width="200" height="200" style="margin-right: 10px">
    <defs>
      <pattern id="hatch" viewBox="0 0 1 1" width="10%" height="10%">
        <path d="M0,1 L1,0" stroke="#aa8" fill="none" stroke-width="0.02" />
      </pattern>
    </defs>

    <path d="M0.1,0.1 A 0.8 0.8 0 0 1 0.9 0.9" stroke="#aa8" fill="url(#hatch)" stroke-width="0.01" />
  </Svg>
);

const Example4B = () => (
  <Svg viewBox="0 0 1 1" width="200" height="200" style="margin-right: 10px">
    <defs>
      <pattern id="hatch" viewBox="0 0 1 1" width="10%" height="10%">
        <path d="M0,1 L1,0 M-0.5,0.5 L0.5,-0.5 M0.5,1.5 L1.5,0.5" stroke="#aa8" fill="none" stroke-width="0.02" />
      </pattern>
    </defs>

    <path d="M0.1,0.2 A 0.8 0.8 0 0 1 0.9 0.2 L0.5,0.9 z" stroke="#aa8" fill="url(#hatch)" stroke-width="0.01" />
  </Svg>
);

append(
  document.getElementById('example-4-contents'),
  <Example4 />
);

append(
  document.getElementById('example-4-contents'),
  <Example4B />
);


// Example 5

const Example5 = () => (
  <Svg viewBox="0 0 5 1" width="800" height="200">
    <defs>
      <pattern id="hover-hatch" viewBox="0 0 1 1" width="10%" height="10%">
        <path d="M0,1 L1,0 M-0.5,0.5 L0.5,-0.5 M0.5,1.5 L1.5,0.5" stroke="#88a" fill="none" stroke-width="0.2" />
      </pattern>
    </defs>

    <circle
      tabindex="1"
      id="hoverable-circle"
      cx="0.5"
      cy="0.5"
      r="0.4"
      stroke="#aa8"
      fill="url(#hatch)"
      stroke-width="0.01"
      mouseover={() => console.log('hovered circle')} />

    <circle
      tabindex="2"
      id="other-hoverable-circle"
      cx="1"
      cy="0.6"
      r="0.3"
      stroke="#aa8"
      fill="#aa8a"
      stroke-width="0.01"
      mouseover={() => console.log('hovered other circle')} />
  </Svg>
);

insert(
  document.getElementById('example-5-contents'),
  <Example5 />
);

// Example 6

const myData = [0, 12, 0.9, 3.5];

const Example6 = ({ data }) => {
  const maxData = Math.max(...data);
  return (
    <Svg viewBox="0 0 1 1">
      <defs>
        <pattern id="chart-hatch" viewBox="0 0 1 1" width="0.05" height="0.05" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0,0.5 L1,0.5" stroke="#aa8a" fill="none" stroke-width="0.05" />
        </pattern>

        <marker id="arrow" viewBox="0 0 1 1" markerWidth="0.03" markerHeight="0.03" orient="auto" refX="0.5" refY="0.5" markerUnits="userSpaceOnUse">
          <path d="M0,0 L1,0.5 L0,1 z" fill="#ffa" />
        </marker>
      </defs>

      <line x1="0.04" y1="0.96" x2="0.04" y2="0.04" marker-end="url(#arrow)" stroke="#ffa" stroke-width="0.005" />
      <line x1="0.04" y1="0.96" x2="0.96" y2="0.96" marker-end="url(#arrow)" stroke="#ffa" stroke-width="0.005" />

      { data.map((datum, idx) => (
          <rect
            class="chart-bar"
            x={idx/data.length + 0.1}
            y={1.1 - datum/maxData}
            width="0.1"
            height={datum/maxData - 0.2}
            stroke="#aa8"
            stroke-width="0.005"
            fill="url(#chart-hatch)" />
      )) }
    </Svg>
  );
};

dep(
  { data: atom(myData) },
  ({ data }) => {
    const randomizeData = () => {
      data.set(new Array(4).fill(null).map(() => Math.random() * 15));
    };

    const el = (
      <div>
        <Example6 data={data.value} />
        <button click={randomizeData}>Random data</button>
      </div>
    );

    insert(
      document.getElementById('example-6-contents'),
      el
    );
  });
