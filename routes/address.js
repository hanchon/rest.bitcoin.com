let express = require('express');
let router = express.Router();

let BITBOXCli = require('bitbox-cli/lib/bitboxcli').default;
let BITBOX = new BITBOXCli({
  protocol: 'http',
  host: "138.68.54.100",
  port: "8332",
  username: "bitcoin",
  password: "xhFjluMJMyOXcYvF"
});

let axios = require('axios');

router.get('/', function(req, res, next) {
  res.json({ status: 'address' });
});

router.get('/details/:address', function(req, res, next) {
  try {
    let addresses = JSON.parse(req.params.address);
    let result = [];
    addresses = addresses.map(function(address) {
      return BITBOX.Address.details(address)
    })
    axios.all(addresses)
    .then(axios.spread(function (...spread) {
      result.push(...spread);
      res.json(result);
    }));
  }
  catch(error) {
    axios.get(`https://explorer.bitcoin.com/api/bch/addr/${BITBOX.Address.toLegacyAddress(req.params.address)}`)
    .then((result) => {
      delete result.data.addrStr;
      result.data.legacyAddress = BITBOX.Address.toLegacyAddress(req.params.address);
      result.data.cashAddress = BITBOX.Address.toCashAddress(req.params.address);
      res.json(result.data);
    }, (err) => {
      console.log(err);
    });
  }
});

router.get('/utxo/:address', function(req, res, next) {
  try {
    let addresses = JSON.parse(req.params.address);
    let result = [];
    addresses = addresses.map(function(address) {
      return BITBOX.Address.utxo(address)
    })
    axios.all(addresses)
    .then(axios.spread(function (...spread) {
      result.push(...spread);
      res.json(result);
    }));
  }
  catch(error) {
    axios.get(`https://explorer.bitcoin.com/api/bch/addr/${BITBOX.Address.toLegacyAddress(req.params.address)}/utxo`)
    .then((result) => {
      result.data.forEach((data) => {
        delete data.address;
        data.legacyAddress = BITBOX.Address.toLegacyAddress(req.params.address);
        data.cashAddress = BITBOX.Address.toCashAddress(req.params.address);
      })

      res.json(result.data);
    }, (err) => { console.log(err);
    });
  }
});

router.get('/unconfirmed/:address', function(req, res, next) {
  try {
    let addresses = JSON.parse(req.params.address);
    let result = [];
    addresses = addresses.map(function(address) {
      return BITBOX.Address.unconfirmed(address)
    })
    axios.all(addresses)
    .then(axios.spread(function (...spread) {
      result.push(...spread);
      res.json(result);
    }));
  }
  catch(error) {
    axios.get(`https://explorer.bitcoin.com/api/bch/addr/${BITBOX.Address.toLegacyAddress(req.params.address)}/utxo`)
    .then((result) => {
      let unconfirmed = [];
      result.data.forEach((data) => {
        delete data.address;
        data.legacyAddress = BITBOX.Address.toLegacyAddress(req.params.address);
        data.cashAddress = BITBOX.Address.toCashAddress(req.params.address);
        if(data.confirmations === 0) {
          unconfirmed.push(data);
        }
      })

      res.json(unconfirmed);
    }, (err) => { console.log(err); });
  }
});

module.exports = router;
