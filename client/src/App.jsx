function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-juju-noir text-juju-texte px-6">
      <div className="text-center max-w-md">
        <h1 className="juju-wordmark text-7xl text-juju-dore mb-4">Juju</h1>
        <p className="text-juju-texte-mute text-lg mb-12">
          Ta garde-robe, sur toi, oui.
        </p>

        <div className="space-y-4">
          <button className="w-full py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors">
            Se connecter
          </button>
          <button className="w-full py-3 bg-transparent border border-juju-bordure text-juju-texte rounded-lg hover:bg-juju-bleu transition-colors">
            Créer un compte
          </button>
        </div>

        <p className="text-juju-texte-mute text-xs mt-12">
          Appli en cours de création...
        </p>
      </div>
    </div>
  );
}

export default App;