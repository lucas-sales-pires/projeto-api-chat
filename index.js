
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { routerUsuario } from './rotas/rotas_usuario.js';
import * as gerenciadorSalas from './controller/gerenciadorSalas.js';
import Usuario from './models/usuario.js';
import { conectarAoBanco } from './banco.js';
import Mensagem from './models/mensagem.js';

config();
const porta = process.env.PORTA;
const mongoURI = process.env.MONGO_URI;

conectarAoBanco()

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routerUsuario);


const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });


io.on('connection', (socket) => {
  socket.on('login', async (username) => {
    try {
      const usuario = await Usuario.findOne({nome: username});

      if (!usuario) {
        console.error('Usuário não encontrado:', username);
        socket.emit('erro', 'Usuário não encontrado');
        socket.disconnect();
        return;
    }

    console.log('Usuário encontrado:', usuario);
      if (usuario) {
        gerenciadorSalas.adicionarUsuarioNaSala(socket.id, null, usuario);
        socket.emit('loginSucesso', { username: usuario.nome, userId: usuario._id });
      } else {
        socket.emit('erro', 'Usuário não encontrado');
        socket.disconnect();
      }
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      socket.emit('erro', 'Erro ao autenticar');
      socket.disconnect();
    }
  });

  socket.on('entrarNaSala', async (salaId) => {
    if (salaId) {
      const usuario = gerenciadorSalas.getUsuarios()[socket.id];
      if (usuario) {
        gerenciadorSalas.adicionarUsuarioNaSala(socket.id, salaId, usuario);
        socket.join(salaId);
        io.to(salaId).emit('atualizarUsuarios', gerenciadorSalas.getUsuariosNaSala(salaId));

        try {
          const mensagens = await Mensagem.find({ salaId }).sort({ timestamp: 1 }); // Buscar mensagens ordenadas por data
          socket.emit('historicoMensagens', mensagens);
        } catch (err) {
          console.error('Erro ao buscar mensagens:', err);
          socket.emit('erro', 'Erro ao carregar o histórico de mensagens');
        }
      } else {
        socket.emit('erro', 'Usuário não autenticado');
      }
    } else {
      socket.emit('erro', 'Nome da sala inválido');
    }
  });

  socket.on('novaMensagem', async (dados) => {
    const { salaId, mensagem } = dados;
    const usuario = gerenciadorSalas.getUsuarios()[socket.id];

    if (gerenciadorSalas.usuarioEstaEmSala(socket.id, salaId) && mensagem && usuario) {
      try {
        const novaMensagem = await Mensagem.create({
          salaId,
          remetente: usuario.nome,
          texto: mensagem,
          timestamp: new Date(),
        });
        io.to(salaId).emit('mensagemRecebida', novaMensagem);
      } catch (err) {
        console.error('Erro ao salvar mensagem:', err);
        socket.emit('erro', 'Erro ao enviar mensagem');
      }
    }
  });

  socket.on('sairDaSala', (salaId) => {
    gerenciadorSalas.removerUsuarioDaSala(socket.id, salaId);
    socket.leave(salaId);
    io.to(salaId).emit('atualizarUsuarios', gerenciadorSalas.getUsuariosNaSala(salaId));
  });

  socket.on('disconnect', () => {
    const salaId = gerenciadorSalas.getSalaDoUsuario(socket.id);
    if (salaId) {
      gerenciadorSalas.removerUsuarioDaSala(socket.id, salaId);
      io.to(salaId).emit('atualizarUsuarios', gerenciadorSalas.getUsuariosNaSala(salaId));
    }
  });
});



server.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});






// import cors from 'cors';
// import { config } from 'dotenv';
// import express from 'express';
// import http from 'http';
// import { Server } from 'socket.io';
// import mongoose from 'mongoose';
// import * as gerenciadorSalas from './controller/gerenciadorSalas.js';
// import Mensagem from './models/mensagem.js';
// import { conectarAoBanco } from './banco.js';

// config();
// const porta = process.env.PORTA;
// const mongoURI = process.env.MONGO_URI;

// conectarAoBanco();

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });

// io.on('connection', (socket) => {
//   socket.on('entrarNaSala', async (salaId) => {
//     if (salaId) {
//       gerenciadorSalas.adicionarUsuarioNaSala(socket.id, salaId, { nome: 'Usuário Anônimo' });
//       socket.join(salaId);
//       io.to(salaId).emit('atualizarUsuarios', gerenciadorSalas.getUsuariosNaSala(salaId));

//       try {
//         const mensagens = await Mensagem.find({ salaId }).sort({ timestamp: 1 });
//         socket.emit('historicoMensagens', mensagens);
//       } catch (err) {
//         console.error('Erro ao buscar mensagens:', err);
//         socket.emit('erro', 'Erro ao carregar o histórico de mensagens');
//       }
//     } else {
//       socket.emit('erro', 'Nome da sala inválido');
//     }
//   });

//   socket.on('definirNome', (nome) => {
//     const usuario = gerenciadorSalas.getUsuarios()[socket.id];
//     if (usuario) {
//       usuario.nome = nome;
//       const salaId = gerenciadorSalas.getSalaDoUsuario(socket.id);
//       if (salaId) {
//         io.to(salaId).emit('atualizarUsuarios', gerenciadorSalas.getUsuariosNaSala(salaId));
//       }
//     }
//   });

//   socket.on('novaMensagem', async (dados) => {
//     const { salaId, mensagem } = dados;
//     const usuario = gerenciadorSalas.getUsuarios()[socket.id];

//     if (gerenciadorSalas.usuarioEstaEmSala(socket.id, salaId) && mensagem && usuario) {
//       try {
//         const novaMensagem = await Mensagem.create({
//           salaId,
//           remetente: usuario.nome,
//           texto: mensagem,
//           timestamp: new Date(),
//         });
//         io.to(salaId).emit('mensagemRecebida', novaMensagem);
//       } catch (err) {
//         console.error('Erro ao salvar mensagem:', err);
//         socket.emit('erro', 'Erro ao enviar mensagem');
//       }
//     }
//   });

//   socket.on('sairDaSala', (salaId) => {
//     gerenciadorSalas.removerUsuarioDaSala(socket.id, salaId);
//     socket.leave(salaId);
//     io.to(salaId).emit('atualizarUsuarios', gerenciadorSalas.getUsuariosNaSala(salaId));
//   });

//   socket.on('disconnect', () => {
//     const salaId = gerenciadorSalas.getSalaDoUsuario(socket.id);
//     if (salaId) {
//       gerenciadorSalas.removerUsuarioDaSala(socket.id, salaId);
//       io.to(salaId).emit('atualizarUsuarios', gerenciadorSalas.getUsuariosNaSala(salaId));
//     }
//   });
// });

// server.listen(porta, () => {
//   console.log(`Servidor rodando na porta ${porta}`);
// });
