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
export const render = (hic: HicType, key = "r"): HicType => {
  if (!isHic(hic)) {
    return hic;
  }

  const [tag, attrs, children] = hic;
  attrs.key = attrs.key || key;
  const renderedChildren = children
    .map((child: HicType, idx) => {
      return render(child, key + "c" + (child?.[1]?.key || idx));
    });

  if (typeof tag === 'function') {
    const renderResult = tag({ ...attrs, children: renderedChildren });
    return render(renderResult, key + "e" + (renderResult?.key || ""));
  }

  return new HicType(tag, attrs, renderedChildren);
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

/**
   Given some HTML element, update that element and its children with the hiccup.
   This preserves existing HTML elements without removing and creating new ones.
*/
export const apply = (hic: any, el: TaggedElement | undefined) => {
  const parent = el?.parentNode;
  let result: TaggedElement | undefined = el;

  if (!hic && hic !== "") {
    return null;
  }
  
  // Basically leaf text nodes. Early return because they cannot have children
  if (!isHic(hic)) {
    if (el?.nodeType !== 3) {
      return document.createTextNode(hic);
    }
    el.nodeValue = hic;
    return el;
  }

  const prevTag = el?._hic?.[0]
  const [tag, attrs] = hic;

  // New element case
  if (prevTag !== tag || !result) {
    const currentNS = attrs.xmlns || (tag === 'svg' ? 'http://www.w3.org/2000/svg' : 'http://www.w3.org/1999/xhtml');
    result = document.createElementNS(currentNS, tag) as TaggedElement;
  }

  // Update element with attrs
  updateAttrs(result, attrs);

  // Apply each child and assign as a child to this element
  // TODO Handle deletion, re-ordering, IDs and so on.
  // Should be able to use the child keys to attach to the right entry
  const children = isHic(hic) ? hic[2] : [];
  children.forEach((child, idx) => {
    const newChildEl = apply(child, el ? el.childNodes[idx] : undefined);
    if (newChildEl && !(result?.childNodes[idx] && result.childNodes[idx].isEqualNode(newChildEl))) {
      // TODO Look into insertBefore(node) instead of append, so we can get the order right
      result?.appendChild(newChildEl);
    }
  });

  result._hic = hic;

  if (result !== el) {
    parent?.replaceChild(result, el!!);
    if (typeof attrs.ref === "function") {
      attrs.ref(result);
    }
  }
  
  return result;
}