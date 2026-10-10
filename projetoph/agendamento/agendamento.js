const servicos = {
    barba: { nome: "Barba", duracao: "10 minutos", preco: "R$ 10,00" },
    bigode: { nome: "Bigode", duracao: "05 minutos", preco: "R$ 3,00" },
    cavanhaque: { nome: "Cavanhaque", duracao: "05 minutos", preco: "R$ 5,00" },
    "corte-barba": { nome: "Corte + barba", duracao: "40 minutos", preco: "R$ 30,00" },
    "corte-navalhado": { nome: "Corte Navalhado", duracao: "30 minutos", preco: "R$ 20,00" }
};

const profissionais = ["Gabriel", "Gleydson"];
const horariosDisponiveis = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];
const chaveAgendamentos = "pui-pui-agendamentos";
const slugServico = new URLSearchParams(window.location.search).get("servico");
const servico = servicos[slugServico];

const tituloServico = document.getElementById("tituloServico");
const duracaoServico = document.getElementById("duracaoServico");
const precoServico = document.getElementById("precoServico");
const avisoServico = document.getElementById("avisoServico");
const secaoProfissionais = document.getElementById("secaoProfissionais");
const botoesProfissionais = document.querySelectorAll("[data-profissional]");
const secaoCalendario = document.getElementById("secaoCalendario");
const gradeCalendario = document.getElementById("gradeCalendario");
const mesAtual = document.getElementById("mesAtual");
const botaoMesAnterior = document.getElementById("mesAnterior");
const botaoProximoMes = document.getElementById("proximoMes");
const secaoHorarios = document.getElementById("secaoHorarios");
const dataEscolhida = document.getElementById("dataEscolhida");
const listaHorarios = document.getElementById("listaHorarios");
const avisoHorario = document.getElementById("avisoHorario");
const secaoResumo = document.getElementById("secaoResumo");
const confirmarAgendamento = document.getElementById("confirmarAgendamento");
const confirmacao = document.getElementById("confirmacao");

let profissionalSelecionado = "";
let dataSelecionada = "";
let horarioSelecionado = "";
const hoje = new Date();
const hojeISO = dataLocalISO(hoje);
let mesVisivel = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

function dataLocalISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function lerAgendamentos() {
    try {
        const agendamentos = JSON.parse(localStorage.getItem(chaveAgendamentos) || "[]");
        return Array.isArray(agendamentos) ? agendamentos : [];
    } catch {
        return [];
    }
}

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-").map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
}

function mesmaData(dataA, dataB) {
    return dataA.getFullYear() === dataB.getFullYear()
        && dataA.getMonth() === dataB.getMonth();
}

function mesAnteriorAoAtual() {
    return mesVisivel.getFullYear() < hoje.getFullYear()
        || (mesVisivel.getFullYear() === hoje.getFullYear()
            && mesVisivel.getMonth() <= hoje.getMonth());
}

function horarioOcupado(data, horario, profissional) {
    return lerAgendamentos().some((agendamento) =>
        agendamento.data === data
        && agendamento.horario === horario
        && agendamento.profissional === profissional
    );
}

function horarioJaPassou(data, horario) {
    if (data !== hojeISO) {
        return false;
    }

    const [hora, minuto] = horario.split(":").map(Number);
    const agora = new Date();
    return hora * 60 + minuto <= agora.getHours() * 60 + agora.getMinutes();
}

function atualizarResumo() {
    const completo = Boolean(servico && profissionalSelecionado && dataSelecionada && horarioSelecionado);
    secaoResumo.hidden = !completo;

    if (!completo) {
        return;
    }

    document.getElementById("resumoServico").textContent = servico.nome;
    document.getElementById("resumoProfissional").textContent = profissionalSelecionado;
    document.getElementById("resumoData").textContent = formatarData(dataSelecionada);
    document.getElementById("resumoHorario").textContent = horarioSelecionado;
}

function selecionarData(data) {
    dataSelecionada = data;
    horarioSelecionado = "";
    avisoHorario.textContent = "";
    renderizarCalendario();
    renderizarHorarios();
    atualizarResumo();
}

function criarDiaVazio() {
    const espaco = document.createElement("span");
    espaco.className = "espaco-calendario";
    espaco.setAttribute("aria-hidden", "true");
    gradeCalendario.append(espaco);
}

function renderizarCalendario() {
    const ano = mesVisivel.getFullYear();
    const mes = mesVisivel.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const deslocamentoSegunda = (primeiroDia.getDay() + 6) % 7;
    const nomeMes = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(mesVisivel);

    mesAtual.textContent = `${nomeMes.charAt(0).toLocaleUpperCase("pt-BR")}${nomeMes.slice(1)} ${ano}`;
    botaoMesAnterior.disabled = mesAnteriorAoAtual();
    gradeCalendario.replaceChildren();

    for (let espaco = 0; espaco < deslocamentoSegunda; espaco += 1) {
        criarDiaVazio();
    }

    for (let dia = 1; dia <= diasNoMes; dia += 1) {
        const data = new Date(ano, mes, dia);
        const dataISO = dataLocalISO(data);
        const botaoDia = document.createElement("button");

        botaoDia.className = "dia-calendario";
        botaoDia.type = "button";
        botaoDia.textContent = String(dia);
        botaoDia.disabled = dataISO < hojeISO;
        botaoDia.setAttribute("aria-pressed", String(dataISO === dataSelecionada));
        botaoDia.setAttribute("aria-label", formatarData(dataISO));

        if (dataISO === hojeISO) {
            botaoDia.classList.add("hoje");
        }

        botaoDia.addEventListener("click", () => selecionarData(dataISO));
        gradeCalendario.append(botaoDia);
    }
}

function renderizarHorarios() {
    listaHorarios.replaceChildren();
    secaoHorarios.hidden = !dataSelecionada;
    avisoHorario.textContent = "";
    dataEscolhida.textContent = dataSelecionada ? formatarData(dataSelecionada) : "";

    if (!dataSelecionada || !profissionalSelecionado) {
        return;
    }

    const horariosLivres = horariosDisponiveis.filter((horario) =>
        !horarioOcupado(dataSelecionada, horario, profissionalSelecionado)
        && !horarioJaPassou(dataSelecionada, horario)
    );

    if (horariosLivres.length === 0) {
        avisoHorario.textContent = "Não há horários disponíveis neste dia. Escolha outra data.";
        return;
    }

    horariosLivres.forEach((horario) => {
        const botaoHorario = document.createElement("button");
        botaoHorario.className = "horario-opcao";
        botaoHorario.type = "button";
        botaoHorario.textContent = horario;
        botaoHorario.setAttribute("aria-pressed", String(horario === horarioSelecionado));

        botaoHorario.addEventListener("click", () => {
            horarioSelecionado = horario;
            avisoHorario.textContent = `Horário selecionado: ${horario}`;
            renderizarHorarios();
            atualizarResumo();
        });

        listaHorarios.append(botaoHorario);
    });
}

function selecionarProfissional(profissional) {
    profissionalSelecionado = profissional;
    dataSelecionada = "";
    horarioSelecionado = "";
    secaoCalendario.hidden = false;
    secaoHorarios.hidden = true;
    avisoHorario.textContent = "";

    botoesProfissionais.forEach((botao) => {
        botao.setAttribute("aria-pressed", String(botao.dataset.profissional === profissional));
    });

    renderizarCalendario();
    atualizarResumo();
}

if (!servico) {
    tituloServico.textContent = "Serviço não encontrado";
    avisoServico.hidden = false;
} else {
    tituloServico.textContent = servico.nome;
    duracaoServico.textContent = servico.duracao;
    precoServico.textContent = servico.preco;
    secaoProfissionais.hidden = false;

    botoesProfissionais.forEach((botao) => {
        botao.addEventListener("click", () => {
            selecionarProfissional(botao.dataset.profissional);
        });
    });

    botaoMesAnterior.addEventListener("click", () => {
        if (!mesAnteriorAoAtual()) {
            mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() - 1, 1);
            selecionarData("");
            renderizarCalendario();
        }
    });

    botaoProximoMes.addEventListener("click", () => {
        mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1, 1);
        selecionarData("");
        renderizarCalendario();
    });

    confirmarAgendamento.addEventListener("click", () => {
        if (!profissionais.includes(profissionalSelecionado) || !dataSelecionada || !horarioSelecionado) {
            return;
        }

        if (horarioOcupado(dataSelecionada, horarioSelecionado, profissionalSelecionado)) {
            avisoHorario.textContent = "Esse horário acabou de ser reservado. Escolha outro horário.";
            horarioSelecionado = "";
            renderizarHorarios();
            atualizarResumo();
            return;
        }

        const agendamento = {
            servico: slugServico,
            nomeServico: servico.nome,
            profissional: profissionalSelecionado,
            data: dataSelecionada,
            horario: horarioSelecionado
        };

        try {
            const agendamentos = lerAgendamentos();
            agendamentos.push(agendamento);
            localStorage.setItem(chaveAgendamentos, JSON.stringify(agendamentos));
        } catch {
            avisoHorario.textContent = "Não foi possível salvar o agendamento neste navegador.";
            return;
        }

        document.getElementById("textoConfirmacao").textContent =
            `${servico.nome} com ${profissionalSelecionado}, dia ${formatarData(dataSelecionada)} às ${horarioSelecionado}.`;
        secaoProfissionais.hidden = true;
        secaoCalendario.hidden = true;
        secaoHorarios.hidden = true;
        secaoResumo.hidden = true;
        confirmacao.hidden = false;
    });
}
