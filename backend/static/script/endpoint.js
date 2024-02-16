fetch('/get_questions') // サーバーから問題を取得するエンドポイント
    .then(response => response.json())
    .then(data => {
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = ''; // コンテンツをクリア
        // JSONデータを文字列に変換してコンソールに表示
        console.log(JSON.stringify(data, null, 2));
        data.forEach((item, index) => {
            console.log(`問題 ${index + 1}: ${item.question}, 答え: ${item.answer}`); // 各問題と答えをコンソールに表示
            const questionElement = document.createElement('div');
            questionElement.innerHTML = `<strong>問題 ${index + 1}:</strong> ${item.question}<br><strong>答え:</strong> ${item.answer}`;
            contentDiv.appendChild(questionElement);
        });
    })
    .catch(error => {
        console.error('問題の取得中にエラーが発生しました:', error);
    });
