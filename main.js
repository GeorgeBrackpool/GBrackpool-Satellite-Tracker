import * as THREE from 'three';
import * as satellite from 'satellite.js';
import { json2satrec } from 'satellite.js';
import { twoline2satrec } from 'satellite.js';
import { propagate, SatRecError } from 'satellite.js';
import { gstime,degreesToRadians,radiansToDegrees,degreesLong,degreesLat,eciToGeodetic } from 'satellite.js';
// npx vite to run.

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const loader = new THREE.TextureLoader();
const texture = loader.load( 'images/earth_texture.jpg' );
texture.colorSpace = THREE.SRGBColorSpace;
const geometry = new THREE.SphereGeometry( 1, 32, 16);
const material = new THREE.MeshBasicMaterial( { map: texture,} );

const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );


camera.position.z = 5;

function animate( time ) {
  renderer.render( scene, camera );
  sphere.rotation.x = time / 10000;
  sphere.rotation.y = time / 5000;
}
renderer.setAnimationLoop( animate );

// ISS OMM
/*const omm = [{
  "OBJECT_NAME":"ISS (ZARYA)","OBJECT_ID":"1998-067A","EPOCH":"2026-03-28T03:57:10.437696","MEAN_MOTION":15.48601072,"ECCENTRICITY":0.0006226,"INCLINATION":51.6345,"RA_OF_ASC_NODE":341.0267,"ARG_OF_PERICENTER":240.9881,"MEAN_ANOMALY":119.0483,"EPHEMERIS_TYPE":0,"CLASSIFICATION_TYPE":"U","NORAD_CAT_ID":25544,"ELEMENT_SET_NO":999,"REV_AT_EPOCH":55919,"BSTAR":0.00024003,"MEAN_MOTION_DOT":0.00012619,"MEAN_MOTION_DDOT":0
}];

const satrec = json2satrec(omm);*/

//TLE of the ISS.
const tleLine1 = '1 25544U 98067A   26087.16470414  .00012619  00000+0  24003-3 0  9990'
const tleLine2 = '2 25544  51.6345 341.0267 0006226 240.9881 119.0483 15.48601072559196'

const satrec = twoline2satrec(tleLine1, tleLine2);

const positionAndVelocity = satellite.propagate(satrec, new Date());
//Convert to latitude and Longitude

// Convert to radians

// Convert to earth sphere object. 

// Update frames