#!/bin/sh
# start.sh
pip install --upgrade pip
pip install -r requirements.txt
python db.py
flask run --host=0.0.0.0
