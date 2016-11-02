/*
* P4.js
* Authors: Matan Halevy, Daniel Hill
*/
	
// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}
//ASSIGNMENT-SPECIFIC API EXTENSION
// For use with matrix stack
THREE.Object3D.prototype.setMatrixFromStack = function(a) {
  this.matrix=mvMatrix;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}

// Data to for the two camera view
var mouseX = 0, mouseY = 0;
var windowWidth, windowHeight;
var views = [
	{
		left: 0,
		bottom: 0,
		width: 1.0,
		height: 0.499,
		background: new THREE.Color().setRGB( 0.2, 0.2, 0.3),
		eye: [ 0, 3, 0 ],
		up: [ 0, 1, 0 ],
		fov: 25,
		updateCamera: function ( camera, scene, mouseX, mouseY ) {		}
	},
	{
		left: 0.0,
		bottom: 0.501,
		width: 1.0,
		height: 0.499,
		background: new THREE.Color().setRGB( 0, 0, 0 ),
		eye: [ 0, 125, 0 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		updateCamera: function ( camera, scene, mouseX, mouseY ) {		}
	},
];



//SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
// renderer.setClearColor(0xFFFFFF); // white background colour
canvas.appendChild(renderer.domElement);

// Creating the cameras and adding it to the scene.
var view = views[0];
camera_Ant = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
camera_Ant.position.x = view.eye[ 0 ];
camera_Ant.position.y = view.eye[ 1 ];
camera_Ant.position.z = view.eye[ 2 ];
camera_Ant.up.x = view.up[ 0 ];
camera_Ant.up.y = view.up[ 1 ];
camera_Ant.up.z = view.up[ 2 ];
camera_Ant.lookAt(new THREE.Vector3(100,0,0));
view.camera = camera_Ant;
scene.add(view.camera);

var view = views[1];
camera_Key = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
camera_Key.position.x = view.eye[ 0 ];
camera_Key.position.y = view.eye[ 1 ];
camera_Key.position.z = view.eye[ 2 ];
camera_Key.up.x = view.up[ 0 ];
camera_Key.up.y = view.up[ 1 ];
camera_Key.up.z = view.up[ 2 ];
camera_Key.lookAt( {"x":0, "y":0, "z":0} );
view.camera = camera_Key;
scene.add(view.camera);

//Uncomment for orbit controls for debugging
//var controls = new THREE.OrbitControls(camera_Key);

// ADAPT TO WINDOW RESIZE
function resize() {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
  renderer.setSize(window.innerWidth,window.innerHeight);
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () 
{
     window.scrollTo(0,0);
}

// Define the ambient and point lights
var ambientLight = new THREE.AmbientLight( 0xffffff );
scene.add( ambientLight );

var lights = [];
lights[0] = new THREE.PointLight( 0x111111, 1, 0 );
lights[0].castShadow = true;

lights[0].position.set( 70, 5, 0 );

scene.add( lights[0] );

//Lighting

// LIGHTING UNIFORMS
var lightColor = new THREE.Color(1.0,1.0,1.0);
var antLightColor = new THREE.Color(0.1,0.1,0.1);
var ambientColor = new THREE.Color(0.4,0.4,0.4);
var antAmbientColor = new THREE.Color(0.97,0.83,0.83);
var lightPosition = new THREE.Vector3(1.5*paperHeight,paperWidth,paperWidth/2);

var kAmbient = 0.4;
var kAntAmbient = 0.1;
var kDiffuse = 0.8;
var kAntDiffuse = 1.8;
var kSpecular = 0.8;
var kAntSpecular = 1.2;
var shininess = 10.0;
var antShininess = 20.0
var toneBalance = 0.5;

// Phong material for the ant
var antMaterial = new THREE.ShaderMaterial({
  uniforms: {
     lightColor : {type : 'c', value: antLightColor},
     ambientColor : {type : 'c', value: antAmbientColor},
     lightPosition : {type: 'v3', value: lightPosition},
     kAmbient : {type: 'f', value: kAntAmbient},
     kDiffuse : {type: 'f', value: kAntDiffuse},
     kSpecular: {type: 'f', value: kAntSpecular},
     shininess : {type: 'f', value: antShininess},
     texture: {type: 't', value: THREE.ImageUtils.loadTexture( "images/anttext.jpg")},
   
   },
})

// Anisotropic material for the keys
var keyMaterial = new THREE.ShaderMaterial({
   uniforms: {
     lightColor : {type : 'c', value: lightColor},
     ambientColor : {type : 'c', value: ambientColor},
     lightPosition : {type: 'v3', value: lightPosition},
   },
});


var shaderFiles = [
	'glsl/anisotropic.vs.glsl',
	'glsl/anisotropic.fs.glsl',
	'glsl/phong.vs.glsl',
	'glsl/phong.fs.glsl',
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  keyMaterial.vertexShader = shaders['glsl/anisotropic.vs.glsl'];
  keyMaterial.fragmentShader = shaders['glsl/anisotropic.fs.glsl'];
  keyMaterial.needsUpdate = true;
  antMaterial.vertexShader = shaders['glsl/phong.vs.glsl'];
  antMaterial.fragmentShader = shaders['glsl/phong.fs.glsl'];
  antMaterial.needsUpdate = true;
})

// Defining the ant geometry and attributes
var legsA = [];
var legsB = [];
var antScale = 0.25; // Controls the size of the ant
var antMagic = 12; // A magic number defining the approximate length from the camera to the ant

var bottomSegLeg = new THREE.CylinderGeometry(0.3, 0.22, 4.2)
bottomSegLeg.rotateZ(Math.PI/2);
bottomSegLeg.rotateY(-Math.PI/3);
var transToOtherLegSeg = new THREE.Matrix4().set(1,0,0,1.8, 0,1,0,0, 0,0,1,1, 0,0,0,1);

var midRLeg = {};
midRLeg["geometry"] = new THREE.CylinderGeometry(0.25,0.3,2);
midRLeg.geometry.rotateZ(Math.PI/2);
midRLeg.geometry.rotateY(Math.PI/5);
midRLeg.geometry.merge(bottomSegLeg, transToOtherLegSeg);
midRLeg.geometry.translate(2.8,0,-3);
midRLeg["obj"] = new THREE.Mesh( midRLeg.geometry, antMaterial);
legsA.push(midRLeg);

var frontRLeg = {};
frontRLeg["geometry"] = new THREE.CylinderGeometry(0.25,0.3,2);
frontRLeg.geometry.rotateZ(Math.PI/2);
frontRLeg.geometry.rotateY(Math.PI/5);
frontRLeg.geometry.merge(bottomSegLeg, transToOtherLegSeg);
frontRLeg.geometry.translate(2.5,-1.75,-3);
frontRLeg["obj"] = new THREE.Mesh( frontRLeg.geometry, antMaterial);
legsB.push(frontRLeg);

var backRLeg = {};
backRLeg["geometry"] = new THREE.CylinderGeometry(0.25,0.3,2);
backRLeg.geometry.rotateZ(Math.PI/2);
backRLeg.geometry.rotateY(Math.PI/5);
backRLeg.geometry.merge(bottomSegLeg, transToOtherLegSeg);
backRLeg.geometry.translate(2.5,1.75,-3);
backRLeg["obj"] = new THREE.Mesh(backRLeg.geometry, antMaterial);
legsB.push(backRLeg);

var midLLeg = {};
midLLeg["geometry"] = new THREE.CylinderGeometry(0.25,0.3,2);
midLLeg.geometry.rotateZ(Math.PI/2);
midLLeg.geometry.rotateY(Math.PI/5);
midLLeg.geometry.merge(bottomSegLeg, transToOtherLegSeg);
midLLeg.geometry.rotateX(Math.PI);
midLLeg.geometry.rotateY(Math.PI);
midLLeg.geometry.translate(-2.8,0,-3);
midLLeg["obj"] = new THREE.Mesh( midLLeg.geometry, antMaterial);
legsB.push(midLLeg);

var frontLLeg = {};
frontLLeg["geometry"] = new THREE.CylinderGeometry(0.25,0.3,2);
frontLLeg.geometry.rotateZ(Math.PI/2);
frontLLeg.geometry.rotateY(Math.PI/5);
frontLLeg.geometry.merge(bottomSegLeg, transToOtherLegSeg);
frontLLeg.geometry.rotateX(Math.PI);
frontLLeg.geometry.rotateY(Math.PI);
frontLLeg.geometry.translate(-2.5,-1.75,-3);
frontLLeg["obj"] = new THREE.Mesh( frontLLeg.geometry, antMaterial);
legsA.push(frontLLeg);

var backLLeg = {};
backLLeg["geometry"] = new THREE.CylinderGeometry(0.25,0.3,2);
backLLeg.geometry.rotateZ(Math.PI/2);
backLLeg.geometry.rotateY(Math.PI/5);
backLLeg.geometry.merge(bottomSegLeg, transToOtherLegSeg);
backLLeg.geometry.rotateX(Math.PI);
backLLeg.geometry.rotateY(Math.PI);
backLLeg.geometry.translate(-2.5,1.75,-3);
backLLeg["obj"] = new THREE.Mesh(backLLeg.geometry, antMaterial);
legsA.push(backLLeg);


var antBackSeg = new THREE.SphereGeometry(3.3, 32, 32);
antBackSeg.scale(0.9,1.2,1);
antBackSeg.rotateY(Math.PI/6);
var transAntBackSeg = new THREE.Matrix4().set(1,0,0,0, 0,1,0,5.5, 0,0,1,-1.5, 0,0,0,1);

var antennaRight = new THREE.CylinderGeometry(0.1, 0.15, 2);
antennaRight.rotateZ(Math.PI/2);
antennaRight.rotateY(Math.PI/3);
antennaRight.rotateX(Math.PI/7);
var transAntennaLeft = new THREE.Matrix4().set(1,0,0,-1, 0,1,0,0, 0,0,1,-3, 0,0,0,1);

var antennaLeft = new THREE.CylinderGeometry(0.1, 0.15, 2);
antennaLeft.rotateZ(Math.PI/2);
antennaLeft.rotateY(2*Math.PI/3);
antennaLeft.rotateX(Math.PI/7);
var transAntennaRight = new THREE.Matrix4().set(1,0,0,1, 0,1,0,0, 0,0,1,-3, 0,0,0,1);

var antHeadSeg = new THREE.SphereGeometry(3, 32, 32);
antHeadSeg.scale(0.8,1,0.9);
antHeadSeg.merge(antennaRight, transAntennaRight);
antHeadSeg.merge(antennaLeft, transAntennaLeft);
var transAntHeadSeg = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-5, 0,0,1,-1, 0,0,0,1);

var ant = {};
ant["geometry"] = new THREE.SphereGeometry(2.8, 32, 32);
ant.geometry.scale(0.8,1.2,0.8);
ant.geometry.merge(antBackSeg, transAntBackSeg);
ant.geometry.merge(antHeadSeg,transAntHeadSeg);
ant.geometry.translate(0,0,-2.5)
ant["obj"] = new THREE.Mesh( ant.geometry, antMaterial);
ant.obj.add(midRLeg.obj);
ant.obj.add(frontRLeg.obj);
ant.obj.add(backRLeg.obj);
ant.obj.add(midLLeg.obj);
ant.obj.add(frontLLeg.obj);
ant.obj.add(backLLeg.obj);
ant.obj.applyMatrix(new THREE.Matrix4().makeScale(antScale, antScale, antScale));
ant.obj.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2+Math.PI/10));
ant.obj.position.x = 0;
ant.obj.position.y = -1.5;
ant.obj.position.z = -10;
camera_Ant.add(ant.obj);
ant.geometry.computeBoundingBox();

// Paper
var paperWidth = 85;
var paperHeight = 110;
var paperGeometry = new THREE.PlaneBufferGeometry(paperWidth,paperHeight);
var paptex =  THREE.ImageUtils.loadTexture( "images/Lined-Paper.png");
var papbump = THREE.ImageUtils.loadTexture("images/crumpled-paper.jpg");
var paperMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, map: paptex, bumpMap: papbump, bumpScale: 3, side: THREE.DoubleSide})
var paper = new THREE.Mesh(paperGeometry, paperMaterial);
paper.rotateY(Math.PI/2);
paper.rotateX(Math.PI/2);
scene.add(paper);

//Flattened Ant
var sqAntWidth = 3;
var sqAntLength = 8;
var squishedAntGeometry = new THREE.PlaneBufferGeometry(sqAntLength,sqAntWidth);
var squishedAntTex = THREE.ImageUtils.loadTexture("images/squishedant.png");
var squishedAntMaterial = new THREE.MeshPhongMaterial({color:0xffffff, map: squishedAntTex, side: THREE.DoubleSide, transparent: true, opacity:0.5, color: 0xff0000});
var sqant = [];

// Roller: base of the typewriter
var papdist = 15;
var rollerGeometry = new THREE.CylinderGeometry(3,3,paperHeight,32);
var rollerMaterial = new THREE.MeshLambertMaterial({color: 0x333333});
var roller = new THREE.Mesh(rollerGeometry,rollerMaterial);
roller.rotateZ(Math.PI/2);
roller.position.z = -1*paperWidth/2 - papdist - 3;
scene.add(roller);

// KEYS creation

var keys = []; // Will hold all the key objects

// A map from the key string to the index in the array keys[]
var keyMap = {"1":0,
			  "2":1,
			  "3":2,
			  "4":3,
			  "5":4,
			  "6":5,
			  "7":6,
			  "8":7,
			  "9":8,
			  "0":9,
			  "q":10,
			  "w":11,
			  "e":12,
			  "r":13,
			  "t":14,
			  "y":15,
			  "u":16,
			  "i":17,
			  "o":18,
			  "p":19,
			  "a":20,
			  "s":21,
			  "d":22,
			  "f":23,
			  "g":24,
			  "h":25,
			  "j":26,
			  "k":27,
			  "l":28,
			  ";":29,
			  "z":30,
			  "x":31,
			  "c":32,
			  "v":33,
			  "b":34,
			  "n":35,
			  "m":36,
			  ",":37,
			  ".":38,
			  "/":39,			  
};

for (var ix = 0; ix < 40; ix ++) {
	keys.push({});
}

for (var chr in keyMap) {
	if (keyMap.hasOwnProperty(chr)) {
		keys[keyMap[chr]] = {};
		keys[keyMap[chr]].str = chr;
		keys[keyMap[chr]].hit = false;
	}
}


var toprow = keys.slice(0,10);
var upmidrow = keys.slice(10,20);
var lowmidrow = keys.slice(20,30);
var lowrow = keys.slice(30,40);

var keyWidth = 10;

var upperKey = new THREE.BoxGeometry(paperHeight/10,paperWidth/4,keyWidth);
var upperRod = new THREE.CylinderGeometry(1,1,paperWidth*3/4 + papdist,32);
var trans = new THREE.Matrix4().set(1,0,0,paperHeight/20-1,
									0,1,0,-1*paperWidth*3/8 - papdist/2 - paperWidth/8,
									0,0,1,-1*(keyWidth/2 - 1),
									0,0,0,1);
upperKey.merge(upperRod,trans);
var upperDist = paperWidth/8 + paperWidth*3/4 + papdist;

for (var ix in toprow) {
	var mesh = new THREE.Mesh(upperKey, keyMaterial);
	mesh.position.x = paperHeight/2-paperHeight/20-ix*paperHeight/10;
	mesh.position.y = upperDist;
	mesh.position.z = -1*paperWidth/2 - papdist;
	toprow[ix].obj = mesh;
	toprow[ix].rel = mesh.matrix;
	scene.add(mesh);
}

var midUpKey = new THREE.BoxGeometry(paperHeight/10,paperWidth/4,keyWidth);
var midUpRod = new THREE.CylinderGeometry(1,1,paperWidth/2 + papdist,32);
var trans = new THREE.Matrix4().set(1,0,0,paperHeight/20-3,
									0,1,0,-1*paperWidth/4 - papdist/2 - paperWidth/8,
									0,0,1,-1*(keyWidth/2 - 1),
									0,0,0,1);
midUpKey.merge(midUpRod,trans);
var midUpDist = paperWidth/8 + paperWidth/2 + papdist;

for (var ix in upmidrow) {
	var mesh = new THREE.Mesh(midUpKey, keyMaterial);
	mesh.position.x = paperHeight/2-paperHeight/20-ix*paperHeight/10;
	mesh.position.y = midUpDist;
	mesh.position.z = -1*paperWidth/2 - papdist;
	upmidrow[ix].obj = mesh;
	upmidrow[ix].rel = mesh.matrix;
	scene.add(mesh);
}

var midDownKey = new THREE.BoxGeometry(paperHeight/10,paperWidth/4,keyWidth);
var midDownRod = new THREE.CylinderGeometry(1,1,paperWidth/4 + papdist,32);
var trans = new THREE.Matrix4().set(1,0,0,paperHeight/20-5,
									0,1,0,-1*paperWidth/8 - papdist/2 - paperWidth/8,
									0,0,1,-1*(keyWidth/2 - 1),
									0,0,0,1);
midDownKey.merge(midDownRod,trans);
var midDownDist = paperWidth/8 + paperWidth/4 + papdist;

for (var ix in lowmidrow) {
	var mesh = new THREE.Mesh(midDownKey, keyMaterial);
	mesh.position.x = paperHeight/2-paperHeight/20-ix*paperHeight/10;
	mesh.position.y = midDownDist;
	mesh.position.z = -1*paperWidth/2 - papdist;
	lowmidrow[ix].obj = mesh;
	lowmidrow[ix].rel = mesh.matrix;
	scene.add(mesh);
}

var lowerKey = new THREE.BoxGeometry(paperHeight/10,paperWidth/4,keyWidth);
var lowerRod = new THREE.CylinderGeometry(1,1,papdist,32);
var trans = new THREE.Matrix4().set(1,0,0,paperHeight/20-7,
									0,1,0,-1*papdist/2 - paperWidth/8,
									0,0,1,-1*(keyWidth/2 - 1),
									0,0,0,1);
lowerKey.merge(lowerRod,trans);
var lowerDist = paperWidth/8 + papdist;

for (var ix in lowrow) {
	var mesh = new THREE.Mesh(lowerKey, keyMaterial);
	mesh.position.x = paperHeight/2-paperHeight/20-ix*paperHeight/10;
	mesh.position.y = lowerDist;
	mesh.position.z = -1*paperWidth/2 - papdist;
	lowrow[ix].obj = mesh;
	lowrow[ix].rel = mesh.matrix;
	scene.add(mesh);
}

// Create the specific keys
var one=keys[0], two=keys[1], three=keys[2], four=keys[3], five=keys[4], 
six=keys[5], seven=keys[6], eight=keys[7], nine=keys[8], zero=keys[9], 
q=keys[10], w=keys[11], e=keys[12], r=keys[13], t=keys[14], y=keys[15], 
u=keys[16], i=keys[17], o=keys[18], p=keys[19], a=keys[20], s=keys[21], 
d=keys[22], f=keys[23], g=keys[24], h=keys[25], j=keys[26], k=keys[27], 
l=keys[28], semi=keys[29], z=keys[30], x=keys[31], c=keys[32], v=keys[33], 
b=keys[34], n=keys[35], m=keys[36], comma=keys[37], period=keys[38], slash=keys[39];


// TIME GLOBALS
var timeStall = 0.3; // how long the key waits to swing
var timeDown = 0.2; // how long the key goes down for
var timeWait = 1.5; // how long the key stays down
var timeUp = 0.5; // how long it takes for the key to come up

// Control items
var clock = new THREE.Clock(true); // main clock
var curKey; // the current key moving
var antMove = false; // Whether or not the ant is currently moving
var cursPos = window.innerWidth/2; // The x position of the cursor
var speed = 0.5; // The ant's moving speed
var turnRate = 1/10; // The sensitivity of the cursor turn
var start; // The start time of the current animation
var frameStart; // When we start counting frames
var frames = 0; // How many frames we have calculated
var hits = []; // List of hit keys
var antDeadStart; // Time when the ant gets smashed
var antDeadTime = 5; // How long the ant stays dead before regenerating
var antDead = false; // Whether the ant is currently dead
var antScore = 0; // the ant's score
var keyScore = 0; // the typewriter's score
var gameover = false; // Is the game over?

// Laser globals
var laserMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
var laserStart = 0;
var laserDistance = paperHeight;
var laserTime = 0.3;
var laser;

// Particle system globals
var particleSystem;
var particles = new THREE.Geometry();
var particleCount = 5000; // How many smoke particles
var smokeDecel = 0.01; // How fast the smoke decelerates
var smokeSpeed = 0.6; // How fast the smoke is initially
var smokeEntropy = 0.05; // The x/z randomness of the smoke
var smokeSize = 4; // size of each smoke particle
var smokeReady = false; // Is an object currently smoking
var smoketexture = new THREE.TextureLoader().load( "images/circle-xxl.png" );
var pMaterial = new THREE.PointsMaterial({
      transparent: true,
      opacity: 0.1,
      size: smokeSize,
      map: smoketexture,
      vertexColors: THREE.VertexColors
});



// Text objects
var textLeftOffset = 100; // Offset of the control panel text

var font;
var floader = new THREE.FontLoader();
var fpsobj, fpsGeo, fpsText;
var antTxtGeo, antText;
var keyTxtGeo, keyText;
var textMaterial = new THREE.MeshLambertMaterial({color: 0xa0a0ee});

// Creates the Smash! text
function smashText() {
	var smashGeo = new THREE.TextGeometry("Smash!", fpsobj);
	var smashText = new THREE.Mesh(smashGeo, new THREE.MeshLambertMaterial({color: 0xff0000}));
	smashText.rotation.z = Math.PI;
	smashText.rotation.x = -1*Math.PI/2;
	smashText.position.y = -550;
	scene.add(smashText);	
}

// Updates the ant's score
function antTextUpdate() {
	if (antText) scene.remove(antText);
	antTxtGeo = new THREE.TextGeometry("Ant: "+antScore, fpsobj);
	antText = new THREE.Mesh(antTxtGeo, textMaterial);
	antText.rotation.z = Math.PI;
	antText.rotation.x = -1*Math.PI/2;
	antText.position.x = paperHeight/2+textLeftOffset;
	antText.position.y = -1;
	antText.position.z = paperWidth/4 - fpsobj.size;
	scene.add(antText);
}

// Updates the key's score
function keyTextUpdate() {
	if (keyText) scene.remove(keyText);
	keyTxtGeo = new THREE.TextGeometry("Key: "+keyScore, fpsobj);
	keyText = new THREE.Mesh(keyTxtGeo, textMaterial);
	keyText.rotation.z = Math.PI;
	keyText.rotation.x = -1*Math.PI/2;
	keyText.position.x = paperHeight/2+textLeftOffset;
	keyText.position.y = -1;
	keyText.position.z =  -1*fpsobj.size;
	scene.add(keyText);
}

// Updates the framerate text
function frameTextUpdate() {
	fpsGeo = new THREE.TextGeometry("Frames Per Second: "+frames, fpsobj);
	fpsText = new THREE.Mesh(fpsGeo, textMaterial);
	fpsText.rotation.z = Math.PI;
	fpsText.rotation.x = -1*Math.PI/2;
	fpsText.position.x = paperHeight/2+textLeftOffset;
	fpsText.position.y = 1;
	fpsText.position.z = paperWidth/2 - fpsobj.size;
	scene.add(fpsText);
}

// Loads the text font
floader.load( 'fonts/gentilis_regular.typeface.js', function ( response ) {
	font = response;
	fpsobj = {
		font: font,
		size: 5,
		height: 0.1	
	};
	smashText();
	frameTextUpdate();
	antTextUpdate();
	keyTextUpdate();
});

// The typewriter gets a point
function keyPoint() {
	// Increment the key's point
	keyScore++;
	keyTextUpdate();
	if (keyScore == 10) gameOver(0);
	
	// Kill the ant
	antDead = true;
	antDeadStart = clock.getElapsedTime();
	
	// Face the smashed text
	camera_Ant.position.x = 5;
	camera_Ant.position.y = -500;
	camera_Ant.position.z = 0;
	camera_Ant.up = new THREE.Vector3(0,0,1);
	camera_Ant.lookAt(new THREE.Vector3(0,-550,0));
}

// End the game, disable any more controls
function gameOver(who) {
	if (who == 0) {
		var winGeo = new THREE.TextGeometry("Keyboard wins!", fpsobj);
	} else if (who == 1) {
		var winGeo = new THREE.TextGeometry("Ant wins!", fpsobj);
	}
	var winText = new THREE.Mesh(winGeo, new THREE.MeshLambertMaterial({color: 0x0099ff}));
	winText.rotation.z = Math.PI;
	winText.rotation.x = -1*Math.PI/2;
	winText.position.y = 100;
	winText.position.x = -5;
	scene.add(winText);
	
	antMove = false;
	
	gameover = true;
}

// Increments the ant's score
function antPoint() {
	antScore += 2;
	antTextUpdate();
	if (antScore == 10) gameOver(1);
}

// Place an outline of the squished ant on the paper
function putSquishedAnt() {
	var squishedAnt = new THREE.Mesh(squishedAntGeometry,squishedAntMaterial);
	squishedAnt.rotateY(Math.PI/2);
	squishedAnt.rotateX(Math.PI/2);
	sqant.push(squishedAnt);
	
	var antpos = camera_Ant.localToWorld(new THREE.Vector3(ant.obj.position.x, ant.obj.position.y, ant.obj.position.z));
	squishedAnt.position.x = antpos.x;
	squishedAnt.position.y = 0.10;
	squishedAnt.position.z = antpos.z;
	
	scene.add(squishedAnt);
}

// Check whether or not the ant was smashed by the swinging key
function checkSmash(key) {
	if (!ant.obj.visible) return;
	var pos = key.obj.position;
	var dh = paperHeight/20;
	var dw = paperWidth/8;
	ant.geometry.computeBoundingBox();
	var antmax = ant.obj.localToWorld(ant.geometry.boundingBox.max);
	var antmin = ant.obj.localToWorld(ant.geometry.boundingBox.min);
	var maxx = antmax.x;
	var minx = antmin.x;
	var maxz = antmax.z;
	var minz = antmin.z;
	var c1 = maxx < pos.x+dh && maxx > pos.x-dh && maxz < pos.z+dw && maxz > pos.z-dw && pos.y < 10;
	var c2 = minx < pos.x+dh && minx > pos.x-dh && minz < pos.z+dw && minz > pos.z-dw && pos.y < 10;
	var c3 = maxx < pos.x+dh && maxx > pos.x-dh && minz < pos.z+dw && minz > pos.z-dw && pos.y < 10;
	var c4 = minx < pos.x+dh && minx > pos.x-dh && maxz < pos.z+dw && maxz > pos.z-dw && pos.y < 10;
	if (c1 || c2 || c3 || c4) {
		ant.obj.visible = false;
		antMove = false;
		putSquishedAnt();
		keyPoint();
	} 
	ant.obj.matrixWorldNeedsUpdate = true;
}

// Animates the key's swing down, checks whether the ant was smashed
function swing(element) {
	if(element.hit) return;
	
	var now = clock.getElapsedTime();
	
	var transUp = new THREE.Matrix4().makeTranslation(0,0,paperWidth/2+papdist);
	var transDown = new THREE.Matrix4().makeTranslation(0,0,-1*(paperWidth/2+papdist));
	if (now - start < timeStall){}
	else if (now - start < timeStall + timeDown) {
		var p = Math.PI/2*((now-start-timeStall)/timeDown);
		var rot = new THREE.Matrix4().makeRotationX(p);
		var mat = new THREE.Matrix4().multiplyMatrices(transDown,rot).multiply(transUp).multiply(element.rel);
		element.obj.setMatrix(mat);
		checkSmash(element);
	} else if (now - start < timeStall + timeDown + timeWait) {
		var p = Math.PI/2;
		var rot = new THREE.Matrix4().makeRotationX(p);
		var mat = new THREE.Matrix4().multiplyMatrices(transDown,rot).multiply(transUp).multiply(element.rel);
		element.obj.setMatrix(mat);
	} else if (now - start < timeStall + timeDown + timeWait + timeUp) {
		if (!element.hit) {
			var p = (Math.PI/2 + 0.05)*((now-start-timeDown-timeWait-timeStall)/timeDown);
			var rot = new THREE.Matrix4().makeRotationX(-1*p);
			var rot90 = new THREE.Matrix4().makeRotationX(Math.PI/2);
			var mat = new THREE.Matrix4().multiplyMatrices(transDown,rot).multiply(rot90).multiply(transUp).multiply(element.rel);
			element.obj.setMatrix(mat);
		}
	} else {
		if (!element.hit) element.obj.setMatrix(element.rel);
		curKey = null;
	}
	
}

// Causes the key to smoke
function smoke(key) {
    particles.vertices = [];
    
    var colors = [];
    for (var p = 0; p < particleCount; p++) {

		var pX = Math.random() * paperHeight/10 - paperHeight/20 + key.position.x,
		pY = Math.random()*keyWidth,
		pZ = Math.random() * paperWidth/4 - paperWidth/8 + key.position.z,
		particle = new THREE.Vector3(pX, pY, pZ);
      
      particle.velocity = new THREE.Vector3(0, smokeSpeed, 0);

	  particles.vertices.push(particle);
	  
	  var c = Math.random()*0.2+0.6;
	  colors.push(new THREE.Color(c, c, c));
	}
  
	particles.colors = colors;
	particles.verticesNeedUpdate = true;
  
	// create the particle system
	particleSystem = new THREE.Points(particles, pMaterial);

	// add it to the scene
	scene.add(particleSystem);
	smokeReady = true;
}

// Ant shoots the laser
function shoot(event) {
	if (event.clientY < window.innerHeight/2 || (laser && laser.visible)) return;
	var raycast = new THREE.Raycaster();
	var dir = {"x":( cursPos / window.innerWidth ) * 2 - 1, "y": - ( event.clientY / window.innerHeight )*4 + 3};
	raycast.setFromCamera( dir, camera_Ant );
	var intersects = raycast.intersectObjects( scene.children );
	
	// Check if the key was hit
	for ( var ix = 0; ix < intersects.length; ix++ ) {
		for (var jx = 0; jx < keys.length; jx ++) {
			if (intersects[ix].object == keys[jx].obj && curKey == keys[jx].str && !keys[jx].hit) {
				keys[jx].hit = true;
				hits.push(keys[jx]);
				curKey = null;
				antPoint();
				smoke(keys[jx].obj);
			}
		}
	}
	
	// Draw the laser
	var laserGeo = new THREE.Geometry();
	var dest = new THREE.Vector3(raycast.ray.origin.x + laserDistance*raycast.ray.direction.x,
								 raycast.ray.origin.y + laserDistance*raycast.ray.direction.y,
								 raycast.ray.origin.z + laserDistance*raycast.ray.direction.z);
	laserGeo.vertices.push(ant.obj.worldToLocal(dest), new THREE.Vector3(0,0,-5));
	laser = new THREE.Line(laserGeo, laserMaterial);
	laserStart = clock.getElapsedTime();
	ant.obj.add(laser);
}

// Check whether the given vector movement is legal
function checkPointInBounds(x,z,dx,dz,key) {
	var ibx = true;
	var ibz = true;
	var moveback = false;
	var pos = key.obj.position;
	var dh = paperHeight/20;
	var dw = paperWidth/8;
	
	if (x > pos.x-dh && x < pos.x+dh && z > pos.z-dw && z < pos.z+dw) {
		ibx = false;
		ibz = false;
		moveback = true;
	}
	
	// entering key from right
	if (x < pos.x-dh && x+dx >= pos.x-dh && z < pos.z+dw && z > pos.z-dw) {
		ibx = false;
	}
	// entering key from left
	else if (x > pos.x+dh && x+dx <= pos.x+dh && z < pos.z + dw && z > pos.z - dw) {
		ibx = false;
	}
	// entering key from top
	if (z > pos.z+dw && z+dz <= pos.z+dw && x < pos.x + dh && x > pos.x - dh) {
		ibz = false;
	}
	// entering key from bottom
	else if (z < pos.z-dw && z+dz >= pos.z-dw && x < pos.x + dh && x > pos.x - dh) {
		ibz = false;
	}
	return {"x": ibx, "z": ibz, "moveback":moveback};
}

// Check whether the ant's movement on the page is legal
function inBounds(max,min,dx,dz) {
	var ibx = true;
	var ibz = true;
	var moveback = false;

	for (ix in hits) {
		var p1 = checkPointInBounds(max.x,max.z,dx,dz,hits[ix]);
		var p2 = checkPointInBounds(max.x,min.z,dx,dz,hits[ix]);
		var p3 = checkPointInBounds(min.x,max.z,dx,dz,hits[ix]);
		var p4 = checkPointInBounds(min.x,min.z,dx,dz,hits[ix]);
		ibx = ibx && p1.x && p2.x && p3.x && p4.x;
		ibz = ibz && p1.z && p2.z && p3.z && p4.z;
		moveback = moveback || p1.moveback || p2.moveback || p3.moveback || p4.moveback;
	}
	var ind = keyMap[curKey];
	if (ind) {
		var p1 = checkPointInBounds(max.x,max.z,dx,dz,keys[ind]);
		var p2 = checkPointInBounds(max.x,min.z,dx,dz,keys[ind]);
		var p3 = checkPointInBounds(min.x,max.z,dx,dz,keys[ind]);
		var p4 = checkPointInBounds(min.x,min.z,dx,dz,keys[ind]);
		ibx = ibx && p1.x && p2.x && p3.x && p4.x;
		ibz = ibz && p1.z && p2.z && p3.z && p4.z;
		moveback = moveback || p1.moveback || p2.moveback || p3.moveback || p4.moveback;
	}
	return {"x": ibx, "z": ibz};
}

// Moves the ant and camera position
function antCameraMove() {
	// Set ray from picking location
	var raycast = new THREE.Raycaster();
	var look = {"x":(( cursPos / window.innerWidth ) * 2 - 1)*turnRate, "y": camera_Ant.position.y};
	raycast.setFromCamera( look, camera_Ant );
	var lookat = new THREE.Vector3();
	lookat.x = raycast.ray.origin.x + 5*raycast.ray.direction.x;
	lookat.y = raycast.ray.origin.y;
	lookat.z = raycast.ray.origin.z + 5*raycast.ray.direction.z;
	camera_Ant.lookAt(lookat);
	ant.obj.rotation.z = look.x*views[0].fov/2;
	
	// Direction of movement
	var xmove = camera_Ant.position.x + speed*raycast.ray.direction.x;
	var zmove = camera_Ant.position.z + speed*raycast.ray.direction.z;
	
	// Calculate ant's bounding box
	ant.geometry.computeBoundingBox();
	var bbmax = ant.obj.localToWorld(ant.geometry.boundingBox.max);
	var bbmin = ant.obj.localToWorld(ant.geometry.boundingBox.min);	
	
	// Check if the ant is in bounds
	var ib = inBounds(bbmax,bbmin,speed*raycast.ray.direction.x,speed*raycast.ray.direction.z);
	
	if (xmove < paperHeight/2-antMagic && xmove > -1*paperHeight/2+antMagic && ib.x && !ib.moveback) {
		camera_Ant.position.x = xmove;
	}
	if (zmove < paperWidth/2-antMagic && zmove > -1*paperWidth/2+antMagic && ib.z && !ib.moveback) {
		camera_Ant.position.z = zmove;
	}
	
	// If the ant's position is illegal, move it backwards!
	while (ib.moveback) {
		camera_Ant.position.x -= 10*speed*raycast.ray.direction.x;
		camera_Ant.position.z -= 10*speed*raycast.ray.direction.z;
		ib = inBounds(bbmax,bbmin,speed*raycast.ray.direction.x,speed*raycast.ray.direction.z);
	}
}

// Animate the ant's legs
function moveAntLegs() {
	for (ix in legsA){
		  legsA[ix].obj.setMatrix(new THREE.Matrix4().makeRotationZ(-1*Math.sin(Math.PI*clock.getElapsedTime()*(3+speed))/6));
	}
	for (ix in legsB){
  		legsB[ix].obj.setMatrix(new THREE.Matrix4().makeRotationZ(Math.sin(Math.PI*clock.getElapsedTime()*(3+speed))/6));
    }
}

// Move the ant
function moveAnt() {
	antCameraMove();
	moveAntLegs();
}

// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();
var grid_state = false;
		
function onKeyDown(event)
{
	if (gameover) return;
	if (!curKey) start = clock.getElapsedTime();
	// TO-DO: BIND KEYS TO YOUR CONTROLS	  
  if(keyboard.eventMatches(event,"shift+g"))
  {  // Reveal/Hide helper grid
    grid_state = !grid_state;
    grid_state? scene.add(grid) : scene.remove(grid);
  }  else if (keyboard.eventMatches(event,"1")) {
  	  if (!curKey) curKey = "1";
	   
  } else if (keyboard.eventMatches(event,"2")) {
  	  if (!curKey) curKey = "2";
	   
  } else if (keyboard.eventMatches(event,"3")) {
  	  if (!curKey) curKey = "3";
	   
  } else if (keyboard.eventMatches(event,"4")) {
  	  if (!curKey) curKey = "4";
	   
  } else if (keyboard.eventMatches(event,"5")) {
  	  if (!curKey) curKey = "5";
	   
  } else if (keyboard.eventMatches(event,"6")) {
  	  if (!curKey) curKey = "6";
	   
  } else if (keyboard.eventMatches(event,"7")) {
  	  if (!curKey) curKey = "7";
	   
  } else if (keyboard.eventMatches(event,"8")) {
  	  if (!curKey) curKey = "8";
	   
  } else if (keyboard.eventMatches(event,"9")) {
  	  if (!curKey) curKey = "9";
	   
  } else if (keyboard.eventMatches(event,"0")) {
  	  if (!curKey) curKey = "0";
	   
  } else if (keyboard.eventMatches(event,"q")) {
  	  if (!curKey) curKey = "q";
	   
  } else if (keyboard.eventMatches(event,"w")) {
  	  if (!curKey) curKey = "w";
	   
  } else if (keyboard.eventMatches(event,"r")) {
  	  if (!curKey) curKey = "r";
	   
  } else if (keyboard.eventMatches(event,"e")) {
  	  if (!curKey) curKey = "e";
  } else if (keyboard.eventMatches(event,"t")) {
  	  if (!curKey) curKey = "t";
  } else if (keyboard.eventMatches(event,"y")) {
  	  if (!curKey) curKey = "y";
  } else if (keyboard.eventMatches(event,"u")) {
  	  if (!curKey) curKey = "u";
  } else if (keyboard.eventMatches(event,"i")) {
  	  if (!curKey) curKey = "i";
  } else if (keyboard.eventMatches(event,"o")) {
  	  if (!curKey) curKey = "o";
  } else if (keyboard.eventMatches(event,"p")) {
  	  if (!curKey) curKey = "p";
  } else if (keyboard.eventMatches(event,"a")) {
  	  if (!curKey) curKey = "a";
  } else if (keyboard.eventMatches(event,"s")) {
  	  if (!curKey) curKey = "s";
  } else if (keyboard.eventMatches(event,"d")) {
  	  if (!curKey) curKey = "d";
  } else if (keyboard.eventMatches(event,"f")) {
  	  if (!curKey) curKey = "f";
  } else if (keyboard.eventMatches(event,"g")) {
  	  if (!curKey) curKey = "g";
  } else if (keyboard.eventMatches(event,"h")) {
  	  if (!curKey) curKey = "h";
  } else if (keyboard.eventMatches(event,"j")) {
  	  if (!curKey) curKey = "j";
  } else if (keyboard.eventMatches(event,"k")) {
  	  if (!curKey) curKey = "k";
  } else if (keyboard.eventMatches(event,"l")) {
  	  if (!curKey) curKey = "l";
  } else if (keyboard.eventMatches(event,";")) {
  	  if (!curKey) curKey = ";";
  } else if (keyboard.eventMatches(event,"z")) {
  	  if (!curKey) curKey = "z";
  } else if (keyboard.eventMatches(event,"x")) {
  	  if (!curKey) curKey = "x";
  } else if (keyboard.eventMatches(event,"c")) {
  	  if (!curKey) curKey = "c";
  } else if (keyboard.eventMatches(event,"v")) {
  	  if (!curKey) curKey = "v";
  } else if (keyboard.eventMatches(event,"b")) {
  	  if (!curKey) curKey = "b";
  } else if (keyboard.eventMatches(event,"n")) {
  	  if (!curKey) curKey = "n";
  } else if (keyboard.eventMatches(event,"m")) {
  	  if (!curKey) curKey = "m";
  } else if (keyboard.eventMatches(event,",")) {
  	  if (!curKey) curKey = ",";
  } else if (keyboard.eventMatches(event,".")) {
  	  if (!curKey) curKey = ".";
  } else if (keyboard.eventMatches(event,"/")) {
  	  if (!curKey) curKey = "/";
  } else if (keyboard.eventMatches(event,"space")) {
  	antMove = !antMove;
  } 

}
keyboard.domElement.addEventListener('keydown', onKeyDown );
	
// Update typewriter
function updateKeys() {
	switch(true) {
		case(curKey == "1"):
			swing(one);
			break;
		case(curKey == "2"):
			swing(two);
			break;
		case(curKey == "3"):
			swing(three);
			break;
		case(curKey == "4"):
			swing(four);
			break;
		case(curKey == "5"):
			swing(five);
			break;
		case(curKey == "6"):
			swing(six);
			break;
		case(curKey == "7"):
			swing(seven);
			break;
		case(curKey == "8"):
			swing(eight);
			break;
		case(curKey == "9"):
			swing(nine);
			break;
		case(curKey == "0"):
			swing(zero);
			break;
		case(curKey == "q"):
			swing(q);
			break;
		case(curKey == "w"):
			swing(w);
			break;
		case(curKey == "e"):
			swing(e);
			break;
		case(curKey == "r"):
			swing(r);
			break;
		case(curKey == "t"):
			swing(t);
			break;
		case(curKey == "y"):
			swing(y);
			break;
		case(curKey == "u"):
			swing(u);
			break;
		case(curKey == "i"):
			swing(i);
			break;
		case(curKey == "o"):
			swing(o);
			break;
		case(curKey == "p"):
			swing(p);
			break;
		case(curKey == "a"):
			swing(a);
			break;
		case(curKey == "s"):
			swing(s);
			break;
		case(curKey == "d"):
			swing(d);
			break;
		case(curKey == "f"):
			swing(f);
			break;
		case(curKey == "g"):
			swing(g);
			break;
		case(curKey == "h"):
			swing(h);
			break;
		case(curKey == "j"):
			swing(j);
			break;
		case(curKey == "k"):
			swing(k);
			break;
		case(curKey == "l"):
			swing(l);
			break;
		case(curKey == ";"):
			swing(semi);
			break;
		case(curKey == "z"):
			swing(z);
			break;
		case(curKey == "x"):
			swing(x);
			break;
		case(curKey == "c"):
			swing(c);
			break;
		case(curKey == "v"):
			swing(v);
			break;
		case(curKey == "b"):
			swing(b);
			break;
		case(curKey == "n"):
			swing(n);
			break;
		case(curKey == "m"):
			swing(m);
			break;
		case(curKey == ","):
			swing(comma);
			break;
		case(curKey == "."):
			swing(period);
			break;
		case(curKey == "/"):
			swing(slash);
			break;
	}
}	

// Shoot event
canvas.addEventListener("click", function(event) {
	shoot(event);
});

// Move event
canvas.addEventListener("mousemove", function(event) {
	cursPos = event.clientX;
});

// Update the frame per second
function updateFPS() {
	if (!frameStart) {
		frameStart = clock.getElapsedTime();
	}
	var t = clock.getElapsedTime() - frameStart;
	if (t >= 1) {
		scene.remove(fpsText);
		frameTextUpdate();
		frames = 0;
		frameStart = clock.getElapsedTime();
	}
	frames++;
}

// Update the smoke particles
function updateSmoke() {
	var pCount = particles.vertices.length;
	var deadcount = 0;
	while (pCount--) {

    // get the particle
    var particle = particles.vertices[pCount];

    particle.velocity.y -= Math.random() * smokeDecel;
    particle.velocity.x += Math.random() * smokeEntropy - smokeEntropy/2;
    particle.velocity.z += Math.random() * smokeEntropy - smokeEntropy/2;
    	
    // and the position
    particle.x += particle.velocity.x;
    particle.y += particle.velocity.y;
    particle.z += particle.velocity.z;
    
    if (particle.velocity.y < 0) {
    	particle.y = -1;
    	particle.x = 0;
    	particle.z = 0;
    	particle.velocity.y = 0;
		particle.velocity.x = 0;
		particle.velocity.z = 0;
    }
    
    if (particle.y == -1) deadcount++;
  
    }
	particles.verticesNeedUpdate = true;
	if (deadcount == particles.vertices.length) smokeReady = false;
}

// Check if the ant should regenerate yet
function updateRegen() {
	if (clock.getElapsedTime() > antDeadStart + antDeadTime) {
		var randx = Math.random()*(paperHeight - 2*antMagic) - paperHeight/2 + antMagic;
		var randz = Math.random()*(paperWidth - 2*antMagic) - paperWidth/2 + antMagic;
		
		camera_Ant.position.x = randx;
		camera_Ant.position.y = views[0].eye[1];
		camera_Ant.position.z = randz;
		
		camera_Ant.up = new THREE.Vector3(0,1,0);
		camera_Ant.lookAt(100,0,0);
		
		ant.obj.visible = true;
		
		antDead = false;
	}
}

// SETUP UPDATE CALL-BACK
function update() {
  updateKeys();
  updateFPS();
  if (smokeReady) {
  	updateSmoke();
  }
  if (antMove) {
	  moveAnt();
  }
  if (antDead) {
	  updateRegen();
  }
  if (laser && laser.visible) {
	  if (clock.getElapsedTime() > laserStart + laserTime) {
	 	laser.visible = false; 
	 	laser.matrixWorldNeedsUpdate = true; 
	  }	
  }

  requestAnimationFrame(update);
  
  // UPDATES THE MULTIPLE CAMERAS IN THE SIMULATION
  for ( var ii = 0; ii < views.length; ++ii ) 
  {

		view = views[ii];
		camera_ = view.camera;

		view.updateCamera( camera_, scene, mouseX, mouseY );

		var left   = Math.floor( windowWidth  * view.left );
		var bottom = Math.floor( windowHeight * view.bottom );
		var width  = Math.floor( windowWidth  * view.width );
		var height = Math.floor( windowHeight * view.height );
		renderer.setViewport( left, bottom, width, height );
		renderer.setScissor( left, bottom, width, height );
		renderer.enableScissorTest ( true );
		renderer.setClearColor( view.background );

		camera_.aspect = width / height;
		camera_.updateProjectionMatrix();

		renderer.render( scene, camera_ );
	}
}

update();