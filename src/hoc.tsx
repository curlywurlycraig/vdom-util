import { hic, apply, render } from "./vdom.js";

export const withState = (stateShape) => (WrappedComponent) => {
  const stateByKey = {};
  const refsByKey = {};
  const settersByKey = {};

  const insertProps = (key, props) => {
    const result = { ...props };
    Object.keys(stateShape).forEach((k) => {
      result[k] = stateByKey[key][k];
      result["set"+k[0].toUpperCase()+k.slice(1)] = settersByKey[key][k];
    });
    return result;
  }

  return ({ key, ...props}) => {
    const onRef = el => {
      refsByKey[key] = el;
    }

    if (!stateByKey[key]) {
      stateByKey[key] = {};
      settersByKey[key] = {};

      Object.entries(stateShape).map(([k, v]) => {
        stateByKey[key][k] = v;
        settersByKey[key][k] = (newV) => {
          stateByKey[key][k] = newV;
          const newProps = insertProps(key, props);
          apply(
            render(
              <WrappedComponent
                ref={onRef}
                {...newProps} />
            ),
            refsByKey[key]
          );
        }
      });
    }

    const newProps = insertProps(key, props);
    return <WrappedComponent
      ref={onRef}
      {...newProps} />;
  }
}

export const withPropMap = (f) => (WrappedComponent) => {
  return ({ ...props }) => {
    const newProps = f(props);
    return <WrappedComponent {...newProps} {...props} />;
  };
}

export const compose = (...fs) => {
  let result = fs[fs.length-1];
  for (let i = fs.length - 2; i >= 0; i--) {
    result = fs[i](result);
  }
  return result;
}