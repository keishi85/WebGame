from pymongo import MongoClient, errors

CALCULATION_PROBLEM_FILE_PATH = "calculationProblem.txt"
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
      question, choice1, choice2, choice3, choice4, answer = line.strip().split(",")
      add_question(questions_collection, question, choice1, choice2, choice3, choice4, answer)
      # print(f"Added: {question} -> {choice1} -> {choice2} -> {choice3} -> {choice4} -> {answer}")

  # テキストファイルから計算問題を読み込む + DBに追加
  with open(CALCULATION_PROBLEM_FILE_PATH, "r") as f_calc:
    for line in f_calc:
      problem, answer, fruit = line.strip().split(",")
      add_calculation_problem(questions_collection, problem, answer, fruit)
      # print(f"Added calculation problem: {problem} -> {answer}")


# クイズの問題を追加する関数
def add_question(questions_collection, question, choice1, choice2, choice3, choice4, answer):
    # データベース内で同じ質問を検索
    if questions_collection.find_one({'question': question}) is None:
        # 同じ質問が存在しない場合は、新たに追加
        questions_collection.insert_one({'type': 'quiz', 'question': question, 'choice1': choice1, 'choice2': choice2, 'choice3': choice3, 'choice4': choice4, 'answer': answer})
        # print(f"Added: {question} -> {choice1} -> {choice2} -> {choice3} -> {choice4} -> {answer}")
    else:
       pass
        # 同じ質問が既に存在する場合は追加しない
        # print(f"Already exists: {question} -> {answer}")


# 計算問題を追加する関数
def add_calculation_problem(collection, problem, answer, fruit):
    # データベース内で同じ問題を検索
    if collection.find_one({'problem': problem}) is None:
        # 同じ問題が存在しない場合は、新たに追加
        collection.insert_one({'type': 'calculation', 'problem': problem, 'answer': answer, 'fruit': fruit})



if __name__ == "__main__":
    main()
