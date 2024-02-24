(() => {
    /**
     * ゲームスタート画面が完了したときに発火する load イベント
     */
    document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send');
    
    sendButton.addEventListener('click', async () => {
        try {
            await submitUserCount(); // 参加人数をサーバーに送信

            toggleLoadingIndicator(true); // 待機する表示
        } catch (error) {
            console.error('An error occurred:', error);
            alert('Failed to start the game. Please try again later.');
        }
        });
    });

// ユーザー数をサーバーに送信する関数
async function submitUserCount() {
    const userCount = document.getElementById('userCount').value;
    fetch('/set_user_count', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({userCount: userCount}),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        toggleLoadingIndicator(true); // 完了したことを表示
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