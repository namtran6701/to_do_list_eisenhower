document.addEventListener("DOMContentLoaded", function() {
    const todoInput = document.querySelector(".todo-input");
    const urgencySelect = document.querySelector("#urgency-select");
    const importanceSelect = document.querySelector("#importance-select");
    const todoForm = document.querySelector("#task-form");
    // Display the current date
    const currentDateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    currentDateElement.textContent = today.toLocaleDateString('en-US', options);

    // Retrieve and display todos from local storage
    getLocalTodos();

    // Form submission event listener
    todoForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const taskValue = todoInput.value.trim();
        if (!taskValue) {
            alert('Please enter a task!');
            return;
        }
        const todoObject = {
            text: taskValue,
            urgency: urgencySelect.value,
            importance: importanceSelect.value,
            completed: false
        };
        createTodoElement(todoObject);
        saveLocalTodos(todoObject);
        todoInput.value = "";
        positionLabels(); // Position labels after adding a task
    });

    // Event delegation for task completion and removal
    document.querySelector('.matrix-container').addEventListener('click', function(event) {
        if (event.target.classList.contains('complete-btn')) {
            toggleCompletion(event.target.parentElement);
        } else if (event.target.classList.contains('trash-btn')) {
            const todo = event.target.parentElement;
            // Confirm before removal
            if (confirm('Are you sure you want to delete this task?')) {
                showToastMessage('Task deleted successfully.'); // Show information message
                removeLocalTodos(todo);
                todo.remove();
                positionLabels(); // Position labels after removing a task
            }
        }
    });

    // Function to create a new todo element in the DOM
    function createTodoElement({ text, urgency, importance }) {
        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");
        todoDiv.dataset.quadrant = determineQuadrant(urgency, importance);

        const newTodo = `<li class="todo-item">${text}</li>
                         <button class="complete-btn"><i class="fas fa-check-circle"></i></button>
                         <button class="trash-btn"><i class="fas fa-trash"></i></button>`;

        todoDiv.innerHTML = newTodo;
        const quadrantList = document.querySelector(`#${todoDiv.dataset.quadrant}`);
        quadrantList.appendChild(todoDiv);
    }

    // Function to get todos from local storage
    function getLocalTodos() {
        let todos = JSON.parse(localStorage.getItem("todos") || "[]");
        todos.forEach(createTodoElement);
        positionLabels(); // Position labels after retrieving tasks
    }

    // Function to save a new todo to local storage
    function saveLocalTodos(todoObject) {
        let todos = JSON.parse(localStorage.getItem("todos") || "[]");
        todos.push(todoObject);
        localStorage.setItem("todos", JSON.stringify(todos));
    }

    // Function to remove a todo from local storage
    function removeLocalTodos(todo) {
        let todos = JSON.parse(localStorage.getItem("todos"));
        const todoText = todo.querySelector('.todo-item').innerText;
        todos = todos.filter(t => t.text !== todoText);
        localStorage.setItem("todos", JSON.stringify(todos));
    }

    // Function to toggle the completion status of a todo
    function toggleCompletion(todo) {
        todo.classList.toggle("completed");
        // Here you could also update the local storage if needed
    }

    // Function to determine which quadrant the todo belongs to
    function determineQuadrant(urgency, importance) {
        if (urgency === 'urgent' && importance === 'important') {
            return 'quadrant-I';
        } else if (urgency === 'urgent' && importance === 'not-important') {
            return 'quadrant-II';
        } else if (urgency === 'not-urgent' && importance === 'important') {
            return 'quadrant-III';
        } else {
            return 'quadrant-IV';
        }
    }

// Function to reposition labels based on matrix container size
function positionLabels() {
    // Get elements (ensure correct class names match your HTML)
    const matrixContainer = document.querySelector('.matrix-container');
    const importantLabel = document.querySelector('.important-label');
    const notImportantLabel = document.querySelector('.not-important-label');
    const urgentLabel = document.querySelector('.urgent-label');
    const notUrgentLabel = document.querySelector('.not-urgent-label');
  
    // Check for element retrieval (log to console if needed)
    if (!matrixContainer || !importantLabel || !notImportantLabel || !urgentLabel || !notUrgentLabel) {
      console.error("Error: Some elements not found. Check class names and DOM structure.");
      return;
    }
  
    // Calculate dimensions
    const matrixWidth = matrixContainer.offsetWidth;
    const matrixHeight = matrixContainer.offsetHeight;
  
    // Calculate label positions (adjust as needed)
    const labelX1 = matrixWidth * 0.02;
    const labelX2 = matrixWidth * 0.02;
    const labelY1 = -40;
    const labelY2 = matrixHeight + 20;
    const labelY3 = matrixHeight * 0.18;
    const labelY4 = matrixHeight * 0.65;

    // Use requestAnimationFrame for smoother positioning
    requestAnimationFrame(function () {
        importantLabel.style.left = labelX1 + 'px';
        importantLabel.style.top = labelY1 + 'px';
        notImportantLabel.style.left = labelX2 + 'px';
        notImportantLabel.style.top = labelY1 + 'px';
        urgentLabel.style.right = labelX1 + 'px';
        urgentLabel.style.top = labelY3 + 'px';
        notUrgentLabel.style.right = labelX2 + 'px';
        notUrgentLabel.style.top = labelY4 + 'px';
    });
}
    // Function to show an information message
    function showToastMessage(message) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            // Create container for toast messages if it doesn't exist
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toastMessage = document.createElement('div');
        toastMessage.className = 'toast';
        toastMessage.textContent = message;

        toastContainer.appendChild(toastMessage);

        // Automatically remove the toast message after 3 seconds
        setTimeout(() => {
            toastContainer.removeChild(toastMessage);
        }, 3000);
    }

// Debounce function
function debounce(fn, delay) {
    let timeoutID = null;
    return function() {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(function() {
            fn();
        }, delay);
    };
}
   // Debounced version of positionLabels for window load and resize
   const debouncedPositionLabels = debounce(positionLabels, 200);
    // Execute on window load and resize (with debounce)
    window.addEventListener('load', debouncedPositionLabels);
    window.addEventListener('resize', debouncedPositionLabels);
});