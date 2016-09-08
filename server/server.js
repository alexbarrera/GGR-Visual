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

SearchSource.defineSource('H3K4me1', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return HistoneMods['H3K4me1'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('H3K4me2', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return HistoneMods['H3K4me2'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('H3K4me3', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return HistoneMods['H3K4me3'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('H3K27ac', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return HistoneMods['H3K27ac'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('H3K9me3', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return HistoneMods['H3K9me3'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('GR', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return Tfs['GR'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('HES2', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return Tfs['HES2'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('EP300', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return Tfs['EP300'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('CEBPB', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return Tfs['CEBPB'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('FOSL2', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return Tfs['FOSL2'].find(selector, options).fetch();
  }
  else {
    return [];
  }
});

SearchSource.defineSource('BCL3', function(searchText, options) {
  options = options || {};
  if(searchText) {
    var selector = {gene_id: searchText};
    return Tfs['BCL3'].find(selector, options).fetch();
  }
  else {
    return [];
  }
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

function buildRegExp(searchText) {
  var parts = searchText.trim().split(/[ :,]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}