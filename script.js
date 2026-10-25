// Selecionando os elementos no HTML
const form = document.getElementById('formMedicamento');
const inputNome = document.getElementById('medicamento');
const inputHorario = document.getElementById('horario');
const listaMedicamentos = document.getElementById('listaMedicamentos');

// Seleciona todos os links do menu e todas as seções de conteúdo
const menuLinks = document.querySelectorAll('.menu-link');
const secoes = document.querySelectorAll('.secao-conteudo');

// Lógica para alternar entre as telas do menu lateral
menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Evita o comportamento padrão do link

        // Remove a classe 'active' de todos os links
        menuLinks.forEach(l => l.style.backgroundColor = 'transparent');
        // Destaca o link clicado
        this.style.backgroundColor = '#b9dfd0';

        // Pega o ID da seção alvo através do atributo data-target
        const targetId = this.getAttribute('data-target');

        // Esconde todas as seções e mostra apenas a selecionada
        secoes.forEach(secao => {
            if (secao.id === targetId) {
                secao.style.display = 'block';
            } else {
                secao.style.display = 'none';
            }
        });
    });
});

// Carrega os medicamentos salvos no navegador ou inicia um array vazio
let medicamentos = JSON.parse(localStorage.getItem('medications')) || [];

// Função para exibir os medicamentos na tela
function renderizarMedicamentos() {
    listaMedicamentos.innerHTML = '';

    if (medicamentos.length === 0) {
        listaMedicamentos.innerHTML = '<li id="mensagemVazia">Nenhum medicamento cadastrado ainda.</li>';
        return;
    }

    medicamentos.forEach((med, index) => {
        const itemLista = document.createElement('li');
        itemLista.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background-color: #f5f8f6; border-radius: 6px; border: 1px solid #ccd9d2;";
        
        itemLista.innerHTML = `
            <span><strong>${med.nome}</strong> - ⏰ ${med.horario}</span>
            <button type="button" onclick="removerMedicamento(${index})" style="background-color: #d9534f; padding: 6px 12px; font-size: 14px; color: white; border: none; border-radius: 4px; cursor: pointer;">Remover</button>
        `;
        listaMedicamentos.appendChild(itemLista);
    });
}

// Evento ao submeter o formulário
form.addEventListener('submit', function(e) {
    e.preventDefault(); // Impede o recarregamento da página

    const novoMed = {
        nome: inputNome.value.trim(),
        horario: inputHorario.value
    };

    if (!novoMed.nome || !novoMed.horario) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Adiciona ao array e guarda no localStorage
    medicamentos.push(novoMed);
    localStorage.setItem('medications', JSON.stringify(medicamentos));

    // Atualiza a interface e limpa o formulário
    renderizarMedicamentos();
    form.reset();

    // Opcional: Redireciona automaticamente para a "Agenda" após cadastrar
    document.querySelector('[data-target="secao-agenda"]').click();
});

// Função global para remover um medicamento
window.removerMedicamento = function(index) {
    medicamentos.splice(index, 1);
    localStorage.setItem('medications', JSON.stringify(medicamentos));
    renderizarMedicamentos();
};

// Executa a listagem inicial assim que a página abre
renderizarMedicamentos();

// Adicionando novas modificações - Tai

// Verifica se as notificações estão ativadas
let notificacoesAtivas =
    localStorage.getItem('notificacoesAtivas') === 'true';

// Solicita autorização ao usuário
async function ativarNotificacoes() {
    if (!('Notification' in window)) {
        alert('Seu navegador não suporta notificações.');
        return;
    }

    const permissao = await Notification.requestPermission();

    if (permissao === 'granted') {
        notificacoesAtivas = true;
        localStorage.setItem('notificacoesAtivas', 'true');

        alert('Notificações ativadas com sucesso!');
    } else {
        alert('Permissão para notificações não concedida.');
    }
}

// Desativa os lembretes
function desativarNotificacoes() {
    notificacoesAtivas = false;
    localStorage.setItem('notificacoesAtivas', 'false');
}

// Verifica se chegou o horário de algum medicamento
function verificarHorarios() {
    if (
        !notificacoesAtivas ||
        !('Notification' in window) ||
        Notification.permission !== 'granted'
    ) {
        return;
    }

    const agora = new Date();

    const horarioAtual =
        String(agora.getHours()).padStart(2, '0') + ':' +
        String(agora.getMinutes()).padStart(2, '0');

    const dataAtual = [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, '0'),
        String(agora.getDate()).padStart(2, '0')
    ].join('-');

    medicamentos.forEach((med, index) => {
        const chave = `lembrete-${dataAtual}-${index}-${med.nome}-${med.horario}`;

        if (
            med.horario === horarioAtual &&
            !localStorage.getItem(chave)
        ) {
            new Notification('LembreteMed', {
                body: `Está na hora do lembrete: ${med.nome}.`
            });

            localStorage.setItem(chave, 'true');
        }
    });
}

// Verifica os horários periodicamente
setInterval(verificarHorarios, 15000);
verificarHorarios();