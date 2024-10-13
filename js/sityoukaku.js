console.log('yatai.js is loaded'); // ファイルロード確認用のログ

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

renderer.setClearColor(0xfff2b9); //背景色



// // OrbitControlsのセットアップ      ...カメラの動きを制御するやつ。いらない
// const controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;
// controls.screenSpacePanning = false;


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


// GLTFモデルのロード
const loader = new THREE.GLTFLoader();

loader.load(
    'models/piano2.glb',
    function (gltf) {
        originalModel = gltf.scene;
        scene.add(originalModel);
        console.log('Original model loaded'); // ロード成功ログ

        // // クリック可能なオブジェクトをリストに追加
        // for (let name in objectInfo) {
        //     const clickableObject = scene.getObjectByName(name);
        //     if (clickableObject) {
        //         clickableObjects.push(clickableObject);
        //         clickableObject.userData.info = objectInfo[name]; // オブジェクトに情報を紐付け
        //         console.log('Clickable object:', clickableObject); // クリック可能なオブジェクトを確認
        //     }
        //     else {
        //         console.log('Object not found:', name); // オブジェクトが見つからなかった場合のログ
        //     }
        // }
        
        console.log('All clickable objects:', clickableObjects); // すべてのクリック可能なオブジェクトを確認

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

    originalModel.rotation.y += 0.003;

    // アニメーション対象のオブジェクトを更新
    animatedObjects.forEach(obj => {
        if (obj.visible && obj.position.y < obj.targetY) {
            obj.position.y += 0.01;
        }
    });

    // controls.update();      //カメラの動き要らないから削除して
    renderer.render(scene, camera);
    // console.log(camera.position);
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
