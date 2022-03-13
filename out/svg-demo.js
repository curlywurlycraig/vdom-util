(() => {
  // src/utils/vdom.js
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
  var hiccupToElement = ([tag, ...rest], ns = "http://www.w3.org/1999/xhtml") => {
    const hasAttrs = !Array.isArray(rest[0]) && typeof rest[0] === "object";
    const hic2 = hasAttrs ? [tag, rest[0], ...rest.slice(1)] : [tag, {}, ...rest];
    const result = hiccupToElementWithAttrs(hic2, ns);
    result._hic = hic2;
    return result;
  };
  var hiccupToElementWithAttrs = ([tag, attrs, ...children], ns = "http://www.w3.org/1999/xhtml") => {
    if (tag === "svg" && !attrs.xmlns) {
      console.warn("Using an SVG without a namespace will result in the SVG not displaying correctly.", 'Try adding "xmlns="http://www.w3.org/2000/svg" to the <svg> element.');
    }
    const possiblyOverriddenNs = attrs.xmlns || ns;
    const newEl = document.createElementNS(possiblyOverriddenNs, tag);
    const parsed = updateAttrs(newEl, attrs);
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
        return hiccupToElement(x, possiblyOverriddenNs);
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
  var insert = (hostEl, hic2) => {
    const renderedChild = hostEl.children[0];
    if (!renderedChild || renderedChild._hic === void 0) {
      return reset(hostEl, hic2);
    }
    return update(renderedChild, render(hic2));
  };
  var append = (el, hic2) => {
    const newEl = hiccupToElement(render(hic2));
    el.append(newEl);
    return newEl;
  };
  var hic = (name, options, ...children) => {
    const flattenedChildren = children.reduce((acc, curr) => {
      if (!isHic(curr) && Array.isArray(curr)) {
        return [...acc, ...curr];
      }
      return [...acc, curr];
    }, []);
    return [name, options || {}, ...flattenedChildren];
  };

  // src/utils/style.js
  var style = (obj) => Object.entries(obj).reduce((acc, [k, v]) => `${acc}; ${k}: ${v}; `, "");

  // src/utils/atom.js
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
  var dep = (deps, func) => {
    const runFunc = () => func(deps);
    Object.values(deps).forEach((dep2) => dep2.addTrigger(runFunc));
    runFunc();
  };

  // src/svg-demo.jsx
  var Svg = ({ children, ...props }) => /* @__PURE__ */ hic("svg", {
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    ...props
  }, children);
  var MySvg = ({ width, height, r }) => /* @__PURE__ */ hic(Svg, {
    width,
    height
  }, /* @__PURE__ */ hic("rect", {
    width: "100%",
    height: "100%",
    fill: "transparent",
    stroke: "#ddf"
  }), /* @__PURE__ */ hic("circle", {
    cx: "150",
    cy: "100",
    r,
    fill: "transparent",
    stroke: "#ddf"
  }), /* @__PURE__ */ hic("text", {
    x: "150",
    y: height / 2 + r / 3,
    "font-size": r * 0.8,
    "text-anchor": "middle",
    stroke: "#ddf",
    fill: "transparent"
  }, "SVG"));
  var Example1 = ({ circleRadius, setCircleRadius }) => /* @__PURE__ */ hic("div", {
    style: style({
      display: "flex",
      "flex-direction": "column"
    })
  }, /* @__PURE__ */ hic(MySvg, {
    width: 300,
    height: 200,
    r: circleRadius
  }), /* @__PURE__ */ hic("input", {
    style: style({
      "max-width": "300px"
    }),
    type: "range",
    min: "10",
    max: "80",
    value: circleRadius,
    input: (e) => setCircleRadius(e.target.value)
  }));
  var example1Container = document.getElementById("example-1-contents");
  dep({
    circleRadius: atom(80)
  }, ({ circleRadius }) => {
    insert(example1Container, /* @__PURE__ */ hic(Example1, {
      circleRadius: circleRadius.value,
      setCircleRadius: circleRadius.set
    }));
  });
  var Example2 = () => /* @__PURE__ */ hic(Svg, {
    viewBox: "0 0 1 1",
    width: "200",
    height: "200"
  }, /* @__PURE__ */ hic("rect", {
    x: "0.1",
    width: "0.8",
    height: "0.8",
    y: "0.1",
    fill: "#aa85"
  }), /* @__PURE__ */ hic("rect", {
    x: "0.15",
    width: "0.8",
    height: "0.8",
    y: "0.15",
    fill: "none",
    stroke: "#aa8",
    "stroke-width": "0.01",
    "stroke-dasharray": "0.05,0.05"
  }));
  insert(document.getElementById("example-2-contents"), /* @__PURE__ */ hic(Example2, null));
  var Example3 = () => /* @__PURE__ */ hic(Svg, {
    viewBox: "0 0 1 1",
    width: "200",
    height: "200"
  }, /* @__PURE__ */ hic("defs", null, /* @__PURE__ */ hic("pattern", {
    id: "diamond",
    viewBox: "0 0 10 10",
    width: "0.05em",
    height: "0.05em"
  }, /* @__PURE__ */ hic("polygon", {
    points: "5,1 9,5 5,9 1,5",
    fill: "#88aa"
  }))), /* @__PURE__ */ hic("rect", {
    x: "0",
    width: "1",
    height: "1",
    y: "0",
    fill: "url(#diamond)",
    stroke: "#aa8",
    "stroke-width": "0.01"
  }));
  insert(document.getElementById("example-3-contents"), /* @__PURE__ */ hic(Example3, null));
  var Example4 = () => /* @__PURE__ */ hic(Svg, {
    viewBox: "0 0 1 1",
    width: "200",
    height: "200",
    style: "margin-right: 10px"
  }, /* @__PURE__ */ hic("defs", null, /* @__PURE__ */ hic("pattern", {
    id: "hatch",
    viewBox: "0 0 1 1",
    width: "10%",
    height: "10%"
  }, /* @__PURE__ */ hic("path", {
    d: "M0,1 L1,0",
    stroke: "#aa8",
    fill: "none",
    "stroke-width": "0.02"
  }))), /* @__PURE__ */ hic("path", {
    d: "M0.1,0.1 A 0.8 0.8 0 0 1 0.9 0.9",
    stroke: "#aa8",
    fill: "url(#hatch)",
    "stroke-width": "0.01"
  }));
  var Example4B = () => /* @__PURE__ */ hic(Svg, {
    viewBox: "0 0 1 1",
    width: "200",
    height: "200",
    style: "margin-right: 10px"
  }, /* @__PURE__ */ hic("defs", null, /* @__PURE__ */ hic("pattern", {
    id: "hatch",
    viewBox: "0 0 1 1",
    width: "10%",
    height: "10%"
  }, /* @__PURE__ */ hic("path", {
    d: "M0,1 L1,0 M-0.5,0.5 L0.5,-0.5 M0.5,1.5 L1.5,0.5",
    stroke: "#aa8",
    fill: "none",
    "stroke-width": "0.02"
  }))), /* @__PURE__ */ hic("path", {
    d: "M0.1,0.2 A 0.8 0.8 0 0 1 0.9 0.2 L0.5,0.9 z",
    stroke: "#aa8",
    fill: "url(#hatch)",
    "stroke-width": "0.01"
  }));
  append(document.getElementById("example-4-contents"), /* @__PURE__ */ hic(Example4, null));
  append(document.getElementById("example-4-contents"), /* @__PURE__ */ hic(Example4B, null));
  var Example5 = () => /* @__PURE__ */ hic(Svg, {
    viewBox: "0 0 5 1",
    width: "800",
    height: "200"
  }, /* @__PURE__ */ hic("defs", null, /* @__PURE__ */ hic("pattern", {
    id: "hover-hatch",
    viewBox: "0 0 1 1",
    width: "10%",
    height: "10%"
  }, /* @__PURE__ */ hic("path", {
    d: "M0,1 L1,0 M-0.5,0.5 L0.5,-0.5 M0.5,1.5 L1.5,0.5",
    stroke: "#88a",
    fill: "none",
    "stroke-width": "0.2"
  }))), /* @__PURE__ */ hic("circle", {
    id: "hoverable-circle",
    cx: "0.5",
    cy: "0.5",
    r: "0.4",
    stroke: "#aa8",
    fill: "url(#hatch)",
    "stroke-width": "0.01",
    mouseover: () => console.log("hovered circle")
  }), /* @__PURE__ */ hic("circle", {
    id: "other-hoverable-circle",
    cx: "1",
    cy: "0.6",
    r: "0.3",
    stroke: "#aa8",
    fill: "#aa8a",
    "stroke-width": "0.01",
    mouseover: () => console.log("hovered other circle")
  }));
  insert(document.getElementById("example-5-contents"), /* @__PURE__ */ hic(Example5, null));
  var myData = [0, 12, 0.9, 3.5];
  var Example6 = ({ data }) => {
    const maxData = Math.max(...data);
    return /* @__PURE__ */ hic(Svg, {
      viewBox: "0 0 1 1"
    }, /* @__PURE__ */ hic("defs", null, /* @__PURE__ */ hic("pattern", {
      id: "hatchy",
      viewBox: "0 0 1 1",
      width: "10%",
      height: "10%"
    }, /* @__PURE__ */ hic("path", {
      d: "M0,1 L1,0 M-0.5,0.5 L0.5,-0.5 M0.5,1.5 L1.5,0.5",
      stroke: "#88a",
      fill: "none",
      "stroke-width": "0.8"
    }))), data.map((datum, idx) => /* @__PURE__ */ hic("rect", {
      x: idx / data.length,
      y: 1 - datum / maxData,
      width: "0.1",
      height: datum / maxData,
      stroke: "#aa8",
      "stroke-width": "0.001",
      fill: "url(#hatchy)"
    })));
  };
  dep({ data: atom(myData) }, ({ data }) => {
    const randomizeData = () => {
      data.set(new Array(4).fill(null).map(() => Math.random() * 15));
    };
    const el = /* @__PURE__ */ hic("div", null, /* @__PURE__ */ hic(Example6, {
      data: data.value
    }), /* @__PURE__ */ hic("button", {
      click: randomizeData
    }, "Random data"));
    insert(document.getElementById("example-6-contents"), el);
  });
})();
