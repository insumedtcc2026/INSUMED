import '../../css/universais/LayoutAdmin.css';

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarPlus, ChevronDown, LogOut, UserCog, X } from 'lucide-react';

import logo from '../../assets/home/Logo.webp';
import { sairDoPerfil } from './sessao';
import {
  GRUPOS_MENU_ADMIN,
  INICIO_ADMIN,
  adminUniversal,
  itemAtivo,
  type ItemMenuAdmin,
} from './menuAdmin';
import { useContadoresAdmin } from '../../hook/useContadoresAdmin';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// cor do contador: tarefa (azul), pedido do paciente (amarelo), alerta (vermelho)
const TOM_CONTADOR: Record<string, string> = {
  coletasHoje: '',
  pendentes: '',
  pedidosOutraData: 'adm-contador--atencao',
  estoqueBaixo: 'adm-contador--alerta',
};

/**
 * Menu lateral do administrador. No computador (a partir de 1024px) fica
 * sempre aberto ao lado do conteúdo; no tablet e no celular continua como
 * gaveta aberta pelo ☰. As funções ficam agrupadas pelo tipo de trabalho e
 * "Atividades da unidade" (registro, horários e equipe) fica recolhida.
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const contadores = useContadoresAdmin();
  const universal = adminUniversal();

  // o body ganha a classe que abre espaço para o menu fixo
  useEffect(() => {
    document.body.classList.add('layout-admin');
    return () => document.body.classList.remove('layout-admin');
  }, []);

  const grupoUnidade = GRUPOS_MENU_ADMIN.find((g) => g.recolhivel);
  const unidadeAtiva = Boolean(grupoUnidade?.itens.some((i) => itemAtivo(i, pathname)));
  const [unidadeAberta, setUnidadeAberta] = useState(unidadeAtiva);

  function ir(caminho: string) {
    navigate(caminho);
    if (isOpen) onClose();
  }

  function renderItem(item: ItemMenuAdmin, sub = false) {
    const ativo = itemAtivo(item, pathname);
    const n = item.contador && contadores ? contadores[item.contador] : 0;
    const { Icone } = item;
    return (
      <button
        key={item.caminho}
        type="button"
        onClick={() => ir(item.caminho)}
        className={`adm-item ${sub ? 'adm-item--sub' : ''} ${ativo ? 'adm-item--ativo' : ''}`}
        aria-current={ativo ? 'page' : undefined}
      >
        {!sub && <Icone className="adm-item-icone" aria-hidden="true" />}
        <span className="adm-item-texto">{item.rotulo}</span>
        {n > 0 && (
          <span className={`adm-contador ${TOM_CONTADOR[item.contador ?? ''] ?? ''}`} aria-label={`${n} pendentes`}>
            {n}
          </span>
        )}
        {sub && item.soUniversal && <span className="adm-etiqueta">universal</span>}
      </button>
    );
  }

  return (
    <>
      {isOpen && <div className="adm-lateral-fundo" onClick={onClose} />}

      <aside className={`adm-lateral ${isOpen ? 'adm-lateral--aberta' : ''}`} aria-label="Menu do administrador">
        <div className="adm-lateral-topo">
          <img src={logo} alt="Logo Insumed" className="adm-lateral-logo" />
          <button onClick={onClose} className="adm-lateral-fechar" aria-label="Fechar menu">
            <X aria-hidden="true" />
          </button>
        </div>

        <button type="button" className="adm-novo" onClick={() => ir('/Agendamentosadm?novo=1')}>
          <CalendarPlus aria-hidden="true" size={18} /> Novo agendamento
        </button>

        <nav className="adm-nav">
          {renderItem(INICIO_ADMIN)}

          {GRUPOS_MENU_ADMIN.map((grupo) => {
            const itens = grupo.itens.filter((i) => !i.soUniversal || universal);
            if (grupo.recolhivel) {
              const { Icone, rotulo } = grupo.recolhivel;
              return (
                <div key={grupo.titulo} className="adm-grupo">
                  <p className="adm-grupo-titulo">{grupo.titulo}</p>
                  <button
                    type="button"
                    className={`adm-item ${unidadeAtiva && !unidadeAberta ? 'adm-item--ativo' : ''}`}
                    aria-expanded={unidadeAberta}
                    onClick={() => setUnidadeAberta((v) => !v)}
                  >
                    <Icone className="adm-item-icone" aria-hidden="true" />
                    <span className="adm-item-texto">{rotulo}</span>
                    <ChevronDown className={`adm-seta ${unidadeAberta ? 'adm-seta--aberta' : ''}`} aria-hidden="true" />
                  </button>
                  {unidadeAberta && itens.map((item) => renderItem(item, true))}
                </div>
              );
            }
            return (
              <div key={grupo.titulo} className="adm-grupo">
                <p className="adm-grupo-titulo">{grupo.titulo}</p>
                {itens.map((item) => renderItem(item))}
              </div>
            );
          })}
        </nav>

        <div className="adm-lateral-rodape">
          {renderItem({ rotulo: 'Meu perfil', caminho: '/perfil-admin', Icone: UserCog })}
          <button
            type="button"
            className="adm-item adm-item--discreto"
            onClick={() => {
              sairDoPerfil('ADMIN');
              ir('/login');
            }}
          >
            <LogOut className="adm-item-icone" aria-hidden="true" />
            <span className="adm-item-texto">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
