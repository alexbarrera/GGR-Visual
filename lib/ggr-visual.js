// This is seen both by the client and server, be careful!
//Dges = new Mongo.Collection("degs");
Tpms = new Mongo.Collection("tpms");
Genes = new Mongo.Collection("genes");
Exons = new Mongo.Collection("exons");
HistoneMods = {
  'H3K4me1': new Mongo.Collection("H3K4me1"),
  'H3K4me2': new Mongo.Collection("H3K4me2"),
  'H3K4me3': new Mongo.Collection("H3K4me3"),
  'H3K27ac': new Mongo.Collection("H3K27ac"),
  'H3K9me3': new Mongo.Collection("H3K9me3")

};
Tfs = {
  'GR': new Mongo.Collection("GR")
};
Dnases = {
  'DNaseI': new Mongo.Collection("DNaseI")
};