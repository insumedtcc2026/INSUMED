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

    const dados = localStorage.getItem("usuario");

    console.log("================================");
    console.log("DADOS DO LOCALSTORAGE:", dados);

    if (!dados) {
        console.log("Nenhum usuário encontrado");
        return ErroAdmin;
    }

    try {

        const dadosAdmin = JSON.parse(dados);

        console.log("ADMIN ENCONTRADO:", dadosAdmin);
        console.log("NOME:", dadosAdmin.adm_nome);
        console.log("CPF:", dadosAdmin.adm_cpf);

        return {
            nome: dadosAdmin.adm_nome || ErroAdmin.nome,
            cpf: dadosAdmin.adm_cpf || ErroAdmin.cpf,
            email: dadosAdmin.adm_email || ErroAdmin.email,
            telefone: dadosAdmin.adm_tel || ErroAdmin.telefone,
        };

    } catch (error) {

        console.error("Erro ao converter usuário:", error);

        return ErroAdmin;
    }
}