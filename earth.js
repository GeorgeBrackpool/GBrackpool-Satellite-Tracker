import * as THREE from 'three';
import { getFresnelMat } from './getFresnelMat.js';

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
            map: loader.load('images/earthcloudmap.jpg'),
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
        });
        this.earthCloudMesh = new THREE.Mesh(geometry, earthCloudMat);
        this.earthCloudMesh.scale.setScalar(1.003);
        this.group.add(this.earthCloudMesh);

        // Fresnel Shader for glow around earth
        const fresnelMat = getFresnelMat();
        this.fresnelMesh = new THREE.Mesh(geometry, fresnelMat);
        this.fresnelMesh.scale.setScalar(1.02);
        this.group.add(this.fresnelMesh);
    }

    update(time) {
        this.sphereMesh.rotation.y = time / 8000;
        this.earthLightsMesh.rotation.y = time / 8000;
        this.earthCloudMesh.rotation.y = time / 4000;
        this.fresnelMesh.rotation.y = time / 4000;
    }
}