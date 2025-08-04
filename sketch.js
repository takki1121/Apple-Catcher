// ゲームで使用する変数を定義
let appleX;      // リンゴのX座標
let appleY;      // リンゴのY座標
let appleSpeed;  // リンゴの落下速度
let basketX;     // かごのX座標
let basketWidth; // かごの幅
let score = 0;   // ゲームのスコア
let timelimit = 30; // ゲームの時間制限（秒）
let appleImg;    // リンゴのスプライトシート画像
let basketImg;   // かごのスプライトシート画像
let frameIndex = 0; // 現在のフレームインデックス
const frameWidth = 32; // リンゴスプライト1つの幅
const frameHeight = 32; // リンゴスプライト1つの高さ
const totalFrames = 17; // リンゴスプライトシート内のフレーム数
const basketFrameWidth = 32; // かごスプライト1つの幅
const basketFrameHeight = 10; // かごスプライト1つの高さ
const basketTotalFrames = 4; // かごスプライトシート内のフレーム数
let timerX;
let timerY;
let timerSpeed;
let timerImg;
let timerActive = false;
let flashRed = false; // 背景フラグ
let flashTimer = 0;   // フラッシュ用タイマー
let highScore = 0; // ハイスコア用変数を追加
let catchSound; // 音声ファイル用変数を追加
let missSound; // リンゴを落とした時の音声ファイル用変数を追加
let timerSound; // 時計キャッチ時の音声ファイル用変数を追加
let clickSound; // ゲーム再開時のクリック音声ファイル用変数を追加

// スマホ対応のための変数
let canvasWidth;
let canvasHeight;
let scaleFactor; // スケール係数

// 画像とフォントを事前にロードする関数
function preload() {
    appleImg = loadImage('img/Apple.png'); // Apple.pngをロード
    basketImg = loadImage('img/basket.png'); // basket.pngをロード
    // 砂時計などの画像ファイルを用意してください
    timerImg = loadImage('img/timer.png');
    catchSound = loadSound('mp3/ringootsitatoki.mp3'); // 音声ファイルをロード
    missSound = loadSound('mp3/ringotyatti.mp3'); // リンゴを落とした時の音声ファイルをロード
    timerSound = loadSound('mp3/tokei.mp3'); // 時計キャッチ時の音声ファイルをロード
    clickSound = loadSound('mp3/click.mp3'); // ゲーム再開時のクリック音声ファイルをロード
}

// ゲームの初期設定
function setup() {
    // スマホ対応の動的キャンバスサイズを計算
    calculateCanvasSize();
    
    // 計算されたサイズでキャンバスを作成
    createCanvas(canvasWidth, canvasHeight);
    
    // スケール係数を計算（基準サイズ400pxに対する比率）
    scaleFactor = min(canvasWidth / 400, canvasHeight / 400);
    
    // リンゴの位置を初期化
    resetApple();
    basketWidth = 60 * scaleFactor; // かごの幅をスケールに合わせて設定
    basketX = width / 2 - basketWidth / 2; // かごの初期位置を画面中央に設定
    resetTimer();
}

// スマホ対応のキャンバスサイズを計算する関数
function calculateCanvasSize() {
    let maxWidth = windowWidth - 20; // 余白を考慮
    let maxHeight = windowHeight - 20; // 余白を考慮
    
    // 最小サイズと最大サイズを設定
    let minSize = 300;
    let maxSize = 600;
    
    // 縦長のスマホ画面に最適化
    if (windowWidth < windowHeight) {
        // 縦向きの場合
        canvasWidth = constrain(maxWidth, minSize, maxSize);
        canvasHeight = constrain(maxHeight * 0.8, minSize, maxSize * 1.2);
    } else {
        // 横向きの場合
        canvasWidth = constrain(maxWidth * 0.8, minSize, maxSize);
        canvasHeight = constrain(maxHeight, minSize, maxSize);
    }
    
    // アスペクト比を調整（縦長を維持）
    if (canvasWidth > canvasHeight) {
        canvasWidth = canvasHeight * 0.8;
    }
}

// ゲームのメインループ
function draw() {
    // 背景色を決定
    if (flashRed) {
        background('rgba(231,76,60,0.3)'); // 赤・透明度0.3
        flashTimer -= deltaTime;
        if (flashTimer <= 0) {
            flashRed = false;
        }
        // 赤フラッシュ時は何も描画せずreturn
        return;
    } else {
        background(220); // 通常
    }

    // リンゴを表示して更新
    displayApple();
    updateApple();

    // かごを表示して移動
    displayBasket();
    moveBasket();
    
    // 残り時間を表示
    displayTime();
    
    // スコアを表示
    fill(0); // 黒色で塗りつぶす    
    textSize(16 * scaleFactor); // テキストサイズをスケールに合わせて設定
    textFont('Delius'); // Deliusフォントを適用
    text('Score: ' + score, 10 * scaleFactor, 20 * scaleFactor); // スコアを画面の左上に表示

    displayTimer();
    updateTimer();
}

// リンゴを画面に表示する関数
function displayApple() {
    // 現在のフレームインデックスを計算
    frameIndex = floor((frameCount / 5) % totalFrames); // 5フレームごとに切り替え

    // スプライトシートから現在のフレームを切り出して描画
    let sx = frameIndex * frameWidth; // スプライトシート上のX座標
    let sy = 0; // スプライトシート上のY座標（1行目のみ使用）

    // リンゴをスケールファクターに応じたサイズで描画
    let appleSize = 60 * scaleFactor;
    image(appleImg, appleX - appleSize/2, appleY - appleSize/2, appleSize, appleSize, sx, sy, frameWidth, frameHeight);
}

// リンゴの位置を更新する関数
function updateApple() {
    // リンゴのY座標を落下速度分だけ下げる
    appleY += appleSpeed;

    // リンゴが画面の下に到達したら位置をリセット
    if (appleY > height) {
        timelimit -= 2;         // タイムを2秒減らす
        flashRed = true;        // フラグON
        flashTimer = 150;       // 150ミリ秒だけ赤くする
        missSound.play();       // リンゴを落とした時の音声を再生
        resetApple();
    }

    // リンゴがかごに当たったかを判定
    if (isCaught()) {
        score++; // スコアを1増やす
        catchSound.play(); // 音声を再生
        resetApple(); // リンゴの位置をリセット
    }
}

// リンゴの位置をリセットする関数
function resetApple() {
    // リンゴのX座標をランダムに設定（スケールに対応）
    let margin = 30 * scaleFactor;
    appleX = random(margin, width - margin);
    // リンゴのY座標を0に設定
    appleY = 15 * scaleFactor;
    // リンゴの落下速度をランダムに設定（スケールに対応）
    appleSpeed = random(2, 5) * scaleFactor;
}

// リンゴがかごに当たったかを判定する関数
function isCaught() {
    // かごの位置をスケールに対応
    let basketBottom = height - 70 * scaleFactor;
    // リンゴのX座標がかごの範囲内にあり、かつリンゴのY座標がかごの上端より下にあるかをチェック
    return (appleX > basketX - basketWidth / 2 && appleX < basketX + basketWidth && appleY >= basketBottom);
}

// かごを表示する関数
function displayBasket() {
    // 現在のフレームインデックスを計算
    let basketFrameIndex = floor((frameCount / 10) % basketTotalFrames); // 10フレームごとに切り替え

    // スプライトシートから現在のフレームを切り出して描画
    let sx = basketFrameIndex * basketFrameWidth; // スプライトシート上のX座標
    let sy = 0; // スプライトシート上のY座標（1行目のみ使用）
    let basketHeight = 40 * scaleFactor;
    let basketY = height - 70 * scaleFactor;
    image(basketImg, basketX, basketY, basketWidth, basketHeight, sx, sy, basketFrameWidth, basketFrameHeight);
}

// かごをマウス・タッチに追従させる関数
function moveBasket() {
    // マウスまたはタッチのX座標に基づいてかごの位置を更新
    let targetX = mouseX;
    
    // タッチイベントがある場合はタッチ位置を使用
    if (touches.length > 0) {
        targetX = touches[0].x;
    }
    
    basketX = targetX - basketWidth / 2;

    // かごが画面の左端を超えないように制限
    if (basketX < 0) {
        basketX = 0;
    }
    // かごが画面の右端を超えないように制限
    if (basketX > width - basketWidth) {
        basketX = width - basketWidth;
    }
}

// タッチ開始時の処理（デフォルトイベントを防ぐ）
function touchStarted() {
    return false; // デフォルトのタッチイベントを防ぐ
}

// タッチ移動時の処理（デフォルトイベントを防ぐ）
function touchMoved() {
    return false; // デフォルトのタッチイベントを防ぐ
}

// ゲーム再開機能（タッチまたはクリック）
function touchEnded() {
    if (timelimit <= 0) {
        restartGame();
    }
    return false;
}

function mousePressed() {
    if (timelimit <= 0) {
        restartGame();
    }
}

// ゲーム再開関数
function restartGame() {
    clickSound.play(); // ゲーム再開時のクリック音声を再生
    score = 0;
    timelimit = 30;
    timerActive = false;
    resetApple();
    resetTimer();
    loop(); // draw()ループを再開
}

//残り時間を表示する関数（オプション）
function displayTime() {
    timelimit -= deltaTime / 1000; // deltaTimeは前のフレームからの経過時間（ミリ秒）を表す
    // 時間制限が0以下になったらゲーム終了
    if (timelimit <= 0) {
        // 時間制限を0に設定
        timelimit = 0;
        // ハイスコア更新
        if (score > highScore) {
            highScore = score;
        }
        // スコアを表示
        fill(0); // 黒色で塗りつぶす
        textSize(32 * scaleFactor); // テキストサイズをスケールに合わせて設定
        textFont('Delius'); // Deliusフォントを適用
        textAlign(CENTER, CENTER); // テキストの配置を中央に設定
        text('Game Over', width / 2, height / 2 - 30 * scaleFactor); // ゲームオーバーのメッセージを表示
        text('Final Score: ' + score, width / 2, height / 2); // 最終スコアを表示
        textSize(20 * scaleFactor);
        text('High Score: ' + highScore, width / 2, height / 2 + 40 * scaleFactor); // ハイスコアを表示
        textSize(16 * scaleFactor);
        text('Tap or click to restart', width / 2, height / 2 + 80 * scaleFactor); // 再開メッセージを表示
        noLoop(); // draw()ループを停止
    } 
    fill(0); // 黒色で塗りつぶす
    textSize(16 * scaleFactor); // テキストサイズをスケールに合わせて設定
    textFont('Delius'); // Deliusフォントを適用
    textAlign(LEFT, TOP); // テキストの配置を左上に設定
    text('Time: ' + Math.ceil(timelimit), 10 * scaleFactor, 40 * scaleFactor); // 残り時間を画面の左上に表示

}

// --- タイマーアイテムを表示する関数 ---
function displayTimer() {
    if (timerActive) {
        let timerSize = 40 * scaleFactor;
        image(timerImg, timerX - timerSize/2, timerY - timerSize/2, timerSize, timerSize);
    }
}

// --- タイマーアイテムの位置を更新する関数 ---
function updateTimer() {
    // ランダムで出現
    if (!timerActive && random(1) < 0.005) {
        resetTimer();
        timerActive = true;
    }
    if (timerActive) {
        timerY += timerSpeed;
        // かごでキャッチしたか判定
        if (isTimerCaught()) {
            timelimit += 5; // 残り時間を5秒増やす
            timerSound.play(); // 時計キャッチ時の音声を再生
            timerActive = false;
        }
        // 画面下まで落ちたら消す
        if (timerY > height) {
            timerActive = false;
        }
    }
}

// --- タイマーアイテムの位置をリセットする関数 ---
function resetTimer() {
    let margin = 30 * scaleFactor;
    timerX = random(margin, width - margin);
    timerY = 15 * scaleFactor;
    timerSpeed = random(2, 4) * scaleFactor;
}

// --- タイマーがかごでキャッチされたか判定する関数 ---
function isTimerCaught() {
    let basketBottom = height - 70 * scaleFactor;
    return (timerX > basketX - basketWidth / 2 && timerX < basketX + basketWidth && timerY >= basketBottom);
}
