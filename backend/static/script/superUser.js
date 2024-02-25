(() => {
    /**
     * ゲームスタート画面が完了したときに発火する load イベント
     */
    document.addEventListener('DOMContentLoaded', () => {
        const sendButton = document.getElementById('send');
        
        sendButton.addEventListener('click', async () => {
            try {
                await signalGameStart(); // 参加人数をサーバーに送信

                toggleLoadingIndicator(true); // 待機する表示
            } catch (error) {
                console.error('An error occurred:', error);
                alert('Failed to start the game. Please try again later.');
            }
            });
        document.getElementById('deleteDb').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete all scores? This action cannot be undone.')) {
                fetch('/delete_all_scores', {
                    method: 'POST',
                })
                .then(response => response.json())
                .then(data => alert(data.message))
                .catch(error => console.error('Error:', error));
            }
        });
    });

    async function signalGameStart() {
        fetch('/signal_game_start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            // ゲームが開始されたことを示す処理（例：ローディング表示の終了）
            toggleLoadingIndicator(false); // 完了したことを表示
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // 人数が送信できたことを表示関数
    function toggleLoadingIndicator(show) {
        const loadingElement = document.getElementById('completeSending');
        if (show) {
            loadingElement.style.display = 'block'; // 通信中に表示
        } else {
            loadingElement.style.display = 'none'; // 通信終了後に非表示
        }
    }
})();