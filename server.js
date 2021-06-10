require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

const Url = require('./App.js').UrlModel
const createUrl = require('./App.js').createAndSaveUrl
const findOneByShortUrl = require('./App.js').findOneByShortUrl
const findOneByOriginalUrl = require('./App.js').findOneByOriginalUrl

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:short_url', function(req, res) {
  const short_url = req.params.short_url
  findOneByShortUrl(short_url, function(err, data) {
    if (err) {
      console.error(err)
    } else if (!data) {
      console.error(`No record found under short URL ${short_url}`)
    } else {
      const redirect_url = data.original_url
      console.log("redirect URL", redirect_url)
      res.redirect(redirect_url)
    }
  })

})
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url

  if (isValidUrl(originalUrl)) {
    findOneByOriginalUrl(originalUrl, (err, data) => {
      if (err) {
        console.error(err)
      } else if (!data) {
        console.log('New Original Url')
        createUrl(originalUrl, (err, data) => {
          if (err) {
            console.error(err)
          } else {
            console.log("save successful", data)
            res.json({ 
              original_url: data.original_url,
              short_url: data.short_url
            });
          }
        })
      } else {
        res.json({
          error: 'URL already exists'
        })
      }
    })
  } else {
    res.json({
      error: 'invalid url'
    })
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function isValidUrl(urlString) {
  // regex pattern borrowed from:
  // https://www.codegrepper.com/code-examples/javascript/how+to+check+for+a+valid+url+format+in+js
  const regex = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i');
  return urlString.match(regex)
}

