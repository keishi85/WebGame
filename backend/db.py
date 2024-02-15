from pymongo import MongoClient, errors

QUESTION_FILE_PATH = "questions.txt"

def main():
  host_name = "mongo"       # コンテナ名を指定
  port_num  = 27017
  user_name = "py_user"     # 作成ユーザーの名前
  user_pwd  = "py_pwd"      # 作成ユーザーのパスワード
  db_name   = "question-db"   # 対象データベース

  # スーパーユーザーでアクセス
  client = MongoClient(
      host = host_name,
      port = port_num,
      username = "root",      # ここがポイント1個目!
      password = "password",
  )

  db = client[db_name]

  try:
      # ユーザーを作成
      db.command(
          'createUser', 
          user_name,
          pwd=user_pwd,
          roles=['readWrite'],
      )
      print(f"User {user_name} created.")
  except errors.OperationFailure as e:
      # ユーザーが既に存在する場合のエラーをキャッチ
      print(e)
  
  questions_collection = db["questions"]
  
  # テキストファイルから問題を読み込む + DBに追加
  with open(QUESTION_FILE_PATH, "r") as f:
    for line in f:
      question, answer = line.strip().split(",")
      add_question(questions_collection, question, answer)
      print(f"Added: {question} -> {answer}")


# 問題を追加する関数
def add_question(questions_collection, question, answer):
    questions_collection.insert_one({'question': question, 'answer': answer})

if __name__ == "__main__":
    main()
