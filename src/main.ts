import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Scene / Camera / Renderer
const scene = new THREE.Scene();

// FOV 75: 人の視界に近い自然な広さ。50 以下は望遠レンズ的で窮屈、90 以上は魚眼気味に歪む
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
// 半径 1 の球体に対して距離 3。近すぎるとクリッピング、遠すぎると小さすぎる
camera.position.z = 3;

// antialias: true で球体の輪郭のジャギーを消す(未指定だとエッジがガタつく)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// Retina ディスプレイは物理ピクセルが 2〜3 倍。これを設定しないと全体がボケて見える
renderer.setPixelRatio(window.devicePixelRatio);
document
  .querySelector<HTMLDivElement>("#app")!
  .appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
// damping: マウスを離した瞬間に視点が止まると機械的。慣性でスッと減速する方が気持ちいい
controls.enableDamping = true;

// Sphere
// MeshStandardMaterial はライトの影響を受ける物理ベース材質。
// MeshBasicMaterial だとライトを無視してベタ塗りになり、立体感が出ない
const material = new THREE.MeshStandardMaterial({
  color: 0x88aaff,
  // emissive: 影側が真っ黒にならず、自己発光のように見える。Bloom との相性が良い
  emissive: 0x223366,
  emissiveIntensity: 1,
  roughness: 0.3, // 0 に近いほどツルツル。0.3 はしっとりしたプラスチック感
  metalness: 0.1, // 金属ではないので低め
});
// 分割数 64: これ以下だと球面がカクつく。128 は過剰(見た目の差がほぼない)
const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
scene.add(sphere);

// Lights
// Ambient(環境光)0.4: 影の部分が真っ黒にならないよう下支え。
// 強すぎると全体が平坦になり、陰影が消えて球が平面に見える
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// Directional(平行光)1.5: ハイライトと陰影を作る主役。太陽光のイメージ
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
// 右上手前(3, 3, 5)から照らす。ポートレート撮影の定番位置で、立体感が最も出る角度
directionalLight.position.set(3, 3, 5);
scene.add(directionalLight);

// Post-processing (Bloom)
// EffectComposer: 「renderer が直接画面へ」ではなく「一度テクスチャに描画 → エフェクト → 画面」
// という経路に切り替える。後処理にはこの経路が必須
const composer = new EffectComposer(renderer);
composer.setPixelRatio(window.devicePixelRatio);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));
// Bloom 引数: strength 1.2(眩しさ)/ radius 0.8(滲みの広がり)/ threshold 0.0(全ピクセルが光る対象)
// threshold を 0.8 にすると「明るい部分だけ光る」モードになり、映画的になる
composer.addPass(
  new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,
    0.8,
    0.0,
  ),
);

// Animation loop
// Clock は performance.now() を秒単位でラップした便利クラス。Three.js の慣習
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();

  // sin² を使うと値域が 0〜1 になり、波が非対称になる(吸う→ピーク→吐くの緩急)
  // 生の sin だと -1〜1 の単調な往復で、機械的な呼吸になる
  sphere.scale.setScalar(1 + Math.pow(Math.sin(t * 0.5), 2) * 0.2);

  // 発光も同じ周期(t * 0.5)で動かす → 呼吸と光が完全に同期して生命感が出る
  material.emissiveIntensity = 0.3 + Math.sin(t * 0.5) * 0.3;

  // damping を使っている場合、毎フレーム update() を呼ばないと慣性が効かない
  controls.update();
  // composer.render() が renderer.render() の代わり。Bloom を通すためにこちらを使う
  composer.render();
});
