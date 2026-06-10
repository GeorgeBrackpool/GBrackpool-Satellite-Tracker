import { Environment } from "./environment";
import { SatelliteTracker } from "./satellitetracker";
import { getSatellites } from "./satellitemanager";

export class UIManager {
    constructor(onOrbitChangeCallback, onSpeedChangeCallback) {
        this.input = document.getElementById("orbitMins");
        this.valueUI = document.getElementById("orbitValue");
        this.simSpeedSlider = document.getElementById("sim-speed");
        this.simUI = document.getElementById("speedValue");
        this.satPositionUI = document.getElementById("sat-position");
        this.satNameUI = document.getElementById("sat-name");
        this.satNumUI = document.getElementById("sat-num");

        this.orbitMins = parseInt(this.input.value);
        this.valueUI.textContent = this.orbitMins;

        // Slider Event Listener
        this.input.addEventListener("input", (event) => {
            this.orbitMins = parseInt(event.target.value);
            this.valueUI.textContent = this.orbitMins;
            // Ping main.js to update the 3D line when slider changes
            if(onOrbitChangeCallback) onOrbitChangeCallback(this.orbitMins);
        });

        this.simSpeedSlider.addEventListener("input", (e) => {

        const speed = parseInt(e.target.value);

        this.simUI.textContent = speed;

        if (onSpeedChangeCallback) {
            onSpeedChangeCallback(speed);
        }
        });
    }
    
    getOrbitMins() {
        return this.orbitMins;
    }

    setStaticInfo(name, id) {
        this.satNameUI.textContent = name;
        this.satNumUI.innerHTML = `Satellite ID: ${id}`;
    }

    updateDynamicInfo(lat, lon, height) {
        this.satPositionUI.innerHTML = `
            Latitude: ${lat.toFixed(2)}<br>
            Longitude: ${lon.toFixed(2)}<br>
            Height: ${height.toFixed(2)} km`;
    }
}