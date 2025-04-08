import { EditorUI } from "src/ui/editor";
import { Scene, SceneConfig } from "../scene";
import { MyxPanel } from "./myx-panel";
import { myxConfig } from "./myx-config";

const superSplatVisibleElements = {
    'data-panel': myxConfig.showDataPanel(),
    'timeline-panel': myxConfig.showTimelinePanel(),
    'view-cube-container': myxConfig.showViewCube(),
    'menu': myxConfig.showMenu(),
    'mode-toggle': myxConfig.showModeToggle(),
    'right-toolbar': myxConfig.showRightToolbar(),
    'bottom-toolbar': myxConfig.showBottomToolbar(),
    'scene-panel': myxConfig.showScenePanel(),
    'myx-panel': myxConfig.showMyxPanel(),
    'app-label': !myxConfig.enabled
};

const hide = (id: string) => {
    document.getElementById(id).style.display = 'none';
}

const configureUi = (scene: Scene, editor: EditorUI) => {
    const myxPanel = new MyxPanel();
    editor.canvasContainer.append(myxPanel);

    for (const [domId, show] of Object.entries(superSplatVisibleElements)) {
        if (!show) {
            hide(domId);
        }
    }

    // Transparent background for iframe overlay
    document.body.style.backgroundColor = `rgba(255, 255, 255, 0)`;

    if (!myxConfig.showGrid()) {
        scene.grid.visible = false;
    }
}

export { configureUi, superSplatVisibleElements }