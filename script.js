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
        // Diana's events
        document.getElementById('addBtnDiana').addEventListener('click', () => this.addTodo('diana'));
        document.getElementById('todoInputDiana').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo('diana');
        });

        // Aman's events
        document.getElementById('addBtnAman').addEventListener('click', () => this.addTodo('aman'));
        document.getElementById('todoInputAman').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo('aman');
        });

        // Diana's filter buttons
        document.querySelectorAll('.filter-btn-diana').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter('diana', e.target.dataset.filter));
        });

        // Diana's date filter buttons
        document.querySelectorAll('.date-filter-btn-diana').forEach(btn => {
            btn.addEventListener('click', (e) => this.setDateFilter('diana', e.target.dataset.dateFilter));
        });

        // Diana's sort buttons
        document.querySelectorAll('.sort-btn-diana').forEach(btn => {
            btn.addEventListener('click', (e) => this.setSort('diana', e.target.dataset.sort));
        });

        // Aman's filter buttons
        document.querySelectorAll('.filter-btn-aman').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter('aman', e.target.dataset.filter));
        });

        // Aman's date filter buttons
        document.querySelectorAll('.date-filter-btn-aman').forEach(btn => {
            btn.addEventListener('click', (e) => this.setDateFilter('aman', e.target.dataset.dateFilter));
        });

        // Aman's sort buttons
        document.querySelectorAll('.sort-btn-aman').forEach(btn => {
            btn.addEventListener('click', (e) => this.setSort('aman', e.target.dataset.sort));
        });

        // Clear completed buttons
        document.getElementById('clearCompletedBtnDiana').addEventListener('click', () => this.clearCompleted('diana'));
        document.getElementById('clearCompletedBtnAman').addEventListener('click', () => this.clearCompleted('aman'));

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => this.importData());
        document.getElementById('importFile').addEventListener('change', (e) => this.handleFileImport(e));
    }

    addTodo(user) {
        const input = document.getElementById(`todoInput${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const dateInput = document.getElementById(`todoDate${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const text = input.value.trim();
        
        if (!text) {
            this.showError(`Silakan masukkan tugas ${user} terlebih dahulu`);
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: dateInput.value || null
        };

        this.users[user].todos.unshift(todo);
        this.saveTodos(user);
        this.render(user);
        this.updateStatistics(user);
        
        input.value = '';
        input.focus();
        
        this.showSuccess(`Tugas ${user} berhasil ditambahkan`);
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

    setFilter(user, filter) {
        this.users[user].currentFilter = filter;
        
        // Update button styles
        document.querySelectorAll(`.filter-btn-${user}`).forEach(btn => {
            btn.classList.remove('active', 'bg-gradient-to-r', 'from-pink-500', 'to-purple-500', 'from-blue-500', 'to-indigo-500', 'text-white', 'shadow-md');
            btn.classList.add('bg-white/80', 'text-gray-700', 'hover:bg-white/90', 'shadow-sm');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"][data-user="${user}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-white/80', 'text-gray-700', 'hover:bg-white/90', 'shadow-sm');
            if (user === 'diana') {
                activeBtn.classList.add('bg-gradient-to-r', 'from-pink-500', 'to-purple-500', 'text-white', 'shadow-md');
            } else {
                activeBtn.classList.add('bg-gradient-to-r', 'from-blue-500', 'to-indigo-500', 'text-white', 'shadow-md');
            }
        }
        
        this.render(user);
    }

    setDateFilter(user, dateFilter) {
        this.users[user].currentDateFilter = dateFilter;
        
        // Update button styles
        document.querySelectorAll(`.date-filter-btn-${user}`).forEach(btn => {
            btn.classList.remove('active', 'bg-pink-100', 'text-pink-700', 'bg-blue-100', 'text-blue-700');
            btn.classList.add('bg-white/80', 'text-gray-700', 'hover:bg-white/90');
        });
        
        const activeBtn = document.querySelector(`[data-date-filter="${dateFilter}"][data-user="${user}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-white/80', 'text-gray-700', 'hover:bg-white/90');
            if (user === 'diana') {
                activeBtn.classList.add('bg-pink-100', 'text-pink-700');
            } else {
                activeBtn.classList.add('bg-blue-100', 'text-blue-700');
            }
        }
        
        this.render(user);
    }

    setSort(user, sort) {
        this.users[user].currentSort = sort;
        
        // Update button styles
        document.querySelectorAll(`.sort-btn-${user}`).forEach(btn => {
            btn.classList.remove('bg-indigo-600', 'text-white');
            btn.classList.add('bg-white/80', 'text-gray-700', 'hover:bg-white/90');
        });
        
        const activeBtn = document.querySelector(`[data-sort="${sort}"][data-user="${user}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-white/80', 'text-gray-700', 'hover:bg-white/90');
            activeBtn.classList.add('bg-indigo-600', 'text-white');
        }
        
        this.render(user);
    }

    getFilteredTodos(user) {
        let filtered = this.users[user].todos;
        
        // Apply status filter
        switch (this.users[user].currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
        }
        
        // Apply date filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (this.users[user].currentDateFilter) {
            case 'today':
                filtered = filtered.filter(t => {
                    if (!t.dueDate) return false;
                    const dueDate = new Date(t.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    return dueDate.getTime() === today.getTime();
                });
                break;
            case 'overdue':
                filtered = filtered.filter(t => {
                    if (!t.dueDate || t.completed) return false;
                    const dueDate = new Date(t.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    return dueDate.getTime() < today.getTime();
                });
                break;
            case 'upcoming':
                filtered = filtered.filter(t => {
                    if (!t.dueDate || t.completed) return false;
                    const dueDate = new Date(t.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    return dueDate.getTime() > today.getTime();
                });
                break;
        }
        
        // Apply sorting
        switch (this.users[user].currentSort) {
            case 'date-asc':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'date-desc':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'deadline':
                filtered.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
        }
        
        return filtered;
    }

    render(user) {
        const todoList = document.getElementById(`todoList${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const emptyState = document.getElementById(`emptyState${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const filteredTodos = this.getFilteredTodos(user);
        
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
        const hasCompleted = this.users[user].todos.some(t => t.completed);
        clearBtn.style.display = hasCompleted ? 'inline-block' : 'none';
    }

    renderAll() {
        this.render('diana');
        this.render('aman');
    }

    updateStatistics(user) {
        const totalCount = document.getElementById(`totalCount${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const completedCount = document.getElementById(`completedCount${user.charAt(0).toUpperCase() + user.slice(1)}`);
        const activeCount = document.getElementById(`activeCount${user.charAt(0).toUpperCase() + user.slice(1)}`);
        
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

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showError('Tidak ada tugas yang selesai');
            return;
        }

        if (confirm(`Hapus ${completedCount} tugas yang selesai?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
            this.updateStatistics();
            this.showSuccess(`${completedCount} tugas berhasil dihapus`);
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const clearBtn = document.getElementById('clearCompletedBtn');
        
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.style.display = 'block';
            
            // Update empty state message based on filter
            const emptyMessage = emptyState.querySelector('p');
            const emptySubMessage = emptyState.querySelector('p:last-child');
            
            switch (this.currentFilter) {
                case 'active':
                    emptyMessage.textContent = 'Tidak ada tugas aktif';
                    emptySubMessage.textContent = 'Semua tugas telah selesai';
                    break;
                case 'completed':
                    emptyMessage.textContent = 'Tidak ada tugas yang selesai';
                    emptySubMessage.textContent = 'Selesaikan beberapa tugas terlebih dahulu';
                    break;
                default:
                    emptyMessage.textContent = 'Belum ada tugas';
                    emptySubMessage.textContent = 'Tambahkan tugas baru untuk memulai';
            }
        } else {
            emptyState.style.display = 'none';
            todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
            
            // Add event listeners to todo items
            todoList.querySelectorAll('.todo-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.toggleTodo(parseInt(e.target.dataset.id));
                });
            });
            
            todoList.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.editTodo(parseInt(e.target.dataset.id));
                });
            });
            
            todoList.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.deleteTodo(parseInt(e.target.dataset.id));
                });
            });
        }
        
        // Show/hide clear completed button
        const hasCompleted = this.todos.some(t => t.completed);
        clearBtn.style.display = hasCompleted ? 'inline-block' : 'none';
    }

    createTodoHTML(todo, user) {
        const createdDate = new Date(todo.createdAt);
        const formattedCreatedDate = createdDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
        
        let dueDateHTML = '';
        if (todo.dueDate) {
            const dueDate = new Date(todo.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            
            const formattedDueDate = dueDate.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });
            
            let dateClass = 'text-gray-500';
            let dateIcon = 'fa-calendar';
            
            if (dueDate.getTime() < today.getTime() && !todo.completed) {
                if (user === 'diana') {
                    dateClass = 'text-red-600 font-semibold';
                } else {
                    dateClass = 'text-red-600 font-semibold';
                }
                dateIcon = 'fa-exclamation-triangle';
            } else if (dueDate.getTime() === today.getTime()) {
                if (user === 'diana') {
                    dateClass = 'text-orange-600 font-semibold';
                } else {
                    dateClass = 'text-orange-600 font-semibold';
                }
                dateIcon = 'fa-calendar-day';
            }
            
            dueDateHTML = `
                <p class="text-xs ${dateClass} mt-1">
                    <i class="fas ${dateIcon} mr-1"></i>
                    <span class="hidden sm:inline">Deadline:</span>
                    <span class="sm:hidden">DL:</span>
                    ${formattedDueDate}
                </p>
            `;
        }
        
        // User-specific styling
        let bgClass = user === 'diana' ? 'bg-pink-50' : 'bg-blue-50';
        let borderClass = user === 'diana' ? 'border-pink-200' : 'border-blue-200';
        let hoverClass = user === 'diana' ? 'hover:bg-pink-100' : 'hover:bg-blue-100';
        let editBtnClass = user === 'diana' ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200';
        let deleteBtnClass = user === 'diana' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-red-100 text-red-600 hover:bg-red-200';
        
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
                    ${dueDateHTML}
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

    updateStatistics() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('activeCount').textContent = active;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-down z-50`;
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease-out';
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    exportData() {
        if (this.todos.length === 0) {
            this.showError('Tidak ada data untuk diexport');
            return;
        }

        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            todos: this.todos,
            statistics: {
                total: this.todos.length,
                completed: this.todos.filter(t => t.completed).length,
                active: this.todos.filter(t => !t.completed).length
            }
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showSuccess(`Data berhasil diexport: ${this.todos.length} tugas`);
    }

    importData() {
        document.getElementById('importFile').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            this.showError('File harus berformat JSON');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.todos || !Array.isArray(data.todos)) {
                    this.showError('Format file tidak valid');
                    return;
                }

                // Validate each todo item
                const validTodos = data.todos.filter(todo => {
                    return todo.id && todo.text && typeof todo.completed === 'boolean';
                });

                if (validTodos.length === 0) {
                    this.showError('Tidak ada data tugas yang valid dalam file');
                    return;
                }

                // Ask for confirmation
                const importCount = validTodos.length;
                const currentCount = this.todos.length;
                
                const action = currentCount > 0 ? 'gabungkan dengan' : 'timpa';
                if (confirm(`Import ${importCount} tugas dan ${action} data existing (${currentCount} tugas)?`)) {
                    this.todos = validTodos;
                    this.saveTodos();
                    this.render();
                    this.updateStatistics();
                    this.showSuccess(`Berhasil import ${importCount} tugas`);
                }
                
            } catch (error) {
                this.showError('Gagal membaca file JSON');
                console.error('Import error:', error);
            }
        };

        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    setDefaultDate() {
        const dateInput = document.getElementById('todoDate');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
