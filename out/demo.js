(() => {
  // src/utils.js
  var isHic = (thing) => Array.isArray(thing) && thing.length > 1 && typeof thing[1] === "object" && !Array.isArray(thing[1]);
  var updateAttrs = (el, attrs) => {
    const [, prevAttrs] = el._hic || [];
    Object.entries(attrs).forEach(([k, v]) => {
      if (prevAttrs && typeof prevAttrs[k] === "function") {
        el.removeEventListener(k, prevAttrs[k]);
      }
      if (typeof v === "function") {
        el.addEventListener(k.toLowerCase(), v);
      } else if (k === "value") {
        el.value = v;
      } else {
        el.setAttribute(k, v);
      }
    });
    return el;
  };
  var hiccupToElement = ([tag, ...rest]) => {
    const hasAttrs = !Array.isArray(rest[0]) && typeof rest[0] === "object";
    const hic2 = hasAttrs ? [tag, rest[0], ...rest.slice(1)] : [tag, {}, ...rest];
    const result = hiccupToElementWithAttrs(...hic2);
    result._hic = hic2;
    return result;
  };
  var hiccupToElementWithAttrs = (tag, attrs, ...children) => {
    const parsed = updateAttrs(document.createElement(tag), attrs);
    const resolveChildren = (val) => {
      return val.map((x) => {
        if (Array.isArray(x) && x.length === 0) {
          return "";
        }
        return x;
      }).map((x) => {
        if (typeof x === "string" || typeof x === "number") {
          return x;
        }
        return hiccupToElement(x);
      });
    };
    return resolveChildren(children).reduce((ac, x) => {
      ac.append(x);
      return ac;
    }, parsed);
  };
  var render = ([tag, attrs, ...children]) => {
    if (typeof tag === "function") {
      return render(tag({ ...attrs, children }));
    }
    const renderedChildren = children.map((child) => {
      if (Array.isArray(child) && child.length) {
        return render(child);
      }
      return child;
    });
    return [tag, attrs, ...renderedChildren];
  };
  var reset = (el, hic2) => {
    el.innerHTML = "";
    el.appendChild(hiccupToElement(render(hic2)));
    return el;
  };
  var apply = (hostEl, hic2) => {
    const renderedChild = hostEl.children[0];
    if (!renderedChild || renderedChild._hic === void 0) {
      return reset(hostEl, hic2);
    }
    return update(renderedChild, render(hic2));
  };
  var update = (el, hic2) => {
    const [tag, attrs, ...children] = hic2;
    const prevHic = el._hic;
    const [prevTag, prevAttrs, ...prevChildren] = prevHic;
    if (prevTag !== tag) {
      return reset(el.parentNode, hic2);
    }
    updateAttrs(el, attrs);
    children.forEach((child, idx) => {
      if (!el.childNodes[idx]) {
        const newEl = isHic(child) ? hiccupToElement(child) : document.createTextNode(child);
        el.appendChild(newEl);
        return;
      }
      if (isHic(child)) {
        update(el.childNodes[idx], child);
        return;
      }
      el.childNodes[idx].nodeValue = child;
    });
    for (var i = children.length; i < el.childNodes.length; i++) {
      el.childNodes[i].remove();
    }
    el._hic = hic2;
    return el;
  };
  var atom = (initialValue) => {
    const result = {
      triggers: [],
      value: initialValue,
      addTrigger: (trigger) => {
        result.triggers.push(trigger);
      },
      set: (val) => {
        result.value = val;
        result.triggers.forEach((trig) => trig(val, result.set, result));
      }
    };
    return result;
  };
  var style = (obj) => Object.entries(obj).reduce((acc, [k, v]) => `${acc}; ${k}: ${v}; `, "");
  var hic = (name, options, ...children) => {
    const isChildArray = children.length === 1 && Array.isArray(children[0]) && !isHic(children[0]);
    const actualChildren = isChildArray ? children[0] : children;
    return [name, options || {}, ...actualChildren];
  };

  // src/demo.jsx
  var mainEl = document.getElementById("main");
  var mousepadEl = document.getElementById("mousepad");
  var extraEl = document.getElementById("extra");
  var counterEditorEl = document.getElementById("editor");
  var Outlined = ({ children }) => /* @__PURE__ */ hic("div", {
    style: style({ border: "1px solid #445", padding: "10px" })
  }, children);
  var counterAtom = atom(0);
  var Counter = ({ count, setCount }) => /* @__PURE__ */ hic(Outlined, null, /* @__PURE__ */ hic("p", null, "count is ", count), /* @__PURE__ */ hic("button", {
    click: () => setCount(count + 1)
  }, "increment"));
  var cursorPositionAtom = atom([0, 0]);
  counterAtom.addTrigger((count, setCount) => apply(mainEl, /* @__PURE__ */ hic(Counter, {
    count,
    setCount
  })));
  var ManyDots = ({ count, setCount }) => /* @__PURE__ */ hic("p", {
    style: style({
      color: count > 5 ? "yellow" : "white"
    })
  }, new Array(count).fill("."));
  var CounterEditor = ({ count, setCount }) => /* @__PURE__ */ hic("input", {
    input: (e) => setCount(Number(e.target.value)),
    value: count
  });
  counterAtom.addTrigger((count, setCount) => apply(counterEditorEl, /* @__PURE__ */ hic(CounterEditor, {
    count,
    setCount
  })));
  counterAtom.set(0);
  var otherCounterAtom = atom(0);
  otherCounterAtom.addTrigger((value) => apply(mainEl, /* @__PURE__ */ hic(ManyDots, {
    count: value
  })));
  apply(mousepadEl, /* @__PURE__ */ hic("div", null, /* @__PURE__ */ hic("button", {
    click: () => otherCounterAtom.set(otherCounterAtom.value + 1)
  }, "+"), /* @__PURE__ */ hic("button", {
    click: () => otherCounterAtom.set(Math.max(0, otherCounterAtom.value - 1))
  }, "-")));
})();
