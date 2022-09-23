import UI, {body} from "./interface";
import {write} from "./read-write";
import {currentProject, projectComponents, taskComponents} from "./components";
let popUpOpen = false

const Functionality = {
    spawnPopup : (content, type) => {

        let form = UI.addHTML('form', content);
        form.autocomplete = 'off';
        createGrayContainer(form);
        function createGrayContainer(form) {
            {
                let graycontainer = UI.addHTML('div', '', ['fullscreen-container'], 'fullscreen-container');
                body.appendChild(graycontainer);
                UI.giveHTMLIdentity(form, ['popup', type], `${type}-input-form`)
                graycontainer.appendChild(form);
            }
        }
        return form;

    },
    closePopup : (form) => {
        popUpOpen = false
        const greyBox = document.getElementById('fullscreen-container');
        greyBox.remove();
        form.remove();
    },
    editObject : (type, object, event, form) => {
        write.change( type, event, object);
        Functionality.closePopup(form);
        Functionality.reloadSite();
    },
    createObject : (type, event, form) => {
        write.write(type, event);
        Functionality.closePopup(form);
        Functionality.reloadSite();
    },
    reloadSite : () => {
        projectComponents.loadProjects()
        taskComponents.loadTasks(currentProject)
        projectComponents.projectSelectCss(currentProject)
    }

}
class popups {
    constructor(type, editMode,target) {
        popUpOpen = true
        this.spawnPopup = Functionality.spawnPopup
        const content = createContent.create(type, editMode, target)
        return this.spawnPopup(content, type);
    }
}
class popupCreate extends popups {
    constructor(type) {
            const form = super(type, false)

            form.addEventListener('submit' ,function (event) {   //write into storage and close popup
                Functionality.createObject( type, event, form);
                }        )
}}
class popupEdit extends popups {
    constructor(type, project) {
        const form = super(type, true, project)
        form.addEventListener('submit' ,function (event) {   //write into storage and close popup
            Functionality.editObject( type, project, event, form);
        }        )
    }
}
export class TaskEdit extends popupEdit {
    constructor(target) {
            const type = 'tasks'
            super(type,target)
        }
}
export class TaskPopup extends popupCreate {
    constructor() {
        const type = 'tasks'
        super(type)
      }
}
export class ProjectPopup extends popupCreate {
    constructor() {
    const type = 'project'
    super(type)
}}
export class ProjectEdit extends popupEdit {
    constructor(target) {
        const type = 'project'
        super(type, target)
    }}


export class delProjPopup extends popups {

    constructor(target) {
        const type = 'project-delete'
         const form = super(type, false, target)
        UI.giveHTMLIdentity(form, ["popup", "warning"], null)


        const buttonConfirm = document.getElementById('warning-confirm')
        buttonConfirm.addEventListener('click',function() {

                projectComponents.deleteProject(target)
        })
        const buttonCancel = document.getElementById('warning-cancel')
         buttonCancel.addEventListener('click', Functionality.closePopup)
    }

}

class createContent {
    static create(type, editMode, object = null) {
        return createContent.decisionMaker(type, editMode, object)
    }

    static decisionMaker(type, editMode, object) {
        if (editMode === true) {
            if (type === 'tasks') {
                return createContent.taskFormEdit(object)
            } else {
                return createContent.projectFormEdit(object)
            }
        } else {
            if (type === 'tasks') {
                return createContent.taskForm()
            }
            if (type === 'project-delete') {
                return createContent.projectDeletepopUp(object)
            }
            return createContent.projectForm()
        }
    }

    static taskForm(task) {

        const taskprojclusterfuck = (task) => {
            try {
                return task.project
            } catch (err) {
                return null
            }
        }

        let taskproject = taskprojclusterfuck(task)
        let options = projectComponents.getProjectOptions(taskproject)


            return `<input class="name" type="text" placeholder="Task Name" name="name" required />
           <input type="hidden"  name="type" value="tasks"/>
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
    }

    static taskFormEdit(object) {
        const taskprojclusterfuck = (object) => {
            try {
                return object.project
            } catch (err) {
                return null
            }
        }
        const createPriorityPreselect = (object) => {
            let str = ''
            // selected="selected"
            const strings = ['one', 'two', 'three', 'four']

            for (let i = 0; i < 4; i++) {
                let selected = ''
                if (object.priority === strings[i]) {
                    selected = 'selected=\"selected"'
                }
                let line = `<option ${selected} value=\"${strings[i]}\">${i + 1}</option> \n`
                str += line

            }
            console.log(str)
            return str
        }
        let taskproject = taskprojclusterfuck(object)
        let options = projectComponents.getProjectOptions(taskproject)
        return `<input class="name" type="text" value="${object.name}" name="name" required />
           <input type="hidden"  name="type" value="tasks"/>
           
           <div class="prio">
            <label  for="priority">Priority </label>
            <select name="priority" id="priority">
            ${createPriorityPreselect(object)}
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
           <input type="date" name="date" value="${object.date}" id="date">
</div>
             
         <textarea class="desc" name="description" form="task-input-form"  cols="1" rows="1">${object.description}</textarea>
        <button class="cancel" id="cancel">Cancel</button>
        <button class="ok">Edit Task</button>`
    }

    static projectForm() {
        return ' `<input type="text" placeholder="Project Name" name="name" required />\n' +
            '<input type="hidden"  name="type" value="project"/>\n' +
            '<input type="hidden"  name="kind" value="user"/>\n' +
            '         <textarea placeholder="What is this project about?" cols="30" rows="5"></textarea>\n' +
            '         <button id="cancel">Cancel</button>\n' +
            '        <button id="add-project-confirm">Create Project</button>`'
    }

    static projectFormEdit(object) {
        return `<input type="text" value="${object.name}" name="name" required />\n' +
            '<input type="hidden"  name="type" value="project"/>\n' +
            '         <textarea cols="30" rows="5">${object.description}</textarea>\n' +
            '         <button id="cancel">Cancel</button>\n' +
            '        <button id="add-project-confirm">Edit Project</button>`
    }

    static projectDeletepopUp(object) {
  return `<h2> Are you sure you want to delete ${object.name}?<\h2>
<button id="warning-confirm" class="ok" value="1"> Yes </button>
<button id="warning-deny" class="cancel" value="0"> No </button>`
    }
}

export {popups, popUpOpen};
