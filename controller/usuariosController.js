import { ObjectId } from 'mongodb';
import { conectarAoBanco } from '../banco.js';



export async function criarUsuario(req, res) {
  try {
    const { username, password } = req.body; 
    const client = await conectarAoBanco();
    const db = client.db('chat'); 
    const collection = db.collection('usuarios'); 
    const resultado = await collection.insertOne({ username, password }); 
    res.status(201).json({ _id: resultado.insertedId, username });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}



export async function listarUsuarios(req, res) { 
  try {
    const client = await conectarAoBanco();
    const db = client.db('chat');
    const collection = db.collection('usuarios');
    const usuarios = await collection.find().toArray();
    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
 }
export async function obterUsuario(req, res) { 
  
    try {
      const { id } = req.params;
      const client = await conectarAoBanco();
      const db = client.db('chat');
      const collection = db.collection('usuarios');
      const usuario = await collection.findOne({ _id: ObjectId(id) });
      if (usuario) {
        res.json(usuario);
      } else {
        res.status(404).json({ erro: 'Usuário não encontrado' });
      }
    } catch (err) {
      console.error('Erro ao obter usuário:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }

}
export async function atualizarUsuario(req, res) { 

    try {
      const { id } = req.params;
      const { username, password } = req.body; 
      const client = await conectarAoBanco();
      const db = client.db('chat');
      const collection = db.collection('usuarios');
      const resultado = await collection.updateOne({ _id: ObjectId(id) }, { $set: { username, password } }); 
      if (resultado.modifiedCount === 1) {
        res.json({ _id: id, username });
      } else {
        res.status(404).json({ erro: 'Usuário não encontrado' });
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }

}
export async function deletarUsuario(req, res) { 

    try {
      const { id } = req.params;
      const client = await conectarAoBanco();
      const db = client.db('chat');
      const collection = db.collection('usuarios');
      const resultado = await collection.deleteOne({ _id: ObjectId(id) });
      if (resultado.deletedCount === 1) {
        res.status(204).end();
      } else {
        res.status(404).json({ erro: 'Usuário não encontrado' });
      }
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }

}

export async function login(req, res) {
  try {
    const { username } = req.body;
    const client = await conectarAoBanco();
    const db = client.db('chat');
    const collection = db.collection('usuarios');
    const usuario = await collection.findOne({ username });
    if (usuario) {
      res.json({ _id: usuario._id, username: usuario.username });
    } else {
      res.status(401).json({ erro: 'Credenciais inválidas' });
    }
  } catch (err) {
    console.error('Erro ao autenticar usuário:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

