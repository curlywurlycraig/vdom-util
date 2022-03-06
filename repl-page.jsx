//
// Hiccupjs
//

const isHic = (thing) => Array.isArray(thing) && thing.length > 1 && typeof thing[1] === 'object' && !Array.isArray(thing[1]);

/**
 * Adds a dictionary representation of the HTMLElement
 * to the element
 * EX:
 * input | { click: (event) => alert('hello') }
 *
 * TODO Handle removal of attrs
 * 
 * @param {HTMLElement} el
 * @param {Object} attrs 
 */
const updateAttrs = (el, attrs) => {
  const [, prevAttrs] = el._hic ? el._hic : [];

  Object
    .entries(attrs)
    .forEach(([k, v]) => { 
      if (prevAttrs && typeof prevAttrs[k] === 'function') {
        el.removeEventListener(k, prevAttrs[k]);
      }

      if (typeof v === 'function') {
        el.addEventListener(k.toLowerCase(), v);
      } else if (k === 'value') {
        // Weird specific case. The view doesn't update if you do el.setAttribute('value', 10) on an input element.
        el.value = v;
      } else {
        el.setAttribute(k, v);
      }
    })

  return el;
}

const hiccupToElement = ([tag, ...rest]) => {
  const hasAttrs = !Array.isArray(rest[0]) && typeof rest[0] === 'object';
  const hic = hasAttrs
        ? [tag, rest[0], ...rest.slice(1)]
        : [tag, {}, ...rest];

  const result = hiccupToElementWithAttrs(...hic);
  // The hic representation is stored on the HTML Element to make it easier to perform diffs.
  // This is basically like a virtual dom but stored on the real dom for convenience.
  result._hic = hic;
  return result;
}

const hiccupToElementWithAttrs = (tag, attrs, ...children) => {
  const parsed = updateAttrs(document.createElement(tag), attrs)
  const resolveChildren = val => {
    return val
      .map(x => {
        if (Array.isArray(x) && x.length === 0 ) {
          return ''
        }

        return x
      })
      .map(x => {
        if (typeof x === 'string' || typeof x === 'number') {  
          return x
        }
        
        return hiccupToElement(x)
      })
  } 

  return resolveChildren(children)
    .reduce((ac, x) => { 
      ac.append(x)
      return ac
    }, parsed)
}

/**
   Given some hiccup, resolve any components to their resulting DOM only
   hiccup. That is, only hiccup elements with lower case tag names should remain.
   
   This entails running the components with their attributes.
*/
const render = ([tag, attrs, ...children]) => {
  if (typeof tag === 'function') {
    return render(tag({ ...attrs, children }));
  }

  const renderedChildren = children.map(child => {
    if (Array.isArray(child) && child.length) {
      return render(child);
    }
    return child;
  });

  return [tag, attrs, ...renderedChildren];
};

/**
   Reset the contents of el to a fresh render of hic.
*/
const reset = (el, hic) => {
  el.innerHTML = '';
  el.appendChild(hiccupToElement(render(hic)));
  return el;
};

/**
   Render the hic and apply it to the element.
*/
const apply = (hostEl, hic) => {
  const renderedChild = hostEl.children[0];
  if (!renderedChild || renderedChild._hic === undefined) {
    // First run, easy.
    return reset(hostEl, hic);
  }

  return update(renderedChild, render(hic));
}

/**
   Given some HTML element, update that element and its children with the hiccup.
   This preserves existing HTML elements without removing and creating new ones.
*/
const update = (el, hic) => {
  const [tag, attrs, ...children] = hic;
  const prevHic = el._hic;
  const [prevTag, prevAttrs, ...prevChildren] = prevHic;

  if (prevTag !== tag) {
    return reset(el, hic)
  }

  const newEl = updateAttrs(el, attrs);
  const newChildren = children.map((child, idx) => {
    if (isHic(child)) {
      if (!el.children[idx]) {
        return hiccupToElement(child);
      }
      return update(el.children[idx], child);
    }

    return child;
  });
  el.replaceChildren(...newChildren);
  el._hic = hic;
  return el;
}

//
// Utils
//

/**
   A light subscribable wrapper around state.
   
   This is a bit of a swiss army knife. You can use the same data to render multiple components in different parts of the app quite easily, or you can use this as a simple state holder for a single component.
   
   It enables redux-style subscriptions, or the useState react paradigm (implemented as HOC).
*/
const atom = (initialValue) => {
  const result = {
    triggers: [],
    value: initialValue,
    addTrigger: (trigger) => {
      result.triggers.push(trigger);
    },
    set: (val) => {
      result.value = val;
      result.triggers.forEach(trig => trig(val, result.set, result));
    }
  }

  return result;
};

/**
   Makes a style string from an object
*/
const style = (obj) =>
      Object.entries(obj).reduce((acc, [k, v]) => `${acc}; ${k}: ${v}; `, '')

/**
   Conform to the jsx factory signature to produce hiccup.
*/
const hic = (name, options, ...children) => {
  // Children could be a single argument that is an array of elements.
  // This happens in the case that children is an attr of a custom Component.
  const isChildArray = children.length === 1 && Array.isArray(children[0]) && !isHic(children[0])
  const actualChildren = isChildArray ? children[0] : children;
  return [name, options || {}, ...actualChildren];
}

//
// demo
//

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

