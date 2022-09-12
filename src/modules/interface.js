//imports here
import Elements, {projectComponents} from './components';


import Icon from './../assets/iconPlus.png';
const body = document.body;
const content = document.createElement('div')


export default class UI {
    constructor() {

    }
    //DOM ELEMENTS
    static loadHomepage(){
        // UI.addContentElement();
        UI.createMainStructure();
        Elements.createElements();

    }

    static createMainStructure() {
        UI.createMainElements();
        projectComponents.createProjectContainers();
        UI.createTaskContainer();
    }

    static createMainElements() {
        const body = document.body;
        body.id = 'body';
        const content = document.createElement('div')
        content.id = 'content';
        body.appendChild(content);
        let classNames=['sidebar', 'header',
            'tasks']
        for (let classItem in classNames){
            let item = this.addHTML('div', '', null, classNames[classItem])
            content.appendChild(item)
        }
    }
    static createTaskContainer() {
        let container = UI.addHTML('div', '', null, 'task-container')
        let taskArea = document.getElementById('tasks')
        taskArea.appendChild(container)
    }
    static addHTML(type, content, classnames=null, id=null ) {
        let element = document.createElement(type);
        element.innerHTML = content;
        if (classnames !== null) {
            for (let name in classnames) {
                element.classList.add(classnames[name]);
            }}
        if (id !== null) {
            element.id = id;
        }
        return element;
        }
}







export {body, content};