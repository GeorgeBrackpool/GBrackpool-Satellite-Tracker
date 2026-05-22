import * as THREE from 'three';
import * as satellite from 'satellite.js';

export class SatelliteTracker {
    constructor(tleLine1, tleLine2, name, color = 0xff0000, linecolor = 0x0000ff, earthRadius = 3) {
        this.name = name;
        this.earthRadius = earthRadius;
        this.satrec = satellite.twoline2satrec(tleLine1, tleLine2);
        this.id = this.satrec.satnum;
        this.color = color; // 0xff0000 red is default.
        this.linecolor = linecolor; // 0x0000ff Blue is default.

        // Satellite Mesh
        const satGeometry = new THREE.SphereGeometry(0.05, 16, 8);
        const satMaterial = new THREE.MeshBasicMaterial({ color: color });
        this.mesh = new THREE.Mesh(satGeometry, satMaterial);
        
        // User data for clicking on sat mesh.
        this.mesh.userData = { satellite: this };

        // Orbit Line
        const orbitGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ color: linecolor });
        this.orbitLine = new THREE.Line(orbitGeometry, lineMaterial); 
    }


    updateOrbitLine(simulationTime, orbitMins) {
        const points = [];
        const stepSeconds = 30; // each prediction sample is spaced 30 seconds apart
        const totalSteps = (orbitMins * 60) / stepSeconds; // total number of prediction samples/steps needed to cover orbit prediction duration set by user.
        for (let i = 0; i < totalSteps; i++) {
            const time = new Date(simulationTime + i * stepSeconds * 1000);
            const pos = satellite.propagate(this.satrec, time);
            
            if (!pos.position) continue;

            const gmst = satellite.gstime(time);
            const geo = satellite.eciToGeodetic(pos.position, gmst);
            const scale = this.earthRadius / 6371;
            const radius = this.earthRadius + (geo.height * scale);

            const x = radius * Math.cos(geo.latitude) * Math.cos(geo.longitude);
            const y = radius * Math.sin(geo.latitude);
            const z = radius * Math.cos(geo.latitude) * Math.sin(geo.longitude);

            points.push(new THREE.Vector3(x, y, z));
        }
        
        this.orbitLine.geometry.dispose(); // Prevent memory leaks
        this.orbitLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.orbitLine.geometry.computeBoundingSphere();
    }

    updatePosition(nowSim) {
        const pos = satellite.propagate(this.satrec, nowSim);
        if (pos.position) {
            const gmst = satellite.gstime(nowSim);
            const geo = satellite.eciToGeodetic(pos.position, gmst);
            
            const lat = geo.latitude;
            const lon = geo.longitude;
            const height = geo.height;
            const scale = this.earthRadius / 6371;
            const radius = this.earthRadius + (height * scale);

            this.mesh.position.set(
                radius * Math.cos(lat) * Math.cos(lon),
                radius * Math.sin(lat),
                radius * Math.cos(lat) * Math.sin(lon)
            );

            // Return calculated data so the UI can display it
            return { 
                lat: THREE.MathUtils.radToDeg(lat), 
                lon: THREE.MathUtils.radToDeg(lon), 
                height 
            };
        }
        return null;
    }
}