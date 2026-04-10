# Three.js AnimationAction リファレンス

出典: https://threejs.org/docs/#api/en/animation/AnimationAction

`AnimationClip` の再生を制御するクラス。`new` ではなく **`mixer.clipAction(clip)`** で生成推奨(キャッシュされる)。ほとんどのメソッドは **メソッドチェーン可**。

## コンストラクタ

```js
new AnimationAction(mixer, clip, localRoot, blendMode)
```

- `mixer`: 制御する `AnimationMixer`
- `clip`: 再生データの `AnimationClip`
- `localRoot`: 対象ルート `Object3D`
- `blendMode`: `NormalAnimationBlendMode`(既定)/ `AdditiveAnimationBlendMode`

## プロパティ

| プロパティ | 型 | 既定値 | 説明 |
|---|---|---|---|
| `blendMode` | Number | Normal | 複数アニメ同時再生時のブレンド方法 |
| `clampWhenFinished` | Boolean | `false` | `true` で最終フレームに `paused` 固定。`false` は最終ループ後 `enabled=false` |
| `enabled` | Boolean | `true` | `false` で影響なし(時間はリセットされない) |
| `loop` | Number | `LoopRepeat` | `LoopOnce` / `LoopRepeat` / `LoopPingPong` |
| `paused` | Boolean | `false` | 実効 timeScale を 0 に |
| `repetitions` | Number | `Infinity` | ループ回数(`LoopOnce` 時は無視) |
| `time` | Number | `0` | ローカル時間(秒)。`0…clip.duration` にクランプ/ラップ |
| `timeScale` | Number | `1` | 時間倍率。`0` で停止、負で逆再生 |
| `weight` | Number | `1` | 影響度 `[0,1]`。ブレンドに使用 |
| `zeroSlopeAtStart` | Boolean | `true` | 開始時スムーズ補間 |
| `zeroSlopeAtEnd` | Boolean | `true` | 終了時スムーズ補間 |

## メソッド

### 再生制御

- **`play()`** → 有効化して再生開始。終端到達後は `reset()` が必要
- **`stop()`** → 即停止 + `reset()`。`mixer.stopAllAction()` で全停止も可
- **`reset()`** → `paused=false`, `enabled=true`, `time=0`, fade/warp/遅延開始をクリア
- **`startAt(timeInSec)`** → 遅延開始時刻指定(`mixer.time + delta`)。`play()` と併用

### 状態取得

- **`isRunning(): Boolean`** → 実際に時間が進んでいるか
- **`isScheduled(): Boolean`** → mixer に登録済みか
- **`getClip(): AnimationClip`**
- **`getMixer(): AnimationMixer`**
- **`getRoot(): Object3D`**
- **`getEffectiveTimeScale(): Number`** → warp/paused 反映後
- **`getEffectiveWeight(): Number`** → fade/enabled 反映後

### ループ / 再生時間

- **`setLoop(loopMode, repetitions)`**
- **`setDuration(durationInSec)`** → 1 ループの長さを指定(timeScale 調整)
- **`setEffectiveTimeScale(timeScale)`** → warp を停止して設定
- **`setEffectiveWeight(weight)`** → fade を停止して設定

### フェード / クロスフェード

- **`fadeIn(duration)`** → weight を `0→1`
- **`fadeOut(duration)`** → weight を `1→0`
- **`crossFadeFrom(fadeOutAction, duration, warpBool)`** → 相手を fadeOut、自分を fadeIn
- **`crossFadeTo(fadeInAction, duration, warpBool)`** → 自分を fadeOut、相手を fadeIn
- **`stopFading()`**

### ワープ(再生速度の漸進変化)

- **`warp(startTimeScale, endTimeScale, duration)`**
- **`halt(duration)`** → timeScale を徐々に 0 へ
- **`syncWith(otherAction)`** → `time` と `timeScale` を他アクションに合わせる
- **`stopWarping()`**

## イベント(mixer に対して登録)

```js
mixer.addEventListener('loop',     e => {}); // e: {type, action, loopDelta}
mixer.addEventListener('finished', e => {}); // e: {type, action, direction}
```

## 典型的な使い方

```js
const mixer  = new THREE.AnimationMixer(model);
const action = mixer.clipAction(clip);

action
  .setLoop(THREE.LoopRepeat, Infinity)
  .setEffectiveTimeScale(1)
  .setEffectiveWeight(1)
  .play();

// クロスフェード
const next = mixer.clipAction(otherClip);
next.reset().play();
action.crossFadeTo(next, 0.5, false);

// 毎フレーム
mixer.update(delta);
```

## つまずきポイント

- `play()` 後に再生されない → `paused`, `enabled`, `weight`, `timeScale` のいずれかが 0/false、または終端到達済み(`reset()` が必要)
- `enabled=true` にしただけでは再開しない(上記条件が満たされて初めて再生)
- `reset()` は `stop()` を呼ばない。両方したいなら `stop()` を使う
- `syncWith()` は一度きり、以降の変化は追従しない
