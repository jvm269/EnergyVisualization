import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import Column, Integer, String, Float

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

# connect to database
user = "yivdjuulemdtru"
password = "cbd45f4d2557f843be4837e5a1f0cb8fcd25bf32cccd3a2485f6b976a13098b2"
host = "ec2-75-101-131-79.compute-1.amazonaws.com"
port = "5432"
database = "dfhfgcedpvfcco"
rds_connection_string = f"{user}:{password}@{host}:{port}/{database}"
engine = create_engine(f'postgresql://{rds_connection_string}')

Base = declarative_base()

class Energy(Base):
    __tablename__ = "energy"
    _id = Column(Integer, primary_key = True)
    category = Column(String(255))
    commodity_transaction= Column(String(255))
    country_or_area = Column(String(255))
    quantity = Column(Float)
    unit = Column(String(255))
    year = Column(String(255))

Base.metadata.create_all(engine)

session = Session(bind=engine)

app = Flask(__name__)

@app.route("/")
def index():
   return render_template("index.html")

@app.route("/names")
def sample_metadata():
   sel = [
      Energy._id,
      Energy.category,
      Energy.commodity_transaction,
      Energy.country_or_area,
      Energy.quantity,
      Energy.unit,
      Energy.year
   ]
   results = session.query(*sel).all()

   return jsonify(results)

if __name__ == "__main__":
   app.run(debug=True)