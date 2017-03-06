/**
 * Created by abarrera on 3/24/16.
 */

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
  options = options || {limit:20};
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {gene: regExp};
    return Genes.find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('exons', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {gene: regExp};
    return Exons.find(selector, options).fetch();
  }
  else {
    return [];
  }
});


['H3K4me3'].map(function(factor){
  SearchSource.defineSource(factor, function(searchText, options) {
    options = options || {};
    if(searchText) {
      var selector = {gene_id: searchText};
      return HistoneMods[factor].find(selector, options).fetch();
    }
    else {
      return [];
    }
  });
});


['GR'].map(function(factor){
  SearchSource.defineSource(factor, function(searchText, options) {
    options = options || {};
    if(searchText) {
      var selector = {gene_id: searchText};
      return Tfs[factor].find(selector, options).fetch();
    }
    else {
      return [];
    }
  });
});


SearchSource.defineSource('DNaseI', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return Dnases['DNaseI'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('loops', function(searchValues, options) {
  options = options || {};
  if (searchValues){
    searchValues = JSON.parse(searchValues);
    var selector = {
      $and: [
        { anchor1_chr: searchValues.chrom},
        { anchor2_chr: searchValues.chrom},
        { anchor2_end: {$gt: searchValues.coord1}},
        { anchor1_start: {$lt: searchValues.coord2}}
    ]
    };
    return Loops.find(selector, options).fetch();

  }
  else{
    return []
  }

});

function buildRegExp(searchText) {
  var parts = searchText.trim().split(/[ :,]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}