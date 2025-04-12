import { Vec3 } from "playcanvas";
import { Scene } from "../scene";
import { myxConfig } from "./myx-config";
import { addSplatToScene } from "./myx-operations";

function extractLevels(data: any) {
    return {
        level1: data,
        level2: data.map((x: any) => x.children).flat(),
        level3: data.map((x: any) => x.children.map((y:any) => y.children)).flat().flat() 
    };
}

const addTileToScene = async (scene: Scene, path: string) => {
    setTimeout(async () => {
        const animationFrame = false;
        const url = `/tiles/${path}`;
        const model = await scene.assetLoader.loadModel({ url, filename:path, animationFrame });
        addSplatToScene(scene, model);
    }, 0);
}

async function bulkLoad(scene: Scene, tiles: any[], loaded: string[]) {
    const paths = tiles.map((x:any) => x.path);
    for (let path of paths) {
        if (loaded.includes(path)) {
            continue;
        }

        addTileToScene(scene, path);
        loaded.push(path);
    }
}

const positionChanged = (oldPos:any, newPos:any) => {
    if (!oldPos) {
        return true;
    }

    return oldPos.x !== newPos.x || oldPos.y !== newPos.y || oldPos.z !== newPos.z;
}

const dist = (arr1: number[], arr2: number[]) => {
    return Math.sqrt((arr1[0] - arr2[0]) ** 2 + (arr1[1] - arr2[1]) ** 2 + (arr1[2] - arr2[2]) ** 2);
};


const filterCloserTiles = (position: any, data:any[], threshold:number) => {
    return data.filter((tile: any) => {
        const distance = dist([position.x, position.y, position.z], tile.center);
        return distance < threshold
    })
}

const applyYUpToCamera = (pos: Vec3) => {
    if (!myxConfig.zUp) {
        return;
    }

    const x = pos.x;
    const y = pos.y;
    const z = pos.z;

    const theta = Math.PI / 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const newX = x;
    const newY = y * cos - z * sin;
    const newZ = y * sin + z * cos;
    pos.x = newX;
    pos.y = newY;
    pos.z = newZ;
}

const configureStandaloneMode = (scene: Scene) => {
    const params = new URLSearchParams(window.location.search);
    const standalone = params.get("standalone");

    if (!standalone || standalone.toLowerCase() !== 'true') {
        return;
    }

    let [l1, l2, l3]: any = [null, null, null];

    let updateOld = scene.camera.onUpdate;
    let oldPos: any = undefined;
    let bulkLoaded = false;

    let loadedTiles: string[] = [];
    //@ts-ignore
    window.loadedTiles = loadedTiles;

    fetch('/tiles/scene_tree.json')
        .then((response) => response.json())
        .then(async (data) => {
            const { level1, level2, level3 } = extractLevels(data);
            //@ts-ignore
            l1 = level1;
            l2 = level2;
            l3 = level3;
        });

    scene.camera.onUpdate = async function (args) {
        if (typeof updateOld === "function") {
            updateOld.call(this, args);
        }

        let newPos = this.entity.getPosition();
        if (positionChanged(oldPos, newPos)) {
            oldPos = { x: newPos.x, y: newPos.y, z: newPos.z }

            if (myxConfig.scene.cameraLoad.enabled) {
                const l1_thresh = myxConfig.scene.cameraLoad.l1Distance;
                const l2_thresh = myxConfig.scene.cameraLoad.l2Distance;
                const l3_thresh = myxConfig.scene.cameraLoad.l3Distance;

                let cameraPos = scene.camera.entity.getPosition();
                applyYUpToCamera(cameraPos);
                const l1_tiles = filterCloserTiles(cameraPos, l1, l1_thresh);
                const l2_tiles = filterCloserTiles(cameraPos, l2, l2_thresh);
                const l3_tiles = filterCloserTiles(cameraPos, l3, l3_thresh);

                bulkLoad(scene, l1_tiles, loadedTiles);
                bulkLoad(scene, l2_tiles, loadedTiles);
                bulkLoad(scene, l3_tiles, loadedTiles);
            }
        }

        if (myxConfig.scene.bulkLoad.enabled && !bulkLoaded) {
            bulkLoaded = true;
            let srcData = null;

            switch (myxConfig.scene.bulkLoad.level) {
                case 1:
                    srcData = l1;
                    break;
                case 2:
                    srcData = l2;
                    break;
                case 3:
                    srcData = l3;
                    break;
            }

            bulkLoad(scene, srcData, loadedTiles);

            // For high res - use this, as sometimes the browser can't handle the amount of requests (~1k) and throws errors
            // function sleep(ms:number) {
            //     return new Promise(resolve => setTimeout(resolve, ms));
            //   }

            // for (let i = srcData.length - 1; i >= 1500; i -= 100) {
            //     const dataToLoad = srcData.slice(i - 100, i);
            //     await sleep(2000);
            //     bulkLoad(scene, dataToLoad, loadedTiles);
            // }
        }
    };
}

export { configureStandaloneMode }