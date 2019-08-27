function buildMap(category, year) {

  var panel = d3.select("#canvas-svg");
  panel.html("");

  d3.json("/metadata/"+category+"/"+year, (data) => {
    // console.log(data)
    var width = 900;
    var height = 900;

    var COLOR_COUNTS = 9;
    
    function Interpolate(start, end, steps, count) {
        var s = start,
            e = end,
            final = s + (((e - s) / steps) * count);
        return Math.floor(final);
    }
    
    function Color(_r, _g, _b) {
        var r, g, b;
        var setColors = function(_r, _g, _b) {
            r = _r;
            g = _g;
            b = _b;
        };
    
        setColors(_r, _g, _b);
        this.getColors = function() {
            var colors = {
                r: r,
                g: g,
                b: b
            };
            return colors;
        };
    }
    
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    var COLOR_FIRST = "#99ccff", COLOR_LAST = "#0050A1";
    
    var rgb = hexToRgb(COLOR_FIRST);
    
    var COLOR_START = new Color(rgb.r, rgb.g, rgb.b);
    
    rgb = hexToRgb(COLOR_LAST);
    var COLOR_END = new Color(rgb.r, rgb.g, rgb.b);
    
    var startColors = COLOR_START.getColors(),
        endColors = COLOR_END.getColors();
    
    var colors = [];
    
    for (var i = 0; i < COLOR_COUNTS; i++) {
      var r = Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
      var g = Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
      var b = Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
      colors.push(new Color(r, g, b));
    }
    
    var MAP_KEY = "country_or_area";
    var MAP_VALUE = "quantity";
    
    var projection = d3.geo.mercator()
        .scale((width + 1) / 2 / Math.PI)
        .translate([width / 2, height / 2])
        .precision(.1);
    
    var path = d3.geo.path()
        .projection(projection);
    
    var graticule = d3.geo.graticule();
    
    var svg = d3.select("#canvas-svg").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);
    
    var valueHash = {};
    
    data.forEach(function(d) {
      valueHash[d[MAP_KEY]] = +d[MAP_VALUE];
    });
    
    var quantize = d3.scale.quantize()
        .domain([0, 1.0])
        .range(d3.range(COLOR_COUNTS).map(function(i) { return i }));
    
    quantize.domain([d3.min(data, function(d){
        return (+d[MAP_VALUE]) }),
      d3.max(data, function(d){
        return (+d[MAP_VALUE]) })]);

    d3.json("https://s3-us-west-2.amazonaws.com/vida-public/geo/world-topo-min.json", function(error, world) {
      var countries = topojson.feature(world, world.objects.countries).features;
      svg.append("path")
      .datum(graticule)
      .attr("class", "choropleth")
      .attr("d", path);

  var g = svg.append("g");

  g.append("path")
    .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
    .attr("class", "equator")
    .attr("d", path);

  var country = g.selectAll(".country").data(countries);

  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d) { return d.properties.name; })
      .style("fill", function(d) {
        if (valueHash[d.properties.name]) {
          var c = quantize((valueHash[d.properties.name]));
          var color = colors[c].getColors();
          return "rgb(" + color.r + "," + color.g +
              "," + color.b + ")";
        } else {
          return "#ccc";
        }
      })
      .on("mousemove", function(d) {
          var html = "";

          html += "<div class=\"tooltip_kv\">";
          html += "<span class=\"tooltip_key\">";
          html += d.properties.name;
          html += "</span>";
          html += "<span class=\"tooltip_value\">";
          html += (valueHash[d.properties.name] ? valueHash[d.properties.name] : "");
          html += "";
          html += "</span>";
          html += "</div>";
          
          $("#tooltip-container").html(html);
          $(this).attr("fill-opacity", "0.8");
          $("#tooltip-container").show();
          
          var coordinates = d3.mouse(this);
          
          var map_width = $('.choropleth')[0].getBoundingClientRect().width;
          
          if (d3.event.pageX < map_width / 2) {
            d3.select("#tooltip-container")
              .style("top", (d3.event.layerY + 15) + "px")
              .style("left", (d3.event.layerX + 15) + "px");
          } else {
            var tooltip_width = $("#tooltip-container").width();
            d3.select("#tooltip-container")
              .style("top", (d3.event.layerY + 15) + "px")
              .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
          }
      })
      .on("mouseout", function() {
              $(this).attr("fill-opacity", "1.0");
              $("#tooltip-container").hide();
          });
  
    g.append("path")
        .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
        .attr("class", "boundary")
        .attr("d", path);
    
    svg.attr("height", height * 2.2 / 3);
    });

    d3.select(self.frameElement).style("height", (height * 2.3 / 3) + "px");
  })
};

function buildStackedAreaChart(country) {
  var stacked = d3.select("#stacked-area-svg")
  stacked.html("")
  var margin = {top: 10, right: 30, bottom: 30, left: 60};
  var width = 460 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;
  var svg = d3.select("#stacked-area-svg")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var myUrl = `/metadata/${country}`;
  d3.json(myUrl, (data) => {
    var sumstat = d3.nest()
    .key(function(d) { return +d.year;})
    .entries(data);
  // var myUrl = `/sample_energy/${country}`;
  // d3.json(myUrl).then(function(response) {
    console.log(data)
    // response.forEach(function(datalvl) {
    //   datalvl.poverty = +datalvl.poverty;
    //   datalvl.age = +datalvl.age;
    //   datalvl.smokes = +datalvl.smokes;
    // });
    // d3.json('/sample/${country}', (data) => {
    // var sumstat = d3.nest()
    // .key(function(d) { return d.year;})
    // .entries(data);
    // console.log(sumstat)
    var mygroups = ["nuclear_electricity", "solar_electricity", "thermal_electricity", "tide_wave_and_ocean_electricity"];
    var mygroup = [1,2,3,4];
    var stackedData = d3.stack()
    .keys(mygroup)
    .value(function(d, key){
      // console.log(d.values[key])
      console.log(key)
      if (`${key-1}` in d.values){
        return +d.values[key-1].quantity
      } else{
        return 0 
      }
    })
    (sumstat)
    console.log(stackedData)  
    // Add X axis --> it is a date format
  var x = d3.scaleLinear()
  .domain(d3.extent(data, function(d) { return +d.year; }))
  .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height +")")
    .call(d3.axisBottom(x));
  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0,1.3* d3.max(data, function(d) { return +d.quantity; })*1.2])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));
// color palette
var color = d3.scaleOrdinal()
  .domain(mygroups)
  .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])
// Show the areas
svg
  .selectAll("mylayers")
  .data(stackedData)
  .enter()
  .append("path")
    .style("fill", function(d) { name = mygroups[d.key-1] ;  return color(name); })
    .attr("d", d3.area()
      .x(function(d, i) { return x(d.data.key); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); })
    )
  });
}

function pie_chart(country, year) {
   var pie_selector = d3.select("#pie_chart")
  //  pie_selector.html("")

   d3.json("/pie/"+country+"/"+year, (data) => {
     console.log(data)

     var pie_value = [];
     var pie_category = [];
     data.forEach(d => {
       console.log(d.quantity)
       pie_value.push(d.quantity)
       pie_category.push(d.category)
     });
     let pie_colors = [ "rgb(0,80,161)", "rgb(153,204,255)", "rgb(59,134,209)", "rgb(204, 204,204)" ]
    let pieData = [
      {

        values: pie_value,
        labels: pie_category,
        hoverinfo: "hovertext",
       marker:{
         colors: pie_colors
       },
        hole: .5,
        // textinfo: 'none',
        type: "pie"
      }
    ];
    
    let pieLayout = {
      //  height: 800,
      //   width: 800
      legend: {"orientation": "h"}
    };

    Plotly.newPlot("pie_chart", pieData, pieLayout)
})
   }
   
   
  

function init() {
  // Use the list of countries or areas to populate the select options
  var selector_country = d3.select("#Country");
  d3.json("/country", (country_list) => {
    country_list.forEach((country) => {
      selector_country
        .append("option")
        .text(country)
        .property("value", country);
    })
  })
  var pie_selector_country = d3.select("#pie_country");
  d3.json("/country", (country_list) => {
    country_list.forEach((country) => {
      pie_selector_country
        .append("option")
        .text(country)
        .property("value", country);
    })
  })
  // Use the list of categories to populate the select options
  var selector_category = d3.select("#Category");
  d3.json("/category", (category_list) => {
    category_list.forEach((category) => {
      selector_category
        .append("option")
        .text(category)
        .property("value", category);
    })
  })
  // Use the list of years to populate the select options
  var selector_year = d3.select("#Year");
  d3.json("/year", (year_list) => {
    year_list.forEach((year) => {
      selector_year
        .append("option")
        .text(year)
        .property("value", year);
    })
  })
 // Use the list of years to populate the select options
 var pie_selector_year = d3.select("#pie_year");
 d3.json("/year", (year_list) => {
   year_list.forEach((year) => {
     pie_selector_year
       .append("option")
       .text(year)
       .property("value", year);
   })
 })

  const initCategory = "nuclear_electricity";
  const initYear = "2014";

  buildMap(initCategory, initYear);

};

function countryChanged(newCountry) {
  console.log(newCountry);
  buildStackedAreaChart(newCountry);
}

function categoryChanged(newCategory) {
  var year = $("#Year :selected").text()
  buildMap(newCategory, year);
}

function yearChanged(newYear) {
  var category = $("#Category :selected").text()
  buildMap(category, newYear)
}

function pie_countryChanged(newCountry) {
  var year = $("#pie_year :selected").text()
  pie_chart(newCountry, year)
}

function pie_yearChanged(newYear) {
  var country = $("#pie_country :selected").text()
  pie_chart(country, newYear)
}


init();
