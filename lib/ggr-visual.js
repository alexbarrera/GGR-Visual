// This is seen both by the client and server, be careful!
//Dges = new Mongo.Collection("degs");
Tpms = new Mongo.Collection("tpms");
Genes = new Mongo.Collection("genes");
Exons = new Mongo.Collection("exons");
HistoneMods = {};
['H3K4me3'].map(function(factor){
  HistoneMods[factor] = new Mongo.Collection(factor);
});

Tfs = {};
['GR'].map(function(factor){
  Tfs[factor] = new Mongo.Collection(factor);
});

Dnases = {
  'DNaseI': new Mongo.Collection("DNaseI")
};