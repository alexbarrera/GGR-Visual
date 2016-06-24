var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['gene_name'];


//DegsSearch = new SearchSource('gene_degs', fields, options);
TransSearch = new SearchSource('gene_tpms', ['gene'], options);
GenesSearch = new SearchSource('genes', ['gene'], options);
ExonsSearch = new SearchSource('exons', ['gene'], options);

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
    return TransSearch.getStatus().loading ||
      GenesSearch.getStatus().loading ||
      ExonsSearch.getStatus().loading;
  }
});

Template.searchResult.rendered = function(){
  GeneTpms = new TpmsD3();
  GeneTpms.init('.genes_container');
  TranscriptTpms = new TpmsD3();
  TranscriptTpms.init('.tpms_container');
  Session.set('selectedGenes', []);
  Session.set('transcriptData', []);
};

Array.prototype.pushIfNotIn = function(e){
  var containsObject = function (obj, list) {
    for (var x in list) {
      if (JSON.stringify(list[x]) === JSON.stringify(obj)) {
        return true;
      }
    }
    return false;
  };

  if (!containsObject(e, this)){
    this.push(e);
  }
};


Template.searchResult.events({
  'click': function(){
    $('.display_col').removeClass('hidden');
    $('.selected_genes').removeClass('hidden');
    $('#gene_name_span').text(this.gene.replace("<b>","").replace("</b>", ""));
    var gene_obj = utilsGGR.geneToJson(this);
    var gene_name = gene_obj.gene_name;
    var gene_name_stripped = gene_name.replace(/\(.*\)/, "");
    GeneTpms.addElement([gene_obj]);
    GeneTpms.renderChart();

    var trans = TransSearch.getData({}).filter(function (a){return a.gene == gene_name_stripped;}).map(utilsGGR.tpmToJson);
    TranscriptTpms.setData(trans);
    TranscriptTpms.renderChart();

    var exons = ExonsSearch.getData({}).filter(function (a){return a.gene == gene_name;}).map(utilsGGR.exonToJson)[0];
    peak_viewers.forEach(function(e, i){
      var tss;
      if (exons.strand == '+')
        tss = exons.exons[0][0];
      else
        tss = exons.exons[exons.exons.length-1][1];
      e.coords_domain([tss-100000, tss+100000]);
      e.exons(exons.exons);
      e.strand(exons.strand);
      e.render()
    });

    var selectedGenes = Session.get('selectedGenes');
    selectedGenes.pushIfNotIn({'gene': gene_name});
    Session.set('selectedGenes', selectedGenes);

    var transData = Session.get('transcriptData');
    transData.pushIfNotIn({'gene': gene_name, 'trans': trans});
    Session.set('transcriptData', transData);

    //var selectedGenes = Session.get('selectedGenes');
    //if (!selectedGenes.map(function(e){return e.gene === gene_name}).some(function(e){return e})) {
    //  selectedGenes.push({'gene': gene_name});
    //  Session.set('selectedGenes', selectedGenes);
    //}
  }

});

Template.searchBox.events({
  "keyup #search-box": _.throttle(function(e) {
    if (e.keyCode != 13) return;
    var text = $(e.target).val().trim();
    GenesSearch.search(text);
    TransSearch.search(text);
    ExonsSearch.search(text);
  }, 200)
});

Template.genes_chart.events({
  "click .displayToggle": function(event) {
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

peak_viewers = [];
Template.peak_vizs.rendered = function(){
  var viewers_sel=$('.peak-viewer');
  viewers_sel.each(function(){
    peak_viewers.push(PeakviewerD3())
  });
  peak_viewers.forEach(function(e, i){
    e.render(viewers_sel[i].getAttribute("class").split(" ").map(function(e){return "."+e}).join(""))
  });
  TimesliderD3.render(".slider_container", peak_viewers);
};

Template.peak_vizs.events({
  "click .download-hist-mods": function() {
    downloadSVG('hist_mod_container');
  },
  "click .download-tfs": function() {
    downloadSVG('tf_container');
  },
  "change #resolution": function() {
    var res = event.target.value;
    peak_viewers.forEach(function(e){
      e.resolution(parseInt(res));
      e.render()
    });
  }
});

Template.genesSelected.helpers({
  selectedGenes: function(){
    return Session.get('selectedGenes');
  }
});

Template.genesSelected.events({
  'click .delete-gene': function(event, template){
      var selectedGenes = Session.get('selectedGenes');
      var sel_gene = this.gene;
      var filteredSelected = selectedGenes.filter(function(e){ return e.gene != sel_gene; });
      Session.set('selectedGenes', filteredSelected);
      GeneTpms.removeElement({'gene_name': sel_gene});
      GeneTpms.renderChart();

      var transcData = Session.get('transcriptData');
      Session.set('transcriptData', transcData.filter(function(e){return e.gene != sel_gene}));
    },
  'click .selected_gene_name': function(){
    var sel_gene = this.gene;
    var transcData = Session.get('transcriptData');
    var selectedTranscipts = transcData.filter(function(e){return e.gene === sel_gene});
    TranscriptTpms.setData(selectedTranscipts[0].trans);
    TranscriptTpms.renderChart();
  }
});