import mongoose from 'mongoose';

const salaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true, 
    trim: true    
  },
  descricao: {
    type: String,
    trim: true
  },
  criador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario' 
  },
  participantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  mensagens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mensagem'
  }]
});

const Sala = mongoose.model('Sala', salaSchema);
export default Sala;
