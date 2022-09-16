import UI, {body} from "./interface";
import {write} from "./read-write";
import {currentProject, projectComponents, taskComponents} from "./components";

let popUpOpen = false
export default class popups {

    static createProjectPopup(project = null, editMode = false) {
        popUpOpen = true
        let ProjectContent = textContent.projectForm(editMode, project)

        let form = UI.addHTML('form', ProjectContent, ['popup', 'project'], 'project-input-form');
        popups.createGrayContainer(form);
        popups.#addSubmitListener('project-input-form', 'project', editMode, project)

        let cancel = document.getElementById('cancel');
        cancel.addEventListener('click', () => popups.closePopup())
        form.autocomplete = "off"
    }

    static createTaskPopup(task = null, editMode = false) {
        popUpOpen = true
        let TaskContent = textContent.taskForm(editMode, task)
        let form = UI.addHTML('form', TaskContent, ['popup', 'task'], 'task-input-form');
        form.autocomplete = 'off';
        popups.createGrayContainer(form);


        popups.#addSubmitListener('task-input-form', 'tasks', editMode, task)

        let cancel = document.getElementById('cancel');
        cancel.addEventListener('click', () => popups.closePopup())
    }

    static #addSubmitListener(id, type, edit = false, obj = null) {
        const InputForm = document.getElementById(id);


        InputForm.addEventListener('submit', function (event) {   //write into storage and close popup

            if (edit) {

                write.change(type, event, obj);
            } else {
                write.write(type, event);
            }
            popups.closePopup();


            if (type == 'project') {
                projectComponents.loadUserProjects()
                if (!edit) {
                    taskComponents.loadTasks(currentProject);
                }
                return
            }
            taskComponents.loadTasks(currentProject);


        })
    }

    static delProjPopup(project) {
        popups.popUpOpen = true
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
    static taskprojclusterfuck(task)         {
        try {
            return  task.project
        }
        catch(err) { return null}
    }
    static taskForm(editMode, task=null) {


        let taskproject = textContent.taskprojclusterfuck(task)
        let options = projectComponents.getProjectOptions(taskproject) // TODO get all project names
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
           <input type="date" name="date" value="${task.date}" id="date">
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

export {popups, popUpOpen};