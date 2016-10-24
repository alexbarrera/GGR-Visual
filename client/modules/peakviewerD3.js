/**
 * Created by abarrera on 04/16/16.
 */

PeakviewerD3 = function () {

  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };
  d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
      var firstChild = this.parentNode.firstChild;
      if (firstChild) {
        this.parentNode.insertBefore(this, firstChild);
      }
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
    nbins=2000,
    resolutions_set=[5,10,25,50,100,250],
    timepoints=[0,0.5,1,2,3,4,5,6,7,8,10,12];


  function init(c) {
    container = c || container;
    svgWidth = 700;
    svgHeight = 250;
    margin = {top: 20, right: 140, bottom: 20, left: 70};
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
      .attr("transform", "translate(0," + height + ")");

    axes.append('g')
      .attr('class', 'y axis')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text("Num. of reads");

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

  }

  function renderAxis(x, y) {

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(6),
      yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(7)
        .tickPadding(5);

    axes.selectAll(".x.axis")
      .call(xAxis);

    axes.selectAll(".y.axis")
      .call(yAxis);

  }

  function renderPeakAreas(x, y) {

    //var bin_size_viewer=(Math.abs(data.coords_dom[1]-data.coords_dom[0])/data.resolution)/nbins;

    var areaDrawer = d3.svg.area()
      .interpolate('basis')
      .x(function (d, i) {
        return x(data.coords_dom[0] + data.resolution * (i +.5))
      })
      .y0(function (d) {
        return y(data.reads_dom[0])
      })
      .y1(function (d) {
        return y(d)
      });


    var readsAreas = svgCanvas.selectAll(".readsArea")
      .data(data.elems.filter(function(e){return !e.hidden}), function (d) {
        return d.name;
      });
    readsAreas.enter().append('path');
    readsAreas.attr("class", "readsArea")
      .attr('fill', function (d, i) {
        return utilsGGR.getColor(i, .6)
      })
      .attr('data-legend', function(d){return d.name;})
      .attr('data-legend-pos', function(d, i){return i})
      .transition()
      .duration(300)
      .ease("cubic")
      .attr('d', function (d) {
        //return areaDrawer(d.reads[data.tp]);
        return areaDrawer(
          d.reads[data.tp][resolutions_set.indexOf(data.resolution)]
          );
      })
      //.attr('clip-path', 'url(#rect-clip)')

    ;
    readsAreas.exit().remove();
  }

  function updateLegend(){
    if (typeof legend == 'undefined') {
      legend = svgCanvas.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (svgWidth - margin.right - margin.left/2).toString() + ",30)")
        .style("font-size", "12px")
        .call(d3.legend);
    } else {
      legend.call(d3.legend);
    }
  }

  var tss_line_gen = d3.svg.line()
      .x(function (d) {
        return d[0];
      })
      .y(function (d) {
        return d[1];
      });

  function updateTss(){
    // Draw TSS
    var tss_static_vals;
    if (!data.strand || data.strand == "+"){
      tss_static_vals = [{
        'strand': 'Plus',
        'values': [[width / 2, height],
          [width / 2, margin.top + 3 * height / 4],
          [width / 2 + width / 20, margin.top + 3 * height / 4]]
      }];
    } else
      tss_static_vals = [{
        'strand': 'Minus',
        'values': [[width / 2, height],
          [width / 2, margin.top + 3 * height / 4],
          [width / 2 - width / 20, margin.top + 3 * height / 4]]
      }];


    var tss = svgCanvas.selectAll(".tss")
      .data(tss_static_vals, function(d){return d.strand});

    tss.enter().append("g");
    var tss_line = tss.attr("class", "tss")
      .append("path");
    tss_line
      .attr("class", "line")
      .attr("class", "arrow")
      .attr("marker-end", function(){
        return "url(#arrow" +container + ")"
      })
      .attr("d", function(dd){
        return tss_line_gen(dd.values)
        }
      );
    tss.exit().remove();
  }

  function updateTimeline(){

    var vals =  [[
      [0, -margin.top/2],
      [Math.round(width/timepoints[timepoints.length-1]*timepoints[data.tp]), -margin.top/2]
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
      .data([timepoints[data.tp]]);
    tl_label
      .attr("class", "timelineLabel")
      .attr("transform", "translate(" + (Math.round(width/timepoints[timepoints.length-1]*timepoints[data.tp])+4) + "," + -margin.top/2 + ")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("color", "red")
      .text(function(d){
        return d + "hs";
      });

    tl_label.enter()
      .append("text")
      .attr("class", "timelineLabel")
      .attr("transform", "translate(" + (Math.round(width/timepoints[timepoints.length-1]*timepoints[data.tp])+4) + "," + -margin.top/2 + ")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("color", "red")
      .text(function(d){
        return d + "hs";
      });


  }

  function renderIntronsExons(x, y) {
    var exons = svgCanvas.selectAll("rect.exon")
      .data(data.exons);
    exons.enter().append("rect");
    exons.attr("class", "exon")
      .attr("x", function (d) {
        return x(d[0])
      })
      .attr("y", function() {
        return margin.top+height*4/5;
      })
      .attr("width", function(d){
        return Math.abs(x(d[1]) - x(d[0]))
      })
      .attr("height", function(){
        return height-margin.bottom - height*4/5;
      })
      .attr('clip-path', 'url(#viewer-clip' + container +')');
    exons.exit().remove();

    var introns = svgCanvas.selectAll("line.intron")
      .data(data.exons.slice(0, data.exons.length-1).map(function(e, i) {
          return [e[1], data.exons[i+1][0]];
        })
      );
    introns.enter().append("line")
      .style("stroke-dasharray", ("4, 3"));
    introns.attr("class", "intron")
      .attr("x1", function (d) {
        return x(d[0])
      })
      .attr("y1", function() {
        return margin.top+height*17/20;
      })
      .attr("x2", function (d) {
        return x(d[1])
      })
      .attr("y2", function() {
        return margin.top+height*17/20;
      })
      .attr('clip-path', 'url(#viewer-clip' + container +')');
    introns.exit().remove();
  }

  function render(c) {
    if (typeof svgCanvas == 'undefined') {
      init(c);
    }
    var x = d3.scale.linear()
      .domain(data.coords_dom)
      .range([0, width]);

    var y = d3.scale.linear()
      .domain(data.reads_dom)
      .range([height, 0]);

    //console.log(Date.now());
    renderPeakAreas(x, y);
    renderAxis(x, y);
    updateLegend();
    updateTss();
    updateTimeline();
    svgCanvas.select('.tss').moveToFront();
    renderIntronsExons(x, y);
    svgCanvas.selectAll('.exon').moveToFront();
    return this;
  }

  return {

    tp: function (d) {
      return ((typeof d != 'undefined') && data ? data.tp = d : data.tp)
    },
    timepoints: function (d) {
      return ((typeof d != 'undefined') ? timepoints = d : timepoints)
    },
    nbins: function (d) {
      return ((typeof d != 'undefined') ? nbins = d : nbins)
    },
    data: function (d) {
      return (d ? data = d : data)
    },
    exons: function(ee){
      return ((typeof ee != 'undefined') && data ? data.exons = ee : data.exons)
    },
    coords_domain: function(cc){
      return ((typeof cc != 'undefined') && data ? data.coords_dom = cc : data.coords_dom)
    },
    container: function(c){
      return ((typeof c != 'undefined') ? container = c : container)
    },
    strand: function(s){
      return ((typeof s != 'undefined') && data ? data.strand = s : data.strand)
    },
    tss: function(t){
      return ((typeof t != 'undefined') ? tss_coord = t : tss_coord)
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
      var resolutions_set = this.resolutions_set();
      var res = this.resolution();
      this.coords_domain([this.tss() - res*nbins/2, this.tss() + res*nbins/2]);
      this.data().reads_dom = [0,
        d3.max(this.data().elems.filter(function(e){return !e.hidden}).map(function(ee){
          return d3.max(ee.reads.map(function(eee){
            return d3.max(eee[resolutions_set.indexOf(res)])
          }))
      }))];

      return render(c);
    }
  }
};

