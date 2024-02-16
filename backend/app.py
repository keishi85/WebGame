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

# プレイヤーの得点をDBから取得
@app.route('/get_scores', methods=['GET'])
def get_scores():
    scores = mongo.db.scores.find({}, {'_id': 0})  # '_id' フィールドを除外
    return jsonify(list(scores))



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)