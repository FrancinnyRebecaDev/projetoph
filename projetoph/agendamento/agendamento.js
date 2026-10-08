const servicos = {
    barba: {
        nome: "Barba",
        duracao: "10 minutos",
        preco: "R$ 10,00"
    },
    bigode: {
        nome: "Bigode",
        duracao: "05 minutos",
        preco: "R$ 3,00"
    },
    cavanhaque: {
        nome: "Cavanhaque",
        duracao: "05 minutos",
        preco: "R$ 5,00"
    },
    "corte-barba": {
        nome: "Corte + barba",
        duracao: "40 minutos",
        preco: "R$ 30,00"
    },
    "corte-navalhado": {
        nome: "Corte Navalhado",
        duracao: "30 minutos",
        preco: "R$ 20,00"
    }
};

const horariosDisponiveis = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00"
];

const chaveAgendamentos = "pui-pui-agendamentos";
const parametros = new URLSearchParams(window.location.search);
const slugServico = parametros.get("servico");
const servico = servicos[slugServico];

const tituloServico = document.getElementById("tituloServico");
const duracaoServico = document.getElementById("duracaoServico");
const precoServico = document.getElementById("precoServico");
const avisoServico = document.getElementById("avisoServico");
const formulario = document.getElementById("formAgendamento");
const campoData = document.getElementById("dataAgendamento");
const etapaHorarios = document.getElementById("etapaHorarios");
const listaHorarios = document.getElementById("listaHorarios");
const avisoHorario = document.getElementById("avisoHorario");
const botaoConfirmar = document.getElementById("botaoConfirmar");
const painelConfirmacao = document.getElementById("confirmacao");
const textoConfirmacao = document.getElementById("textoConfirmacao");

let horarioSelecionado = "";

function dataLocalISO(data = new Date()) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function lerAgendamentos() {
    try {
        const salvos = JSON.parse(localStorage.getItem(chaveAgendamentos) || "[]");
        return Array.isArray(salvos) ? salvos : [];
    } catch {
        return [];
    }
}

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-").map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
}

function horarioEstaOcupado(data, horario) {
    return lerAgendamentos().some((agendamento) =>
        agendamento.data === data && agendamento.horario === horario
    );
}

function limparSelecaoHorario() {
    horarioSelecionado = "";
    botaoConfirmar.disabled = true;
}

function mostrarHorarios(data) {
    listaHorarios.replaceChildren();
    limparSelecaoHorario();
    etapaHorarios.hidden = false;
    avisoHorario.textContent = "";

    if (!data) {
        etapaHorarios.hidden = true;
        return;
    }

    const horariosLivres = horariosDisponiveis.filter((horario) =>
        !horarioEstaOcupado(data, horario)
    );

    if (horariosLivres.length === 0) {
        avisoHorario.textContent = "Todos os horários desta data já foram reservados. Escolha outro dia.";
        return;
    }

    horariosDisponiveis.forEach((horario) => {
        const ocupado = horarioEstaOcupado(data, horario);
        const opcao = document.createElement("button");

        opcao.className = "horario-opcao";
        opcao.type = "button";
        opcao.textContent = horario;
        opcao.disabled = ocupado;
        opcao.setAttribute("aria-pressed", "false");
        opcao.setAttribute("aria-label", ocupado ? `${horario}, horário já reservado` : horario);

        if (ocupado) {
            return;
        }

        opcao.addEventListener("click", () => {
            listaHorarios.querySelectorAll(".horario-opcao").forEach((botao) => {
                botao.setAttribute("aria-pressed", "false");
            });

            opcao.setAttribute("aria-pressed", "true");
            horarioSelecionado = horario;
            botaoConfirmar.disabled = false;
            avisoHorario.textContent = `Horário selecionado: ${horario}`;
        });

        listaHorarios.append(opcao);
    });
}

if (!servico) {
    tituloServico.textContent = "Serviço não encontrado";
    avisoServico.hidden = false;
} else {
    tituloServico.textContent = servico.nome;
    duracaoServico.textContent = servico.duracao;
    precoServico.textContent = servico.preco;
    formulario.hidden = false;
    campoData.min = dataLocalISO();

    campoData.addEventListener("change", () => {
        if (campoData.value && campoData.value < campoData.min) {
            campoData.value = "";
            mostrarHorarios("");
            return;
        }

        mostrarHorarios(campoData.value);
    });

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        if (!campoData.value || !horarioSelecionado) {
            avisoHorario.textContent = "Escolha uma data e um horário disponível para continuar.";
            return;
        }

        if (campoData.value < campoData.min) {
            avisoHorario.textContent = "Escolha uma data válida, a partir de hoje.";
            return;
        }

        if (horarioEstaOcupado(campoData.value, horarioSelecionado)) {
            mostrarHorarios(campoData.value);
            avisoHorario.textContent = "Esse horário acabou de ser reservado. Escolha outro horário.";
            return;
        }

        const agendamento = {
            servico: slugServico,
            nomeServico: servico.nome,
            duracao: servico.duracao,
            preco: servico.preco,
            data: campoData.value,
            horario: horarioSelecionado
        };

        try {
            const agendamentos = lerAgendamentos();
            agendamentos.push(agendamento);
            localStorage.setItem(chaveAgendamentos, JSON.stringify(agendamentos));
        } catch {
            avisoHorario.textContent = "Não foi possível salvar o agendamento neste navegador. Tente novamente.";
            return;
        }

        textoConfirmacao.textContent = `${servico.nome}, em ${formatarData(agendamento.data)} às ${agendamento.horario}. Duração: ${servico.duracao}. Valor: ${servico.preco}.`;
        formulario.hidden = true;
        painelConfirmacao.hidden = false;
        painelConfirmacao.focus();
    });
}
