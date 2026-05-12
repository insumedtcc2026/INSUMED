export default function Footer() {
  return (
    <footer className="w-full bg-blue-700 text-white px-6 md:px-16 py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        
        {/* LOGO */}
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-bold tracking-wide">
            INSUMED
          </h1>
        </div>

        {/* LINKS */}
        <div className="flex flex-1 gap-16 text-sm">
          <ul className="space-y-2">
            <li>Unidades</li>
            <li>Ajuda</li>
            <li>Contatos</li>
          </ul>

          <ul className="space-y-2">
            <li>Trabalhe Conosco</li>
            <li>Seja Sócio</li>
            <li>Remoção de Dados</li>
            <li>Política de Privacidade</li>
          </ul>
        </div>

        {/* NEWSLETTER + CONTATO */}
        <div className="flex-1 space-y-4">
          <h2 className="uppercase text-sm tracking-widest">
            Newsletter
          </h2>

          {/* INPUT */}
          <div className="flex items-center border border-white/50 rounded-full overflow-hidden">
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent px-4 py-2 w-full outline-none text-sm placeholder-white/70"
            />
            <button className="px-4 text-white text-lg">
              →
            </button>
          </div>

          {/* CHECKBOX */}
          <div className="flex items-center gap-2 text-xs">
            <input type="checkbox" />
            <span>Aceito a política de privacidade</span>
          </div>

          {/* CONTATOS */}
          <div className="text-xs space-y-2 mt-4">
            <p>📍 Rua dos Ventos, 123, Centro, Volta Redonda - RJ, 27180-000</p>
            <div className="flex justify-between flex-wrap gap-2">
              <span>✉️ insumed@gmail.com</span>
              <span>📞 (24) 33816722</span>
            </div>
            <div className="flex justify-between flex-wrap gap-2">
              <span>Instagram: @insumed</span>
              <span>🌐 www.insumed.com</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}