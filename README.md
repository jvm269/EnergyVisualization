# EnergyVisualization Dashboard
Project By: Gan Jin, Peter Kim, Kevin Freehill, and Jihan M. 


Visualization Dashboard from the United Nations Energy Information detailing the usage of energy for each year. 
We used heroku to host our database from a csv file. It included over 7000's records. Our Dashboard included a total of 3 user driven visualizations.


We used a stacked energy graph to detail change over time per country amongst all energy types
We used a (donut) piechart to detail the amount of energy usage per country per year
We used a geo map to plot specific energy usuage per country per year.


For user interaction, you can navigate the charts using drop down field for each visualization
We used flask to serve our data to the homepage
We used jquery to host our years and country in the dropdown field
We used plot.ly to chart our pie graph and d3 for our geo map and stacked energy graph


Our original data can be found HERE: https://www.kaggle.com/unitednations/international-energy-statistics/activity. We used mongo to filter the data to a smaller subset.
