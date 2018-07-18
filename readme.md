## Blackbaud Client-Side auto-scheduler

Greetings fellow coder,

What follows is an example process for using the blackbaud ON-API to access teacher schedules and display them on a back-end page. The schedules are mapped to an 8-day cycle calendar.

When I sarted this project, I wanted to use a proxy server to host the api requests and process data, but I didn't feel so comfortable configuring CORS and was afraid of leaking data and being responsable for a hack, so I decided to keep it local. The html file includes all my scripts and styles which can be inserted into the back end through an embed tag (_Note: Blackbaud probably will not help you with anything you stick in there_).


## Summary of Code

1. Get API Token.
  - As detailed in the [ON-API getting started guide](http://on-api.developer.blackbaud.com/docs/getting-started/) step one is to use a post with log-in credentials for a blackbaud user with the role API Manager

  ```javascript

  $.post(`https://{schoolName}.myschoolapp.com/api/authentication/login`,{username:'yourUsername',password:'yourPassword'},(data) => {
    // Gives object with a fresh api_key
    console.log(data);
  })

  ```

2. Find appropriate roll id for your teachers.
  - Each role in the Blackbaud database corresponds to a roleId, my school used the role 'teacher' which corresponded to the number 1684.
  - If you know the name of the role you are looking for, you can make a call to https://{school}.myschoolapp.com/api/role/ListAll/?t={token}
  - _Note: if you are using your personal account as credentials to get your token, every time you generate a token your login session will be de-authenticated, and vice versa, every time you log in you will have to generate a new token for you calls. All of my ajax get calls are typically nested within my token post calls so that every time the script runs I get a new reliable token_

3. Create a selector for table generation.
  - To display each teacher's information we need to first acquire each teacher's name and userId. Now that we have the roleId we can use the following call...

  ```javascript

  $.ajax({
    url: `https://{schoolName}.myschoolapp.com/api/user/all?t=${token}&roleIDs=1684`,
    type: 'GET'
  }).done(data=>{...});

  ```

  - With this call we get entries for all user's with the role id 1684, or in my case teachers. I then loop through this data and parse each entry into option tags within a selector with their inner text as the teacher's name and the value as their unique user id.

 ```javascript

     let html = '';
     html += '<option>Please select a name</option>';

    for (var i = 0; i < data.length; i++) {

      let item = {};

      item.id = data[i].UserId;
      item.fName = data[i].FirstName;
      item.lName = data[i].LastName;
      item.name = `${item.fName} ${item.lName}`;
      html += `<option value="${item.id}" data-index="${i}">${item.name}</option>`

    }

    $('#selector').html(html);

 ```

4. Get the schedules
  - I add an onChange event listener to my select element which triggers the following ajax call ...

  ```javascript

  $.ajax({
    url:  `https://{youSchool}.myschoolapp.com/api/DataDirect/ScheduleList/?format=json&viewerId=${chosenUser}&personaId=3&viewerPersonaId=3&start=1535256000&end=1538884800&t=${token}`,
    type: `GET`,
  })

  ```

  which give us around a month's worth of data. It was important for me to get a larger sample size because I wanted to be sure that an example of each of the days of the 8 day calendar was present. If you want to use a different dataset, I would suggest using your favorite page inspector to watch the api calls that blackbaud's back end makes in the my-day section, which is where I found this specific (unlisted as far as I know) endpoint.


  5. And Bob's your uncle!
    - The rest of my code is specific to formating rendering my calendar with javascript/jquery. I left comments if you want to learn more.


  [ON-API Docs](http://on-api.developer.blackbaud.com/)
