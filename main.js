import * as THREE from 'three';
import * as satellite from 'satellite.js';
import { json2satrec } from 'satellite.js';
import { twoline2satrec } from 'satellite.js';
import { propagate, SatRecError } from 'satellite.js';
import { gstime,degreesToRadians,radiansToDegrees,degreesLong,degreesLat,eciToGeodetic } from 'satellite.js';
// npx vite to run.

// Load scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// WebGL rendering
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Using three.js to render the earth and add it to the scene.
const loader = new THREE.TextureLoader();
const texture = loader.load( 'images/earth_texture.jpg' );
texture.colorSpace = THREE.SRGBColorSpace;
const geometry = new THREE.SphereGeometry( 1, 32, 16);
const material = new THREE.MeshBasicMaterial( { map: texture,} );
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

// Moves camera position so we can view the planet.
camera.position.z = 5;

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



// Update frames, three js animations
function animate( time ) {
  sphere.rotation.x = time / 10000;
  sphere.rotation.y = time / 5000;

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