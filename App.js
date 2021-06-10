require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose

const mongoUri = process.env.MONGO_URI;

mongoose.set('useFindAndModify', false); 
  // See https://mongoosejs.com/docs/deprecations.html#findandmodify

mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

const urlSchema = new Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    required: true
  }
})

const Url = mongoose.model('Url', urlSchema)

function createAndSaveUrl(original_url, done) {
  console.log('[createAndSaveUrl] ', original_url)
  createRandomShortUrl((err, short_url) => {
    if (err) {
      console.error(err)
    } else if (!short_url) {
      console.log('[createAndSaveUrl] Error in creating shortUrl')
      done({
        error: 'No short URL created'
      })
    }

    const url = new Url({
      original_url: original_url,
      short_url: short_url
    })

    url.save(function(err, data) {
      if (err) { 
        done(err)
      } else {
        done(null, data)
      }
    })
  })

  
}

const findOneByShortUrl = (shortUrl, done) => {
  Url.findOne({ short_url: shortUrl }, (err, data) => {
    if (err) {
      console.error(err)
      done(err)
    } else if (!data) {
      console.log(`[findOneByShortUrl] No record found for ${shortUrl}`)
      done(null, null)
    } else {
      console.log(`[findOneByShortUrl] Record found: ${data}`)
      done(null, data)
    }
  })
};

const findOneByOriginalUrl = (originalUrl, done) => {
  Url.findOne({ original_url: originalUrl }, (err, data) => {
    if (err) {
      console.error(err)
      done(err)
    } else if (!data) {
      console.log(`[findOneByOriginalUrl] No record found for ${originalUrl}`)
      done(null, null)
    } else {
      console.log(`[findOneByOriginalUrl] Record found: ${data}`)
      done(null, data)
    }
  })
};


function createRandomShortUrl(next) {
  const shortUrl = Math.floor(Math.random()*9999)

  findOneByShortUrl(shortUrl, (err, data) => {
    if (err) {
      console.error(err)
      next(err)
    } else if (!data) {
      console.log('[createRandomShortUrl] No duplicates. Safe to proceed.', shortUrl)
      next(null, shortUrl)
    } else {
      console.log('[createRandomShortUrl] Duplicates found. Trying a new number.', shortUrl)
      createRandomShortUrl()
    }
  })
}

exports.UrlModel = Url;
exports.createAndSaveUrl = createAndSaveUrl;
exports.findOneByShortUrl = findOneByShortUrl;
exports.findOneByOriginalUrl = findOneByOriginalUrl;

/*
const personSchema = new Schema({
  name : {
    type: String,
    required: true
  },
  age :  Number,
  favoriteFoods : [String
  ]
});

const Person = mongoose.model('Person', personSchema);

const createAndSavePerson = (done) => {
  const person = new Person({
    name: 'Yusei',
    age: 9,
    favoriteFoods: ['not peppermint', 'sushi'
    ]
  })

  person.save(function(err, data) {
    if (err) { 
      done(err)
    } else {
      done(null, data)
    }
  })
};

const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, function(err, data) {
    if (err) {
      console.error(err)
      done(err)
    } else {
      done(null, data)
    }
  })
};

const findPeopleByName = (personName, done) => {
  Person.find({name: personName
  }, function(err, data) {
    if (err) {
      console.error(err)
      done(err)
    } else {
      done(null, data)
    }
  })
};

const findOneByFood = (food, done) => {
  Person.findOne({favoriteFoods: food
  }, (err, data) => {
    if (err) {
      console.error(err)
      done(err)
    } else if (!data) {
      console.log(`[findOneByFood
      ] No record found for ${food
      }`)
    } else {
      console.log(`[findOneByFood
      ] Record found: ${data
      }`)
      done(null, data)
    }
  })
};

const findPersonById = (personId, done) => {
  Person.findById(personId, (err, data) => {
    if (err) {
      console.error(err)
      done(err)
    } else if (!data) {
      console.log(`[findPersonByID
      ] No record found for ${personId
      }`)
    } else {
      console.log(`[findPersonById
      ] Data found: ${data
      }`)
      done(null, data)
    }
  })
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";

  findPersonById(personId, (err, person) => {
    if (err) {
      done(err)
    } else {
      person.favoriteFoods.push(foodToAdd)
      person.save().then(data => {
        console.log(`[findEditThenSave
        ] Save successful. ${data
        }`)
        done(null, data)
      })
    }
  })
};

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  const updatedPerson = Person.findOneAndUpdate(
    { name: personName
  },
  { age: ageToSet
  },
  { new: true
  },
    (err, data) => {
      if (err) { done(err)
    }
      done(null, data)
  }
  )
};

const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId, (err, data) => {
    if (err) { done(err)
    }
    done(null, data)
  })
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";

  Person.remove({ name: nameToRemove
  }, (err, data) => {
    if (err) { done(err)
    }
    done(null, data)
  })
};

const queryChain = (done) => {
  const foodToSearch = "burrito";

  Person.find({ favoriteFoods: foodToSearch
  })
    .sort({ name: 'asc'
  })
    .limit(2)
    .select('-age')
    .exec((err, data) => {
      if (err) { done(err)
    }
      done(null, data)
  })
};

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
*/
