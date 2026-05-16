import * as THREE from 'three';

export class Starfield {
    constructor(starCount = 5000) {
        const starGeometry = new THREE.BufferGeometry();
        const positions = [];
        // create hollow sphere and populate with stars
        for (let i = 0; i < starCount; i++) {
            const radius = 500 + Math.random() * 500;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            sizeAttenuation: true
        });

        this.mesh = new THREE.Points(starGeometry, starMaterial);
    }

    update() {
        this.mesh.rotation.y += 0.0001;
    }
}