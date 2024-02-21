from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from flask_pymongo import PyMongo


app = Flask(__name__)

# MongoDBへの接続設定
app.config["MONGO_URI"] = "mongodb://py_user:py_pwd@mongo:27017/question-db"
mongo = PyMongo(app)

# ゲーム開始ボタンのエンドポイント
@app.route('/')
def start():
    return render_template('start.html')

# DBから問題を取得 + ゲームの開始
@app.route('/game')
def index():
    # MongoDBのコレクションを参照
    questions_collection = mongo.db.questions
    questions = list(questions_collection.find({}, {'_id': 0}))
    # HTMLテンプレートにデータベースのデータを渡してレンダリング
    return render_template('index.html', questions=questions)

@app.route('/submit_score', methods=['POST'])
def submit_score():
    data = request.get_json()
    name = data.get('name')
    score = data.get('score')
    
    if not name or score is None:
        return jsonify({"error": "Name and score are required"}), 400

    # 名前で検索して該当するものがあれば得点を上書き、なければ新規に挿入
    mongo.db.scores.update_one(
        {'name': name},
        {'$set': {'score': score}},
        upsert=True
    )
    
    return jsonify({"message": "Score submitted successfully"}), 200

@app.route('/get_scores', methods=['GET'])
def get_scores():
    player_name = request.args.get('name')  # クエリパラメータからプレイヤー名を取得
    # スコアが高い順にソートして全プレイヤーを取得
    all_scores = mongo.db.scores.find({}, {'_id': 0}).sort('score', -1)
    all_scores_list = list(all_scores)

    # 上位3人のプレイヤーと指定されたプレイヤーの情報を含むリストを作成
    result_list = []
    player_included = False
    for rank, player in enumerate(all_scores_list, start=1):
        # 上位3人のプレイヤーを追加
        if rank <= 3:
            player['rank'] = rank
            result_list.append(player)
            if player['name'] == player_name:
                player_included = True
        # 指定されたプレイヤーがトップ3にいない場合、そのプレイヤーの情報も追加
        elif player['name'] == player_name and not player_included:
            player['rank'] = rank
            result_list.append(player)
            break  # 指定されたプレイヤーの情報を追加したらループを終了

    return jsonify(result_list)

# 参加人数を送信するエンドポイント
@app.route('/get_user_count', methods=['GET'])
def get_user_count():
    # ユーザーの人数をカウント
    user_count = mongo.db.scores.count_documents({})
    
    # 人数をJSON形式で返す
    return jsonify({'user_count': user_count})



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)