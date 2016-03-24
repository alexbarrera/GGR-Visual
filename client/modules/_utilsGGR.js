/**
 * Created by abarrera on 2/29/16.
 */
utilsGGR = (function(){

  String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };

  var toJSON = function(objToEscape){
    return {
      gene_name: objToEscape.gene_name.replaceAll("[<b>|</b>]",""),
      means: JSON.parse(objToEscape.means),
      sds: JSON.parse(objToEscape.sds),
      log2fcs: JSON.parse(objToEscape.log2fcs)
    }
  };

  return {
    toJSON: function(o){
      return toJSON(o);
    }
  }
})();