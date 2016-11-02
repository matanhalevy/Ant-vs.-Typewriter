varying vec3 interpolatedNormal;
varying vec3 interpolatedPosition;
varying vec3 eyeVector;

uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform vec3 ambientColor;

uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;

 uniform sampler2D texture;
varying vec2 texCoord; 

void main() {
 
	vec3 textColor = vec3(texture2D(texture,texCoord)); 


	vec3 l = normalize(lightPosition - interpolatedPosition);
    float lDotN = max( dot( l, interpolatedNormal), 0.0 );

	vec3 diffuse = vec3(lightColor * kDiffuse * lDotN);
	 
	vec3 ambient = kAmbient * ambientColor; 
 
	vec3 v = normalize(eyeVector - interpolatedPosition);

	vec3 r = reflect(-l, interpolatedNormal);
	
 	
	
	float rDotV = max(dot(v,r), 0.0);

	vec3 specular = vec3(lightColor * kSpecular * pow(rDotV, shininess));

    vec3 color = vec3(ambient  + diffuse + specular + textColor);

	gl_FragColor = vec4(color, 1.0);
}
