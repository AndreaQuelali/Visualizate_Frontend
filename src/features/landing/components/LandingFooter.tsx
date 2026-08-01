export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background py-14">
      <div className="mx-auto grid max-w-container-max grid-cols-2 gap-10 px-gutter md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <a
            href="#"
            className="mb-4 block font-display text-xl font-bold text-foreground"
          >
            Visualizate
          </a>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Automatización creativa para equipos y comunidades que producen
            contenido visual a escala.
          </p>
        </div>
        <div>
          <h5 className="mb-4 font-mono text-label-sm uppercase tracking-widest text-muted-foreground">
            Producto
          </h5>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="#caracteristicas"
                className="text-foreground/80 hover:text-primary"
              >
                Características
              </a>
            </li>
            <li>
              <a
                href="#como-funciona"
                className="text-foreground/80 hover:text-primary"
              >
                Cómo funciona
              </a>
            </li>
            <li>
              <a
                href="#precios"
                className="text-foreground/80 hover:text-primary"
              >
                Precios
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="mb-4 font-mono text-label-sm uppercase tracking-widest text-muted-foreground">
            Compañía
          </h5>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Acerca de</li>
            <li>Blog</li>
            <li>Contacto</li>
          </ul>
        </div>
        <div>
          <h5 className="mb-4 font-mono text-label-sm uppercase tracking-widest text-muted-foreground">
            Legal
          </h5>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Privacidad</li>
            <li>Términos</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-container-max border-t border-border px-gutter pt-6 font-mono text-label-sm text-muted-foreground">
        © {year} Visualizate · todos los derechos reservados
      </div>
    </footer>
  );
}
