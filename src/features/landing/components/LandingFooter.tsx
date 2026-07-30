export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-outline-variant bg-card py-16">
      <div className="mx-auto grid max-w-container-max grid-cols-2 gap-12 px-gutter md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <a
            href="#"
            className="mb-6 block text-headline-md font-bold text-foreground"
          >
            Visualizate
          </a>
          <p className="pr-10 text-sm leading-relaxed text-muted-foreground">
            La plataforma líder en automatización creativa para equipos modernos
            y comunidades digitales.
          </p>
        </div>
        <div>
          <h5 className="mb-6 font-bold text-foreground">Producto</h5>
          <ul className="space-y-4">
            <li>
              <a
                href="#caracteristicas"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Características
              </a>
            </li>
            <li>
              <a
                href="#como-funciona"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Plantillas
              </a>
            </li>
            <li>
              <a
                href="#precios"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Precios
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="mb-6 font-bold text-foreground">Compañía</h5>
          <ul className="space-y-4">
            <li>
              <span className="text-muted-foreground">Acerca de</span>
            </li>
            <li>
              <span className="text-muted-foreground">Blog</span>
            </li>
            <li>
              <span className="text-muted-foreground">Contacto</span>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="mb-6 font-bold text-foreground">Legal</h5>
          <ul className="space-y-4">
            <li>
              <span className="text-muted-foreground">Privacidad</span>
            </li>
            <li>
              <span className="text-muted-foreground">Términos</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-20 max-w-container-max border-t border-outline-variant px-gutter pt-8 text-center text-sm text-muted-foreground">
        © {year} Visualizate. Todos los derechos reservados.
      </div>
    </footer>
  );
}
