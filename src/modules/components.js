import IconTrash from "../assets/icon-trash.svg"
import IconEdit from "../assets/icon-edit.svg"
import UI, {Elements} from './interface';
import {read, write} from "./read-write";
import popups from "./popups";

const dayjs = require('dayjs')

let currentProject = 'inbox'

function updatecurrentProject(oldname, newname) {
    if(currentProject == oldname) {
        currentProject = newname;
    }
}
export {updatecurrentProject, currentProject}


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
            let option = name

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
            this.#makeProject(name, 'user-projects')
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
        trash.addEventListener('click', (event) => popups.delProjPopup(project))
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

    static deleteTheProject(project) {
        write.removeProject(project);
        if (project == currentProject) {
            currentProject = 'inbox';
            projectComponents.selectedInbox();
        }
        projectComponents.loadProjects();
        taskComponents.loadTasks(currentProject);

    }

    static #projectSelect(project) {
        css(project);
        currentProject = project;

        taskComponents.loadTasks(project);

        function css(project) {
            let allProjects = document.querySelectorAll('.project-component')
            allProjects.forEach(iteration => iteration.classList.remove('selected'))
            let element = document.getElementById(project);
            element.classList.add('selected')

        }
    }

}
class taskComponents {

    static loadTasks(project){
        Elements.emptyContainer('tasks')
        let tasks = read.getTasks();

        let filteredTasks = filterTasks(project, tasks);
        spawnTasks(filteredTasks);


        function filterTasks(project, tasks) {
            if(isTimedProject(project)) {
                return filterByTimePeriod(project, tasks)
            }

            if(isUserProject(project))  {
                return filterByProjectName(project, tasks)
            }
        }

        function filterByTimePeriod(project, tasks) {

            let treshold = calcTreshold(project)

            let filteredTasks = tasks.filter(task => {
                let dateObj = taskComponents.datecalc(task);
                if (dateObj['daysDifference'] <= treshold)
                    return true
                })

            return filteredTasks;

            function calcTreshold(project) {
                if (project == 'this week') {
                    return 7
            } if (project =='this month') {
                    return calculateDaysToEndOfMonth()
                }
        }

        function calculateDaysToEndOfMonth(){
            const date = new Date();
            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth() + 1;
            const currentDay = date.getDate();
            const daysThismonth = getDaysInMonth(currentYear, currentMonth);

            return daysThismonth - currentDay

            function getDaysInMonth(year, month) {
                return new Date(year, month, 0).getDate();
            }


        }

        }

        function filterByProjectName(project, tasks) {
            tasks = read.filterTasksforProject(tasks, project);
            return tasks;
        }
        function spawnTasks(tasks) {
            for (let name in tasks) {
                taskComponents.makeTask(tasks[name])
            }
        }
        function isUserProject(project) {

            let projects = read.getProjects().push('inbox');
            if (project.includes(project)) {
                return true;
            }
        }

        function isTimedProject(project) {
            if ((project == "this week") | (project == 'this month')) {
                return true
            }
            return false
        }
    }
    static makeTask(task) {

        const taskElement = spawnMainContainer(task)
        spawnCheckBox(task)
        spawnDescription(task)
        spawnDateElement(task)

        function spawnMainContainer(task) {
            const container = document.getElementById('tasks')
            const taskElement = UI.addHTML('div', '', ['task-component', task['priority']], task['name'])
            taskElement.addEventListener('click', (event) => popups.createTaskPopup(task= taskObj, true));
            container.appendChild(taskElement)
            return taskElement
        }
        function spawnCheckBox(task) {
            const checkbox = UI.addHTML('div', '', ['task-checkbox'], '')
            checkbox.addEventListener('click', function(event)  {
                event.stopPropagation();
                taskComponents.#deleteTask(task['name']);
            })

            taskElement.appendChild(checkbox)
        }
        function spawnDescription(task) {
            const description = UI.addHTML('div', task['name'], ['task-description'], '')
            taskElement.appendChild(description)
        }
        function spawnDateElement(task) {
            if(task['date']) {
                let dateObj = createTaskDateObj(task)
                let date = UI.addHTML('div', dateObj.readableDate, ['task-date'], '')
                //TODO make overdue red
                function createTaskDateObj(task) {
                    const date = task['date']
                    const daysDifference = dateCalculations.daysUntilDueDate(date)
                    const readableDate = dateCalculations.tostring(daysDifference, date)
                    const DateObj = {
                        daysDifference,
                        readableDate
                    }
                    return DateObj
                }
                if (dateObj.readableDate == "overdue") {
                    date.style.color="red;"
                }
                taskElement.appendChild(date)
            }
        }
    }
    static #deleteTask(task) {
        write.removeObject('tasks', task);
        taskComponents.loadTasks(currentProject);


    }
}
class dateCalculations {


    static daysUntilDueDate(task) {

        const DueDate = dateCalculations.getObjDueDate(task)
        const start = new Date(dayjs().startOf('day'));
        const difference2 = dateCalculations.calcTimeDifference(start, DueDate )
        const days = dateCalculations.mstoDays(difference2);
        return days
    }



    static getWeekDate(date) {
       return date.toLocaleString('en-us', {weekday: 'long'});
    }
    static calcTimeDifference(date1, date2) {
        return date2.getTime() - date1.getTime();
    }
    static getObjDueDate(date) {
        let taskDueDate = date;
        let DueDate = new Date(taskDueDate);
        return DueDate;
    }
    static mstoDays(ms) {
        return Math.floor(ms / (24 * 60 * 60 * 1000));
    }

    static tostring(days, date) {

        const DueDate = dateCalculations.getObjDueDate(date)
        const weekDay = dateCalculations.getWeekDate(DueDate)
        return decisionMatrix(days, weekDay, DueDate)

        function decisionMatrix(days, weekDay, DueDate) {
            if (days < 0) {
                return 'overdue';
            }
            if (days==0) {
                return 'today';
            }
            if (days ==1) {
                return 'tomorrow';
            }
            if (days ==2) {
                return 'in two days';
            }
            if (days > 2 && days < 7) {
                return `on ${weekDay.toLowerCase()}`;
            }
            if (days > 7 && days < 14) {
                return `next ${weekDay.toLowerCase()}`;
            }
            if (days > 14 && days < 21) {
                return `in two weeks`;
            }
            if (days > 21 && days < 28) {
                return `three weeks`;
            }
            if (days > 28 && days < 364) {
                let string = '' + DueDate
                string = string.slice(4, 11)
                return string;
            }
            if (days > 365) {
                let string = '' + DueDate
                string = string.slice(4, 15)
                return string;
            }
        }




    }
    }

export {projectComponents, taskComponents}







