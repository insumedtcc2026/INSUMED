export default function TutorialSection() {
  return (
    <section className="w-full py-12 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
        
        {/* TEXTO + VIDEO */}
        <div className="flex-1">
          <h2 className="text-blue-600 font-bold text-3xl md:text-4xl leading-tight">
            ESTÁ COM DIFICULDADE DE USAR NOSSO SITE?
          </h2>

          <p className="mt-4 text-gray-700 text-lg">
            Assista a esse simples tutorial que nossa equipe preparou para você!
          </p>

          {/* VIDEO */}
          <div className="mt-6">
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/Vgx6l-WaNnU"
                title="Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* IMAGEM DIREITA */}
        <div className="flex-1 flex justify-end">
          <img
            src="src\assets\images\idosa.png" 
            alt="Pessoa"
            className="max-h-[600px] object-contain translate-x-6 -mr-6 md:-mr-16"
          />
        </div>
      </div>
    </section>
  );
}