const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const todoListContainer = document.getElementById("todo-list-container");
  const todoAlert = document.querySelector(".todo-item-alert");

  const countTodo = () => {
    document.getElementById("todo-count").innerText = todoListContainer.children.length;
    if (todoListContainer.children.length > 0) {
      todoAlert.style.display = "none";
    } else {
      todoAlert.style.display = "block";
    }
  };

  countTodo();

  const addTodoItem = (todoItem) => {
    const todoRow = document.createElement("div");
    todoRow.className = "list-group-item list-group-item-action";
    todoRow.id = `todo-row-${todoItem.id}`;
    todoRow.setAttribute("data-id", todoItem.id);
    if (todoItem.complete) {
      todoRow.setAttribute("data-id-complete", todoItem.complete);
      console.log(todoItem.complete);
      if (todoItem.complete == "1") {
        todoRow.classList.add("bg-success");
      }
    } else {
      todoRow.setAttribute("data-id-complete", 0);
    }

    todoRow.addEventListener("dblclick", (e) => {
      let isComplete = e.target.getAttribute("data-id-complete");
      let toggleComplete = isComplete === "1" ? "0" : "1";
      ipcRenderer.invoke("todo:complete", e.target.getAttribute("data-id"), toggleComplete);
      e.target.classList.toggle("bg-success");
      e.target.setAttribute("data-id-complete", toggleComplete);
    });

    const todoHeading = document.createElement("div");
    todoHeading.className = "d-flex w-100 justify-content-between";
    const todoHeadingH5 = document.createElement("h5");
    todoHeadingH5.className = "mb-1";
    todoHeadingH5.innerText = todoItem.text;
    const todoHeadingSmall = document.createElement("small");
    todoHeadingSmall.className = "text-body-secondary";
    const todoHeadingSmallDelete = document.createElement("i");
    todoHeadingSmallDelete.setAttribute("data-id", todoItem.id);
    // todoHeadingSmallDelete.className = "fa-regular fa-trash-can";
    todoHeadingSmallDelete.className = "todo-delete bi bi-trash-fill text-danger";
    todoHeadingSmallDelete.style.fontSize = "large";
    todoHeadingSmallDelete.style.cursor = "pointer";
    todoHeadingSmallDelete.style.margin = "15px 0;";
    todoHeadingSmallDelete.addEventListener("click", (event) => {
      if (confirm("Are you sure you want to delete it?")) {
        ipcRenderer.invoke("todo:delete", event.target.getAttribute("data-id"));
        event.target.parentNode.parentNode.parentNode.remove();
        countTodo();
      } else {
        ipcRenderer.invoke("main:close-cancel");
      }
    });
    todoHeadingSmall.appendChild(todoHeadingSmallDelete);
    todoHeading.appendChild(todoHeadingH5);
    todoHeading.appendChild(todoHeadingSmall);

    const todoRowP = document.createElement("p");
    todoRowP.className = "mb-1";
    todoRowP.innerText = "You can mark completed to-do as done by clicking on them.";
    const todoRowSmall = document.createElement("small");
    todoRowSmall.className = "text-body-secondary";
    todoRowSmall.innerText = todoItem.date;

    todoRow.appendChild(todoHeading);
    todoRow.appendChild(todoRowP);
    todoRow.appendChild(todoRowSmall);

    todoListContainer.appendChild(todoRow);

    countTodo();
  };

  const todoValue = document.getElementById("todoValue");
  todoValue.focus();

  const createTodo = (todoItemValue) => {
    ipcRenderer.invoke("todo:create", { ref: "main", text: todoItemValue });
    todoValue.value = "";
    todoValue.focus();
  };

  todoValue.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      createTodo(todoValue.value);
    }
  });

  window.addEventListener("focus", () => {
    todoValue.focus();
  });

  const closeBtn = document.getElementById("closeBtn");
  closeBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to close?")) {
      ipcRenderer.invoke("main:close");
    } else {
      ipcRenderer.invoke("main:close-cancel");
    }
  });

  const addBtn = document.getElementById("addBtn");
  addBtn.addEventListener("click", () => {
    createTodo(todoValue.value);
  });

  ipcRenderer.on("todo:created", (_event, todoItem) => {
    addTodoItem(todoItem);
  });

  ipcRenderer.on("todo:list", (_event, items) => {
    items.forEach((todoItem) => {
      addTodoItem(todoItem);
    });
  });
});
