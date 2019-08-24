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
   country_list = []
   for country in countries:
      if country[0] not in country_list:
         country_list.append(country[0])

   country_list.sort()
   return jsonify(country_list)

@app.route("/category")
def category():
   categories = session.query(Energy.category).all()
   category_list = []
   for category in categories:
      if category[0] not in category_list:
         category_list.append(category[0])

   category_list.sort()
   return jsonify(category_list)

@app.route("/year")
def year():
   years = session.query(Energy.year).all()
   year_list = []
   for year in years:
      if year[0] not in year_list:
         year_list.append(year[0])

   year_list.sort(reverse=True)
   return jsonify(year_list)

@app.route("/metadata/<category>/<year>")
def metadata(category, year):
   year = int(year)
   # sel = [
   #    Energy.category,
   #    Energy.country_or_area,
   #    Energy.quantity,
   #    Energy.unit,
   #    Energy.year
   # ]

   stmt = session.query(Energy).statement
   df = pd.read_sql_query(stmt, session.bind)
   df = df.loc[(df["category"]==category) & (df["year"]==year)]
   df["country_or_area"] = df["country_or_area"].replace("Korea, Republic of", "South Korea")
   df["country_or_area"] = df["country_or_area"].replace("Iran (Islamic Rep. of)", "Iran")
   print(df)
   data = df.to_json(orient="records")

   return data

@app.route("/metadata/<country>")
def metadata_country(country):
   country = country.lower()
   # sel = [
   #    Energy.category,
   #    Energy.country_or_area,
   #    Energy.quantity,
   #    Energy.unit,
   #    Energy.year
   # ]
   stmt = session.query(Energy).statement
   df = pd.read_sql_query(stmt, session.bind)
   df["country_or_area"] = df["country_or_area"].str.lower()
   df = df.loc[df["country_or_area"]==country]
   # data = df.to_json(orient="records")
   return df

if __name__ == "__main__":
   app.run(debug=True)