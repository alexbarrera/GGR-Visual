/**
 * Created by abarrera on 04/16/16.
 */

TimesliderD3 = (function(){

  var margin = {top: 10, right: 20, bottom: 10, left: 20},
    width = 600 - margin.left - margin.right,
    height = 100 - margin.bottom - margin.top,
    timepoints=[0,0.5,1,2,3,4,5,6,7,8,10,12],
    last_tp= 0, viewers;

  var q = d3.scale.threshold()
    .domain(
      d3.zip(timepoints, timepoints.slice(1, timepoints.length)).map(function(d){return d3.mean(d)})
    )
    .range(timepoints);

  var render = function(container) {
    var x = d3.scale.linear()
      .domain([0, 12])
      .range([0, width])
      .clamp(true);

    var brush = d3.svg.brush()
      .x(x)
      .extent([0, 0])
      .on("brush", brushed);

    var svg = d3.select(container).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height / 2 + ")")
      .call(d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function (d) {
          return d + "h";
        })
        .tickValues(timepoints)
        .tickSize(0)
        .tickPadding(12)
      )
      .select(".domain")
      .select(function () {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "halo");

    var slider = svg.append("g")
      .attr("class", "slider")
      .call(brush);

    slider.selectAll(".extent,.resize")
      .remove();

    slider.select(".background")
      .attr("height", height);

    var handle = slider.append("circle")
      .attr("class", "handle")
      .attr("transform", "translate(0," + height / 2 + ")")
      .attr("r", 9);

    last_tp = 0;
    //slider
    //  .call(brush.event)
    //  .transition() // gratuitous intro!
    //  .duration(750)
    //  .call(brush.extent([70, 70]))
    //  .call(brush.event);

    function brushed() {
      var value = q(brush.extent()[0]);

      if (d3.event.sourceEvent) { // not a programmatic event
        value = q(x.invert(d3.mouse(this)[0]));
        brush.extent([value, value]);
      }
      handle.attr("cx", x(value));

      if (last_tp == value) return;
      last_tp = value;

      peak_viewers.forEach(function(e, i, a){
        e.tp(timepoints.indexOf(value));
        e.render();
      });

      //PeakviewerD3.tp(timepoints.indexOf(value));
      //PeakviewerD3.render();

    }

  };

  return {
    render: function(container, vs){
      peak_viewers=vs;
      return render(container);
    }
  }
}());

