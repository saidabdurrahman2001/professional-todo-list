class TodoApp {
    constructor() {
        // Initialize users data
        this.users = {
            diana: {
                todos: this.loadTodos('diana'),
                currentFilter: 'all',
                currentDateFilter: 'all',
                currentSort: 'date-desc'
            },
            aman: {
                todos: this.loadTodos('aman'),
                currentFilter: 'all',
                currentDateFilter: 'all',
                currentSort: 'date-desc'
            }
        };
        this.init();
    }

    init() {
        this.setDefaultDate();
        this.bindEvents();
        this.renderAll();
        this.updateAllStatistics();
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Diana's events
        const addBtnDiana = document.getElementById('addBtnDiana');
        const todoInputDiana = document.getElementById('todoInputDiana');
        
        console.log('Diana button:', addBtnDiana);
        console.log('Diana input:', todoInputDiana);
        
        if (addBtnDiana) {
            // Test: Add direct click listener
            addBtnDiana.addEventListener('click', function() {
                console.log('Diana button clicked directly!');
                alert('Tombol Diana diklik!');
            });
            
            // Add the actual functionality
            addBtnDiana.addEventListener('click', () => {
                console.log('Diana add button clicked');
                this.addTodo('diana');
            });
        }
        
        if (todoInputDiana) {
            todoInputDiana.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Diana input enter pressed');
                    this.addTodo('diana');
                }
            });
        }

        // Aman's events
        const addBtnAman = document.getElementById('addBtnAman');
        const todoInputAman = document.getElementById('todoInputAman');
        
        console.log('Aman button:', addBtnAman);
        console.log('Aman input:', todoInputAman);
        
        if (addBtnAman) {
            // Test: Add direct click listener
            addBtnAman.addEventListener('click', function() {
                console.log('Aman button clicked directly!');
                alert('Tombol Aman diklik!');
            });
            
            // Add the actual functionality
            addBtnAman.addEventListener('click', () => {
                console.log('Aman add button clicked');
                this.addTodo('aman');
            });
        }
        
        if (todoInputAman) {
            todoInputAman.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Aman input enter pressed');
                    this.addTodo('aman');
                }
            });
        }

        // Clear completed buttons
        const clearBtnDiana = document.getElementById('clearCompletedBtnDiana');
        const clearBtnAman = document.getElementById('clearCompletedBtnAman');
        
        if (clearBtnDiana) {
            clearBtnDiana.addEventListener('click', () => this.clearCompleted('diana'));
        }
        
        if (clearBtnAman) {
            clearBtnAman.addEventListener('click', () => this.clearCompleted('aman'));
        }
    }

    addTodo(user) {
        console.log('addTodo called for user:', user);
        
        const input = document.getElementById(`todoInput${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const dateInput = document.getElementById(`todoDate${user.charAt(0).toUpperCase() + user.slice(1)}`);
        
        console.log('Input element:', input);
        console.log('Date input element:', dateInput);
        
        if (!input) {
            console.error('Input element not found for user:', user);
            return;
        }
        
        const text = input.value.trim();
        console.log('Input text:', text);
        
        if (!text) {
            console.log('Empty text, showing error');
            this.showError(`Silakan masukkan tugas ${user} terlebih dahulu`);
            return;
        }

        console.log('Creating todo object...');
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: dateInput ? dateInput.value : null
        };
        
        console.log('Todo object:', todo);

        console.log('Adding to user todos...');
        this.users[user].todos.unshift(todo);
        console.log('User todos after add:', this.users[user].todos);
        
        this.saveTodos(user);
        console.log('Saved to localStorage');
        
        this.render(user);
        console.log('Rendered');
        
        this.updateStatistics(user);
        console.log('Statistics updated');
        
        input.value = '';
        input.focus();
        
        this.showSuccess(`Tugas ${user} berhasil ditambahkan`);
        console.log('Success message shown');
    }

    toggleTodo(id, user) {
        const todo = this.users[user].todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos(user);
            this.render(user);
            this.updateStatistics(user);
        }
    }

    deleteTodo(id, user) {
        this.users[user].todos = this.users[user].todos.filter(t => t.id !== id);
        this.saveTodos(user);
        this.render(user);
        this.updateStatistics(user);
        this.showSuccess(`Tugas ${user} berhasil dihapus`);
    }

    editTodo(id, user) {
        const todo = this.users[user].todos.find(t => t.id === id);
        if (todo) {
            const newText = prompt('Edit tugas:', todo.text);
            if (newText && newText.trim()) {
                todo.text = newText.trim();
                this.saveTodos(user);
                this.render(user);
                this.showSuccess(`Tugas ${user} berhasil diedit`);
            }
        }
    }

    getFilteredTodos(user) {
        // Simple: return all todos without filtering
        return this.users[user].todos;
    }

    render(user) {
        const todoList = document.getElementById(`todoList${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const emptyState = document.getElementById(`emptyState${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const filteredTodos = this.getFilteredTodos(user);
        
        if (!todoList || !emptyState) {
            console.error('Todo list or empty state element not found for user:', user);
            return;
        }
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo, user)).join('');
            
            // Add event listeners to todo items
            todoList.querySelectorAll('.todo-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.toggleTodo(parseInt(e.target.dataset.id), user);
                });
            });
            
            todoList.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.editTodo(parseInt(e.target.dataset.id), user);
                });
            });
            
            todoList.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.deleteTodo(parseInt(e.target.dataset.id), user);
                });
            });
        }
        
        // Show/hide clear completed button
        const clearBtn = document.getElementById(`clearCompletedBtn${user.charAt(0).toUpperCase() + user.slice(1)}`);
        if (clearBtn) {
            const hasCompleted = this.users[user].todos.some(t => t.completed);
            clearBtn.style.display = hasCompleted ? 'inline-block' : 'none';
        }
    }

    renderAll() {
        this.render('diana');
        this.render('aman');
    }

    updateStatistics(user) {
        const totalCount = document.getElementById(`totalCount${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const completedCount = document.getElementById(`completedCount${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const activeCount = document.getElementById(`activeCount${user.charAt(0).toUpperCase() + user.slice(1)}`);
        
        if (!totalCount || !completedCount || !activeCount) {
            console.error('Statistics elements not found for user:', user);
            return;
        }
        
        const todos = this.users[user].todos;
        totalCount.textContent = todos.length;
        completedCount.textContent = todos.filter(t => t.completed).length;
        activeCount.textContent = todos.filter(t => !t.completed).length;
    }

    updateAllStatistics() {
        this.updateStatistics('diana');
        this.updateStatistics('aman');
    }

    saveTodos(user) {
        localStorage.setItem(`todos_${user}`, JSON.stringify(this.users[user].todos));
    }

    loadTodos(user) {
        const saved = localStorage.getItem(`todos_${user}`);
        return saved ? JSON.parse(saved) : [];
    }

    clearCompleted(user) {
        const completedCount = this.users[user].todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showError(`Tidak ada tugas ${user} yang selesai`);
            return;
        }

        if (confirm(`Hapus ${completedCount} tugas ${user} yang selesai?`)) {
            this.users[user].todos = this.users[user].todos.filter(t => !t.completed);
            this.saveTodos(user);
            this.render(user);
            this.updateStatistics(user);
            this.showSuccess(`Tugas ${user} yang selesai berhasil dihapus`);
        }
    }

    createTodoHTML(todo, user) {
        const createdDate = new Date(todo.createdAt);
        const formattedCreatedDate = createdDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
        
        // User-specific styling
        let bgClass = user === 'diana' ? 'bg-pink-50' : 'bg-blue-50';
        let borderClass = user === 'diana' ? 'border-pink-200' : 'border-blue-200';
        let hoverClass = user === 'diana' ? 'hover:bg-pink-100' : 'hover:bg-blue-100';
        let editBtnClass = user === 'diana' ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200';
        let deleteBtnClass = 'bg-red-100 text-red-600 hover:bg-red-200';
        
        return `
            <div class="todo-item animate-slide-down ${bgClass} rounded-lg p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3 ${hoverClass} transition-colors duration-200 group border ${borderClass} ${todo.completed ? 'opacity-75' : ''}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer mt-0.5 sm:mt-0" 
                    data-id="${todo.id}"
                    ${todo.completed ? 'checked' : ''}
                >
                <div class="flex-1 min-w-0">
                    <p class="${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'} font-medium text-sm sm:text-base break-words">
                        ${this.escapeHtml(todo.text)}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                        <i class="far fa-clock mr-1"></i>
                        <span class="hidden sm:inline">Dibuat:</span>
                        <span class="sm:hidden">+</span>
                        ${formattedCreatedDate}
                    </p>
                </div>
                <div class="flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                    <button 
                        class="edit-btn px-2 py-1 sm:px-3 sm:py-1 ${editBtnClass} rounded transition-colors duration-200 text-xs sm:text-sm"
                        data-id="${todo.id}"
                    >
                        <i class="fas fa-edit"></i>
                    </button>
                    <button 
                        class="delete-btn px-2 py-1 sm:px-3 sm:py-1 ${deleteBtnClass} rounded transition-colors duration-200 text-xs sm:text-sm"
                        data-id="${todo.id}"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    setDefaultDate() {
        const dateInputDiana = document.getElementById('todoDateDiana');
        const dateInputAman = document.getElementById('todoDateAman');
        const today = new Date().toISOString().split('T')[0];
        
        if (dateInputDiana) dateInputDiana.value = today;
        if (dateInputAman) dateInputAman.value = today;
    }

    showError(message) {
        console.log('Error:', message);
    }

    showSuccess(message) {
        console.log('Success:', message);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, waiting for elements...');
    
    // Tunggu sebentar untuk memastikan semua element tersedia
    setTimeout(() => {
        console.log('Initializing TodoApp...');
        const app = new TodoApp();
        console.log('TodoApp initialized:', app);
        console.log('Multi-user To-Do List is ready! Diana & Aman can now add todos.');
    }, 100); // 100ms delay
});
