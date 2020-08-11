var song;
var fft;
var peakDetect;
var ellipseSize = 0;
var threshold = 0.05;
const Y_AXIS = 1;
const X_AXIS = 2;
var b1, b2, c1, c2;


//from randomColor.js
var musicHues = ['yellow', 'yellow', 'orange', 'orange', 'red', 'pink', 'pink', 'purple', 'purple', 'blue', 'blue', 'green'];

//Key names for future reference
var keyNames = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];

var musicKey = Math.floor(Math.random() * 11) + 1  
var currentHue = musicHues[musicKey];

//set lum based on key
var currentLum = keyNames[musicKey].slice(-1) === "♭" ? 'dark' : 'light' ;
var backgroundColor = currentLum === 'dark' ? 255 : 0; 


//use randomColor to generate color for app
circleColor = randomColor({
  hue: currentHue,
  luminosity: currentLum,
  count: 5,
  format: 'rgba',
});

backgroundColor = randomColor({
  luminosity: currentLum,
  count: 5,
  format: 'rgba',
});

function setup() {
    createCanvas(windowWidth, windowHeight);

    modalDiv = createDiv();
    modalDiv.id("modalDiv");

    modalDivContent = createDiv();
    modalDivContent.id("modalDivContent");
    modalDivContent.parent("modalDiv");

    header = createSpan('Upload audio file here.')
    header.parent("modalDivContent");
    header.style("color", circleColor[4])

    input = createFileInput(handleFile);
    input.position(0, 0)
    input.parent("modalDivContent");
    input.style('position', 'relative');

    button = createButton("Play");
    button.mousePressed(playSong);
    button.parent("modalDivContent")
    button.style("color", circleColor[4]);


    background(220);

    b1 = color(backgroundColor[0]);
    b2 = color(backgroundColor[4]);
    c1 = color(204, 102, 0);
    c2 = color(0, 102, 153);


    // create a new Amplitude analyzer
    analyzer = new p5.Amplitude();

    // Patch the input to an volume analyzer
    analyzer.setInput(song);

    fft = new p5.FFT();
    fft.setInput(song);
    peakDetect = new p5.PeakDetect(20, 20000, threshold, 20);
}

function playSong() {
  if (!song) {
    alert('You forgot to upload a song!');
  } else {
      song.loop();
      modalDiv.style("display", "none");
  }
}


function stars() {
  noStroke();
  fill(randomColor({
    luminosity: currentLum
  }));
  for (i = 0; i < width; i += random(10, 100)) {
    for (j = 0; j < height; j += random(10, 200)) {
      ellipse(i, j, random(1, 4));
    }
  }
}

function draw() {
  //Background with gradient
  setGradient(0, 0, width, height, b1, b2, Y_AXIS);
  setGradient(width, 0, width, height, b2, b1, Y_AXIS);

  //Circle
  fill(circleColor[0]); 
  noStroke();
  ellipse(windowWidth/2, windowHeight/2, windowHeight, windowHeight);

  stars();

  // Get the average (root mean square) amplitude
  let rms = analyzer.getLevel();
  noFill();
  stroke(255);

  // Draw a square with size based on volume
  square((windowWidth / 2)- (rms*200)/2, (windowHeight / 2) - (rms*200)/2, rms * 200);

  // FFT analysis for beatDetecting (circle shapes) and "lighthing".
  let spectrum = fft.analyze();
  peakDetect.update(fft);

  if(peakDetect.isDetected){
    ellipseSize = 200;
  } else {
    ellipseSize *= 0.95; 
  }
  
  ellipse(windowWidth/2, windowHeight/2, ellipseSize);

  beginShape();
  for (i = 0; i < spectrum.length; i++) {
   stroke(255);
   let r = map(spectrum[i], 0, 1, 0, 300);
   let x = windowWidth/2 + r * cos(i);
   let y = windowHeight/2 + r * sin(i);
   vertex(x, y);
  }
  endShape();
}

//function for setting Gradients found online. 
function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();

  if (axis === Y_AXIS) {
    // Top to bottom gradient
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  } else if (axis === X_AXIS) {
    // Left to right gradient
    for (let i = x; i <= x + w; i++) {
      let inter = map(i, x, x + w, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y + h);
    }
  }
}

function handleFile(file) {
  if (file.type !== 'audio') {
    alert('Upload audio file please.')
  } else {
    song = loadSound(file);
  }
}
