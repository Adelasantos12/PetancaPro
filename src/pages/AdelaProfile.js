export default function AdelaProfile() {
  const areasLong = [
    "Global Health Governance and International Cooperation",
    "Legislatures, Democratic Resilience and Health Policy",
    "International Health Law and Norm Internalization",
    "Multi-level and Comparative Governance",
    "Data and Complexity Approaches to Global Policy",
  ];

  const areasShort = [
    "Global Health Governance and International Cooperation",
    "Legislatures and Health Policy",
    "International Health Law and Norm Internalization",
  ];

  const publications = [
    {
      title:
        "COVID-19 y la marginación del poder legislativo en la gobernanza de la salud (forthcoming)",
      outlet: "UNAM – IIJ (chapter)",
      year: "2025",
      link: "#",
    },
    {
      title:
        "Gobernanza sanitaria global: retos y perspectivas de implementación en escalas local e internacional. El caso de México (doctoral thesis)",
      outlet: "UNAM",
      year: "2025",
      link: "#",
    },
    {
      title:
        "Parlamentos en tiempos de crisis: COVID-19 y el declive legislativo",
      outlet: "Agenda Legislativa",
      year: "2023",
      link: "#",
    },
    {
      title:
        "Gobernanza internacional y el sistema de salud en México: un enfoque legislativo",
      outlet: "Quórum Legislativo",
      year: "2023",
      link: "#",
    },
  ];

  const spoken = [
    { lang: "Spanish", level: "Native" },
    { lang: "English", level: "Advanced (C1)" },
    { lang: "French", level: "Intermediate (B1–B2)" },
  ];

  const profileShort = `Adela Santos is a Postdoctoral Fellow at the Global Health Centre, Geneva Graduate Institute, awarded the Swiss Government Excellence Scholarship (ESKAS). Her research examines how legislatures and governance structures shape the internalization of international health agreements, with a particular focus on Latin America. Before joining the Centre, she served as a parliamentary researcher at the Mexican Chamber of Deputies and held roles at the Jalisco State Ministry of Health and One Health Mx Institute.`;

  const profileWeb = `Adela Santos is an international relations scholar specializing in global health governance and international cooperation. She is a Postdoctoral Fellow at the Global Health Centre, Geneva Graduate Institute, awarded the Swiss Government Excellence Scholarship (ESKAS). Her research focuses on how legislatures and governance structures influence the internalization of international health norms, with a particular focus on Latin America. Before joining the Centre, she held a career position as a parliamentary researcher at the Mexican Chamber of Deputies, advised the Health Committee on aligning legislation with international standards, and served at the Jalisco State Ministry of Health and at One Health Mx Institute.`;

  return (
    <main className="min-h-screen bg-white text-zinc-900 antialiased">
      <header className="mx-auto max-w-5xl px-6 pt-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Adela Beatriz Santos Domínguez</h1>
            <p className="mt-2 text-zinc-600 text-base md:text-lg">Postdoctoral Fellow, Global Health Centre, Geneva Graduate Institute — Swiss Government Excellence Scholarship (ESKAS)</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="#contact" className="inline-flex rounded-2xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">Contact</a>
            <a href="#bio" className="inline-flex rounded-2xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800">Copy Short Bio</a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="rounded-3xl border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Profile</h2>
            <p className="mt-3 leading-relaxed">{profileWeb}</p>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 p-6 shadow-sm">
            <h3 className="font-semibold">Spoken Languages</h3>
            <ul className="mt-3 space-y-1">
              {spoken.map((s) => (
                <li key={s.lang} className="flex justify-between text-sm"><span>{s.lang}</span><span className="text-zinc-600">{s.level}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-zinc-200 p-6 shadow-sm">
            <h3 className="font-semibold">Region of Expertise</h3>
            <p className="mt-2 text-sm text-zinc-700">Latin America (focus on Mexico); Global South</p>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-5xl px-6 mt-10 grid md:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Areas of Expertise (long)</h2>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {areasLong.map((a) => (
              <li key={a} className="rounded-xl bg-zinc-50 px-3 py-2 border border-zinc-200">{a}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Areas of Expertise (short)</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-sm">
            {areasShort.map((a) => (
              <li key={a} className="rounded-xl bg-zinc-50 px-3 py-2 border border-zinc-200">{a}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 mt-10">
        <div className="rounded-3xl border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Selected Publications</h2>
          <ul className="mt-4 space-y-3">
            {publications.map((p) => (
              <li key={p.title} className="text-sm leading-relaxed">
                <span className="font-medium">{p.title}</span>{" "}
                <span className="text-zinc-600">— {p.outlet} ({p.year})</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 mt-10 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 rounded-3xl border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Short Bio</h2>
          <p className="mt-3 text-sm leading-relaxed" id="bio">{profileShort}</p>
          <p className="mt-4 text-xs text-zinc-500">Tip: copy this paragraph for directories, event programs or proposals.</p>
        </div>
        <div className="rounded-3xl border border-zinc-200 p-6 shadow-sm" id="contact">
          <h2 className="text-xl font-semibold">Contact</h2>
          <ul className="mt-3 text-sm space-y-2">
            <li>Global Health Centre, Geneva Graduate Institute</li>
            <li>Geneva, Switzerland</li>
            <li><a className="underline" href="mailto:">email@domain.tld</a> (replace)</li>
            <li><a className="underline" href="https://www.graduateinstitute.ch/globalhealth" target="_blank">GHC website</a></li>
          </ul>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 mt-12 mb-16 text-xs text-zinc-500">
        <p>Designed for a clean GHC-style profile. Edit text inline in this file. Optional: add a headshot and links.</p>
      </footer>
    </main>
  );
}
