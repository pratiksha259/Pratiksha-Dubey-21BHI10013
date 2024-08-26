const ws = new WebSocket('ws://localhost:5500');
let gameState;

ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log(data);

    if (data.type === 'INIT') {
        gameState = data.state;
        renderBoard();
    } else if (data.type === 'UPDATE') {
        gameState = data.state;
        renderBoard();
    } else if (data.type === 'WIN') {
        // Show the popup with the winner message
        alert(data.message);

        // Optionally, offer the player to reset the game
        const playAgain = confirm("Do you want to start a new game?");
        if (playAgain) {
            ws.send(JSON.stringify({ type: 'RESET' }));
        }
    }
};

function renderBoard() {
    // Render the board using gameState data (this should already be in your code)
    // Clear the board and place the pieces according to gameState.pieces
    const board = document.getElementById('board');
    board.innerHTML = ''; // Clear the board

    for (const [piece, position] of Object.entries(gameState.pieces)) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('piece', piece);
        pieceElement.style.top = `${position[0] * 100}px`;
        pieceElement.style.left = `${position[1] * 100}px`;
        board.appendChild(pieceElement);
    }
}

document.getElementById('reset-button').addEventListener('click', function () {
    ws.send(JSON.stringify({ type: 'RESET' }));
});