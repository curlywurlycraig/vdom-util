The reason you use a virtual dom is because comparing actual dom nodes is a little bit tricky.
Or rather, getting the diff is tricky. There's no Web API to calculate the diff of actual elements.

Using hiccup is not terrible, but there's some awkward stuff (like
determining if some array is a hiccup array or just a list of
children).


`el.setAttribute('value', 10)` does not update the view for some reason. You need to do `el.value = 10` instead
