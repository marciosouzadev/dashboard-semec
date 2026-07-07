document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Modal
    const modal = document.getElementById('task-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const taskForm = document.getElementById('task-form');

    // Tabela e Cards
    const tasksList = document.getElementById('tasks-list');
    const totalTasksCard = document.getElementById('total-tasks');
    const pendingTasksCard = document.getElementById('pending-tasks');
    const completedTasksCard = document.getElementById('completed-tasks');

    // Carrega tarefas do localStorage ou inicia um array vazio
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Mapeamento de status para classes CSS
    const statusClass = {
        'Pendente': 'pending',
        'Em Andamento': 'in-progress',
        'Concluído': 'completed'
    };

    // Funções do Modal
    const openModal = () => modal.classList.add('show');
    const closeModal = () => modal.classList.remove('show');

    openModalBtn.addEventListener('click', openModal);
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

        tasks.forEach(task => {
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

        const newTask = {
            id: Date.now(), // ID único baseado no tempo atual
            title: document.getElementById('task-title').value,
            responsible: document.getElementById('task-responsible').value,
            type: document.getElementById('task-type').value,
            deadline: document.getElementById('task-deadline').value,
            status: 'Pendente', // Novas tarefas começam como pendentes
            observations: document.getElementById('task-observations').value
        };

        tasks.push(newTask); // Adiciona a nova tarefa ao array
        renderTasks(); // Renderiza tudo novamente
        closeModal(); // Fecha o modal
        taskForm.reset(); // Limpa o formulário
    });

    // Lidar com cliques nos botões de ação (Concluir e Excluir)
    tasksList.addEventListener('click', (e) => {
        const target = e.target;

        // Encontra o botão ou o ícone dentro do botão que foi clicado
        const completeButton = target.closest('.complete-btn');
        const deleteButton = target.closest('.delete-btn');
        
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
    });

    // Renderização inicial ao carregar a página
    renderTasks();
});