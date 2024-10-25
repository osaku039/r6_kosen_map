import { yataiLocateInfo } from "./locateInformation.js";
import { classInfo } from "./programInformation.js";
console.log('yatai.js is loaded'); // ファイルロード確認用のログ

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0,27,52);  // カメラを正面に固定
//camera.position.set(-30, 10, 0);    //テスト用
camera.lookAt(0, 0, 0);  // カメラをシーンの中心に向ける
//camera.lookAt(20, -5, -20); //テスト用
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

renderer.setClearColor(0xfff2b9); 

let isShowInfo = false;



// OrbitControlsのセットアップ      ...カメラの動きを制御するやつ。いらない
const controls = new THREE.OrbitControls(camera, renderer.domElement);
// ユーザーの操作を無効にする
controls.enableRotate = false;  // 回転を無効
controls.enablePan = false;     // パンを無効
controls.enableZoom = false;    // ズームを無効


// 光源の追加
const ambientLight = new THREE.AmbientLight(0xf0f0f0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff,0.5 ); // 1.5に増加
directionalLight.position.set(2, 30, 0).normalize();
scene.add(directionalLight);

let originalModel;
let newModel;

let clickableObjects = []; // クリック可能なオブジェクトのリスト
console.log(originalModel); // モデル内のオブジェクトの確認

const locationText = document.getElementById('location-text');

// GLTFモデルのロード
const loader = new THREE.GLTFLoader();

loader.load(
    'models/yatai3.glb',
    function (gltf) {
        originalModel = gltf.scene;
        scene.add(originalModel);
        console.log('Original model loaded'); // ロード成功ログ

        const clickable = Object.keys(yataiLocateInfo); // クリック可能なオブジェクト名のリスト

        clickable.forEach(name => {
            const clickableObject = scene.getObjectByName(name);
            if (clickableObject) {
                clickableObjects.push(clickableObject);
            }
        });
        
        console.log('All clickable objects:', clickableObjects); // すべてのクリック可能なオブジェクトを確認

        moveCamera('home', 1, "power1.out");

    },
    undefined,
    function (error) {
        console.error('An error happened', error);  //エラーログ
    }
);


// アニメーション対象のオブジェクト
const animatedObjects = [];

// レンダリングループ
function animate() {
    requestAnimationFrame(animate);

    controls.update();      //カメラの動き要らないから削除して
    // console.log(camera.position);
    renderer.render(scene, camera);
}
animate();

// クリックイベント
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        console.log('Intersected object:', intersectedObject);

        showInfoBox(intersectedObject.parent.name);
    }
    else {
        moveCamera('home', 1.5, "power1.out");
        hideInfoBox();
        changeLocationText('home');
    }
}
    

//クリックされたオブジェクトの情報を表示
function showInfoBox(name) {
    isShowInfo = true;
    const infoBox = document.getElementById('infoBox');
    const classId = yataiLocateInfo[name]['class'];
    const className = classInfo[classId]['className'];
    const program = classInfo[classId]['program'];
    const category = classInfo[classId]['category'];
    const comment = classInfo[classId]['comment'];
    const iconFile = classInfo[classId]['iconFile'];
    const photo = classInfo[classId]['photo'];
    const targetObject = scene.getObjectByName(name);
    infoBox.innerHTML = `
        <style>
            .card__footer_01 {
                
            }
        </style>
      <div class="l-wrapper_01">
        <article class="card_01">
          <div class="card__header_01">
            <div class="class_photo">
                <a href=${photo} data-lightbox="group"><img src=${photo}></a>
            </div>
            <div>
                <img src=${iconFile} alt="icon" class="class_icon">
            </div>
          </div>
          <div class="card__body_01">
            <strong>クラス:</strong> ${className}<br>${program}<br>
            <p class="card__text2_01">${comment}</p>
          </div>
          
        </article>
      </div>
      `;
    // ボタンのクリックイベントを設定
     
    infoBox.style.display = 'block';
    moveCamera(name, 1.5, "power1.out");
    changeLocationText(name);
    console.log(targetObject.parent.name);
}

// InfoBox を非表示にする関数
function hideInfoBox() {
    const infoBox = document.getElementById('infoBox');
    infoBox.style.display = 'none'; // 非表示にする
}


//カメラを動かす
function moveCamera(name, duration, ease) {
    let cameraPosition;
    let targetPosition;
    const cameraPositionValue = yataiLocateInfo[name]['cameraPosition'] || [0,0,0]; // オブジェクトの情報を取得
    const targetPositionValue = yataiLocateInfo[name]['Position'] || [0,0,0];
    //配列を座標に変換
    cameraPosition = new THREE.Vector3(
        cameraPositionValue[0],
        cameraPositionValue[1],
        cameraPositionValue[2]
    );
    targetPosition = new THREE.Vector3(
        parseFloat(targetPositionValue[0]),
        parseFloat(targetPositionValue[1]),
        parseFloat(targetPositionValue[2])
    );
    // GSAPのタイムラインを使って、カメラの移動と視点の移動を同時に行う
    gsap.timeline()
        .to(camera.position, {
          x: cameraPosition.x,
          y: cameraPosition.y,
          z: cameraPosition.z,
          duration: duration,
          ease: ease,
          onUpdate: function () {
            // カメラが動いたときに常にOrbitControlsを更新
            controls.update();
          }
        }, 0) // タイムラインの0秒目から開始"power3.in"
        .to(controls.target, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: duration,
          ease: ease,
          onUpdate: function () {
            // OrbitControlsを更新して視点の変更を反映
            controls.update();
          }
    }, 0); // タイムラインの0秒目から開始
}

function changeLocationText(name) {
    console.log(name);
    locationText.innerHTML = yataiLocateInfo[name]['locationText'] || '情報が見つかりません';
}

window.addEventListener('click', onMouseClick);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
