const caminhoAgendamento = "../agendamento/agendamento.html";
const botoesReserva = document.querySelectorAll(".botao-reservar[data-servico]");

botoesReserva.forEach((botao) => {
    botao.addEventListener("click", () => {
        const servico = botao.dataset.servico;

        window.location.href = `${caminhoAgendamento}?servico=${encodeURIComponent(servico)}`;
    });
});