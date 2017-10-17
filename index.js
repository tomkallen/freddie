const svg = document.getElementById("vis");
const svgNS = svg.namespaceURI;

let shift = 0;
let freeRow = 0;
const branches = {};

const COMMIT_R = 10;
const COMMIT_SPAN = 50;
const BRANCH_SPAN = 50;

log.forEach((node, i) => {
    if (i !== 0 && node.branch === log[i - 1].branch) {
        createCommit(node);
    } else {
        if (!branches[node.branch]) {
            createBranch(node);
        } else {
            createCommit(node);
        }
    }
});

function createCommit(node) {
    const circle = make('circle');
    const lastXPos = branches[node.branch].lastXPos;
    config(circle, {
        "cx": 25 + shift * COMMIT_SPAN,
        "cy": branches[node.branch].row * BRANCH_SPAN,
        "r": COMMIT_R,
        "fill": "#5498df",
        "node": node.node,
        "branch": node.branch
    });
    svg.appendChild(circle);

    const line = make('line');
    config(line, {
        "x1": 25 + shift * COMMIT_SPAN,
        "y1": branches[node.branch].row * BRANCH_SPAN,
        "x2": lastXPos,
        "y2": branches[node.branch].row * BRANCH_SPAN,
        "stroke": "#5498df",
        "stroke-width": "3"
    })
    svg.appendChild(line);
    branches[node.branch].lastXPos = 25 + shift * COMMIT_SPAN;
    shift++;
}

function createBranch(node) {
    freeRow++;
    branches[node.branch] = {row: freeRow};
    const circle = make('circle');
    const x = 25 + shift * COMMIT_SPAN;
    const y = branches[node.branch].row * BRANCH_SPAN;
    config(circle, {
        "cx": x,
        "cy": y,
        "r": COMMIT_R,
        "fill": "#5498df",
        "node": node.node,
        "branch": node.branch
    });
    svg.appendChild(circle);
    branches[node.branch].lastXPos = x;
    branches[node.branch].lastYPos = y;
    shift++;
    if (!node.parent) return
    const path = make('path');
    const p = branches[findParentBranch(node.parent)];
    console.log(p)
    config(path, {"d": `M${p.lastXPos},${p.lastYPos} C${p.lastXPos},${p.lastYPos +20} ${x},${p.lastYPos +20} ${x},${y}`,
    "stroke": "#5498df",
    "stroke-width": "3"
});
    svg.appendChild(path);
}

function config(element, props) {
    Object.keys(props).forEach(key => {
        element.setAttributeNS(null, key, props[key]);
    });
}

function make(type){
    return document.createElementNS(svgNS, type);
}

function findParentBranch(node){
    console.log("looking for " + node)
    const parent = log.find(e=> e.node === node);
    return parent.branch
}
