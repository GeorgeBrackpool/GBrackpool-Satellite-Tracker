import { Environment } from "./Environment";
import { SatelliteTracker } from "./SatelliteTracker";
import { getSatellites } from "./satellitemanager";

export class UIManager {
    constructor(onOrbitChangeCallback) {
        this.input = document.querySelector("#orbitMins");
        this.valueUI = document.querySelector("#orbitValue");
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