import { style, atom, hic, apply, replace, elementToHiccup, hiccupToElement } from "./utils.js";

const qsa = (...args) => document.querySelectorAll(...args);
const qs = (...args) => document.querySelector(...args);
const byId = (...args) => document.findElementById(...args);

const svgEl = <svg version="1.1"
                   width="300" height="200"
                   xmlns="http://www.w3.org/2000/svg">

                <rect width="100%" height="100%" fill="red" />

                <circle cx="150" cy="100" r="80" fill="green" />

                <text x="150" y="125" font-size="60" text-anchor="middle" fill="transparent" stroke="white">SVG</text>

              </svg>;


const newEl = hiccupToElement(<div />);
document.querySelector('main').append(newEl);
apply(newEl, svgEl);

