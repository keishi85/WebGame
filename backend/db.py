from pymongo import MongoClient

host_name = "mongo"       # コンテナ名を指定
port_num  = 27017
user_name = "py_user"     # 作成ユーザーの名前
user_pwd  = "py_pwd"      # 作成ユーザーのパスワード
db_name   = "sample-db"   # 対象データベース

# スーパーユーザーでアクセス
client = MongoClient(
    host = host_name,
    port = port_num,
    username = "root",      # ここがポイント1個目!
    password = "password",
)

# 「sample-db」データベースにユーザーを追加
db = client[db_name]
db.command(                 # ここがポイント2個目!
  'createUser', 
  user_name,
  pwd=user_pwd,
  roles=['readWrite'],
)

# user確認
for user in db.command('usersInfo').get('users'):
    print(user)

client.close()
