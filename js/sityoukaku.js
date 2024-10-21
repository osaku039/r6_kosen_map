console.log('yatai.js is loaded'); // ファイルロード確認用のログ
// import * as THREE from 'three';
// import { CSS2DRenderer, CSS2DObject } from 'CSS2DRenderer';
// import { gsap } from 'gsap';
// import { GLTFLoader } from 'GLTFLoader';
// import { OrbitControls } from "OrbitControls";

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(6.81, 6.58, 15.65);  // カメラを定位置
//camera.position.set(-30, 10, 0);    //テスト用
camera.lookAt(4.66, 1.34, -0.53);  // カメラをシーンの中心に向ける
//camera.lookAt(20, -5, -20); //テスト用
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);


// const labelRenderer = new CSS2DRenderer();
// labelRenderer.setSize( window.innerWidth, window.innerHeight );
// labelRenderer.domElement.style.position = 'absolute';
// labelRenderer.domElement.style.top = '0px';

document.getElementById('container').appendChild(labelRenderer.domElement);

renderer.setClearColor(0xfff2b9); //背景色



<<<<<<< HEAD
// OrbitControlsのセットアップ      ...カメラの動きを制御するやつ。いらない
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
=======
// // OrbitControlsのセットアップ      ...カメラの動きを制御するやつ。いらない
// // const controls = new OrbitControls(camera, labelRenderer.domElement);
// const controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;
// controls.screenSpacePanning = false;
>>>>>>> main


// 光源の追加
const ambientLight = new THREE.AmbientLight(0xf0f0f0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff,0.5 ); // 1.5に増加
directionalLight.position.set(2, 30, 0).normalize();
scene.add(directionalLight);

let originalModel;

let clickableObjects = []; // クリック可能なオブジェクトのリスト

let model;


// GLTFモデルのロード
const loader = new THREE.GLTFLoader();

loader.load(
    'models/piano4.glb',
    function (gltf) {
        originalModel = gltf.scene;
        scene.add(originalModel);
        console.log('Original model loaded'); // ロード成功ログ

        // const earthDiv = document.createElement( 'div' );
        // earthDiv.className = 'label';
        // earthDiv.textContent = 'piano';
        // earthDiv.style.backgroundColor = 'transparent';

        // const earthLabel = new CSS2DObject( earthDiv );
        // console.log(earthLabel); // earthLabelの全プロパティを確認
        // earthLabel.position.set( 0, 0, 6);
        // console.log(earthLabel.position); // これが正しいオブジェクトか確認
        // // earthLabel.center.set( 0, 1 );
        // // earthLabel.layers.set( 0 );
        // scene.add(earthLabel);

        // labelRenderer.domElement.style.pointerEvents = 'none';

        // document.body.appendChild( labelRenderer.domElement );

        const clickableObject = scene.getObjectByName('piano');
        model = scene.getObjectByName('piano');
        console.log('Checking name:', clickableObject.name);

        if (clickableObject) {
            clickableObjects.push(clickableObject);
            console.log('Clickable object:', clickableObject);
        }else {
            console.log("無理でした...");
        }
        
        console.log(clickableObjects[0].name); // すべてのクリック可能なオブジェクトを確認

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
    
    if (model) {
        model.rotation.y += 0.003;  // ロード後に回転
    }

    // アニメーション対象のオブジェクトを更新
    // animatedObjects.forEach(obj => {
    //     if (obj.visible && obj.position.y < obj.targetY) {
    //         obj.position.y += 0.01;
    //     }
    // });

    controls.update();      //カメラの動き要らないから削除して
    renderer.render(scene, camera);
    // labelRenderer.render(scene, camera); // CSS2DRendererを更新
    // console.log(camera.position);
}
animate();

// クリックイベント
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    console.log("Click");
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        console.log('Intersected object:', intersectedObject);

        showInfoBox(intersectedObject);
    }
    else {
        console.log('No clickable object was clicked.'); // クリックされた場所にオブジェクトがなかった場合
    }
}
    

function showInfoBox(object) {
    const infoBox = document.getElementById('infoBox');
    const info = object.userData.info || '情報が見つかりません'; // オブジェクトの情報を取得
    console.log('Showing info for object:', object.name, 'with info:', info); // 表示される情報を確認
    infoBox.innerHTML = `<strong>モデル名:</strong> ${object.name}<br><strong>情報:</strong><br> ${info}<br><button onclick="location.href='souzou.html'">移動</button>`;
    infoBox.style.display = 'block';
}


window.addEventListener('click', onMouseClick);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// controls.domElement.addEventListener('touchstart', function(event) {
//     console.log('Touch start detected');
// }, { passive: false });

// controls.domElement.addEventListener('touchstart', function(event) {
//     event.preventDefault();  // この行でタッチ時のスクロールを防ぎます
//     // タッチイベントに応じたカスタムロジックを追加できます
// }, { passive: false });

