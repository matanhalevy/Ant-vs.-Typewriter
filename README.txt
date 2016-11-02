Daniel Hill
Matan Halevy

WHAT
=======
Our game is a two-player game. The top player represents a typewriter that tries to smash an ant. The bottom player is an ant that tries to evade and disable the keyboard with lasers.
Advanced functionality items:
- Shaders: a crude metallic based shader is used for the keys
- Particle systems: when the ant shoots the key with a laser, the key goes up in smoke
- Collision detection: the ant gets smashed by the keyboard, and the ant runs into disabled keys and the edges of the page
- Animation: the keys smoothly animate, and the ant's legs smoothly animate

TO PLAY
=======
Open P4.html in firefox (chrome settings need to be changed from default, firefox is by default able to load local js files

HOW
=======
3D objects:
We created all the geometry in this game. That includes the keys, the ant, the paper plane, and the text.
The keys are represented by objects that hold the object, it's rest position, whether or not it is hit, and it's associated key string.
All the keys are also kept in an array with specified index.
We are able to map from the key string to the associated key using a separate dictionary that maps the string to the index of the key in the array.

3D Camera:
We have two camera views. One is static and views the paper from above, while the other is dynamic and follows the ant around the page. We used the method from the project 2 code to split the views, with some alterations.

Interactivity:
We used Jerome Etienne's Keyboardstate to gather user input from the keyboard. Most of the keys on the qwerty keyboard are utilized in this game. We used the standard Javascript event methods to gather info from the trackpad/mouse.

Lighting and shading:
We used some of Three.js's material models for lighting. In particular, the text is Lambertian and the paper is Phong. 
We also used some shader files in GLSL. The ant is lit with a Phong model with a texture map, and the keys are lit with a variation on an anisotropic highlight model I found on the internet (although it looks very strange).

Picking:
The movement of the ant is used by picking the mouse coordinates and moving the camera/ant along the ray defined by it. Also, the laser is a line that stretches along a picking ray, and we detect intersected objects using the methods in Three's Raycaster object.

Texturing:
We have several different textures, including the texture of the paper and the ant. 

Control panel:
We implemented this using 3D text actually in the scene. This includes the frame rate over 1 second, and the scores for both players.

Gameplay:
This is a game with defined rules! See the howto section.

Advanced rendering effects:
We tried a bump map on the paper to make it look crumpled, but the effect is a bit too light to look impressive.

Shaders:
To try to make the keys look more metallic, we used highlights based on an anisotropic model. The equation for the specular highlights is quite complex, and the highlights came out much too light, but it was interesting to play around with.

Particle systems/procedural:
We used Three's Point model to model the smoke from when the keys are hit.
The smoke from the keys rises at a random rate that decreases by a fixed amount every update. When the particle is no longer rising, it is removed from the system. There is also a random x/z velocity component to give the smoke a more random quality. Each particle of smoke is represented by a translucent circle.

Collision detection:
We used collision detection to detect when the ant is smashed, when it goes off the page, and when it runs into the already disabled keys. We used the bounding box of the ant and the position of the keys to detect this. Since all the keys are the same width/height, we didn't use a bounding box for this because we didn't want to include the key arms in the collision. 
For the collision of the ant with a disabled key, we defined an x and z component boolean that was passed so that we could tell what axis the ant was allowed to move along. 
The collision detection seems to struggle a little bit, probably because of the frame rate. In order to make sure that if the ant did somehow make it into the disabled key, we decided that if we found that it was already there we would try moving it backwards along the picking ray a few steps. This works well when the ant hits a key almost head on, but produces weird effects when the ant hits a key from the side.

Animation:
For the animation frames, we used a similar method to project 1 where the keys and legs are moved by a specific angle determined by the clock. 
The legs are animated using a sine function so that the motion is continuous as long as the ant is moving.


HOWTO
=======

The keyboard:
Your job is to smash the ant with the keys. You can use the most of the keys on a qwerty keyboard. The top row stretches from 1 to 0, the next row from q to p, the next from a to ;, and the lowest from z to /. The location of the keys on your computer keyboard roughly maps to the location on the rendered page. You cannot have more than one key swinging at a time, and the keys have some delay when they hit the page.
Each ant smash is worth one point. You need to smash the ant 10 times in order to win the game.

The ant:
Your job is to disable the typewriter's keys with your laser while avoiding getting smashed by them. You can walk around the page by moving the mouse side to side. The spacebar will stop and start you from moving. When you see a key smash down in front of you, click on it to shoot a laser at it. If you hit, you will disable the key. You get two points for disabling a key. You need 10 points to win.

SOURCES
=======
Jerome Etienne's KeyboardState:
https://github.com/jeromeetienne/threex.keyboardstate/blob/master/threex.keyboardstate.js

Anisotropic lighting model:
https://seblagarde.wordpress.com/2011/08/17/hello-world/
We used the equations in this page to model the anisotropic lighting for the keys. Still looks weird, though.

Three particle systems:
https://aerotwist.com/tutorials/creating-particles-with-three-js/
This was an outdated tutorial, but helped in figuring out how the system should be set up.

The Three.js documentation

Projects 1-3 of this course