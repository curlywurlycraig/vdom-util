/**
   Makes a style string from an object
*/
export const style = (obj) =>
      Object.entries(obj).reduce((acc, [k, v]) => `${acc}; ${k}: ${v}; `, '')

