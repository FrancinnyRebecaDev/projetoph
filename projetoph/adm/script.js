"use strict";

const CHAVE_SERVICOS = "barbearia_servicos";
const IMAGEM_PADRAO = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600";

const form = document.getElementById("form-servico");
const listaServicosEl = document.getElementById("lista-servicos");
const contadorEl = document.getElementById("contador-servicos");
const avisoFormulario = document.getElementById("aviso-formulario");

function lerServicos() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_SERVICOS) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

let servicos = lerServicos();

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function formatarPreco(preco) {
    const valor = Number(preco);
    return Number.isFinite(valor)
        ? valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "R$ 0,00";
}

function criarEstadoVazio() {
    const vazio = criarElemento("div", "empty-state");
    vazio.append(
        criarElemento("div", "empty-mark", "✂"),
        criarElemento("p", "", "Nenhum serviço cadastrado."),
        criarElemento("p", "", "Adicione um serviço pelo formulário para começar.")
    );
    return vazio;
}

function criarCard(servico, indice) {
    const card = criarElemento("article", "service-card");
    const imagem = servico.imagem || IMAGEM_PADRAO;

    if (typeof imagem === "string" && imagem.startsWith("data:image/")) {
        const foto = document.createElement("img");
        foto.className = "service-image";
        foto.src = imagem;
        foto.alt = servico.nome ? `Imagem de ${servico.nome}` : "Imagem do serviço";
        foto.loading = "lazy";
        foto.addEventListener("error", () => foto.replaceWith(criarElemento("div", "service-image-placeholder", "✂")), { once: true });
        card.append(foto);
    } else {
        const foto = document.createElement("img");
        foto.className = "service-image";
        foto.src = typeof imagem === "string" ? imagem : IMAGEM_PADRAO;
        foto.alt = servico.nome ? `Imagem de ${servico.nome}` : "Imagem do serviço";
        foto.loading = "lazy";
        foto.addEventListener("error", () => foto.replaceWith(criarElemento("div", "service-image-placeholder", "✂")), { once: true });
        card.append(foto);
    }

    const conteudo = criarElemento("div", "service-content");
    conteudo.append(
        criarElemento("span", "service-category", servico.tipo || "Serviço"),
        criarElemento("h3", "service-name", servico.nome || "Serviço sem nome"),
        criarElemento("p", "service-duration", `${servico.duracao || "--"} minutos`)
    );

    const rodape = criarElemento("div", "service-footer");
    rodape.appendChild(criarElemento("span", "service-price", formatarPreco(servico.preco)));

    const botaoExcluir = criarElemento("button", "delete-button", "Excluir");
    botaoExcluir.type = "button";
    botaoExcluir.setAttribute("aria-label", `Excluir ${servico.nome || "serviço"}`);
    botaoExcluir.addEventListener("click", () => removerServico(indice));
    rodape.appendChild(botaoExcluir);
    conteudo.appendChild(rodape);
    card.appendChild(conteudo);
    return card;
}

function renderizarServicos() {
    listaServicosEl.replaceChildren();
    contadorEl.textContent = String(servicos.length);

    if (servicos.length === 0) {
        listaServicosEl.appendChild(criarEstadoVazio());
        return;
    }

    servicos.forEach((servico, indice) => {
        listaServicosEl.appendChild(criarCard(servico, indice));
    });
}

function salvarServicos() {
    try {
        localStorage.setItem(CHAVE_SERVICOS, JSON.stringify(servicos));
        return true;
    } catch {
        avisoFormulario.textContent = "Não foi possível salvar. Verifique o espaço disponível no navegador.";
        return false;
    }
}

function salvarServico(servico) {
    servicos.push(servico);
    if (!salvarServicos()) {
        servicos.pop();
        return;
    }

    form.reset();
    avisoFormulario.textContent = "Serviço cadastrado.";
    renderizarServicos();
}

function removerServico(indice) {
    const servico = servicos[indice];
    if (!servico || !window.confirm(`Excluir o serviço "${servico.nome || "sem nome"}"?`)) return;

    const removido = servicos.splice(indice, 1)[0];
    if (!salvarServicos()) {
        servicos.splice(indice, 0, removido);
        return;
    }

    avisoFormulario.textContent = "Serviço excluído.";
    renderizarServicos();
}

form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    avisoFormulario.textContent = "";

    const dados = new FormData(form);
    const novoServico = {
        nome: String(dados.get("nome")).trim(),
        tipo: String(dados.get("tipo")),
        duracao: String(dados.get("duracao")),
        preco: String(dados.get("preco")),
        imagem: IMAGEM_PADRAO
    };
    salvarServico(novoServico);
});

renderizarServicos();