#!/bin/sh
# start.sh
pip install --upgrade pip
pip install -r requirements.txt
pip install --upgrade flask_socketio python-socketio python-engineio
python db.py
flask run --host=0.0.0.0
