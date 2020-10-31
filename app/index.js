import clock from "clock";
import document from "document";
import * as util from "../common/utils";
import { display } from "display";
import { today } from "user-activity";
import { me as appbit } from "appbit";
import { HeartRateSensor } from "heart-rate";

clock.granularity = "seconds";

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

const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 
              'THURSDAY', 'FRIDAY', 'SATURDAY'];

const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER','NOVEMBER','DECEMBER'];

document.getElementById("heartrateIcon").href = "icons/stat_hr_solid_24px.png";
document.getElementById("stepsIcon").href = "icons/stat_steps_solid_24px.png";
document.getElementById("distanceIcon").href = "icons/stat_dist_solid_24px.png";
document.getElementById("caloriesIcon").href = "icons/stat_cals_solid_24px.png";
document.getElementById("elevationGainIcon").href = "icons/stat_floors_solid_24px.png";
document.getElementById("activeZoneMinutesIcon").href = "icons/stat_azm_solid_24px.png";

if (HeartRateSensor && appbit.permissions.granted("access_heart_rate")){
  const hrm = new HeartRateSensor();
  let lastValueTimestamp = Date.now();
  heartrateHandle.text = "--";
  
  hrm.addEventListener("reading", () => {
    heartrateHandle.text = (hrm.timestamp === lastValueTimestamp ? "--" : hrm.heartRate);
    lastValueTimestamp = hrm.timestamp;
  });
  
  hrm.addEventListener("error", () => {
    heartrateHandle.text = "-/";
  });
  
  hrm.start()
  display.addEventListener("change", () => {
    display.on ? hrm.start() : hrm.stop();
  });
} else {
  heartrateHandle.text = "-|!";
}

clock.ontick = (evt) => {
  let now = evt.date;
  
  let hours = util.zeroPad(now.getHours());
  let mins = util.zeroPad(now.getMinutes());
 
  let monthName = months[now.getMonth()];
  let date = util.zeroPad(now.getDate());
  let dayName = days[now.getDay()];
  
  timeHourHandle.text = `${hours}`;
  timeMinuteHandle.text = `${mins}`;
  
  dateHandle.text = `${monthName} ${date}`;
  dayHandle.text = `${dayName}`;
  
  if (appbit.permissions.granted("access_activity")) {
    let val = (today.adjusted.steps || 0);
    val = (val > 999 ? 
           Math.floor(val/1000) + "," + ("00"+(val%1000)).slice(-3) : 
           val);
    stepsHandle.text = `${val}`;
    
    let val = (today.adjusted.distance || 0) / 1000;
    val *= 0.621371;
    val = val.toFixed(2);
    distanceHandle.text = `${val}`;
    
    let val = (today.adjusted.calories || 0);
    val = (val > 999 ? 
           Math.floor(val/1000) + "," + ("00"+(val%1000)).slice(-3) : 
           val);
    caloriesHandle.text = `${val}`;
    
    let val = today.adjusted.elevationGain || 0;
    elevationGainHandle.text = `${val}`;
    
    let val = (today.adjusted.activeZoneMinutes.total || 0);
    activeZoneMinutesHandle.text = `${val}`;
  } else {
    let val = "--";
    stepsHandle.text = `${val}`;
    distanceHandle.text = `${val}`;
    caloriesHandle.text = `${val}`;
    elevationGainHandle.text = `${val}`;
    activeZoneMinutesHandle.text = `${val}`;
  }
}



