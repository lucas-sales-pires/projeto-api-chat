import { conectarAoBanco } from '../banco.js';



export async function criarMensagem(mensagem) { 
  try {
    const { conteudo, sala, username } = mensagem;

    const client = await conectarAoBanco();
    const db = client.db('chat');
    const collection = db.collection('mensagens');

    const novaMensagem = {
      conteudo,
      sala,
      username,
      timestamp: new Date(),
    };

    const resultado = await collection.insertOne(novaMensagem);
    novaMensagem._id = resultado.insertedId; 

    return novaMensagem; 
  } catch (err) {
    console.error('Erro ao criar mensagem:', err);
    throw err; 
  }
}



export async function buscarMensagensAnteriores(req, res) {
  try {
    const { sala } = req.params; 
    
    
    const client = await conectarAoBanco();
    const db = client.db('chat');
    const collection = db.collection('mensagens');
    
    const mensagensAnteriores = await collection
    .find({ sala })
    .sort({ timestamp: 1 })
    .toArray();
    return res.status(200).json(mensagensAnteriores); 
  } catch (err) {
    console.error('Erro ao buscar mensagens anteriores:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}






