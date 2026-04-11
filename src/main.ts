import './style.css'
import * as THREE from 'three'

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 3

const renderer = new THREE.WebGLRenderer({ antialias: true })

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

const app = document.querySelector<HTMLDivElement>('#app')!
app.appendChild(renderer.domElement)

const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 1.0) * 0.15
    sphere.scale.setScalar(scale)

    renderer.render(scene, camera)
})

const geometry = new THREE.SphereGeometry(1, 64, 64)
const material = new THREE.MeshStandardMaterial({
  color: 0x88aaff,
  roughness: 0.3,
  metalness: 0.1,
})
const sphere = new THREE.Mesh(geometry, material)
scene.add(sphere)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(3, 3, 5);
scene.add(directionalLight);
