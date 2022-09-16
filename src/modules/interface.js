//imports here
import {projectComponents, taskComponents} from './components';


import Icon from './../assets/iconPlus.png';
import keyButtons from "./hotkeys";
import {popups} from "./popups";
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
        UI.createMainSections();
        UI.createProjectContainers();
        UI.createTaskContainer();
    }

    static createMainSections() {
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
    static createProjectContainers() {
        const ProjectContainer1 = UI.addHTML('div', '', ['project-container', 'default-projects'], 'default-projects')
        const ProjectContainer2 = UI.addHTML('div', '', ['project-container', 'user-projects'], 'user-projects')
        const sidebar = document.getElementById('sidebar')
        sidebar.appendChild(ProjectContainer1)
        sidebar.appendChild(ProjectContainer2)
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

class Elements {
    static createElements() {

        projectComponents.loadProjects();
        taskComponents.loadTasks('inbox'); // TODO filter for inbox
        buttons.createButtons();
        projectComponents.selectedInbox();
        document.addEventListener('keydown', (event) => {
            keyButtons(event)
        });
    }

    static emptyContainer(id){
        let container = document.getElementById(id)
        container.innerHTML = ''
    }
}

class buttons {


    static createButtons() {
        buttons.#createProjectButton();
        buttons.#createTaskButton();
    }
    static #createProjectButton()  {
        let button = UI.addHTML('div', '+ Add a project', ['button','project'], 'add-project-button');
        const projContainer = document.getElementById('sidebar')
        projContainer.appendChild(button);
        button.addEventListener('click', popups.createProjectPopup);
    }
    static #createTaskButton(){
        let button = UI.addHTML('div', '', ['button','task'], 'add-task-button');
        const myIcon = new Image();
        myIcon.src = Icon;
        button.appendChild(myIcon);
        body.appendChild(button);
        button.addEventListener('click', popups.createTaskPopup);
    }
}

export {body, content, Elements};