var socket = io();

function verifySymbol(jsonpSymbolData) {
  // console.log(jsonpSymbolData);
  if (jsonpSymbolData.length) {
    socket.emit('addStock', jsonpSymbolData[0].Symbol);
  } else {
    console.log('Nope!');
  }
}

function renderGraph(data) {

  var minPrice, maxPrice;
  if (data.Elements.length === 1) {
    minPrice = data.Elements[0].DataSeries.close.min;
    maxPrice = data.Elements[0].DataSeries.close.max;
  } else {
    minPrice = data.Elements.reduce(function(prev, cur) {
      if (cur.DataSeries.close.min < prev) {
        return cur.DataSeries.close.min;
      } else {
        return prev;
      }
    }, 0);
    maxPrice = data.Elements.reduce(function(prev, cur) {
      if (cur.DataSeries.close.max > prev) {
        return cur.DataSeries.close.max;
      } else {
        return prev;
      }
    }, 0);
  }
  // console.log(minPrice, maxPrice);
  var today = new Date();
  var minDate = new Date(today.setFullYear(today.getFullYear() - 1));
  var maxDate = new Date();
  // console.log(minDate, maxDate);
  var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c',
                '#fb9a99','#e31a1c','#fdbf6f','#ff7f00',
                '#cab2d6','#6a3d9a','#ffff99','#b15928'];
  var width = 1000;
  var height = 500;
  var margins = {top: 20, right: 20, bottom: 20, left: 50};

  // ======================
  // Begin work with D3
  // ======================

  var chart =  document.getElementById('visualisation');
  chart.innerHTML = '';

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
}

function arrestEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  }

window.onload = function() {

  var submit = document.getElementById('submit');
  var input = document.getElementById('m');
  var messages = document.getElementById('messages');

  var stocks = [];
  var stockData;

  submit.addEventListener('click', function(e) {
    arrestEvent(e);
    var newStock = input.value;
    var verifyStockUrl = 'http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?input=' + newStock + '&callback=verifySymbol';
    var script = document.createElement('script');
    script.src = verifyStockUrl;
    document.getElementsByTagName('head')[0].appendChild(script);
    input.value = '';
  });

  socket.on('updatesStockList', function(stockList) {
    console.log(stockList);
    var elements = "";
    stockList.map(function(each, index) {
      var objCom = '';
      if (index > 0) { objCom = ','; };
      elements = elements + objCom + ' %20{%20%22Symbol%22:%22' + each + '%22,%20%22Type%22:%22price%22,%20%22Params%22:[%22c%22]%20}';
    });
    var verifyStockUrl = 'http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/jsonp?parameters={%20%22Normalized%22:%20false,%20%22NumberOfDays%22:%20365,%20%22DataPeriod%22:%20%22Day%22,%20%22Elements%22:%20[' + elements + '%20]%20}&callback=renderGraph';
    var script = document.createElement('script');
    script.src = verifyStockUrl;
    document.getElementsByTagName('head')[0].appendChild(script);
    input.value = '';

  });

  socket.emit('addStock', '');

}
