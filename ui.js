let toggleDirectedCheckbox = document.getElementById('toggle-directed');
toggleDirectedCheckbox.checked = false;
toggleDirectedCheckbox.addEventListener('click', function(){
    toggleDirectedEdges(Graph);
});

let addNodeLabel = document.getElementById('add-node'), addNodeButton = document.getElementById('add-node-button'), 
    addNodeError = document.getElementById('add-node-error');
addNodeLabel.value = addNodeError.innerHTML = '';
addNodeButton.addEventListener('click', function(){
    let inputNode = {label: addNodeLabel.value};
    clearInput();
    try {
        if (inputNode.label === '')
            throw 'Input cannot be empty';
        addNode(Graph, inputNode);
    } catch (error) {
        addNodeError.innerHTML = error;
    }
});

let removeNodeLabel = document.getElementById('remove-node'), removeNodeButton = document.getElementById('remove-node-button'), 
    removeNodeError = document.getElementById('remove-node-error');
removeNodeLabel.value = removeNodeError.innerHTML = '';
removeNodeButton.addEventListener('click', function(){
    let inputNode = {label: removeNodeLabel.value};
    clearInput();
    try {
        if (inputNode.label === '')
            throw 'Input cannot be empty';
        removeNode(Graph, inputNode);
    } catch (error) {
        removeNodeError.innerHTML = error;
    }
});

let addEdgeSource = document.getElementById('add-edge-source'), addEdgeTarget = document.getElementById('add-edge-target'), 
    addEdgeValue = document.getElementById('add-edge-value'), addEdgeButton = document.getElementById('add-edge-button'), addEdgeError = document.getElementById('add-edge-error');
addEdgeSource.value = addEdgeTarget.value = addEdgeValue.value = addEdgeError.innerHTML = '';
addEdgeButton.addEventListener('click', function(){
    let inputEdgeSource = addEdgeSource.value, inputEdgeTarget = addEdgeTarget.value, inputEdgeValue = parseInt(addEdgeValue.value);
    let inputEdge = {source: inputEdgeSource, target: inputEdgeTarget, value: inputEdgeValue};
    clearInput();
    try {
        if (inputEdgeSource === '' || inputEdgeTarget === '')
            throw 'Node input cannot be empty';
        addEdge(Graph, inputEdge);
    } catch (error) {
        addEdgeError.innerHTML = error;
    }
});

let updateEdgeSource = document.getElementById('update-edge-source'), updateEdgeTarget = document.getElementById('update-edge-target'), 
    updateEdgeValue = document.getElementById('update-edge-value'), updateEdgeButton = document.getElementById('update-edge-button'), updateEdgeError = document.getElementById('update-edge-error');
updateEdgeSource.value = updateEdgeTarget.value = updateEdgeValue.value = updateEdgeError.innerHTML = '';
updateEdgeButton.addEventListener('click', function(){
    let inputEdgeSource = updateEdgeSource.value, inputEdgeTarget = updateEdgeTarget.value, inputEdgeValue = parseInt(updateEdgeValue.value);
    let inputEdge = {source: inputEdgeSource, target: inputEdgeTarget, value: inputEdgeValue};
    clearInput();
    try {
        updateEdge(Graph, inputEdge);
    } catch (error) {
        updateEdgeError.innerHTML = error;
    }
});

let removeEdgeSource = document.getElementById('remove-edge-source'), removeEdgeTarget = document.getElementById('remove-edge-target'), 
    removeEdgeButton = document.getElementById('remove-edge-button'), removeEdgeError = document.getElementById('remove-edge-error');
removeEdgeSource.value = removeEdgeTarget.value = removeEdgeError.innerHTML = '';
removeEdgeButton.addEventListener('click', function(){
    let inputEdgeSource = removeEdgeSource.value, inputEdgeTarget = removeEdgeTarget.value;
    let inputEdge = {source: inputEdgeSource, target: inputEdgeTarget};
    clearInput();
    try {
        removeEdge(Graph, inputEdge);
    } catch (error) {
        removeEdgeError.innerHTML = error;
    }
});

let removeGraphButton = document.getElementById('remove-graph-button');
removeGraphButton.addEventListener('click', function(){
    Graph.nodesList = [];
    Graph.edgesList = [];
    updateGraph(Graph);
})

let dfsRootNode = document.getElementById('dfs-root'), dfsButton = document.getElementById('dfs-button'), dfsError = document.getElementById('dfs-error');
dfsRootNode.value = dfsError.innerHTML = '';
dfsButton.addEventListener('click', async function(){
    let inputRootNode = dfsRootNode.value;
    clearInput();
    try {
        if (inputRootNode === '')
            throw 'Input cannot be empty';
        disableButtons();
        clearGraphState(Graph);
        canDragNodes = false;
        await dfs(Graph, inputRootNode);
        enableButtons();
        canDragNodes = true;
    } catch (error) {
        dfsError.innerHTML = error;
        enableButtons();
        canDragNodes = true;
    }
});

let bfsRootNode = document.getElementById('bfs-root'), bfsButton = document.getElementById('bfs-button'), bfsError = document.getElementById('bfs-error');
bfsRootNode.value = bfsError.innerHTML = '';
bfsButton.addEventListener('click', async function(){
    let inputRootNode = bfsRootNode.value;
    clearInput();
    try {
        if (inputRootNode === '')
            throw 'Input cannot be empty';
        disableButtons();
        clearGraphState(Graph);
        canDragNodes = false;
        await bfs(Graph, inputRootNode);
        enableButtons();
        canDragNodes = true;
    } catch (error) {
        bfsError.innerHTML = error;
        enableButtons();
        canDragNodes = true;
    }
});

let dijkstraRootNode = document.getElementById('dijkstra-root'), dijkstraButton = document.getElementById('dijkstra-button'),
    dijkstraError = document.getElementById('dijkstra-error');
dijkstraRootNode.value = dijkstraError.innerHTML = '';
dijkstraButton.addEventListener('click', async function(){
    let inputRootNode = dijkstraRootNode.value;
    clearInput();
    try {
        if (inputRootNode === '')
            throw 'Input cannot be empty';
        disableButtons();
        clearGraphState(Graph);
        canDragNodes = false;
        await dijkstra(Graph, inputRootNode);
        enableButtons();
        canDragNodes = true;
    } catch (error) {
        dijkstraError.innerHTML = error;
        enableButtons();
        canDragNodes = true;
    }
});

let kruskalButton = document.getElementById('kruskal-button');
kruskalButton.addEventListener('click', async function(){
    clearInput();
    disableButtons();
    clearGraphState(Graph);
    canDragNodes = false;
    await kruskal(Graph);
    enableButtons();
    canDragNodes = true;
});

let pauseButton = document.getElementById('pause-button'), unpauseButton = document.getElementById('unpause-button');
pauseButton.disabled = unpauseButton.disabled = true;
pauseButton.addEventListener('click', function() {
    paused = true;
    pauseButton.disabled = true;
    unpauseButton.disabled = false;
});
function unpauser() {
    if (paused === false)
        return;
    return new Promise(resolve => unpauseButton.addEventListener('click', function(){
            paused = false;
            pauseButton.disabled = false;
            unpauseButton.disabled = true;
            resolve();
        }));
}

function disableButtons() {
    addNodeButton.disabled = removeNodeButton.disabled = addEdgeButton.disabled = updateEdgeButton.disabled =
    removeEdgeButton.disabled = dfsButton.disabled = bfsButton.disabled = dijkstraButton.disabled = kruskalButton.disabled = unpauseButton.disabled = true;
    pauseButton.disabled = false;
}

function enableButtons() {
    addNodeButton.disabled = removeNodeButton.disabled = addEdgeButton.disabled = updateEdgeButton.disabled =
    removeEdgeButton.disabled = dfsButton.disabled = bfsButton.disabled = dijkstraButton.disabled = kruskalButton.disabled = false;
    pauseButton.disabled = true;
}

function clearInput() {
    addNodeError.innerHTML = removeNodeError.innerHTML = addEdgeError.innerHTML = removeEdgeError.innerHTML =
    updateEdgeError.innerHTML = dfsError.innerHTML = bfsError.innerHTML = dijkstraError.innerHTML = '';
    addNodeLabel.value = removeNodeLabel.value = addEdgeSource.value = addEdgeTarget.value = addEdgeValue.value =
    updateEdgeSource.value = updateEdgeTarget.value = updateEdgeValue.value = removeEdgeSource.value = removeEdgeTarget.value = 
    dfsRootNode.value = bfsRootNode.value = dijkstraRootNode.value = ''; 
}

window.addEventListener('resize', function() {
    let newWidth = window.innerWidth;
    if (newWidth < 640){
        width = 300;
        updateGraph(Graph);
    }
    else if (width === 300){
        width = 640;
        updateGraph(Graph);
    }
})
