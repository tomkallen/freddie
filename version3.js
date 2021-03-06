const svg = document.getElementById("vis");
const svgNS = svg.namespaceURI;

const branches = {};
const COMMIT_R = 5;
const COMMIT_SPAN = 26;
const BRANCH_SPAN = 12;
const LINE_WIDTH = 4;
const LEFT_OFFSET = 50;
const LIMIT = 200;
let hideClosedBracnhes = true;

closedBranches = branchLog.filter(b => b.closed === true).map(b => b.branch);
let column = 1;
const upperCommit = log[0].rev;

svg.style.height = log.length * COMMIT_SPAN + 100 + "px";
if (hideClosedBracnhes) {
    log = log.filter(n => !closedBranches.includes(n.branch));
}
log.forEach(e => {
    branches[e.branch]
        ? branches[e.branch].push(e)
        : (branches[e.branch] = [e]);
});
log = log.slice(0,LIMIT);
const sorts = log.map(revisionSpread).filter(byUniqueBranch);
svg.style.width = sorts.length * BRANCH_SPAN + LEFT_OFFSET + 100 + "px";

sorts.forEach(createLine);

Object.values(branches).forEach(createForks);
log.forEach(createMerges);

function createMerges(commit) {
    if (commit.parents.length > 1) {
        const parent = findByNodeId(commit.parents[1]);
        const self = findByNodeId(commit.node);
        const color = self.getAttribute("fill");
        connectCommits(parent, self, color);
    }
}

function createForks(branch) {
    const parent = findByNodeId(branch.slice(-1)[0].parents[0]);
    const self = findByNodeId(branch.slice(-1)[0].node);
    connectCommits(parent, self, "green");
}

function connectCommits(parent, self, stroke) {
    if (!parent || !self) return;
    const from = make("line");
    const selfX = +self.getAttribute("cx");
    const selfy = +self.getAttribute("cy");
    const parentX = +parent.getAttribute("cx");
    const parentY = +parent.getAttribute("cy");
    const offset = parentX > selfX ? -COMMIT_R : COMMIT_R;
    config(from, {
        x1: parentX + offset,
        y1: parentY,
        x2: selfX,
        y2: parentY,
        stroke,
        "stroke-width": 1
    });
    const to = make("line");
    config(to, {
        x1: selfX,
        y1: parentY,
        x2: selfX,
        y2: selfy + COMMIT_R,
        stroke,
        "stroke-width": 1
    });
    svg.appendChild(from);
    svg.appendChild(to);

    const arrow = make("polygon");
    config(arrow, {
        points: `${selfX},${selfy + COMMIT_R} ${selfX - 5},${selfy +
            10 +
            COMMIT_R} ${selfX + 5},${selfy + 10 + COMMIT_R}`,
        fill: stroke
    });
    svg.appendChild(arrow);
}

function findByNodeId(commitId) {
    return [...document.querySelectorAll("circle")].find(
        e => e.getAttribute("node") === commitId.slice(0, 6)
    );
}

function byUniqueBranch(b, i) {
    return log.findIndex(e => b.branch === e.branch) === i;
}

function revisionSpread(b) {
    const revs = log
        .filter(commit => commit.branch === b.branch)
        .map(commit => commit.rev);
    const max = upperCommit - Math.max(...revs);
    const min = upperCommit - Math.min(...revs) || upperCommit - LIMIT;
    const top = COMMIT_SPAN + max * COMMIT_SPAN;
    const bottom = COMMIT_SPAN + min * COMMIT_SPAN;
    const branch = b.branch;
    return {
        top,
        bottom,
        branch
    };
}

function createLine(branch, index) {
    const x = LEFT_OFFSET + index * BRANCH_SPAN;
    const color = randomColor();
    if (branch.top !== branch.bottom) {
        const line = make("line");
        config(line, {
            x1: x,
            y1: branch.top,
            x2: x,
            y2: branch.bottom,
            "stroke-width": LINE_WIDTH,
            stroke: color,
            branch: branch.branch
        });
        svg.appendChild(line);
    }
    branches[branch.branch].forEach((commit, i) => {
        const circle = make("circle");
        config(circle, {
            cx: x,
            cy: COMMIT_SPAN + (upperCommit - commit.rev) * COMMIT_SPAN,
            r: COMMIT_R,
            fill: color,
            node: commit.node.slice(0, 6),
            branch: branch.branch,
            stroke: "black",
            "stroke-width": 1
        });
        svg.appendChild(circle);
        if (i === 0) {
            const text = make("text");
            text.innerHTML = branch.branch;
            config(text, {
                x: x + BRANCH_SPAN,
                y: COMMIT_SPAN + (upperCommit - commit.rev) * COMMIT_SPAN,
                "font-size": 12,
                "font-family": "monospace"
            });
            svg.appendChild(text);
        }
        const text = make("text");
        text.innerHTML = commit.rev;
        config(text, {
            x: 2,
            y: COMMIT_SPAN + (upperCommit - commit.rev) * COMMIT_SPAN,
            "font-size": 12,
            "font-family": "monospace"
        });
        svg.appendChild(text);
    });
}

function config(element, props) {
    Object.keys(props).forEach(key =>
        element.setAttributeNS(null, key, props[key])
    );
}

function make(type) {
    return document.createElementNS(svgNS, type);
}

function randomColor() {
    const color = Math.floor(0x1000000 * Math.random()).toString(16);
    return "#" + ("000000" + color).slice(-6);
}
