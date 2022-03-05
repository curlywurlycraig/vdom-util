//
// Hiccupjs
//

/**
 * Adds a dictionary representation of the HTMLElement
 * to the element
 * EX:
 * input | { click: (event) => alert('hello') }
 * 
 * @param {HTMLElement} el
 * @param {Object} attrs 
 */
const mergeElementWithAttrs = (el, attrs) => {
  Object
    .entries(attrs)
    .forEach(ent => { 
      if (typeof ent[1] === 'function') {
        const [ eventName, fn ] = ent
        el.addEventListener(eventName.toLowerCase(), fn)
      } else {
        el.setAttribute(...ent)
      }
    })

  return el
}

const hiccupToNode = ([tag, ...rest]) => {
    if (!Array.isArray(rest[0]) && typeof rest[0] === 'object') {
	return hiccupToNodeWithAttrs(tag, rest[0], ...rest.slice(1));
    } else {
	return hiccupToNodeWithAttrs(tag, {}, ...rest);
    }
}

const hiccupToNodeWithAttrs = (tag, attrs, ...value) => {
  const parsed = mergeElementWithAttrs(document.createElement(tag), attrs)
  const resolveValue = val => {
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
      
        return hiccupToNode(x)
      })
  } 

  return resolveValue(value)
    .reduce((ac, x) => { 
      ac.append(x)
      return ac
    }, parsed)
}

// Next step: how to keep the same elements, instead of creating new ones?
// Ideally without having to go with a fully fledged "virtual dom"

// Things I can't quite fit together:
// 1. Reacting to changes (atoms are a good piece of this)
// 2. Composing atoms and logic in a nice way with pure functions
// 3. "Mounting" and having the DOM update without e.g. losing focus on an input
// 3.1. I think I can do this just by having h() try to update stuff that's already there

// Basically, instead of h(), have some update() function that takes an HTML element
// and a hiccup element and commits the differences to the existing element

const update = (el, hic) => {
    el.innerHTML = '';
    el.appendChild(hiccupToNode(hic))
    return el;
};

// I quite like the idea of the pure functions not using closures. Basically you could always lift
// a pure function out.

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
      Object.entries(obj).reduce((acc, [k, v]) => `${acc}; ${k}: ${v}`, '')

//
// JSX component maker
//
const toHiccup = (name, options, ...children) => {
    return [name, options || {}, ...children];
}

//
// demo
//

const mainEl = document.getElementById("main");

const myAtom = atom(0);
const counterComponent = (count, setCount) => (
    <div>
	<p>count is {count}</p>
	<button click={() => setCount(count + 1)}>increment</button>
    </div>
);

const cursorPositionAtom = atom([0, 0]);
const mousepadEl = document.getElementById("mousepad");
const Mousepad = ([x, y], setCursorPosition) => {
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
cursorPositionAtom.addTrigger((pos, setPos) => update(mousepadEl, Mousepad(pos, setPos)));
cursorPositionAtom.set([0, 0]);


// Since presentational components are simply functions that return hiccup, subscribing to changes in
// an atom and having the component be re-rendered is very simple
const extraEl = document.getElementById("extra");
myAtom.addTrigger((count, setCount) => update(extraEl, counterComponent(count, setCount)));
myAtom.addTrigger((count, setCount) => update(mainEl, counterComponent(count, setCount)));

// Let's add a text box too
const counterEditor = (count, setCount) => (
    <input input={(e) => setCount(Number(e.target.value))} value={count} />
);

const counterEditorEl = document.getElementById("editor");
myAtom.addTrigger((count, setCount) => update(counterEditorEl, counterEditor(count, setCount)));

myAtom.set(0);

// setInterval(() => {
//     myAtom.set(myAtom.value + 1);
// }, 1000);

