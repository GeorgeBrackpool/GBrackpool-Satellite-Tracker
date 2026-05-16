import { Environment } from './Environment.js';
import { Earth } from './Earth.js';
import { Starfield } from './Starfield.js';
import { SatelliteTracker } from './SatelliteTracker.js';
import { UIManager } from './UIManager.js';

// setup threejs env.
const env = new Environment();

// creation of earth and starfield
const earth = new Earth();
env.scene.add(earth.group);

const starfield = new Starfield();
env.scene.add(starfield.mesh);

// Two-Line Element Set (TLE) of the STARLINK-1008. First line contains satellite identifiers, the following two contain actual parameters of its orbit.
const tleLine1 = '1 44714U 19074B   26123.17227885  .00020924  00000+0  42423-3 0  9999';
const tleLine2 = '2 44714  53.1551 283.4608 0000949  19.5923 340.5121 15.46371711357247';
const satTracker = new SatelliteTracker(tleLine1, tleLine2, "STARLINK-1008");
env.scene.add(satTracker.mesh);
env.scene.add(satTracker.orbitLine);

// Setup of simulation time variables
let simulationTime = Date.now();
let timeScale = 90;
let lastFrameTime = performance.now();
let orbitRefreshTimer = 0;

// for UI.
const ui = new UIManager((newOrbitMins) => {
    // When the user moves the slider, redraw the line
    satTracker.updateOrbitLine(simulationTime, newOrbitMins);
});
ui.setStaticInfo(satTracker.name, satTracker.id);

// Initial orbit line draw
satTracker.updateOrbitLine(simulationTime, ui.getOrbitMins());

function animate(time) {
    const now = performance.now();
    const deltaMs = now - lastFrameTime;
    lastFrameTime = now;
    simulationTime += deltaMs * timeScale;
    orbitRefreshTimer += deltaMs;

    // Update Visuals
    earth.update(time);
    starfield.update();

    // Refreshes orbit prediction every 2 seconds to save performance
    if (orbitRefreshTimer > 2000) {
        satTracker.updateOrbitLine(simulationTime, ui.getOrbitMins());
        orbitRefreshTimer = 0;
    }

    // Update Satellite and fetch its latest stats
    const nowSim = new Date(simulationTime);
    const satData = satTracker.updatePosition(nowSim);
    
    // Pass those stats to the frontend
    if (satData) {
        ui.updateDynamicInfo(satData.lat, satData.lon, satData.height);
    }

    // Render Scene
    env.render();
}

env.renderer.setAnimationLoop(animate);