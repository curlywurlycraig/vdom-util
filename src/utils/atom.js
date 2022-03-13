/**
   A light subscribable wrapper around state.
   
   This is a bit of a swiss army knife. You can use the same data to render multiple components in different parts of the app quite easily, or you can use this as a simple state holder for a single component.
   
   It enables redux-style subscriptions, or the useState react paradigm (implemented as HOC).
*/
export const atom = (initialValue) => {
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
   Simple way to depend on many atoms without dirtying up the global scope.
*/
export const dep = (deps, func) => {
  const runFunc = () => func(deps);
  Object.values(deps).forEach(dep => dep.addTrigger(runFunc));
  runFunc(deps);
};

export const onAny = (deps, func) => {
  const runFunc = () => func(deps);
  deps.forEach(dep => dep.addTrigger(runFunc));
  runFunc(deps);
}
