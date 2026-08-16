import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export function useValidarToken() {
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const validarToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        await axios.get("https://backend-insumed-lhac.vercel.app/validar", { 
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        setVerificando(false);
      } catch (error) {
        console.error("Erro ao validar o token: ", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        Swal.fire({
          icon: 'error',
          title: 'Sessão Expirada',
          text: 'Por favor, faça login novamente.',
          confirmButtonColor: '#d33'
        }).then(() => {
          navigate("/login");
        });
      }
    };

    validarToken();
  }, [navigate]);

  return { verificando };
}