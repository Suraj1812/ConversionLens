export default function EmptyBanner({ title, description }) {
  return (
    <section className="empty-banner">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}
