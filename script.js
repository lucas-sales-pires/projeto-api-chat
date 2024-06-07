const socket = io('http://localhost:8010'); 

const salaInput = document.getElementById('sala');
const nomeInput = document.getElementById('nome');
const mensagemInput = document.getElementById('mensagem');
const mensagensDiv = document.getElementById('mensagens');
const usuariosDiv = document.getElementById('usuarios');
const entrarButton = document.getElementById('entrar');
const enviarmsg = document.getElementById('enviarmsg');


socket.on('connect', () => {
    console.log('Conectado ao servidor');
});


function entrarNaSala() {
    const sala = salaInput.value;
    const nome = nomeInput.value;
    socket.emit('entrarNaSala', { sala, nome });
    socket.emit('autenticado', { nome: nome });

    buscarMensagens(sala);
    salaInput.style.display= "none";
    nomeInput.style.display= "none";
    entrarButton.style.display= "none";
    mensagemInput.style.display= "block";
    enviarmsg.style.display= "block";
}

socket.on('mensagemPrivada', (mensagem) => {
  const mensagensDiv = document.getElementById('mensagens2');
  mensagensDiv.innerHTML += `<p>${mensagem}</p>`;
});

socket.on('erro', (mensagem) => {
  alert(mensagem); 
});

const enviarButton = document.getElementById('enviar2');
enviarButton.addEventListener('click', () => {
  const destinatario = document.getElementById('destinatario').value;
  const mensagem = document.getElementById('mensagem2').value;
  socket.emit('mensagemPrivada', { destinatario, mensagem });
});

socket.on('usuariosOnline', (usuarios) => {
  const listaUsuarios = document.getElementById('listaUsuarios'); 
  listaUsuarios.innerHTML = ''; 

  for (const usuario of usuarios) {
    const item = document.createElement('li');
    item.textContent = usuario;
    listaUsuarios.appendChild(item);
  }
});



function enviarMensagem() {
  socket.emit('novaMensagem', { 
    conteudo: mensagemInput.value, 
    sala: salaInput.value, 
    username: nomeInput.value
  });
  mensagemInput.value = ''; 
}


async function buscarMensagens(sala) {
  try {
      const response = await fetch(`http://localhost:8010/api/mensagens/anteriores/${sala}`);
      if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
      }
      const data = await response.json();
      console.log('Mensagens encontradas:', data);

  } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
  }
}

socket.on('novaMensagem', (mensagem) => { 
  console.log('Nova mensagem:', mensagem);

  const mensagemElement = document.createElement('div');
  mensagemElement.classList.add('mensagem');
  mensagemElement.innerHTML = `
    <span class="remetente">${mensagem.username}</span>: 
    <span class="texto">${mensagem.conteudo}</span>
  `;
  mensagensDiv.appendChild(mensagemElement);
  mensagensDiv.scrollTop = mensagensDiv.scrollHeight; 
});



socket.on('mensagensAnteriores', (mensagens) => {
  mensagensDiv.innerHTML = ''; 

  mensagens.forEach(mensagem => {
      const mensagemElement = document.createElement('div');
      mensagemElement.classList.add('mensagem');
      mensagemElement.innerHTML = `
          <span class="remetente">${mensagem.username}</span>: 
          <span class="texto">${mensagem.conteudo}</span>
      `;
      mensagensDiv.appendChild(mensagemElement);
  });
});
