from flask import Flask, render_template, jsonify, request
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

user_count = 0
required_user_count = 0
# 必要人数がスーパーユーザによって設定されたかを管理する変数
is_user_count_set = False
# ゲーム開始の状態を管理する変数
game_started = False

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

# 参加人数を受け取るエンドポイント
@app.route('/set_user_count', methods=['POST'])
def set_user_count():
    global required_user_count
    global is_user_count_set

    data = request.get_json()
    required_user_count = int(data.get('userCount'))

    is_user_count_set = True

    # 全ユーザーが揃ったかどうかをチェック
    check_start_condition()
    return jsonify({'message': 'User count updated'})

# 参加したことを確認するエンドポイント
@app.route('/user_count', methods=['POST'])
def count_user():
    global user_count
    user_count += 1

    # ユーザー名を取得
    data = request.get_json()
    name = data.get('userName')

    # 全ユーザーが揃ったかどうかをチェック
    check_start_condition()
    return jsonify({'message': 'User count updated'})

@app.route('/check_game_start')
def check_game_start():
    # ゲームが開始されたかどうかを返す
    check_start_condition()
    global game_started
    if game_started:
        print(f"user : {user_count} / required : {required_user_count}")
        return jsonify({'game_started': True})
    else:
        return jsonify({'game_started': False})

# 人数があつまったかどうかをチェックする関数
def check_start_condition():
    global user_count
    if user_count >= required_user_count and is_user_count_set:
        # ゲーム開始の状態を更新
        global game_started
        game_started = True
        user_count = 0  # カウンターをリセット

# ゲームが終了したタイミングで遷移
@app.route('/game_end')
def game_end():
    # スコアが高い順にソートして全プレイヤーを取得
    all_scores = mongo.db.scores.find().sort('score', -1)
    return render_template('gameEnd.html', scores=all_scores)

# スーパーユーザーでアクセス
@app.route('/superuser')
def super_user():
    return render_template('superUser.html')


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
    # socketio.run(app, host="0.0.0.0", port=5001, debug=True)