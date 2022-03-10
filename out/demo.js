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
      } else {
        if (k === "value") {
          el.value = v;
        }
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
  var attrsToHiccup = (attrs) => {
    const result = {};
    for (var i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      result[attr.name] = attr.value;
    }
    return result;
  };
  var elementToHiccup = (el) => {
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
    return [tagName.toLowerCase(), attrsToHiccup(attrs), ...childrenHiccup];
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
        if (typeof x === "string" || typeof x === "number" || !x) {
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
    while (el.childNodes.length > children.length) {
      el.childNodes[children.length].remove();
    }
    el._hic = hic2;
    return el;
  };
  var replace = (el, renderFunc) => {
    const previousHic = elementToHiccup(el);
    const renderedHic = render(renderFunc({ children: previousHic }));
    reset(el, renderedHic);
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
  counterAtom.addTrigger((count, setCount) => apply(mainEl, /* @__PURE__ */ hic(Counter, {
    count,
    setCount
  })));
  var ManyDots = ({ count, setCount }) => /* @__PURE__ */ hic("p", {
    style: style({
      color: count > 15 ? "red" : count > 10 ? "orange" : count > 5 ? "yellow" : "white"
    })
  }, new Array(count).fill("."));
  var CounterEditor = ({ count, setCount }) => /* @__PURE__ */ hic("input", {
    input: (e) => setCount(Number(e.target.value)),
    value: count
  });
  var dep = (deps, func) => {
    const runFunc = () => func(deps);
    Object.values(deps).forEach((dep2) => dep2.addTrigger(runFunc));
    runFunc();
  };
  dep({ count: counterAtom }, ({ count }) => {
    const setCount = (newCount) => {
      if (!isNaN(newCount)) {
        count.set(newCount);
      }
    };
    apply(counterEditorEl, /* @__PURE__ */ hic(CounterEditor, {
      count: count.value,
      setCount
    }));
  });
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
  replace(document.getElementById("ellipse"), ({ children }) => /* @__PURE__ */ hic("p", null, "This used to be: ", children));
  var myThings = [
    {
      name: "Craig",
      age: 28
    },
    {
      name: "Meg",
      age: 30
    },
    {
      name: "Geordi",
      age: 0.4
    }
  ];
  for (i = 0; i < 1e3; i++) {
    myThings.push({ name: `Player_${i}`, age: i });
  }
  var i;
  var TableSearch = ({ search, setSearch, items }) => {
    const results = items.filter((thing) => thing.name.toLowerCase().includes(search.toLowerCase()) || thing.age.toString().includes(search));
    return /* @__PURE__ */ hic("div", null, /* @__PURE__ */ hic("input", {
      placeholder: "Search table",
      input: (e) => setSearch(e.target.value),
      value: search
    }), /* @__PURE__ */ hic("table", {
      style: style({ margin: "10px" })
    }, /* @__PURE__ */ hic("thead", null, /* @__PURE__ */ hic("tr", null, /* @__PURE__ */ hic("th", null, "Name"), /* @__PURE__ */ hic("th", null, "Age"), /* @__PURE__ */ hic("th", null, "An input"))), /* @__PURE__ */ hic("tbody", null, results.map((result) => /* @__PURE__ */ hic("tr", null, /* @__PURE__ */ hic("td", null, result.name), /* @__PURE__ */ hic("td", null, result.age), /* @__PURE__ */ hic("td", null, /* @__PURE__ */ hic("input", null)))))));
  };
  var searchTerm = atom("");
  searchTerm.addTrigger((search, setSearch) => apply(document.getElementById("searcher"), /* @__PURE__ */ hic(TableSearch, {
    search,
    setSearch,
    items: myThings
  })));
  searchTerm.set("");
  var PackageJsonFetcher = ({ isFetching, result, onClickFetch }) => /* @__PURE__ */ hic("div", null, isFetching ? "fetching..." : null, result ? `got ${result}` : null, /* @__PURE__ */ hic("button", {
    click: onClickFetch
  }, "Click to get the author of this package"));
  dep({
    isFetching: atom(false),
    result: atom(null)
  }, ({ isFetching, result }) => {
    const doFetch = async () => {
      isFetching.set(true);
      const fetchResult = await fetch("package.json");
      const jsonResult = await fetchResult.json();
      isFetching.set(false);
      result.set(jsonResult.author);
    };
    apply(document.getElementById("package-json-fetcher"), /* @__PURE__ */ hic(PackageJsonFetcher, {
      isFetching: isFetching.value,
      result: result.value,
      onClickFetch: doFetch
    }));
  });
})();
