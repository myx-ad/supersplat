import { Events } from "../events";
import { Scene } from "../scene";
import { setupMessageHandlers } from "./myx-communication";
import { EditorUI } from "src/ui/editor";
import { configureUi } from "./myx-ui-configuration";
import { configureStandaloneMode } from "./myx-standalone";

const myx_main = async (scene: Scene, events: Events, editorUI: EditorUI) => {
    //@ts-ignore
    window.editor = editorUI;

    events.fire('camera.toggleOverlay');
    events.fire('pivot.toggleOrigin');

    configureStandaloneMode(scene);
    setupMessageHandlers(scene);
    configureUi(scene, editorUI);
}

export { myx_main }