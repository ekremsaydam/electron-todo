const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const todoValue = document.getElementById("todoValue");
  todoValue.focus();

  const createTodo = (todoItemValue) => {
    ipcRenderer.invoke("todo:create", { ref: "todo", text: todoItemValue });
  };

  todoValue.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      createTodo(todoValue.value);
    }
  });

  const addBtn = document.getElementById("addBtn");
  addBtn.addEventListener("click", () => {
    createTodo(todoValue.value);
  });

  const cancelBtn = document.getElementById("cancelBtn");
  cancelBtn.addEventListener("click", () => {
    ipcRenderer.invoke("todo:cancel-close");
  });
});
