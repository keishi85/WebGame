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
    # スコアが高い順にソートして上位3人を取得
    top_scores = mongo.db.scores.find({}, {'_id': 0}).sort('score', -1).limit(3)
    top_scores_list = list(top_scores)

    # 指定されたプレイヤーのスコアを取得
    player_score = mongo.db.scores.find_one({'name': player_name}, {'_id': 0})

    # 指定されたプレイヤーがトップ3に入っていない場合、そのスコアを結果に追加
    if player_score and not any(player['name'] == player_name for player in top_scores_list):
        top_scores_list.append(player_score)

    return jsonify(top_scores_list)



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)