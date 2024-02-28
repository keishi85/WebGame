
(() => {
    /**
     * canvas の幅
     * @type {number}
     */
    const CANVAS_WIDTH = 400;
    /**
     * canvas の高さ
     * @type {number}
     */
    const CANVAS_HEIGHT = 600;

    /**
     * Canvas2D API をラップしたユーティリティクラス
     * @type {Canvas2DUtility}
     */
    let util = null;
    /**
     * 描画対象となる Canvas Element
     * @type {HTMLCanvasElement}
     */
    let canvas = null;
    /**
     * Canvas2D API のコンテキスト
     * @type {CanvasRenderingContext2D}
     */
    let ctx = null;
    /**
     * 数字キーの高さ
     * @type {number}
     */
    const KEYPAD_HEIGHT = 200;
    /**
     * 問題の最大個数
     * @param {number}
     */
    const BLOCK_MAX_COUNT = 3;
    /**
     * ブロックのインスタンスを格納する配列
     * @type {Array<Brock>}
     */
    let blockArray = [];
    /**
     * 数字キーのインスタンスを格納する配列
     * @type {Array<NumberKey>}
     */
    let numberKeyArray = [];
    /**
     * 数字キーの初期化のための座標を格納した2次元配列
     * (0~9,c,-,.,enter)[X座標,Y座標,X軸半径,Y軸半径]
     * @type {Array<number>}
     */
    let numberKeyCoordinateArray = [
        [113, 565, 80, 20],
        [70, 520, 40, 20],
        [155, 520, 40, 20],
        [240, 520, 40, 20],
        [70, 475, 40, 20],
        [155, 475, 40, 20],
        [240, 475, 40, 20],
        [70, 430, 40, 20],
        [155, 430, 40, 20],
        [240, 430, 40, 20],
        [240, 565, 40, 20],
        [335, 430, 40, 20],
        [335, 475, 40, 20],
        [335, 543, 40, 40]
    ];
    /**
     * 入力された数字を格納する変数
     * @type {string}
     */
    let inputNumber = null;
    /**
     * プレイヤーのスコアを格納する変数
     * @type {number}
     */
    let score = localStorage.getItem('score');
    if (score === null) {
        score = 0; // デフォルト値を設定
    } else {
        score = parseInt(score, 10); // localStorageから取得した値は文字列なので数値に変換
    }
    /**
     * プレイヤーの名前を格納する変数
     * @type {string}
     */
    let playerName = localStorage.getItem('playerName')
    /**
     * DBから取得した問題を管理する変数
     * @type {Array<{ question: string, answer: string, fruit: fruit }>}
     */
    let calcData = [];
    /**
     * DBから取得した問題を管理する変数
     * @type {Array<{ question: string, choices: string[], answer: string }>}
     */
    let quizData = [];
    /**
     * クイズのインスタンスを格納する変数
     * @type {Quiz}
     */
    let quizInstance = null;
    /**
     * DBから取得した名前とスコアを格納{
     * @type {Array<{ name: string, rank: number, score: number }>}
     */
    let scoresData = [];
    /**
     * 計算問題に回答した数をカウントする変数
     * @type {number}
     */
    let calcSolvedCount = 0;
    /**
     * この数の計算問題を解いた後にクイズが出る
     * @type {number}
     */
    const CHANGE_CALCULATION_QUESTION = 5;
    /**
     * 出る問題の種類を表す変数(Calculation or Quiz)
     * @type {string}
     */
    let questionType = 'Calculation';
    /**
     * 画像ファイルパスを格納する配列
     * @type {Array[string]}
     */
    const imgPath = ['static/images/peach.png', 'static/images/apple.png', 'static/images/orange.png', 'static/images/lemon.png', 'static/images/obstacle.png'];
    /**
     * ユーザー数をカウント
     * @type {number}
     */
    let userCount = 0;
    /**
     * 木の画像
     * @type {HTMLImageElement}
     */
    let treeImg = null;
    /**
     * ゲーム時間を設定
     * @type {number}
     */
    let gameState = localStorage.getItem('gameState'); // ゲーム状態のオブジェクトを取得
    let GAMETIME;

    if (gameState === null) {
        GAMETIME = 100; // デフォルト値を設定
    } else {
        gameState = JSON.parse(gameState); // 文字列をオブジェクトに変換
        if (gameState.time !== undefined) {
            GAMETIME = parseInt(gameState.time, 10); // オブジェクトからtimeプロパティを取得して数値に変換
        } else {
            GAMETIME = 100; // timeプロパティが未定義の場合はデフォルト値を設定
        }
    }
    /**
     * サウンドを設定
     */
    let correctAnswer = null;
    let wrongAnswer = null;
    let gameBGM = null;
    /**
     * ゲーム進行中かどうか(True,False)
     */
    let gameActive;
    /**
     * お邪魔攻撃を受ける割合
     */
    let ObstacleRate = 1/5;
    /**
     * Obstacleクラスのインスタンスを格納する変数
     */
    let obstacleArray = [];
    /**
     * 妨害の雲の数
     */
    let OBSTACLE_MAX_COUNT = 2;
    /**
     * おじゃまが消されたどうか
    */
    let isObstacle = false;
    /**
     * おじゃまアイテムを消したユーザー名
     * @type {string}
     */
    let hinderingPlayerName = null;
    /**
     * お邪魔攻撃の開始時間
     */
    let obstacleStartTime = null;


    /* 
    * ページのロードが完了したときに発火する load イベント
    */
    window.addEventListener('load', () => {
        // ユーティリティクラスを初期化
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        // ユーティリティクラスから canvas を取得
        canvas = util.canvas;
        // ユーティリティクラスから 2d コンテキストを取得
        ctx = util.context;

        // 初期化処理を行う
        initialize();

        // 木の画像を読み込む
        treeImg = new Image();
        treeImg.src = 'static/images/tree.png'; // 画像のパスを設定
        treeImg.onload = () => {
            // 画像の読み込みが完了したら描画を開始
            render();
        };

        // クリックイベントとタッチイベントを追加
        canvas.addEventListener('click', ClickOrTouch);
        document.addEventListener('DOMContentLoaded', getDB);


    }, false);

    // ページのロードが完了したときに発火する load イベント
    document.addEventListener('DOMContentLoaded', () => {
        loadGameState();    
    });

    /**
     * canvas やコンテキストを初期化する
     */
    function initialize(){
        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // gameStateをactiveに
        gameActive = true;

        // データベースから問題を取得(ブロックの初期化より前)
        getDB();

        // プレイヤーの人数を取得
        getUserCount();

        // ブロックを初期化する
        for(let i = 0; i < BLOCK_MAX_COUNT; ++i){
            blockArray[i] = new Block(ctx, 75 + 125 * i, -50, 60, 0, canvas.height - KEYPAD_HEIGHT, calcData, imgPath);
            blockArray[i].loadImage();
        }

        // 数字キーの初期化
        initializeNumberKey();

        // クイズインスタンスの初期化
        quizInstance = new Quiz(ctx, 200, -50, 300, 100, 0, canvas.height - KEYPAD_HEIGHT, quizData, 'static/images/leaves.png');
        quizInstance.loadImage();

        // 妨害クラスの初期化
        for(let i = 0; i < OBSTACLE_MAX_COUNT; ++i){
            obstacleArray[i] = new Obstacle(ctx, 100 * (1 + i), 150 * (1 + i), 240, 120, CANVAS_WIDTH, 'static/images/cloud.png');
            obstacleArray[i].loadImage();
        }

        // サウンドの初期化
        correctAnswer = document.getElementById('correctAnswerSound');
        wrongAnswer = document.getElementById('wrongAnswerSound');
        gameBGM = document.getElementById('gameSound');
        gameBGM.loop = true;
        gameBGM.play();
        
        // ゲーム時間の計測を開始
        const timerInterval = setInterval(() => {

            // 残り時間が5秒になったら音を鳴らす
            if (GAMETIME === 6) {
                const countdownSound = document.getElementById('countdownSound');
                countdownSound.play();
            }

            // 残り時間が0になったらタイマーを停止し、ゲーム終了処理を実行
            if (GAMETIME === 0) {
                clearInterval(timerInterval);
                gameActive = false;
                localStorage.clear();
                endGame();
            } else {
                // 残り時間を1減らす
                GAMETIME -= 1;
            }
        }, 1000); // 1秒ごとに更新

        // ゲーム時間の計測を開始
        const userCountInterval = setInterval(() => {
            getUserCount();
        }, 10000); // 1秒ごとに更新

        // おじゃまアイテムを他のユーザが削除したかを受信(Polling request)
        getObstacle();

        /**
         * websocketの使用は断念
         * var socket = io(); // 自動的に現在のページのURLを使用

        // サーバーからおじゃまが消された通知を受け取る
        socket.on('obstacle-item', function(nameOfHinderingPlayer) {
            alert(nameOfHinderingPlayer + " was decreased by " + player.decreased + " points.");
        });
         */  
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // 描画前に画面全体を塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#87cefa');
        // 画像をCanvasの背景に描画
        ctx.drawImage(treeImg, -100, -150, CANVAS_WIDTH * 3 / 2, CANVAS_HEIGHT);

        // スコアの更新
        console.log(playerName, score);
        sendScore(playerName, score).then(() => {
            getScores(playerName);
        });

        // ユーザーの人数を描画
        drawUserNumber();

        // 各プレイヤーの名前，順位，スコアを描画
        drawPlayerNameAndScore();

        // 計測時間を描画
        drawTimer();

        // ゲーム進行中の時
        if(gameActive){
            // 計算問題ブロックの更新
            blockArray.map((v) => {
                v.setAppearanceObstacle(playerName, scoresData, ObstacleRate);
                v.update();
                if(questionType === 'Calculation'){
                    v.resetLife();
                }
            });

            // 数字キーのエリアの描画
            util.drawRect(0, canvas.height - KEYPAD_HEIGHT, canvas.width, KEYPAD_HEIGHT, '#32cd32'); 

            // 計算問題から，クイズへの切り替え
            if(calcSolvedCount % CHANGE_CALCULATION_QUESTION === 0 && calcSolvedCount !== 0 && questionType === 'Calculation'){
                questionType = 'Quiz';
                quizInstance.life = 1;
                calcSolvedCount = 0;
            }
            
            // 計算問題 or クイズの更新
            if(questionType === 'Quiz' && blockArray.every(block => block.life === 0)){
                // クイズの更新
                quizInstance.update();
                // クイズから計算問題へ切り替え
                if(quizInstance.life === 0){
                    questionType = "Calculation";
                    blockArray.map((v) => {
                        v.initialize();
                    });
                }
            } else {
                // 数字キーの更新
                numberKeyArray.map((v) => {
                    v.update();
                });
                // 入力された数字の更新
                drawInputNumber();
            }

            // 妨害行為の更新
            if(isObstacle === true){
                drawObstacle();
            }
        
            // 復帰できるようにローカルに保存
            updateGameState(playerName, score, GAMETIME);
        } else {
            drawEndGame();
        }
        
        // フレーム更新ごとに再起呼び出し
        requestAnimationFrame(render);
    }

    function initializeNumberKey(){
        for(let i = 0; i < 10; ++i){
            numberKeyArray[i] = new NumberKey(
                ctx,
                String(i),
                numberKeyCoordinateArray[i][0],
                numberKeyCoordinateArray[i][1],
                numberKeyCoordinateArray[i][2],
                numberKeyCoordinateArray[i][3]
                );
        }
        numberKeyArray[10] = new NumberKey(
            ctx,
            'C',
            numberKeyCoordinateArray[10][0],
            numberKeyCoordinateArray[10][1],
            numberKeyCoordinateArray[10][2],
            numberKeyCoordinateArray[10][3]
        );
        numberKeyArray[11] = new NumberKey(
            ctx,
            '-',
            numberKeyCoordinateArray[11][0],
            numberKeyCoordinateArray[11][1],
            numberKeyCoordinateArray[11][2],
            numberKeyCoordinateArray[11][3]
        );
        numberKeyArray[12] = new NumberKey(
            ctx,
            '.',
            numberKeyCoordinateArray[12][0],
            numberKeyCoordinateArray[12][1],
            numberKeyCoordinateArray[12][2],
            numberKeyCoordinateArray[12][3]
        );
        numberKeyArray[13] = new NumberKey(
            ctx,
            'enter',
            numberKeyCoordinateArray[13][0],
            numberKeyCoordinateArray[13][1],
            numberKeyCoordinateArray[13][2],
            numberKeyCoordinateArray[13][3]
        );
    }

    /**
     * クリックまたはタッチされた時の処理
     * @param {MouseEvent|TouchEvent} event クリックまたはタッチイベント
     */
    function ClickOrTouch(event) {
        let x, y;
        if(event.type === 'click'){
            // クリックの時
            x = event.pageX - canvas.offsetLeft;
            y = event.pageY - canvas.offsetTop;
        }

        if(questionType === 'Quiz' && blockArray.every(block => block.life === 0)){
            // クイズの時
            ClickChoicesArea(x, y);
        } else {
            // 計算問題の時
            ClickKyeArea(x, y);
        }
        
    }

    /**
     * 下の数字キーのエリアをクリックしたときの判定
     * @param {number} x - クリックされたX座標
     * @param {number} y - クリックされたY座標
     */
    function ClickKyeArea(x,y){
        // クリックした位置が数字キーの楕円の中にあるかどうかの判定
        for(let i = 0; i < numberKeyArray.length; ++i){
            // 相対距離を計算し判定．1つ見つけたら抜ける．
            let dx = (x - numberKeyArray[i].position.x) / numberKeyArray[i].radiusX;
            let dy = (y - numberKeyArray[i].position.y) / numberKeyArray[i].radiusY;
            if(dx * dx + dy * dy <= 1){
                
                // 押された時にキーの色を変える
                numberKeyArray[i].isPressed = true;
                // 一定時間後に isPressed を false に設定する
                setTimeout(() => {
                    numberKeyArray[i].isPressed = false;
                }, 100); // 100ミリ秒後に isPressed を false に設定する

                // 数字キーの種類によって判断する
                let type = numberKeyArray[i].type
                switch (type) {
                    case 'enter':
                        if (inputNumber !== null) {
                            // 解答を数値に変換
                            let userAnswer = Number(inputNumber);
                            // console.log(userAnswer);

                            let correct = false; // 正解したかどうかの判定(音を鳴らす判定に使用)

                            // 画面に表示されているブロックの解答をチェックする
                            for(let i = 0; i < blockArray.length; ++i){
                                // 正解かどうかの判定を行う
                                let judgement = blockArray[i].checkAnswer(userAnswer);

                                if(judgement === 'OBSTACLE'){
                                    sendObstacleSignal();
                                    console.log('OBSTACLE');
                                    // 正解時はcorrectをtrueに
                                    correct = true;
                                    break;
                                } else if(judgement !== 0){
                                     // スコアを加算
                                     score += Number(judgement);
                                     // 回答した数をインクリメント
                                     calcSolvedCount++;
                                     // 正解時はcorrectをtrueに
                                     correct = true;
                                     break;
                                }
                            }

                            if(correct){
                                // 正解音を鳴らす
                                correctAnswer.play();
                            } else {
                                // 不正解音を鳴らす
                                wrongAnswer.play();
                            }

                            // 解答の入力をnullに戻す
                            inputNumber = null;
                        }
                        break;
                    case 'C':
                        // 解答の入力をnullに戻す
                        inputNumber = null;
                        // console.log(type, inputNumber);
                        break;
                    case '-':
                        //解答が未入力の時，先頭にマイナスをつける
                        if (inputNumber === null) {
                            inputNumber = type;
                        } else {
                            inputNumber = type + inputNumber;
                        }
                        // console.log(type, inputNumber);
                        break;
                    case '.':
                        if (inputNumber === null) {
                            // 解答が未入力の時，0と小数点を追加
                            inputNumber = "0" + type;
                        } else {
                            // 解答が入力済みの時，最後尾に小数点を追加
                            inputNumber += type;
                        }
                        // console.log(type, inputNumber);
                        break;
                    default:
                        if (inputNumber === null || inputNumber === '0') {
                            // 解答が未入力の時と0の時は，入力された数字に更新
                            inputNumber = type;
                        } else {
                            // 解答が入力されている時は，最後尾に追加
                            inputNumber += type;
                        }
                        // console.log(type, inputNumber);
                }
            }
        }
    }

    /**
     * 選択肢をクリックしたときの判定
     * @param {number} x 
     * @param {number} y 
     */
    function ClickChoicesArea(x, y){
        
        for(let i = 0; i < 4; ++i){
            let position = quizInstance.choicesPosition[i];
            if(position.x < x && position.x + quizInstance.choicesWidth > x && position.y < y && position.y + quizInstance.choicesHeight > y){
                console.log(i);
                
                // 押された時にキーの色を変える
                quizInstance.isPressed[i] = true;
                // 一定時間後に isPressed を false に設定する
                setTimeout(() => {
                    quizInstance.isPressed[i] = false;
                }, 100); // 100ミリ秒後に isPressed を false に設定する

                // 正解時はスコア加算
                let judgement = quizInstance.checkAnswer(i);
                if(judgement !== 0){
                    score += judgement;
                    // 正解音を鳴らす
                    correctAnswer.play();
                } else {
                    // 不正解音を鳴らす
                    wrongAnswer.play();
                }
                break;
            }
        }
    }

    /**
     * 入力された数字を描画する
     */
    function drawInputNumber(){
        // 値がnull(何も入力されていない)時はスキップ
        if(inputNumber === null){return;}
        // テキストの描画
        ctx.fillStyle = '#ff0000';
        ctx.strokeStyle = '#000000';
        ctx.font = "bold 30px 'Segoe Print', san-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 1;
        ctx.fillText(`A:${inputNumber}`,100, 390); 
        ctx.strokeText(`A:${inputNumber}`,100, 390); 
    }

    /**
     * DBから問題を取得
     */
    function getDB(){
        const questionsContainer = document.getElementById('questions-container');
        // データ属性からquestionsデータを取得
        const questionsData = JSON.parse(questionsContainer.getAttribute('data-questions'));

        // 取得したデータを使用してDOMを更新
        questionsData.forEach((item) => {
            if (item.type === 'quiz') {
                // 選択肢を配列にまとめる
                let choices = [item.choice1, item.choice2, item.choice3, item.choice4];
                
                // 問題オブジェクトを作成して配列に追加する356.36
                let questionObject = {
                    question: item.question,
                    choices: choices,
                    answer: item.answer
                };
                quizData.push(questionObject);
            }
            else if (item.type === 'calculation') {
                // 問題オブジェクトを作成してcalcData配列に追加する
                let questionObject = {
                    question: item.problem, // 'problem'フィールドを使用
                    answer: item.answer,
                    fruit: item.fruit
                };
                calcData.push(questionObject);
            }  
            else {
                console.error('Invalid question type' + item.type);
            }
        });
    }

    /**
     * プレイヤーの得点をサーバーに送信する関数
     * @param {string} playerName 
     * @param {num} score 
     */
    function sendScore(playerName, score) {
        // console.log(playerName, score);
        return fetch('/submit_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name: playerName, score: score}),
        })
        // ".then" : Promiseオブジェクトに使用され、Promiseが完了した後に実行される処理を定義
        .then(response => response.json())
        // 以下のreturnはさらに".then"がある場合に必要となるもの
        .then(data => {
            // console.log('Success:', data);
            return data; // ここでPromiseを解決
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    /**
     * DBから各プレイヤーの名前とスコアを取得
     * scoresData.name, scoresData.rank, scoresData.score
     */
    function getScores(playerName) {
        // クエリパラメータを使用してプレイヤー名をエンドポイントに送信
        const url = `/get_scores?name=${encodeURIComponent(playerName)}`;
    
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // console.log(data);  // データをコンソールに表示
                scoresData = data;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    // ユーザーの人数を取得する関数
    function getUserCount() {
        // ユーザーの人数を取得するためのエンドポイントにリクエストを送信
        fetch('/get_user_count')
            .then(response => response.json())
            .then(data => {
                // ユーザーの人数を表示
                userCount = data.user_count;
            })
            .catch(error => {
                console.error('Error fetching user count:', error);
            });
    }
    
    // プレイヤーのスコアを描画
    function drawPlayerNameAndScore(){
        // プレイヤー，順位，スコアを表示(10人まで)
        for(let i = 0; i < Math.min(10, scoresData.length); i++){
            const player = scoresData[i];
            const x = 10; // 名前の開始位置
            const y = 50 + 25 * i; // 縦方向の位置
            const separator = " : "; // 区切り文字
            const rankText = `${Math.floor(player.rank)}  `;
            const nameText = `${player.name}`;
            const scoreText = `${Math.floor(player.score)}`;

            // フォント等を設定
            ctx.fillStyle = '#000000';
            ctx.font = "bold 17px 'Segoe Print', san-serif";
            ctx.textAlign = "left";

            // 順位を描画
            ctx.fillText(rankText, x, y);
            
            // 名前の最大幅を計算（仮に200ピクセルとします）
            const nameMaxWidth = 80;
            
            // 名前を描画
            ctx.fillText(nameText, x + ctx.measureText(rankText).width, y);
            
            // スコアの位置を名前の幅に応じて調整
            const scoreX = x + nameMaxWidth;
            
            // 「:」とスコアを描画
            ctx.fillText(separator + scoreText, scoreX, y);
        }
    }

    function drawUserNumber(){
        // 参加人数を表示
        ctx.textAlign = "left";
        ctx.font = "bold 17px 'Segoe Print', san-serif";
        ctx.fillStyle = "#ff0000";
        ctx.fillText('参加人数：' + userCount, 10, 25);
    }
    // ゲーム状態の更新時にローカルストレージを更新する関数
    function updateGameState(name, score, time) {
        const state = { name: name, score: score, time: time};
        localStorage.setItem('gameState', JSON.stringify(state));
    }

    function loadGameState() {
        const state = JSON.parse(localStorage.getItem('gameState'));
        if (state) {
            playerName = state.name;
            score = state.score;
        }
    }

    function endGame() {
        // 10秒後に画面遷移を行う
        setTimeout(() => {
            window.location.href = '/game_end';
        }, 10000); // 10000ミリ秒 = 10秒
    }
    
    // タイマーを描画する関数
    function drawTimer() {
        // 残り時間を分と秒に変換
        const minutes = Math.floor(GAMETIME / 60);
        const seconds = GAMETIME % 60;
    
        // 残り時間のテキストを設定
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
        // テキストのスタイル設定
        ctx.fillStyle = '#ff0000'; // テキストの色
        ctx.font = "bold 30px 'Segoe Print', sans-serif"; // フォントスタイル
        ctx.textAlign = "center"; // テキストを中央揃え
    
        // 残り時間をcanvasに描画
        ctx.fillText(timeString, (canvas.width * 5) / 6, 30); // テキストを描画
    }

    function drawEndGame(){
        // テキストのスタイル設定
        ctx.fillStyle = '#ff0000'; // テキストの色
        ctx.font = "bold 50px 'Segoe Print', sans-serif"; // フォントスタイル
        ctx.textAlign = "center"; // テキストを中央揃え
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1;
    
        // canvasに描画
        ctx.fillText('FINISH', canvas.width / 2, canvas.height / 2); // テキストを描画
        ctx.strokeText('FINISH', canvas.width / 2, canvas.height / 2); // テキストを描画

        // テキストのスタイル設定
        ctx.font = "bold 25px 'Segoe Print', sans-serif"; // フォントスタイル
    
        // canvasに描画
        ctx.fillText('10秒後にスコア画面に移ります.', canvas.width / 2, canvas.height * 3 / 4, canvas.width - 10); // テキストを描画

        // テキストのスタイル設定
        ctx.font = "bold 20px 'Segoe Print', sans-serif"; // フォントスタイル

         // canvasに描画
        ctx.fillText('After 10 seconds, move to the score screen', canvas.width / 2, canvas.height * 3 / 4 + 30, canvas.width- 10); // テキストを描画
    }

    // お邪魔系を消した際にサーバーに通知
    function sendObstacleSignal() {
        console.log(playerName);
        fetch('/obstacle-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name: playerName}),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            // alert(data.message); 
        })
        .catch((error) => {
            console.error('Error:', error);
        });        
    }

    // ユーザーがおじゃまアイテムを削除したかをサーバーから受信
    function getObstacle() {
        setInterval(() => {
            fetch('/item_removed', {
                method: 'GET',
            })
            .then(response => response.json())
            .then(data => {
                if (data.name) {
                    console.log('User name of hindering:', data.name);
                    // おじゃまアイテムを消したユーザー名を格納
                    hinderingPlayerName = data.name;
                    // 妨害開始
                    startObstacle();
                }
                else {
                    console.log('No user name of hindering');
                }
            })
            .catch(error => console.error('Polling error:', error));
        }, 5000); // 5秒ごとにポーリング
    }

    // お邪魔攻撃を開始する
    function startObstacle(){
        // 開始時間を記録
        obstacleStartTime = Date.now()
        // お邪魔攻撃を開始
        isObstacle = true;
        // ブロックの落ちる速度を上げる
        blockArray.map((v) => {
            v.speed = 1.0;
        })

        // 20秒後に元に戻す
        setTimeout(() => {
            // isObstacleをfalseに設定する
            isObstacle = false;
            // ブロックの落ちる速度を元に戻す
            blockArray.map((v) => {
                v.speed = 0.4;
            })
        }, 20000);

    }

    // お邪魔を描画する
    function drawObstacle(){

        // 現在の時間を取得
        const currentTime = Date.now();
        
        // 開始時間から経過した時間を計算（ミリ秒単位）
        const elapsedTime = currentTime - obstacleStartTime;

        // お邪魔の描画
        obstacleArray.map((v) => {
            v.update();
        })

        // 最初2秒間のみテキストを表示
        if(elapsedTime < 2000){ 
            // テキストのスタイル設定
            ctx.fillStyle = '#ff0000'; // テキストの色
            ctx.font = "bold 20px 'Segoe Print', sans-serif"; // フォントスタイル
            ctx.textAlign = "center"; // テキストを中央揃え
        
            // canvasに描画
            ctx.fillText('"'+hinderingPlayerName+'"さんがお邪魔ブロックを消しました．', canvas.width / 2, canvas.height / 3, CANVAS_WIDTH); // テキストを描画
        }   
    }
})();
