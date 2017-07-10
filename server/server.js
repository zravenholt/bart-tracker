var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var PORT = process.env.PORT || 9001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/bundles', express.static(path.join(__dirname, '../bundles')));

app.listen(PORT, function() {
  console.log('BART: Express server connection established at: ', PORT);
});