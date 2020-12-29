let width = 640, height = 480, radius = 25;

function initialiseGraph() {
    let nodesList = [
        {label: 0, state: 'unvisited', fixed:false, distance:-1},
        {label: 1, state: 'unvisited', fixed:false, distance:-1},
        {label: 2, state: 'unvisited', fixed:false, distance:-1},
        {label: 'a', state: 'unvisited', fixed:false, distance:-1},
        {label: 'b', state: 'unvisited', fixed:false, distance:-1},
        {label: 3, state: 'unvisited', fixed:false, distance:-1}
    ];

    let edgesList = [
        {source: 0, target: 1, value: 5, inMinSpanningTree: false},
        {source: 1, target: 2, value: 1, inMinSpanningTree: false},
        {source: 0, target: 3, value: 3, inMinSpanningTree: false},
        {source: 3, target: 4, value: 1, inMinSpanningTree: false},
    ];

    let isDirected = false;

    Graph = {
        isDirected: isDirected,
        nodesList: nodesList,
        edgesList: edgesList,
    };
    canDragNodes = true;
    constructGraph(Graph);
}

function constructGraph(Graph) {
    svg = d3.select('body').append('svg');
    svg.attr('width', width)
       .attr('height', height);

    let defs = svg.append('svg:defs');
    defs.append('svg:marker')
        .attr('id', 'black-arrow')
        .attr('markerWidth', '13')
        .attr('markerHeight', '13')
        .attr('refX', '20')
        .attr('refY', '3')
        .attr('orient', 'auto')
        .attr('markerUnits','strokeWidth')
        .attr('stroke-width','13')
        .append('svg:path').attr('d', 'M0,0 L0,6 L9,3 z').attr('fill','black');

    defs.append('svg:marker')
    .attr('id', 'green-arrow')
    .attr('markerWidth', '13')
    .attr('markerHeight', '13')
    .attr('refX', '20')
    .attr('refY', '3')
    .attr('orient', 'auto')
    .attr('markerUnits','strokeWidth')
    .attr('stroke-width','13')
    .append('svg:path').attr('d', 'M0,0 L0,6 L9,3 z').attr('fill','#9acd32');

    let edgeSet = svg.selectAll('.edge')
    .data(Graph.edgesList)
    .enter().append('g');

    edgeSet.append('line')
    .attr('class', function(edge) {
        let edgeState = 'edge ';
        if (Graph.isDirected) {
            if (edge.inMinSpanningTree) {
                edgeState+='min-spanning-tree-directed';
            }
            else {
                edgeState+='directed';
            }
        }
        else if (edge.inMinSpanningTree) {
            edgeState+='min-spanning-tree';
        }
        return edgeState;
    });

    edgeSet.append('text')
    .attr('class', 'edge-text')
    .text(edge => edge.value);

    let edgeLineSet = svg.selectAll('line');
    let edgeTextSet = svg.selectAll('.edge-text');

    let nodeSet = svg.selectAll('.node')
    .data(Graph.nodesList)
    .enter().append('g')
    .attr('class', function(node) {
        let nodeState = 'node ';
        if (node.fixed == true) {
            nodeState+='fixed ';
        }
        nodeState+=node.state;
        return nodeState;
    });

    nodeSet.append('circle')
           .attr('r', radius)
           .attr('cx', 0)
           .attr('cy', 0);
    nodeSet.append('text')
           .attr('dx', -5)
           .attr('dy', 5)
           .text(node => node.label);
    nodeSet.append('text')
           .attr('dx', -5)
           .attr('dy', -30)
           .text(node => node.distance >= 0 ? node.distance : '');

    simulation = d3.forceSimulation()
                        .nodes(Graph.nodesList)
                        .force('charge', d3.forceManyBody().strength(-10))
                        .force('center', d3.forceCenter(width/2, height/2))
                        .force('link', d3.forceLink(Graph.edgesList).distance(150))
                        .force('collision', d3.forceCollide().radius(radius))
                        .on('tick', onTickEvent);
    let drag = d3.drag()
                 .on('drag', onDraggedEvent)
                 .on('end', onDragEndEvent);
    nodeSet.call(drag).on('click', onClickEvent);
    function bindValue(value, minAllowed, maxAllowed) {
        return value < minAllowed ? minAllowed : value > maxAllowed ? maxAllowed : value;
    }
    function onTickEvent() {
        nodeSet.each(function (node) {node.x = bindValue(node.x, radius, width-radius); node.y = bindValue(node.y, radius, height-radius);});
        nodeSet.attr('transform', node => `translate(${node.x}, ${node.y})`);
        nodeSet.each(function (node) {if (node.fixed) {node.fx = node.x; node.fy = node.y;}});
        edgeLineSet.attr('x1', edge => edge.source.x)      
                   .attr('y1', edge => edge.source.y)
                   .attr('x2', edge => edge.target.x)
                   .attr('y2', edge => edge.target.y);
        edgeTextSet.attr('x', edge => (edge.source.x+edge.target.x)/2)
                   .attr('y', edge => edge.source.x<=edge.target.x ? (edge.source.y+edge.target.y)/2-10 : (edge.source.y+edge.target.y)/2+10);
    }
    function onClickEvent(event, element) {
        if (canDragNodes) {
            if (element.fx !== undefined) {
                delete element.fx;
                delete element.fy;
                d3.select(this).classed('fixed', false);
                element.fixed = false;
            }
            else {
                element.fx = element.x;
                element.fy = element.y;
                d3.select(this).classed('fixed', true);
                element.fixed = true;
            }
            simulation.alpha(1).restart();
        }
    }
    function onDraggedEvent(event, element) {
        if (canDragNodes){
            element.fx = bindValue(event.x, radius, width-radius);
            element.fy = bindValue(event.y, radius, height-radius);
            simulation.alpha(1).restart();
        }
    }
    function onDragEndEvent(event, element) {
        if (canDragNodes){
          if (d3.select(this).classed('fixed') == false) {
              delete element.fx;
              delete element.fy;
          }
          simulation.alpha(1).restart();
        }
    }
}

function updateGraph(newGraph) {
    simulation.stop();
    d3.select('svg').remove();
    constructGraph(newGraph);
}

function findNode(Graph, node) {
    for (let index = 0; index<Graph.nodesList.length; index++)
        if (Graph.nodesList[index].label == node.label)
            return index;
    return -1;
}

function addNode(Graph, nodeToAdd) {
    if (findNode(Graph, nodeToAdd) !== -1) {
        throw 'Node already exists';
    }
    else {
        let newGraph = Graph;
        newGraph.nodesList.push(nodeToAdd);
        updateGraph(newGraph);
    }
}

function removeNode(Graph, nodeToRemove) {
    if (findNode(Graph, nodeToRemove) === -1) {
        throw 'Node does not exist';
    }
    else {
        let newGraph = Graph;
        newGraph.edgesList = newGraph.edgesList.filter(edge => (edge.source.label != nodeToRemove.label && edge.target.label != nodeToRemove.label));
        newGraph.nodesList = newGraph.nodesList.filter(node => node.label != nodeToRemove.label);
        updateGraph(newGraph);
    }
}

function toggleDirectedEdges(Graph) {
    Graph.isDirected = !Graph.isDirected;
    if (!Graph.isDirected) {
        uniqueEdges = [];
        for (let i = 0; i<Graph.edgesList.length; i++){
            let unique = true;
            for (let j = i+1; j<Graph.edgesList.length; j++)
                if (Graph.edgesList[i].source == Graph.edgesList[j].target && Graph.edgesList[i].target == Graph.edgesList[j].source)
                    unique = false;
            if (unique)
                uniqueEdges.push(Graph.edgesList[i]);
        }
        Graph.edgesList = uniqueEdges;
    }
    updateGraph(Graph);
}

function findEdge(Graph, edge) {
    for (let index = 0; index<Graph.edgesList.length; index++) {
        if (edge.source == Graph.edgesList[index].source.label && edge.target == Graph.edgesList[index].target.label)
            return index;
        if (!Graph.isDirected && (edge.target == Graph.edgesList[index].source.label && edge.source == Graph.edgesList[index].target.label))
            return index;
    }
    return -1;
}

function addEdge(Graph, edgeToAdd) {
    let sourceNode = {label: edgeToAdd.source}, targetNode = {label: edgeToAdd.target};
    if (isNaN(edgeToAdd.value)) {
        edgeToAdd.value = 0;
    }
    if (sourceNode.label == targetNode.label) {
        throw 'Self loops are not allowed';
    }
    else if (findNode(Graph, sourceNode) === -1 || findNode(Graph, targetNode) === -1) {
        throw 'Both of the nodes need to already exist';
    }
    else {
        if (findEdge(Graph, edgeToAdd) !== -1){
            throw 'Edge already exists';
        }
        edgeToAdd = {source:findNode(Graph, sourceNode), target:findNode(Graph, targetNode), value:edgeToAdd.value};
        Graph.edgesList.push(edgeToAdd);
        updateGraph(Graph);
    }
}

function updateEdge(Graph, updatedEdge) {
    if (isNaN(updatedEdge.value)) {
        updatedEdge.value = 0;
    }
    if (findEdge(Graph, updatedEdge) == -1){
        throw 'Edge does not exist';
    }
    else {
        let index = findEdge(Graph, updatedEdge);
        Graph.edgesList[index].value = updatedEdge.value;
        updateGraph(Graph);
    }
}

function removeEdge(Graph, edgeToRemove) {
    let sourceNode = {label: edgeToRemove.source}, targetNode = {label: edgeToRemove.target};
    if (findEdge(Graph, edgeToRemove) === -1) {
        throw 'Edge does not exist';
    }
    else {
        let newGraph = Graph;
        newGraph.edgesList = newGraph.edgesList.filter(edge => (edge.source.label != sourceNode.label || edge.target.label != targetNode.label));
        if (!Graph.isDirected)
            newGraph.edgesList = newGraph.edgesList.filter(edge => (edge.target.label != sourceNode.label || edge.source.label != targetNode.label));
        updateGraph(newGraph);
    }
}

function setNodeState(Graph, node, state) {
    if (findNode(Graph, node) === -1) {
        throw 'Node does not exist';
    }
    else {
        let index = findNode(Graph, node);
        Graph.nodesList[index].state = state;
        updateGraph(Graph);
    }
}

function clearNodeStates(Graph) {
    for (let index = 0; index<Graph.nodesList.length; index++) {
        setNodeState(Graph, Graph.nodesList[index], 'unvisited');
    }
}

function setNodeDistance(Graph, node, distance) {
    if (!findNode(Graph, node) === -1) {
        throw 'Node does not exist';
    }
    else {
        let index = findNode(Graph, node);
        Graph.nodesList[index].distance = distance;
        updateGraph(Graph);
    }
}

function clearNodeDistances(Graph) {
    for (let index = 0; index<Graph.nodesList.length; index++) {
        setNodeDistance(Graph, Graph.nodesList[index], -1);
    }
}

function setEdgeState(Graph, edge, isInMinSpanningTree) {
    if (findEdge(Graph, edge) === -1) {
        throw 'Edge does not exist';
    }
    else {
        let index = findEdge(Graph, edge);
        Graph.edgesList[index].inMinSpanningTree = isInMinSpanningTree;
        updateGraph(Graph);
    }
}

function clearEdgeStates(Graph) {
    for (let index = 0; index<Graph.edgesList.length; index++) {
        setEdgeState(Graph, {source:Graph.edgesList[index].source.label, target:Graph.edgesList[index].target.label}, false);
    }
}

function clearGraphState(Graph) {
    clearEdgeStates(Graph);
    clearNodeStates(Graph);
    clearNodeDistances(Graph);
}

function getAdjacencyList(Graph) {
    let adjacencyList = [];
    for (let index = 0; index<Graph.nodesList.length; index++) {
        adjacencyList.push([]);
    }
    for (let index = 0; index<Graph.edgesList.length; index++) {
        adjacencyList[Graph.edgesList[index].source.index].push([Graph.edgesList[index].target.index, Graph.edgesList[index].value]);
        if (!Graph.isDirected) {
            adjacencyList[Graph.edgesList[index].target.index].push([Graph.edgesList[index].source.index, Graph.edgesList[index].value]);
        }
    }

    return adjacencyList;
}
let paused = false;
const timer = ms => new Promise(res => setTimeout(res, ms));
async function dfs(Graph, rootNodeLabel) {
    let rootNode = {label: rootNodeLabel};
    if (findNode(Graph, rootNode) === -1) {
        throw 'Node does not exist';
    }
    let adjacencyList = getAdjacencyList(Graph), rootNodeIndex = findNode(Graph, rootNode);
    await unpauser();
    await timer(500);
    setNodeState(Graph, rootNode, 'processing');
    for (let index = 0; index<adjacencyList[rootNodeIndex].length; index++) {
        let nextNode = Graph.nodesList[adjacencyList[rootNodeIndex][index][0]];
        if (nextNode.state == 'unvisited') {
            await dfs(Graph, nextNode.label);
        }
    }
    await unpauser();
    await timer(500);
    setNodeState(Graph, rootNode, 'processed');
}

async function bfs(Graph, rootNodeLabel) {
    let rootNode = {label: rootNodeLabel};
    if (findNode(Graph, rootNode) === -1) {
        throw 'Node does not exist';
    }
    let adjacencyList = getAdjacencyList(Graph), rootNodeIndex = findNode(Graph, rootNode);
    let queue = [];
    queue.push(Graph.nodesList[rootNodeIndex]);
    await unpauser();
    await timer(500);
    setNodeState(Graph, Graph.nodesList[rootNodeIndex], 'processing');
    while (queue.length > 0) {
        let currentNode = queue[0];
        queue.shift();
        for (let index = 0; index<adjacencyList[currentNode.index].length; index++) {
            let nextNode = Graph.nodesList[adjacencyList[currentNode.index][index][0]];
            if (nextNode.state == 'unvisited') {
                queue.push(nextNode);
                await unpauser();
                await timer(500);
                setNodeState(Graph, nextNode, 'processing');
            }
        }
        await unpauser();
        await timer(500);
        setNodeState(Graph, currentNode, 'processed');
    }
}

async function dijkstra(Graph, rootNodeLabel) {
    let rootNode = {label: rootNodeLabel};
    if (findNode(Graph, rootNode) === -1) {
        throw 'Node does not exist';
    }
    let adjacencyList = getAdjacencyList(Graph), rootNodeIndex = findNode(Graph, rootNode);
    for (let index = 0; index<Graph.edgesList.length; index++) 
        if (Graph.edgesList[index].value < 0) {
            throw 'Edge values must be >= 0';
        }
    Graph.nodesList[rootNodeIndex].distance = 0;
    let queue = [];
    queue.push(Graph.nodesList[rootNodeIndex]);
    await unpauser();
    await timer(500);
    setNodeState(Graph, Graph.nodesList[rootNodeIndex], 'processing');
    while (queue.length > 0) {
        let currentNodeIndex = 0;
        for (let index = 1; index<queue.length; index++)
            if (queue[index].distance < queue[currentNodeIndex].distance)
                currentNodeIndex = index;
        let currentNode = queue[currentNodeIndex];
        queue.splice(currentNodeIndex, 1);
        if (currentNode.state == 'processed') {
            continue;
        }
        for (let index = 0; index<adjacencyList[currentNode.index].length; index++) {
            let nextNode = Graph.nodesList[adjacencyList[currentNode.index][index][0]], edgeValue = adjacencyList[currentNode.index][index][1];
            let newDistance = currentNode.distance+edgeValue;
            if (nextNode.distance == -1 || newDistance < nextNode.distance) {
                await unpauser();
                await timer(500);
                nextNode.distance = newDistance;
                setNodeState(Graph, nextNode, 'processing');
                queue.push(nextNode);
            }
        }
        await unpauser();
        await timer(500);
        setNodeState(Graph, currentNode, 'processed');
    }
}

async function kruskal(Graph) {
    let sortedEdges = [];
    for (let index = 0; index<Graph.edgesList.length; index++) {
        sortedEdges.push([Graph.edgesList[index].value, Graph.edgesList[index].source, Graph.edgesList[index].target]);
    }
    sortedEdges.sort(function(edge1, edge2) {
        return edge1[0]-edge2[0];
    });
    let DSU = {
        link: [],
        size: [],
        find: function(node) {
            while (node!=this.link[node])
                node = this.link[node];
            return node;
        },
        unite: function(node1, node2) {
            node1 = this.find(node1);
            node2 = this.find(node2);
            if (this.size[node1] < this.size[node2])
                [node1, node2] = [node2, node1];
            this.size[node1] += this.size[node2];
            this.link[node2] = node1;
        }
    }
    for (let index = 0; index<Graph.nodesList.length; index++) {
        DSU.link.push(index);
        DSU.size.push(1);
    }
    let minSpanningTreeCost = 0;
    for (let index = 0; index<sortedEdges.length; index++) {
        let value = sortedEdges[index][0], sourceNode = sortedEdges[index][1], targetNode = sortedEdges[index][2];
        await unpauser();
        await timer(500);
        setNodeState(Graph, sourceNode, 'processing');
        setNodeState(Graph, targetNode, 'processing');
        if (DSU.find(sourceNode.index) != DSU.find(targetNode.index)) {
            DSU.unite(sourceNode.index, targetNode.index);
            await unpauser();
            await timer(500);
            let currentEdge = {source: sourceNode.label, target: targetNode.label};
            setEdgeState(Graph, currentEdge, true);
            minSpanningTreeCost += value;
        }
        await unpauser();
        await timer(500);
        setNodeState(Graph, sourceNode, 'unvisited');
        setNodeState(Graph, targetNode, 'unvisited');
    }
    for (let index = 0; index<Graph.nodesList.length; index++) {
        setNodeState(Graph, Graph.nodesList[index], 'processed');
    }
    return minSpanningTreeCost;
}

initialiseGraph();
