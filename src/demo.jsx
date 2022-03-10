import { style, atom, hic, apply, replace, elementToHiccup } from "./utils.js";

const mainEl = document.getElementById("main");
const mousepadEl = document.getElementById("mousepad");
const extraEl = document.getElementById("extra");
const counterEditorEl = document.getElementById("editor");

const Outlined = ({ children }) => (
  <div style={style({border: '1px solid #445', padding: '10px'})}>
    { children }
  </div>
);

const counterAtom = atom(0);
const Counter = ({ count, setCount }) => (
  <Outlined>
    <p>count is {count}</p>
    <button click={() => setCount(count + 1)}>increment</button>
  </Outlined>
);


counterAtom.addTrigger((count, setCount) => apply(mainEl, <Counter count={count} setCount={setCount} />));

const ManyDots = ({ count, setCount }) => (
  <p style={style({
       color: count > 15 ? 'red'
         : count > 10 ? 'orange'
         : count > 5  ? 'yellow'
         : 'white'
     })}>
    { new Array(count).fill('.') }
  </p>
);

// Let's add a text box too
const CounterEditor = ({ count, setCount }) => (
  <input input={(e) => setCount(Number(e.target.value))} value={count} />
);

const dep = (deps, func) => {
  const runFunc = () => func(deps);
  Object.values(deps).forEach(dep => dep.addTrigger(runFunc));
  runFunc();
};

dep(
  { count: counterAtom },
  ({ count }) => {
    const setCount = (newCount) => {
      if (!isNaN(newCount)) {
        count.set(newCount);
      }
    }

    apply(counterEditorEl, <CounterEditor count={count.value} setCount={setCount} />);
  });

counterAtom.set(0);

const otherCounterAtom = atom(0);
otherCounterAtom.addTrigger((value) => apply(mainEl, <ManyDots count={value} />));

apply(
  mousepadEl,
  <div>
    <button click={() => otherCounterAtom.set(otherCounterAtom.value + 1)}>+</button>
    <button click={() => otherCounterAtom.set(Math.max(0, otherCounterAtom.value - 1))}>-</button>
  </div>
);

replace(document.getElementById('ellipse'), ({ children }) => <p>This used to be: { children }</p>);

const myThings = [
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

for (var i = 0; i < 1000; i++) {
  myThings.push({ name: `Player_${i}`, age: i });
}

const TableSearch = ({ search, setSearch, items }) => {
  const results = items.filter(thing => thing.name.toLowerCase().includes(search.toLowerCase())
                               || thing.age.toString().includes(search));

  return (
    <div>
      <input placeholder="Search table" input={(e) => setSearch(e.target.value)} value={search} />
      <table style={style({ margin: '10px' })}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>An input</th>
          </tr>
        </thead>
        <tbody>
          { results.map(result => <tr>
                                    <td>{ result.name }</td>
                                    <td>{ result.age }</td>
                                    <td><input /></td>
                                  </tr>)}
        </tbody>
      </table>
    </div>
  );
}

const searchTerm = atom('');
searchTerm.addTrigger((search, setSearch) =>
  apply(document.getElementById('searcher'),
        <TableSearch search={search} setSearch={setSearch} items={myThings} />));

searchTerm.set('');

const PackageJsonFetcher = ({ isFetching, result, onClickFetch }) => (
  <div>
    { isFetching ? 'fetching...' : null }
    { result ? `got ${result}` : null }
    <button click={onClickFetch}>Click to get the author of this package</button>
  </div>
);

dep(
  { isFetching: atom(false),
    result: atom(null) },
  ({ isFetching, result }) => {
    const doFetch = async () => {
      isFetching.set(true);
      const fetchResult = await fetch('package.json');
      const jsonResult = await fetchResult.json();
      isFetching.set(false);
      result.set(jsonResult.author);
    }

    apply(document.getElementById('package-json-fetcher'), <PackageJsonFetcher
                                                             isFetching={isFetching.value}
                                                             result={result.value}
                                                             onClickFetch={doFetch} />);
  });
