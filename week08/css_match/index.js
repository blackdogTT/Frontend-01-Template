const CSSselect = require("css-select");
const { JSDOM } = require('jsdom');
const fs = require('fs');
const { adapter } = require('./adapter');

function match(selector, element) {
    return CSSselect.is(element, selector, { adapter: adapter});
};

(function(){
    fs.readFile(`${__dirname}/index.html`, 'utf8', (err, data) => {
        if (err) {
            console.log('err------', err)
            return;
        }
        const dom = new JSDOM(data);
        const document = dom.window.document;
        const element = document.getElementById("id");
        const matched = match("div #id.class", element);
        console.log(matched)
    });
})();