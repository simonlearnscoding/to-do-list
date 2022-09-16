import { currentProject} from './components';
import {popUpOpen,popups} from "./popups";

export default function keyButtons(event) {
    const key = event.key
    if(key == "Escape") {
        popups.closePopup();
    }
    // TODO: bugfix buttons shouldnt work if in popup
    if(popUpOpen){ return }
    if(key == "q") {
        popups.createTaskPopup();
    }

    if(key == "p") {
        popups.createProjectPopup();
    }
}