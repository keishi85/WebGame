# スキルゼミWebゲーム開発
## 計算ゲーム

### 実行方法(ローカルホスト)
* ドッカーを立ち上げる．  
  $ docker-compose up -d
* ブラウザで，ポート番号5001にアクセスする．  
  http://localhost:5001

### ゲームの開始方法(ローカルホスト)
* 参加者
  ポート番号5001にアクセスし，名前を入力しゲーム開始をクリックし，待機する．  
  http://localhost:5001

* ホスト
  スパーユーザーのurlにアクセスする．参加者が集まったら，「ゲーム開始」をクリック．  
  http://localhost:5001/superuser

  注意：連続でゲームを行うときは，「DBの削除」，「ゲームが始まらないように設定」をクリックする．
