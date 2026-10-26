import '../../css/universais/LayoutAdmin.css';

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarPlus, ChevronDown, LogOut, Pin, PinOff, UserCog, X } from 'lucide-react';

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

// preferência do administrador: menu fixo (sempre aberto) ou abre pelo ☰
const CHAVE_FIXO = 'adm_menu_fixo';

function lerFixo(): boolean {
  try {
    return localStorage.getItem(CHAVE_FIXO) !== 'nao';
  } catch {
    return true;
  }
}

/**
 * Menu lateral do administrador. No tablet e no computador ele empurra a
 * página para o lado (não fica por cima dela) e o administrador escolhe,
 * pelo alfinete, se ele fica fixo ou se abre e fecha pelo ☰. No celular a
 * navegação é a barra inferior. As funções ficam agrupadas pelo tipo de
 * trabalho e "Atividades da unidade" (registro, horários e equipe) fica
 * recolhida, com "Insumos" logo abaixo.
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const contadores = useContadoresAdmin();
  const universal = adminUniversal();

  const [fixo, setFixo] = useState(lerFixo);

  // classes no body: layout do admin, menu fixo e menu aberto pelo ☰
  useEffect(() => {
    document.body.classList.add('layout-admin');
    return () => document.body.classList.remove('layout-admin', 'adm-menu-fixo', 'adm-menu-aberto');
  }, []);

  useEffect(() => {
    document.body.classList.toggle('adm-menu-fixo', fixo);
  }, [fixo]);

  useEffect(() => {
    document.body.classList.toggle('adm-menu-aberto', isOpen);
  }, [isOpen]);

  function alternarFixo() {
    const novo = !fixo;
    setFixo(novo);
    try {
      localStorage.setItem(CHAVE_FIXO, novo ? 'sim' : 'nao');
    } catch {
      /* sem armazenamento: vale só nesta tela */
    }
    // ao soltar, o menu continua aberto até a pessoa fechar
    // (nas páginas, onClose alterna o estado; aqui ele abre)
    if (!novo && !isOpen) onClose();
  }

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
          <div className="adm-lateral-acoes">
            <button
              type="button"
              onClick={alternarFixo}
              className="adm-lateral-fixar"
              aria-pressed={fixo}
              aria-label={fixo ? 'Soltar o menu (abrir pelo botão ☰)' : 'Fixar o menu aberto'}
              title={fixo ? 'Soltar o menu' : 'Fixar o menu'}
            >
              {fixo ? <PinOff aria-hidden="true" size={18} /> : <Pin aria-hidden="true" size={18} />}
            </button>
            <button onClick={onClose} className="adm-lateral-fechar" aria-label="Fechar menu">
              <X aria-hidden="true" />
            </button>
          </div>
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
                  {grupo.depois?.map((item) => renderItem(item))}
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
            className="adm-item adm-item--sair"
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
