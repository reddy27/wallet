var express = require('express');
var app = express();
var fs = require('fs');
var passbook = require('passbookster');
var path = require('path');
var cors = require('cors');
app.use(cors());
var bodyParser = require('body-parser');
app.use(bodyParser());
app.use(bodyParser.urlencoded());
const pug = require('pug');
app.set('view engine', 'pug');
app.use(express.static('pass'));
app.use(express.static('static'));
app.use(express.static('images'));
const url = require('url');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('port', process.env.PORT || 3000 );

var passFields = {
      serialNumber:        'E5982H-I2',
      barcode: {
        message:         '123456789',
        format:          'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      },
      organizationName: 'ECI',
      logoText:         'ECI',
      description:      'ECI Appt confirmation',
      foregroundColor:  'rgb(22, 55, 110)',
      backgroundColor:  'rgb(13, 93, 141)',
     generic : {
    primaryFields : [
      {
        key : 'name',
        label : "NAME",
        value : "Pramod"
      }
    ],
    secondaryFields : [
      {
        key : "title",
        label : "TITLE",
        value : "A Cool Product Owner"
      }
    ],
    auxiliaryFields : [
      {
        key : "email",
        label : "EMAIL",
        value : "JAD@test.com"
      },
      {
        key : "twitter",
        label : "Appointment",
        value : "10:40Pm"
      }
    ],
    backFields : [
      {
        label : "NAME",
        key : "nameBack",
        value : "kp.org"
      }
    ]
  },
      icon:   __dirname + '/images/icon.png',
      icon2x: __dirname + '/images/icon@2x.png',
      logo:   __dirname + '/images/logo.png',
      logo2x: __dirname + '/images/logo@2x.png'
    }

var template = passbook.createTemplate('generic', {
  passTypeIdentifier: 'pass.org.kp.eciwalletpoc',
  teamIdentifier:     'NP763NDP24',
  organizationName:   'kp.org', 
}, {
  certs: {
    wwdr: './certificate/wwdr.pem',
    pass: './certificate/CertificateName.pem', // pem with certificate and private key
    password: 'cadillaC5!' // pass phrase for the pass_cert.pem file
  }
});



// var pass = template.createPass(passFields);

// pass.pipe(fs.createWriteStream('./pass/eci.pkpass'));

//app.use(express.static('images'));
//app.use('/static', express.static(path.join(__dirname, 'images')));

app.get('/passhtml', function(req, res){
  console.log('pass', __dirname + '/images/button.html');
  res.sendFile(__dirname + '/images/button.html');
});

app.post('/create-pass', function(req, res){
  var d =  Date();
  var slicedDate =  d.slice(15, 25);
  date = slicedDate.replace(/\s/g, '');
  var description = req.body.label;
//var appointmentTime = req.body.appointmentTime;
  var passFields = {
      serialNumber:        'E5982H-I2',
      barcode: {
        message:         '123456789',
        format:          'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      },
      organizationName: 'ECI',
      logoText:         'KAISER PERMEANTE',
      description:      "ECI confirmation",
      foregroundColor:  'rgb(22, 55, 110)',
      backgroundColor:  'rgb(13, 93, 141)',
     generic : {
    primaryFields : [
      {
        key : 'name',
        label : "NAME",
        value : description
      }
    ],
    auxiliaryFields : [
      {
        key : "email",
        label : "EMAIL",
        value : "JAD@test.com"
      },
      {
        key : "twitter",
        label : "Appointment",
        value : "10:30pm"
      }
    ],
    backFields : [
      {
        label : "NAME",
        key : "nameBack",
        value : "kp.org"
      }
    ]
  },
      icon:   __dirname + '/images/icon.png',
      icon2x: __dirname + '/images/icon@2x.png',
      logo:   __dirname + '/images/logo.png',
      logo2x: __dirname + '/images/logo@2x.png'
    }
      //console.log('passFields', passFields);
      function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }

      var pass = template.createPass(passFields);
      let storeId = uuidv4();
      res.setHeader('content-type', 'application/vnd.apple.pkpass');
      pass.pipe(fs.createWriteStream('./pass/' + storeId + '.pkpass'));
      pass.pipe(fs.createWriteStream('./views/' + storeId + '.pkpass'));
      res.send(storeId);
      res.end();
});

app.get('/', function(req, res){
  res.send('Hi, there am node service to generate a pass. routes are /passhtml{get}, /get-created-pass/{get}, /givemepass{post}, /givemepass{get} ');
});
app.get('/get-created-pass/', cors(), function (req, res) {
  //const orderID = req.query.id;
  console.log('query', req);
  res.setHeader('content-type', 'application/vnd.apple.pkpass');
  res.sendFile( orderID + '.pkpass', { root: path.join(__dirname, './pass') });
  res.end();

});

app.get('/redirected-page', function(req, res){
    const dirForPass = req.query.a + ".pkpass";
    console.log('dirForPass', dirForPass);
    res.render('index', { title: 'Hey', message: dirForPass });
});

app.get('/custom-page/', function (req, res) {
   const orderID = req.query.id;
   //res.redirect('/redirected-page/' +  orderID);
    res.redirect(url.format({
       pathname:"/redirected-page",
       query: {
          "a": orderID,
        }
     }));

});


app.get('/givemepass', cors(), function (req, res) {
  console.log('pass location', __dirname);
  res.setHeader('content-type', 'application/vnd.apple.pkpass');
  res.sendFile('pass.pkpass', { root: path.join(__dirname, './pass') });
  res.end();
});
var server = app.listen(app.get('port'), function() {
  console.log('Listening on port ' + app.get('port'));
});