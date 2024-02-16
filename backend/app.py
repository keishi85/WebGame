from flask import Flask, render_template, jsonify
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


# DBから問題を取得するエンドポイント
@app.route('/get_questions')
def get_questions():
    # MongoDBのコレクションを参照
    questions_collection = mongo.db.questions
    get_questions = list(questions_collection.find({}, {'_id': 0}))
    return jsonify(get_questions)

# 問題を表示させるHTMLを返すエンドポイント
@app.route('/questions')
def questions():
    return render_template('question.html')


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)