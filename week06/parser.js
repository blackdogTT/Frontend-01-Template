const { addCssRules, computeCss } = require('./cssParser');

let token = null;
let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;
let stack = [{type: 'document', children:[]}];

function emit(token) {
    let top = stack[stack.length - 1];
    if (token.type === 'startTag') {
        let element = {
            type: 'element',
            parentNode: top,
            children: [],
            attributes: []
        };
        element.tagName = token.tagName;

        for (let p in token) {
            if (p != 'type' && p != 'tagName') {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }
        computeCss(element);
        top.children.push(element);

        if (!token.isSelfClosing) {
            stack.push(element);
        }

        currentTextNode = null;
    } else if (token.type === 'endTag') {
        if (top.tagName != token.tagName) {
            throw new Error('Tag start end dosen’t match!')
        } else {
            if (top.tagName === 'style') {
                addCssRules(currentTextNode.content);
            }
            stack.pop();
        }
        currentTextNode = null;
    } else if (token.type === 'text') {
        if (currentTextNode === null) {
            currentTextNode = {
                type: 'text',
                content: ''
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

const EOF = Symbol(); //EOF: end fo line
const charReg = /^[a-zA-z]$/;
const blankReg = /^[\t\n\f ]$/;
function data(c) {
    if (c == '<') {
        return tagOpen; 
    } else if (c === EOF) {
        return ;
    } else {
        emit({
            type: 'text',
            content: c
        });
        return data;
    }
}

function tagOpen(c) {
    if (c === '/') {
        return endTagOpen;
    } else if (c.match(charReg)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c);
    } else {
        emit({
            type: 'text',
            content: c
        })
        return
    }
}
function tagName(c) {
    if (c.match(blankReg)) {
        return beforeAttributeName;
    } else if (c === '/') {
        return slefClosingStartTag
    } else if (c.match(charReg)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === '>') {
        emit(currentToken);
        return data;
    } 
    currentToken.tagName += c;
    return tagName;
}
function beforeAttributeName(c) {
    if (c.match(blankReg)) {
        return beforeAttributeName;
    } else if (c === '>' || c === '/' || c === EOF) {
        return afterAttributeName(c);
    } else if (c === '=') {
        
    }
    currentAttribute = {
        name: '',
        value: ''
    }
    return attributeName(c);
}

function attributeName(c) {
    if (c.match(blankReg) || c === '/' || c === '>' || c === EOF) {
        return afterAttributeName(c);
    } else if (c === '=') {
        return beforeAttributeValue;
    } else if (c === '"' || c === "'" || c === "<") {

    } else if (c === '\u0000') {

    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function beforeAttributeValue(c) {
    if (c.match(blankReg) || c === '/' || c === '>' || c === EOF) {
        return beforeAttributeValue;
    } else if (c === '"') {
        return doubleQuotedAttributeValue;
    } else if (c === "'") {
        return singleQuotedAttributeValue;
    } else {
        return unQuotedAttributeValue;
    }
}

function doubleQuotedAttributeValue (c) {
    if (c === '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c === '\u0000') {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue (c) {
    if (c === "'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c === '\u0000') {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}
function afterQuotedAttributeValue (c) {
    if (c.match(blankReg)) {
        return beforeAttributeName;
    } else if (c === "/") {
        return slefClosingStartTag;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function unQuotedAttributeValue (c) {
    if (c.match(blankReg)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if ("/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return slefClosingStartTag
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === '\u0000') {

    } else if (c === EOF) {

    } else {
        currentAttribute.name += c;
        return unQuotedAttributeValue;
    }
}

function slefClosingStartTag(c) {
    if (c === '>') {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    }
}

function endTagOpen(c) {
    if (c.match(charReg)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c);
    } else if (c === '>') {

    } else if (c === EOF) {

    } else {

    }
}

function afterAttributeName(c) {
    if (c.match(blankReg)) {
        return afterAttributeName;
    } else if (c === '/') {
        return slefClosingStartTag;
    } else if (c === '=') {
        return beforeAttributeName;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(c);
    }
}

module.exports.parseHtml = function(html) {
    let state = data;
    for(let c of html) {
        state = state(c)
    }
    state = state(EOF);
    return stack[0];
}