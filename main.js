import * as THREE from 'three';

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