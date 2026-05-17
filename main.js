import { Environment } from './Environment.js';
import { Earth } from './Earth.js';
import { Starfield } from './Starfield.js';
import { SatelliteTracker } from './SatelliteTracker.js';
import { addSatellite, getSatellites} from './satellitemanager.js';
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
const satTracker = new SatelliteTracker(tleLine1, tleLine2, "STARLINK-1008", 0xff0000, 0x0000ff);

// Two-Line Element Set(TLE) of the ISS (Zarya Norad Num: 25544).
const issTleLine1 = '1 25544U 98067A   26137.03684517  .00005133  00000+0  10043-3 0  9995';
const issTleLine2 = '2 25544  51.6321  94.3035 0007556  67.0843 293.0943 15.49238964566924';
const issTracker = new SatelliteTracker(issTleLine1, issTleLine2, "ISS", 0xFFDF00, 0x00FF00);

// Adding Satellites to manager
addSatellite(satTracker);
addSatellite(issTracker);

env.scene.add(satTracker.mesh);
env.scene.add(satTracker.orbitLine);
env.scene.add(issTracker.mesh);
env.scene.add(issTracker.orbitLine);
// Colours: ISS - Yellow, Starlinks - Red.

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
for(const sat of getSatellites())
    {
        sat.updateOrbitLine(simulationTime, ui.getOrbitMins());
    }

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
        for(const sat of getSatellites())
        {
            sat.updateOrbitLine(simulationTime, ui.getOrbitMins());
        }
        orbitRefreshTimer = 0;
    }

    // Update Satellite and fetch its latest stats
    const nowSim = new Date(simulationTime);
    for(const sat of getSatellites())
    {
        const satData = sat.updatePosition(nowSim);
         // Pass those stats to the frontend
        if (satData) {
            ui.updateDynamicInfo(satData.lat, satData.lon, satData.height);
        }
    }

    // Render Scene
    env.render();
}

env.renderer.setAnimationLoop(animate);