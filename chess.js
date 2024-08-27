document.addEventListener('DOMContentLoaded', function () {
    const board = document.querySelector('.container');
    const boxes = Array.from(document.querySelectorAll('.box'));
    let selectedBox = null;
    let turn = 'A'; 
    let movementHistory = [];  // Initialize the movement history array

    const ws = new WebSocket('ws://localhost:5500');

    ws.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'INIT':
                initializeBoard(data.state);
                break;
            case 'UPDATE':
                updateBoard(data.state);
                break;
            case 'WIN':
                displayWinMessage(data.message);
                break;
        }
    });

    function initializeBoard(state) {
        boxes.forEach(box => {
            box.textContent = '';
            box.removeAttribute('data-piece');
        });
        for (const piece in state.pieces) {
            const [row, col] = state.pieces[piece];
            const index = row * 5 + col;
            boxes[index].textContent = piece;
            boxes[index].setAttribute('data-piece', piece);
        }
        document.querySelector('.turn-indicator').textContent = `Player ${state.turn}'s Turn`;
    }

    function updateBoard(state) {
        initializeBoard(state);
        updateHistory(state.history || []);
    }

    function updateHistory(history) {
        const historyList = document.querySelector('.history-list');
        historyList.innerHTML = '';
        history.forEach(move => {
            const listItem = document.createElement('li');
            listItem.textContent = move;
            historyList.appendChild(listItem);
        });
    }

    function isValidMove(fromIndex, toIndex, piece) {
        const pieceType = piece.split('-')[1];
        const fromRow = Math.floor(fromIndex / 5);
        const fromCol = fromIndex % 5;
        const toRow = Math.floor(toIndex / 5);
        const toCol = toIndex % 5;
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if (toRow === fromRow) return false; // Can't move onto own starting line

        switch (pieceType) {
            case 'P1':
            case 'P2':
            case 'P3':
                return (rowDiff === 1 && colDiff <= 1) || (rowDiff <= 1 && colDiff === 1); // Pawn moves
            case 'H1':
                return (rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2); // Hero1 moves
            case 'H2':
                return (rowDiff === 2 && colDiff === 2); // Hero2 moves
            default:
                return false;
        }
    }

    function clearHighlights() {
        boxes.forEach(box => box.classList.remove('highlight'));
    }

    function highlightValidMoves(piece) {
        const index = boxes.indexOf(selectedBox);
        boxes.forEach((box, i) => {
            if (isValidMove(index, i, piece) && isMoveAllowed(index, i)) {
                box.classList.add('highlight');
            }
        });
    }

    function isMoveAllowed(fromIndex, toIndex) {
        const fromPiece = boxes[fromIndex].getAttribute('data-piece');
        const toPiece = boxes[toIndex].getAttribute('data-piece');

        if (!toPiece) return true; // Empty box

        const toPieceTeam = toPiece[0];
        const fromPieceTeam = fromPiece[0];

        return toPieceTeam !== fromPieceTeam; // Can't move to a box with own team piece
    }

    function movePiece(fromBox, toBox) {
        const fromPiece = fromBox.getAttribute('data-piece');
        const toPiece = toBox.getAttribute('data-piece');
        const fromPosition = fromBox.getAttribute('data-pos');
        const toPosition = toBox.getAttribute('data-pos');
        let captured = false;

        if (toPiece) {
            captured = true; // A piece was captured
        }

        toBox.textContent = fromBox.textContent;
        toBox.setAttribute('data-piece', fromPiece);
        fromBox.textContent = '';
        fromBox.removeAttribute('data-piece');

        // Update the movement history
        const moveDescription = `Player ${turn} moved its ${fromPiece}`;
        movementHistory.push(moveDescription);  // Append the new move to the history
        updateHistory(movementHistory);         // Update the history list in the UI

        switchTurn();
        checkWin();
    }

    function switchTurn() {
        turn = (turn === 'A') ? 'B' : 'A';
        document.querySelector('.turn-indicator').textContent = `Player ${turn}'s Turn`;
    }

    function displayWinMessage(message) {
        // Create the popup div
        const popup = document.createElement('div');
        popup.className = 'win-popup';

        // Create the message element
        const winMessage = document.createElement('p');
        winMessage.textContent = message;

        // Create the restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Game';

        // Append message and button to the popup
        popup.appendChild(winMessage);
        popup.appendChild(restartButton);

        // Append the popup to the body
        document.body.appendChild(popup);

        // Add an event listener to the restart button
        restartButton.addEventListener('click', function () {
            // Remove the popup
            document.body.removeChild(popup);

            // Send a reset message to the server to restart the game
            ws.send(JSON.stringify({ type: 'RESET' }));
        });
    }

    function checkWin() {
        // Logic to determine if the game has been won
        const playerAPieces = boxes.some(box => box.getAttribute('data-piece') && box.getAttribute('data-piece').startsWith('A-'));
        const playerBPieces = boxes.some(box => box.getAttribute('data-piece') && box.getAttribute('data-piece').startsWith('B-'));

        if (!playerAPieces) {
            displayWinMessage('Player B Wins!');
            return;
        } 
        if (!playerBPieces) {
            displayWinMessage('Player A Wins!');
            return;
        }
    }

    board.addEventListener('click', function (event) {
        const clickedBox = event.target;

        if (!clickedBox.classList.contains('box')) return;

        if (selectedBox) {
            const selectedPiece = selectedBox.getAttribute('data-piece');
            const clickedPiece = clickedBox.getAttribute('data-piece');

            if (clickedBox === selectedBox) {
                clearHighlights();
                selectedBox = null;
                return;
            }

            if (selectedPiece && isValidMove(boxes.indexOf(selectedBox), boxes.indexOf(clickedBox), selectedPiece) && isMoveAllowed(boxes.indexOf(selectedBox), boxes.indexOf(clickedBox))) {
                movePiece(selectedBox, clickedBox);
                ws.send(JSON.stringify({ type: 'MOVE', from: selectedBox.getAttribute('data-piece'), to: clickedBox.getAttribute('data-piece') }));
                selectedBox = null;
                clearHighlights();
            } else {
                clearHighlights();
                selectedBox = null;
            }
        } else {
            if (clickedBox.getAttribute('data-piece') && clickedBox.getAttribute('data-piece')[0] === turn) {
                selectedBox = clickedBox;
                highlightValidMoves(selectedBox.getAttribute('data-piece'));
            }
        }
    });
});
