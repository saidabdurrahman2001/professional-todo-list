class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.currentDateFilter = 'all';
        this.currentSort = 'date-desc';
        this.init();
    }

    init() {
        this.setDefaultDate();
        this.bindEvents();
        this.render();
        this.updateStatistics();
    }

    bindEvents() {
        // Add todo
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Date filter buttons
        document.querySelectorAll('.date-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setDateFilter(e.target.dataset.dateFilter));
        });

        // Sort buttons
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setSort(e.target.dataset.sort));
        });

        // Clear completed
        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => this.importData());
        document.getElementById('importFile').addEventListener('change', (e) => this.handleFileImport(e));
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const dateInput = document.getElementById('todoDate');
        const text = input.value.trim();
        const date = dateInput.value;
        
        if (!text) {
            this.showError('Silakan masukkan tugas terlebih dahulu');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: date || null
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStatistics();
        
        input.value = '';
        dateInput.value = '';
        this.setDefaultDate();
        input.focus();
        
        this.showSuccess('Tugas berhasil ditambahkan');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStatistics();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
        this.updateStatistics();
        this.showSuccess('Tugas berhasil dihapus');
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('Edit tugas:', todo.text);
        if (newText && newText.trim() !== todo.text) {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
            this.showSuccess('Tugas berhasil diperbarui');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update button styles
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-indigo-600', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        activeBtn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        activeBtn.classList.add('active', 'bg-indigo-600', 'text-white');
        
        this.render();
    }

    setDateFilter(dateFilter) {
        this.currentDateFilter = dateFilter;
        
        // Update button styles
        document.querySelectorAll('.date-filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-indigo-600', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        });
        
        const activeBtn = document.querySelector(`[data-date-filter="${dateFilter}"]`);
        activeBtn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        activeBtn.classList.add('active', 'bg-indigo-600', 'text-white');
        
        this.render();
    }

    setSort(sort) {
        this.currentSort = sort;
        
        // Update button styles
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('bg-indigo-600', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        });
        
        const activeBtn = document.querySelector(`[data-sort="${sort}"]`);
        activeBtn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        activeBtn.classList.add('bg-indigo-600', 'text-white');
        
        this.render();
    }

    getFilteredTodos() {
        let filtered = this.todos;
        
        // Apply status filter
        switch (this.currentFilter) {
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
        
        switch (this.currentDateFilter) {
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
        switch (this.currentSort) {
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

    createTodoHTML(todo) {
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
                dateClass = 'text-red-600 font-semibold';
                dateIcon = 'fa-exclamation-triangle';
            } else if (dueDate.getTime() === today.getTime()) {
                dateClass = 'text-orange-600 font-semibold';
                dateIcon = 'fa-calendar-day';
            }
            
            dueDateHTML = `
                <p class="text-xs ${dateClass} mt-1">
                    <i class="fas ${dateIcon} mr-1"></i>Deadline: ${formattedDueDate}
                </p>
            `;
        }
        
        return `
            <div class="todo-item animate-slide-down bg-gray-50 rounded-lg p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors duration-200 group ${todo.completed ? 'opacity-75' : ''}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" 
                    data-id="${todo.id}"
                    ${todo.completed ? 'checked' : ''}
                >
                <div class="flex-1">
                    <p class="${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'} font-medium">
                        ${this.escapeHtml(todo.text)}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                        <i class="far fa-clock mr-1"></i>Dibuat: ${formattedCreatedDate}
                    </p>
                    ${dueDateHTML}
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                        class="edit-btn px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors duration-200 text-sm"
                        data-id="${todo.id}"
                    >
                        <i class="fas fa-edit"></i>
                    </button>
                    <button 
                        class="delete-btn px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors duration-200 text-sm"
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
