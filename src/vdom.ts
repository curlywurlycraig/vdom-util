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
   Given some hiccup, resolve any components to their resulting DOM only
   hiccup. That is, only hiccup elements with lower case tag names should remain.
   
   This entails running the components with their attributes.
*/
const render = ([tag, attrs, ...children]: HicType): HicType => {
  if (typeof tag === 'function') {
    return render(tag({ ...attrs, children }));
  }

  const renderedChildren = children
        .map((child: HicType) => {
          if (Array.isArray(child) && child.length) {
            return render(child);
          }

          return child;
        });

  return [tag, attrs, ...renderedChildren];
};

/**
   Given some HTML element, update that element and its children with the hiccup.
   This preserves existing HTML elements without removing and creating new ones.
*/
export const apply = (hic: HicType, el: TaggedElement) => {
  const prevHic = el._hic!!;
  const [prevTag, prevAttrs, ...prevChildren] = prevHic;

  walk(hic, el, (currHic, childrenAfter, currEl, parent) => {
    const [tag, attrs, ...children] = currHic;

    if (prevTag !== tag) {
      (el.parentNode!! as HTMLElement).innerHTML = '';
      (el.parentNode!!).appendChild(hiccupToElement(render(hic)));
      return el.parentNode;
    }

    if (!currEl) {
      return hiccupToElement(currHic);
    }

    updateAttrs(currEl, attrs);

    currEl._hic = currHic;
    return currEl;
  });

  var additionalChildren = 0;
  children.forEach((child, idx) => {
    const currChildNode = el.childNodes[idx + additionalChildren];
    if (!currChildNode) {
      const newEl = isHic(child) ? hiccupToElement(child) : document.createTextNode(child) as TaggedNode;

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
      const newNode = document.createTextNode(child) as TaggedNode;
      newNode._hic = child;
      currChildNode.parentNode.replaceChild(newNode, currChildNode);
    } else {
      if (currChildNode.nodeValue !== child.toString()) {
        currChildNode.nodeValue = child;
      }
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
   Conform to the jsx factory signature to produce hiccup.
*/
export const hic = (name, options, ...children): HicType => {
  return [name, options || {}, ...children];
}