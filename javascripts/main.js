import React from 'react';
import ReactDOM from 'react-dom';
import Root from './components/root';


document.addEventListener("DOMContentLoaded", () => {
    let root = document.getElementById("main");
    ReactDOM.render(<Root />, root);
});