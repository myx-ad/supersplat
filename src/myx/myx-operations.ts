import { Mat4, Quat, Vec3 } from "playcanvas";
import { Scene, SceneConfig } from "../scene";
import { Splat } from "src/splat"
import { myxConfig } from "./myx-config";

const applyZUp = (splat: Splat) => {
    const mat = new Mat4();
    const quat = new Quat();

    const p = splat.entity.getPosition();
    const rq = new Quat().setFromEulerAngles(-90, 0, 0);
    
    mat.setTRS(new Vec3(p.x, p.y, p.z), rq, new Vec3(1, 1, 1));
    quat.setFromMat4(mat);

    const t = mat.getTranslation();
    const r = quat;
    const s = mat.getScale();

    splat.move(t, r, s);
}

const addSplatToScene = ( scene: Scene, splat: Splat ) => {
    scene.add(splat);

    if (myxConfig.zUp) {
        applyZUp(splat);
    }
}

 export { addSplatToScene }