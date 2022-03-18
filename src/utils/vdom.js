import { Hic } from './hic.js';

/**
 * Sort of hacky way to determine if some argument is a hic representation.
 */
const isHic = (thing) =>
      Array.isArray(thing)
      && thing.length > 1
      && typeof thing[1] === 'object'
      && !Array.isArray(thing[1]);

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
  const [, prevAttrs] = el._hic || [];

  Object
    .entries(attrs)
    .forEach(([k, v]) => { 
      if (prevAttrs && typeof prevAttrs[k] === 'function') {
        el.removeEventListener(k, prevAttrs[k]);
      }

      if (typeof v === 'function') {
        el.addEventListener(k.toLowerCase(), v);
      } else {
        // Weird specific case. The view doesn't update if you do el.setAttribute('value', 10) on an input element.
        if (k === 'value') {
          el.value = v;
        }
        el.setAttribute(k, v);
      }
    })

  return el;
}

/**
 * Given some hiccup, create an HTML element.
 */
const hiccupToElement = ([tag, ...rest], ns='http://www.w3.org/1999/xhtml') => {
  const hasAttrs = !Array.isArray(rest[0]) && typeof rest[0] === 'object';
  const hic = hasAttrs
        ? [tag, rest[0], ...rest.slice(1)]
        : [tag, {}, ...rest];

  const result = hiccupToElementWithAttrs(hic, ns);
  // The hic representation is stored on the HTML Element to make it easier to perform diffs.
  // This is basically like a virtual dom but stored on the real dom for convenience.
  result._hic = hic;
  return result;
};

/**
 * Attrs is a NamedNodeMap.
 * https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap
 */
const attrsToHiccup = (attrs) => {
  const result = {};
  for (var i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    result[attr.name] = attr.value;
  }
  return result;
}

/**
 * Given some HTML element, recursively determine its hic representation.
 */
const elementToHiccup = (el) => {
  if (el._hic) {
    return el._hic;
  }

  if (el.nodeType !== 1) {
    return el.nodeValue;
  }

  const tagName = el.tagName;
  const attrs = el.attributes;
  const children = el.childNodes;

  const childrenHiccup = [];
  for (var i = 0; i < children.length; i++) {
    childrenHiccup.push(elementToHiccup(children[i]));
  }

  return new Hic(tagName.toLowerCase(), attrsToHiccup(attrs), ...childrenHiccup);
};

const hiccupToElementWithAttrs = ([tag, attrs, ...children], ns='http://www.w3.org/1999/xhtml') => {
  if (tag === 'svg' && !attrs.xmlns) {
    console.warn('Using an SVG without a namespace will result in the SVG not displaying correctly.',
                 'Try adding "xmlns=\"http://www.w3.org/2000/svg\" to the <svg> element.');
  }

  // Namespace must apply to all children too. If a namespace is set on an attribute, it should apply to all children.
  const possiblyOverriddenNs = attrs.xmlns || ns;
  const newEl = document.createElementNS(possiblyOverriddenNs, tag);
  const parsed = updateAttrs(newEl, attrs)

  const resolveChildren = val => {
    return val
      .map(x => {
        if (Array.isArray(x) && x.length === 0 ) {
          return ''
        }

        return x
      })
      .map(x => {
        if (typeof x === 'string' || typeof x === 'number' || !x) {  
          return x;
        }
        
        return hiccupToElement(x, possiblyOverriddenNs)
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

  const renderedChildren = children
        .map(child => {
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
   Given some HTML element, update that element and its children with the hiccup.
   This preserves existing HTML elements without removing and creating new ones.
*/
const update = (el, hic) => {
  const [tag, attrs, ...children] = hic;
  const prevHic = el._hic;
  const [prevTag, prevAttrs, ...prevChildren] = prevHic;

  if (prevTag !== tag) {
    return reset(el.parentNode, hic);
  }

  updateAttrs(el, attrs);

  var additionalChildren = 0;
  children.forEach((child, idx) => {
    const currChildNode = el.childNodes[idx + additionalChildren];
    if (!currChildNode) {
      const newEl = isHic(child) ? hiccupToElement(child) : document.createTextNode(child);
      if (!isHic(child)) {
        newEl._hic = child;
      }

      el.appendChild(newEl);
      additionalChildren += 1;
    } else if (isHic(child)) {
      update(currChildNode, child);
    } else if (currChildNode.nodeType === 1) {
      // A HTML element used to be here, but now it needs to be a text node.
      // Replace it
      const newNode = document.createTextNode(child);
      newNode._hic = child;
      currChildNode.parentNode.replaceChild(newNode, currChildNode);
    } else {
      currChildNode.nodeValue = child;
    }
  });

  // Delete remaining children
  while (el.childNodes.length > children.length) {
    el.childNodes[children.length].remove();
  }

  el._hic = hic;
  return el;
}

/**
 * Given some existing element, replace the contents of that element by calling a render function.
 * The render function is passed the contents of what is being replaced as hic.
 */
export const replace = (el, renderFunc) => {
  const previousHic = el._hic ? el._hic : elementToHiccup(el);
  el._hic = previousHic;
  const renderedHic = render(renderFunc({ children: previousHic }));
  el.parentNode.replaceChild(hiccupToElement(renderedHic), el);
}

/**
   Render the hic and insert it into the element.
*/
export const insert = (hostEl, hic) => {
  const renderedChild = hostEl.children[0];
  if (!renderedChild || renderedChild._hic === undefined) {
    return reset(hostEl, hic);
  }

  return update(renderedChild, render(hic));
}

/**
   Simply render and append some hic
 */
export const append = (el, hic) => {
  const newEl = make(hic);
  return newEl;
}

export const make = (hic) => hiccupToElement(render(hic));

/**
   Conform to the jsx factory signature to produce hiccup.
*/
export const hic = (name, options, ...children) => {
  // Children could be a single argument that is an array of elements.
  // This happens in the case that children is an attr of a custom Component.
  const flattenedChildren = children.reduce((acc, curr) => {
    if (!isHic(curr) && Array.isArray(curr)) {
      return [...acc, ...curr];
    }

    if (curr === null || curr === undefined) {
      return acc;
    }

    return [...acc, curr];
  }, []);
  
  return new Hic(name, options || {}, ...flattenedChildren);
}
