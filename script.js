class TodoApp {
    constructor() {
        this.apiEndpoint = 'https://script.google.com/macros/s/AKfycbzX2iIo9Srl51-f8XXWPsEvBYt4Lp50nP5J3Ii4RABvqLp9YzH-n6ELow0yLqJixjg/exec';
        this.users = {
            diana: { todos: [] },
            aman: { todos: [] }
        };
        this.init();
    }

    init() {
        this.setDefaultDate();
        this.bindEvents();
        this.loadFromAPI();
    }

    // Fungsi Kunci: Menghubungkan logika 'aman' ke ID HTML 'Said'
    getSuffix(user) {
        return user === 'aman' ? 'Aman' : 'Diana';
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        ['diana', 'aman'].forEach(user => {
            const el = document.getElementById(`todoDate${this.getSuffix(user)}`);
            if (el) el.value = today;
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadFromAPI() {
        try {
            const response = await fetch(`${this.apiEndpoint}?method=GET`);
            const todos = await response.json();
            
            this.users.diana.todos = todos.filter(t => t.user === 'diana');
            this.users.aman.todos = todos.filter(t => t.user === 'aman');
            this.renderAll();
        } catch (error) {
            console.error('API Error:', error);
            this.users.diana.todos = JSON.parse(localStorage.getItem('todos_diana') || '[]');
            this.users.aman.todos = JSON.parse(localStorage.getItem('todos_aman') || '[]');
            this.renderAll();
        }
    }

    async saveToAPI(todo, method = 'POST') {
    try {
        // Kita paksa semua request lewat POST agar tidak kena 405
        // Method asli (PUT/DELETE) kita selipkan di URL parameter
        const url = `${this.apiEndpoint}?method=${method}&id=${todo.id || ''}`;
        
        const options = {
            method: 'POST', // WAJIB POST untuk Apps Script
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Gunakan text/plain untuk menghindari CORS preflight
            },
            body: JSON.stringify(todo)
        };

        const response = await fetch(url, options);
        const result = await response.json();
        
        console.log(`API ${method} Response:`, result);
        return result;
    } catch (error) {
        console.error('❌ API Error:', error);
        return { success: false };
    }
}

    saveToLocalStorage(user) {
        localStorage.setItem(`todos_${user}`, JSON.stringify(this.users[user].todos));
    }

    bindEvents() {
        ['diana', 'aman'].forEach(user => {
            const suffix = this.getSuffix(user);
            
            const addBtn = document.getElementById(`addBtn${suffix}`);
            const input = document.getElementById(`todoInput${suffix}`);
            const clearBtn = document.getElementById(`clearCompletedBtn${suffix}`);

            // DEBUGGING: Cek di console apakah elemen ditemukan
            if (!addBtn) console.warn(`Tombol addBtn${suffix} tidak ditemukan di HTML!`);

            if (addBtn) {
                addBtn.onclick = () => {
                    console.log(`Tombol tambah untuk ${user} diklik!`); // Cek apakah muncul di console
                    this.addTodo(user);
                };
            }
            if (input) {
                input.onkeypress = (e) => {
                    if (e.key === 'Enter') this.addTodo(user);
                };
            }
            if (clearBtn) {
                clearBtn.onclick = () => this.clearCompleted(user);
            }
        });
    }

    async addTodo(user) {
        const suffix = this.getSuffix(user);
        const input = document.getElementById(`todoInput${suffix}`);
        const dateInput = document.getElementById(`todoDate${suffix}`);
        
        if (!input || !input.value.trim()) {
            console.warn("Input kosong atau elemen tidak ditemukan");
            return;
        }

        const newTodo = {
            id: Date.now().toString(),
            user: user,
            text: input.value.trim(),
            completed: false,
            created_at: new Date().toISOString(),
            due_date: dateInput ? dateInput.value : ''
        };

        // Update UI secara instan agar terasa cepat
        this.users[user].todos.unshift(newTodo);
        this.render(user);
        input.value = '';
        
        // Baru kirim ke API
        await this.saveToAPI(newTodo, 'POST');
    }

//     createTodoHTML(todo, user) {
//     const isCompleted = todo.completed;
    
//     // Poin 4: Coret text jika selesai
//     const textClass = isCompleted ? 'line-through text-gray-400' : 'text-gray-800 font-medium';
//     const checkedAttribute = isCompleted ? 'checked' : '';
    
//     // Poin 1, 2, 3: Format Tanggal, Hari Tersisa, dan Status
//     let deadlineFormatted = '';
//     let daysLeftText = '';
//     let statusBadge = '';
//     let badgeColor = '';

//     if (todo.due_date) {
//         const due = new Date(todo.due_date);
//         // Format enak dilihat (Misal: 16 April 2026)
//         deadlineFormatted = due.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const dueMid = new Date(due);
//         dueMid.setHours(0, 0, 0, 0);

//         const diffTime = dueMid.getTime() - today.getTime();
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//         if (diffDays > 0) {
//             daysLeftText = `${diffDays} hari lagi`;
//         } else if (diffDays === 0) {
//             daysLeftText = `Hari Ini`;
//         } else {
//             daysLeftText = `Terlewat ${Math.abs(diffDays)} hari`;
//         }

//         if (isCompleted) {
//             statusBadge = 'Selesai';
//             badgeColor = 'bg-green-100 text-green-700';
//         } else if (diffDays < 0) {
//             statusBadge = 'Overdue';
//             badgeColor = 'bg-red-100 text-red-700';
//         } else if (diffDays === 0) {
//             statusBadge = 'Deadline Hari Ini';
//             badgeColor = 'bg-orange-100 text-orange-700';
//         } else {
//             statusBadge = 'On Going';
//             badgeColor = 'bg-blue-100 text-blue-700';
//         }
//     } else {
//         deadlineFormatted = 'Tanpa Deadline';
//         if (isCompleted) {
//             statusBadge = 'Selesai';
//             badgeColor = 'bg-green-100 text-green-700';
//         } else {
//             statusBadge = 'On Going';
//             badgeColor = 'bg-gray-100 text-gray-700';
//         }
//     }

//     return `
//         <div class="flex flex-col p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 mb-3">
//             <div class="flex items-start justify-between gap-3">
//                 <div class="flex items-start flex-1 gap-3">
//                     <input type="checkbox" 
//                         ${checkedAttribute}
//                         onchange="app.toggleTodo('${todo.id}', '${user}')"
//                         class="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-transform hover:scale-110">
                    
//                     <div class="flex-1 min-w-0">
//                         <p id="todo-text-${todo.id}" 
//                            contenteditable="${!isCompleted}"
//                            class="text-base ${textClass} outline-none focus:bg-yellow-50 px-1 rounded transition-colors break-words"
//                            onblur="app.saveInlineEdit('${todo.id}', '${user}', this.innerText)"
//                            onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}">
//                             ${this.escapeHtml(todo.text)}
//                         </p>
                        
//                         <div class="flex flex-wrap gap-2 mt-2">
//                             ${todo.due_date ? `<span class="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded"><i class="far fa-calendar-alt mr-1"></i> ${deadlineFormatted}</span>` : ''}
//                             ${daysLeftText ? `<span class="inline-flex items-center text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600"><i class="fas fa-hourglass-half mr-1"></i> ${daysLeftText}</span>` : ''}
//                             <span class="inline-flex items-center text-xs font-semibold px-2 py-1 rounded ${badgeColor}">${statusBadge}</span>
//                         </div>
//                     </div>
//                 </div>
                
//                 <div class="flex items-center gap-2 ml-2">
//                     <button onclick="app.editTodoInline('${todo.id}', '${user}')" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
//                         <i class="fas fa-edit"></i>
//                     </button>
//                     <button onclick="app.deleteTodo('${todo.id}', '${user}')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
//                         <i class="fas fa-trash-alt"></i>
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// createTodoHTML(todo, user) {
//     const isCompleted = todo.completed;
    
//     // Logika Coretan: Jika selesai, kasih class line-through dan warna abu-abu
//     const textStyle = isCompleted ? 'line-through text-gray-400' : 'text-gray-800 font-medium';
    
//     // Status & Badge Logic
//     let statusBadge = '';
//     let badgeColor = '';
//     if (isCompleted) {
//         statusBadge = 'Selesai';
//         badgeColor = 'bg-green-100 text-green-700';
//     } else {
//         statusBadge = 'On Going';
//         badgeColor = 'bg-blue-100 text-blue-700';
//     }

//     return `
//         <div class="flex flex-col p-4 bg-white rounded-xl border border-gray-200 shadow-sm mb-3">
//             <div class="flex items-start justify-between gap-3">
//                 <div class="flex items-start flex-1 gap-3">
//                     <input type="checkbox" 
//                         ${isCompleted ? 'checked' : ''} 
//                         onchange="app.toggleTodo('${todo.id}', '${user}')"
//                         class="mt-1 w-5 h-5 rounded cursor-pointer">
                    
//                     <div class="flex-1 min-w-0">
//                         <p id="todo-text-${todo.id}" 
//                            contenteditable="${!isCompleted}"
//                            class="text-base transition-all ${textStyle} outline-none"
//                            onblur="app.saveInlineEdit('${todo.id}', '${user}', this.innerText)">
//                             ${this.escapeHtml(todo.text)}
//                         </p>
                        
//                         <div class="flex gap-2 mt-2">
//                             <span class="inline-flex items-center text-xs font-semibold px-2 py-1 rounded ${badgeColor}">
//                                 ${statusBadge}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
                
//                 <div class="flex items-center gap-2">
//                     <button onclick="app.deleteTodo('${todo.id}', '${user}')" 
//                             class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//                         <i class="fas fa-trash-alt"></i>
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `;
// }

createTodoHTML(todo, user) {
    const isCompleted = todo.completed;
    const textStyle = isCompleted ? 'line-through text-gray-400' : 'text-gray-800 font-medium';
    
    let deadlineLabel = '';
    let daysLeftLabel = '';
    let statusBadge = '';
    let badgeColor = 'bg-gray-100 text-gray-700';

    if (todo.due_date) {
        const due = new Date(todo.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueMid = new Date(due);
        dueMid.setHours(0, 0, 0, 0);

        deadlineLabel = due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

        const diffTime = dueMid.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            daysLeftLabel = `<span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-blue-100">${diffDays} Hari Lagi</span>`;
        } else if (diffDays === 0) {
            daysLeftLabel = `<span class="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-orange-200">Hari Ini!</span>`;
        } else {
            daysLeftLabel = `<span class="bg-red-50 text-red-500 px-2 py-0.5 rounded-md text-[10px] font-bold border border-red-100">Terlewat ${Math.abs(diffDays)} Hari</span>`;
        }

        if (isCompleted) {
            statusBadge = 'Selesai';
            badgeColor = 'bg-green-500 text-white';
        } else if (diffDays < 0) {
            statusBadge = 'Overdue';
            badgeColor = 'bg-red-600 text-white animate-pulse';
        } else if (diffDays === 0) {
            statusBadge = 'Deadline';
            badgeColor = 'bg-orange-500 text-white';
        } else {
            statusBadge = 'On Going';
            badgeColor = 'bg-indigo-500 text-white';
        }
    } else {
        deadlineLabel = 'Tanpa Deadline';
        statusBadge = isCompleted ? 'Selesai' : 'No Target';
        badgeColor = isCompleted ? 'bg-green-500 text-white' : 'bg-gray-400 text-white';
    }

    return `
        <div class="flex flex-col p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 mb-4 relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}"></div>
            
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-start flex-1 gap-3 pl-1">
                    <input type="checkbox" 
                        ${isCompleted ? 'checked' : ''} 
                        onchange="app.toggleTodo('${todo.id}', '${user}')"
                        class="mt-1.5 w-5 h-5 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-transform hover:scale-110">
                    
                    <div class="flex-1 min-w-0">
                        <p id="todo-text-${todo.id}" 
                           contenteditable="${!isCompleted}"
                           class="text-base ${textStyle} outline-none break-words leading-tight"
                           onblur="app.saveInlineEdit('${todo.id}', '${user}', this.innerText)">
                            ${this.escapeHtml(todo.text)}
                        </p>
                        
                        <div class="flex flex-wrap items-center gap-2 mt-3">
                            <span class="text-gray-500 text-[11px] font-medium flex items-center bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                <i class="far fa-calendar-alt mr-1.5 text-gray-400"></i> ${deadlineLabel}
                            </span>

                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}">
                                ${statusBadge}
                            </span>
                            
                            ${!isCompleted ? daysLeftLabel : ''}
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-1">
                    <button onclick="app.editTodoInline('${todo.id}', '${user}')" 
                            class="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button onclick="app.deleteTodo('${todo.id}', '${user}')" 
                            class="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <i class="fas fa-trash-alt text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}


async toggleTodo(todoId, user) {
    // Pastikan ID dicari sebagai string untuk kecocokan database
    const todo = this.users[user].todos.find(t => t.id.toString() === todoId.toString());
    
    if (todo) {
        todo.completed = !todo.completed; // Balikkan status
        
        // RE-RENDER INSTAN
        this.render(user); 
        this.saveToLocalStorage(user);

        // Kirim ke API dengan metode POST tunneling
        try {
            await this.saveToAPI(todo, 'PUT');
        } catch (error) {
            console.error("Gagal sinkron status:", error);
            // Optional: kembalikan status jika benar-benar gagal koneksi
        }
    }
}
    async deleteTodo(id, user) {
    console.log(`Deleting todo ${id} for user ${user}`);
    
    // Pastikan kita mengakses array yang benar
    if (!this.users[user] || !this.users[user].todos) {
        console.error(`User ${user} data not found in local memory`);
        return;
    }

    // Gunakan == (dua sama dengan) agar "123" dianggap sama dengan 123
    // Atau paksa keduanya ke String untuk perbandingan yang pasti
    const todoToDelete = this.users[user].todos.find(t => String(t.id) === String(id));

    if (todoToDelete) {
        console.log('Todo found, proceeding to delete:', todoToDelete);
        
        // 1. Hapus dari memori lokal (Optimistic UI)
        this.users[user].todos = this.users[user].todos.filter(t => String(t.id) !== String(id));
        
        // Update UI langsung
        this.render(user);
        this.saveToLocalStorage(user); // Jangan lupa save state lokal jika pakai localStorage

        // 2. Kirim ke API
        try {
            // Gunakan POST tunneling seperti yang kita bahas sebelumnya
            await this.saveToAPI({ id: String(id), user: user }, 'DELETE');
            console.log('Todo deleted successfully from spreadsheet');
        } catch (error) {
            console.error('Failed to delete from API:', error);
            // Revert jika gagal
            this.users[user].todos.push(todoToDelete);
            this.render(user);
        }
    } else {
        // Debugging: Tampilkan isi todos yang ada saat ini
        console.error('Todo not found for deletion:', id);
        console.log('Available IDs in local memory:', this.users[user].todos.map(t => t.id));
    }
}

    render(user) {
    const suffix = this.getSuffix(user);
    const list = document.getElementById(`todoList${suffix}`);
    const empty = document.getElementById(`emptyState${suffix}`);
    let todos = [...this.users[user].todos];
    
    // Auto sort by deadline (paling cepat dulu)
    todos.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
    });
    
    if (!list || !empty) return;

    empty.style.display = todos.length ? 'none' : 'block';
    list.innerHTML = todos.map(todo => this.createTodoHTML(todo, user)).join('');

    // --- UPDATE STATS & TOMBOL HAPUS ---
    const totalEl = document.getElementById(`totalCount${suffix}`);
    const compEl = document.getElementById(`completedCount${suffix}`);
    const activeEl = document.getElementById(`activeCount${suffix}`);
    const clearBtn = document.getElementById(`clearCompletedBtn${suffix}`);

    const completedTodos = todos.filter(t => t.completed);

    if (totalEl) totalEl.textContent = todos.length;
    if (compEl) compEl.textContent = completedTodos.length;
    if (activeEl) activeEl.textContent = todos.filter(t => !t.completed).length;
    
    // Jika ada yang selesai, tampilkan tombol Hapus. Jika tidak, sembunyikan.
    if (clearBtn) {
        if (completedTodos.length > 0) {
            clearBtn.classList.remove('hidden');
            clearBtn.style.display = 'block'; // Jaga-jaga jika kamu tidak pakai class hidden Tailwind
        } else {
            clearBtn.classList.add('hidden');
            clearBtn.style.display = 'none';
        }
    }
}

    renderAll() {
        this.render('diana');
        this.render('aman');
    }

    
    async clearCompleted(user) {
    // Cari mana saja yang sudah selesai
    const completedTodos = this.users[user].todos.filter(t => t.completed);
    
    if (completedTodos.length === 0) return;

    // 1. Hapus dari UI langsung biar terasa cepat
    this.users[user].todos = this.users[user].todos.filter(t => !t.completed);
    this.render(user);

    // 2. Looping untuk menghapus data di Spreadsheet satu per satu
    for (const todo of completedTodos) {
        try {
            await this.saveToAPI({ id: todo.id, user: user }, 'DELETE');
            console.log(`Todo ${todo.id} berhasil dihapus dari database`);
        } catch (error) {
            console.error(`Gagal menghapus todo ${todo.id} dari database`, error);
        }
    }
}

    // Method untuk inline edit
    async saveInlineEdit(id, user, newText) {
    // 1. Cari data di memori lokal
    const todo = this.users[user].todos.find(t => String(t.id) === String(id));
    
    // Jika teks tidak berubah, tidak perlu kirim ke API
    if (!todo || todo.text === newText) return;

    const oldText = todo.text; // Simpan teks lama untuk backup jika gagal
    todo.text = newText;
    todo.updated_at = new Date().toISOString();

    console.log(`Updating todo ${id} to: ${newText}`);

    try {
        // 2. Kirim ke API dengan metode PUT (via POST tunneling)
        const result = await this.saveToAPI(todo, 'PUT');
        
        if (result.success) {
            console.log('Update spreadsheet berhasil');
            this.render(user); // Refresh UI untuk update label status jika perlu
        } else {
            throw new Error("Gagal update di server");
        }
    } catch (error) {
        console.error('Update gagal:', error);
        alert('Gagal menyimpan perubahan. Teks akan dikembalikan.');
        todo.text = oldText; // Kembalikan teks asli
        this.render(user);
    }
}

    // Method untuk edit inline dengan button
    editTodoInline(id, user) {
    const textElement = document.getElementById(`todo-text-${id}`);
    if (textElement) {
        textElement.focus();
        // Pindahkan kursor ke akhir teks
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(textElement);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

    // Method untuk sorting by deadline
    sortTodosByDeadline(user) {
        this.users[user].todos.sort((a, b) => {
            // Jika tidak ada deadline, anggap paling akhir
            if (!a.due_date && !b.due_date) return 0;
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            
            // Sort by deadline (paling cepat dulu)
            return new Date(a.due_date) - new Date(b.due_date);
        });
        
        this.render(user);
    }
}

// Inisialisasi
const app = new TodoApp();