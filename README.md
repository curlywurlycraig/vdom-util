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

- [ ] Test disabled attribute being false