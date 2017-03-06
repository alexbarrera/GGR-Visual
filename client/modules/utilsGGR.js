/**
 * Created by abarrera on 2/29/16.
 */
utilsGGR = (function(){

  String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };

  var geneToJson = function(objToEscape){
    return !objToEscape || {
      gene_name: objToEscape.gene.replaceAll("[<b>|</b>]",""),
      means: JSON.parse(objToEscape.tpm_means),
      sds: JSON.parse(objToEscape.tpm_stds),
      log2fcs: JSON.parse(objToEscape.log2fc_means)
    }
  };
  var tpmToJson = function(objToEscape){
    return !objToEscape || {
      gene_name: objToEscape.transcript.replaceAll("[<b>|</b>]",""),
      //gene_name: objToEscape.gene.replaceAll("[<b>|</b>]",""),
      //transcript: objToEscape.transcript.replaceAll("[<b>|</b>]",""),
      means: JSON.parse(objToEscape.tpm_means),
      sds: JSON.parse(objToEscape.tpm_stds)
    }
  };
  var exonToJson = function(objToEscape){
    return !objToEscape || function(){objToEscape.exons = JSON.parse(objToEscape.exons); return objToEscape}()
  };

  function getColor(colorNumber, hue){
    var BREWER_PALETTE = [
      [228,26,28],
      [55,126,184],
      [77,175,74],
      [152,78,163],
      [255,127,0],
      [166,86,40],
      [247,129,191],
      [153,153,153]
    ];

    var colorTimes = Math.floor(colorNumber/BREWER_PALETTE.length);
    var colorRGB = BREWER_PALETTE[colorNumber % BREWER_PALETTE.length];
    colorRGB = colorRGB.map(function(a){return (a+colorTimes*30)%256;});
    return "rgba("+colorRGB.toString()+", "+hue+")";
  }

  function decompress_array(a){
    /**
     * Compress array represented by paired values: (times, number).
     *  e.g.: [1,0,2,4,5,100] ==> [0,4,4,100,100,100,100,100]
     * **/
    var out = [];
    for (var i=1; i<a.length; i=i+2){
      for (var j=0; j<a[i-1]; j++){
        out.push(a[i]);
      }
    }
    return out;
  }

  function loop_wrapper(l){
    var lfcs=[0], tps=[0.5,1,2,3,4,5,6,7,8,10,12];
    for (var t=1; t<=tps.length; t++){
      if (l.hasOwnProperty(tps[t]))
        lfcs.push(l[tps[t]]);
        delete l[tps[t]]
    }
    l.lfc = lfcs;
    l.start = Math.round((l.anchor1_start + l.anchor1_end)/2);
    l.end = Math.round((l.anchor2_start + l.anchor2_end)/2);
    return l
  }

  return {
    tpmToJson : function(o){
      return tpmToJson(o);
    },
    geneToJson : function(o){
      return geneToJson(o);
    },
    exonToJson : function(o){
      return exonToJson(o);
    },
    getColor: function(c, h){
      return getColor(c, h);
    },
    decompress_array: function(a){
      return decompress_array(a);
    },
    loopWrapper: function(l){
      return loop_wrapper(l)
    }
  }
})();