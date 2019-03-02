var express = require('express');
var app = express();
var fs = require('fs');
var passbook = require('passbookster');
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
const testFolder = './pass/';
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.set('port', process.env.PORT || 3000);


app.get('/', function (req, res) {
    res.send('Hi, there am node service to generate a pass. routes are /new-pass-creation, /get-created-pass/, /custom-page/ ..../passhtml{get}, /get-created-pass/{get}, /givemepass{post}, /givemepass{get} ');
});
// pass.pipe(fs.createWriteStream('./pass/eci.pkpass'));
//app.use(express.static('images'));
//app.use('/static', express.static(path.join(__dirname, 'images')));
app.post('/create-pass', function (req, res) {
    var requestBody = req.body.passDetails;
    var firstName = requestBody.leadingfields[0].firstName;
    var aptTime = requestBody.leadingfields[0].appointmentTime;
    var aptDate = requestBody.leadingfields[0].appointmentDate;;
    var provider = requestBody.leadingfields[0].providerName;;
    var dept = requestBody.leadingfields[0].locationInstructions;
    var getOtherFields = requestBody.backfields[0];
    var getAddr = requestBody.backfields[0].address1
        , state = getAddr.State
        , strAddr = getAddr.StreetAddress
        , postal = getAddr.PostalCode;
    const Addr = strAddr + state.Abbreviation + postal;
    const amount = getOtherFields.amount;
    const status = getOtherFields.paymentStatus;
    const message = getOtherFields.message;
    const contact = getOtherFields.contactReschedule;
    console.log('fields', requestBody, firstName, aptTime, aptDate ,provider, dept, getOtherFields);

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
    // console.log('req', req.body.passDetails);
    // var firstName = req.body.firstname;
    // var aptTime = req.body.appointmenttime;
    // var aptDate = req.body.appointmentdate;
    // var provider = req.body.provider;
    // var dept = req.body.department;
    // var addr = req.body.address;
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0
                , v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    //var appointmentTime = req.body.appointmentTime;
    var d = new Date();
    var passFields = {
            serialNumber: uuidv4()
            , barcode: {
                message: '123456789'
                , format: 'PKBarcodeFormatQR'
                , messageEncoding: 'iso-8859-1'
            }
            , organizationName: 'ECI'
            , description: "Express Check In QR code"
            , foregroundColor: 'rgb(255, 255, 255)'
            , backgroundColor: 'rgb(0, 106, 163)'
            , labelColor: 'rgb(255, 255, 255)'
            , "generic": {
                "primaryFields": [
                    {
                        "key": "depart"
                        , "label": "APPOITMENT IS FOR"
                        , "value": firstName
      }
    ]
                , "auxiliaryFields": [

                    {
                        "label": "DEPARTMNENT/LOCATION"
                        , "key": "depatmentNewName"
                        , "value": dept
      }
    ]
                , "backFields": [
                    {
                        "key": "passport"
                        , "label": "APPOITMENTS IS FOR"
                        , "value": firstName
      }
                    , {
                        "label": "DATE"
                        , "key": "flightNewName"
                        , "value": aptDate
      }
                    , {
                        "label": "TIME"
                        , "key": "flightNewName"
                        , "value": aptTime + "\r\n\r\nPlease arrive 15min earley"
      , }
                    , {
                        "label": "PROVIDER NAME"
                        , "key": "flightNewName"
                        , "value": provider
      }
                    , {
                        "label": "DEPARTMNENT/LOCATION"
                        , "key": "flightNewName"
                        , "value": dept
      }
                    , {
                        "label": "ADDRESS"
                        , "key": "flightNewName"
                        , "value": Addr
      }
                    , {
                        "label": "EST COST SHARE"
                        , "key": "flightNewName"
                        , "value": amount
      }
                    , {
                        "label": "PAYMENT STATUS"
                        , "key": "flightNewName"
                        , "value": status
      }
                    , {
                        "label": "CONTACT/RESCHEDULE"
                        , "key": "flightNewName"
                        , "value": contact
      }
                    , {
                        "label": "MESSAGE"
                        , "key": "flightNewName"
                        , "value": message
      , }
    ]
            }
            , icon: __dirname + '/images/icon.png'
            , icon2x: __dirname + '/images/icon@2x.png'
            , logo: __dirname + '/images/logo.png'
            , logo2x: __dirname + '/images/logo@2x.png'
        }
        //console.log('passFields', passFields);
   
    var pass = template.createPass(passFields);
    let storeId = uuidv4();
    res.setHeader('content-type', 'application/vnd.apple.pkpass');
    //pass.pipe(fs.createWriteStream('./pass/' + storeId + '.pkpass'));
    pass.pipe(fs.createWriteStream('./views/' + storeId + '.pkpass'));
    res.send(storeId);
    res.end();
});



app.get('/redirected-page', function (req, res) {
    const dirForPass = req.query.passId + ".pkpass";
    //const dirForPass =  "testpass.pkpass";
    console.log('query is :', dirForPass);
    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {
            console.log('list of files under pass', file);
            console.log('dirname', __dirname);
        });
    });
    //res.setHeader('content-type', 'application/vnd.apple.pkpass');
    res.render('index', {
        title: 'Hey'
        , message: dirForPass
    });
});
app.get('/custom-page/', function (req, res) {
    const orderID = req.query.id;
    //res.redirect('/redirected-page/' +  orderID);
    //res.setHeader('content-type', 'application/vnd.apple.pkpass');
    res.redirect(url.format({
        pathname: "/redirected-page"
        , query: {
            "passId": orderID
        , }
    }));
});

var server = app.listen(app.get('port'), function () {
    console.log('Listening on port ' + app.get('port'));
});
