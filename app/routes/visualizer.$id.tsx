import { useLocation, useParams } from "react-router";

const Visualizer = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const base64Image = (state as { base64Image?: string } | null)?.base64Image;

  return (
    <main className="visualizer-route flex-col gap-4 p-6">
      {base64Image ? (
        <>
          <h1 className="text-xl font-bold">Floor plan preview</h1>
          <img
            src={base64Image}
            alt="Uploaded floor plan preview"
            className="max-h-[80vh] max-w-full rounded-xl object-contain"
          />
          <p className="text-xs text-zinc-500">Project ID: {id}</p>
        </>
      ) : (
        <p className="text-zinc-600">No uploaded floor plan was found for this project.</p>
      )}
    </main>
  );
};

export default Visualizer;
