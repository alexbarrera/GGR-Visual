/**
 * Created by abarrera on 3/24/16.
 */
//SearchSource.defineSource('gene_degs', function(searchText, options) {
//  options = options || {limit: 20}; //sort: {gene_name: 1}, limit: 20};
//  if(searchText) {
//    var regExp = buildRegExp(searchText);
//    var selector = {gene_name: regExp};
//    return Dges.find(selector, options).fetch();
//  }
//  else {
//    return []; //Dges.find({}, options).fetch();
//  }
//});

SearchSource.defineSource('gene_tpms', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {gene: regExp};
    return Tpms.find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('genes', function(searchText, options) {
  options = options || {limit:50};
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {gene: regExp};
    return Genes.find(selector, options).fetch();
  }
  else {
    return [];
  }
});

function buildRegExp(searchText) {
  // this is a dumb implementation
  var parts = searchText.trim().split(/[ :,]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}