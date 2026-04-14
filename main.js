import * as THREE from 'three';
import * as satellite from 'satellite.js';
import { json2satrec } from 'satellite.js';
import { twoline2satrec } from 'satellite.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { getFresnelMat } from './getFresnalMat.js';
import { propagate, SatRecError } from 'satellite.js';
import { gstime,degreesToRadians,radiansToDegrees,degreesLong,degreesLat,eciToGeodetic } from 'satellite.js';
// npx vite to run.

// Load scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// Moves camera position so we can view the planet.
camera.position.z = 5;
// WebGL rendering
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Load Orbit Controls (Camera Movement)
const controls = new OrbitControls( camera, renderer.domElement );
// controls.update() must be called after any manual changes to the camera's transform
controls.update();

// Using three.js to render the earth and add it to the scene.
const earthGroup = new THREE.Group();
// Earth's axial tilt. Converting degrees to radian for 3js means Pi is divided by 180 as full circle is 2Pi. 180 is pi.
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
// Earth Material, Mesh and Texture
const loader = new THREE.TextureLoader();
const texture = loader.load( 'images/earthmap1k.jpg' );
texture.colorSpace = THREE.SRGBColorSpace;
const geometry = new THREE.IcosahedronGeometry( 1, 12);
const material = new THREE.MeshStandardMaterial( { map: texture,} );
const sphereMesh = new THREE.Mesh( geometry, material );
earthGroup.add(sphereMesh);

// Light mesh and mat for dark side of earth
const earthLightMat = new THREE.MeshBasicMaterial({
  map: loader.load('images/earthlights1k.jpg'), blending: THREE.AdditiveBlending,
})
const earthLightsMesh = new THREE.Mesh(geometry, earthLightMat);
earthGroup.add(earthLightsMesh);

// Mesh and Mat for Clouds on earth
const earthCloudMat = new THREE.MeshStandardMaterial({
  map: loader.load('./images/earthcloudmap.jpg'), transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
})
const earthCloudMesh = new THREE.Mesh(geometry, earthCloudMat);
earthCloudMesh.scale.setScalar(1.003);
earthGroup.add(earthCloudMesh);

// Fresnal Shader for a blue glow around Earth. See getFresnalMat.js.
const fresnalMat = getFresnelMat();
const fresnalMesh = new THREE.Mesh(geometry, fresnalMat);
fresnalMesh.scale.setScalar(1.02);
earthGroup.add(fresnalMesh);


// Creating a Starfield
// Number of stars
const starCount = 5000;

// Geometry, buffer geometry is best for for lots of objects like this.
const starGeometry = new THREE.BufferGeometry();
const positions = [];

for (let i = 0; i < starCount; i++) {
    const radius = 500 + Math.random() * 500; // hollow shell
    // Use these values to pick random directions for the stars, theta is rotation around, phy is up/down.
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos((Math.random() * 2) - 1);
    // Convert the values for radius and direction to co-ordinates
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    // Add the co-ordinates to the array
    positions.push(x, y, z);
}
// every 3 numbers = a star position
starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
);

// Stars Material
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    sizeAttenuation: true
});

// Points object for starfield, render stars as points
const stars = new THREE.Points(starGeometry, starMaterial);
// Slight rotation to stars
stars.rotation.y += 0.0001;
scene.add(stars);

// 3js Rendering of the satellite
const satGeometry = new THREE.SphereGeometry(0.05, 16, 8);
const satMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const satelliteMesh = new THREE.Mesh(satGeometry, satMaterial);
scene.add(satelliteMesh);


//Two-Line Element Set (TLE) of the ISS (Zarya). First line contains satellite identifiers, the following two contain actual parameters of its orbit.
const tleLine1 = '1 25544U 98067A   26090.52027159  .00011565  00000+0  22010-3 0  9993'
const tleLine2 = '2 25544  51.6339 324.4353 0006210 255.4271 104.6029 15.48680190559719'
// This takes the TLE data and converts it into an object we can use.
const satrec = twoline2satrec(tleLine1, tleLine2);
//Gets current position of satellite using (SGP4) model, It predicts a satellite’s future position and velocity from its Two-Line Element set (TLE) data. 
const positionAndVelocity = satellite.propagate(satrec, new Date());
//Convert ECI(Earth-Centered Inertial) data to latitude and Longitude and height. gmst computes earths rotation at current time.
const gmst = satellite.gstime(new Date());
const eciGeo = satellite.eciToGeodetic(
  positionAndVelocity.position, gmst
);
// Convert to radians
const lat = eciGeo.latitude;
const lon = eciGeo.longitude;
//const height = eciGeo.height;

// Convert to earth sphere object. 
const earthRadius = 3;

const x = earthRadius * Math.cos(lat) * Math.cos(lon);
const y = earthRadius * Math.sin(lat);
const z = earthRadius * Math.cos(lat) * Math.sin(lon);


//Orbit Lines in progress
const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

const points = [];
points.push( new THREE.Vector3( - 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line(lineGeometry, material);
scene.add(line);


// Lighting for earth
const sunLighting = new THREE.DirectionalLight(0xffffff, 2);
sunLighting.position.set(-2,0.5,2);
scene.add(sunLighting);


// Update frames, three js animations
function animate( time ) {
  sphereMesh.rotation.y = time / 8000;
  earthLightsMesh.rotation.y = time / 8000;
  earthCloudMesh.rotation.y = time/ 4000;
  fresnalMesh.rotation.y = time / 4000;

  const now = new Date();
  const pos = satellite.propagate(satrec, now);

  if (pos.position) {
    const gmst = satellite.gstime(now);
    const geo = satellite.eciToGeodetic(pos.position, gmst);

    const lat = geo.latitude;
    const lon = geo.longitude;
    //const satHeight = geo.height;

    satelliteMesh.position.set(
      earthRadius * Math.cos(lat) * Math.cos(lon),
      earthRadius * Math.sin(lat),
      earthRadius * Math.cos(lat) * Math.sin(lon)
    );
  }
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);