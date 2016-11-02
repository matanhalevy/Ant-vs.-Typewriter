uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 lightPosition;

varying vec3 interpolatedNormal;
varying vec3 posworld;
varying vec4 pos;

void main() {
    vec3 N = normalize(interpolatedNormal);
    vec3 L = normalize(lightPosition-posworld);
    vec3 R = normalize(2.0*N*max(dot(N, L),1.0) - L);
    vec3 V = normalize(-1.0*vec3(pos));
    vec3 H = normalize(N+L);
    vec3 up = vec3(0.0,1.0,0.0);
    vec3 T = normalize(cross(up, interpolatedNormal)+cross(cross(up, interpolatedNormal),interpolatedNormal));
    vec3 B = normalize(cross(interpolatedNormal, T));
    float ro = 0.001;
    float alphax = 0.5;
    float alphay = 0.5;
    vec4 amblight = vec4(ambientColor*lightColor,1.0);
    vec4 diffuse = amblight*max(dot(N, L),0.0);
    vec3 specs = lightColor * ro/(4.0*3.1415*alphax*alphay*sqrt(max(dot(N, L),0.0)*max(dot(N, V),0.0)))*exp(-2.0*(pow(max(dot(T, H),0.0)/alphax,2.0)+pow(max(dot(B, H),0.0)/alphay,2.0))/(1.0+max(dot(N, H),0.0)));
    vec4 specular = vec4(specs,0.005);
    gl_FragColor = amblight + diffuse + specular;
}