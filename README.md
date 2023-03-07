Apply patches to DOM elements with JSX, using a small set of utilities that is
somewhere in between React and jQuery.

This approach leans on the "Higher Order Component" (HOC) pattern that used to be
popular in the React community, and manages to stay extremely small (a fraction
of even Preact). Such a tool requires a bit more forethought, but I find that
the result is surprisingly nice to work with.

It is also a good teaching tool, as it provides a kind of archetypal virtual DOM.

Additionally, a couple of helper HOCs are provided to make writing new applications straight forward.

See the `demo.jsx` file for example usage.

# Building

`npm run build-min`

# Running

Serve this directory and navigate to `/index.html`

# Tests

Tests are executed in browser at `/test.html` after running `npm run build-test`

# TODO

Add tests:
- [ ] key doesn't change when apply(render) happens once at top level, then again from state change
- [ ] Text editor when adding a basic function then inserting newlines before
this seems to not update the children of the `code` element correctly
- [ ] If you conditionally render different stateful components that have the same expanded child
weird things happen (because ref isn't called again, basically. I have fixed this in another project, just need to fix here too and add a test case)
- [ ] Improve the testing tool to have a better feedback loop
- [ ] Think of more tests to evaluate the awkward cases
E.g. array of mixed text/non-text nodes, array which grows/shrinks in size, passing in a custom key, etc