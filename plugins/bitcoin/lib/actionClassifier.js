const { BayesClassifier } = require("natural");

const classifier = new BayesClassifier();

module.exports = classifier;

classifier.addDocument("price", "price");
classifier.addDocument(["price", "in"], "price");

classifier.addDocument("balance", "balance");
classifier.addDocument(["balance", "of"], "balance");

classifier.addDocument("10€", "tobtc");
classifier.addDocument("100EUR", "tobtc");
classifier.addDocument("10USD", "tobtc");
classifier.addDocument("10$", "tobtc");
classifier.addDocument("1221.123$", "tobtc");
classifier.addDocument("11232890$", "tobtc");
classifier.addDocument("1221.122013€", "tobtc");

classifier.train();