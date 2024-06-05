const salas = {};
const usuarios = {};

export function adicionarUsuarioNaSala(socketId, salaId, usuario) {
  if (!salas[salaId]) {
    salas[salaId] = new Set(); 
  }
  salas[salaId].add(socketId);
  usuarios[socketId] = usuario;
}

export function removerUsuarioDaSala(socketId, salaId) {
  if (salas[salaId]) {
    salas[salaId].delete(socketId); 
    if (salas[salaId].size === 0) {
      delete salas[salaId];
    }
  }
  delete usuarios[socketId];
}

export function getUsuariosNaSala(salaId) {
  return salas[salaId]
    ? Array.from(salas[salaId]).map(id => usuarios[id]?.nome).filter(nome => nome !== undefined)
    : [];
}

export function carregarMensagensSala(salaId) {
  return salas[salaId]
    ? Array.from(salas[salaId]).map(id => usuarios[id]?.mensagens).filter(mensagens => mensagens !== undefined)
    : [];
  
}

export function getSalas() {
  return Object.keys(salas);
}

export function getUsuarios() {
  return Object.values(usuarios);
}

export function usuarioEstaEmSala(socketId, salaId) {
  return salas[salaId] && salas[salaId].has(socketId); 
}

export function getSalaDoUsuario(socketId) {
  return Object.values(salas).find(usuariosDaSala => usuariosDaSala.includes(socketId));
}
