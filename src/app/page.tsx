
import EstadoAPI from "./EstadoAPI";
import ListaRoles from "./ListaRoles";

const programas = [
  {
    categoria: "FORMACIÓN PROFESIONAL",
    titulo: "Licenciaturas",
    descripcion:
      "Construye tu futuro profesional con una formación orientada al conocimiento y la innovación.",
    numero: "01",
    icono: "⌘",
  },
  {
    categoria: "ESPECIALIZACIÓN",
    titulo: "Diplomados",
    descripcion:
      "Fortalece tus conocimientos y desarrolla nuevas competencias para crecer profesionalmente.",
    numero: "02",
    icono: "◇",
  },
  {
    categoria: "APRENDIZAJE CONTINUO",
    titulo: "Cursos y certificaciones",
    descripcion:
      "Aprende nuevas habilidades y avanza en tu desarrollo profesional a tu propio ritmo.",
    numero: "03",
    icono: "✳",
  },
];

const caracteristicas = [
  {
    numero: "01",
    titulo: "Innovación",
    descripcion:
      "Impulsamos nuevas ideas y soluciones mediante el conocimiento y la tecnología.",
  },
  {
    numero: "02",
    titulo: "Conocimiento",
    descripcion:
      "Promovemos el aprendizaje y el desarrollo de habilidades para el futuro.",
  },
  {
    numero: "03",
    titulo: "Tecnología",
    descripcion:
      "Integramos herramientas digitales para enriquecer la experiencia educativa.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080B18] text-white">
      {/* encabezado */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090D1B]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-2 md:px-8">
          <a href="#inicio" className="shrink-0">
            <img
              src="/logo-iinicia.png"
              alt="IINICIA - Instituto de Innovación y Ciencias Aplicadas"
              className="h-[76px] w-[100px] object-contain md:h-[84px] md:w-[112px]"
            />
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 lg:flex">
            <a href="#inicio" className="transition hover:text-[#00B9E8]">
              Inicio
            </a>
            <a href="#universidad" className="transition hover:text-[#00B9E8]">
              Universidad
            </a>
            <a href="#oferta" className="transition hover:text-[#00B9E8]">
              Oferta académica
            </a>
            <a href="#admisiones" className="transition hover:text-[#00B9E8]">
              Admisiones
            </a>
            <a href="#contacto" className="transition hover:text-[#00B9E8]">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/login"
              className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#0864F5] hover:bg-white/5 sm:px-5 sm:text-sm"
            >
              Iniciar sesión
            </a>
            <a
              href="/registro"
              className="rounded-lg bg-[#0864F5] px-3 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#0052D6] sm:px-5 sm:text-sm"
            >
              Registrarme
            </a>
          </div>
        </div>
      </header>

      {/* portada */}
      <section
        id="inicio"
        className="relative isolate overflow-hidden bg-[#080B18]"
      >
        <div className="pointer-events-none absolute -left-40 top-10 h-[450px] w-[450px] rounded-full bg-[#0864F5]/20 blur-[130px]" />
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#00B9E8]/10 blur-[140px]" />

        <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:55px_55px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-[#0864F5]/40 bg-[#0864F5]/10 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00B9E8]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#66D9F5]">
                Educación · Innovación · Futuro
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
              El futuro comienza con{" "}
              <span className="bg-gradient-to-r from-[#0864F5] via-[#00B9E8] to-[#75E5FF] bg-clip-text text-transparent">
                nuevas ideas.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
              En IINICIA conectamos educación, innovación y tecnología para
              impulsar el conocimiento y construir nuevas oportunidades
              profesionales.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#oferta"
                className="group inline-flex items-center gap-3 rounded-xl bg-[#0864F5] px-7 py-4 font-bold text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-[#0052D6]"
              >
                Explorar programas
                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="/registro"
                className="rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-bold text-white transition hover:border-[#00B9E8] hover:bg-white/10"
              >
                Crear una cuenta
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-7 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <span className="text-[#00B9E8]">✦</span>
                Formación académica
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#00B9E8]">✦</span>
                Desarrollo profesional
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#00B9E8]">✦</span>
                Tecnología educativa
              </span>
            </div>
          </div>

          {/* imagen destacada */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-[#0864F5]/30 to-[#00B9E8]/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#111A31] p-3 shadow-2xl shadow-blue-950/50">
              <div className="relative h-[390px] overflow-hidden rounded-[1.5rem] md:h-[470px]">
                <img
                  src="/estudiantes-iinicia.jpg"
                  alt="Estudiantes universitarios colaborando en un proyecto"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#080B18] via-[#080B18]/15 to-transparent" />

                <div className="absolute left-5 top-5 rounded-xl border border-white/20 bg-[#080B18]/70 px-4 py-3 backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#75E5FF]">
                    Instituto IINICIA
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    Aprende. Innova. Crece.
                  </p>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-1 w-8 rounded-full bg-[#00B9E8]" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#75E5FF]">
                      Tu siguiente capítulo
                    </span>
                  </div>

                  <h2 className="max-w-sm text-3xl font-extrabold leading-tight text-white md:text-4xl">
                    Aprende hoy para transformar mañana.
                  </h2>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 -left-4 rounded-2xl border border-[#00B9E8]/30 bg-[#101B32] p-4 shadow-xl md:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0864F5]/20 text-2xl text-[#75E5FF]">
                  ✧
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Educación digital
                  </p>
                  <p className="text-xs text-slate-400">
                    Conocimiento sin límites
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#0864F5] to-transparent" />
      </section>

      {/* universidad */}
      <section
        id="universidad"
        className="relative bg-[#0D1325] px-5 py-24 md:px-8"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#0864F5]/10 blur-[110px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#00B9E8]">
                Conoce IINICIA
              </p>

              <h2 className="mt-5 text-3xl font-extrabold leading-tight text-white md:text-5xl">
                El conocimiento es el comienzo de todo.
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-400">
                Somos un espacio orientado a la innovación y las ciencias
                aplicadas, donde la educación y la tecnología se unen para
                abrir nuevas posibilidades de aprendizaje.
              </p>

              <a
                href="#oferta"
                className="mt-8 inline-flex items-center gap-3 font-bold text-[#75E5FF] transition hover:gap-5"
              >
                Descubre nuestra oferta
                <span>→</span>
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {caracteristicas.map((item) => (
                <article
                  key={item.numero}
                  className="group rounded-2xl border border-white/10 bg-[#151E35] p-6 transition duration-300 hover:-translate-y-2 hover:border-[#0864F5]/70 hover:bg-[#192644]"
                >
                  <span className="text-sm font-extrabold text-[#00B9E8]">
                    {item.numero}
                  </span>
                  <div className="my-6 h-1 w-10 rounded-full bg-gradient-to-r from-[#0864F5] to-[#00B9E8] transition-all group-hover:w-16" />
                  <h3 className="text-xl font-bold text-white">
                    {item.titulo}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {item.descripcion}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* oferta académica */}
      <section id="oferta" className="relative bg-[#080B18] px-5 py-24 md:px-8">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#0864F5]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#00B9E8]">
              Encuentra tu camino
            </p>

            <h2 className="mt-4 text-3xl font-extrabold text-white md:text-5xl">
              Nuestra oferta académica
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Explora las opciones de formación y encuentra el programa que
              mejor se adapte a tus objetivos y aspiraciones profesionales.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {programas.map((programa) => (
              <article
                key={programa.numero}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#11182B] p-7 transition duration-300 hover:-translate-y-2 hover:border-[#0864F5]/70 hover:shadow-2xl hover:shadow-blue-950/40"
              >
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#0864F5]/10 blur-2xl transition group-hover:bg-[#00B9E8]/20" />

                <div className="relative flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0864F5]/30 bg-[#0864F5]/10 text-2xl font-bold text-[#75E5FF]">
                    {programa.icono}
                  </div>

                  <span className="text-4xl font-black text-white/10">
                    {programa.numero}
                  </span>
                </div>

                <p className="relative mt-8 text-xs font-bold tracking-[0.16em] text-[#00B9E8]">
                  {programa.categoria}
                </p>

                <h3 className="relative mt-3 text-2xl font-extrabold text-white">
                  {programa.titulo}
                </h3>

                <p className="relative mt-4 min-h-[100px] text-sm leading-7 text-slate-400">
                  {programa.descripcion}
                </p>

                <a
                  href="/registro"
                  className="relative mt-7 inline-flex items-center gap-2 font-bold text-[#75E5FF] transition group-hover:gap-4"
                >
                  Conocer más <span>→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* admisiones */}
      <section
        id="admisiones"
        className="relative overflow-hidden bg-[#0D1427] px-5 py-20 md:px-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0864F5]/20 via-transparent to-[#00B9E8]/10" />
        <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full border border-[#00B9E8]/20" />
        <div className="absolute -right-8 -top-28 h-72 w-72 rounded-full border border-[#0864F5]/30" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 rounded-3xl border border-[#0864F5]/30 bg-[#111A30]/80 p-8 backdrop-blur-md md:flex-row md:items-center md:justify-between md:p-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#75E5FF]">
              Admisiones
            </p>

            <h2 className="mt-4 text-3xl font-extrabold text-white md:text-4xl">
              Tu próxima gran oportunidad comienza aquí.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Crea tu cuenta en IINICIA y comienza a explorar las oportunidades
              de formación que tenemos para ti.
            </p>
          </div>

          <a
            href="/registro"
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-[#0864F5] px-7 py-4 font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-[#0052D6]"
          >
            Iniciar registro <span>→</span>
          </a>
        </div>
      </section>

      {/* contacto */}
      <section
        id="contacto"
        className="border-t border-white/10 bg-[#080B18] px-5 py-16 md:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
              Estamos para ayudarte
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">
              Conecta con IINICIA
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-400">
              Próximamente incorporaremos aquí los datos de contacto oficiales
              del Instituto de Innovación y Ciencias Aplicadas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <a
              href="/login"
              className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-[#00B9E8] hover:text-[#75E5FF]"
            >
              Acceder al portal
            </a>
            <a
              href="/registro"
              className="rounded-xl bg-[#0864F5] px-6 py-3 font-bold text-white transition hover:bg-[#0052D6]"
            >
              Registrarme
            </a>
          </div>
        </div>
      </section>

      {/* pie de página */}
      <footer className="border-t border-white/10 bg-[#050711] px-5 py-7 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <a href="#inicio">
            <img
              src="/logo-iinicia.png"
              alt="IINICIA"
              className="h-[72px] w-[105px] object-contain"
            />
          </a>

          <p className="text-center text-xs text-slate-500">
            Instituto de Innovación y Ciencias Aplicadas · Portal institucional
          </p>

          <a
            href="#inicio"
            className="text-sm font-semibold text-[#75E5FF] transition hover:text-white"
          >
            Volver arriba ↑
          </a>
        </div>
      </footer>

      <EstadoAPI />
      <ListaRoles />
    </main>
  );
}
