import random

RATE_OF_LEVEL5 = 0.05 # お邪魔の出現率
RATE_OF_PEACH = 0.3 # ピーチの出現率
total_iterations = 100  # 繰り返し回数
executions_needed_level5 = int(total_iterations * RATE_OF_LEVEL5)
executions_needed_peach = int(total_iterations * RATE_OF_PEACH)
LEVEL5 = 'OBSTACLE'
LEVEL4 = 'PEACH'
LEVEL3 = 'APPLE'
LEVEL2 = 'ORANGE'
LEVEL1 = 'LEMON'

# テキストファイルに書き込む関数
def generate_calculation_problems(filename, num_problems=total_iterations, level=LEVEL1):
    executions_done_peach = 0 
    executions_done_level5 = 0 # 実行済みのカウント

    with open(filename, "w") as file:
        for _ in (range(num_problems)):
            # 2桁の足し算，引き算
            level = LEVEL2
            num1 = random.randint(10, 99)
            num2 = random.randint(10, 99)
            operation = random.choice(["+", "-"])
            if operation == "+":
                result = num1 + num2
            else:
                result = num1 - num2
            file.write(f"{num1}{operation}{num2},{result},{level}\n")

            # 2桁*1桁
            level = LEVEL1
            num1 = random.randint(10, 99)
            num2 = random.randint(1, 9)
            result = num1 * num2
            file.write(f"{num1}×{num2},{result},{level}\n")

            # 2桁+1桁+2桁
            level = LEVEL3
            num1 = random.randint(10, 99)
            num2 = random.randint(5, 10)
            num3 = random.randint(10, 99)
            operation = random.choice(["+", "-"])
            operation2 = random.choice(["+", "-"])
            if operation == "+":
                if operation2 == "+":
                    result = num1 + num2 + num3
                else:
                    result = num1 + num2 - num3
            else:
                if operation2 == "+":
                    result = num1 - num2 + num3
                else:
                    result = num1 - num2 - num3
            file.write(f"{num1}{operation}{num2}{operation2}{num3},{result},{level}\n")

            # 2桁*1桁
            if random.random() < RATE_OF_PEACH and executions_done_peach < executions_needed_peach:
                level = LEVEL4
                num1 = random.randint(10, 99)
                num2 = random.randint(20, 99)
                result = num1 * num2
                file.write(f"{num1}×{num2},{result},{level}\n")
                executions_done_peach += 1

            # お邪魔の生成
            if random.random() < RATE_OF_LEVEL5 and executions_done_level5 < executions_needed_level5:
                level = LEVEL5
                num1 = random.randint(10, 99)
                num2 = random.randint(10, 99)
                operation = random.choice(["+", "-"])
                if operation == "+":
                    result = num1 + num2
                else:
                    result = num1 - num2
                file.write(f"{num1}{operation}{num2},{result},{level}\n")
                executions_done_level5 += 1
            

def main():
    filename = "calculationProblems.txt"
    generate_calculation_problems(filename) 

if __name__ == "__main__":
    main()
