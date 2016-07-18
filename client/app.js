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

var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};

/** Define search sources **/
var TransSearch = new SearchSource('gene_tpms', ['gene'], options),
  GenesSearch = new SearchSource('genes', ['gene'], options),
  ExonsSearch = new SearchSource('exons', ['gene'], options);

var hist_mods = ['H3K4me1', 'H3K4me2', 'H3K4me3', 'H3K9me3', 'H3K27ac'];
var tfs = ['GR'];
var peak_viewers_set = ['hist_mods', 'tfs'];

var HistModSearches = hist_mods.map(function(e){return new SearchSource(e, ['gene_id'], options)});
var TfSearches = tfs.map(function(e){return new SearchSource(e, ['gene_id'], options)});

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

      e.tss(tss);
      e.data({
        coords_dom: [tss-5000, tss+5000],
        exons: exons.exons,
        strand: exons.strand,
        tp: 0,
        resolution: 5
      });
    });


    HistModSearches.map(function(histModSearch, i){
      histModSearch.search(/\((.*)\)/.exec(gene_name)[1]);
    });

    TfSearches.map(function(tfSearch, i){
      tfSearch.search(/\((.*)\)/.exec(gene_name)[1]);
    });

    Session.set('peaksGene', gene_name);

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
    var textContent = event.currentTarget.textContent;
    event.currentTarget.textContent =  textContent == 'show log2 fold change' ? 'show TPMs' : 'show log2 fold change';
  },
  "click .download-degs": function(){
    downloadSVG('genes_container');
  },
  "click .download-tpms": function(){
    downloadSVG('tpms_container');
  }
});

var peak_viewers = [];
Template.peak_vizs.rendered = function(){
  var viewers_sel=$('.peak-viewer');
  viewers_sel.each(function(){
    peak_viewers.push(PeakviewerD3())
  });
  peak_viewers.forEach(function(e, i){
    e.container(viewers_sel[i].getAttribute("class").split(" ").map(function(e){return "."+e}).join(""))
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
    var res = parseInt(event.target.value);
    peak_viewers.forEach(function(e){
      e.resolution(res);
      // Update elements depending of the resolution
      e.coords_domain([e.tss() - res*1000, e.tss() + res*1000]);
      e.data().reads_dom = [0, d3.max(e.data().elems.map(function(ee){
        return d3.max(ee.reads.map(function(eee){
          return d3.max(eee[e.resolutions_set().indexOf(res)])
        }))
      }))];
      e.coords_domain([e.tss() - res*1000, e.tss() + res*1000]);
      e.render()
    });
  },
  "click #play-timeslider": function() {
    TimesliderD3.togglePlay("#play-timeslider")
  }
});

Template.peak_vizs.helpers({
  isLoading: function(){
    return TfSearches.map(function(e){return e.getStatus().loading}).some(function(e){return e})
      || HistModSearches.map(function(e){e.getStatus().loading}).some(function(e){return e});
  },
  geneForPeakUndef: function(){
    return Session.get('peaksGene') == undefined;
  },
  render: function(){
    var gene_name = Session.get('peaksGene');
    var pv_index = peak_viewers_set.indexOf('tfs');
    TfSearches.map(function(tfSearch, i) {
      var reads = tfSearch.getData({})
        .filter(function (a) {
          return gene_name.indexOf(a.gene_id) > 0;
        })
        .map(function (e) {
          e.reads = JSON.parse(e.reads);
          return e
        })[0];

      peak_viewers[pv_index].data().reads_dom = [0, d3.max(reads.reads.map(function (e) {return d3.max(e[0])}))];
      if (peak_viewers[pv_index].data().elems)
        peak_viewers[pv_index].data().elems.push({'reads': reads.reads, 'name': tfs[i]});
      else
        peak_viewers[pv_index].data().elems = [{'reads': reads.reads, 'name': tfs[i]}];
      peak_viewers[pv_index].render()
    });

    HistModSearches.map(function(histModSearch, i){
      histModSearch.search(/\((.*)\)/.exec(gene_name)[1]);
      var pv_index = peak_viewers_set.indexOf('hist_mods');
        var reads = histModSearch.getData({})
          .filter(function(a){return gene_name.indexOf(a.gene_id)>0;})
          .map(function(e){e.reads = JSON.parse(e.reads); return e})[0];

        if (peak_viewers[pv_index].data().elems)
          peak_viewers[pv_index].data().elems.push({'reads': reads.reads, 'name': hist_mods[i]});
        else
          peak_viewers[pv_index].data().elems = [{'reads': reads.reads, 'name': hist_mods[i]}];

        peak_viewers[pv_index].data().reads_dom = [0, d3.max(peak_viewers[pv_index].data().elems.map(function(ee){
          return d3.max(ee.reads.map(function(eee){
            return d3.max(eee[0])
          }))
        }))];

        peak_viewers[pv_index].render()
    });
  }
});

Template.genesSelected.helpers({
  selectedGenes: function(){
    return Session.get('selectedGenes');
  }
});

Template.genesSelected.events({
  'click .delete-gene': function(){
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