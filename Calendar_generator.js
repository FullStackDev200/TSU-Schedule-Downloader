/**
 * @typedef {Object} Lecture
 * @property {string} name
 * @property {string} lector
 * @property {string} auditorium
 * @property {string} weekday
 * @property {string} startTime
 * @property {string} endTime
 */

function parseHtml(userCalendar) {
  const doc = new DOMParser().parseFromString(userCalendar, 'text/html');
  const table = doc.querySelector(".table");

  // TODO: make sure user passes a table
  const data = [...table.rows].map(row =>
    [...row.cells].map(cell => cell.textContent.trim())
  );

  let lectures = [];
  for (let i = 1; i < data.length; i++){
    for (let j = 1; j < data[0].length; j++){
      if (!data[i][j]) continue;
      lectures.push(parseTimeTableSlot(data[i][0].trim(), data[i][j]));
    }
  }

  return lectures;
}

function parseTimeTableSlot(name, slot) {
  const [_, lector, auditorium, weekday, startTime, endTime] = slot.match(
    /პედაგოგ\(ებ\)ი:\s*(.*)აუდიტორია:\s*(.*)თარიღი, დრო:\s*(.+?),\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/
  );

  return {
    name: name,
    lector: lector,
    auditorium: auditorium,
    weekday: weekday,
    startTime: startTime,
    endTime: endTime,
  }
}

function createICS(lectures) {
  let text = [];
  const now = new Date();
  const formattedTime = getFormattedTime(now);
  text += `BEGIN:VCALENDAR\n`;
  text += `VERSION:2.0\n`;
  text += `PRODID:-//TSU//Ganrigi//EN\n`;

  for (const lecture of lectures) {
    let startTime = 
    text += `BEGIN:VEVENT\n`;
    text += `SUMMARY:${lecture.name}\n`;
    text += `DTSTAMP:${formattedTime}Z\n`;
    text += `DTSTART;TZID=Asia/Tbilisi:${getLectureEventInfo(lecture.startTime, lecture.weekday, now)}\n`;
    text += `DTEND;TZID=Asia/Tbilisi:${getLectureEventInfo(lecture.endTime, lecture.weekday, now)}\n`;
    text += `UID:${crypto.randomUUID()}:@uni.tsu.ge\n`;
    text += `LOCATION:${lecture.auditorium}\n`;
    text += `RRULE:FREQ=WEEKLY;COUNT=15\n`;
    //TODO: add end date
    text += `END:VEVENT\n`;
  }

  text += `END:VCALENDAR`;

  return text;
}

function getFormattedTime(now) {
  const pad = n => String(n).padStart(2, "0");

const formatted =
    `${now.getFullYear()}` +
    `${pad(now.getMonth() + 1)}` +
    `${pad(now.getDate())}T` +
    `${pad(now.getHours())}` +
    `${pad(now.getMinutes())}` +
    `${pad(now.getSeconds())}`;
  return formatted;
}

function getLectureEventInfo(time, weekday, now) {
  const year = now.getFullYear();

  const [semesterStartMonth, semesterStartDay] =
    now.getMonth() >= 8 ? [8, 20] : [2, 4];

  const target = new Date(year, semesterStartMonth, semesterStartDay);
  const targetDay = target.getDay();


  const weekdays = new Map();

  weekdays.set("ორშაბათი", 1);
  weekdays.set("სამშაბათი", 2);
  weekdays.set("ოთხშაბათი", 3);
  weekdays.set("ხუთშაბათი", 4);
  weekdays.set("პარასკევი", 5);
  weekdays.set("შაბათი", 6);
  weekdays.set("კვირა", 7);

  const diff = (weekdays.get(weekday) - targetDay + 7) % 7;
  const previousDiff = diff === 0 ? 0 : diff - 7;

  const nearestDiff =
    Math.abs(previousDiff) <= Math.abs(diff)
    ? previousDiff
    : diff;

  target.setFullYear(year);
  target.setDate(target.getDate() + nearestDiff);
  const [hours, minutes] = time.split(":").map(Number);
  target.setHours(hours, minutes, 0, 0);
  const formattedTarget = getFormattedTime(target);
  return formattedTarget;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// TODO: make recurring even start and end on the date near given and depending on current semester
