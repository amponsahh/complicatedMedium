// import necessary objects from api
import clock from "clock";
import document from "document";
import * as util from "../common/utils"; // zero padding on time text field to fill text length spacing as well *aesthetics*
import { display } from "display";
import { today } from "user-activity";
import { me as appbit } from "appbit";
import { HeartRateSensor } from "heart-rate";

// how often the clock's evt timer ticks, basically how quickly should our clock update
clock.granularity = "seconds";

/* constant "variables" so we don't have keep typing document.getElementById("x") 
everytime we want to display something at a designated text field
variable names should be self explanatory*/
const timeHourHandle = document.getElementById("timeHourLabel");
const timeMinuteHandle = document.getElementById("timeMinuteLabel");
const dateHandle = document.getElementById("dateLabel");
const dayHandle = document.getElementById("dayLabel");
const heartrateHandle = document.getElementById("heartrateLabel");
const stepsHandle = document.getElementById("stepsLabel");
const distanceHandle = document.getElementById("distanceLabel");
const caloriesHandle = document.getElementById("caloriesLabel");
const elevationGainHandle = document.getElementById("elevationGainLabel");
const activeZoneMinutesHandle = document.getElementById("activeZoneMinutesLabel");

// array of days of the week and months of the year
const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 
              'THURSDAY', 'FRIDAY', 'SATURDAY'];
const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER','NOVEMBER','DECEMBER'];

/* now unlike the prior document.getElementById("x"), these are our icons and 
will only ever get called once (as far as this index.js file is concerned) 
so we can save memory and just declare them here once, no need for variable containers */
document.getElementById("heartrateIcon").href = "icons/stat_hr_solid_24px.png";
document.getElementById("stepsIcon").href = "icons/stat_steps_solid_24px.png";
document.getElementById("distanceIcon").href = "icons/stat_dist_solid_24px.png";
document.getElementById("caloriesIcon").href = "icons/stat_cals_solid_24px.png";
document.getElementById("elevationGainIcon").href = "icons/stat_floors_solid_24px.png";
document.getElementById("activeZoneMinutesIcon").href = "icons/stat_azm_solid_24px.png";

// Heart rate function
/* check if there is a heart rate sensor/if the watch can communicate with one then check if the user has 
granted permission for usage*/
if (HeartRateSensor && appbit.permissions.granted("access_heart_rate")){ 
  const hrm = new HeartRateSensor(); // declare new instance
  let lastValueTimestamp = Date.now(); // get current timestamp
  heartrateHandle.text = "--"; // initialize heart rate text field
  
  /* setup event handler that is called whenever a new reading is available which in turn
   runs an iife (Immediately Invoked Function Expression) to update heart text field on the watch if the reading is new*/
  hrm.addEventListener("reading", () => {
    heartrateHandle.text = (hrm.timestamp === lastValueTimestamp ? "--" : hrm.heartRate);
    lastValueTimestamp = hrm.timestamp; // update timestamp
  });
  
  /* setup event handler that is called when an error occurs and the sensor is automatically stopped which in turn
   runs an iife (Immediately Invoked Function Expression) to update heart text field on the watch in this case,
   the user will see the text -! as opposed to a bpm value, the excalamation point is an alert of some sort*/
  hrm.addEventListener("error", () => {
    heartrateHandle.text = "-!";
  });
  
  // start the heart rate sensor 
  hrm.start()

  /* battery saving technique: whenever the watch display is off, the clock face stops reading/displaying the user's heart rate:
  setup event handler that is called whenever the display state of the watch changes which in turn
   runs an iife (Immediately Invoked Function Expression) to check which state the display is in and read (or not,) 
   heart rate accordingly*/
  display.addEventListener("change", () => {
    display.on ? hrm.start() : hrm.stop();
  });
} else { // either there's no heart rate sensor or the user has not granted permission, pipe (|) indicates block
  heartrateHandle.text = "-|";
}

// iife that updates multiple text fields every second
clock.ontick = (evt) => {
  // initialize now variable to get current day/date/time and store it for manipulation
  let now = evt.date;
  
  /* initialize time/day/date variables
  util.zeroPad is a padding function in .\common for appending the number zero to desired texts*/
  let hours = util.zeroPad(now.getHours());
  let mins = util.zeroPad(now.getMinutes());
  let monthName = months[now.getMonth()];
  let date = util.zeroPad(now.getDate());
  let dayName = days[now.getDay()];
  
  // update text field to display time/day/date on the watch 
  timeHourHandle.text = `${hours}`;
  timeMinuteHandle.text = `${mins}`;
  dateHandle.text = `${monthName} ${date}`;
  dayHandle.text = `${dayName}`;
  
  // reading and displaying user activity biometerics 
  if (appbit.permissions.granted("access_activity")) { // check if necessary permission is granted
    
    // step count metric
    let val = (today.adjusted.steps || 0); // store step count in a temp variable for manipulation
    // step count value manipulation to add comma after four digits e.g. 1,548 as opposed to 1548
    val = (val > 999 ? 
           Math.floor(val/1000) + "," + ("00"+(val%1000)).slice(-3) : 
           val);
    stepsHandle.text = `${val}`; // update step count text field 

    // distance accrued metric
    let val = (today.adjusted.distance || 0) / 1000; // get distance to nearest 1000 meters e.g. [1609](.344) meters
    val *= 0.621371; // convert distance meters to distance miles e.g. 1609 meters =~ 1 mile 
    val = val.toFixed(2); // floor distance to nearest hundredths e.g. 1.00 mile
    distanceHandle.text = `${val}`; // update distance accrued text field
    
    // calories burned metric 
    let val = (today.adjusted.calories || 0); // store calories burned in a temp variable for manipulation
    // calories burned value manipulation to add comma after four digits e.g. 2,862 as opposed to 2862
    val = (val > 999 ? 
           Math.floor(val/1000) + "," + ("00"+(val%1000)).slice(-3) : 
           val);
    caloriesHandle.text = `${val}`; // calories burned count text field 
    
    // elevation gain/stair count metric
    let val = today.adjusted.elevationGain || 0;
    elevationGainHandle.text = `${val}`;
    
    // active heart rate zone minutes metric
    let val = (today.adjusted.activeZoneMinutes.total || 0);
    activeZoneMinutesHandle.text = `${val}`;
  } else { // user has not granted permission, pipe (|) indicates block
    let val = "-|";
    stepsHandle.text = `${val}`;
    distanceHandle.text = `${val}`;
    caloriesHandle.text = `${val}`;
    elevationGainHandle.text = `${val}`;
    activeZoneMinutesHandle.text = `${val}`;
  }
}



