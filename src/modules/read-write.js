import { updateCurrentProject, taskComponents } from "./components";

class write {
  static write(type, event) {
    let obj = write.#createObject(event); //turn the event into an object
    write.#addItemToStorage(type, obj); //add to database
    addInstanceOfObject(obj); // add object locally
    function addInstanceOfObject(obj) {
      if (obj.type === "tasks") {
        taskComponents.createTaskObject(obj);
      } else {
        taskComponents.createProjectObject(obj);
      }
    }
  }

  static change(type, event, object) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    const obj = write.#createObject(event);
    const oldObject = { ...object };

    tasks
      .filter((task) => task["name"] === oldObject.name)
      .map((task) => Object.assign(task, obj));
    localStorage.setItem(type, JSON.stringify(tasks));

    if (type === "project") {
      updateCurrentProject(oldObject.name, obj.name);
      changeTaskProjectName(oldObject.name, obj.name);
    }

    function changeTaskProjectName(oldName, newName) {
      let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].project === oldName) {
          tasks[i].project = newName;
        }
      }
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    taskComponents.createProjects();
    taskComponents.createTasks();
  }

  static #createObject(event) {
    event.preventDefault();
    const myFormData = new FormData(event.target);
    return Object.fromEntries(myFormData.entries());
  }

  static #addItemToStorage(type, obj) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    tasks.push(obj);
    localStorage.setItem(type, JSON.stringify(tasks));
  }

  static removeProject(project) {
    write.removeObject("project", project, "name"); // remove the project from the list
    write.removeObject("tasks", project, "project"); // and all it's corresponding tasks
  }

  static removeObject(type, name, attribute = "name") {
    const objects = JSON.parse(localStorage.getItem(type)) || [];
    const UpdatedObjectsArray = objects.filter(
      (object) => object[attribute] !== name
    );
    localStorage.setItem(type, JSON.stringify(UpdatedObjectsArray));
  }
}

class read {
  static getObject(type, name) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    return tasks.filter((task) => task.name === name)[0];
  }

  static getProjects() {
    return read.getItems("project").map((proj) => proj["name"]);
  }

  static filterTasksforProject(tasks, project) {
    return tasks.filter((item) => item["project"] === project);
  }

  static getItems(type) {
    return JSON.parse(localStorage.getItem(type)) || [];
    // return product.map(item => item);
  }
}

export { read, write };
