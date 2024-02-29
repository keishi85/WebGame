from flask import Flask, render_template, jsonify, request
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, emit
from datetime import datetime, timedelta


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

# MongoDBへの接続設定
app.config["MONGO_URI"] = "mongodb://py_user:py_pwd@mongo:27017/question-db"
mongo = PyMongo(app)

user_count = 0
player_name = []
game_started = False    # ゲーム開始の状態を管理する変数
nameOfHinderingPlayer = None    # お邪魔アイテムを使ったプレイヤーの名前
isObstacleRemoved = False    # お邪魔アイテムが消されたかどうか
obstacle_removed_info = {"isRemoved": False, "name": None, "removalTime": None}  # おじゃまが削除されたことをトラックするための辞書を用意

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
        # 上位10人のプレイヤーを追加
        if rank <= 10:
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

# 参加したことを確認するエンドポイント
@app.route('/user_count', methods=['POST'])
def count_user():
    global player_name
    data = request.get_json()
    name = data.get('userName')
    if name not in player_name:
        player_name.append(name)

    global user_count
    user_count += 1
    return jsonify({'message': 'User count updated'})

@app.route('/check_game_start')
def check_game_start():
    if game_started:
        return jsonify({'game_started': True})
    else:
        return jsonify({'game_started': False})
    
# プレイヤーがお邪魔アイテムを消したことを通知するエンドポイント
@app.route('/obstacle-item', methods=['POST'])
def getObstacleDeleted():
    global obstacle_removed_info
    data = request.get_json()
    obstacle_removed_info["isRemoved"] = True
    obstacle_removed_info["name"] = data.get('name')
    obstacle_removed_info["removalTime"] = datetime.now()

    # 減点後の結果をクライアントに通知
    return jsonify({'message': f'{obstacle_removed_info["name"]} hindering'})

# おじゃまが消されたことを全ユーザに通知
@app.route('/item_removed', methods=['GET'])
def send_obstacle():
    if obstacle_removed_info["isRemoved"] and datetime.now() <= obstacle_removed_info["removalTime"] + timedelta(seconds=10):

        # おじゃまが削除された情報をクライアントに送信
        response = jsonify({'name': obstacle_removed_info["name"]})
        return response
    
    else:
        obstacle_removed_info["isRemoved"] = False
        obstacle_removed_info["name"] = None
        obstacle_removed_info["removalTime"] = None
        return jsonify({'message': 'No player has removed the obstacle'})

# ゲームが終了したタイミングで遷移
@app.route('/game_end')
def game_end():
    # ゲームをスタートしないように設定
    global game_started
    game_started = False

    # スコアが高い順にソートして全プレイヤーを取得
    all_scores = mongo.db.scores.find().sort('score', -1)
    return render_template('gameEnd.html', scores=all_scores)

# スーパーユーザーでアクセス
@app.route('/superuser')
def super_user():
    return render_template('superUser.html')

@app.route('/getUserInfo')
def get_user_info():
    return jsonify({'user_count': user_count, 'player_list': player_name})

# スーパーユーザーからゲームの開始を通知するエンドポイント
@app.route('/signal_game_start', methods=['POST'])
def signal_game_start():
    global game_started
    game_started = True
    return jsonify({'message': 'Game start signaled'})

# スーパーユーザーから全てのスコアを削除するエンドポイント
@app.route('/delete_all_scores', methods=['POST'])
def delete_all_scores():
    mongo.db.scores.delete_many({})
    return jsonify({'message': 'All scores have been successfully deleted.'})

# スーパーユーザからゲームのスタートをfalseにするエンドポイント
@app.route('/reset_game_start', methods=['POST'])
def reset_game_start():
    global game_started
    game_started = False
    return jsonify({'message': 'Game start has been reset.'})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
    # socketio.run(app, host="0.0.0.0", port=5001, debug=True)