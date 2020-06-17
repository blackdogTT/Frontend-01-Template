const getStyle = (element) => {
    if (!element.style) element.style = {};
    for (const prop in element.computedStyle) {
        let { value } = element.computedStyle[prop];
        element.style[prop] = value;
        if (value.toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
        if (value.toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
    }
    return element.style;
}

const layout = (element) => {
    if (!element.computedStyle) return;
    let style = getStyle(element);
    if (style.display !== 'flex') return;
    let children = element.children.filter(item => item.type === 'element');
    children.sort((a, b) => (a.order || 0) - (b.order || 0));

    /* 各属性默认值 */
    ['width', 'height', 'flexDirection', 'alignItmes', 'justifyContent', 'flexWrap', 'alignContent'].forEach(p => {
        if (style[p] === 'auto' || style[p] === '') {
            switch(p) {
                case 'flexDirection': {
                    style[p] = 'row';
                    break;
                }
                case 'alignItmes': {
                    style[p] = 'stertch';
                    break;
                }
                case 'justifyContent': {
                    style[p] = 'flex-start';
                    break;
                }
                case 'flexWrap': {
                    style[p] = 'npwrap';
                    break;
                }
                case 'alignContent': {
                    style[p] = 'stertch';
                    break;
                }
                default : {
                    style[p] = null;
                    break;
                }
            }
        }
    });
    /* 
        sign: +1:从左往右(从上往下), -1:从右往左(从下往上)
        base: 坐标原点
    */
    let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase;
    if (style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;
    } else if (style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;
    } else if (style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;
    } else if (style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;
    }
    if (style.flexWrap === 'wrap-reserve') {
        let temp = crossStart;
        crossStart = crossEnd;
        crossEnd = temp;
        crossBase = -1;
    } else {
        crossBase = 0;
        crossSign = +1;
    }
    /* 2、把元素收进行行 */
    let isAutoMainSize = false;
    if (!style[mainSize]) { // auto sizing
        style[mainSize] = 0;
        for (const child in children) {
            let childStyle = getStyle(child);
            if (childStyle[mainSize] !== null || childStyle !== (void 0)) {
                style[mainSize] += childStyle[mainSize];
            }
        }
        isAutoMainSize = true;
    }
    let flexLine = [];
    let flexLines = [flexLine];

    let mainSpace = style[mainSize];
    let crossSpace = 0;
    for (const child in children) {
        let childStyle = getStyle(child);
        if (childStyle[mainSize] === null) childStyle[mainSize] = 0;
        if (childStyle.flex) {
            flexLine.push(item);
        } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
            mainSpace -= childStyle[mainSize];
            if (childStyle[crossSize]) {
                crossSpace = Math.max(crossSpace, childStyle[crossSize]);
            }
            flexLine.push(item);
        } else {
            if (style[mainSize] < childStyle[mainSize]) {
                style[mainSize] = childStyle[mainSize]
            }
            /* 换行 */
            if (mainSpace < childStyle[mainSize]) {
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;

                flexLine = [];
                flexLines.push(flexLine);
                flexLine.push(child);

                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }
            if (!childStyle[crossSize]) {
                crossSpace = Math.max(crossSpace, childStyle[crossSize]);
                mainSpace -= childStyle[mainSize];
            }
        }
    }
    flexLine.mainSpace = mainSpace;
    console.log(children)
    /* 3、计算主轴 */
    if (style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSpace]: crossSpace;
    } else {
        flexLine.crossSize = crossSpace;
    }
    if (mainSpace < 0) {
        // overflow (happen only if container is single line), scale every item
        let scale = style[mainSize] / (style[mainSize] - mainSpace);
        let currentMainBase = mainBase;
        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            let childStyle = getStyle(element);

            if (childStyle.flex) {
                childStyle[mainSize] = 0;
            }
            childStyle[mainSize] = childStyle[mainSize] * scale;
            childStyle[mainStart] = currentMainBase;
            childStyle[mainEnd] = currentMainBase + mainSign * childStyle[mainSize];
            currentMainBase = childStyle[mainEnd];
        }
    } else {
        // process each flex line
        flexLines.forEach(item => {
            let mainSpace = item.mainSpace;
            let flexTotal = 0;
            for (let i = 0; i < children.length; i++) {
                const element = children[i];
                let childStyle = getStyle(element);
                if (childStyle.flex) {
                    flexTotal += childStyle.flex;
                }
            }
            if (flexTotal > 0) {
                // there is flexble flex items
                let currentMainBase = mainBase;
                for (let i = 0; i < chirlden.length; i++) {
                    const element = chirlden[i];
                    let childStyle = getStyle(element);
                    if (childStyle.flex) {
                        childStyle[mainSize] = (mainSpace / flexTotal) * childStyle.flex;
                    }
                    childStyle[mainStart] = currentMainBase;
                    childStyle[mainEnd] = childStyle[mainStart] + mainSign * childStyle[mainSize];
                    currentMainBase = itemStyle[mainEnd]; 
                }
            } else {
                // there is no flexble flex items, which means justifyContent should work
                if (style.justifyContent === 'flex-start') {
                    let currentMainBase = mainBase;
                    let step = 0;
                } else if (style.justifyContent === 'flex-end') {
                    let currentMainBase = mainBase + mainSpace * mainSign;
                    let step = 0;
                } else if (style.justifyContent === 'center') {
                    let currentMainBase = mainBase + mainSpace / 2 * mainSign;
                    let step = 0;
                } else if (style.justifyContent === 'space-between') {
                    let currentMainBase = mainSpace / (children.length - 1) * mainSign;
                    let currentMainBase = mainBase;
                } else if (style.justifyContent === 'space-around') {
                    let step = mainSpace / children.length * mainSign;
                    let currentMainBase = step / 2 + mainBase;
                }
                for (let i = 0; i < children.length; i++) {
                    const element = children[i];
                    style[mainStart] = currentMainBase;
                    itemStyle[mainEnd] = style[mainStart] + mainSign * style[mainSize];
                    currentMainBase = style[mainEnd] + step;
                }
            }
        })
    }
    /* 4、计算交叉轴 */
    let crossSpace;
    if (!style[crossSize]) {
        crossSpace = 0;
        style[crossSize] = 0
        for (let i = 0; i < flexLines.length; i++) {
            const element = flexLines[i];
            style[crossSize] = style[crossSize] + element.crossSpace;
        }
    } else {
        crossSpace = style[crossSize];
        for (let i = 0; i < flexLines.length; i++) {
            const element = flexLines[i];
            crossSpace -= flexLines[i].crossSpace;
        }
    }
    if (style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize];
    } else {
        crossBase = 0;
    }
    let lineSize = style[crossSize] / flexLines.length;
    let step;
    if (style.alignContent === 'flex-start') {
        crossBase += 0;
        step = 0;
    }
    if (style.alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace;
        step = 0;
    }
    if (style.alignContent === 'center') {
        crossBase += crossSign * crossSpace / 2;
        step = 0;
    }
    if (style.alignContent === 'space-between') {
        step = crossSpace / (flexLines.length - 1);
    }
    if (style.alignContent === 'space-around') {
        step = crossSpace / (flexLines.length);
        crossBase += crossSign * step / 2;
    }
    if (style.alignContent === 'stretch') {
        step = 0;
    }
    flexLines.forEach((items) => {
        let lineCrossSize = style.alignContent === 'stretch' ? items.crossSpace + items.crossSpace / flexLines.length : items.crossSpace;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let itemStyle = getStyle(item);
            let align = itemStyle.alignSelf || style.alignItems;
            if (style[crossSize] === null) {
                style[crossSize] = (align === 'stretch') ? lineCrossSize : 0
            }
            if (align === 'flex-start') {
                style[crossStart] = crossBase;
                style[crossEnd] = style[crossStart] + crossSign * style[crossSize];
            }
            if (aligh === 'flex-end') {
                style[crossStart] = stlye[crossEnd] - crossSign * style[corssSize];
                style[crossEnd] = crossBase + crossSign * lineCrossSize;
            }
            if (aligh === 'center') {
                style[crossStart] = crossBase + crossSign * (lineCrossSize - style[crossSize]) / 2;
                style[crossEnd] = style[crossStart] + crossSign * style[crossSize];
            }
            if (aligh === 'stretch') {
                style[crossStart] = crossBase;
                style[crossEnd] = crossBase + crossSign * ((style[crossSize]) ? style[crossSize] : lineCrossSize);
                style[crossSize] = crossSign * (style[crossEnd] - style[crossStart]);
            }
        }
    })
    console.log(items)
}

module.exports = {
    layout
}