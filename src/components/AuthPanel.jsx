const AuthPanel = ({ user, loading, error, onSignIn, onSignOut }) => {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-panel backdrop-blur-sm sm:p-5">
      <p className="text-sm font-semibold tracking-wide text-slate-500">Authentication</p>

      {loading ? (
        <p className="mt-2 text-sm font-medium text-slate-600">Checking session...</p>
      ) : user ? (
        <>
          <p className="mt-2 text-sm font-semibold text-slate-800">Signed in as</p>
          <p className="text-sm text-slate-700">{user.email || user.displayName || user.uid}</p>
          <button
            type="button"
            onClick={onSignOut}
            className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Sign in to control LED from this dashboard.
          </p>
          <button
            type="button"
            onClick={onSignIn}
            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Sign In with Google
          </button>
        </>
      )}

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </article>
  );
};

export default AuthPanel;
