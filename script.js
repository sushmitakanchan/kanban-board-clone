let rightClickedCard = null;

document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);
function addTask(columnId){
    const input = document.getElementById(`${columnId}-input`);    
    
    const taskText = input.value.trim();
    
    if(taskText === ""){
        return
    }
    
    const taskDate = new Date().toLocaleString();

    const taskElement = createTaskElement(taskText, taskDate)
    document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
    updateTaskCount(columnId)
    saveTasksToLocalStorage(columnId, taskText, taskDate)
    input.value=""
}

// let draggedCard = null; 
function createTaskElement(taskText, taskDate){

    const element = document.createElement('div')
    element.innerHTML = `<span>${taskText}</span><br><small class = "time">${taskDate}</small>`;
    element.classList.add('card')
    element.draggable = true;
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('dragend', dragEnd);
    element.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        rightClickedCard = this;
        showContextMenu(e.pageX, e.pageY);

    })
    return element;

}

const columns = document.querySelectorAll('.columns .tasks');
console.log(columns);

columns.forEach((column)=>{
    column.addEventListener('dragover', dragOver)
});

function dragStart(){
    this.classList.add('dragging')
    // draggedCard = this;
}

function dragEnd(){
    this.classList.remove('dragging');
    ["todo", "inprogress", "done"].forEach((columnId)=>{
        updateTaskCount(columnId)
        updateLocalStorage();
    })
}

function dragOver(e){
    e.preventDefault();
    const draggedCard = document.querySelector(".dragging")
    // this.appendChild(draggedCard)
    const afterElement = getDraggedAfterElement(this, e.pageY)

    if(afterElement === null){
        this.appendChild(draggedCard)
    }else{
        this.insertBefore(draggedCard, afterElement)
    }

}

function getDraggedAfterElement(container, y){
    const draggableElement = [...container.querySelectorAll(".card:not(.dragging)")]
    const result = draggableElement.reduce((closestElementUnderMouse, currentTask)=>{
        const box = currentTask.getBoundingClientRect();
        const offset = y - (box.top + box.height/2);
        if(offset < 0 && offset > closestElementUnderMouse.offset){
            return {offset: offset, element: currentTask}
        }else{
            return closestElementUnderMouse;
        }
    },{offset: Number.NEGATIVE_INFINITY});
    return result.element;
    
}
const contextmenu = document.querySelector(".context-menu")
function showContextMenu(x, y){
    contextmenu.style.left = `${x}px`
    contextmenu.style.top = `${y}px`
    contextmenu.style.display = "block"
}
document.addEventListener('click', ()=>{
        contextmenu.style.display = "none"

})

function editTask(){
    if(rightClickedCard !== null){
        const newTaskText = prompt("Edit task - ", rightClickedCard.textContent);
        if(newTaskText !== ""){
            rightClickedCard.textContent = newTaskText;
            updateLocalStorage();
        }
    }
}

function deleteTask(){
    if(rightClickedCard !== null){
        const columnId = rightClickedCard.parentElement.id.replace("-tasks", "")
        rightClickedCard.remove();

        updateLocalStorage();
        updateTaskCount(columnId);
    }
}

function updateTaskCount(columnId){
    let count = document.querySelectorAll(`#${columnId}-tasks .card` ).length;
    document.getElementById(`${columnId}-count`).textContent = count;
}

function saveTasksToLocalStorage(columnId, taskText, taskDate){
    const tasks = JSON.parse(localStorage.getItem(columnId)) || []
    tasks.push({text:taskText, date:taskDate});
    localStorage.setItem(columnId, JSON.stringify(tasks));
}
function loadTasksFromLocalStorage(){
    ["todo", "inprogress", "done"].forEach((columnId)=>{
        const tasks = JSON.parse(localStorage.getItem(columnId)) || []
        tasks.forEach(({text, date})=>{
            const taskElement = createTaskElement(text, date)
            document.getElementById(`${columnId}-tasks`).appendChild(taskElement)
        });
        updateTaskCount(columnId);
    })
}
function updateLocalStorage(){
    ["todo", "inprogress", "done"].forEach((columnId)=>{
        const tasks = [];
        document.querySelectorAll(`#${columnId}-tasks .card`).forEach((card)=>{
            const taskText = card.querySelector("span").textContent;
            const taskDate = card.querySelector("small").textContent;
            tasks.push({text: taskText, date: taskDate})
        })
        localStorage.setItem(columnId, JSON.stringify(tasks))
    })
}