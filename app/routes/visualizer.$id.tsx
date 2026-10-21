// import {useLocation, useNavigate, useParams} from "react-router";
//
// const Visualizer = () => {
//     const {navigate} = useNavigate()
//   const { id } = useParams();
//   const location = useLocation();
//   const state = (location.state || {}) as VisualizerLocationState;
//
//   // Keep the uploaded image available if the visualizer URL is refreshed.
//   const storedProject = id && typeof window !== "undefined"
//     ? window.sessionStorage.getItem(`roomify-project-${id}`)
//     : null;
//   const project = storedProject
//     ? (JSON.parse(storedProject) as VisualizerLocationState)
//     : {};
//   const initialImage = state.initialImage || project.initialImage;
//   const initialRender = state.initialRender || project.initialRender;
//   const name = state.name || project.name || "Untitled Project";
//
//   return (
//     <section>
//       <h1>{name}</h1>
//       <div className="visualizer">
//         {initialImage ? (
//           <div className="image-container">
//             <h2>Source Image</h2>
//             <img src={initialImage} alt="Uploaded floor plan" />
//           </div>
//         ) : (
//           <p>Floor plan image is unavailable. Please upload it again.</p>
//         )}
//         {initialRender && (
//           <div className="image-container">
//             <h2>Rendered Image</h2>
//             <img src={initialRender} alt="Rendered room design" />
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };
//
// export default Visualizer;


import {useLocation, useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {generate3DView} from "../../lib/ai.action";
import {Box, Download, RefreshCcw, Share2, X} from "lucide-react";
import Button from "../../components/ui/Button";

const VisualizerId = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { initialImage,initialRender, name} = location.state || {}

    const hasInitialGenerated = useRef(false)

    const [isProcessing, setIsProcessing] = useState(false)
    const [currentImage, setCurrentImage] = useState<string | null>(initialRender || null)

    const handleBack = () => navigate('/')

    const runGeneration = async () => {
        if(!initialImage) return

        try{
            setIsProcessing(true)
            const result = await generate3DView({sourceImage: initialImage})

            if(result.renderedImage){
                setCurrentImage(result.renderedImage)

                //update the project with the renedered image.
            }
        } catch(error){
            console.error('Generation failed: ',error)
        } finally {
            setIsProcessing(false)
        }
    }

    useEffect(() => {
        if(!initialImage || hasInitialGenerated.current) return

        if(initialRender){
            setCurrentImage(initialRender)
            hasInitialGenerated.current = true
            return;
        }

        hasInitialGenerated.current = true
        runGeneration()
    }, [initialImage, initialRender]);

    return (
            <div className='visualizer'>
                <nav className='topbar'>
                    <div className='brand'>
                        <Box className="logo"/>
                        <span className="name">
                            Roomify
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                        <X className="icon"/> Exit Editor
                    </Button>
                </nav>

                <section className='content'>
                    <div className="panel">
                        <div className="panel-header">
                            <div className="panel-meta">
                                <p>Project</p>
                                <h2>{"Untitled Project"}</h2>
                            </div>

                            <div className="panel-actions">
                                <Button
                                    size="sm"
                                    onClick={()=> {}}
                                    className="export"
                                    disabled={!currentImage}
                                >
                                    <Download className={"w-4 h-4 mr-2"}/> Export</Button>
                                <Button
                                    size="sm"
                                    onClick={()=> {}}
                                    className="share"
                                >
                                    <Share2 className={"w-4 h-4 mr-2"}/> Share</Button>
                            </div>
                        </div>

                        <div className={`render-area ${isProcessing ? 'is-processing' : ''}`} >
                            {currentImage ? (
                                <img src={currentImage} alt="AI Render" className="render-img"/>
                            ) : (
                                <div className="render-placeholder">
                                    {initialImage && (
                                        <img src={initialImage} alt="Original" className="render-fallback"/>
                                    )}
                                </div>
                            )}

                            {isProcessing && (
                                <div className="render-overlay">
                                    <div className="rendering-card">
                                        <RefreshCcw className="spinner" />
                                        <span className="title">Rendering...</span>
                                        <span className="subtitle">Generating Your 3D Visulaization...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
    )
}

export default VisualizerId


// {initialImage && (
//     <div className='image-container'>
//         <h2>Source Image</h2>
//         <img src={initialImage} alt="source image" />
//     </div>
// )}