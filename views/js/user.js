var socket = io();

window.onload = function() {

  var submit = document.getElementById('submit');
  var input = document.getElementById('m');
  var messages = document.getElementById('messages');

  submit.addEventListener('click', function(e) {
    arrestEvent(e);
    socket.emit('addStock', input.value);
    input.value = '';
  });

  socket.on('newStock', function(msg) {
    // make API request
    // render graph
    // render ul of stock buttons
    messages.innerHTML = messages.innerHTML + '<li>' + msg + '</li>';
  });

  function arrestEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  // ==========================
  // Prepare Data and Constants
  // =========================

  var minPrice = data.Elements.reduce(function(prev, cur) {
    if (cur.DataSeries.close.min < prev.DataSeries.close.min) {
      return cur.DataSeries.close.min;
    } else {
      return prev.DataSeries.close.min;
    }
  });
  var maxPrice = data.Elements.reduce(function(prev, cur) {
    if (cur.DataSeries.close.max > prev.DataSeries.close.max) {
      return cur.DataSeries.close.max;
    } else {
      return prev.DataSeries.close.max;
    }
  });
  //console.log(minPrice, maxPrice);
  var today = new Date();
  var minDate = new Date(today.setFullYear(today.getFullYear() - 1));
  var maxDate = new Date();
  //console.log(minDate, maxDate);
  var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c',
                '#fb9a99','#e31a1c','#fdbf6f','#ff7f00',
                '#cab2d6','#6a3d9a','#ffff99','#b15928'];
  var width = 1000;
  var height = 500;
  var margins = {top: 20, right: 20, bottom: 20, left: 50};

  // ======================
  // Begin work with D3
  // ======================

  var vis = d3.select('#visualisation');

  xScale = d3.time.scale()
    .range([margins.left, width - margins.right])
    .domain([minDate, maxDate]);
  yScale = d3.scale.linear()
    .range([height - margins.top, margins.bottom])
    .domain([minPrice - 15, maxPrice + 15]);

  xAxis = d3.svg.axis().scale(xScale);
  yAxis = d3.svg.axis()
   .scale(yScale)
   .orient('left');

  vis.append('svg:g')
      .attr('transform', 'translate(0,' + (height - margins.bottom) + ')')
      .call(xAxis);

  vis.append('svg:g')
    .attr('transform', 'translate(' + (margins.left) + ',0)')
    .call(yAxis);

  var line = d3.svg.line()
  .x(function(d) {
    return xScale(d[0]);
  })
  .y(function(d) {
    return yScale(d[1]);
  });

  data.Elements.forEach(function(stock, index) {
  var datePricePairs = [];
  for (var i = 0; i < data.Dates.length; i++) {
    datePricePairs.push([new Date(data.Dates[i]),
                         stock.DataSeries.close.values[i]]);
  }
  vis.append('svg:path')
  .attr('d', line(datePricePairs))
  .attr('stroke', colors[index])
  .attr('stroke-width', 2)
  .attr('fill', 'none');
});

};

