document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Modal
    const modal = document.getElementById('task-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const taskForm = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');
    const taskIdInput = document.getElementById('task-id');

    // Tabela e Cards
    const tasksList = document.getElementById('tasks-list');
    const totalTasksCard = document.getElementById('total-tasks');
    const pendingTasksCard = document.getElementById('pending-tasks');
    const completedTasksCard = document.getElementById('completed-tasks');
    const tasksFooter = document.getElementById('tasks-footer');

    // Busca
    const searchInput = document.getElementById('search-input');

    // Relatório por período
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const filterDateBtn = document.getElementById('filter-date-btn');
    const clearFilterBtn = document.getElementById('clear-filter-btn');
    const reportControls = document.querySelector('.report-controls');

    // Carrega tarefas do localStorage ou inicia um array vazio
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Mapeamento de status para classes CSS
    const statusClass = {
        'Pendente': 'pending',
        'Em Andamento': 'in-progress',
        'Concluído': 'completed'
    };

    // Funções do Modal
    const openModal = () => {
        modal.classList.add('show');
    };
    const closeModal = () => {
        modal.classList.remove('show');
        taskForm.reset();
        taskIdInput.value = '';
        modalTitle.textContent = 'Adicionar Nova Tarefa';
    };

    openModalBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Adicionar Nova Tarefa';
        openModal();
    });
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Função para salvar tarefas no localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Função para renderizar (desenhar) as tarefas na tabela
    function renderTasks() {
        tasksList.innerHTML = ''; // Limpa a tabela antes de adicionar as tarefas
        tasksFooter.classList.add('hidden');

        const textFilter = searchInput.value.toLowerCase();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        let filteredTasks = tasks;

        // 1. Filtro por texto
        if (textFilter.length > 0) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(textFilter) ||
                task.responsible.toLowerCase().includes(textFilter)
            );
        }

        // 2. Filtro por data (melhorado)
        if (startDate || endDate) {
            reportControls.classList.add('active');
            filteredTasks = filteredTasks.filter(task => {
                // Compara as datas como strings no formato YYYY-MM-DD, que é seguro e ignora fuso horário.
                const taskDeadline = task.deadline;
                if (startDate && taskDeadline < startDate) {
                    return false;
                }
                if (endDate && taskDeadline > endDate) {
                    return false;
                }
                return true;
            });
        } else {
            reportControls.classList.remove('active');
        }

        if (filteredTasks.length === 0) {
            tasksFooter.classList.remove('hidden');
        }
        filteredTasks.forEach(task => {
            const row = document.createElement('tr');
            // Adiciona um data-id para identificar a tarefa
            row.setAttribute('data-id', task.id);

            // Adiciona uma classe se a tarefa estiver concluída para um futuro efeito visual
            if (task.status === 'Concluído') {
                row.classList.add('completed-task');
            }

            row.innerHTML = `
                <td>${task.title}</td>
                <td>${task.responsible}</td>
                <td>${task.type}</td>
                <td>${new Date(task.deadline).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td><span class="status ${statusClass[task.status]}">${task.status}</span></td>
                <td class="actions">
                    <button class="action-btn complete-btn" title="Marcar como Concluída">
                        <span class="material-icons-sharp">check_circle</span>
                    </button>
                    <button class="action-btn-edit edit-btn" title="Editar Tarefa">
                        <span class="material-icons-sharp">edit</span>
                    </button>
                    <button class="action-btn-delete delete-btn" title="Excluir Tarefa">
                        <span class="material-icons-sharp">delete</span>
                    </button>
                </td>
            `;
            tasksList.appendChild(row);
        });

        // Salva o estado atual e atualiza os cards
        saveTasks();
        updateSummaryCards();
    }

    // Função para atualizar os cards de resumo
    function updateSummaryCards() {
        totalTasksCard.textContent = tasks.length;
        pendingTasksCard.textContent = tasks.filter(t => t.status === 'Pendente').length;
        completedTasksCard.textContent = tasks.filter(t => t.status === 'Concluído').length;
    }

    // Lidar com o envio do formulário
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const id = taskIdInput.value;
        const taskData = {
            title: document.getElementById('task-title').value.trim(),
            responsible: document.getElementById('task-responsible').value.trim(),
            type: document.getElementById('task-type').value.trim(),
            deadline: document.getElementById('task-deadline').value,
            observations: document.getElementById('task-observations').value.trim()
        };

        if (id) {
            // Editando tarefa existente
            const taskIndex = tasks.findIndex(t => t.id == id);
            if (taskIndex > -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
            }
        } else {
            // Criando nova tarefa
            const newTask = {
                ...taskData,
                id: Date.now(), // ID único baseado no tempo atual
                status: 'Pendente' // Novas tarefas começam como pendentes
            };
            tasks.push(newTask); // Adiciona a nova tarefa ao array
        }

        renderTasks(); // Renderiza tudo novamente
        closeModal(); // Fecha o modal
    });

    // Lidar com a busca
    searchInput.addEventListener('input', (e) => {
        renderTasks();
    });

    // Lidar com filtro de data
    // A filtragem agora é automática ao mudar a data
    startDateInput.addEventListener('change', renderTasks);
    endDateInput.addEventListener('change', renderTasks);
    // O botão de filtrar não é mais necessário, mas pode ser mantido por redundância se desejado.
    filterDateBtn.addEventListener('click', renderTasks); // Mantido por segurança
    clearFilterBtn.addEventListener('click', () => {
        startDateInput.value = '';
        endDateInput.value = '';
        renderTasks();
    });

    // Lidar com cliques nos botões de ação (Concluir e Excluir)
    tasksList.addEventListener('click', (e) => {
        const target = e.target;

        // Encontra o botão ou o ícone dentro do botão que foi clicado
        const completeButton = target.closest('.complete-btn');
        const deleteButton = target.closest('.delete-btn');
        const editButton = target.closest('.edit-btn');
        
        if (completeButton) {
            const row = completeButton.closest('tr');
            const taskId = Number(row.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.status = 'Concluído';
                renderTasks();
            }
        }

        if (deleteButton) {
            const row = deleteButton.closest('tr');
            const taskId = Number(row.dataset.id);
            // Filtra o array, mantendo apenas as tarefas que NÃO têm o ID da tarefa a ser excluída
            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
        }

        if (editButton) {
            const row = editButton.closest('tr');
            const taskId = Number(row.dataset.id);
            const taskToEdit = tasks.find(t => t.id === taskId);

            if (taskToEdit) {
                // Preenche o formulário com os dados da tarefa
                document.getElementById('task-title').value = taskToEdit.title;
                document.getElementById('task-responsible').value = taskToEdit.responsible;
                document.getElementById('task-type').value = taskToEdit.type;
                document.getElementById('task-deadline').value = taskToEdit.deadline;
                document.getElementById('task-observations').value = taskToEdit.observations;
                taskIdInput.value = taskToEdit.id;
                modalTitle.textContent = 'Editar Tarefa';
                openModal();
            }
        }
    });

    // Renderização inicial ao carregar a página
    renderTasks();
});