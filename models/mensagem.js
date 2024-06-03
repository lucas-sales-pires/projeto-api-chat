import mongoose from 'mongoose';

const mensagemSchema = new mongoose.Schema({
  salaId: String,
  remetente: String,
  texto: String,
  timestamp: Date,
});

const Mensagem = mongoose.model('Mensagem', mensagemSchema);

export default Mensagem;

