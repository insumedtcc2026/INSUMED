import { exibirCPF, exibirTelefone } from "../utils/validacoes";

export interface Admin {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
}

const ErroAdmin: Admin = {
    nome: "Nome do administrador não encontrado",
    cpf: "CPF do administrador não encontrado",
    email: "Email do administrador não encontrado",
    telefone: "Telefone do administrador não encontrado",
};

export function useDadosAdmin(): Admin {

    const dados = localStorage.getItem("usuario_admin");


    if (!dados) {
        console.log("Nenhum usuário encontrado");
        return ErroAdmin;
    }

    try {

        const dadosAdmin = JSON.parse(dados);


        return {
            nome: dadosAdmin.adm_nome || ErroAdmin.nome,
            cpf: dadosAdmin.adm_cpf ? exibirCPF(dadosAdmin.adm_cpf) : ErroAdmin.cpf,
            email: dadosAdmin.adm_email || ErroAdmin.email,
            telefone: dadosAdmin.adm_tel ? exibirTelefone(dadosAdmin.adm_tel) : ErroAdmin.telefone,
        };

    } catch (error) {

        console.error("Erro ao converter usuário:", error);

        return ErroAdmin;
    }
}