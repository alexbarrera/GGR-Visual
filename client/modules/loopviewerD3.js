/**
 * Created by abarrera on 04/16/16.
 */

LoopviewerD3 = function () {

  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };

  var container,
    margin,
    width,
    height,
    data,
    svgCanvas,
    axes,
    svgWidth,
    svgHeight,
    defs,
    timepoints=[0,1,4,8,12],
    chrom,
    tp
    ;


  function init(c) {
    container = c || container;
    svgWidth = 700;
    svgHeight = 200;
    margin = {top: 20, right: 140, bottom: 20, left: 70};
    width = svgWidth - margin.left - margin.right;
    height = svgHeight - margin.top - margin.bottom;

    svgCanvas = d3.select(container).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svgCanvas.append('clipPath')
      .attr('id', 'axes-clip-loops')
      .append('polygon')
      .attr('points', (-margin.left) + ',' + (-margin.top) + ' ' +
        (width - 1) + ',' + (-margin.top) + ' ' +
        (width - 1) + ',' + 0 + ' ' +
        (width + margin.right) + ',' + 0 + ' ' +
        (width + margin.right) + ',' + (height + margin.bottom) + ' ' +
        (-margin.left) + ',' + (height + margin.bottom));

    svgCanvas.append('clipPath')
      .attr('id', 'viewer-clip-loops')
      .append('polygon')
      .attr('points', '0,-20 ' +
        width + ',-20 ' +
        width + ',' + (height) + ' ' +
        '0,' + height);

    axes = svgCanvas.append('g')
      .attr('clip-path', 'url(#axes-clip-loops)');
    axes.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .style('text-anchor', 'end')
      .text("coordinates");

    axes.append('g')
      .attr('class', 'y axis')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -40)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text("Log Fold Change");

    defs = svgCanvas.append("defs");
    defs.append("marker")
      .attr({
        "id": "arrow"+container,
        "viewBox": "0 -5 10 10",
        "refX": 5,
        "refY": 0,
        "markerWidth": 4,
        "markerHeight": 10,
        "orient": "auto"
      })
      .append("path")
      .attr("d", "M0,-10L10,0L0,10Z")
      .attr("class", "arrowHead");
  
    defs.append("marker")
      .attr({
        "id": "segmentEnd",
        "refX": 0,
        "refY": 5,
        "markerWidth": 10,
        "markerHeight": 10,
        "orient": "auto"
      })
      .append("path")
      .attr("d", "M0,0L0,10,L1,10,L1,0Z")
      .attr("class", "segmentEnd");

    var line = d3.svg.line()
      .x(function(d) { return d[0]; })
      .y(function(d) { return d[1]; });

    svgCanvas.append("path")
      .datum([[0,-5],[0,height+5]])
      .attr("class", "peakviewerMarkerLine")
      .style("display", "none")
      .attr("d", line);

    var loopsLegendGradient = defs.selectAll('.loopsLegendGradient')
      .data([[1]]);
    loopsLegendGradient
      .enter()
      .append("linearGradient");
    loopsLegendGradient
      .attr('class', 'loopsLegendGradient')
      .attr("id", "loops-legend-gradient")
      .attr("x1", "0")
      .attr("y1", "0")
      .attr("x2", "0")
      .attr("y2",  height)
      .attr("gradientUnits", "userSpaceOnUse");

    var loopsGradientStop = loopsLegendGradient.selectAll('.loopsGradientStop')
      .data([
        ["0%", "darkred"],
        ["25%", "red"],
        ["50%", "white"],
        ["75%", "blue"],
        ["100%", "darkblue"]
      ]);
    loopsGradientStop.enter().append("stop");
    loopsGradientStop
      .attr('class', 'loopsGradientStop')
      .attr("offset", function(d){
        return d[0]
      })
      .attr("stop-color", function(d){
        return d[1]
      })
      .attr("stop-opacity", 1);

    var loopLegend = svgCanvas.append('g');
    loopLegend.append("rect")
      .attr("width", 20)
      .attr("height", height)
      .attr('x', -margin.left/2)
      .attr('y', 0)
      .attr('fill', "url(#loops-legend-gradient)");
    loopLegend.append("text")
      .attr('class', 'loopsLegendText')
      .attr('x', -margin.left/2+6)
      .attr('y', margin.top/2+2)
      .text(data.lfc_range[1]);
    loopLegend.append("text")
      .attr('class', 'loopsLegendText')
      .attr('x', -margin.left/2+2)
      .attr('y', height-margin.top/2)
      .text(data.lfc_range[0]);


    svgCanvas.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      //.attr("stroke", 'black')
      .on("mouseover", function() {
        var pvMarkers = $('.peakviewerMarkerLine');
        pvMarkers.each(function(e) {
          d3.select(this).style("display", null);
        });

      })
      .on("mouseout", function() {
        var pvMarkers = $('.peakviewerMarkerLine');
        pvMarkers.each(function(e) {
          d3.select(this).style("display", "none");
        });
      })
      .on("mousemove", mousemove);

    function mousemove() {
      var x0 = d3.mouse(this)[0];
      var pvMarkers = $('.peakviewerMarkerLine');
      pvMarkers.each(function(e){
        var ff = d3.select(this);
        ff.attr("transform", "translate(" + x0 + ",0)");
      });
    }

    var loopsGradient = defs.selectAll('.loopsGradient')
      .data([[1]]);
    loopsGradient
      .enter()
      .append("linearGradient");
    loopsGradient.attr('class', 'loopsGradient');
    var gradientStops = loopsGradient.selectAll('.loopsGradientStop')
      .data([
        ["0%", "darkred"],
        ["25%", "red"],
        ["50%", "white"],
        ["75%", "blue"],
        ["100%", "darkblue"]
      ]);
    gradientStops.enter().append("stop");
    gradientStops
      .attr('class', 'loopsGradientStop')
      .attr("offset", function(d){
        return d[0]
      })
      .attr("stop-color", function(d){
        return d[1]
      })
      .attr("stop-opacity", 1);
  }

  function renderAxis(x, y, y_values) {

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(5),
      yAxis = d3.svg.axis()
        .scale(y)
        .ticks(2)
        .tickFormat(function(d, i){
          return y_values[d]
        })
        .tickSize(3, 4)
        .orient('left');

    axes.selectAll(".x.axis")
      .call(xAxis);

    //axes.selectAll(".y.axis")
    //  .call(yAxis);

  }

  function renderloopLfc(x, y) {
    /*  Divide canvas height in as many as subareas as loops are (creating a track viewer of sorts).
        Each track area will be padded on the top to leave enough space (pad_loop_track variable) */
    var n_loops=data.length,
        pad_loop_track=Math.round(height*0.04);  // Here the padding between tracks can be adjusted

    var loop_track_h=(height-pad_loop_track*(n_loops+1))/n_loops;

    //var lfcDrawer  = d3.svg.line()
    //  .x(function(d) { return x(d[0]); })
    //  .y(function(d) {
    //    return y(d[1]);
    //  });

    var y_loop = d3.scale.linear()
      .domain(data.lfc_range)
      .range([loop_track_h, 0]);

    var lfcDrawer  = d3.svg.line()
      .x(function(d) {
        return x(d[0]);
      })
      .y(function(d) {
        return y_loop(d[1]);
      });

    var gradient = defs.selectAll('.loopsGradient')
      .data([y_loop(data.lfc_range[0])]);
    gradient.enter().append('linearGradient');
    gradient
      .attr('class', 'loopsGradient')
      .attr("id", "loops-gradient")
      .attr("x1", "0")
      .attr("y1", "0")
      .attr("x2", "0")
      .attr("y2",  function(d){
        return d;
      })
      .attr("gradientUnits", "userSpaceOnUse");

    var loopLfcs = svgCanvas.selectAll(".loopLfc")
      .data(data);
    loopLfcs.enter().append('rect');
    loopLfcs
      .transition()
      .duration(300)
      .ease("cubic")
      .attr("x", function(d){
        return x(d.start)
      })
      .attr("y", function(d){
        return Math.min(y_loop(0), y_loop(d.lfc[tp]))
        //return Math.min(y_loop(1), y_loop(d.lfc[tp]))
      })
      .attr("width", function(d){
        return x(d.end)-x(d.start)
      })
      .attr("height", function(d){
        return Math.abs(y_loop(0) - y_loop(d.lfc[tp]))
        //return Math.abs(y_loop(-1))
      })
      .attr("class", "loopLfc")
      .attr('fill', function(d){
        //return (d.lfc[tp]>0?"#b30000":"#006d2c")
        return "url(#loops-gradient)";
      })
      .attr("transform", function(d, i){
        return "translate(0," + String(i*(loop_track_h)+(i+1)*pad_loop_track) + ")"
      })
      .attr('clip-path', 'url(#viewer-clip-loops)')
    ;

    loopLfcs.exit()
      .transition()
      .duration(300)
      .ease("cubic")
      .remove() ;

    var loopLfcsAxes = svgCanvas.selectAll(".loopLfcAxes")
      .data(data);
    loopLfcsAxes.enter().append('path');
    loopLfcsAxes
      .attr('stroke-width', 1)
      .attr('stroke', "black")
      .attr("class", "loopLfcAxes")
      .attr('clip-path', 'url(#viewer-clip-loops)')
      //.attr("marker-start", function(){
      //    return "url(#segmentEnd)"
      //  })
      .attr('d', function (d, i) {
        return lfcDrawer(
          [
            [d.start, 0],
            [d.end, 0],
            [d.end, data.lfc_range[0]],
            [d.end-2500, data.lfc_range[0]],
            [d.end+2500, data.lfc_range[0]],
            [d.end, data.lfc_range[0]],
            [d.end, data.lfc_range[1]],
            //[d.end, data.lfc_range[0]/2],
            [d.end, 0],
            [d.start, 0],
            [d.start, data.lfc_range[0]],
            [d.start-2500, data.lfc_range[0]],
            [d.start+2500, data.lfc_range[0]],
            [d.start, data.lfc_range[0]],
            [d.start, data.lfc_range[1]]
          ]
        );
      })
      .attr("transform", function(d, i){
        return "translate(0," + String(i*(loop_track_h)+(i+1)*pad_loop_track ) + ")"
      });
    loopLfcsAxes.exit().remove();

  }

  var tss_line_gen = d3.svg.line()
    .x(function (d) {
      return d[0];
    })
    .y(function (d) {
      return d[1];
    });

  function updateTimeline(){

    var vals =  [[
      [0, -margin.top/2],
      [Math.round(width/timepoints[timepoints.length-1]*timepoints[tp]), -margin.top/2]
    ]];

    var timeline = svgCanvas.selectAll(".timeline")
      .data(vals);
    timeline //.transition().duration(300)
      .attr("d", function(dd){
        return tss_line_gen(dd)
      });

    timeline.enter()
      .append("path")
      .attr("d", function(dd){
          return tss_line_gen(dd)
        }
      )
      .attr("class", "timeline");

    var tl_label = svgCanvas.selectAll(".timelineLabel")
      .data([timepoints[tp]]);
    tl_label
      .attr("class", "timelineLabel")
      .attr("transform", "translate(" + (Math.round(width/timepoints[timepoints.length-1]*timepoints[tp])+4) + "," + -margin.top/2 + ")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("color", "red")
      .text(function(d){
        return d + "hs";
      });

    tl_label.enter()
      .append("text")
      .attr("class", "timelineLabel")
      .attr("transform", "translate(" + (Math.round(width/timepoints[timepoints.length-1]*timepoints[tp])+4) + "," + -margin.top/2 + ")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("color", "red")
      .text(function(d){
        return d + "hs";
      });


  }

  function render(c) {
    if (typeof svgCanvas == 'undefined') {
      init(c);
    }
    var x = d3.scale.linear()
      .domain(data.coords_dom)
      .range([0, width]);


    var res=[],res2=[];
    for(var i=0; i<["3","0","-3"].length; i++){
      ["3","0","-3"].map(function(x){return res.push(x);});
    }
    var num_steps=["3","0","-3"].length*3;
    res2=d3.range(num_steps).map(function(x){
      return x*height/num_steps
    });
    var y = d3.scale.ordinal()
      .domain(d3.range(res.length))  //data.lfc_range)
      .range(res2);//[height, 0]);

//     gradient.attr("y2", 1/data[0].length*100 +"%");
    renderloopLfc(x, y);
    renderAxis(x, y, res);
    updateTimeline();
    return this;
  }

  return {

    tp: function (d) {
      return (typeof d != 'undefined' ? tp = d : tp)
    },
    timepoints: function (d) {
      return ((typeof d != 'undefined') ? timepoints = d : timepoints)
    },
    data: function (d) {
      return (d ? data = d : data)
    },
    coords_domain: function(cc){
      return ((typeof cc != 'undefined') && data ? data.coords_dom = cc : data.coords_dom)
    },
    container: function(c){
      return ((typeof c != 'undefined') ? container = c : container)
    },
    lfc_range: function(lr){
      return ((typeof lr != 'undefined') ? data.lfc_range = lr : data.lfc_range)
    },
    chrom: function(c){
      return ((typeof c != 'undefined') ? chrom = c : chrom)
    },
    render: function (c) {
      return render(c);
    }
  }
};

