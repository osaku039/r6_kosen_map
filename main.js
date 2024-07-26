console.log('main.js is loaded'); // ファイルロード確認用のログ

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);


renderer.physicallyCorrectLights = true;
renderer.setClearColor(0xffffff, 1.0); 
renderer.outputEncoding = THREE.sRGBEncoding;//https://liginc.co.jp/576599色味ちかづけるやつ
renderer.toneMapping = THREE.ACESFilmicToneMapping;//同上

// OrbitControlsのセットアップ
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;

// 光源の追加
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// モデルを保持する変数
let originalModel;
let newModel;

// GLTFモデルのロード
const loader = new THREE.GLTFLoader();
loader.load(
    './material/floor1.glb',
    function (gltf) {
        originalModel = gltf.scene;
        scene.add(originalModel);
        console.log('Original model loaded'); // ロード成功ログ
    },
    undefined,
    function (error) {
        console.error('An error happened', error);
    }
);

loader.load(
    './material/class1.glb',
    function (gltf) {
        newModel = gltf.scene;
        newModel.visible = false; // 最初は非表示に設定
        
        scene.add(newModel);
        console.log('New model loaded'); // ロード成功ログ
    },
    undefined,
    function (error) {
        console.error('An error happened', error);
    }
);

// カメラの位置
camera.position.z = 5;

// アニメーション対象のオブジェクト
const animatedObjects = [];

// レンダリングループ
function animate() {
    requestAnimationFrame(animate);

    // アニメーション対象のオブジェクトを更新
    animatedObjects.forEach(obj => {
        if (obj.visible && obj.position.y < obj.targetY) {
            obj.position.y += 0.01;
        }
    });

    controls.update();
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

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        console.log('モデルがクリックされました！');
        const intersectedObject = intersects[0].object;
        console.log('Intersected object:', intersectedObject);

        
            revealNewModel(intersectedObject);
       
    }
}

function revealNewModel(object) {
    if (newModel) {
        newModel.position.set(object.position.x, object.position.y, object.position.z);
        newModel.visible = true;
        newModel.position.y = -0.23;
        newModel.position.x = -4.61;
        newModel.targetY = newModel.position.y + 0.4; // Y軸方向のスライド距離
        animatedObjects.push(newModel);
        console.log('New model revealed'); // 出現成功
    }
}

window.addEventListener('click', onMouseClick);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
