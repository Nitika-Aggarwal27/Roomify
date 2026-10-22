import type { Route } from "./+types/home";
import { ArrowRight, CalendarDays, Clock, Layers, ArrowUpRight} from "lucide-react";
import Navbar from "../../components/Navbar";
import Upload from "../../components/Upload";
import Button from "../../components/ui/Button";
import { createProject } from "../../lib/puter.action";
import {useNavigate} from "react-router";
import {useState, useRef} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<DesignItem[]>([])
    const isCreatingProjectRef = useRef(false)

  const handleUploadComplete = async (base64Image: string) => {
     try {
         if(isCreatingProjectRef.current) return false
         isCreatingProjectRef.current = true
         const newId = Date.now().toString()
         const name = `Resodence ${newId}`

         const newItem = {
             id: newId, name, sourceImage: base64Image,
             renderedImage: undefined,
             timestamp: Date.now()
         }

         let saved: DesignItem | null | undefined
         try {
             saved = await createProject({ item: newItem, visibility: 'private' })
         } catch (error) {
             console.error("Failed to save project; opening it with the uploaded image instead.", error)
         }

         setProjects((prev) => [newItem, ...prev])
         try {
             window.sessionStorage.setItem(`roomify-project-${newId}`, JSON.stringify({
                 initialImage: saved?.sourceImage || base64Image,
                 initialRender: saved?.renderedImage || null,
                 name,
             }))
         } catch (error) {
             // The image still travels in navigation state if browser storage is full.
             console.warn("Could not cache the project for refreshes.", error)
         }

         navigate(`/visualizer/${newId}`, {
             state: {
                 initialImage: saved?.sourceImage || base64Image,
                 initialRender: saved?.renderedImage || null,
                 name
             }
         })
         return true
     } finally {
         isCreatingProjectRef.current = false
     }

  }
  return (
      <div className="home">
        <Navbar/>
        <section className="hero">
            <div className="announce">
                <div className="dot">
                    <div className="pulse"></div>
                </div>

                <p>
                    Introducing Roomify
                </p>
            </div>

            <h1> Build beautiful spaces at the speed of thought with Roomify.</h1>

            <p className="subtitle">
                Roomify is an AI-first design environment that helps you visualize, render, and ship architectural projects faster than ever.
            </p>

            <div className="actions">
                <a href="#upload" className="cta">
                    Start Building <ArrowRight className="icon"/>
                </a>

                <Button variant="outline" size="lg" className="demo">
                    Watch Demo
                </Button>
            </div>

            <div id="upload" className="upload-shell">
                <div className="grid-overlay"/>

                <div className="upload-card">
                    <div className="upload-head">
                        <div className="upload-icon">
                            <Layers className="icon" />
                        </div>

                        <h3>Upload your floor plan</h3>
                        <p>Supports JPG, PNG, formats up to 10MB</p>
                    </div>

                    <Upload onComplete={handleUploadComplete} />
                </div>
            </div>
        </section>

        <section className="projects">
          <div className="section-inner">
            <div className="section-head">
              <div className="copy">
                <h2>Projects</h2>
                <p>Your latest work and shared community projects, all in one place.</p>
              </div>
            </div>

            <div className="projects-grid">

              {projects.map(({id, name, renderedImage, sourceImage, timestamp}) => (
                <div className="project-card group">
                  <div className="preview">
                    <img
                      src={renderedImage || sourceImage} alt="Project"
                    />

                    <div className="badge">
                      <span>Community</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div>
                      <h3>{name}</h3>

                      <div className="meta">
                        <CalendarDays size={12}/>
                        <span>{new Date(timestamp).toLocaleDateString()}</span>
                        <span>By Nitika</span>
                      </div>
                    </div>
                    <div className="arrow">
                      <ArrowUpRight size={18}/>
                    </div>
                  </div>
                </div>

              ))}

            </div>
          </div>
        </section>
      </div>
  );
}
