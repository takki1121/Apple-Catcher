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

// 画像とフォントを事前にロードする関数
function preload() {
    appleImg = loadImage('Apple.png'); // Apple.pngをロード
    basketImg = loadImage('basket.png'); // basket.pngをロード
    // 砂時計などの画像ファイルを用意してください
    timerImg = loadImage('timer.png');
}

// ゲームの初期設定
function setup() {
    // 400x400ピクセルのキャンバスを作成
    createCanvas(400, 400);
    // リンゴの位置を初期化
    resetApple();
    basketWidth = 60; // かごの幅を設定
    basketX = width / 2 - basketWidth / 2; // かごの初期位置を画面中央に設定
    resetTimer();
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
    textSize(16); // テキストサイズを16に設定
    textFont('Delius'); // Deliusフォントを適用
    text('Score: ' + score, 10, 20); // スコアを画面の左上に表示

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

    // リンゴを2倍の大きさで描画
    image(appleImg, appleX - 30, appleY - 30, 60, 60, sx, sy, frameWidth, frameHeight);
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
        resetApple();
    }

    // リンゴがかごに当たったかを判定
    if (isCaught()) {
        score++; // スコアを1増やす
        resetApple(); // リンゴの位置をリセット
    }
}

// リンゴの位置をリセットする関数
function resetApple() {
    // リンゴのX座標をランダムに設定
    appleX = random(30, width - 30);
    // リンゴのY座標を0に設定
    appleY = 15;
    // リンゴの落下速度をランダムに設定
    appleSpeed = random(2, 5);
}

// リンゴがかごに当たったかを判定する関数
function isCaught() {
    // リンゴのX座標がかごの範囲内にあり、かつリンゴのY座標がかごの上端より下にあるかをチェック
    return (appleX > basketX - basketWidth / 2 && appleX < basketX + basketWidth && appleY >= height - 70);
}

// かごを表示する関数
function displayBasket() {
    // 現在のフレームインデックスを計算
    let basketFrameIndex = floor((frameCount / 10) % basketTotalFrames); // 10フレームごとに切り替え

    // スプライトシートから現在のフレームを切り出して描画
    let sx = basketFrameIndex * basketFrameWidth; // スプライトシート上のX座標
    let sy = 0; // スプライトシート上のY座標（1行目のみ使用）
    image(basketImg, basketX, height - 70, basketWidth, 40, sx, sy, basketFrameWidth, basketFrameHeight);
}

// かごをマウスに追従させる関数
function moveBasket() {
    // マウスのX座標に基づいてかごの位置を更新
    basketX = mouseX - basketWidth / 2;

    // かごが画面の左端を超えないように制限
    if (basketX < 0) {
        basketX = 0;
    }
    // かごが画面の右端を超えないように制限
    if (basketX > width - basketWidth) {
        basketX = width - basketWidth;
    }
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
        textSize(32); // テキストサイズを32に設定
        textFont('Delius'); // Deliusフォントを適用
        textAlign(CENTER, CENTER); // テキストの配置を中央に設定
        text('Game Over', width / 2, height / 2 - 30); // ゲームオーバーのメッセージを表示
        text('Final Score: ' + score, width / 2, height / 2); // 最終スコアを表示
        textSize(20);
        text('High Score: ' + highScore, width / 2, height / 2 + 40); // ハイスコアを表示
        noLoop(); // draw()ループを停止
    } 
    fill(0); // 黒色で塗りつぶす
    textSize(16); // テキストサイズを16に設定
    textFont('Delius'); // Deliusフォントを適用
    textAlign(LEFT, TOP); // テキストの配置を左上に設定
    text('Time: ' + Math.ceil(timelimit), 10, 40); // 残り時間を画面の左上に表示

}

// --- タイマーアイテムを表示する関数 ---
function displayTimer() {
    if (timerActive) {
        image(timerImg, timerX - 20, timerY - 20, 40, 40);
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
    timerX = random(30, width - 30);
    timerY = 15;
    timerSpeed = random(2, 4);
}

// --- タイマーがかごでキャッチされたか判定する関数 ---
function isTimerCaught() {
    return (timerX > basketX - basketWidth / 2 && timerX < basketX + basketWidth && timerY >= height - 70);
}