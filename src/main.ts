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

const renderer = new THREE.WebGLRenderer({ antialis: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

const app = document.querySelector<HTMLDivElement>('#app')!
app.appendChild(renderer.domElement)
