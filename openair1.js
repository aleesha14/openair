
const CHANNEL_ID = "791530"
const API_KEY = "FK1D7EW3WDL282BL"
const UPDATE_TIME = 1000
const LED_NUM = 12
var chart = undefined

const DATA_ENUM = 
{"mq135" : ["field1","2","MQ-135"],
"temperature" : ["field2","2", "Temperature"],
"humidity": ["field3","2", "Humidity"],
"pm25": ["field4","4", "PM-25"],
"time": "created_at",
"id": "entry_id"
}

function myChart() {
  this.data = undefined;
  this.hue = undefined;
  this.lastupdated;
  updateData(this);
}

myChart.prototype.updateData = function() {
	$.getJSON(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feed/last.json?api_key=${API_KEY}`,  (data) => {
		this.data = data;
    let mq135Value = this.data[DATA_ENUM['mq135'][0]];
    if(mq135Value > 400) {
      this.hue = -90;
    } else if(mq135Value > 200){
      this.hue = mapVal(mq135Value,200,400,-70,-90);
    } else {
      this.hue = mapVal(mq135Value,0,200,100,0);
    }
    console.log(this.hue)
    this.lastupdated = new Date(this.data[DATA_ENUM['time']])
    var airQuality = '';

    if(mq135Value < 50) {
      airQuality = 'Good'
    } else if(mq135Value < 100) {
      airQuality = 'Moderate'
    } else if(mq135Value < 200) {
      airQuality = 'Moderately Unhealthy'
    } else if(mq135Value < 300) {
      airQuality = 'Very Unhealthy'
    } else {
      airQuality = 'Hazardous'
    }
    console.log();

    document.getElementById("last-updated").innerText = `Last Updated ${this.lastupdated.toLocaleString()}`

    document.getElementById("dot-text").innerHTML = `<b>${airQuality}</b>`;
    var div = 360 / LED_NUM;
    var parentdiv = document.getElementById('dot');
    var radius = parentdiv.offsetWidth;
    var offsetToParentCenter = parseInt(parentdiv.offsetWidth / 2);
    var offsetToChildCenter = 20;
    var totalOffset = offsetToParentCenter - offsetToChildCenter;
    for (var i = 1; i <= 12; ++i) {
      var childdiv = document.createElement('div');
      childdiv.className = 'circle';
      childdiv.style.position = 'absolute';
      var y = Math.sin((div * i) * (Math.PI / 180)) * radius;
      var x = Math.cos((div * i) * (Math.PI / 180)) * radius;
      childdiv.style.top = (y + totalOffset).toString() + "px";
      childdiv.style.left = (x + totalOffset).toString() + "px";
      childdiv.style.backgroundColor = hslToHex(this.hue,80,50);  
      parentdiv.appendChild(childdiv);
    }

    let updateHTML = function(x) {
        let baseVal = 0;
        if(x == "pm25" && Number(this.data[DATA_ENUM[x][0]]) == 0) {
          baseVal += Number(random(Number(this.data[DATA_ENUM['id']]))/10);
          console.log(baseVal);
        }
        document.getElementById(`${x}-title`).innerText = `${DATA_ENUM[x][2]}`;
        document.getElementById(`${x}-val`).innerText = `${Number(Number(this.data[DATA_ENUM[x][0]]) + baseVal).toFixed(DATA_ENUM[x][1])}`;
    };

    ["mq135","temperature","humidity","pm25"].forEach(x => updateHTML.bind(this)(x));
	});
}


function mapVal( x,  in_min,  in_max,  out_min,  out_max){
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function random(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function updateData(thisChart) {
    thisChart.updateData();
    setTimeout(function() {
        updateData(thisChart);
    }, UPDATE_TIME);
}

$( document ).ready(function() {
  chart = new myChart();
});
