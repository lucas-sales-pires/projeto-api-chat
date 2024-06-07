import { Router } from 'express';
import { conectarAoBanco } from '../banco.js';
import { criarMensagem } from '../controller/mensagemController.js';

const router = Router();

export default function configurarChat(io) {
  const salas = {};
  const socketsUsuarios = {};

  function obterUsuariosOnline(sala) {
    return salas[sala] ? salas[sala].map(usuario => usuario.nome) : [];
  }
  

  io.on('connection', async (socket) => {
      socket.on('entrarNaSala', async (dados) => {
          const { sala, nome } = dados;
          socket.join(sala);
          
          salas[sala] = salas[sala] || [];
          salas[sala].push({ socketId: socket.id, nome });
          socketsUsuarios[nome] = socket.id;
          
          io.to(sala).emit('usuariosOnline', obterUsuariosOnline(sala));
      console.log('Usuários na sala:', salas[sala]);

      try {
        const client = await conectarAoBanco();
        const db = client.db('chat');
        const collection = db.collection('mensagens');
        const mensagensAnteriores = await collection.find({ sala }).toArray();

        if (mensagensAnteriores.length > 0) {
          socket.emit('mensagensAnteriores', mensagensAnteriores);
        }
      } catch (err) {
        console.error('Erro ao buscar mensagens anteriores:', err);
        socket.emit('erro', 'Erro ao carregar histórico de mensagens');
      }
    });

    socket.on('mensagemPrivada', async (dados) => {
      const { destinatario, mensagem } = dados;
      const socketId = socketsUsuarios[destinatario];
      if (socketId) {
        socket.to(socketId).emit('mensagemPrivada', mensagem);
      } else {
        console.error('Usuário não encontrado:', destinatario);
        socket.emit('erro', 'Usuário não encontrado');
      }
    });

    socket.on('novaMensagem', async (mensagem) => {
      try {
        const mensagemSalva = await criarMensagem(mensagem);
        io.to(mensagem.sala).emit('novaMensagem', mensagemSalva);
      } catch (err) {
        console.error('Erro ao criar e emitir mensagem:', err);
        socket.emit('erro', 'Erro ao enviar mensagem');
      }
    });

    socket.on('disconnect', () => {
      for (const sala in salas) {
        salas[sala] = salas[sala].filter(usuario => usuario.socketId !== socket.id);
        if (salas[sala].length === 0) {
          delete salas[sala];
        }
      }

      for (const sala in salas) {
        if (salas[sala].some(usuario => usuario.socketId === socket.id)) {
          io.to(sala).emit('usuariosOnline', obterUsuariosOnline(sala));
          break;
        }
    }

      for (const nome in socketsUsuarios) {
        if (socketsUsuarios[nome] === socket.id) {
          delete socketsUsuarios[nome];
          break;
        }
      }
      console.log('Usuário desconectado:', socket.id);
    });
  });
}
