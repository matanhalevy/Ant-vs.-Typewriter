uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 lightPosition;

varying vec3 interpolatedNormal;
varying vec3 posworld;
varying vec4 pos;

void main() {
    interpolatedNormal = normalMatrix * normal;
    pos = modelViewMatrix * vec4(position, 1.0);
    posworld = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}