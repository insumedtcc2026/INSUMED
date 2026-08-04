import { useState } from "react";

export interface User {
  nome: string;
  cpf: string;
  cep: string;
  data_nascimento: string;
  email: string;
  endereco: string;
  genero: string;
  telefone: string;
  raca: string;
}

const ErroUser: User = {
  nome: "Nome do usuário não encontrado",
  cpf: "CPF do usuário não encontrado",
  cep: "CEP do usuário não encontrado",
  data_nascimento: "Data de nascimento do usuário não encontrada",
  email: "Email do usuário não encontrado",
  endereco: "Endereço do usuário não encontrado",
  genero: "Gênero do usuário não encontrado",
  telefone: "Telefone do usuário não encontrado",
  raca: "Cor do usuário não encontrada",
};

export function useDadosUser() {
  const [user] = useState<User>(() => {
    const dados = localStorage.getItem("usuario");

    if (dados) {
      try {
        const dadosuser = JSON.parse(dados);
        return {
          nome: dadosuser.pac_nome || ErroUser.nome,
          cpf: dadosuser.pac_cpf || ErroUser.cpf,
          cep: dadosuser.pac_cep || ErroUser.cep,
          data_nascimento: dadosuser.pac_data_nasc || ErroUser.data_nascimento,
          email: dadosuser.pac_email || ErroUser.email,
          endereco: dadosuser.pac_endereco || ErroUser.endereco,
          genero: dadosuser.pac_sexo || ErroUser.genero,
          telefone: dadosuser.pac_telefone || ErroUser.telefone,
          raca: dadosuser.pac_raca || ErroUser.raca,
        };
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    }

    return ErroUser;
  });

  return user;
}