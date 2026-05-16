import * as THREE from 'three';
import { getFresnelMat } from './getFresnalMat.js';

export class Earth {
    constructor() {
        this.group = new THREE.Group();
        this.group.rotation.z = -23.4 * Math.PI / 180;

        const loader = new THREE.TextureLoader();
        const geometry = new THREE.IcosahedronGeometry(1, 12);

        // Base Earth
        const texture = loader.load('images/earthmap1k.jpg');
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshStandardMaterial({ map: texture });
        this.sphereMesh = new THREE.Mesh(geometry, material);
        this.group.add(this.sphereMesh);

        // Lights for earth
        const earthLightMat = new THREE.MeshBasicMaterial({
            map: loader.load('images/earthlights1k.jpg'),
            blending: THREE.AdditiveBlending,
        });
        this.earthLightsMesh = new THREE.Mesh(geometry, earthLightMat);
        this.group.add(this.earthLightsMesh);

        // Clouds for earth
        const earthCloudMat = new THREE.MeshStandardMaterial({
            map: loader.load('./images/earthcloudmap.jpg'),
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
        });
        this.earthCloudMesh = new THREE.Mesh(geometry, earthCloudMat);
        this.earthCloudMesh.scale.setScalar(1.003);
        this.group.add(this.earthCloudMesh);

        // Fresnal Shader for glow around earth
        const fresnalMat = getFresnelMat();
        this.fresnalMesh = new THREE.Mesh(geometry, fresnalMat);
        this.fresnalMesh.scale.setScalar(1.02);
        this.group.add(this.fresnalMesh);
    }

    update(time) {
        this.sphereMesh.rotation.y = time / 8000;
        this.earthLightsMesh.rotation.y = time / 8000;
        this.earthCloudMesh.rotation.y = time / 4000;
        this.fresnalMesh.rotation.y = time / 4000;
    }
}