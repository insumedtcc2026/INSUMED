export interface Autorizador {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
}

const ErroAutorizador: Autorizador = {
    nome: "Nome do autorizador não encontrado",
    cpf: "CPF do autorizador não encontrado",
    email: "Email do autorizador não encontrado",
    telefone: "Telefone do autorizador não encontrado",
};

export function useDadosAutorizador(): Autorizador {

    const dados = localStorage.getItem("usuario");

    console.log("================================");
    console.log("DADOS DO LOCALSTORAGE:", dados);

    if (!dados) {
        console.log("Nenhum autorizador encontrado");
        return ErroAutorizador;
    }

    try {

        const dadosAutorizador = JSON.parse(dados);

        console.log("AUTORIZADOR ENCONTRADO:", dadosAutorizador);
        console.log("NOME:", dadosAutorizador.aut_nome);
        console.log("CPF:", dadosAutorizador.aut_cpf);
        console.log("EMAIL:", dadosAutorizador.aut_email);
        console.log("TELEFONE:", dadosAutorizador.aut_tel);

        return {
            nome: dadosAutorizador.aut_nome || ErroAutorizador.nome,
            cpf: dadosAutorizador.aut_cpf || ErroAutorizador.cpf,
            email: dadosAutorizador.aut_email || ErroAutorizador.email,
            telefone: dadosAutorizador.aut_tel || ErroAutorizador.telefone,
        };

    } catch (error) {

        console.error("Erro ao converter autorizador:", error);

        return ErroAutorizador;
    }
}