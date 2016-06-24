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
    }
  }
})();