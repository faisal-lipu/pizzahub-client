export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div>
          <p className="home-kicker">Fresh from the oven</p>
          <h1>Craving pizza?</h1>
          <p className="home-description">
            Discover your favorite pizza and enjoy it hot, fresh, and delivered
            straight to your door.
          </p>
          <a className="home-button" href="/menu">
            Browse Menu
          </a>
        </div>
      </section>
    </main>
  );
}
