
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
            x = event.pageX - canvas.offsetLeft;
            y = event.pageY - canvas.offsetTop;
        }
        else if(event.type === 'touchstart'){
            let touch = event.touches[0];
            x = touch.pageX - canvas.offsetLeft;
            y = touch.pageY - canvas.offsetTop;
        }

        // if(x > 0 && x < CANVAS_WIDTH && y > 0 && y < CANVAS_HEIGHT - KEYPAD_HEIGHT){

        // }
        // else if(x > 0 && x < CANVAS_WIDTH && y > CANVAS_HEIGHT - KEYPAD_HEIGHT && y < CANVAS_HEIGHT){

        // }
    }

    // /**
    //  * 
    //  * @param {number} x - クリックされたX座標 
    //  * @param {number} y - クリックされたY座標
    //  */
    // function ClickQuestionArea(x,y){

    // }

    // function ClickKyeArea(x,y){

    // }
})();
