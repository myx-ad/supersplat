import { Vec3 } from "playcanvas";
import { Scene } from "../scene"
import { Splat } from "src/splat";
import { addSplatToScene, applyRotationMatrix, calculateRotationMatrixToY } from "./myx-operations";
import { superSplatVisibleElements } from "./myx-ui-configuration";

const directionToAzimElev = (dir: {x: number, y:number, z:number}) => {
    // Normalize input (optional but good practice)
    const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
    const x = dir.x / length;
    const y = dir.y / length;
    const z = dir.z / length;

    // Azimuth: angle in the XZ plane from the +Z axis
    let azim = Math.atan2(x, z) * (180 / Math.PI); // atan2 returns angle from Z to X
    if (azim < 0) azim += 360; // wrap into [0, 360)

    // Elevation: angle from horizontal plane up/down
    const elev = Math.asin(y) * (180 / Math.PI); // y is the "up" direction

    return { azim, elev };
}


const cameraUpdate = (scene: Scene, data: any) => {
    // const ecefPos = new Vec3(data.pos);
    const ecefCenter = data.ecefCenter;

    const yUpRotMatrix = calculateRotationMatrixToY([ecefCenter.x, ecefCenter.y, ecefCenter.z]);
    const dir = new Vec3(applyRotationMatrix(yUpRotMatrix, data.dir));
    let pos = new Vec3(applyRotationMatrix(yUpRotMatrix, data.pos));

    const cameraOffset = new Vec3(data.offset);
    pos = pos.add(cameraOffset);

    const target = pos.clone().add(dir);
    scene.camera.setPose(pos, target, 0);
    scene.camera.fov = data.fov * (180 / Math.PI);

    // const { azim, elev } = directionToAzimElev(dir);
    // scene.camera.setAzimElev(azim, elev, 0);
}

const toggleUi = (data:any) => {
    const show = data.show;

    function toggleDisplay(element: any, show: any) {
        if (show) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }

    for (const id of Object.keys(superSplatVisibleElements)) {
        const element = document.getElementById(id);
        //@ts-ignore
        if (!element || !superSplatVisibleElements[id]) {
            continue;
        }

        toggleDisplay(element, show);
    }
}

const addSplat = (scene: Scene, data: any) => {
    setTimeout(async () => {
        const url = URL.createObjectURL(new Blob([data.tile]));
        const splat = await scene.assetLoader.loadModel({
            url: url,
            filename: data.path
        })
        addSplatToScene(scene, splat);
    }, 0);
}


const setupMessageHandlers = (scene: Scene) => {
    window.addEventListener("message", (event) => {
        try {
            const command = event.data;
            if (command.name === "cameraUpdate") {
                cameraUpdate(scene, command.data);
            }

            if (command.name === "addSplat") {
                addSplat(scene, command.data);
            }

            if (command.name === "toggleUi") {
                toggleUi(command.data);
            }
        } catch (e) {
            console.log("Received non-JSON message", e);
        }
    });
}

export {
    setupMessageHandlers
}
