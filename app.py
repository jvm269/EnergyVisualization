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
   print("testing")
   return render_template("index.html")

@app.route("/country")
def country():
   countries = session.query(Energy.country_or_area).all()
   c = []
   for country in countries:
      if country[0] not in c:
         c.append(country[0])

   c.sort()
   
   return jsonify(c)

@app.route("/metadata")
def metadata():
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

   metadata = {}

   for result in results:
      metadata["id"] = result[0]
      metadata["category"] = result[1]
      metadata["commodity_transaction"] = result[2]
      metadata["country_or_area"] = result[3]
      metadata["quantity"] = result[4]
      metadata["unit"] = result[5]
      metadata["year"] = result[6]

   return jsonify(metadata)

if __name__ == "__main__":
   app.run()