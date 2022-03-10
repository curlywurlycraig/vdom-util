# Resources

https://developer.mozilla.org/en-US/docs/Web/API/Node/

# TODO

- [ ] Find a way to get rid of the logic that hiccupToElement needs
Basically refactor `hiccupToElement` and `apply` so that there's less duplication
- [ ] Write tests
- [ ] Handle deletion of attrs in updateAttrs
- [ ] Try out some more complex use cases
- [ ] Make middleware for atoms? Think of cool uses
- [ ] Make middleware for all atoms?
Would be nice to have some debugger that lets you fiddle with the atom state and watch the updates
- [ ] Make some kind of "find()" that is like jquery's $
- [ ] Think of ways to make this like a 21st century jquery
That is, find, apply, and also once things are rendered, how to get refs?
- [ ] Given some hiccup, make it possible to query the hiccup.

So that I could do:

```js
find('#someDiv').replace(({ children }) => <MyComponent />);
```

Or something.


Some progressive enhancement use cases to consider:

1. I want to replace all `p` elements in some div with one that is ellipse + hover
2. I want to make a table sortable
3. I want to replace an SVG with an interactive alternative

## SVG Editor

Great idea for a project using this tool!

You already know what the UI will be like. Throwback to utilitiarian interfaces.

Add arrows, boxes, text, patterns, etc to SVG.

Have the editor be available in a side pane

- [ ] Make string <-> hiccup conversion utils
String -> hiccup might be really hard actually. Requires writing an XML parser basically
I could get around this by not making the text directly editable

- [ ] Make a syntax highlighter using hiccup

