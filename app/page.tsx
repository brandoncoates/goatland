export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Goatland</h1>
        <p className="text-gray-600">MVP homepage</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Entertainment (Live)</h2>
        <p className="text-gray-700">Coming soon: pulled from Reddit RSS. For now, placeholder items.</p>
        <ul className="list-disc pl-5">
          <li>Story A</li>
          <li>Story B</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Sports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4"><h3 className="font-medium">MLB</h3><p className="text-sm text-gray-600">Placeholder</p></div>
          <div className="rounded-lg border p-4"><h3 className="font-medium">NFL</h3><p className="text-sm text-gray-600">Placeholder</p></div>
          <div className="rounded-lg border p-4"><h3 className="font-medium">F1</h3><p className="text-sm text-gray-600">Placeholder</p></div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Today in History</h2>
        <p className="text-gray-700">Placeholder fact for now.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Recipes</h2>
        <p className="text-gray-700">Placeholder ideas.</p>
      </section>
    </main>
  );
}

