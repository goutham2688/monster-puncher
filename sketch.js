
let video;
let posNet;
let pose;
let skeleton;
let hand_armour_img;
let debug = 0; // set this var to 1 if you'd like to see the pose estimation from the model
let if_want_armour = 0;
let red_monster;
let green_monster;
let random_values_0_1 = [0 , 1];

// monster fields
let is_monster_alive = true; // start with a live monster
let random_monster_choosen;
// monster dimensions
let mx = 0;
let my = 0;
let mwidth = 80;
let mheight = 80;
let max_x = 0;
let max_y = 0;

function preload() {
  // load game assets
  red_monster = loadImage('red_monster.png');
  green_monster = loadImage('green_monster.png');
  random_monster_choosen = red_monster;
  if(1 == if_want_armour) {
    hand_armour_img = loadImage('hand_armour.png');
  }
}

function setup(){
	createCanvas(640, 480);
  // TODO:
  // set a reduced framerate for better performance
  video = createCapture(VIDEO);
  video.hide();
  posNet = ml5.poseNet(video, modelLoaded);
	posNet.on('pose', gotPoses);

  max_x = width - 150;
  max_y = height - 150;
}

function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0 ) {
    pose = poses[0].pose;
    // console.log(pose);
    skeleton = poses[0].skeleton;
  } else {
    console.log("no pose found")
  }
}

function modelLoaded(){
  console.log("model ready");
}

// http://127.0.0.1:5500/p5/empty-example/index.html

function draw(){
	// background(200);

  // flip the video on y-axis only when not in debug
  if(0 == debug){
    translate(width,0);
    scale(-1.0,1.0);
  }
  image(video,0,0);
  
  if (pose && skeleton) {
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    // realtive distanve between two eye's
    // used to dynamically increase or decrease the 
    let d = dist(eyeR.x,eyeR.y,eyeL.x,eyeL.y);
    
    if (1 == debug) {
      // fill(255,0,0); // red nose
      // ellipse(pose.nose.x, pose.nose.y, d);

      for (let i=0; i < pose.keypoints.length ; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        fill(0,255,0);
        ellipse(x, y, 16, 16);
      }
      for (let i=0; i < skeleton.length; i++) {
        let a = skeleton[i][0];
        let b = skeleton[i][1];
        strokeWeight(2);
        stroke(255);
        line(a.position.x,a.position.y,b.position.x,b.position.y);
      }
    }  // debug end

    // only draw images if required
    if (1 == if_want_armour){
      // https://math.stackexchange.com/questions/873366/calculate-angle-between-two-lines
      // calculate atan2 for the elbow to wrist line and rotate the armour to that angle
      // check if left elbow and left wrist are within the screen
      let leftElbowConfidence = parseInt(pose.leftElbow.confidence * 100);
      
      // if the confidence is low, then the had is not there don't drew the armour image
      if( leftElbowConfidence > 60){
        push();
        // console.log(leftElbowConfidence);
        let a = atan2(pose.leftElbow.y - pose.leftWrist.y, pose.leftElbow.x - pose.leftWrist.x);
        translate(pose.leftWrist.x,pose.leftWrist.y);
        console.log(a);
        rotate(a/.5);
        strokeWeight(4);
        stroke(51);
        image(hand_armour_img, 0, 0,150,150);
        pop();
      } 
    }

    push();
    // create a new monster if there are no other monsters already
    if (is_monster_alive){
      image(random_monster_choosen, mx, my,mwidth,mheight);
    }
    // TODO check confidence score
    hit_left = collideLineRect(pose.leftWrist.x, pose.leftWrist.y, pose.leftElbow.x, pose.leftElbow.y, mx, my, mwidth, mheight);
    hit_right = collideLineRect(pose.rightWrist.x, pose.rightWrist.y, pose.rightElbow.x, pose.rightElbow.y, mx, my, mwidth, mheight);
    if(1==debug){
      console.log(hit_left, hit_right);
    }
    // if user hits the monster
    if(hit_left || hit_right){
      // is_monster_alive = false;
      // choose a random monster image to be shown
      let value = random(random_values_0_1);
      // console.log(value);
      if(0 == value) {
        // red monster
        random_monster_choosen = red_monster;
      } else {
        // green monster
        random_monster_choosen = green_monster;
      }
      // choose a new location for monster in canvas
      mx = parseInt(random(max_x));
      my = parseInt(random(max_y));

    }
    pop();
  }
	// text(ml5.version, width/2, height/2);
}
