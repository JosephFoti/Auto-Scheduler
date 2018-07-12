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

app.set('view engine','ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));

const result = dotenv.config();
dotenv.load();

let teacherData = [];

var apiData;

// https://friendsseminary.myschoolapp.com/api/DataDirect/ScheduleList/?format=json&viewerId=144929&personaId=3&viewerPersonaId=3&start=1535256000&end=1538884800&_=1531158102426

// pivot json for select from roleId to baseRoleId
// https://friendsseminary.myschoolapp.com/api/Role/AllRolesForSchool/?format=json

// Gives user credentials,
// .MasterUserInfo.UserId
// https://friendsseminary.myschoolapp.com/api/webapp/context?_=1531158416288
// JB |6|20|
// JcH |5|6|7|9|20|21|22|24|


/*
teacher role id = 1684
*/


// https.post('https://friendsseminary.myschoolapp.com/api/authentication/login', {username:process.env.API_USER,password:process.env.API_PASS}, (res)=>{
//   res.on('data',chunk=>{
//     console.log(JSON.parse(chunk));
//     apiData = JSON.parse(chunk);
//   });
// // ------------------------------------
// // Get Teachers
// // ------------------------------------
// res.on('end',()=>{
//   console.log(apiData)
//   // https.get(`https://friendsseminary.myschoolapp.com/api/news/category/all?t=${apiData.Token}`, (resp) => {
//   https.get(`https://friendsseminary.myschoolapp.com/api/user/all?t=${apiData.Token}&roleIDs=1684`, (resp) => {
//     let data = '';
//
//     // A chunk of data has been recieved.
//     resp.on('data', (chunk) => {
//       data += chunk;
//     });
//
//     // The whole response has been received. Print out the result.
//     resp.on('end', () => {
//       console.log(JSON.parse(data)[0].UserId);
//       console.log(JSON.parse(data)[0].FirstName);
//       console.log(JSON.parse(data)[0].LastName);
//       data = JSON.parse(data);
//       let container = [];
//
//       for (var i = 0; i < data.length; i++) {
//
//         let item = {};
//
//         console.log('--------------------------');
//         item.id = data[i].UserId;
//         item.fName = data[i].FirstName;
//         item.lName = data[i].LastName;
//         item.name = `${item.fName} ${item.lName}`;
//         container.push(item);
//
//       }
//
//       console.log(container);
//       fs.writeFile('./data/teacherIds.json',JSON.stringify(container),err=>{
//         if (err) console.log(err)
//       })
//     });
//
//   }).on("error", (err) => {
//     console.log("Error: " + err.message);
//   });
//
//
// });
//
// });



app.get('/test/:userId',(req,result)=>{

  let chosenUser = req.params.userId;

  https.post('https://friendsseminary.myschoolapp.com/api/authentication/login', {username:process.env.API_USER,password:process.env.API_PASS}, (res)=>{
    res.on('data',chunk=>{
      console.log(JSON.parse(chunk));
      apiData = JSON.parse(chunk);
    });

    // ------------------------------------
    // Get Teachers
    // ------------------------------------
    res.on('end',()=>{
      console.log(apiData)
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

          let block = {}

          let reg = new RegExp(/Day \d/);

          // var to keep the active day name as reference
          let currentEffectiveCycle;

          for (var i = 0; i < rawData.length; i++) {

            // test if event title is a day name, if it is add it to the block
            if (reg.test(rawData[i].title)) {

              // string conversion from day # (m) to day#
              let title = rawData[i].title.slice(0,5);
              title = title.split(' ').join('');

              // if the day name doesnt exist yet, add it and move on...
              if (!block[title]) {
                console.log(`${title} is currentEffectiveCycle`);
                block[title] = rawData[i];
                block[title]["events"] = [];
                currentEffectiveCycle = title;
                continue;
              }


              // if the day name has already been saved then we are done, break
              // the loop!
              console.log(`about to break loop with ${title} for date ${rawData[i].start}`);

              break;

            } else if (rawData[i].start.split(' ')[1] === "12:00" && rawData[i].start.split(' ')[2] === "AM") {
              // if its an all day event (starts at 12AM) and is not a cycle day ignore it!
              continue;
            }

            // Call the position parser component to calculate relative positions in the future schedule
            let thisPosition = position.parsePosition(rawData[i]);
            rawData[i].position = thisPosition;

            // all else push to what ever day last became the effective cycle day.
            block[currentEffectiveCycle]["events"].push(rawData[i]);



          }

          let keys = Object.keys(block);

          result.render('selector',{block,keys})
          // result.send(block);
        });

      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });


    })


  })

});


app.get('/',(req,res)=>{
  console.log('homepage');
  fs.readFile('./data/teacherIds.json','utf-8',(err,data)=>{
    data = JSON.parse(data);
    res.render('selector',{data});
  });

  res.send('hello!');
});

app.listen(8080,()=>{
  console.log('hello blackbaud!');
});
