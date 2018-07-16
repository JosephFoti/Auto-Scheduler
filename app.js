var https = require('https');
https.post = require('https-post');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const fs = require('fs');

const position = require('./components/positionParse.js');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));

const result = dotenv.config();
dotenv.load();

// CORS config
// https://stackoverflow.com/questions/23177628/post-to-express-js-with-access-control-allow-origin
app.all('*',function(req,res,next) {
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin','https://friendsseminary.myschoolapp.com');
    res.set('Access-Control-Allow-Methods','POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');

    if ('OPTIONS' == req.method) return res.send(200);

    next();
});

let teacherData = [];

var apiData;





app.post('/getTeacher', (req, result) => {

  let chosenUser = req.body.userId;
  let emptySchedules = [];

  https.post('https://friendsseminary.myschoolapp.com/api/authentication/login', {
    username: process.env.API_USER,
    password: process.env.API_PASS
  }, (res) => {
    res.on('data', chunk => {
      console.log(JSON.parse(chunk));
      apiData = JSON.parse(chunk);
    });

    // ------------------------------------
    // Get Teachers
    // ------------------------------------
    res.on('end', () => {
      console.log(apiData);
      // https.get(`https://friendsseminary.myschoolapp.com/api/news/category/all?t=${apiData.Token}`, (resp) => {
      https.get(`https://friendsseminary.myschoolapp.com/api/DataDirect/ScheduleList/?format=json&viewerId=${chosenUser}&personaId=3&viewerPersonaId=3&start=1535256000&end=1538884800&t=${apiData.Token}`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          console.log(JSON.parse(data));

          let rawData = JSON.parse(data);

          // calendar block dictionary
          let block = {};

          // search regexp
          let reg = new RegExp(/Day \d/);

          // var to keep the active day name as reference
          let currentEffectiveCycle;

          for (var i = 0; i < rawData.length; i++) {

            // test if event title is a day name, if it is add it to the block
            if (reg.test(rawData[i].title)) {

              // string conversion from day # (m) to day#
              let displayTitle = rawData[i].title.slice(0, 5);
              let division = rawData[i].title.slice(6);
              shortTitle = displayTitle.split(' ').join('');

              // if the day name doesnt exist yet, add it and move on...
              if (!block[shortTitle]) {

                console.log(`${shortTitle} is currentEffectiveCycle`);
                // DISPLAY title added for rendering days properly,
                // EVENTS is an array that will contain all the scheduled
                // objects. DIVISION tests if the cycle day has actually been
                // repeated or if there are two different types of day.

                block[shortTitle] = rawData[i];
                block[shortTitle]["title"] = displayTitle;
                block[shortTitle]["events"] = [];
                block[shortTitle]["division"] = division;
                currentEffectiveCycle = shortTitle;
                continue;

              } else if (block[shortTitle]["division"] !== division) {
                // if the day already exists but has a different division value
                // continue looop
                continue;

              }

              // if the day name has already been saved then we are done, break
              // the loop!
              console.log(`about to break loop with ${shortTitle} for date ${rawData[i].start}`);

              break;

            } else if (rawData[i].start.split(' ')[1] === "12:00" && rawData[i].start.split(' ')[2] === "AM") {
              // if its an all day event (starts at 12AM) and is not a cycle day ignore it!
              continue;
            } else {
              emptySchedules.push(chosenUser);
            }

            // Call the position parser component to calculate relative positions in the future schedule
            let thisPosition = position.parsePosition(rawData[i]);
            rawData[i].position = thisPosition;

            // all else push to what ever day last became the effective cycle day.
            block[currentEffectiveCycle]["events"].push(rawData[i]);

          }

          let keys = Object.keys(block);
          block.keys = keys;

          let response = {
            data: block,
            status: 200,
            success: 'successfully got a person!'
          }

          return result.end(response);

          // result.render('selector', {
          //   block,
          //   keys
          // })
          // result.send(block);
        });

      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });

    });

  });

});


app.get('/', (req, res) => {
  console.log('homepage');
  fs.readFile('./data/teacherIds.json', 'utf-8', (err, data) => {
    data = JSON.parse(data);
    // res.render('selector',{data});
  });

  res.send('hello!');
});

app.listen(8080, () => {
  console.log('hello blackbaud!');
});
