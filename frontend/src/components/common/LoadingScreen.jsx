export default function LoadingScreen({ message = 'Carregando...', fullscreen = false }) {
  return (
    <div className={`loading-screen ${fullscreen ? 'loading-screen--fullscreen' : ''}`}>
      <div className="loading-screen__spinner" />
      <p>{message}</p>
    </div>
  );
}
