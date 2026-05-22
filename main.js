import { Environment } from './environment.js';
import { Earth } from './earth.js';
import { Starfield } from './starfield.js';
import { SatelliteTracker } from './satellitetracker.js';
import { addSatellite, getSatellites} from './satellitemanager.js';
import { UIManager } from './uimanager.js';
import { Raycaster, Scene, Vector2 } from "three";

// setup threejs env.
const env = new Environment();

// creation of earth and starfield
const earth = new Earth();
env.scene.add(earth.group);

const starfield = new Starfield();
env.scene.add(starfield.mesh);

// Two-Line Element Set (TLE) of the STARLINK-1008. First line contains satellite identifiers, the following line two contain actual parameters of its orbit.
const tleLine1 = '1 44714U 19074B   26123.17227885  .00020924  00000+0  42423-3 0  9999';
const tleLine2 = '2 44714  53.1551 283.4608 0000949  19.5923 340.5121 15.46371711357247';
const satTracker = new SatelliteTracker(tleLine1, tleLine2, "STARLINK-1008", 0xff0000, 0x0000ff); // color code is sat mesh colour and orbit line colour. Blue and red

// Two-Line Element Set(TLE) of the ISS (Zarya Norad Num: 25544).
const issTleLine1 = '1 25544U 98067A   26137.03684517  .00005133  00000+0  10043-3 0  9995';
const issTleLine2 = '2 25544  51.6321  94.3035 0007556  67.0843 293.0943 15.49238964566924';
const issTracker = new SatelliteTracker(issTleLine1, issTleLine2, "ISS", 0xFFDF00, 0x00FF00); // Yellow for both

// Two-Line Element Set (TLE) of the Hubble Space Telescope (HST).
const hstTLELine1 = '1 20580U 90037B   26141.54068252  .00004838  00000+0  15211-3 0  9995';
const hstTLELine2 = '2 20580  28.4744 262.6481 0001537 193.8369 166.2185 15.30441008784486';
const hstTracker = new SatelliteTracker(hstTLELine1, hstTLELine2, "Hubble Space Telescope", 0xBC13FE, 0xFFA500); // Purple and orange.

// Colours: ISS - Yellow, Starlink - Red, Hubble Space Telescope - orange.

// Adding Satellites to manager
addSatellite(satTracker);
addSatellite(issTracker);
addSatellite(hstTracker);

// Add mesh and orbit lines for the satellites to the scene.
env.scene.add(satTracker.mesh);
env.scene.add(satTracker.orbitLine);
env.scene.add(issTracker.mesh);
env.scene.add(issTracker.orbitLine);
env.scene.add(hstTracker.mesh);
env.scene.add(hstTracker.orbitLine);


// Setup of simulation time variables
let simulationTime = Date.now();
let timeScale = 90; // Can change to 1 for real-time propagation. Set to 90 for better visualisation.
let lastFrameTime = performance.now();
let orbitRefreshTimer = 0;

// for UI.
const ui = new UIManager((newOrbitMins) => {
    // When the user moves the slider, redraw the line
    satTracker.updateOrbitLine(simulationTime, newOrbitMins);
});
ui.setStaticInfo(satTracker.name, satTracker.id);
let selectedSatellite = satTracker; // selected sat for raycast.

// Initial orbit line draw
for(const sat of getSatellites())
    {
        sat.updateOrbitLine(simulationTime, ui.getOrbitMins());
    }

// Raycasting
const raycastPointer = new Raycaster();
document.addEventListener('mousedown', onMouseDown);
    function onMouseDown(event)
    {
        console.log("clicked", event);
        const coords = new Vector2(
        (event.clientX / env.renderer.domElement.clientWidth) * 2 - 1,
            -((event.clientY / env.renderer.domElement.clientHeight) * 2 - 1),);
        raycastPointer.setFromCamera(coords, env.camera);
        const satMeshes = getSatellites().map(sat => sat.mesh);
        const intersections = raycastPointer.intersectObjects(satMeshes ,true);
        if(intersections.length > 0)
            {
                const clickedSatellite = intersections[0].object.userData.satellite;
                // Hides previous orbit line
                if (selectedSatellite)
                {
                    selectedSatellite.orbitLine.visible = false;
                }
                // change the selected sat that's been clicked on
                selectedSatellite = clickedSatellite;
                // show new orbit line for selected sat
                selectedSatellite.orbitLine.visible = true;
                // Update orbit immediately after selection
                selectedSatellite.updateOrbitLine(simulationTime, ui.getOrbitMins());
                // Update frontend UI.
                ui.setStaticInfo(selectedSatellite.name, selectedSatellite.id);
                console.log(intersections);
                console.log(intersections[0].object.userData);
            }
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
        if(selectedSatellite)
        {
            selectedSatellite.updateOrbitLine(simulationTime, ui.getOrbitMins());
        }
        orbitRefreshTimer = 0;
    }

    // Update Satellite and fetch its latest stats
    const nowSim = new Date(simulationTime);
    for(const sat of getSatellites())
    {
        const satData = sat.updatePosition(nowSim);
         // Pass those stats to the frontend
        if (sat === selectedSatellite && satData) {
            ui.updateDynamicInfo(satData.lat, satData.lon, satData.height);
        }
    }

    // Render Scene
    env.render();
}

env.renderer.setAnimationLoop(animate);