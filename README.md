# inner-cosmos

Three.js + TypeScript + Vite で「呼吸する球体」を作りながら 3D プログラミングの基礎を学ぶプロジェクト。

## 完成したもの

画面中央で 1 つの球体が**ゆっくり膨らんだり縮んだり**しながら、同時に**内側から光が脈動する**作品。マウスで自由に視点を動かせる。

- ✅ 球体の呼吸(scale アニメーション)
- ✅ 呼吸と同期した発光(emissive)
- ✅ マウスドラッグで視点回転(OrbitControls)
- ✅ Bloom 後処理による光の滲み

---

## セットアップ(初回のみ)

### 必要なもの
- Node.js 18 以上
- npm

### 手順
```bash
# 依存パッケージをインストール
npm install

# 開発サーバ起動
npm run dev
```

ブラウザで `http://localhost:5173` を開くと球体が表示される。

### インストール済みパッケージ
| パッケージ | 役割 |
|---|---|
| `three` | 3D ライブラリ本体(型定義も同梱) |
| `vite` | 開発サーバ & ビルドツール |
| `typescript` | 型付き JavaScript |

`@types/three` は **不要**(`three` パッケージに同梱されている)。

---

## Three.js の基本概念

### 3D プログラミングの 3 点セット

Three.js では必ずこの 3 つが揃って初めて描画が始まる:

```
Scene(舞台)+ Camera(視点)+ Renderer(描画装置)
```

| 要素 | 役割 | 比喩 |
|---|---|---|
| **Scene** | 3D オブジェクトを配置する空間 | 劇の舞台 |
| **Camera** | どこから、どの画角で見るか | 観客の目線 |
| **Renderer** | Scene と Camera を受け取って canvas に描く | 映写機 |

どれか 1 つ欠けても何も映らない。

---

### Mesh = Geometry + Material

3D オブジェクトは 2 つの要素を合体させて作る:

```
Mesh(物体)= Geometry(形)+ Material(見た目)
```

| 要素 | 意味 | 例 |
|---|---|---|
| **Geometry** | 頂点の集合。形を決める | `SphereGeometry`, `BoxGeometry` |
| **Material** | 表面の質感・色・反射 | `MeshStandardMaterial` |
| **Mesh** | 上 2 つを合わせた「3D 物体」 | `new Mesh(geometry, material)` |

`scene.add(mesh)` で舞台に乗せると描画対象になる。

---

### ライトが必要な理由

`MeshStandardMaterial` は**物理ベース**の材質で、ライトが当たらないと**真っ黒に見える**。

今回使ったライトは 2 種類:

| ライト | 役割 | 設定値 |
|---|---|---|
| `AmbientLight` | 全体をふわっと照らす下地光。影を真っ黒にしない | 強度 0.4(弱め) |
| `DirectionalLight` | 一方向から照らす太陽光。ハイライトと陰影を作る | 強度 1.5(主役) |

**ポイント**: ambient を強くしすぎると全体が平坦になり、球体が「平らな円」に見えてしまう。主役は directional。

---

### アニメーションループ

`setAnimationLoop` は「毎フレームこの関数を呼んで」という指示。ブラウザの描画タイミングに合わせて(通常 60 FPS)呼ばれる。

```ts
const clock = new THREE.Clock()

renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime()   // 経過秒数(例: 2.34)

  // ここで毎フレーム何かを更新する
  sphere.scale.setScalar(1 + Math.sin(t) * 0.1)

  renderer.render(scene, camera)     // 現在の Scene を描画
})
```

**Clock** は時間を秒単位で取得できる Three.js 標準のユーティリティ。`Date.now()` を自前で扱うより便利。

---

### 呼吸のアニメーション

sin 波を使って値を周期的に変化させる:

```ts
sphere.scale.setScalar(1 + Math.pow(Math.sin(t * 0.5), 2) * 0.2)
```

| 部分 | 意味 |
|---|---|
| `Math.sin(t * 0.5)` | -1 〜 1 の波。`* 0.5` で遅くする(約 12 秒周期) |
| `Math.pow(..., 2)` | 二乗すると 0 〜 1 になり、波が非対称になる(吸う → ピーク → 吐くの緩急) |
| `* 0.2` | 振幅。±20% の拡大縮小 |
| `1 +` | 基準を 1 にする(0.8 〜 1.2 で変化) |

**生の sin と二乗 sin の違い**: 生は機械的な往復、二乗は生き物っぽい緩急が出る。

---

## 追加で学んだ機能

### OrbitControls(視点操作)

マウスドラッグで視点を動かせるようにする。`three/examples/jsm/controls/OrbitControls.js` から import。

```ts
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true   // 慣性を付けてスッと止まる
```

**重要**: `enableDamping = true` を使う場合、ループ内で `controls.update()` を呼ばないと慣性が効かない。

| 操作 | 動き |
|---|---|
| 左ドラッグ | 回転 |
| 右ドラッグ | 平行移動 |
| ホイール | ズーム |

---

### emissive(自己発光)

`MeshStandardMaterial` に `emissive` を設定すると、**光源が無くても光って見える色**を足せる。影の部分が真っ黒にならなくなり、物体が浮かび上がる。

```ts
new THREE.MeshStandardMaterial({
  color: 0x88aaff,
  emissive: 0x223366,        // 暗い青紫の発光
  emissiveIntensity: 1,      // 発光の強さ
  roughness: 0.3,
  metalness: 0.1,
})
```

**注意**: emissive は「見た目が光る」だけで、**周囲のオブジェクトを照らしたりはしない**。

---

### Bloom 後処理(ポストプロセス)

`emissive` と組み合わせると「眩しく光る」映画的な見た目になる機能。**renderer が直接描画する**のをやめて、**Composer 経由で描画する**に切り替えるのがポイント。

```
通常:  Scene → Renderer → 画面
Bloom: Scene → RenderPass → BloomPass → Composer → 画面
               (元の絵)    (光を滲ませる)
```

```ts
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,   // strength(光の強さ)
  0.8,   // radius(滲みの広がり)
  0.0    // threshold(この明るさ以上が光る / 0 = 全部)
))

// ループ内で renderer.render の代わりに
composer.render()
```

**ハマりどころ**: `renderer.render(scene, camera)` を `composer.render()` に置き換え忘れると Bloom が効かない。

---

## 今日ハマったポイント集

実際に詰まって学んだこと。次回以降の自分への備忘録。

### 1. `StaticRange` は Three.js のクラスじゃない
エディタの補完で `s` と打つとブラウザの DOM API `StaticRange` が候補トップに出てしまう。**`scene` を使いたいときは `sc` まで打つ**と補完が絞られる。

### 2. `renderer.render` は引数が必要
```ts
renderer.render(scene, camera)   // ✅ 正しい
renderer.render()                // ❌ エラー
```
Bloom 導入時は `composer.render()` に置き換えるので引数なしになる(これは別物)。

### 3. `AmbientLight` を作っただけでは表示されない
```ts
const light = new THREE.AmbientLight(...)  // 作った
scene.add(light)                            // ← これを忘れない
```

### 4. ループ内で使いたい値はループ内で取得する
```ts
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime()   // ← ループ内で取得
  material.emissiveIntensity = 0.3 + Math.sin(t) * 0.3
})
```
ループの外で `t` を使おうとしても存在しない。

### 5. `controls.update()` を忘れると damping が効かない
慣性付き OrbitControls は毎フレーム update が必要。

### 6. `setPixelRatio(window.devicePixelRatio)` を忘れると Retina でボケる
CSS ピクセルと物理ピクセルの比率を合わせる設定。詳細はコメント参照。

---

## コードの全体構造

現在の [src/main.ts](src/main.ts) は以下の順序で構成されている:

```
1. import 文
2. Scene / Camera / Renderer 作成
3. OrbitControls 設定
4. Sphere(Material + Geometry + Mesh)
5. Lights(Ambient + Directional)
6. Post-processing(Composer + RenderPass + BloomPass)
7. Animation loop(Clock + setAnimationLoop)
```

**原則**: 上から「構築 → 起動」の順に読める並びにする。ループの中で参照する変数は、必ずループより前で定義する。

---

## よく使う値の早見表

| パラメータ | 今回の値 | 意味 | 変えると |
|---|---|---|---|
| `PerspectiveCamera` FOV | `75` | 視野角(度) | 小さいと望遠、大きいと魚眼 |
| `camera.position.z` | `3` | カメラの距離 | 小さいと近接、大きいと遠景 |
| `SphereGeometry` segments | `64` | 分割数 | 小さいとカクつく、大きいと重い |
| `roughness` | `0.3` | 表面の粗さ | 0 = 鏡面、1 = マット |
| `metalness` | `0.1` | 金属感 | 0 = 非金属、1 = 金属 |
| `AmbientLight` 強度 | `0.4` | 下地光 | 強いと平坦、弱いと影が黒くなる |
| `DirectionalLight` 強度 | `1.5` | 主役光 | ハイライトの明るさ |
| Bloom strength | `1.2` | 光の強さ | 上げると眩しい |
| Bloom radius | `0.8` | 滲みの広がり | 上げるとふんわり |
| 呼吸の速度 `t * N` | `0.5` | 周期 | 小さいとゆっくり(0.5 ≈ 12 秒) |
| 呼吸の振幅 | `0.2` | 膨らみの量 | 大きいほど大きく膨らむ |

---

## スクリプト

```bash
npm run dev       # 開発サーバ起動(HMR 有効)
npm run build     # 本番ビルド(dist/ に出力)
npm run preview   # ビルド結果を確認
```

---

## 今後やってみたい拡張

- [ ] マウス位置に応じた色相変化
- [ ] 頂点を Perlin ノイズで歪ませる(波打つ球体)
- [ ] 背景に星空(Points)
- [ ] クリックで呼吸を一時停止
- [ ] ウィンドウリサイズ対応
- [ ] マイク音量に反応する呼吸

---

## 参考

- [Three.js 公式ドキュメント](https://threejs.org/docs/)
- [docs/three-animation-action.md](docs/three-animation-action.md) — AnimationAction の日本語まとめ
- [Three.js マニュアル](https://threejs.org/manual/)
