export default function PasswordGate({
  slug,
  title,
  error,
}: {
  slug: string
  title: string
  error?: boolean
}) {
  return (
    <main className="wrap">
      <div className="card">
        <h1>{title}</h1>
        <p className="muted">This link is password protected.</p>
        <form method="post" action={`/api/s/${slug}/unlock`} className="gate">
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            autoFocus
          />
          <button type="submit" className="btn">
            Unlock
          </button>
        </form>
        {error ? <p className="error">Incorrect password. Try again.</p> : null}
      </div>
    </main>
  )
}
