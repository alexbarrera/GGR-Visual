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

  var margin,
    width,
    height,
    data,
    svgCanvas,
    axes,
    legend,
    svgWidth,
    svgHeight,
    defs;


  function init(c) {
    svgWidth = 700;
    svgHeight = 250;
    margin = {top: 20, right: 140, bottom: 20, left: 50};
    width = svgWidth - margin.left - margin.right;
    height = svgHeight - margin.top - margin.bottom;

    //c=".hist_mod_container";

    svgCanvas = d3.select(c).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // clipping to make sure nothing appears behind legend
    svgCanvas.append('clipPath')
      .attr('id', 'axes-clip')
      .append('polygon')
      .attr('points', (-margin.left) + ',' + (-margin.top) + ' ' +
        (width - 1) + ',' + (-margin.top) + ' ' +
        (width - 1) + ',' + 0 + ' ' +
        (width + margin.right) + ',' + 0 + ' ' +
        (width + margin.right) + ',' + (height + margin.bottom) + ' ' +
        (-margin.left) + ',' + (height + margin.bottom));

    axes = svgCanvas.append('g')
      .attr('clip-path', 'url(#axes-clip)');
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
    // Draw TSS
    var tss_static_vals = [
      [[width / 2, height],
        [width / 2, margin.top + height / 4],
        [width / 2 + width / 10, margin.top + height / 4]]
    ];

    defs = svgCanvas.append("defs");

    defs.append("marker")
      .attr({
        "id": "arrow",
        "viewBox": "0 -5 10 10",
        "refX": 5,
        "refY": 0,
        "markerWidth": 4,
        "markerHeight": 10,
        "orient": "auto"
      })
      .append("path")
      .attr("d", "M0,-10L10,0L0,10")
      .attr("class", "arrowHead");

    var tss = svgCanvas.selectAll(".tss")
      .data(tss_static_vals)
      .enter().append("g")
      .attr("class", "tss");

    tss.append("path")
      .attr("class", "line")
      .attr("class", "arrow")
      .attr("marker-end", "url(#arrow)")
      .attr("d", d3.svg.line()
        .x(function (d) {
          return d[0];
        })
        .y(function (d) {
          return d[1];
        })
      );

  }

  function renderAxis(x, y) {

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(5),
      yAxis = d3.svg.axis().scale(y).orient('left').tickPadding(5);

    axes.selectAll(".x.axis")
      .call(xAxis);

    axes.selectAll(".y.axis")
      .call(yAxis);

  }

  function renderPeakAreas(x, y) {

    var areaDrawer = d3.svg.area()
      .interpolate('basis')
      .x(function (d, i) {
        return x(data.coords_dom[0] + data.bin_size * i)
      })
      .y0(function (d) {
        return y(data.reads_dom[0])
      })
      .y1(function (d) {
        return y(d)
      });

    //var medianLineDrawer = d3.svg.line()
    //  .interpolate('basis')
    //  .x(function (d, i) {
    //    return x(timePoints[i]);
    //  })
    //  .y(function (d) {
    //    return y(d);
    //  });

    var readsAreas = svgCanvas.selectAll(".readsArea")
      .data(data.elems, function (d) {
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
      .duration(150)
      .ease("linear")
      .attr('d', function (d) {
        return areaDrawer(d.reads[data.tp]);
      })
      .attr('clip-path', 'url(#rect-clip)')

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

  function render(c) {
    if (typeof svgCanvas == 'undefined') {
      //console.log("init Peakviewer");
      init(c);
    }
    var x = d3.scale.linear()
      .domain(data.coords_dom)
      .range([0, width]);

    var y = d3.scale.linear()
      .domain(data.reads_dom)
      .range([height, 0]);

    renderPeakAreas(x, y);
    renderAxis(x, y);
    updateLegend();
    svgCanvas.select('.tss').moveToFront();

    return this;
  }

  return {

    tp: function (d) {
      return ((typeof d != undefined) && data ? data.tp = d : data.tp)
    },
    data: function (d) {
      return (d ? data = d : data)
    },
    render: function (c) {
      if (!data) {
        var viewers_types  = {
          ".hist_mod_container.peak-viewer": {
            'n':2,
            'names': ['H3K9me1', 'H3K9me3']
          },
          ".tf_container.peak-viewer": {
            'n':5,
            'names': ['CTCF', 'BCL3', 'CEBPB', 'EP300', 'FOSL2']
          },
          ".dnase_container.peak-viewer": {
            'n':1,
            'names': ['DNase-I']
          }
        };
        var arrs = [];
        for (var ndatum = 0; ndatum < viewers_types[c].n; ndatum++) {
          var tp_data = [];
          for (var tp = 0; tp < 12; tp++) {
            var arr = [];
            for (var i = 0, t = 21; i < t; i++) {
              arr.push(Math.round(Math.random() * t))
            }
            tp_data.push(arr);
          }
          arrs.push(tp_data)
        }
        data = {
          'coords_dom': [1000000, 3000000],
          'reads_dom': [0, d3.max(arrs.map(function(e){return d3.max(e)}).map(function(e){return d3.max(e)}))],
          'bin_size': 100000,
          'tp': 0,
          'elems': viewers_types[c].names.map(function(e,i){return {'name': e, 'reads': arrs[i]}})
          //'elems': [
          //  {'name': 'H3K9me3', 'reads': arrs[0]},
          //  {'name': 'H3K9me1', 'reads': arrs[1]}
          //]
        };
      }

      return render(c);
    }
  }
};
