/**
 * Created by abarrera on 04/16/16.
 */

TimesliderD3 = (function(){

  var margin = {top: 0, right: 20, bottom: 0, left: 20},
    width = 600 - margin.left - margin.right,
    height = 50 - margin.bottom - margin.top,
    timepoints=[0,0.5,1,2,3,4,5,6,7,8,10,12],
    loop_timepoints=[0, 1, 4, 8, 12], loops_viewer,
    last_tp= 0, is_looping=false, timer, container,
    svg, slider, handle, brush, x, q;

  function brushed(v) {
    var value = (v != undefined ? v : q(brush.extent()[0]));

    if (d3.event && d3.event.sourceEvent) { // not a programmatic event
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

    if (loop_timepoints.indexOf(value)>-1){
      loops_viewer.tp(loop_timepoints.indexOf(value));
      loops_viewer.render();
    }else{
      for (var tp_idx=0; tp_idx<loop_timepoints.length-1; tp_idx++){
        if (loop_timepoints[tp_idx]<value && loop_timepoints[tp_idx+1]>value){
          loops_viewer.tp(tp_idx);
          loops_viewer.render();
          break;
        }
      }
    }

  }

  var render = function() {
    q = d3.scale.threshold()
      .domain(
        d3.zip(timepoints, timepoints.slice(1, timepoints.length)).map(function(d){return d3.mean(d)})
      )
      .range(timepoints);


    x = d3.scale.linear()
      .domain([0, timepoints[[timepoints.length-1]]])
      .range([0, width])
      .clamp(true);

    brush = d3.svg.brush()
      .x(x)
      .extent([last_tp, last_tp])
      .on("brush", brushed);



    svg = d3.select(container).append("svg")
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

    slider = svg.append("g")
      .attr("class", "slider")
      .call(brush);
    slider.selectAll(".extent,.resize")
      .remove();

    slider.select(".background")
      .attr("height", height);

    handle = slider.append("circle")
      .attr("class", "handle")
      .attr("transform", "translate(0," + height / 2 + ")")
      .attr("r", 9);
  };

  return {
    render: function(c, vs, lv){
      if (c) container=c;
      if (vs) peak_viewers=vs;
      if (lv) loops_viewer=lv;
      if (!svg) {  //init
        render();
      }
    },
    togglePlay: function(elem){

      if (is_looping) {
        $(elem).html("Play").toggleClass("playing");

        clearInterval(timer);
        is_looping = false;
        return is_looping;
      }
      $(elem).html("Stop").toggleClass("playing");

      timer = setInterval(function(){
        var next_tp= (timepoints.indexOf(last_tp)+1)%timepoints.length;
        slider
          .call(brush.event)
          //.transition()
          .call(brush.extent([timepoints[next_tp],timepoints[next_tp]]))
          .call(brush.event);
        is_looping = true;
      }, 1000);

    },
    tp: function(tp){
      return (tp != undefined ? last_tp = tp : last_tp);
    },
    timepoints: function(tps){
      return (tps != undefined ? timepoints = tps : timepoints);
    },
    moveTo: function(tp){
      brushed(tp);
    }
  }
}());

