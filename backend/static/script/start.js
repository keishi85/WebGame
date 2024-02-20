(() => {
    const IMAGE_PATH = ["../images/apple.png", "../images/lemon.png", "../images/orange.png", "../images/peach.png"]
    // 落下する画像オブジェクトの配列
    const fallingImages = [];

    let canvas = null;
    let ctx = null;

    /**
     * ゲームスタート画面が完了したときに発火する load イベント
     */
    document.addEventListener('DOMContentLoaded', () => {
        const nameInput = document.getElementById('name');
        const startGameButton = document.getElementById('startGame');

        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');

        createFallingImage(100, 0, 2); // 画像オブジェクトの生成
        updateAndDrawImages(); // 画像を更新して描画

    
        startGameButton.addEventListener('click', () => {
            const name = nameInput.value.trim(); // 名前入力の前後の空白を削除
    
            if (name === '') {
                // 名前が入力されていない場合は警告を表示
                alert('Please enter your name.');
            } else {
                // 名前をローカルストレージに保存
                localStorage.setItem('playerName', name);
    
                // ゲームのページに遷移
                window.location.href = '/game';
            }
        });
    });

    // 画像オブジェクトの生成
    function createFallingImage(x, y, speed) {
        for(let i = 0; i < IMAGE_PATH.length; i++){
            const image = new Image();
            image.src = IMAGE_PATH[i];
            let addSpeed = Math.random() * 2;
            fallingImages.push({ image: image, x: x, y: y, speed: speed + addSpeed });
        }
    }
    // 画像オブジェクトの位置を更新して描画
    function updateAndDrawImages() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvasをクリア

        fallingImages.forEach(obj => {
            obj.y += obj.speed; // Y座標を更新
            if (obj.y > canvas.height) {
                obj.y = -obj.image.height; // 画像が下端に達したら上に戻す
            }
            ctx.drawImage(obj.image, obj.x, obj.y); // 画像を描画
        });

        requestAnimationFrame(updateAndDrawImages); // 次のフレームをリクエスト
    }

})();