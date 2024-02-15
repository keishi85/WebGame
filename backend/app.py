from flask import Flask, render_template
# from flask_pymongo import PyMongo

app = Flask(__name__)
# app.config["MONGO_URI"] = "ss2312-mongo-1://localhost:27017/myDatabase"
# mongo = PyMongo(app)

@app.route('/')
def index():
    return render_template('index.html')

# @app.route('/test_mongodb_connection')
# def test_mongodb_connection():
#     # データベースサーバーの情報を取得して接続テスト
#     server_info = mongo.db.command("serverStatus")
#     if server_info:
#         return "Successfully connected to MongoDB."
#     else:
#         return "Failed to connect to MongoDB."

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)