import { Router } from 'express';
import Usuario from '../models/usuario.js';

const router = Router();

export default (io) => {
  const salas = {}; 
  const usuarios = {}; 

  router.get('/salas', (req, res) => {
    res.json(salas); 
  });

  router.get('/usuarios', (req, res) => {
    const usernames = Object.values(usuarios).map(usuario => usuario.nome);
    res.json(usernames);
  });

  router.get('/salas/:salaId/usuarios', (req, res) => {
    const salaId = req.params.salaId;
    const usuariosNaSala = getUsuariosNaSala(salaId);
    res.json(usuariosNaSala); // Retorna os usuários de uma sala específica
  });


  io.on('connection', (socket) => {
    socket.on('login', async (userId) => {
      try {
        const usuario = await Usuario.findOne({nome: userId});
        if (usuario) {
          usuarios[socket.id] = usuario;
          socket.emit('loginSucesso', { username: usuario.nome });
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

    socket.on('entrarNaSala', (salaId) => {
      if (!salas[salaId]) {
        salas[salaId] = [];
      }
      salas[salaId].push(socket.id);
      socket.join(salaId);

      io.to(salaId).emit('atualizarUsuarios', getUsuariosNaSala(salaId));
    });

    socket.on('sairDaSala', (salaId) => {
      if (salas[salaId]) {
        salas[salaId] = salas[salaId].filter(id => id !== socket.id);
        socket.leave(salaId);

        io.to(salaId).emit('atualizarUsuarios', getUsuariosNaSala(salaId));
      }
    });

    socket.on('novaMensagem', async (dados) => {
      const { salaId, mensagem } = dados;
      const usuario = usuarios[socket.id];

      if (salaId && mensagem && usuario) {
        try {

          io.to(salaId).emit('mensagemRecebida', {
            username: usuario.nome,
            texto: mensagem,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error('Erro ao enviar mensagem:', error);
          socket.emit('erro', 'Erro ao enviar mensagem');
        }
      }
    });

    socket.on('disconnect', () => {
      for (const salaId in salas) {
        salas[salaId] = salas[salaId].filter(id => id !== socket.id);
        io.to(salaId).emit('atualizarUsuarios', getUsuariosNaSala(salaId));
      }
      delete usuarios[socket.id];
    });
  });

  function getUsuariosNaSala(salaId) {
    return salas[salaId].map(id => usuarios[id].nome);
  }

  return router;
};

