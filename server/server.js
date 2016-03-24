/**
 * Created by abarrera on 3/24/16.
 */
Meteor.publish("dges", function () {
  var dges = Dges.find({}, {limit:1000});
  return dges;
});

SearchSource.defineSource('dges', function(searchText, options) {
  var options = {limit: 20}; //sort: {gene_name: 1}, limit: 20};
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {gene_name: regExp};
    //console.log(Dges);
    return Dges.find(selector, options).fetch();
  } else {
    return Dges.find({}, options).fetch();
  }
});

function buildRegExp(searchText) {
  // this is a dumb implementation
  var parts = searchText.trim().split(/[ \-\:]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}