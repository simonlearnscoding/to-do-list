import Icon from "../assets/iconPlus.png";
import IconTrash from "../assets/icon-trash.svg"
import IconEdit from "../assets/icon-edit.svg"

import UI, {body, content} from './interface';
import {read, write} from "./read-write";



import { compareAsc, format } from 'date-fns'
import { formatDistance, endOfToday } from 'date-fns'
let popUpOpen = false
let currentProject = 'inbox'

function updatecurrentProject(oldname, newname) {
    if(currentProject == oldname) {
        currentProject = newname;
    }
}
export {updatecurrentProject}
export default class Elements {
    static createElements() {

        projectComponents.loadProjects();
        tasks.loadTasks('inbox'); // TODO filter for inbox
        buttons.createButtons();
        projectComponents.selectedInbox();


        document.addEventListener('keydown', (event) => {
            buttons.keyButtons(event.key)
        });
    }


    static emptyContainer(id){
        let container = document.getElementById(id)
        container.innerHTML = ''
    }
}

class buttons {

    static keyButtons(key) {
        if(key == "Escape") {
            popups.closePopup();
        }
        // TODO: bugfix buttons shouldnt work if in popup

        if(key == "q") {
            popups.createTaskPopup();
        }

        if(key == "p") {
            popups.createProjectPopup();
        }
    }

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

class textContent{

    //TODO you are here
    static createPriorityPreselect(task) {
        let str = ''
        // selected="selected"
        const strings = ['one', 'two', 'three', 'four']

        for(let i = 0; i < 4; i++)
        {
            let selected = ''
            if (task.priority == strings[i]) {
                selected = 'selected=\"selected"'
            }
            let line = `<option ${selected} value=\"${strings[i]}\">${i + 1}</option> \n`
            str += line

        }
        console.log(str)
        return str
    }
    static taskForm(editMode, task=null) {
        let options = projectComponents.getProjectOptions(task.project) // TODO get all project names
        let content = ''
        if(editMode) {

            content =  `<input class="name" type="text" value="${task.name}" name="name" required />
           <input type="hidden"  name="type" value="Task"/>
           
           <div class="prio">
            <label  for="priority">Priority </label>
            <select name="priority" id="priority">
            ${textContent.createPriorityPreselect(task)}
            </select>
           </div>
           
           <div class="proj">
           <label for="project">Project</label>
           <select id="project" name="project">
            ${options}
           </select>           
           
</div>
            <div class="date">
           <label for="date">Due Date</label>
           <input type="date" name="date" id="date">
</div>
             
         <textarea class="desc" name="description" value="${task.description}" form="task-input-form"  cols="1" rows="1"></textarea>
        <button class="cancel" id="cancel">Cancel</button>
        <button class="ok">Edit Task</button>`
        }

         else content = `<input class="name" type="text" placeholder="Task Name" name="name" required />
           <input type="hidden"  name="type" value="Task"/>
           <div class="prio">
            <label  for="priority">Priority </label>
            <select name="priority" id="priority">
           <option value="one">1</option>
           <option value="two">2</option>
           <option value="three">3</option> 
           <option selected="selected" value="four">4</option>
            </select>
           </div>
           <div class="proj">
           <label for="project">Project</label>
           <select id="project" name="project" >
            ${options}
           </select>           
           
</div>
            <div class="date">
           <label for="date">Due Date</label>
           <input type="date" name="date" id="date">
</div>
            
         
         <textarea class="desc" placeholder="Describe your task here!" name="description" form="task-input-form" cols="1" rows="1"></textarea>
        <button class="cancel" id="cancel">Cancel</button>
        <button class="ok">Add Task</button>`

        return content}

    static projectForm(editMode, project) {
        let content = ''
        if(editMode) {

            content = `<input type="text" value="${project.name}" name="name" required />\n' +
            '<input type="hidden"  name="type" value="Project"/>\n' +
            '         <textarea value="${project.description}" cols="30" rows="5"></textarea>\n' +
            '         <button id="cancel">Cancel</button>\n' +
            '        <button id="add-project-confirm">Edit Project</button>`

        }
        else {
        content = ' `<input type="text" placeholder="Project Name" name="name" required />\n' +
            '<input type="hidden"  name="type" value="Project"/>\n' +
            '         <textarea placeholder="What is this project about?" cols="30" rows="5"></textarea>\n' +
            '         <button id="cancel">Cancel</button>\n' +
            '        <button id="add-project-confirm">Create Project</button>`'}
        return content }
}
class popups {

    static createProjectPopup(project = null, editMode = false){
        popUpOpen = true
        let ProjectContent = textContent.projectForm(editMode, project)

        let form = UI.addHTML('form', ProjectContent, ['popup', 'project'], 'project-input-form');
        popups.createGrayContainer(form);
        popups.#addSubmitListener('project-input-form', 'project', editMode, project)

        let cancel = document.getElementById('cancel');
        cancel.addEventListener('click', () => popups.closePopup())
        form.autocomplete="off"
    }
    static createTaskPopup(task=null, editMode = false) {
        popUpOpen = true
        let TaskContent = textContent.taskForm(editMode, task)
        let form = UI.addHTML('form', TaskContent, ['popup', 'task'], 'task-input-form');
        form.autocomplete = 'off';
        popups.createGrayContainer(form);


        popups.#addSubmitListener('task-input-form', 'tasks', editMode, task)

        let cancel = document.getElementById('cancel');
        cancel.addEventListener('click', () => popups.closePopup())
    }
    static #addSubmitListener(id, type, edit=false, obj=null) {
        const InputForm = document.getElementById(id);


        InputForm.addEventListener('submit', function(event)
        {   //write into storage and close popup

            if (edit) {

                write.change(type, event, obj);
            }
            else {write.write(type, event);}
            popups.closePopup();



            if (type == 'project') {
                projectComponents.loadUserProjects()
                if(!edit) {
                    tasks.loadTasks(currentProject);
                }
                return
            }
            tasks.loadTasks(currentProject);



        })
    }
    static closePopup() {
        popUpOpen = false
        var graybox = document.getElementById('fullscreen-container');
        graybox.remove();
        // var form = document.getElementsByClassName('form');
        // form.remove();
    }
    static createGrayContainer(form) {
        let graycontainer = UI.addHTML('div', '', ['fullscreen-container'], 'fullscreen-container');
        body.appendChild(graycontainer);
        graycontainer.appendChild(form);
    }
}

class projectComponents {

    static loadProjects(){


        projectComponents.#loadDefaultProjects();
        projectComponents.loadUserProjects();
    }

    static selectedInbox(selected) {
        let div = document.getElementById('inbox')
        div.classList.add('selected')
    }

    static getProjectOptions(selected=null){
        let selectedProject = currentProject
        if (selected!= null) {
            selectedProject = selected
        }
        const projectComponents = read.getProjects();

        let string = ''
        if (selectedProject == 'inbox')
            {
            string = "<option selected='selected' value='inbox'>Inbox</option>"
            }
        else {
            string = "<option value='inbox'>Inbox</option>"
        }
        for (let name of projectComponents) {
            let option = name['name']

            if (option == selectedProject) {
                string += `\n<option selected="selected" value="${option}">${option}</option>`
            }
            else {
                string += `\n<option value="${option}">${option}</option>`
            }

        }
        return string;




    }
    static loadUserProjects(){
        document.getElementById('user-projects').innerHTML = ''
        const projectComponents = read.getProjects();
        for (let name of projectComponents) {
            this.#makeProject(name['name'], 'user-projects')
        }
}
    static #loadDefaultProjects(){
        document.getElementById('default-projects').innerHTML = ''
        const DefaultProjects = ['inbox', 'this week', 'this month']
        for (let name of DefaultProjects) {
            this.#makeProject(name, 'default-projects')
        }
    }

    static #makeProject(project, type) {
        let projectElement = UI.addHTML('div','', ['project-component'], project)
        let projectName = UI.addHTML('div', project, ['project-name'], project)
        projectElement.appendChild(projectName);
        projectComponents.#addProjectButtons(projectElement, project)
        projectName.addEventListener('click', function(event) {projectComponents.#projectSelect(event.target.innerHTML)})


        let container = document.getElementById(type)
        container.appendChild(projectElement)
    }

    static #addProjectButtons(projectElement, project) {
        if(projectComponents.#skipExcludedProjects(project)){
            return
        }
        projectComponents.#addEditButton(projectElement, project)
        projectComponents.#addTrashButton(projectElement, project)

    }

    static #skipExcludedProjects(project) {
        let excluded = ['inbox', 'this week', 'this month']

        // skip this if its not a user project
        if (excluded.includes(project)) {
            return true
        }
    }

    static #addTrashButton(projectElement, project) {

        let trash = UI.addHTML('div', '', ['trash'], null);
        const myIcon = new Image();
        myIcon.src = IconTrash;
        trash.appendChild(myIcon);
        trash.addEventListener('click', (event) => projectComponents.#delProjPopup(project))
        projectElement.appendChild(trash);
}


    static #addEditButton(projectElement, project) {
        let button = UI.addHTML('div', '', ['edit'], null);
        const myIcon = new Image();
        myIcon.src = IconEdit;
        button.appendChild(myIcon);
        const projObj = read.getObject('project', project)
button.addEventListener('click', (event) => popups.createProjectPopup(project = projObj, true))
        projectElement.appendChild(button);
    }

    static #delProjPopup(project) {
        // let projecc = project.target.parentNode.previousSibling.textContent;
        let content = `<h2> Are you sure you want to delete this project?<\h2>
<button id="warning-confirm" class="ok" value="1"> Yes </button>
<button id="warning-deny" class="cancel" value="0"> No </button>`
            let form = UI.addHTML('form', content, ["popup", 'warning'] , null )
            popups.createGrayContainer(form)
            form.addEventListener('click', function(event) {
                popups.closePopup();
                if(event.target.value == 1)
                {
                    projectComponents.deleteTheProject(project)
                };
            })
    }
    static deleteTheProject(project) {
        write.removeProject(project);
        if (project == currentProject) {
            currentProject = 'inbox';
            projectComponents.selectedInbox();
        }
        projectComponents.loadProjects();
        tasks.loadTasks(currentProject);

    }

    static #projectSelect(project) {
        css(project);
        currentProject = project;
        tasks.loadTasks(project);

        function css(project) {
            let allProjects = document.querySelectorAll('.project-component')
            allProjects.forEach(iteration => iteration.classList.remove('selected'))
            let element = document.getElementById(project);
            element.classList.add('selected')

        }
    }
    static createProjectContainers() {
        const ProjectContainer1 = UI.addHTML('div', '', ['project-container', 'default-projects'], 'default-projects')
        const ProjectContainer2 = UI.addHTML('div', '', ['project-container', 'user-projects'], 'user-projects')
        const sidebar = document.getElementById('sidebar')
        sidebar.appendChild(ProjectContainer1)
        sidebar.appendChild(ProjectContainer2)
    }
}

class tasks {

    static loadTasks(project){
        Elements.emptyContainer('tasks')
        let taskComponents = read.getTasks();
        taskComponents = read.filterTasksforProject(taskComponents, project);
        for (let name in taskComponents) {
            this.#makeTask(taskComponents[name])
        }
    }
    static #makeTask(task) {

        let taskElement = UI.addHTML('div', '', ['task-component', task['priority']], task['name'])
        let description = UI.addHTML('div', task['name'], ['task-description'], '')
        let checkbox = UI.addHTML('div', '', ['task-checkbox'], '')
        checkbox.addEventListener('click', function(event)  {
            event.stopPropagation();
            tasks.#deleteTask(taskElement);
            })

        let container = document.getElementById('tasks')
        taskElement.appendChild(checkbox)
        taskElement.appendChild(description)
        if(task['date']) {
            let date = UI.addHTML('div', task['date'], ['task-date'], '')
            taskElement.appendChild(date)
        }

        const taskObj = read.getObject('tasks', task.name)
        taskElement.addEventListener('click', (event) => popups.createTaskPopup(task= taskObj, true));
        container.appendChild(taskElement)

    }
    static #deleteTask(task) {
        let taskname = task.innerText;
        write.removeObject('tasks', taskname);
        tasks.loadTasks(currentProject);


    }
}

export {projectComponents}






