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

renderer.setAnimationLoop(() => {
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
