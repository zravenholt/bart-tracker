let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let path = require('path');
let PORT = process.env.PORT || 9001;
let axios = require('axios');
let DOMParser = require('xmldom').DOMParser;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/bundles', express.static(path.join(__dirname, '../bundles')));

//credit for this function goes to David Walsh 
// --> https://davidwalsh.name/convert-xml-json
function xmlToJson(xml) {

  var obj = {};

  if (xml.nodeType == 1) { // element
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) { // text
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
    obj = xml.childNodes[0].nodeValue;
  }	else if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof(obj[nodeName]) == 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof(obj[nodeName].push) == 'undefined') {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

let bartData = {};

let getBART = () => {
  console.log('retrieving bart data');
  axios.get('http://api.bart.gov/api/etd.aspx?cmd=etd&orig=ALL&key=MW9S-E7SL-26DU-VV8V')
    .then(function(response) {
      let xml = response.data;
      let xmlDOM = new DOMParser().parseFromString(xml, 'text/xml');
      let jsonConverted = xmlToJson(xmlDOM);
      bartData = jsonConverted;
      console.log('response:', jsonConverted);
    });
};

app.get('/retrieveData', (req, res) => {
  res.send(bartData);
});


app.listen(PORT, function() {
  console.log('BART: Express server connection established at: ', PORT);
});

getBART();