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
     * @param {Array<{ question: string, answer: string, fruit: fruit }>}
     * @param {Array[string]} imgPath - 画像ファイルパス
     * @param {string} color - ブロックの色 
     */
    constructor(ctx, x, y, radius, life, area, calcData, imgPath, color = '#0000ff'){
        this.ctx = ctx;
        this.initialPosition = new Position(x, y); // 初期位置を記憶する
        this.position = new Position(x, y);
        this.radius = radius;
        this.life = life;
        this.area = area;
        this.calcData = calcData;
        this.imgPath = imgPath
        this.color = color;
        this.speed = 0.4;
        //this.question = new Question();
        this.index = Math.floor(Math.random() * calcData.length); // 計算問題を格納する配列のインデックス
        this.waitTime = Math.random() * 5;  // 0~5秒のランダムな待ち時間
        this.waitFrame = this.waitTime * 60; // 1秒あたり60フレームと仮定
        this.waitForQuiz = 0;  // クイズが出題されるいる間の待ち時間
        this.imageArray = []; // Imageインスタンスを格納する配列
        // テキストのスタイル設定
        this.ctx.font = '20px Arial'; // フォントサイズとフォント種類
        this.ctx.fillStyle = '#ffffff'; // テキストの塗りつぶし色（白）
        this.ctx.strokeStyle = '#000000'; // テキストの枠線の色（黒）
        this.ctx.lineWidth = 3; // 枠線の太さ
    }

    /**
     * ブロックを描画する
     */
    draw(){      
        // 画像の読み込みが完了してなければ，描画しない
        this.imageArray.map((v) => {
            if(!v.imageLoaded) return;
        });

        // フルーツ(レベルによって)描画する画像を判断
        let fruit = this.calcData[this.index].fruit;
        switch(fruit){
            case 'PEACH':
                this.ctx.drawImage(this.imageArray[0],
                    this.position.x - this.radius,
                    this.position.y - this.radius,
                    this.radius * 2,
                    this.radius * 2
                    );
                break;
            
            case 'APPLE':
                this.ctx.drawImage(this.imageArray[1],
                    this.position.x - this.radius,
                    this.position.y - this.radius,
                    this.radius * 2,
                    this.radius * 2
                    );
                break;
            
            case 'ORANGE':
                this.ctx.drawImage(this.imageArray[2],
                    this.position.x - this.radius,
                    this.position.y - this.radius,
                    this.radius * 2,
                    this.radius * 2
                    );
                break;
            
            case 'LEMON':
                this.ctx.drawImage(this.imageArray[3],
                    this.position.x - this.radius,
                    this.position.y - this.radius,
                    this.radius * 2,
                    this.radius * 2
                    );
                break;
        }
            
        // 問題のフォントを設定
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = "center";
        // テキストを表示
        this.ctx.fillText(
            `${this.calcData[this.index].question}`,
            this.position.x,
            this.position.y + 10  // 数字が円の中心にくるよう微調整
        ); 
        
    }

    /**
     * ブロックの位置の更新
     */
    update(){
        // ブロックのライフが0以下(非生存)の場合何もしない
        if(this.life === 0){
            // 待機時間を減らす
            this.waitFrame -= 1;
            return;
        }

        // 下に進める(y座標を進める)
        this.position.y += this.speed;

        // 解答可能エリア外に移動したら初期化を行う
        if(this.position.y + this.radius > this.area){
            this.initialize();
            // this.selected = false;
            this.life = 0;
        }

        // 円の描画
        this.draw();
        // this.drawSelectedSignal();
    }

    /**
     * 入力された解答をチェックする
     * @param {number} userAnswer 
     * @return {number} 
     */
    checkAnswer(userAnswer){
        // 画面に表示されていない場合はスキップ
        if(this.life === 0){return 0;}

        if(userAnswer === Number(this.calcData[this.index].answer)){
            // 再度待機時間を設定
            this.waitTime = Math.random() * 5;  
            this.waitFrame = this.waitTime * 60; 

            // 正解した位置とフルーツ(レベル)に応じてスコア計算
            let fruit = this.calcData[this.index].fruit;
            console.log(fruit);
            let addScore = 0;
            switch(fruit){
                case 'PEACH':
                    addScore = (Math.floor(3 * (this.area - this.position.y) * 100) / 100).toFixed(1);
                    //addScore = Math.floor(3 * (this.area - this.position.y) * 100) / 100; // 小数点第2位で切り捨て
                    console.log(addScore);
                    break;
                
                case 'APPLE':
                    addScore = (Math.floor(3 * (this.area - this.position.y) * 100) / 100).toFixed(1);
                    //addScore = Math.floor(2 * (this.area - this.position.y) * 100) / 100;
                    console.log(addScore);
                    break;
                
                case 'ORANGE':
                    addScore = (Math.floor(3 * (this.area - this.position.y) * 100) / 100).toFixed(1);
                    //addScore = Math.floor(1 * (this.area - this.position.y) * 100) / 100;
                    console.log(addScore);
                    break;
                
                case 'LEMON':
                    addScore = (Math.floor(3 * (this.area - this.position.y) * 100) / 100).toFixed(1);
                    //addScore = Math.floor(0.5 * (this.area - this.position.y) * 100) / 100;
                    console.log(addScore);
                    break;
            }

            // 初期化
            this.initialize();

            // ライフはゼロにする
            this.life = 0;

            // // 選択を解除
            //this.selected = false;
            console.log('OK');
            return  Number(addScore);
        } else {
            console.log('not OK');
            return 0;
        }
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
        //this.question = new Question();
        this.index = Math.floor(Math.random() * this.calcData.length);
    }

    /**
     * ライフを1に設定する
     */
    resetLife(){
        if(this.waitFrame < 0){
            this.life = 1;
        }
    }

    // 画像の読み込みが完了したときに呼ばれるコールバック関数
    onImageLoad(){
        this.imageLoaded = true;
    }

    // 画像の読み込みが失敗したときに呼ばれるコールバック関数
    onImageError(){
        console.error("Failed to load image:", this.imageUrl);
    }

    // 画像の読み込み
    loadImage(){
        for(let i = 0; i< 4; i++){
            this.imageArray[i] = new Image();
            this.imageArray[i].onload = this.onImageLoad.bind(this);
            this.imageArray[i].onerror = this.onImageError.bind(this);
            this.imageArray[i].src = this.imgPath[i];

            // console.log(this.imageArray[i].src);
        }
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
    constructor(ctx, type, x, y, radiusX, radiusY, rotation = 0.0, color = '#32cd32', fontColor = '#000000', font = '20px Arial') {
        this.ctx = ctx;
        this.type = type;
        this.position = new Position(x,y);
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.rotation = rotation;
        this.color = color;
        this.fontColor = fontColor;
        this.font = font;
        this.isPressed =  false;
    }

    /**
     * 数字キーの更新
     */
    update(){

        // パスの設定を開始することを明示する
        this.ctx.beginPath();
        // 楕円のパスを設定する
        this.ctx.ellipse(this.position.x, this.position.y, this.radiusX, this.radiusY, this.rotation, 0, 2 * Math.PI);
        
        // 押された時
        if(this.isPressed){
            this.ctx.fillStyle = '#808080';
        } else {
            //楕円の色を設定する
            this.ctx.fillStyle = this.color;
        }

        // 枠線の色を設定する
        this.ctx.strokeStyle = '#ffffff';
        // 枠線の太さ
        this.ctx.lineWidth = 2;
        
        // パスを閉じることを明示する
        this.ctx.closePath();
        // 設定したパスで楕円の描画を行う
        this.ctx.fill();
        this.ctx.stroke();

        // 数字のフォントを設定
        this.ctx.fillStyle = this.fontColor;
        this.ctx.font = "bold 15px 'Segoe Print', san-serif";
        this.ctx.textAlign = "center";
        // テキストを表示
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
    constructor(ctx, x, y, width, height, life, area, quizData, imgPath, color = '#0000ff'){
        this.ctx = ctx;
        this.initialPosition = new Position(x, y); // 初期位置を記憶する
        this.position = new Position(x, y);
        this.width = width;
        this.height = height
        this.life = life;
        this.area = area;
        this.color = color;
        this.speed = 0.2;
        this.quizData = quizData;
        this.quizIndex = 0;
        this.imgPath = imgPath;
        this.setChoicesPosition();
        this.isPressed = [false, false, false, false];
    }
     /**
     * ブロックを描画する
     */
     draw(){      
        // 円の色を設定する
        this.ctx.fillStyle = this.color;
        // 矩形を描画
        //this.ctx.fillRect(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
        this.ctx.drawImage(this.img,
            this.position.x - this.width / 2,
            this.position.y - this.height / 2,
            this.width,
            this.height
            );
         
        // 問題のフォントを設定
        this.ctx.fillStyle = '#ffffff'
        this.ctx.font = "bold 15px 'Segoe Print', san-serif";
        this.ctx.textAlign = "center";

        let quiz = this.quizData[this.quizIndex];
        
        // 問題文を表示
        // let x = this.position.x;
        // let y = this.position.y + 5;
        // this.ctx.fillText(quiz.question, x, y, this.width - 10);

        let lines = this.breakLine(quiz.question, this.width * 2 / 3);
        for(let i = 0; i < lines.length; i++){
            this.ctx.fillText(lines[i], this.position.x, this.position.y - this.height / 5 + i * 15);
        }
    }

    /**
     * ブロックの位置の更新
     */
    update(){
        // ブロックのライフが0以下(非生存)の場合何もしない
        if(this.life === 0){return;}

        // 下に進める(y座標を進める)
        this.position.y += this.speed;

        // 解答可能エリア外に移動したらライフ0
        if(this.position.y + this.height / 2 > this.area){
            this.life = 0;
            // 次の問題にインデックスを移動
            this.quizIndex += 1;
            // 初期位置に移動
            this.position.set(this.initialPosition.x, this.initialPosition.y);

            return;
        }

        this.draw();
        this.drawChoices();
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
            // 矩形の色を設定
            this.ctx.fillStyle = '#32cd32';
            // 枠線の色を設定する
            this.ctx.strokeStyle = '#ffffff';
            // 枠線の太さ
            this.ctx.lineWidth = 2;
            // 矩形を描画
            this.ctx.fillRect(this.choicesPosition[i].x, this.choicesPosition[i].y, this.choicesWidth, this.choicesHeight);
            this.ctx.strokeRect(this.choicesPosition[i].x, this.choicesPosition[i].y, this.choicesWidth, this.choicesHeight);
            
            // 選択肢を描画
            this.ctx.fillStyle = '#000000'
            this.ctx.font = "bold 15px 'Segoe Print', san-serif";
            this.ctx.textAlign = "center";
            let x = this.choicesPosition[i].x + this.choicesWidth / 2;
            let y = this.choicesPosition[i].y + this.choicesHeight / 2;
            this.ctx.fillText(this.quizData[this.quizIndex].choices[i], x ,y);
        }
    }

    /**
     * 入力された解答をチェックする
     * @param {number} userAnswer 
     * @returns {number}
     */
    checkAnswer(userAnswer){
        // 画面に表示されていない場合はスキップ
        if(this.life === 0){return 0;}

        let quiz = this.quizData[this.quizIndex];

        if(quiz.choices[userAnswer] === quiz.answer){

            // スコア計算(仮に1000点)
            let addScore = 1000;

            console.log('OK');
            
            //ライフを0に
            this.life = 0;
            // 次の問題にインデックスを移動
            this.quizIndex += 1
            // 初期位置に移動
            this.position.set(this.initialPosition.x, this.initialPosition.y);

            return  addScore;
        } else {
            console.log('not OK');
            return 0;
        }
    }

    /**
     * 文字列を分割し，自動的に改行する
     * @param {string} text 
     * @param {number} maxWidth 
     * @returns 
     */
    breakLine(text, maxWidth){
        let words = text.split('');
        let lines = [];
        let currentLine = words[0];

        for(let i = 1; i < words.length; i++){
            let word = words[i];
            let width = this.ctx.measureText(currentLine + ' ' + word).width;
            if(width < maxWidth){
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    // 画像の読み込みが完了したときに呼ばれるコールバック関数
    onImageLoad(){
        this.imageLoaded = true;
    }

    // 画像の読み込みが失敗したときに呼ばれるコールバック関数
    onImageError(){
        console.error("Failed to load image:", this.imageUrl);
    }

    // 画像の読み込み
    loadImage(){
        this.img = new Image();
        this.img.onload = this.onImageLoad.bind(this);
        this.img.onerror = this.onImageError.bind(this);
        this.img.src = this.imgPath;
    }

    drawCircle() {
        // 円を描画
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    
        // // 1秒後に描画を消す
        // setTimeout(() => {
        //     clearCanvas();
        // }, 1000);
    }

    drawCross() {
        // バツを描画
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 50, canvas.height / 2 - 50);
        ctx.lineTo(canvas.width / 2 + 50, canvas.height / 2 + 50);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.moveTo(canvas.width / 2 + 50, canvas.height / 2 - 50);
        ctx.lineTo(canvas.width / 2 - 50, canvas.height / 2 + 50);
        ctx.stroke();
        ctx.closePath();
    
        // // 1秒後に描画を消す
        // setTimeout(() => {
        //     clearCanvas();
        // }, 1000);
    }

}