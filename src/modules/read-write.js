import {updatecurrentProject} from "./components";

class write {

    static write(type, event) {
        let obj = write.#createObject(event);
        write.#addItemToStorage(type, obj);
    }
    static change(type, event, object) {
        const obj = write.#createObject(event)
        let tasks = JSON.parse(localStorage.getItem(type)) || [];
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].name == object.name) {
                for (const attr in tasks[i]) {
                    tasks[i][attr] = obj[attr]
                }
                break;
            }

        }
        localStorage.setItem(type, JSON.stringify(tasks));
        if(type == 'project') {

            updatecurrentProject(object.name, obj.name);
            write.changeTaskProject(object.name, obj.name);
        }
    }

    static changeTaskProject(oldname, newname) {
        let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].project == oldname) {
                tasks[i].project = newname;
            }
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    static #createObject(event) {
        event.preventDefault();
        const myFormData = new FormData(event.target);
        const formDataObj = Object.fromEntries(myFormData.entries());
        // TODO generate unique object ID
        return formDataObj;
    }

    static #addItemToStorage(type, obj) {
        let tasks = JSON.parse(localStorage.getItem(type)) || [];
        tasks.push(obj);
        localStorage.setItem(type, JSON.stringify(tasks));
    }

    static removeProject(project) {
        write.removeObject('project', project);
        write.removeProjectTasks(project);
    }


    static removeObject(type, name) {
        let tasks = JSON.parse(localStorage.getItem(type)) || [];
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].name == name) {
                tasks.splice(i, 1);
                break;
            }

        }
        localStorage.setItem(type, JSON.stringify(tasks));
    }

    static removeProjectTasks(name) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        for(var i = 0; i < tasks.length; i++) {
            if(tasks[i].project == name) {
                tasks.splice(i, 1);
            }
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

class read{

    static getObject(type, name) {
        let tasks = JSON.parse(localStorage.getItem(type)) || [];
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].name == name) {
                return tasks[i];
            }
        }
    }


    static getProjects() {
        const obj = read.getItems('project').map(proj => proj['name'])
        return obj
    }

    static getTasks(){
        return read.getItems('tasks')
        }

    static filterTasksforProject(tasks, project){
        // let obj = []
        let obj = tasks.filter(item => item['project'] ==  project)
        // for (const item in tasks) {
        //     if (tasks[item]['project'] === project) {
        //         obj.push(tasks[item])
        //     }
        // }
        return obj;

    }

    static getItems(type) {
        let product = localStorage.getItem(type);
        product = JSON.parse(product)
        let obj = product.map(item => item)
        return obj;
    }
}

export {read, write};


