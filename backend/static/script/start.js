(() => {
    const IMAGE_PATH = [
        "/static/images/apple.png",
        "/static/images/lemon.png",
        "/static/images/orange.png",
        "/static/images/peach.png"
    ];

    let name = null; // プレイヤーの名前
    
    // 落下する画像オブジェクトの配列
    const fallingImages = [];

    let leftCanvas = null;
    let rightCanvas = null;
    let leftCtx = null;
    let rightCtx = null;

    /**
     * ゲームスタート画面が完了したときに発火する load イベント
     */
    document.addEventListener('DOMContentLoaded', () => {
        // ローカルストレージをクリア
        // localStorage.clear();

        const nameInput = document.getElementById('name');
        const startGameButton = document.getElementById('startGame');

        leftCanvas = document.getElementById('leftCanvas');
        rightCanvas = document.getElementById('rightCanvas');
        leftCtx = leftCanvas.getContext('2d');
        rightCtx = rightCanvas.getContext('2d');

        adjustCanvasSize(); // Canvasのサイズを画面サイズに合わせる
        createFallingImage(leftCanvas, 2);
        createFallingImage(rightCanvas, 2);
        updateAndDrawImages(); // 画像を更新して描画

        // window.addEventListener('resize', adjustCanvasSize); // ウィンドウサイズが変更されたときにも調整

        // ゲームの状態をローカルストレージから読み込む
        const gameState = localStorage.getItem('gameState');
        // if (gameState) {
        //     const state = JSON.parse(gameState);
        //     // 名前入力欄に前回の名前を表示
        //     nameInput.value = state.name;
        //     // ゲームのページに遷移
        //     window.location.href = '/game';
        // }

        const playButton = document.getElementById('playButton');
        const bgm = document.getElementById('startSound');
        // bgm.loop = true;
        // bgm.play();

        playButton.addEventListener('click', function (event) {
            event.preventDefault();
            if (bgm.paused) {
                bgm.play()
                    .then(() => console.log("オーディオの再生を開始しました。"))
                    .catch(error => console.error("オーディオの再生に失敗しました。", error));
                playButton.textContent = '音楽を停止(Stop music)';
            } else {
                bgm.pause();
                playButton.textContent = '音楽を再生(Play music)';
            }
        });
        
        startGameButton.addEventListener('click', async () => {
            name = nameInput.value.trim(); // 名前入力の前後の空白を削除
    
            if (name === '') {
                // 名前が入力されていない場合は警告を表示
                alert('Please enter your name.');
            } else {
                // // 名前をローカルストレージに保存
                localStorage.setItem('playerName', name);

                // updateGameState(name, 0); // ゲームの状態をローカルストレージに保存

                try {
                    await submitUser(); // 参加人数をサーバーに送信

                    // const socket = io();  // Socket.IOのクライアントインスタンスを作成

                    toggleLoadingIndicator(true); // 待機する表示

                    // ゲーム開始の合図をポーリングで確認する関数を呼び出す
                    pollForGameStart();

                } catch (error) {
                    console.error('An error occurred:', error);
                    alert('Failed to start the game. Please try again later.');
                }
            }
        });
    });


    function adjustCanvasSize() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        leftCanvas = document.getElementById('leftCanvas');
        rightCanvas = document.getElementById('rightCanvas');

        // 画面の高さを100vh（ビューポート高さの100%）に基づいて設定
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;

        // Canvasのサイズを画面サイズに合わせる
        leftCanvas.width = screenWidth / 2; // 画面幅の50%を左Canvasの幅とする
        leftCanvas.height = screenHeight; // 画面の高さをCanvasの高さとする
        rightCanvas.width = screenWidth / 2; // 画面幅の50%を右Canvasの幅とする
        rightCanvas.height = screenHeight; // 画面の高さをCanvasの高さとする
    }

    // 画像オブジェクトの生成
    function createFallingImage(canvas, speed)  {
        for(let j = 0; j < 2; j++){
            for (let i = 0; i < IMAGE_PATH.length; i++) {
                const image = new Image();
                image.src = IMAGE_PATH[i];
                let addSpeed = Math.random() * 2;
        
                // 画像が落下するX座標の範囲を制限する
                let x = Math.random() * (canvas.width - image.width / 5);
                
                // 中央部分を避けるための調整
                const canvasCenter = window.innerWidth / 2;
                const gap = 100; // 中央から避ける幅（例: 100ピクセル）
        
                // 左側のCanvasの場合、中央部分よりも左に落下させる
                if (canvas.id === 'leftCanvas' && x + canvas.offsetLeft > canvasCenter - gap) {
                    x = canvasCenter - gap - canvas.offsetLeft - image.width;
                }
                // 右側のCanvasの場合、中央部分よりも右に落下させる
                else if (canvas.id === 'rightCanvas' && x + canvas.offsetLeft < canvasCenter + gap) {
                    x = canvasCenter + gap - canvas.offsetLeft;
                }
        
                fallingImages.push({ image: image, x: x, y: 0, speed: speed + addSpeed, canvas: canvas });
            }
        }
    }
    
    // 画像オブジェクトの位置を更新して描画
function updateAndDrawImages() {
    rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height); // Canvasをクリア
    leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height); // Canvasをクリア

    draw(rightCtx, rightCanvas); // 画像を描画
    draw(leftCtx, leftCanvas); // 画像を描画

    requestAnimationFrame(updateAndDrawImages); // 次のフレームをリクエスト
}

function draw(ctx, canvas){
    fallingImages.forEach(obj => {
        obj.y += obj.speed; // Y座標を更新
        if (obj.y > canvas.height) {
            obj.y = -obj.image.height; // 画像が下端に達したら上に戻す
        }
        // 画像を指定した大きさで描画
        const targetWidth = 100; // 目的の幅
        const targetHeight = 100; // 目的の高さ
        ctx.drawImage(obj.image, obj.x, obj.y, targetWidth, targetHeight); // 画像を描画
    });
}

// ゲーム状態の更新時にローカルストレージを更新する関数
function updateGameState(name, score) {
    const state = { name: name, score: score };
    localStorage.setItem('gameState', JSON.stringify(state));
}

// 自身が参加したことをサーバーに送信する関数
async function submitUser() {
    console.log(name);
    fetch('/user_count', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({userName: name}),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// ゲーム開始の合図をポーリングで確認する
function pollForGameStart() {
    fetch('/check_game_start')
        .then(response => response.json())
        .then(data => {
            if (data.game_started) {
                // ゲーム開始の合図があればゲームページに遷移
                window.location.href = `/game?name=${encodeURIComponent(name)}`;
            } else {
                // まだゲーム開始の合図がなければ、数秒後に再度確認
                setTimeout(pollForGameStart, 3000);
            }
        })
        .catch(error => console.error('Error:', error));
}

// 通信の状態に応じてローディングインジケーターを表示または非表示にする関数
function toggleLoadingIndicator(show) {
    const loadingElement = document.getElementById('loading');
    if (show) {
        loadingElement.style.display = 'block'; // 通信中に表示
    } else {
        loadingElement.style.display = 'none'; // 通信終了後に非表示
    }
}
})();