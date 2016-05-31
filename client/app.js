var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['gene_name'];


//DegsSearch = new SearchSource('gene_degs', fields, options);
TransSearch = new SearchSource('gene_tpms', ['gene'], options);
GenesSearch = new SearchSource('genes', ['gene'], options);

Template.searchResult.helpers({
  getGenes: function() {
    return GenesSearch.getData({
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "<b>$&</b>")
      },
      sort: {gene: 1}
    });
  },

  isLoading: function() {
    return TransSearch.getStatus().loading || GenesSearch.getStatus().loading;
  }
});

Template.searchResult.rendered = function(){
  GeneTpms = new TpmsD3();
  GeneTpms.init('.genes_container');
  TranscriptTpms = new TpmsD3();
  TranscriptTpms.init('.tpms_container');
};

Template.searchResult.events({
  'click': function(){
    $('.display_col').removeClass('hidden');
    $('#gene_name_span').text(this.gene.replace("<b>","").replace("</b>", ""));
    var gene_obj = utilsGGR.geneToJson(this);
    var gene_name_stripped = gene_obj.gene_name.replace(/\(.*\)/, "");
    GeneTpms.addElement([gene_obj]);
    GeneTpms.renderChart();
    var trans = TransSearch.getData({}).filter(function (a){return a.gene == gene_name_stripped;}).map(utilsGGR.tpmToJson);
    TranscriptTpms.setData(trans);
    TranscriptTpms.renderChart();
  }
});

Template.searchBox.events({
  "keyup #search-box": _.throttle(function(e) {
    if (e.keyCode != 13) return;
    var text = $(e.target).val().trim();
    GenesSearch.search(text);
    TransSearch.search(text);
  }, 200)
});

Template.genes_chart.events({
  "click .displayToggle": function() {
    GeneTpms.toggleDisplayType('log2fc');
    var textContent = event.srcElement.textContent;
    event.srcElement.textContent =  textContent == 'show log2 fold change' ? 'show TPMs' : 'show log2 fold change';
  },
  "click .download-degs": function(){
    downloadSVG('genes_container');
  },
  "click .download-tpms": function(){
    downloadSVG('tpms_container');
  }
});

Template.peak_vizs.rendered = function(){
  var viewers_sel=$('.peak-viewer');
  var viewers = [];
  viewers_sel.each(function(){viewers.push(PeakviewerD3())});
  viewers.forEach(function(e, i){
    e.render(viewers_sel[i].getAttribute("class").split(" ").map(function(e){return "."+e}).join(""))
  });
  //var hist_mod_viewer = PeakviewerD3().render(".hist_mod_container");
  //var tf_viewer = PeakviewerD3().render(".tf_container");
  //var dnase_viewer = PeakviewerD3().render(".dnase_container");
  TimesliderD3.render(".slider_container", viewers);
};

Template.peak_vizs.events({
  "click .download-hist-mods": function() {
    downloadSVG('hist_mod_container');
  },
  "click .download-tfs": function() {
    downloadSVG('tf_container');
  },
  "click .download-dnases": function() {
    downloadSVG('dnase_container');
  }
});