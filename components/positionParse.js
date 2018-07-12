
// take times and convert them into relative percents of the height of the calendar

function parsePosition(eventObject){
  console.log('-------------------------------------');
  console.log('Parse ready');
  console.log(eventObject);

  // total span displayed by calendar
  const total = 7.5;

  // start and end values in data
  let start = eventObject.start.split(' ')
  let end =  eventObject.end.split(' ')

  //start parse
  let startTime = start[1].split(':');

  let startHour = start[2] === 'AM' || parseInt(startTime[0]) === 12 ? parseInt(startTime[0]) : parseInt(startTime[0]) + 12;
  let startMin = parseInt(startTime[1]);

  console.log(`start hour: ${startHour}, start minute: ${startMin}`);

  let weightedStart = (startHour - 8) + (1.67 * (startMin/100));


  // end parse
  let endTime = end[1].split(':');

  let endHour = end[2] === 'AM' || parseInt(endTime[0]) === 12 ? parseInt(endTime[0]) : parseInt(endTime[0]) + 12;
  let endMin = parseInt(endTime[1]);


  let weightedEnd = (endHour - 8) + (1.67 * (endMin/100));


  // console.log(startHour);
  // console.log(start[2]);
  // console.log(weightedStart);

  console.log(`end hour: ${endHour}, end minute: ${endMin}`);

  // console.log(endHour);
  // console.log(end[2]);
  // console.log(weightedEnd);
  let top = (Math.abs((Math.abs(weightedStart-total)/total) - 1)).toFixed(3);
  let height = ((weightedEnd - weightedStart)/total).toFixed(3);

  console.log(top);
  console.log(height);

  return {top:top,height:height}
};


module.exports = {parsePosition:parsePosition}
