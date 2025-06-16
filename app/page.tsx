"use client"

import { useEffect, useRef, useState } from "react"

export default function HamiltonianSimulation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const [resolution, setResolution] = useState(128)

  useEffect(() => {
    // Dynamically import Three.js
    const loadThreeJS = async () => {
      const THREE = await import("three")

      const video = videoRef.current
      const canvas2d = canvasRef.current
      const container = containerRef.current
      const logContainer = logContainerRef.current

      if (!video || !canvas2d || !container || !logContainer) return

      const ctx2d = canvas2d.getContext("2d")
      if (!ctx2d) return

      let scene: any, camera: any, renderer: any, particles: any
      let prevFrameData: number[] | null = null

      const canvasSize = 320

      // Initialize the 3D scene
      function init() {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
        camera.position.z = 150

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(container.clientWidth, container.clientHeight)
        container.appendChild(renderer.domElement)

        createParticles()

        const handleResize = () => {
          camera.aspect = container.clientWidth / container.clientHeight
          camera.updateProjectionMatrix()
          renderer.setSize(container.clientWidth, container.clientHeight)
        }
        window.addEventListener("resize", handleResize)

        let isMouseDown = false
        let prevMouseX = 0,
          prevMouseY = 0

        const handleMouseDown = (e: MouseEvent) => {
          isMouseDown = true
          prevMouseX = e.clientX
          prevMouseY = e.clientY
        }

        const handleMouseUp = () => {
          isMouseDown = false
        }

        const handleMouseMove = (e: MouseEvent) => {
          if (isMouseDown) {
            const deltaX = e.clientX - prevMouseX
            const deltaY = e.clientY - prevMouseY
            particles.rotation.y += deltaX * 0.01
            particles.rotation.x += deltaY * 0.01
            prevMouseX = e.clientX
            prevMouseY = e.clientY
          }
        }

        container.addEventListener("mousedown", handleMouseDown)
        container.addEventListener("mouseup", handleMouseUp)
        container.addEventListener("mousemove", handleMouseMove)

        // Store cleanup functions
        sceneRef.current = {
          scene,
          camera,
          renderer,
          particles,
          cleanup: () => {
            window.removeEventListener("resize", handleResize)
            container.removeEventListener("mousedown", handleMouseDown)
            container.removeEventListener("mouseup", handleMouseUp)
            container.removeEventListener("mousemove", handleMouseMove)
            if (renderer && container.contains(renderer.domElement)) {
              container.removeChild(renderer.domElement)
              renderer.dispose()
            }
          },
        }
      }

      function createParticles() {
        if (particles) {
          scene.remove(particles)
          particles.geometry.dispose()
          particles.material.dispose()
        }

        const geometry = new THREE.BufferGeometry()
        const vertices: number[] = []
        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            vertices.push(j - resolution / 2, -(i - resolution / 2), 0)
          }
        }
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))

        const material = new THREE.PointsMaterial({
          size: Math.max(0.3, 1.0 - resolution / 400),
          vertexColors: true,
        })
        particles = new THREE.Points(geometry, material)
        scene.add(particles)

        if (sceneRef.current) {
          sceneRef.current.particles = particles
        }
      }

      async function setupCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          video.srcObject = stream
          video.onloadedmetadata = () => {
            video.play()
            canvas2d.width = canvasSize
            canvas2d.height = canvasSize
            animate()
          }
        } catch (error) {
          console.error("Error accessing camera:", error)
          const errorDiv = document.createElement("div")
          errorDiv.innerHTML =
            "Could not access the camera. Please ensure you have a camera connected and have granted permission."
          errorDiv.className =
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-800 p-4 rounded-lg text-white"
          document.body.appendChild(errorDiv)
        }
      }

      let frameCount = 0
      function animate() {
        requestAnimationFrame(animate)

        ctx2d.save()
        ctx2d.scale(-1, 1)
        ctx2d.drawImage(video, -canvasSize, 0, canvasSize, canvasSize)
        ctx2d.restore()

        const currentFrameData = Array.from(ctx2d.getImageData(0, 0, canvasSize, canvasSize).data)

        if (prevFrameData) {
          updateHamiltonians(currentFrameData, frameCount++)
        }

        prevFrameData = [...currentFrameData]

        renderer.render(scene, camera)
      }

      function updateHamiltonians(currentFrameData: number[], frame: number) {
        const positions = particles.geometry.attributes.position.array
        const colors: number[] = []
        const color = new THREE.Color()

        let maxH = 0,
          sumH = 0,
          sumT = 0,
          sumV = 0
        const maxCoords = { x: 0, y: 0 }
        const energyCounts = { low: 0, med: 0, high: 0 }

        const stepSize = Math.floor(canvasSize / resolution)

        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const particleIndex = i * resolution + j
            const canvasX = Math.floor(j * stepSize)
            const canvasY = Math.floor(i * stepSize)
            const pixelIndex = (canvasY * canvasSize + canvasX) * 4

            const brightness =
              (currentFrameData[pixelIndex] + currentFrameData[pixelIndex + 1] + currentFrameData[pixelIndex + 2]) / 3
            const V = (brightness / 255) * 10

            const prevBrightness =
              (prevFrameData![pixelIndex] + prevFrameData![pixelIndex + 1] + prevFrameData![pixelIndex + 2]) / 3
            const T = (Math.abs(brightness - prevBrightness) / 255) * 10

            const H = T + V
            positions[particleIndex * 3 + 2] = H * 1.5

            sumH += H
            sumT += T
            sumV += V

            if (H > maxH) {
              maxH = H
              maxCoords.x = Math.round(positions[particleIndex * 3])
              maxCoords.y = Math.round(positions[particleIndex * 3 + 1])
            }

            // Energy distribution based on average potential energy thresholds
            if (H < 3) energyCounts.low++
            else if (H < 8) energyCounts.med++
            else energyCounts.high++

            color.setHSL(0.7 - (H / 20) * 0.7, 1.0, 0.5)
            colors.push(color.r, color.g, color.b)
          }
        }
        particles.geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
        particles.geometry.attributes.position.needsUpdate = true

        const totalPoints = resolution * resolution
        const avgH = sumH / totalPoints
        const avgT = sumT / totalPoints
        const avgV = sumV / totalPoints

        // Update the log container with more illustrative data
        updateLog({ frame, avgH, maxH, maxCoords, avgT, avgV, energyCounts, totalPoints })
      }

      function updateLog(data: {
        frame: number
        avgH: number
        maxH: number
        maxCoords: { x: number; y: number }
        avgT: number
        avgV: number
        energyCounts: { low: number; med: number; high: number }
        totalPoints: number
      }) {
        let systemState = "System Stable"
        if (data.avgT > 0.8) systemState = "High Motion Detected!"
        else if (data.avgV > 8) systemState = "High Energy Concentration"

        const lowPercent = (data.energyCounts.low / data.totalPoints) * 100
        const medPercent = (data.energyCounts.med / data.totalPoints) * 100
        const highPercent = (data.energyCounts.high / data.totalPoints) * 100

        const barLength = 12
        const lowBar = "█".repeat(Math.round((lowPercent / 100) * barLength))
        const medBar = "█".repeat(Math.round((medPercent / 100) * barLength))
        const highBar = "█".repeat(Math.round((highPercent / 100) * barLength))

        const logContent = `SYSTEM STATE: ${systemState}
---------------------------------
Frame: ${data.frame}
Avg H: ${data.avgH.toFixed(3)} | Max H: ${data.maxH.toFixed(3)}
Peak H at: (x:${data.maxCoords.x}, y:${data.maxCoords.y})
---------------------------------
Energy Distribution:
Low:  [${lowBar.padEnd(barLength)}] ${lowPercent.toFixed(1)}%
Med:  [${medBar.padEnd(barLength)}] ${medPercent.toFixed(1)}%
High: [${highBar.padEnd(barLength)}] ${highPercent.toFixed(1)}%`
        logContainer.textContent = logContent.trim()
      }

      // Initialize everything
      init()
      setupCamera()

      // Recreate particles when resolution changes
      return () => {
        createParticles()
      }
    }

    loadThreeJS()

    // Cleanup on unmount
    return () => {
      if (sceneRef.current?.cleanup) {
        sceneRef.current.cleanup()
      }
    }
  }, [resolution])

  return (
    <div className="fixed inset-0 w-full h-full bg-black text-slate-200 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      <div
        ref={logContainerRef}
        className="absolute bottom-8 left-8 w-80 h-56 bg-neutral-800 rounded-lg overflow-y-auto p-3 font-mono text-xs text-gray-300 border border-neutral-600 whitespace-pre-wrap break-all z-10"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#525252 transparent",
        }}
      />

      <div className="absolute bottom-8 left-8 w-80 h-56 bg-neutral-800 rounded-lg p-3 font-mono text-xs text-gray-300 border border-neutral-600 z-10">
        <div className="mb-3 pb-2 border-b border-neutral-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Resolution:</span>
            <span className="text-gray-300 font-semibold">
              {resolution}×{resolution}
            </span>
          </div>
          <input
            type="range"
            min="32"
            max="256"
            step="16"
            value={resolution}
            onChange={(e) => setResolution(Number.parseInt(e.target.value))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>32</span>
            <span>256</span>
          </div>
        </div>

        <div
          ref={logContainerRef}
          className="overflow-y-auto whitespace-pre-wrap break-all"
          style={{
            height: "calc(100% - 80px)",
            scrollbarWidth: "thin",
            scrollbarColor: "#525252 transparent",
          }}
        />
      </div>

      <video ref={videoRef} className="hidden" playsInline autoPlay muted />

      <canvas ref={canvasRef} className="hidden" />

      <style jsx>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background-color: #525252;
          border-radius: 3px;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #d1d5db;
          cursor: pointer;
          border: 2px solid #374151;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #d1d5db;
          cursor: pointer;
          border: 2px solid #374151;
        }
      `}</style>
    </div>
  )
}
