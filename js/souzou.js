// import { createGroupedModel } from './grouping.js';
console.log('main.js is loaded'); // ファイルロード確認用のログ

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene(); //シーンの作成
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
); //カメラの作成
// camera.position.z =5;
camera.position.set(0, 0, 5); //カメラの位置
// camera.lookAt(20,-5,0); //カメラの見る方向
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); //画面サイズ
document.getElementById('container').appendChild(renderer.domElement); //レンダラーをHTMLに追加

renderer.setClearColor(0xfff2b9);  //背景色の追加



// OrbitControlsのセットアップ
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; //カメラの動きをなめらかに
controls.dampingFactor = 0.1; //なめらかさの度合い
controls.screenSpacePanning = false; //パンの無効化
// controls.enablePan = false; //パンを禁止
controls.maxPolarAngle = Math.PI * 0.33;//カメラ最大値を0.33に
controls.minPolarAngle = Math.PI * 0.33;//カメラ最小値を0.33に

// 光源の追加
const ambientLight = new THREE.AmbientLight(0xf0f0f0); //環境光
scene.add(ambientLight); //シーンに追加

const directionalLight = new THREE.DirectionalLight(0xffffff,0.5 ); // 平行光1.5に増加
directionalLight.position.set(2, 30, 0).normalize(); //光の方向をセット
scene.add(directionalLight); //シーンに追加

let originalModel;
let newModel;
const clickableObjects = []; // クリック可能なオブジェクトのリスト

// オブジェクトの情報
const objectInfo = {
    //１階
    '1F': '1地面',
    '1_1': '1緑',
    '1_2': '1赤',
    '1_3': '1青',
    '1_4': '1黄',
    '1_Stair': '1階段',
    //２階
    '2F': '2地面',
    '2_1': '2緑',
    '2_2': '2赤',
    '2_3': '2青',
    '2_4': '2黄',
    '2_Stair': '2階段',
    //３階
    '3F': '3地面',
    '3_1': '3緑',
    '3_2': '3赤',
    '3_3': '3青',
    '3_4': '3黄',

};

// GLTFモデルのロード
const loader = new THREE.GLTFLoader();
loader.load(
    'models/floor_souzou2.glb',
    function (gltf) {
        // const groupedModel = createGroupedModel(gltf); // グループ化されたモデルを取得
        originalModel = gltf.scene; //読み込んだモデルの取得

        // scene.add(groupedModel); // シーンにグループ化されたモデルを追加
        scene.add(originalModel); //シーンに追加
        console.log('Original model loaded'); // ロード成功ログ
        // object.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        // クリック可能なオブジェクトをリストに追加
        const clickable = Object.keys(objectInfo); // クリック可能なオブジェクト名のリスト

        clickable.forEach(name => {
            const clickableObject = scene.getObjectByName(name);
            if (clickableObject) {
                clickableObjects.push(clickableObject);
                console.log('Clickable object siroiyatsu', clickableObject);
            }
        });
        // bitton();
    },
    undefined,
    function (error) {
        console.error('An error happened', error);
    }
);

// // カメラの位置
camera.position.x = 0;
camera.position.y = 200;
camera.position.z = 100;

// アニメーション対象のオブジェクト
const animatedObjects = [];

// レンダリングループ
function animate() {
    requestAnimationFrame(animate); //毎フレーム更新

    // originalModel.rotation.x += 0.2;

    // アニメーション対象のオブジェクトを更新
    animatedObjects.forEach(obj => {
        if (obj.visible && obj.position.y < obj.targetY) {
            obj.position.y += 0.01; //y座標を少しずつ上げる
        }
    });

    controls.update(); //カメラのコントロールを更新
    renderer.render(scene, camera); //シーンを描画
}
animate(); //アニメーション開始

// クリックイベント
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//クリックイベント
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera); //マウス位置とカメラ位置の調整

    const intersects = raycaster.intersectObjects(clickableObjects, true); //クリックしたオブジェクトの検出

    if (intersects.length > 0) {
        console.log('モデルがクリックされました！');
        const intersectedObject = intersects[0].object;
        console.log('Intersected object:', intersectedObject);

        // クリックされたオブジェクトの位置にカメラを動かす例
        // gsap.to(camera.position, {
        //     x: intersectedObject.position.x + 10, // オブジェクトの近くに移動するように
        //     y: intersectedObject.position.y + 10,
        //     z: intersectedObject.position.z + 10,
        //     duration: 1.5, // 1.5秒かけて移動
        //     onUpdate: function () {
        //         camera.lookAt(intersectedObject.position); // 常にオブジェクトを向く
        //     }
        // });

        // gsap.to(intersectedObject.scale,
        //     {
        //         x:0,
        //         y:0,
        //         z:2,
        //     }
        // )
        
        console.log('position:', intersectedObject.position);
        
        showInfoBox(intersectedObject);
    }
    else {
        const intersectedObject = intersects[0].object;
        console.log('Intersected object:', intersectedObject);
    }


}
    
//クリックされたオブジェクトの情報を表示
function showInfoBox(object) {
    const infoBox = document.getElementById('infoBox');
    const info = objectInfo[object.name] || '情報が見つかりません'; // オブジェクトの情報を取得
    infoBox.innerHTML = `<strong>モデル名:</strong> ${object.name}<br><strong>情報:</strong><br> ${info}<br><button onclick="location.href='yatai.html'">移動</button>`;
    infoBox.style.display = 'block';
}

window.addEventListener('click', onMouseClick); //clickがあったらonMouseClickを作動させるのかな?

//ウィンドウサイズの調整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
