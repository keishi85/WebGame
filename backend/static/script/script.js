
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
    let score = 0;   
    /**
     * プレイヤーの名前を格納する変数
     * @type {string}
     */
    let playerName = localStorage.getItem('playerName')
    /**
     * DBから取得した問題を管理する変数
     * @type {Array<{ question: string, choices: string[], answer: string }>}
     */
    const questionsData = [];

    /**
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
        // 描画処理を行う
        render();

        // クリックイベントとタッチイベントを追加
        canvas.addEventListener('click', ClickOrTouch);
        canvas.addEventListener('touchstart', ClickOrTouch);
        document.addEventListener('DOMContentLoaded', getDB);


    }, false);

    /**
     * canvas やコンテキストを初期化する
     */
    function initialize(){
        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // ブロックを初期化する(life = 0 で初期化)
        for(let i = 0; i < BLOCK_MAX_COUNT; ++i){
            blockArray[i] = new Block(ctx, 75 + 125 * i, -50, 50, 1, canvas.height - KEYPAD_HEIGHT);
        }

        // 数字キーの初期化
        initializeNumberKey();

        getDB();
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // 描画前に画面全体を白で塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#ffffff');
        // 数字キーのエリアの描画
        util.drawRect(0, canvas.height - KEYPAD_HEIGHT, canvas.width, KEYPAD_HEIGHT, '#ff0000');
        // ブロックの更新
        blockArray.map((v) => {
            v.update();
        });
        // 数字キーの更新
        numberKeyArray.map((v) => {
            v.update();
        });
        // 入力された数字の更新
        drawInputNumber();
        // スコアの更新
        drawScore();
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
        else if(event.type === 'touchstart'){
            // タッチの時
            let touch = event.touches[0];
            x = touch.pageX - canvas.offsetLeft;
            y = touch.pageY - canvas.offsetTop;
        }

        if(x > 0 && x < CANVAS_WIDTH && y > 0 && y < CANVAS_HEIGHT - KEYPAD_HEIGHT){
            // クリックしたエリアが，上の解答可能エリアの時
            ClickQuestionArea(x, y);
        }
        else if(x > 0 && x < CANVAS_WIDTH && y > CANVAS_HEIGHT - KEYPAD_HEIGHT && y < CANVAS_HEIGHT){
            // クリックしたエリアが，下の数字キーのエリアの時
            ClickKyeArea(x, y);
        }
    }

    /**
     * 上の解答可能エリアをクリックした時の判定
     * @param {number} x - クリックされたX座標 
     * @param {number} y - クリックされたY座標
     */
    function ClickQuestionArea(x,y){
        // クリックした位置がブロックの円の中にあるかどうかの判定
        for(let i = 0; i < blockArray.length; ++i){
            // 円の中心とクリック座標の距離を計算
            let distance = Math.sqrt((x - blockArray[i].position.x) ** 2 + (y - blockArray[i].position.y) ** 2);
            // 距離が半径より小さいかどうか判定．1つ見つけたらループを抜ける
            if(distance <= blockArray[i].radius){
                blockArray.map((v) => {
                    v.selected = false;
                })
                // 選択中のブロックに設定する
                blockArray[i].selected = true;
                console.log(blockArray[i].question.answer);
                break;
            }
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
                // 数字キーの種類によって判断する
                let type = numberKeyArray[i].type
                switch (type) {
                    case 'enter':
                        if (inputNumber !== null) {
                            // 解答を数値に変換
                            let userAnswer = Number(inputNumber);
                            // 選択中のブロックの解答をチェックする
                            blockArray.map((v) => {
                                if(v.selected === true){
                                    score += v.checkAnswer(userAnswer);
                                    // 正解した場合，DBに反映
                                    // DBから各プレイヤーの名前とスコアを取得
                                    sendScore(playerName, score).then(() => {
                                        getScores();
                                    });
                                }
                            })
                            console.log(type, userAnswer);
                            // 解答の入力をnullに戻す
                            inputNumber = null;
                        }
                        console.log(type, inputNumber);
                        break;
                    case 'C':
                        // 解答の入力をnullに戻す
                        inputNumber = null;
                        console.log(type, inputNumber);
                        break;
                    case '-':
                        // 解答が未入力の時，先頭にマイナスをつける
                        if (inputNumber === null) {
                            inputNumber = type;
                        }
                        console.log(type, inputNumber);
                        break;
                    case '.':
                        if (inputNumber === null) {
                            // 解答が未入力の時，0と小数点を追加
                            inputNumber = "0" + type;
                        } else {
                            // 解答が入力済みの時，最後尾に小数点を追加
                            inputNumber += type;
                        }
                        console.log(type, inputNumber);
                        break;
                    default:
                        if (inputNumber === null || inputNumber === '0') {
                            // 解答が未入力の時と0の時は，入力された数字に更新
                            inputNumber = type;
                        } else {
                            // 解答が入力されている時は，最後尾に追加
                            inputNumber += type;
                        }
                        console.log(type, inputNumber);
                }
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
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.textAlign = "center";
        ctx.fillText(`${inputNumber}`,200, 390); 
    }

    /**
     * スコアの描画をする
     */
    function drawScore(){
        // テキストの描画
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.textAlign = "left";
        ctx.fillText(`SCORE:${score}`,50, 390); 
    }

    /**
     * DBから問題を取得
     */
    function getDB(){
        const questionsContainer = document.getElementById('questions-container');
        // データ属性からquestionsデータを取得
        const questionsData = JSON.parse(questionsContainer.getAttribute('data-questions'));

        // 取得したデータを使用してDOMを更新
        questionsData.forEach((item, index) => {

            console.log(`問題 ${index + 1}: ${item.question}, 選択肢1: ${item.choice1}, 選択肢2: ${item.choice2}, 選択肢3: ${item.choice3}, 選択肢4: ${item.choice4}, 答え: ${item.answer}`);

             // 選択肢を配列にまとめる
            let choices = [item.choice1, item.choice2, item.choice3, item.choice4];
            
            // 問題オブジェクトを作成して配列に追加する
            let questionObject = {
                question: item.question,
                choices: choices,
                answer: item.answer
            };
            questionsData.push(questionObject);
        });
    }

    /**
     * プレイヤーの得点をサーバーに送信する関数
     * @param {string} playerName 
     * @param {num} score 
     */
    function sendScore(playerName, score) {
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
            console.log('Success:', data);
            return data; // ここでPromiseを解決
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    /**
     * DBから各プレイヤーの名前とスコアを取得
     */
    function getScores() {
        // スコア情報を取得してコンソールに表示
        fetch('/get_scores')
            .then(response => response.json())
            .then(data => {
                console.log(data);  // データをコンソールに表示
                
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
})();
