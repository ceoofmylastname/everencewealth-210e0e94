export default function PresentationV2() {
  return (
    <iframe
      src="/presentation-v2.html"
      title="Everence — Bridging the Gap"
      allow="autoplay; fullscreen; encrypted-media"
      allowFullScreen
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        display: "block",
      }}
    />
  );
}