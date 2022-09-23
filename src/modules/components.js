import IconTrash from "../assets/icon-trash.svg"
import IconEdit from "../assets/icon-edit.svg"
import UI, {Elements} from './interface';
import {read, write} from "./read-write";
import {delProjPopup, ProjectEdit, TaskEdit} from "./popups";

const dayjs = require('dayjs')

let currentProject = 'inbox'

export const taskList = []
export const  projectList = []

function updateCurrentProject(oldName, newName) {
    if(currentProject === oldName) {
        currentProject = newName;
    }
}
export {updateCurrentProject, currentProject}

class Component {
    constructor(object) {
        this.name = object.name;
        this.type = object.type;
    }
}


export class taskObject extends Component{
    constructor(object) {
        super(object);
        this.priority = object.priority;
        this.project = object.project;
        this.date = object.date;
        this.delete = deleteObject;
    }

    spawn() {
            const taskElement = spawnMainContainer(this)
            spawnCheckBox(this)
            spawnDescription(this)
            spawnDateElement(this)

            function spawnMainContainer(target) {
                const container = document.getElementById('tasks')
                const taskElement = UI.addHTML('div', '', ['task-component'], target.priority, target.name)
                taskElement.addEventListener('click', () => new TaskEdit(target));
                container.appendChild(taskElement)
                return taskElement
            }

            function spawnCheckBox(target) {
                const checkbox = UI.addHTML('div', '', ['task-checkbox'], '')
                const _this = target
                checkbox.addEventListener('click', function (event) {
                    event.stopPropagation();
                    _this.delete(_this, taskList);
                    taskComponents.loadTasks(currentProject);
                })
                taskElement.appendChild(checkbox)
            }

            function spawnDescription(target) {
                const description = UI.addHTML('div', target.name, ['task-description'], '')
                taskElement.appendChild(description)
            }

            function spawnDateElement(target) {
                if (target.date) {
                    let dateObj = taskComponents.createTaskDateObj(target)

                    let date = UI.addHTML('div', dateObj.readableDate, ['task-date'], '')


                    if (dateObj.readableDate === "overdue") {
                        date.style.color = "red;"
                    }
                    taskElement.appendChild(date)
                }
            }
        }
}
export class projectObject extends Component{
    constructor(object) {
        super(object);
        this.delete = deleteObject;
        this.kind = object.kind;
    }

    spawn() {


        const projElement = spawnMainContainer(this, chooseSpawnLocation(this))
        spawnDescription(this)
        spawnProjectButtons(this)

        function chooseSpawnLocation(target) {
                return `${target.kind}-projects`
        }
        function spawnMainContainer(target, spawnLocation) {
            const container = document.getElementById(spawnLocation)
            let projectElement = UI.addHTML('div', '', ['project-component'], target.name)

            container.appendChild(projectElement)
            return projectElement
        }

        function spawnDescription(target) {

            let projectName = UI.addHTML('div', target.name, ['project-name'], target.name)
            const _this = target
            projectName.addEventListener('click', function() {projectSelect(_this.name)})
            projElement.appendChild(projectName)
            function projectSelect(project) {
                currentProject = project;
                taskComponents.loadTasks(project);
                  projectComponents.projectSelectCss(project)
                //remove all classes

            }
            }

        function spawnProjectButtons(target) {
            if( target.kind === "default"){
                return
            }
           addEditButton(projElement, target)
           addtrashbutton(projElement, target)

        }

        function addtrashbutton(projectElement, target) {

            let trash = UI.addHTML('div', '', ['trash'], null);
            const myIcon = new Image();
            myIcon.src = IconTrash;
            trash.appendChild(myIcon);
            const _this = target
            trash.addEventListener('click',  function (event) {
                event.stopPropagation();
                new  delProjPopup(_this)

            })

            projectElement.appendChild(trash);
    }

        function addEditButton(projectElement, project) {
            let button = UI.addHTML('div', '', ['edit'], null);
            const myIcon = new Image();
            myIcon.src = IconEdit;
            button.appendChild(myIcon);
            button.addEventListener('click', () => new ProjectEdit(project))
            projectElement.appendChild(button);
        }
    }

}

const deleteObject = (object, Array) =>  {
    write.removeObject(object.type, object.name);
    removeFromArray(object, Array)
    function removeFromArray(object, Array) {
        for(var i = 0; i < Array.length; i++) {
            if(Array[i].name === object.name) {
                Array.splice(i, 1);
                break;
            }
        }
    }
}

export class projectComponents {
    static loadProjects(){
        Elements.emptyContainer('default-projects') // get Task container
        Elements.emptyContainer('user-projects') // get Task container
            for (let project of projectList) {
                project.spawn()
            }

        }
    static selectedInbox() {
        let div = document.getElementById('inbox')
        div.classList.add('selected')
    }
    static getProjectOptions(selected=null){
        let selectedProject = currentProject
        if (selected!= null) {
            selectedProject = selected
        }
        let string
        if (selectedProject === 'inbox')
            {
            string = "<option selected='selected' value='inbox'>Inbox</option>"
            }
        else {
            string = "<option value='inbox'>Inbox</option>"
        }
        for (let object in projectList) {
            let option = projectList[object].name

            if (option === selectedProject) {
                string += `\n<option selected="selected" value="${option}">${option}</option>`
            }
            else {
                string += `\n<option value="${option}">${option}</option>`
            }

        }
        return string;




    }

    static deleteProject(object) {
        deleteObject(object, projectList)

            if ( object === currentProject) {
                currentProject = 'inbox';
                projectComponents.selectedInbox();
            }
            projectComponents.loadProjects();

            taskComponents.loadTasks(currentProject);
    }

     static projectSelectCss(project) {
        let getAllProjects = document.querySelectorAll('.project-component')
        getAllProjects.forEach(iteration => iteration.classList.remove('selected'))
        let element = document.getElementById(project);
        element.classList.add('selected')
    }
}
export class taskComponents {
    static createProjects() {
         projectList.length = 0
        createUserProjects(this)
        createDefaultProjects(this)


        function createDefaultProjects(target){
            const projects = [
                {name:'inbox', type:'project', kind:'default'},{name:'this week', type: 'project', kind:'default'}, {name:'this month', type: 'project', kind:'default'}]
            projects.forEach(project => {
                  target.createProjectObject(project);
            })
        }
        function createUserProjects(target) {
            let projects = read.getItems('project')
            projects.forEach(project => project.kind = 'user')
            projects.forEach(project => {
                 target.createProjectObject(project);

            })}

    }
     static createProjectObject(project) {
        const object = new projectObject(project);
        projectList.push(object)
    }
    static createTasks() {
         taskList.length = 0
        let tasks = read.getItems('tasks'); // get tasks from Database
        tasks.forEach(task => {
        taskComponents.createTaskObject(task);
        })}
    static createTaskObject(task) {
            const object = new taskObject(task);
            taskList.push(object)
        }
    static loadTasks(project){
        Elements.emptyContainer('tasks') // get Task container
        // let task = read.getTasks(); // get tasks from Database
        let filteredBySelectedProject = filterTasks(project, taskList);
        spawnTasks(filteredBySelectedProject);

        function filterTasks(project, tasks) {
            if(isTimedProject(project)) {
                return filterByTimePeriod(project, tasks)
            }

            if(isUserProject(project))  {
                return filterByProjectName(project, tasks)
            }
        }
        function filterByTimePeriod(project, tasks) {

            let threshold = calcThreshold(project)
            return tasks.filter(task => {
                let dateObj = taskComponents.createTaskDateObj(task);
                if (dateObj['daysDifference'] <= threshold)
                    return true
            })

            function calcThreshold(project) {
                if (project === 'this week') {
                    return 7
                } if (project ==='this month') {
                    return calculateDaysToEndOfMonth()
                }
            }

            function calculateDaysToEndOfMonth(){
                const date = new Date();
                const currentYear = date.getFullYear();
                const currentMonth = date.getMonth() + 1;
                const currentDay = date.getDate();
                const daysInMonth = getDaysInMonth(currentYear, currentMonth);

                return daysInMonth - currentDay

                function getDaysInMonth(year, month) {
                    return new Date(year, month, 0).getDate();
                }


            }
        }
        function filterByProjectName(project, tasks) {
            tasks = read.filterTasksforProject(tasks, project);
            return tasks;
        }

        function spawnTasks(array) {
            for (let Task of array) {
                Task.spawn()
            }
        }
        function isUserProject(project) {

            let projects = read.getProjects()
            projects.push('inbox');
            if (projects.includes(project)) {
                return true;
            }
        }

        function isTimedProject(project) {
            return !!((project === "this week") | (project === 'this month'));

        }
    }
    static createTaskDateObj(task) {
        const date = task['date']
        const daysDifference = dateCalculations.daysUntilDueDate(date)
        const readableDate = dateCalculations.DateToString(daysDifference, date)

        return {
            daysDifference,
            readableDate
        }

    }
}
class dateCalculations {


    static daysUntilDueDate(task) {

        const DueDate = dateCalculations.getObjDueDate(task)
        const start = new Date(dayjs().startOf('day'));
        const difference2 = dateCalculations.calcTimeDifference(start, DueDate )
        return dateCalculations.msIntoDays(difference2);

    }



    static getWeekDate(date) {
       return date.toLocaleString('en-us', {weekday: 'long'});
    }
    static calcTimeDifference(date1, date2) {
        return date2.getTime() - date1.getTime();
    }
    static getObjDueDate(date) {
        return new Date(date);

    }
    static msIntoDays(ms) {
        return Math.floor(ms / (24 * 60 * 60 * 1000));
    }

    static DateToString(days, date) {

        const DueDate = dateCalculations.getObjDueDate(date)
        const weekDay = dateCalculations.getWeekDate(DueDate)
        return decisionMatrix(days, weekDay, DueDate)

        function decisionMatrix(days, weekDay, DueDate) {
            if (days < 0) {
                return 'overdue';
            }
            if (days===0) {
                return 'today';
            }
            if (days ===1) {
                return 'tomorrow';
            }
            if (days ===2) {
                return 'in two days';
            }
            if (days > 2 && days < 7) {
                return `on ${weekDay.toLowerCase()}`;
            }
            if (days > 7 && days <= 14) {
                return `next ${weekDay.toLowerCase()}`;
            }
            if (days > 14 && days <= 21) {
                return `in two weeks`;
            }
            if (days > 21 && days <= 28) {
                return `in three weeks`;
            }
            if (days > 28 && days <= 364) {
                let string = '' + DueDate
                string = string.slice(4, 11)
                return string;
            }
            if (days > 364) {
                let string = '' + DueDate
                string = string.slice(4, 15)
                return string;
            }
        }




    }
    }









