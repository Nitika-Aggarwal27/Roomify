import { useLocation, useParams } from "react-router";

const Visualizer = () => {
  const { id } = useParams();
  const location = useLocation();
  const state = (location.state || {}) as VisualizerLocationState;

  // Keep the uploaded image available if the visualizer URL is refreshed.
  const storedProject = id && typeof window !== "undefined"
    ? window.sessionStorage.getItem(`roomify-project-${id}`)
    : null;
  const project = storedProject
    ? (JSON.parse(storedProject) as VisualizerLocationState)
    : {};
  const initialImage = state.initialImage || project.initialImage;
  const initialRender = state.initialRender || project.initialRender;
  const name = state.name || project.name || "Untitled Project";

  return (
    <section>
      <h1>{name}</h1>
      <div className="visualizer">
        {initialImage ? (
          <div className="image-container">
            <h2>Source Image</h2>
            <img src={initialImage} alt="Uploaded floor plan" />
          </div>
        ) : (
          <p>Floor plan image is unavailable. Please upload it again.</p>
        )}
        {initialRender && (
          <div className="image-container">
            <h2>Rendered Image</h2>
            <img src={initialRender} alt="Rendered room design" />
          </div>
        )}
      </div>
    </section>
  );
};

export default Visualizer;
