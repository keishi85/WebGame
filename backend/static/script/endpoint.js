fetch('/get_questions') // サーバーから問題を取得するエンドポイント
    .then(response => response.json())
    .then(data => {
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = ''; // コンテンツをクリア
        data.forEach((item, index) => {
            const questionElement = document.createElement('div');
            questionElement.innerHTML = `<strong>問題 ${index + 1}:</strong> ${item.question}<br><strong>答え:</strong> ${item.answer}`;
            contentDiv.appendChild(questionElement);
        });
    })
    .catch(error => {
        console.error('問題の取得中にエラーが発生しました:', error);
    });
