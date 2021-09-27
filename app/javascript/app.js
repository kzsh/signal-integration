import "../html/index.html"
import "../stylesheets/app.css"

var ENERGY_HIGH = 100;
var ENERGY_LOW = 0;

var Spectrum = function (frequencies) {
  this.initializeFrequencies(frequencies);
  return this;
};
Spectrum.prototype.SPECTRUM_WIDTH = 100;
Spectrum.prototype.initializeFrequencies = function (frequencies) {
  this.frequencies = frequencies || [];
  if (this.frequencies.length === 0) {
    while(this.frequencies.length < this.SPECTRUM_WIDTH) {
      this.frequencies.push(0);
    }
  }
}
Spectrum.prototype.forEach = function (callback) {
  this.frequencies.forEach((freq, i) => { callback(freq,i) });
};

Spectrum.prototype.addSignal = function (args) {
  var {
    energy,
    frequency,
    distance
  } = args;
  distance = distance || 1;

  var add = (energy, frequency) => {
    this.frequencies[frequency] += (parseInt(energy, 10) / parseInt(distance, 10));
  }

  var x = 0;
  while(energy > 2) {
    add(energy, frequency+x);
    if(x > 0) {
      add(energy, frequency-x);
    }
    x++;
    energy = energy / 1.2
  }

  return this;
};

Spectrum.prototype.generateNoise = function(args) {
  var {
    maximumEnergy,
    lowestFrequency,
    highestFrequency
  } = (args || {});
  var maxEnergy =  maximumEnergy || 5
  var lowFreq = lowestFrequency || 0;
  var highFreq = highestFrequency || this.SPECTRUM_WIDTH;

  for(var x = lowFreq; x < highFreq; x++) {
    this.frequencies[x] = maxEnergy * Math.random();
  }
  return this;
};

function update() {

}

function draw(context, spectrum) {
  context.fillStyle = "#FF0000";
  context.beginPath();
  context.lineWidth = 4;
  spectrum.forEach(function(energy,i) {
    context.moveTo(i*4,0);
    context.lineTo(i*4, energy);
    context.stroke();
  })
  context.closePath();
}

function setup() {
  var canvas = configureCanvas();

  setupLoop(canvas)();
}

function configureCanvas() {
  var canvas = document.createElement('canvas');
  var height = document.getElementById('container').clientHeight;
  var width = document.getElementById('container').clientWidth;
  canvas.width = width;
  canvas.height = height;
  document.getElementById('container').appendChild(canvas);
  return canvas;
}

function setupLoop(canvas) {
  var distanceInput = document.getElementById("distance");
  var energyInput = document.getElementById("energy");
  var samplesInput = document.getElementById("samples");
  var context = canvas.getContext("2d");
  var lastTime = new Date().getTime(),
    fps = 5,
    cw = canvas.width,
    ch = canvas.height;

  function gameLoop() {
    var x = parseInt(samplesInput.value, 10);
    var spectra = [];

    while(x > 0) {
      // multiple samples to extract signal
      spectra.push(new Spectrum());
      x--;
    }
    spectra.push(new Spectrum())

    spectra.forEach((spectrum) => {
      spectrum.generateNoise().addSignal({
        energy: parseInt(energyInput.value,10),
        distance: parseInt(distanceInput.value,10),
        frequency:80 });
    });

    window.requestAnimationFrame(gameLoop);
    var currentTime = (new Date()).getTime();
    var delta = (currentTime - lastTime) / 1000;

    context.clearRect(0, 0, cw, cw);
    var superPositioned = spectra.reduce((accum, spectrum)=> {
      if(accum === null) {
        accum = spectrum;
      } else {
        accum.forEach((_, i) => {
          accum.frequencies[i] += spectrum.frequencies[i];
        });

      }
      return accum
    }, null) ;
    update(delta);

    draw(context, superPositioned);

    lastTime = currentTime;
  };
  return gameLoop;
};

document.addEventListener('DOMContentLoaded', setup)
