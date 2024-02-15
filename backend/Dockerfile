# pythonのバージョンは任意
FROM python:3.8

WORKDIR /usr/src/backend

# "app"を指定することで，flask runでアプリケーションを起動できる(app.py or app directory)
ENV FLASK_APP=app   
# コンテナ内のすべてのネットワークインターフェースからの接続を受け付ける
ENV FLASK_RUN_HOST=0.0.0.0

COPY .  /usr/src/backend/

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# docker-composeでCMDが指定されている場合，以下は実行されない
CMD ["flask", "run", "--host=0.0.0.0"]