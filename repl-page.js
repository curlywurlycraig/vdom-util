//
// Hiccupjs
//

const h = (el, dt) => 
  update(el, htmlDataStructureToNode(...dt))

const update = (element, component) => {
  element.innerHTML = ''
  element.appendChild(component)
  return component;
}

const parseTag = htmlTag => document.createElement(htmlTag)
const isFunction = x => typeof x === 'function'

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
      if (isFunction(ent[1])) {
        const [ eventName, fn ] = ent
        el.addEventListener(eventName.toLowerCase(), fn)
      } else {
        el.setAttribute(...ent)
      }
    })

  return el
}

const htmlDataStructureToNode = (tag, ...rest) => {
    if (!Array.isArray(rest[0]) && typeof rest[0] === 'object') {
	return innerHtmlDataStructureToNode(tag, rest[0], ...rest.slice(1));
    } else {
	return innerHtmlDataStructureToNode(tag, {}, ...rest);
    }
}

const innerHtmlDataStructureToNode = (tag, attrs, ...value) => {
  const parsed = mergeElementWithAttrs(parseTag(tag), attrs)
  const resolveValue = val => {
    return val
      .map(x => {
        if (Array.isArray(x) && x.length === 0 ) {
          return ''
        }

        return x
      })
      .map(x => {
        if (typeof x === 'string') {  
          return x
        }
      
        return htmlDataStructureToNode(...x)
      })
  } 

  return resolveValue(value)
    .reduce((ac, x) => { 
      ac.append(x)
      return ac
    }, parsed)
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

//
// demo
//

const mainEl = document.getElementById("main");

const myAtom = atom(0);
const counterComponent = (count, setCount) =>
      ["div",
       ["p", `count is ${count}`],
       ["button", {
	   click: () => setCount(count + 1)
       }, "increment"]]


// Since presentational components are simply functions that return hiccup, subscribing to changes in
// an atom and having the component be re-rendered is very simple
const extraEl = document.getElementById("extra");
myAtom.addTrigger((count, setCount) => h(extraEl, counterComponent(count, setCount)));
myAtom.addTrigger((count, setCount) => h(mainEl, counterComponent(count, setCount)));

// Let's add a text box too
const counterEditor = (count, setCount) =>
      ["input",
       {input: (e) => setCount(Number(e.target.value)),
	value: count},
       ''];

const counterEditorEl = document.getElementById("editor");
myAtom.addTrigger((count, setCount) => h(counterEditorEl, counterEditor(count, setCount)));

myAtom.set(0);

// setInterval(() => {
//     myAtom.set(myAtom.value + 1);
// }, 1000);


// Trying to devise a nice way of composing things:

const requestComponentConnector = () => {
    const results = atom(null);
    const isPending = atom(null);
    const onClickRequest = () => {
	isPending.set(true);
	setTimeout(() => {
	    results.set('yay');
	    isPending.set(false);
	});
    }

    return { results, isPending, onClickRequest }
};

const requestComponentPure = ({ results, isPending, onClickRequest }) => 
      ["div",
       (isPending ? ["p", "loading..."] : null),
       (results ? ["p", "got results"] : null),
       ["button", { click: onClickRequest }, "make request"]];


// Next step: how to keep the same elements, instead of creating new ones?
// Ideally without having to go with a fully fledged "virtual dom"

// Things I can't quite fit together:
// 1. Reacting to changes (atoms are a good piece of this)
// 2. Composing atoms and logic in a nice way with pure functions
// 3. "Mounting" and having the DOM update without e.g. losing focus on an input

// I quite like the idea of the pure functions not using closures. Basically you could always lift
// a pure function out.
