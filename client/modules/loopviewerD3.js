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
    legend,
    svgWidth,
    svgHeight,
    defs,
    tss_coord,
    gradient,
    nbins=2000,
    resolutions_set=[5,10,25,50,100,250],
    timepoints=[0,0.5,1,2,3,4,5,6,7,8,10,12];


  function init(c) {
    container = c || container;
    svgWidth = 700;
    svgHeight = 200;
    margin = {top: 20, right: 140, bottom: 20, left: 40};
    width = svgWidth - margin.left - margin.right;
    height = svgHeight - margin.top - margin.bottom;

    //c=".hist_mod_container";

    svgCanvas = d3.select(container).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svgCanvas.append('clipPath')
      .attr('id', 'axes-clip' + container)
      .append('polygon')
      .attr('points', (-margin.left) + ',' + (-margin.top) + ' ' +
        (width - 1) + ',' + (-margin.top) + ' ' +
        (width - 1) + ',' + 0 + ' ' +
        (width + margin.right) + ',' + 0 + ' ' +
        (width + margin.right) + ',' + (height + margin.bottom) + ' ' +
        (-margin.left) + ',' + (height + margin.bottom));

    svgCanvas.append('clipPath')
      .attr('id', 'viewer-clip' + container)
      .append('polygon')
      .attr('points', '0,0 ' +
        width + ',0 ' +
        width + ',' + (height) + ' ' +
        '0,' + height);

    axes = svgCanvas.append('g')
      .attr('clip-path', 'url(#axes-clip' + container + ')');
    axes.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .style('text-anchor', 'end')
      .text("coordinates");

    axes.append('g')
      .attr('class', 'y axis')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -15)
      .attr('x', -24)
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

    gradient = svgCanvas.append("defs")
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", (100/data.loops.length) + "%")
      .attr("spreadMethod", "repeat")
      .attr("gradientUnits", "userSpaceOnUse");

    gradient.append("stop")
      .attr("offset", data.lfc_range[0])
      .attr("stop-color", "#d7191c")
      .attr("stop-opacity", 1);


    gradient.append("stop")
      .attr("offset", data.lfc_range[1])
      .attr("stop-color", "#1a9641")
      .attr("stop-opacity", 1);
  }

  function renderAxis(x, y, y_values) {

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(3),
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
    var n_loops=data.loops.length,
        pad_loop_track=Math.round(height*0.1);  // Here the padding between tracks can be adjusted

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

    var loopLfcs = svgCanvas.selectAll(".loopLfc")
      .data(data.loops);
    loopLfcs.enter().append('rect');
    loopLfcs
      .attr("x", function(d){
        return x(d.start)
      })
      .attr("y", function(d){
        return Math.min(y_loop(0), y_loop(d.lfc[data.tp]))
      })
      .attr("width", function(d){
        return x(d.end)-x(d.start)
      })
      .attr("height", function(d){
        return Math.abs(y_loop(0) - y_loop(d.lfc[data.tp]))
      })
      .attr("class", "loopLfc")
      .attr('fill', function(d){
        return (d.lfc[data.tp]>0?"#b30000":"#006d2c")
      })
      .attr("transform", function(d, i){
        return "translate(0," + String(i*(loop_track_h)+(i+1)*pad_loop_track) + ")"
      });

    loopLfcs.exit()
      .transition()
      .duration(500)
      .ease("cubic")
      .remove() ;

    var loopLfcsAxes = svgCanvas.selectAll(".loopLfcAxes")
      .data(data.loops);
    loopLfcsAxes.enter().append('path');
    loopLfcsAxes
      .attr('stroke-width', 1)
      .attr('stroke', "black")
      .attr("class", "loopLfcAxes")
      //.attr("marker-start", function(){
      //    return "url(#segmentEnd)"
      //  })
      .attr('d', function (d, i) {
        return lfcDrawer(
          [
            [d.start, 0],
            [d.end, 0],
            [d.start, 0],
            [d.start, data.lfc_range[0]],
            [d.start, data.lfc_range[1]]
          ]
        );
      })
      .attr("transform", function(d, i){
        return "translate(0," + String(i*(loop_track_h)+(i+1)*pad_loop_track ) + ")"
      });
    var labels = [data.lfc_range[1], 0, data.lfc_range[0]],
        label_index = d3.range(data.loops.length).map(function(x){return [x,x,x];}).reduce(function(a, x){return a.concat(x)},[]);
    var loopLfcsAxesLabels = svgCanvas.selectAll(".loopLfcAxesLabels")
      .data(
          data.loops.map(function(x){return [x,x,x];}).reduce(function(a, x){return a.concat(x)},[])
      );
    loopLfcsAxesLabels.enter().append('text');
    loopLfcsAxesLabels
      .attr('class', 'loopLfcAxesLabels')
      .text(function(d, i){
        return labels[i%labels.length];
      })
      .attr("y",function(d,i){
        return y_loop(labels[i%labels.length]);
      })
      .attr("x", function(d,i){
        var x_= x(d.start)-8;
        return (i%labels.length==2?x_-4:x_);
      })
      .attr("transform", function(d, i){
        var loop_track = label_index[i];

        //(i<labels.length?0:(i<2*labels.length?1:2));
        return "translate(0," + String(loop_track*(loop_track_h)+(loop_track+1)*pad_loop_track -1) + ")"
      });

    loopLfcsAxes.exit().remove();

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

//     gradient.attr("y2", 1/data.loops[0].length*100 +"%");
    //console.log(Date.now());
    renderloopLfc(x, y);
    renderAxis(x, y, res);
    return this;
  }

  return {

    tp: function (d) {
      return ((typeof d != 'undefined') && data ? data.tp = d : data.tp)
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
    resolutions_set: function(rs){
      return ((typeof rs != 'undefined') ? resolutions_set = rs : resolutions_set)
    },
    resolution: function(r){
      //Changing the resolution affects the window range visualized
      if (typeof data =='undefined') return r;
      if (r){
        data.resolution = r;
      }
      return data.resolution;
    },

    render: function (c) {
      if (!this.data()){
        this.data(
          {
            loops: [
              {
                start: 81160000,
                end: 81490000,
                lfc: [3, -1, -0.737065235509091, -0.514116094095865] //0.497053951305289
                //lfc: [0.497053951305289, -0.527691368792846, -0.737065235509091, -0.514116094095865] //0.497053951305289
              },
              {
                start: 81430000,
                end: 81485000,
                lfc:  [-3,-3, -0.567959408652864, -0.735083916064619]
                //lfc:  [-0.583624508533773, -0.518561148080135, -0.567959408652864, -0.735083916064619]
              },
              {
                start: 81435000,
                end: 81485000,
                lfc: [3, 2, -0.560071110630041, -0.491930560198152]
                //lfc: [-0.521700174591643, -0.420220078987058, -0.560071110630041, -0.491930560198152]
              },
              {
                start: 81235000,
                end: 81445000,
                lfc: [-0.431, -2, -0.560071110630041, -0.491930560198152]
                //lfc: [-0.521700174591643, -0.420220078987058, -0.560071110630041, -0.491930560198152]
              }
            ]
          }
        );
        this.tp(0);
        this.data().lfc_range = [-3,3];
        this.coords_domain([81100000, 81600000]); // This will come from outside
      }
      return render(c);
    }
  }
};

