
    // p2.jsを使用して物理エンジンをセットアップ
    var world = new p2.World({
      gravity: [0, -9.8 * 50] // 重力の設定
    });

    // キャンバスを取得
    var canvas = document.getElementById("gameCanvas");
    var context = canvas.getContext("2d");

    // ボールの情報
    var ballTypes = [
      {id: 0, radius: 10, color: "maroon", mass: 13, score: 10},
      {id: 1, radius: 15, color: "red", mass: 12, score: 20},
      {id: 2, radius: 20, color: "purple", mass: 11, score: 30},
      {id: 3, radius: 28, color: "fuchsia", mass: 10, score: 40},
      {id: 4, radius: 38, color: "green", mass: 9, score: 50},
      {id: 5, radius: 50, color: "lime", mass: 8, score: 60},

      {id: 6, radius: 60, color: "olive", mass: 7, score: 70},
      {id: 7, radius: 70, color: "orange", mass: 6, score: 80},
      {id: 8, radius: 90, color: "yellow", mass: 5, score: 90},
      {id: 9, radius: 110, color: "navy", mass: 4, score: 100},
    //   {id: 10, radius: 120, color: "blue", mass: 3, score: 110},
    //   {id: 11, radius: 130, color: "teal", mass: 2, score: 120},
    //   {id: 12, radius: 0, color: "aqua", mass: 0, score: 0}
    ];

    // 上部に現れるボールの配列
    var topBallTypes = ballTypes.slice(0, 5);

    // 新しいボールを保持する配列
    var nextBalls = [];

    // カーソルの位置を保持する変数
    var cursorX = 0;

    // 初期速度
    var initialVelocityX = 0
    var initialVelocityY = 0

    // スライダーの要素を取得
    var velocitySlider = document.getElementById("velocitySlider");

    // スライダーの値が変更されたときのイベントリスナー
    velocitySlider.addEventListener("input", function () {
      // スライダーの値を取得して初期速度に設定
      initialVelocityY = -1 * parseInt(velocitySlider.value);
    });

    // 最大速度
    var maxVelocity = 10000

    var canClick = true;

    var showScore;
    var totalScore = 0;

    var gameOverFlg = false;

    var interval = 800;

    var rightWallBody;
    var leftWallBody;

    // 仮の画像ファイルのパス
    var ballImageSrc = 'picture/azarashi.png';

    // 画像の読み込み
    var ballImage = new Image();
    ballImage.src = ballImageSrc;


    // カーソルの位置を更新する関数
    canvas.addEventListener("mousemove", function (event) {
      cursorX = event.clientX - canvas.getBoundingClientRect().left;
    });

    // 衝突検知のハンドラを設定
    world.on("beginContact", function (event) {
      var bodyA = event.bodyA;
      var bodyB = event.bodyB;

      // bodyAとbodyBのサイズからidを取得
      var ballAId = getBallTypeId(bodyA.shapes[0].radius);
      var ballBId = getBallTypeId(bodyB.shapes[0].radius);

      if (ballAId !== null && ballAId === ballBId) {
        removeBall(bodyA);
        removeBall(bodyB);

        // 衝突したボールの中点に新しいボールを生成
        var ballId = ballAId
        var nextBallId = (ballId + 1) % ballTypes.length;
        var ballInfo = ballTypes[nextBallId];
        var score = ballInfo.score;

        var newBallX = (bodyA.position[0] + bodyB.position[0]) / 2;
        var newBallY = (bodyA.position[1] + bodyB.position[1]) / 2;
        console.log("x,y =", newBallX, newBallY);

        createBall(newBallX, newBallY, ballInfo);
        totalScore = totalScore + score;

      }

    });

    function startGame() {
      // alert("Game started!");
      location.reload();
    }

    // 地面を生成する関数
    function createGround() {
      // 地面のプロパティ
      var groundWidth = canvas.width * 2;
      var groundHeight = 40;

      // 地面を物理エンジンに追加
      var groundBody = new p2.Body({
        position: [canvas.height / 2, -20] // 地面の初期位置
      });
      var groundShape = new p2.Box({
        width: groundWidth,
        height: groundHeight,
      });
      groundBody.addShape(groundShape);
      world.addBody(groundBody);
    }
    // 左の壁を生成する関数
    function createLeftWall() {
      var leftWallWidth = 20;
      var leftWallHeight = canvas.height;

      leftWallBody = new p2.Body({
        position: [-leftWallWidth / 2, canvas.height / 2] // 左の壁の中央に配置
      });
      var leftWallShape = new p2.Box({
        width: leftWallWidth,
        height: leftWallHeight,
        restitution: 1 // 跳ね返り具合を調整
      });
      leftWallBody.addShape(leftWallShape);
      world.addBody(leftWallBody);
    }

    // 右の壁を生成する関数
    function createRightWall() {
      var rightWallWidth = 20;
      var rightWallHeight = canvas.height;

      rightWallBody = new p2.Body({
        position: [canvas.width + rightWallWidth / 2, canvas.height / 2] // 右の壁の中央に配置
      });
      var rightWallShape = new p2.Box({
        width: rightWallWidth,
        height: rightWallHeight,
        restitution: 1 // 跳ね返り具合を調整
      });
      rightWallBody.addShape(rightWallShape);
      world.addBody(rightWallBody);
    }

    // キャンバスがクリックされたときの処理
    canvas.addEventListener("click", function (event) {

      if (!canClick) {
        return;
      }

      // クリックされた座標を取得
      var clickX = event.clientX - canvas.getBoundingClientRect().left;
      // var clickY = event.clientY - canvas.getBoundingClientRect().top;

      // next_ballからボールをpopして新しいボールを生成
      if (nextBalls.length > 0) {
        var selectedBall = nextBalls.pop();
        var BallRadius = selectedBall.radius;
        var ballX = Math.max(Math.min(clickX, canvas.width - BallRadius), BallRadius);
        var ballY = canvas.height - BallRadius;
        createBall(ballX, ballY, selectedBall);
      }

      // クリックを無効にする
      canClick = false;
      // 0.8秒後にクリックを有効にする
      setTimeout(function () {
        canClick = true;
      }, interval);

    });

    // 新しいボールを生成する関数
    function createBallInfo() {
      // ランダムにボールの種類を選択
      var randomIndex = Math.floor(Math.random() * topBallTypes.length);
      var selectedBall = topBallTypes[randomIndex]

      return selectedBall;
    }

    // ボールを生成する関数
    function createBall(x, y, ballInfo) {
      console.log(ballInfo)
      // Ballを物理エンジンに追加
      var ballBody = new p2.Body({
        // mass: 1, // ボールの質量
        mass: ballInfo.mass,
        position: [x, y], // ボールの初期位置
        velocity: [initialVelocityX, initialVelocityY], // 初期速度
      });

      var ballShape = new p2.Circle({
        radius: ballInfo.radius,
        restitution: 0.4 // 跳ね返り具合を調整
      });
      ballBody.addShape(ballShape);
      ballBody.color = ballInfo.color; // 色の情報を追加
      world.addBody(ballBody);
        // ボールの初期回転角度を指定（必要に応じて変更）
      ballBody.angle = ballInfo.initialRotationAngle || 0;
      world.addBody(ballBody);
    }



    // ボールを消滅させる関数
    function removeBall(ballBody) {
      // worldからボディを削除
      world.removeBody(ballBody);
    }

    // ボール同士の重なりを解消する関数
    function resolveBallOverlapWithBalls(targetBody, allBodies) {
      var targetRadius = targetBody.shapes[0].radius;

      for (var i = 1; i < allBodies.length; i++) {
        var otherBody = allBodies[i];

        if (targetBody !== otherBody) {
          var distance = p2.vec2.dist(targetBody.position, otherBody.position);
          var totalRadius = targetRadius + otherBody.shapes[0].radius;

          // ボール同士が重なっている場合、位置を調整
          if (distance < totalRadius) {
            var overlap = (totalRadius - distance) / 2;
            var direction = p2.vec2.subtract([0, 0], targetBody.position, otherBody.position);
            p2.vec2.normalize(direction, direction);

            // 位置の調整
            targetBody.position[0] += direction[0] * overlap;
            targetBody.position[1] += direction[1] * overlap;
            otherBody.position[0] -= direction[0] * overlap;
            otherBody.position[1] -= direction[1] * overlap;
          }
        }
      }
    }

    // 壁との重なりを解消する関数
    function resolveBallOverlapWithWalls(body, canvas) {
      var ballRadius = body.shapes[0].radius;

      // 左右の壁との重なりを解消
      if (body.position[0] - ballRadius < 0) {
        body.position[0] = ballRadius;
      } else if (body.position[0] + ballRadius > canvas.width) {
        body.position[0] = canvas.width - ballRadius;
      }

      // 上下の壁との重なりを解消
      if (body.position[1] - ballRadius < 0) {
        body.position[1] = ballRadius;
      } else if (body.position[1] + ballRadius > canvas.height) {
        body.position[1] = canvas.height - ballRadius;
      }
    }

    // ボールのサイズから対応するballTypesのidを取得する関数
    function getBallTypeId(radius) {
      var ballInfo = ballTypes.find(function (ball) {
        return ball.radius === radius;
      });

      return ballInfo ? ballInfo.id : null;
    }

    // ゲームオーバーの条件を確認
    function checkGameOver() {
      for (var i = 1; i < world.bodies.length; i++) {
        var body = world.bodies[i];
        var ballY = body.position[1];
        var ballRadius = body.shapes[0].radius;

        // ゲームオーバーの条件：ボールのy座標がキャンバスの上部を超えた場合
        if (ballY + ballRadius > canvas.height) {
          // ゲームオーバー処理
          showGameOverPopup();
        }
      }
    }

    function showGameOverPopup() {
      // ここにゲームオーバー時の処理を実装する
    //   alert("Game Over!");
      // または、独自のポップアップや画面遷移処理を追加する
      gameOverFlg = true
      // ゲームオーバー後に初期化を行う
      canvas.style.backgroundColor = "#e0e0e0";
      world.removeBody(rightWallBody);
      world.removeBody(leftWallBody);
      interval = 0;
      
      // スコアをポップアップに表示
      var scoreValueElement = document.getElementById("scoreValue");
      scoreValueElement.textContent = showScore;
      // ポップアップを表示
      var gameOverPopup = document.getElementById("gameOverPopup");
      gameOverPopup.style.display = "block";
    
    
    }

    function drawBall(ballX, ballY, ballRadius,ballColor,rotationAngle) {

        ballY = canvas.height - ballY
    // パスを作成してクリッピング領域を円に設定
    context.save();
    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    context.clip();

    // ボールの描画位置を設定
    context.translate(ballX, ballY);
    
    // 回転を適用
    context.rotate(-rotationAngle);
    // 拡大率を設定
    var scale = 2;
    context.scale(scale, scale);
    // Canvas上に画像を描画
    context.drawImage(ballImage, -ballRadius, -ballRadius, 2 * ballRadius, 2 * ballRadius);

    // クリッピング領域をリセット
    context.restore();

    // 円の外枠を黒くする
    context.strokeStyle = "black";
    context.lineWidth = 2;  // 任意の太さを指定
    context.stroke();

    }


    function init() {

    }

    // アニメーションフレーム更新時の処理
    function update() {
      // 物理エンジンのステップ
      world.step(1 / 60);

      // キャンバスのクリア
      context.clearRect(0, 0, canvas.width, canvas.height);

      // totalscoreを描画
      if (gameOverFlg === false) {
        showScore = totalScore;
      }
      context.fillStyle = "black";
      context.font = "20px Arial";
      context.fillText("Total Score: " + showScore, 10, 30);

      // 地面の描画
      context.fillStyle = "gray";
      context.fillRect(0, canvas.height - world.bodies[0].position[1], 800, 10);

      // ボールの描画
      for (var i = 1; i < world.bodies.length; i++) {
        var body = world.bodies[i];
        var ballX = body.position[0];
        var ballY = body.position[1];
        var ballRadius = body.shapes[0].radius;
        var ballColor = body.color;
        var rotationAngle = body.angle;

        // 物体の速度を制限
        body.velocity[0] = Math.max(-maxVelocity, Math.min(maxVelocity, body.velocity[0]));
        body.velocity[1] = Math.max(-maxVelocity, Math.min(maxVelocity, body.velocity[1]));

        drawBall(ballX, ballY, ballRadius,ballColor,rotationAngle)
      }

      // ゲームオーバーの条件を確認
      if (gameOverFlg === false) {
        checkGameOver();
      }

      // next_ballが空なら新しいボール情報を生成してpush
      if (nextBalls.length === 0) {
        nextBalls.push(createBallInfo());
      }

      // nextBallsの描画
      if (canClick === true) {
        var ballInfo = nextBalls[0];
        var ballRadius = ballInfo.radius;
        var ballColor = ballInfo.color;
        var ballX = Math.max(Math.min(cursorX, canvas.width - ballRadius), ballRadius);
        var ballY = canvas.height - ballRadius;

        drawBall(ballX,ballY,ballRadius,ballColor,0);
        
      }
      // 次のアニメーションフレームの呼び出し
      requestAnimationFrame(update);
      
    }

    // 初期化時に地面，壁を生成
    createGround();
    createLeftWall();
    createRightWall();
    // 最初のアニメーションフレームの呼び出し
    update();