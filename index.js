// init project
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = module.exports = express();
const port = process.env.PORT || 3000;
const Bing = require('node-bing-api')({accKey: 'ad1fcf4cc9f54ca391a4586a844276fd'});
const searchTerm = require('./models/searchTerm');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/searchTerms');
app.use(bodyParser.json());
app.use(cors());

//GET all terms from db
app.get('/api/recentsearches', (req, res) => {
  searchTerm.find({}, (err, data) => {
    res.json(data);
  });
});

//GET call with required/not required params for image search
app.get('/api/imagesearch/:searchVal*', (req, res) => {
  let {searchVal} = req.params;
  let {offset} = req.query;

  let data = new searchTerm({searchVal, searchDate: new Date()});
  //save to searchterm values
  data.save(err => {
    if (err) {
      res.send('Error saving to database')
    }
  });

  let searchOffset;
  //Does offset exist
  if (offset) {
    if(offset==1) {
      offset=0;
      searchOffset=1;
    }
    else if (offset > 1) {
      searchOffset=offset+1;
    }
  } else {
    offset=0;
    searchOffset=offset+1;
  }

  Bing.images(searchVal, {
    top: (10 ),
    skip: (10 )
  }, (error, rez, body) => {
    let bingData = [];
    for (let i = 0; i < 10; i++) {
      bingData.push({url: body.value[i].webSearchUrl, snippet: body.value[i].name, thumbnail: body.value[i].thumbnailUrl, context: body.value[i].hostPageDisplayUrl});
    }
    res.json(bingData);
  });
});

app.use(express.static(`${__dirname}/public`));

app.listen(port, () => {
  console.log(`Your app is listening on port: ${port}`);
});
