/**
 * Created by abarrera on 2/29/16.
 */

DegsD3 = (function(){

  var data = [];

  var BREWER_PALETTE = [
    [228,26,28],
    [55,126,184],
    [77,175,74],
    [152,78,163],
    [255,127,0],
    [166,86,40],
    [247,129,191],
    [153,153,153],

    [28,126,128],
    [155,226,29],
    [177,275,19],
    [252,178,8],
    [55,227,100],
    [11,186,140],
    [47,229,36],
    [253,253,253]
  ];

  function getColor(colorNumber, palette, hue){
    colorNumber = colorNumber % 16;
    return "rgba("+palette[colorNumber].toString()+", "+hue+")";
  }

  function drawPaths(svg, data, x, y, timePoints) {

    var stdAreaDrawer = d3.svg.area()
      .x(function (d, i) {
        return x(timePoints[i])
      })
      .y0(function (d) {
        return y(d[0] + d[1])
      })
      .y1(function (d) {
        return y(d[0] - d[1])
      });

    var medianLineDrawer = d3.svg.line()
      .x(function (d, i) {
        return x(timePoints[i]);
      })
      .y(function (d) {
        return y(d);
      });

    var stdAreas = svg.selectAll(".stdArea")
      .data(displayType == 'counts' ? data : [],  function(d, i){
        return d.gene_name;
      });
    stdAreas.enter().append('path');
    stdAreas.attr("class", "stdArea")
      .transition()
      .duration(150)
      .ease("linear")
      .attr('fill', function(d, i){
      return getColor(i, BREWER_PALETTE, .2)
    })
      .attr('d', function(d){
        var measure = (displayType == 'counts' ? d.means : d.log2fcs);
        return stdAreaDrawer(measure.map(function(c, i){return [c, d.sds[i]];}));
      })
      .attr('clip-path', 'url(#rect-clip)')
    ;
    stdAreas.exit().remove();

    var meanLines = svg.selectAll(".meanLines")
      .data(data,  function(d){return d.gene_name;});
    meanLines.enter().append('path');
    meanLines.attr("class", "meanLines")
      .attr('data-legend', function(d){return d.gene_name;})
      .attr('data-legend-pos', function(d, i){return i})
      .attr('fill', 'none')
      .attr('stroke', function(d, i){
        return getColor(i, BREWER_PALETTE, 1)
      })
      .attr('stroke-width', 2)
      .transition()
      .duration(150)
      .ease("linear")
      .attr('d', function(d){
        var measure = (displayType == 'counts' ? d.means : d.log2fcs);
        return medianLineDrawer(measure)
      })
      .attr('clip-path', 'url(#rect-clip)')


    ;
    meanLines.exit().remove();

  }


  function init(){
    svgWidth = 960;
    svgHeight = 500;
    margin = {top: 20, right: 20, bottom: 40, left: 60};
    chartWidth = svgWidth - margin.left - margin.right;
    chartHeight = svgHeight - margin.top - margin.bottom;
    timePoints = [0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

    svg_charts = d3.select('.charts_container').append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // clipping to make sure nothing appears behind legend
    svg_charts.append('clipPath')
      .attr('id', 'axes-clip')
      .append('polygon')
      .attr('points', (-margin.left) + ',' + (-margin.top) + ' ' +
        (chartWidth - 1) + ',' + (-margin.top) + ' ' +
        (chartWidth - 1) + ',' + 0 + ' ' +
        (chartWidth + margin.right) + ',' + 0 + ' ' +
        (chartWidth + margin.right) + ',' + (chartHeight + margin.bottom) + ' ' +
        (-margin.left) + ',' + (chartHeight + margin.bottom));

    axes = svg_charts.append('g')
      .attr('clip-path', 'url(#axes-clip)');
    axes.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + chartHeight + ')');

    axes.append('g')
      .attr('class', 'y axis')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text(function(){return (displayType == 'counts' ?
        'Number of normalized read counts' :
        'Log2 fold change')
      });

  }


  function updateLegend(){
    if (typeof legend == 'undefined') {
      legend = svg_charts.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(50,30)")
        .style("font-size", "12px")
        .call(d3.legend);
    } else {
      legend.call(d3.legend);
    }
  }

  function updateAxis(x, y){
    var xAxis = d3.svg.axis().scale(x).orient('bottom')
      .tickValues(timePoints)
      .ticks(4)
      .tickFormat(d3.format(",.f"))
      .tickSubdivide(0),
      yAxis = d3.svg.axis().scale(y).orient('left').tickPadding(5);

    axes.selectAll(".x.axis")
      .call(xAxis);

    axes.selectAll(".y.axis")
      .call(yAxis);

    axes.select(".y.axis text")
      .text(function(){return (displayType == 'counts' ?
        'Number of normalized read counts' :
        'Log2 fold change')
      })
  }

  function renderChart() {
    if (typeof svg_charts == 'undefined'){
      init();
    }


    var x = d3.scale.linear().range([0, chartWidth])
      .domain(d3.extent(timePoints)), //data, function (d) { return d.date; }
      y = d3.scale.linear().range([chartHeight, 0])
        .domain([
          d3.min(data, function (d) {
            if (displayType != 'counts')
              return d3.min(d.log2fcs);
            else
              return d3.min(d3.zip(d.means , d.sds).map(function(a){return a[0] - a[1];}));
          }),
          d3.max(data, function (d) {
            if (displayType != 'counts')
              return d3.max(d.log2fcs);
            else
              return d3.max(d3.zip(d.means, d.sds).map(function(a){return a[0] + a[1];}));
          })
        ]);



    drawPaths(svg_charts, data, x, y, timePoints);

    updateLegend();

    updateAxis(x, y);

  }


  return {
    addElement: function(d){
      data = d3.merge([data, d.filter(function(v){return data.map(function(e){return e.gene_name}).indexOf(v.gene_name)<0})]);
    },
    renderChart: function (){
      if (typeof displayType  == 'undefined')
        displayType = 'counts';
      return renderChart();
    },
    toggleDisplayType: function (v){
      if (typeof displayType  == 'undefined' || !displayType)
        displayType = 'counts';
      else
        displayType = '';
      renderChart();
    }

  }
}());

