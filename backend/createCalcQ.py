import random

LEVEL4 = 'PEACH'
LEVEL3 = 'APPLE'
LEVEL2 = 'ORANGE'
LEVEL1 = 'LEMON'

# テキストファイルに書き込む関数
def generate_calculation_problems(filename, num_problems=50, level=LEVEL1):
    with open(filename, "w") as file:
        for _ in range(num_problems):
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
            level = LEVEL4
            num1 = random.randint(10, 99)
            num2 = random.randint(20, 99)
            result = num1 * num2
            file.write(f"{num1}×{num2},{result},{level}\n")

def main():
    filename = "calculationProblems.txt"
    generate_calculation_problems(filename, 20)  # 例として50問の計算問題を生成

if __name__ == "__main__":
    main()
