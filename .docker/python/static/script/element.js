/**
 * 座標を管理するためのクラス
 */
class Position {

    /**
     * @constructor
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     */
    constructor(x, y){
        this.x = x;
        this.y = y;  
    }

    /**
     * 値を設定する
     * @param {number} [x] - 設定する X 座標
     * @param {number} [y] - 設定する Y 座標
     */
    set(x, y){
        if(x != null){this.x = x;}
        if(y != null){this.y = y;}
    }
}

/**
 * 問題のブロックを管理するクラス
 */
class Block{
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する2Dコンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} radius - 半径
     * @param {number} life - ライフ（生存フラグを兼ねる）
     * @param {number} area - 解答可能エリア
     * @param {string} color - ブロックの色 
     * @param {Question} question - 計算問題を管理するクラス
     */
    constructor(ctx, x, y, radius, life, area, color = '#0000ff'){
        this.ctx = ctx;
        this.initialPosition = new Position(x, y); // 初期位置を記憶する
        this.position = new Position(x, y);
        this.radius = radius;
        this.life = life;
        this.area = area;
        this.color = color;
        this.speed = 0.5;
        this.question = new Question();
        this.waitTime = Math.random() * 5;  // 0~5秒のランダムな待ち時間
        this.waitFrame = this.waitTime * 60; // 1秒あたり60フレームと仮定
        this.selected = false;  // 選択されているかどうか
    }

    /**
     * ブロックを描画する
     */
    draw(){      
        // パスの設定を開始することを明示する
        this.ctx.beginPath();
        // 円のパスを設定する
        this.ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0.0,
            Math.PI * 2.0
        );
        // 円の色を設定する
        this.ctx.fillStyle = this.color;
        // パスを閉じることを明示する
        this.ctx.closePath();
        // 設定したパスで円の描画を行う
        this.ctx.fill();

        // 問題のフォントを設定
        this.ctx.fillStyle = this.question.color;
        this.ctx.font = this.question.font;
        this.ctx.textAlign = "center";
        // テキストを表示
        this.ctx.fillText(
            `${this.question.number1} ${this.question.operator} ${this.question.number2}`,
            this.position.x,
            this.position.y + 5  // 数字が円の中心にくるよう微調整
        ); 
    }

    /**
     * ブロックの位置の更新
     */
    update(){
        // ブロックのライフが0以下(非生存)の場合何もしない
        if(this.life <= 0){return;}

        // 待機時間を減らす
        if (this.waitFrame > 0) {
            this.waitFrame -= 1;
            return; // 待機時間中は以下の更新処理をスキップ
        }

        // 下に進める(y座標を進める)
        this.position.y += this.speed;

        // 解答可能エリア外に移動したら初期化を行う
        if(this.position.y + this.radius > this.area){
            this.initialize();
            this.selected = false;
        }

        // 円の描画
        this.draw();
        this.drawSelectedSignal();
    }

    /**
     * 入力された解答をチェックする
     * @param {number} userAnswer 
     * @return {number} 
     */
    checkAnswer(userAnswer){
        if(userAnswer === this.question.answer){
            // 再度待機時間を設定　
            this.waitTime = Math.random() * 5;  
            this.waitFrame = this.waitTime * 60; 

            // 正解した位置に応じてスコア計算
            let addScore = this.question.scoreCoefficient * (this.area - this.position.y);

            // 初期化
            this.initialize();

            // 選択を解除
            this.selected = false;
            console.log('OK');
            return  addScore;
        } else {
            console.log('not OK');
            return 0;
        }
    }

    /**
     * 選択されている時に円の枠線をつける
     */
    drawSelectedSignal(){
        if(this.selected === false){return;}

        // パスの設定を開始することを明示する
        this.ctx.beginPath();
        // 円のパスを設定する
        this.ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0.0,
            Math.PI * 2.0
        );
        // 円の色を設定する
        this.ctx.strokeStyle = '#000000';
        // 線の太さを設定
        this.ctx.lineWidth = 3;
        // パスを閉じることを明示する
        this.ctx.closePath();
        // 設定したパスで円の描画を行う
        this.ctx.stroke();
    }
    /**
     * 問題が回答された場合，もしくは回答できなかった場合に次の問題を設定する
     * 1.  wait timeを設定
     * 2. 問題を更新
     * 3. positionを初期位置に戻す
     */
    initialize(){
        this.waitTime = Math.random() * 5;  // 0~5秒のランダムな待ち時間
        this.waitFrame = this.waitTime * 60; // 1秒あたり60フレームと仮定
        this.position.set(this.initialPosition.x, this.initialPosition.y);
        this.question = new Question();
    }
}

/**
 * 計算問題を管理するクラス
 */
class Question {
    /**
     * @constructor
     * @param {string} color - 文字の色
     * @param {string} font - 文字のフォント
     */
    constructor(color = '#ffffff', font = '20px Arial') {
        this.operator = this.getRandomOperator();
        this.number1 = this.getRandomNumber();
        this.number2 = this.getRandomNumber();
        this.answer = this.calculateAnswer();
        this.color = color;
        this.font = font
        this.scoreCoefficient = 1;  // スコア計算の係数
    }

    /**
     * ランダムな四則演算子を返す
     * @returns {string} - 四則演算子
     */
    getRandomOperator() {
        const operators = ['+', '-', '×', '÷'];
        return operators[Math.floor(Math.random() * operators.length)];
    }

    /**
     * ランダムな2桁以内の数字を返す
     * @returns {number} - ランダムな数字
     */
    getRandomNumber() {
        return Math.floor(Math.random() * 90) + 10; // 10以上99以下の乱数を生成
    }

    /**
     * 与えられた演算子に基づいて計算結果を返す
     * @returns {number} - 計算結果
     */
    calculateAnswer() {
        let result;
        switch (this.operator) {
            case '+':
                result = this.number1 + this.number2;
                break;
            case '-':
                result = this.number1 - this.number2;
                break;
            case '×':
                result = this.number1 * this.number2;
                break;
            case '÷':
                // とりあえず切り捨ての結果
                result = Math.floor(this.number1 / this.number2);
                break;
            default:
                throw new Error("Invalid operator");
        }
        return result;
    }
}

/**
 * 数字キーを管理するクラス
 */
class NumberKey{
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する2Dコンテキスト
     * @param {string} type - キーのタイプ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} radiusX - 楕円の長辺半径
     * @param {number} radiusY - 楕円の短辺半径
     * @param {number} rotation - 楕円の回転角度(radian)
     * @param {string} color - 楕円の色
     * @param {string} fontColor - 文字の色
     * @param {string} font - 文字のフォント
     */
    constructor(ctx, type, x, y, radiusX, radiusY, rotation = 0.0, color = '#ffffff', fontColor = '#000000', font = '20px Arial') {
        this.ctx = ctx;
        this.type = type;
        this.position = new Position(x,y);
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.rotation = rotation;
        this.color = color;
        this.fontColor = fontColor;
        this.font = font;
    }

    /**
     * 数字キーの更新
     */
    update(){
        // パスの設定を開始することを明示する
        this.ctx.beginPath();
        // 楕円のパスを設定する
        this.ctx.ellipse(this.position.x, this.position.y, this.radiusX, this.radiusY, this.rotation, 0, 2 * Math.PI);
        //楕円の色を設定する
        this.ctx.fillStyle = this.color;
        // パスを閉じることを明示する
        this.ctx.closePath();
        // 設定したパスで楕円の描画を行う
        this.ctx.fill();

        // 数字のフォントを設定
        this.ctx.fillStyle = this.fontColor;
        this.ctx.font = this.font;
        this.ctx.textAlign = "center";
        //　テキストを表示
        this.ctx.fillText(
            `${this.type}`,
            this.position.x,
            this.position.y + 5  // 数字が円の中心にくるよう微調整
        ); 
    }
}