const form = document.getElementById('whatsappForm');
const container = document.querySelector('.login-container');

function resetarFormulario() {
  if (!form) return;

  form.innerHTML = `
    <div class="input-group">
      <label for="nome">Seu Nome:</label>
      <input type="text" id="nome" name="nome" placeholder="Digite seu nome completo" required>
    </div>

    <div class="input-group">
      <label for="contato">Celular (WhatsApp):</label>
      <input type="tel" id="contato" name="contato" placeholder="Ex: 5511999999999" required>
    </div>

    <button type="submit">Finalizar agendamento</button>
  `;

  if (container) {
    const text = container.querySelector('p');
    if (text) text.textContent = 'Preencha os dados para finalizar o seu agendamento.';
  }
}

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const contato = document.getElementById('contato').value.trim().replace(/\D/g, '');

    if (!nome) {
      alert('Digite seu nome antes de continuar.');
      return;
    }

    if (!contato) {
      alert('Digite o número do contato do rapaz antes de continuar.');
      return;
    }

    form.innerHTML = `
      <div class="sucesso">
        <h3>Agendamento realizado</h3>
        <p>Olá, ${nome}! Seu agendamento foi realizado com sucesso.</p>
      </div>
      <button type="button" class="btn-voltar">Voltar ao agendamento</button>
    `;

    if (container) {
      const text = container.querySelector('p');
      if (text) text.textContent = 'Seu cadastro foi concluído.';
    }

    const botaoVoltar = form.querySelector('.btn-voltar');
    if (botaoVoltar) {
      botaoVoltar.addEventListener('click', resetarFormulario);
    }
  });
}