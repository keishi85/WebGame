(() => {
    /**
     * ゲームスタート画面が完了したときに発火する load イベント
     */
    document.addEventListener('DOMContentLoaded', () => {
        const nameInput = document.getElementById('name');
        const startGameButton = document.getElementById('startGame');
    
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
})();