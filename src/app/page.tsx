
const programas = [
  {
    categoria: "FORMACIÓN PROFESIONAL",
    titulo: "Licenciaturas",
    descripcion:
      "Construye tu futuro profesional con una formación orientada al conocimiento y la innovación.",
    numero: "01",
  },
  {
    categoria: "ESPECIALIZACIÓN",
    titulo: "Diplomados",
    descripcion:
      "Fortalece tus conocimientos y desarrolla nuevas competencias para crecer profesionalmente.",
    numero: "02",
  },
  {
    categoria: "APRENDIZAJE CONTINUO",
    titulo: "Cursos y certificaciones",
    descripcion:
      "Aprende nuevas habilidades y avanza en tu desarrollo profesional a tu propio ritmo.",
    numero: "03",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* encabezado */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <a
            href="#inicio"
            className="text-3xl font-extrabold tracking-tight text-slate-900"
          >
            IINICIA<span className="text-teal-600">.</span>
          </a>

          <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-600">
            <a href="#inicio" className="transition hover:text-teal-700">
              Inicio
            </a>
            <a href="#universidad" className="transition hover:text-teal-700">
              Universidad
            </a>
            <a href="#oferta" className="transition hover:text-teal-700">
              Oferta académica
            </a>
            <a href="#admisiones" className="transition hover:text-teal-700">
              Admisiones
            </a>
            <a href="#contacto" className="transition hover:text-teal-700">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
            >
              Iniciar sesión
            </a>
            <a
              href="/registro"
              className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white transition hover:bg-teal-800"
            >
              Registrarme
            </a>
          </div>
        </div>
      </header>

      {/* portada */}
      <section id="inicio" className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
              Educación · Innovación · Futuro
            </p>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
              Tu siguiente paso comienza con IINICIA
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Explora oportunidades de aprendizaje, desarrolla tus habilidades
              y construye tu camino profesional.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#oferta"
                className="rounded-lg bg-teal-700 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                Explorar programas
              </a>
              <a
                href="/registro"
                className="rounded-lg border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
              >
                Crear una cuenta
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
              <span>Formación académica</span>
              <span>Desarrollo profesional</span>
              <span>Aprendizaje continuo</span>
            </div>
          </div>

          {/* tarjeta destacada */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm md:p-10">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-2xl font-bold text-teal-800">
              I
            </div>

            <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
              Aprende a tu manera
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-snug text-slate-900">
              Tu educación, más cerca
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Consulta la oferta académica y accede a tus espacios de aprendizaje
              desde una sola plataforma.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-3xl font-extrabold text-teal-700">01</p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  Explora programas
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-3xl font-extrabold text-teal-700">02</p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  Accede al campus
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* universidad */}
      <section id="universidad" className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
            Conoce IINICIA
          </p>

          <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            Aprende, crece y transforma tu futuro
          </h2>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Estamos preparando un espacio digital para conocer la institución,
            consultar programas académicos y facilitar el acceso a los servicios
            educativos.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900">
                Nuestra misión
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Conoce los objetivos y principios que orientan a la institución.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900">
                Modelo educativo
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Descubre cómo se organiza la experiencia de aprendizaje.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900">
                Comunidad IINICIA
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Un espacio para estudiantes, docentes y aspirantes.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* oferta académica */}
      <section id="oferta" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
            Encuentra tu camino
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
            Nuestra oferta académica
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Explora las opciones de formación y encuentra el programa que se
            adapte a tus objetivos.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {programas.map((programa) => (
              <article
                key={programa.numero}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-lg font-extrabold text-teal-800">
                  {programa.numero}
                </div>

                <p className="mt-6 text-xs font-bold tracking-wider text-teal-700">
                  {programa.categoria}
                </p>

                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  {programa.titulo}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {programa.descripcion}
                </p>

                <a
                  href="/registro"
                  className="mt-6 inline-block font-semibold text-teal-700 transition hover:text-teal-900"
                >
                  Conocer más →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* admisiones */}
      <section id="admisiones" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-3xl border border-teal-100 bg-teal-50 p-8 md:flex md:items-center md:justify-between md:p-12">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-teal-800">
                Admisiones
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Comienza una nueva etapa
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Regístrate en el portal para preparar tu perfil y conocer los
                siguientes pasos del proceso de admisión.
              </p>
            </div>

            <a
              href="/registro"
              className="mt-6 inline-block shrink-0 rounded-lg bg-teal-700 px-6 py-3 font-bold text-white transition hover:bg-teal-800 md:mt-0"
            >
              Iniciar registro
            </a>
          </div>
        </div>
      </section>

      {/* contacto */}
      <section id="contacto" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="text-2xl font-bold text-slate-900">Contacto</h2>
          <p className="mt-3 max-w-xl leading-7 text-slate-600">
            Próximamente incorporaremos aquí los datos de contacto oficiales
            de IINICIA.
          </p>
        </div>
      </section>

      {/* pie de página */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p className="text-lg font-extrabold text-slate-900">
            IINICIA<span className="text-teal-600">.</span>
          </p>
          <p>Portal institucional · Proyecto de rediseño y migración</p>
        </div>
      </footer>
    </main>
  );
}
