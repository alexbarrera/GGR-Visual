Meteor.subscribe("dges");
Template.body.helpers({
  dges: function(){
    var foo = Dges.find({}, {limit:1});
    console.log(foo.fetch());
    return foo;
  }
});


var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['gene_name'];

GeneSearch = new SearchSource('dges', fields, options);

Template.searchResult.helpers({
  getGenes: function() {
    return GeneSearch.getData({
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "<b>$&</b>")
      }
      ,
      sort: {gene_name: 1}
    });
  },

  isLoading: function() {
    return GeneSearch.getStatus().loading;
  }
});

Template.searchResult.events({
  'click': function(){
    console.log(this.gene_name.replace("<b>","").replace("</b>", "") + " clicked!");
    DegsD3.addElement([utilsGGR.toJSON(this)]);
    DegsD3.renderChart();
  }
});

Template.searchBox.events({
  "keyup #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    GeneSearch.search(text);
  }, 200)
});

Template.degs_chart.events({
  "click .displayToggle": function() {
    DegsD3.toggleDisplayType('log2fc');
  }
});
