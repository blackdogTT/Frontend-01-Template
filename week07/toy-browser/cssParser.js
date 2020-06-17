const css = require('css');
const rules = [];

function match(element, selector) {
    if (!selector || !element.attributes) return false;
    const preChar = selector.charAt(0);
    /* 只处理三种，标签选择器、类选择器、id选择器 */
    if (preChar === "#") {
        let idAttr = element.attributes.find(item => item.name === 'id');
        if (idAttr && `#${idAttr.value}` === selector) return true;
    } else if (preChar === '.') {
        /* todo:多class空格分隔 */
        let classAttr = element.attributes.find(item => item.name === 'class');
        if (classAttr && `.${classAttr.value}` === selector) return true;
    } else {

        if (element.tagName === selector) return true;
    }
    return false;
}

function specificity(selector) {
    let p = [0, 0, 0, 0];
    let selectorParts = selector.split(' ');
    for (let part of selectorParts) {
        let preChar = part.charAt(0);
        if (preChar === '#') {
            p[1] += 1;
        } else if (preChar === '.') {
            p[2] += 1;
        } else {
            p[3] +=1;
        }
    }
    return p;
}

function compare(p1, p2) {
    if (p1[0] - p2[0]) {
        return p1[0] - p2[0]
    } else if (p1[1] - p2[1]) {
        return p1[1] - p2[1]
    } else if (p1[2] - p2[2]) {
        return p1[2] - p2[2]
    }
    return p1[3] - p2[3]
}

module.exports = {
    computeCss(element) {
        let parentElements = [];
        let parent = element.parentNode;
        while(parent) {
            parentElements.push(parent);
            parent = parent.parentNode
        }
        // parentElements = parentElements.reverse();
        if (!element.computedStyle) {
            element.computedStyle = {}
        }
        /* 只处理父子选择器 */
        for(let rule of rules) {
            let matched = false;
            let selectorParts = rule.selectors[0].split(" ").reverse();
            if (!match(element, selectorParts[0])) {
                continue;
            }
            let j = 1;
            for(let i = 0; i < parentElements.length; i++) {
                if (match(parentElements[i], selectorParts[j])) {
                    j++;
                }
            }
            if (j >= selectorParts.length) {
                matched = true;
            }
            if (matched) {
                let sp = specificity(rule.selectors[0]);
                /* 匹配成功，给元素加入css规则 */
                let computedStyle = element.computedStyle;
                for (let declaration of rule.declarations) {
                    if (!computedStyle[declaration.property]) {
                        computedStyle[declaration.property] = {}
                    }
                    let curSpecificity = computedStyle[declaration.property].specificity;
                    if (!curSpecificity) {
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;
                    } else if (compare(curSpecificity, sp) < 0) {
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;
                    }
                }
            }
        }
    },
    addCssRules(text) {
        const ast = css.parse(text);
        rules.push(...ast.stylesheet.rules)
    }
}