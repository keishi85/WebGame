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
        this.waitForQuiz = 0;  // クイズが出題されるいる間の待ち時間
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
            this.life = 0;
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
        // 画面に表示されていない場合はスキップ
        if(this.life === 0){return 0;}

        if(userAnswer === this.question.answer){
            // 再度待機時間を設定　
            this.waitTime = Math.random() * 5;  
            this.waitFrame = this.waitTime * 60; 

            // 正解した位置に応じてスコア計算
            let addScore = this.question.scoreCoefficient * (this.area - this.position.y);

            // 初期化
            this.initialize();

            // ライフはゼロにする
            this.life = 0;

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
        this.waitFrame = (this.waitTime + this.waitForQuiz) * 60; // 1秒あたり60フレームと仮定
        this.position.set(this.initialPosition.x, this.initialPosition.y);
        this.question = new Question();
    }
    /**
     * クイズが出題されている間の待ち時間を設定する
     */
    setWaitForQuiz(waitTime){
        this.waitForQuiz = waitTime;
    }
    /**
     * ライフを設定する
     */
    setLife(life){
        this.life = life;
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

/**
 * クイズの管理をするクラス
 */
class Quiz{
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する2Dコンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} width - 横幅
     * @param {number} height - 縦幅
     * @param {number} life - ライフ（生存フラグを兼ねる）
     * @param {number} area - 解答可能エリア
     * @param {Array<{ question: string, choices: string[], answer: string }>} quizData - クイズの配列
     * @param {string} color - ブロックの色 
     */
    constructor(ctx, x, y, width, height, life, area, quizData, color = '#0000ff'){
        this.ctx = ctx;
        this.position = new Position(x, y);
        this.width = width;
        this.height = height
        this.life = life;
        this.area = area;
        this.color = color;
        this.speed = 0.5;
        this.quizData = quizData;
        // this.quizIndex = Math.floor(Math.random() * this.quizData.length);
        this.setChoicesPosition();
        this.waitTime = 1500;  // 0~5秒のランダムな待ち時間
        this.waitFrame = (this.waitTime + this.waitForQuiz) * 60; // 1秒あたり60フレームと仮定
    }
     /**
     * ブロックを描画する
     */
     draw(){      
        // 円の色を設定する
        this.ctx.fillStyle = this.color;
        // 矩形を描画
        this.ctx.fillRect(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
         
        // 問題のフォントを設定
        this.ctx.fillStyle = '#ffffff'
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = "center";

        let quiz = this.quizData;
        // let lines = [
        //     quiz.question,
        //     `1: ${quiz.choices[0]}`,
        //     `2: ${quiz.choices[1]}`,
        //     `3: ${quiz.choices[2]}`,
        //     `4: ${quiz.choices[3]}`
        // ];
    
        // let lineHeight = 15; // ラインの高さ
        let x = this.position.x;
        let y = this.position.y + 5;
        // lines.forEach(line => {
        //     this.ctx.fillText(line, x, y);
        //     y += lineHeight; // 次の行に移動
        // });

        this.ctx.fillText(quiz.question, x, y);      
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

        // 解答可能エリア外に移動したらライフ0
        if(this.position.y + this.height / 2 > this.area){
            this.life = 0;
        }

        this.draw();
        this.drawChoices();
    }

    /**
     * 入力された解答をチェックする
     * @param {number} userAnswer 
     * @return {number} 
     */
    checkAnswer(userAnswer){
        if(userAnswer === this.quizData.answer){

            // 正解した位置に応じてスコア計算
            let addScore = this.question.scoreCoefficient * (this.area - this.position.y);

            // 選択を解除
            this.selected = false;
            console.log('OK');
            return  addScore;
        } else {
            console.log('not OK');
            return 0;
        }
    }

    // クイズをセットする
    setQUiz(){
        // this.quizIndex = Math.floor(Math.random() * this.quizData.length);
        // this.quizIndex = 0;
    }

    /**
     * 選択肢の座標を初期化
     */
    setChoicesPosition(){
        // 4つの選択肢の矩形の左上の座標
        let position = [[30, 420], [210, 420], [30, 510], [210, 510]];

        // 4つの選択肢の座標を格納する配列
        this.choicesPosition = [];
        for(let i = 0; i < 4; i++){
            this.choicesPosition[i] = new Position(position[i][0], position[i][1]);
            // console.log(this.choicesPosition[i].x, this.choicesPosition[i].y);
        }
        
        // 4つの選択肢の矩形サイズ
        this.choicesWidth = 160;
        this.choicesHeight = 80;
    }

    /**
     * 下の回答エリアの選択肢の描画
     */
    drawChoices(){

        for(let i = 0; i < 4; ++i){
            // 矩形を描画
            this.ctx.fillStyle = '#ffffff';
            
            this.ctx.fillRect(this.choicesPosition[i].x, this.choicesPosition[i].y, this.choicesWidth, this.choicesHeight);
            
            // 選択肢を描画
            this.ctx.fillStyle = '#000000'
            this.ctx.font = '15px Arial';
            this.ctx.textAlign = "center";
            let x = this.choicesPosition[i].x + this.choicesWidth / 2;
            let y = this.choicesPosition[i].y + this.choicesHeight / 2;
            this.ctx.fillText(this.quizData.choices[i], x ,y);
        }
    }

    checkAnswer(userAnswer){
        // 画面に表示されていない場合はスキップ
        if(this.life === 0){return 0;}

        let quiz = this.quizData;

        if(quiz.choices[userAnswer] === quiz.answer){

            // スコア計算(仮に1000点)
            let addScore = 1000;

            console.log('OK');

            this.life = 0;
            return  addScore;
        } else {
            console.log('not OK');
            return 0;
        }
    }

}