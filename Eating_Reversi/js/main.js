// script.js

// グローバル変数を追加して、現在のプレイヤーの色を追跡します
let boardSize = 4; // ここで盤面のサイズを設定
let currentPlayer = 'black';
let totalCells = boardSize * boardSize;
let n = 1;
let selectedSize = document.getElementById('boardSize').value;
let playerColor;
let cpuColor;
let blackRemoveCount = 0;
let whiteRemoveCount = 0;
const removeLimit = 3; // 上限を設定する
const removeBlack = document.getElementById('removeBlack');
const removeWhite = document.getElementById('removeWhite');

const startGameBtn = document.getElementById('startGameBtn');
const board = document.getElementById('gameBoard');
const sizeChangeBtn = document.getElementById('sizeChangeBtn');
const resultElement = document.getElementById('gameResult');

let playMode = 'vsCPU'; // デフォルトのプレイモード
const playModeSelect = document.getElementById('playMode');

const cpuModeMenu = document.querySelectorAll('.cpuModeMenu');




document.addEventListener('DOMContentLoaded', () => {
    playModeSelect.addEventListener('change', handlePlayModeChange);
    startGameBtn.addEventListener('click', () => {
        startGameBtn.textContent = "リトライ";
        playMode = document.getElementById('playMode').value;
        playerColor = document.querySelector('input[name="playerColor"]:checked').value;
        cpuColor = playerColor === 'black' ? 'white' : 'black';
        selectedSize = document.getElementById('boardSize').value;
        boardSize = parseInt(selectedSize);
        totalCells = boardSize * boardSize;
        blackRemoveCount = 0;
        whiteRemoveCount = 0;
        resultElement.textContent = '';
        initializeBoard(board, boardSize);
        startGame();
    });
});

function handlePlayModeChange(event) {
    playMode = event.target.value;
    if (playMode === 'manual') {
        cpuModeMenu.forEach(menu => {
            menu.style.display = 'none';
        });
    } else {
        cpuModeMenu.forEach(menu => {
            menu.style.display = 'block';
        })
    }
}

function startGame() {
    currentPlayer = 'black';
    initializeBoard(board, selectedSize);
    removeBlack.textContent = removeLimit;
    removeWhite.textContent = removeLimit;
    if (playMode === 'vsCPU' && currentPlayer === cpuColor) {
        setTimeout(cpuPlay, n * 1000); // CPUが最初に手を打つ
    } else {
        enablePlayerInteraction();
    }
    // その他の初期化ロジック
}

function initializeBoard(board, size) {
    board.innerHTML = ''; // 既存の盤面をクリア
    board.style.setProperty('--board-size', size); // CSS変数の更新

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = `${i}`;
        board.appendChild(cell);
    }
    setInitialDiscs(board);
}

function setInitialDiscs(board) {
    const middle = boardSize / 2;
    const startIndex = middle * boardSize + middle;
    const cells = board.children;
    cells[startIndex - boardSize - 1].appendChild(createDisc('black'));
    cells[startIndex - boardSize].appendChild(createDisc('white'));
    cells[startIndex - 1].appendChild(createDisc('white'));
    cells[startIndex].appendChild(createDisc('black'));
}


function createDisc(color) {
    const disc = document.createElement('div');
    disc.classList.add('disc', color);
    return disc;
}

function placeDisc(cell) {
    if (cellHasDisc(cell)) {
        // 既にディスクがある場合は何もしません
        return false;
    }
    if (isLegalMove(cell)) {
        // ディスクを置く処理
        const disc = createDisc(currentPlayer);
        cell.appendChild(disc);
        // 反転処理など
        flipDiscs(cell);
        changePlayer();
        updateGame();
    }

    return true;
}

function removeDisc(cell) {
    let removeCount = currentPlayer === 'black' ? blackRemoveCount : whiteRemoveCount;

    if (cellHasDisc(cell) && removeCount < removeLimit) {
        cell.innerHTML = ''; // セルから駒を取り除く
        if (currentPlayer === 'black') {
            blackRemoveCount++;
        } else {
            whiteRemoveCount++;
        }
        changePlayer();
        updateGame();
    }
}

// cellにdiscが存在するか判定
function cellHasDisc(cell) {
    return cell.getElementsByClassName('disc').length > 0;
}

function isRightEdge(index) {
    return index % boardSize === boardSize - 1;
}

function isLeftEdge(index) {
    return index % boardSize === 0;
}

function isTopEdge(index) {
    return index < boardSize;
}

function isBottomEdge(index) {
    return index >= totalCells - boardSize;
}

function isEdge(index, isChecked) {
    if (isBottomEdge(index)) {
        isChecked[2] = true;
        isChecked[4] = true;
        isChecked[5] = true;
    }
    if (isTopEdge(index)) {
        isChecked[3] = true;
        isChecked[6] = true;
        isChecked[7] = true;
    }
    if (isLeftEdge(index)) {
        isChecked[1] = true;
        isChecked[5] = true;
        isChecked[6] = true;
    }
    if (isRightEdge(index)) {
        isChecked[0] = true;
        isChecked[4] = true;
        isChecked[7] = true;
    }
}

function isEdgeCase(index, direction) {
    switch (direction) {
        case 0: // 右方向
            return isRightEdge(index);
        case 1: // 左方向
            return isLeftEdge(index);
        case 2: // 下方向
            return isBottomEdge(index);
        case 3: // 上方向
            return isTopEdge(index);
        case 4: // 右下方向
            return isRightEdge(index) || isBottomEdge(index);
        case 5: // 左下方向
            return isLeftEdge(index) || isBottomEdge(index);
        case 6: // 左上方向
            return isLeftEdge(index) || isTopEdge(index);
        case 7: // 右上方向
            return isRightEdge(index) || isTopEdge(index);
        default:
            return false;
    }
}

function flipDiscs(cell) {
    // ここで反転すべきディスクを特定し、反転させるロジックを実装します
    let isChecked = [false, false, false, false, false, false, false, false];
    const cellIndex = parseInt(cell.id);
    // 右　左　下　上　右下　左下　左上　右上
    let nextIndex = [
        cellIndex+1, 
        cellIndex-1, 
        cellIndex+boardSize, 
        cellIndex-boardSize, 
        cellIndex+boardSize+1, 
        cellIndex+boardSize-1, 
        cellIndex-boardSize-1, 
        cellIndex-boardSize+1
    ];
    const vecIndex = [
        1, 
        -1, 
        boardSize, 
        -boardSize, 
        boardSize+1, 
        boardSize-1, 
        -boardSize-1, 
        -boardSize+1
    ];
    // 反転させるべきディスクを格納する配列
    let discsToFlip = [[], [], [], [], [], [], [], []];

    // セルが盤面の端にあるかどうかをチェックし、該当する方向をtrueに設定
    isEdge(cellIndex, isChecked);

    while (isChecked.includes(false)) { // 行の終わりまでチェック
        nextIndex.forEach(function(next, index) {
            if (!isChecked[index]) {// まだチェックされていない方向のみ処理
                if (next < 0 || totalCells <= next) {// 盤面外に出た場合はその方向のチェックを終了
                    isChecked[index] = true;
                } else {
                    const nextCell = document.getElementById(`${next}`);// 次のセルを取得
                    if (!cellHasDisc(nextCell)) {// ディスクがない場合はその方向のチェックを終了
                        isChecked[index] = true;
                    } else {
                        const disc = nextCell.getElementsByClassName('disc')[0];// ディスク要素を取得
                        if (disc.classList.contains(currentPlayer)) {// 現在のプレイヤーのディスクが見つかった場合
                            discsToFlip[index].forEach(d => flipDisc(d));// その方向のすべてのディスクを反転
                            isChecked[index] = true;
                        }
                        //indexの値ごとに、進行方向に壁があれば調べるのやめ
                        // 右　左　下　上　右下　左下　左上　右上
                        if (isEdgeCase(next, index)) {// 次のセルが盤面の端の場合、その方向のチェックを終了
                            isChecked[index] = true;
                        }
                        discsToFlip[index].push(disc);
                        nextIndex[index] += vecIndex[index];
                    }
                }
            }
        });
    }
}

function flipDisc(disc) {
    if (disc.classList.contains('black')) {
        disc.classList.remove('black');
        disc.classList.add('white');
    } else {
        disc.classList.remove('white');
        disc.classList.add('black');
    }
}

// ひっくりかえせるdiscが存在すればTrueを返す
function isLegalMove(cell) {
    if (cellHasDisc(cell)) {
        // 既にディスクが置かれているセルには置けません
        return false;
    }

    const cellIndex = parseInt(cell.id);
    const directions = [
        1, 
        -1, 
        boardSize, 
        -boardSize, 
        boardSize+1, 
        boardSize-1, 
        -boardSize-1, 
        -boardSize+1
    ]; // 各方向へのインデックス変化量
    let isLegal = false;

    for (let i = 0; i < directions.length; i++) {
        if (checkDirection(cellIndex, directions, i)) {
            isLegal = true;
            break;
        }
    }
    // 合法な動きがあるかどうかを返す
    return isLegal;
}

function checkDirection(startIndex, vecIndex, i) {
    let currentIndex = startIndex + vecIndex[i];
    let hasOpponentDisc = false;
    if (isEdgeCase(startIndex, i)) {
        return false;
    }
    while (currentIndex >= 0 && currentIndex < totalCells) {
        const currentCell = document.getElementById(`${currentIndex}`);
        if (!cellHasDisc(currentCell)) {
            break; // 空のセルに到達した場合
        }

        const disc = currentCell.getElementsByClassName('disc')[0];
        if (disc.classList.contains(currentPlayer)) {
            return hasOpponentDisc; // 自分のディスクに到達した場合、途中に対戦相手のディスクがあれば合法
        }

        hasOpponentDisc = true; // 対戦相手のディスクがある場合
        if (isEdgeCase(currentIndex, i)) {
            break;
        }
        currentIndex += vecIndex[i];
    }
    return false;
}

function checkForLegalMoves() {
    for (let i = 0; i < totalCells; i++) {
        const cell = document.getElementById(`${i}`);
        if (isLegalMove(cell)) {
            return true;
        }
    }
    return false;
}

function changePlayer() {
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    updatePlayerTurnDisplay();
}

function updateGame() {
    removeBlack.textContent = removeLimit - blackRemoveCount;
    removeWhite.textContent = removeLimit - whiteRemoveCount;
    let nowBoard = countDiscs();
    if (nowBoard.black == 0 || nowBoard.white == 0) {
        changePlayer();
        disablePlayerInteraction();
        endGame();
        return;
    }
    let removeCount = currentPlayer === 'black' ? blackRemoveCount : whiteRemoveCount;
    if (!checkForLegalMoves() && removeCount == removeLimit) {
        changePlayer();
        disablePlayerInteraction();
        enablePlayerInteraction();
        removeCount = currentPlayer === 'black' ? blackRemoveCount : whiteRemoveCount;
        if (!checkForLegalMoves() && removeCount == removeLimit) {
            disablePlayerInteraction();
            endGame();
            return;
        }
    }

    if (playMode === 'vsCPU' && currentPlayer === cpuColor) {
        disablePlayerInteraction();
        setTimeout(cpuPlay, 1000); // 例: 1秒後にCPUが動く
    } else {
        enablePlayerInteraction();
    }
}

function endGame() {
    const scores = countDiscs();
    let resultText;

    if (scores.black > scores.white) {
        resultText = "黒の勝利！";
    } else if (scores.white > scores.black) {
        resultText = "白の勝利！";
    } else {
        resultText = "引き分け！";
    }

    resultElement.textContent = resultText; // 結果をテキストとして表示
}

function countDiscs() {
    let blackCount = 0;
    let whiteCount = 0;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.getElementById(`${i}`);
        cell.classList.remove('hoverable');
        if (cellHasDisc(cell)) {
            const disc = cell.getElementsByClassName('disc')[0];
            if (disc.classList.contains('black')) {
                blackCount++;
            } else if (disc.classList.contains('white')) {
                whiteCount++;
            }
        }
    }

    return { black: blackCount, white: whiteCount };
}

function updatePlayerTurnDisplay() {
    const playerTurnElement = document.getElementById('currentPlayer');
    playerTurnElement.textContent = currentPlayer === 'black' ? '黒' : '白';
}

// ゲーム初期化時やプレイヤーが変わるたびにこの関数を呼び出す
updatePlayerTurnDisplay();

function cpuPlay() {
    const selectedStrategy = document.getElementById('cpuStrategy').value;
    switch (selectedStrategy) {
        case 'random':
            cpuPlayRandom();
            break;
        case 'maxCapture':
            cpuPlayMaxCapture();
            break;
        case 'minOptions':
            cpuPlayMinOptions();
            break;
        default:
            cpuPlayRandom(); // デフォルトはランダム戦略
    }
}

function enablePlayerInteraction() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (isLegalMove(cell)) {
            cell.classList.add('hoverable');
            cell.addEventListener('click', handleCellClick);
        } else if (cellHasDisc(cell)) {
            cell.addEventListener('click', handleCellClick);
        }
    });
}

function disablePlayerInteraction() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('hoverable');
        cell.removeEventListener('click', handleCellClick);
    });
}

function handleCellClick() {
    // 既存のセルをクリックしたときの処理
    if (isLegalMove(this)) {
        placeDisc(this);
    } else if (cellHasDisc(this)) {
        removeDisc(this);
    }
}

// CPUの設定
function cpuPlayRandom() {
    const legalMoves = [];
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.getElementById(`${i}`);
        if (isLegalMove(cell)) {
            legalMoves.push(cell);
        } else if (cellHasDisc(cell)) {
            legalMoves.push(cell);
        }
    }

    if (legalMoves.length > 0) {
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        if (isLegalMove(randomMove)) {
            placeDisc(randomMove);
        } else {
            removeDisc(randomMove);
        }
    }
}

// 最大取得戦略
function cpuPlayMaxCapture() {
    // ...最も多くの駒を取れる手を選ぶロジック...
}

function cpuPlayMinOptions() {
    let bestMove = null;
    let minOpponentMoves = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.getElementById(`${i}`);
        if (isLegalMove(cell)) {
            const tempBoard = simulateMove(cell, currentPlayer);
            const opponentMoves = countLegalMoves(tempBoard, currentPlayer === 'black' ? 'white' : 'black');

            if (opponentMoves < minOpponentMoves) {
                bestMove = cell;
                minOpponentMoves = opponentMoves;
            }
        }
    }

    if (bestMove) {
        placeDisc(bestMove);
    }
}

function simulateMove(cell, player) {
    // この関数は、指定されたセルに駒を置いたときの盤面の状態をシミュレートし、
    // 新しい盤面の状態を返します。盤面の状態は、各セルの状態（空、黒、白）の配列として表現できます。
    // 実際の盤面には影響を与えません。
}

function countLegalMoves(boardState, player) {
    // この関数は、指定された盤面の状態とプレイヤーに対して、合法な手の数を数えます。
}