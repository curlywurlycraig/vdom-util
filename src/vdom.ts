type HicType = [any, any, ...any[]];

interface Tagged {
  _hic?: HicType
  value?: any
}

type TaggedElement = Tagged & Element & Node

/**
 * Sort of hacky way to determine if some argument is a hic representation.
 */
const isHic = (thing) =>
      thing.length > 1
      && typeof thing[1] === 'object'
      && !Array.isArray(thing[1]);

/**
   Conform to the jsx factory signature to produce hiccup.
*/
export const hic = (name, options, ...children): HicType => {
  return [name, options || {}, ...children];
}

/**
 * Adds a dictionary representation of the HTMLElement
 * to the element
 * EX:
 * input | { click: (event) => alert('hello') }
 */
const updateAttrs = (el: TaggedElement, attrs: object) => {
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
        
        const asElement = el as TaggedElement;
        if (asElement.getAttribute(k) !== v) {
          asElement.setAttribute(k, v);
        }
      }
    })

  return el;
}

const walk = (hic: HicType, node: Node | undefined, f: Function): any => {
  const afterChildren = hic[2].map((child, idx) => {
    // TODO something smarter (like with react's key prop) to map nodes to elements in children.
    // Index is obviously not reliable
    walk(child, node ? node.childNodes[idx] : undefined, f);
  });

  return f(hic, afterChildren, node);
}

/**
 * Given some hiccup, create an HTML element.
 */
const hiccupToElement = (hic: HicType, ns?: string): TaggedElement => {
  return walk(hic, undefined, (currHic, childrenAfter) => {
    if (!isHic(currHic)) {
      return document.createTextNode(currHic);
    }

    // Otherwise this is a hiccup element.
    // We don't need the original children.
    const [tag, attrs] = currHic;

    // Namespace must apply to all children too. If a namespace is set on an attribute, it should apply to all children.
    const currentNS = attrs.xmlns || ns || (tag === 'svg' ? 'http://www.w3.org/2000/svg' : 'http://www.w3.org/1999/xhtml');
    const newEl = document.createElementNS(currentNS, tag) as TaggedElement;
    updateAttrs(newEl, attrs);

    childrenAfter.forEach(child => {
      newEl.append(child);
    });

    // The hic representation is stored on the HTML Element to make it easier to perform diffs.
    // This is basically like a virtual dom but stored on the real dom for convenience.
    newEl._hic = currHic;
    return newEl;
  })
};


/**
   Given some HTML element, update that element and its children with the hiccup.
   This preserves existing HTML elements without removing and creating new ones.
*/
export const apply = (hic: HicType, el: TaggedElement) => {
  return walk(hic, el, (currHic, childrenAfter, currEl) => {
    const prevHic = currEl._hic ? currEl._hic : [undefined];
    const [prevTag] = prevHic;
    const [tag, attrs] = currHic;

    var result = currEl;
    if (prevTag !== tag || !result) {
      result = hiccupToElement(hic);
    }

    // TODO Make a little test (as in on a web page)
    // that checks that changing an element type (e.g. from <div> to <span>) doesn't disrupt its children state

    updateAttrs(result, attrs);

    childrenAfter.forEach((child, idx) => {
      if (currEl.childNodes[idx] !== child) {
        // TODO Look into insertBefore(node) instead of append, so we can get the order right
        result.appendChild(child);
      }
    })

    // TODO Implement deletion of children

    result._hic = currHic;
    return result;
  });
}

/**
   Given some hiccup, resolve any components to their resulting DOM only
   hiccup. That is, only hiccup elements with lower case tag names should remain.
   
   This entails running the components with their attributes.
*/
const expand = ([tag, attrs, ...children]: HicType): HicType => {
  if (typeof tag === 'function') {
    return expand(tag({ ...attrs, children }));
  }

  const renderedChildren = children
        .map((child: HicType) => {
          if (Array.isArray(child) && child.length) {
            return expand(child);
          }

          return child;
        });

  return [tag, attrs, ...renderedChildren];
};
