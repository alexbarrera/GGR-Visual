// This is seen both by the client and server, be careful!
//Dges = new Mongo.Collection("degs");
Tpms = new Mongo.Collection("tpms");
Genes = new Mongo.Collection("genes");
Exons = new Mongo.Collection("exons");
HistoneMods = {};
['H3K4me1', 'H3K4me2', 'H3K4me3', 'H3K9me3', 'H3K27ac'].map(function(factor){
  HistoneMods[factor] = new Mongo.Collection(factor);
});

Tfs = {};
['GR', 'HES2', 'EP300', 'GR', 'FOSL2', 'BCL3', 'cJun', 'CTCF', 'JunB'].map(function(factor){
  Tfs[factor] = new Mongo.Collection(factor);
});

Dnases = {
  'DNaseI': new Mongo.Collection("DNaseI")
};