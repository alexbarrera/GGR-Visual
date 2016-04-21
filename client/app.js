var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['gene_name'];


DegsSearch = new SearchSource('gene_degs', fields, options);
TpmsSearch = new SearchSource('gene_tpms', ['gene'], options);

Template.searchResult.helpers({
  getGenes: function() {
    return DegsSearch.getData({
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "<b>$&</b>")
      },
      sort: {gene_name: 1}
    });
  },

  isLoading: function() {
    return DegsSearch.getStatus().loading && TpmsSearch.getStatus().loading;
  }
});

Template.searchResult.events({
  'click': function(){
    $('.display_col').removeClass('hidden');
    $('#gene_name_span').text(this.gene_name.replace("<b>","").replace("</b>", ""));
    var gene_obj = utilsGGR.degToJson(this);
    DegsD3.addElement([gene_obj]);
    DegsD3.renderChart('.degs_container');
    var foo = TpmsSearch.getData({}).filter(function (a){return a.gene == gene_obj.gene_name;}).map(utilsGGR.tpmToJson);
    TpmsD3.addElement(foo);
    TpmsD3.renderChart('.tpms_container');


  }
});

Template.searchBox.events({
  "keyup #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    DegsSearch.search(text);
    TpmsSearch.search(text);
  }, 200)
});

Template.degs_chart.events({
  "click .displayToggle": function() {
    DegsD3.toggleDisplayType('log2fc');
    var textContent = event.srcElement.textContent;
    event.srcElement.textContent =  textContent == 'show log2 fold change' ? 'show normalized counts' : 'show log2 fold change';
  }
});
