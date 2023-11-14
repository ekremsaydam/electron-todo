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
    todoHeadingSmallDelete.className = "bi bi-trash-fill text-danger";
    todoHeadingSmallDelete.style.fontSize = "large";
    todoHeadingSmallDelete.style.cursor = "pointer";
    todoHeadingSmallDelete.style.margin = "15px 0;";
    todoHeadingSmallDelete.addEventListener("click", (event) => {
      event.target.parentNode.parentNode.parentNode.remove();
      countTodo();
    });
    todoHeadingSmall.appendChild(todoHeadingSmallDelete);
    todoHeading.appendChild(todoHeadingH5);
    todoHeading.appendChild(todoHeadingSmall);

    const todoRowP = document.createElement("p");
    todoRowP.className = "mb-1";
    todoRowP.innerText = "You can mark completed to-do as done by clicking on them.";
    const todoRowSmall = document.createElement("small");
    todoRowSmall.className = "text-body-secondary";
    todoRowSmall.innerText = todoItem.addedOnDate;

    todoRow.appendChild(todoHeading);
    todoRow.appendChild(todoRowP);
    todoRow.appendChild(todoRowSmall);

    todoListContainer.appendChild(todoRow);

    countTodo();
  };

  const todoValue = document.getElementById("todoValue");
  todoValue.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      ipcRenderer.invoke("todo:create", { ref: "main", text: todoValue.value });
      todoValue.value = "";
      todoValue.focus();
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
    ipcRenderer.invoke("todo:create", { ref: "main", text: todoValue.value });
    todoValue.value = "";
    todoValue.focus();
  });

  ipcRenderer.on("todo:created", (_event, todoItem) => {
    addTodoItem(todoItem);
  });
});
