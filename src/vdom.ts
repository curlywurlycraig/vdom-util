class HicType extends Array {}

interface Tagged {
  _hic?: HicType
  value?: any
}

type TaggedElement = Tagged & Element & Node

function isHic(a) {
  return a instanceof HicType;
}

/**
   Conform to the jsx factory signature to produce hiccup.
*/
export const hic = (name, options, ...children): HicType => {
  const flatChildren = children.reduce((acc, child) => {
    if (Array.isArray(child) && !isHic(child)) {
      acc.push(...child);
    } else {
      acc.push(child);
    }
    return acc;
  }, []);
  return new HicType(name, options || {}, flatChildren);
}

/**
   Given some hiccup, resolve any components to their resulting DOM only
   hiccup. That is, only hiccup elements with lower case tag names should remain.
   
   This entails running the components with their attributes.
*/
export const expand = ([tag, attrs, children]: HicType): HicType => {
  const expandedChildren = children
    .map((child: HicType) => {
      if (isHic(child)) {
        return expand(child);
      }

      return child;
    });

  if (typeof tag === 'function') {
    return expand(tag({ ...attrs, children: expandedChildren }));
  }

  return new HicType(tag, attrs, expandedChildren);
};

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
  const children = isHic(hic) ? hic[2] : [];
  const afterChildren = children.map((child, idx) => {
    // TODO something smarter (like with react's key prop) to map nodes to elements in children.
    // Index is obviously not reliable
    return walk(child, node ? node.childNodes[idx] : undefined, f);
  });

  return f(hic, afterChildren, node);
}

/**
   Given some HTML element, update that element and its children with the hiccup.
   This preserves existing HTML elements without removing and creating new ones.
*/
export const apply = (hic: HicType, el: TaggedElement) => {
  const parent = el.parentNode;
  const result = walk(hic, el, (currHic, childrenAfter, currEl) => {
    if (!isHic(currHic)) {
      return document.createTextNode(currHic);
    }

    const prevHic = currEl?._hic ? currEl._hic : [undefined];
    const [prevTag] = prevHic;
    const [tag, attrs] = currHic;

    var result = currEl;
    if (prevTag !== tag || !result) {
      const currentNS = attrs.xmlns || (tag === 'svg' ? 'http://www.w3.org/2000/svg' : 'http://www.w3.org/1999/xhtml');
      result = document.createElementNS(currentNS, tag) as TaggedElement;
    }

    updateAttrs(result, attrs);

    childrenAfter.forEach((child, idx) => {
      if (child && !(result.childNodes[idx] && result.childNodes[idx].isEqualNode(child))) {
        // TODO Look into insertBefore(node) instead of append, so we can get the order right
        result.appendChild(child);
      }
    })

    // TODO Implement deletion of children

    result._hic = currHic;
    return result;
  });

  if (result !== el) {
    parent?.replaceChild(result, el);
  }

  return result;
}
