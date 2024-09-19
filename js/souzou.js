console.log('main.js is loaded'); // ファイルロード確認用のログ

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
);
// camera.position.z =5;
camera.position.set(0, 0, 5);
camera.lookAt(20,-5,0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

renderer.setClearColor(0xfff2b9); 



// OrbitControlsのセットアップ
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.enablePan = false; //パンを禁止
controls.maxPolarAngle = Math.PI * 0.33;//カメラ最大値を0.33に
controls.minPolarAngle = Math.PI * 0.33;//カメラ最小値を0.33に

// 光源の追加
const ambientLight = new THREE.AmbientLight(0xf0f0f0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff,0.5 ); // 1.5に増加
directionalLight.position.set(2, 30, 0).normalize();
scene.add(directionalLight);

let originalModel;
let newModel;
const clickableObjects = []; // クリック可能なオブジェクトのリスト

// オブジェクトの情報
const objectInfo = {
    //１階
    '1-1': '1緑',
    '1-2': '1赤',
    '1-3': '1青',
    '1-4': '1黄',
    //２階
    '2-1': '2緑',
    '2-2': '2赤',
    '2-3': '2青',
    '2-4': '2黄',
    //３階
    '3-1': '3緑',
    '3-2': '3赤',
    '3-3': '3青',
    '3-4': '3黄',

};

// GLTFモデルのロード
const loader = new THREE.GLTFLoader();
loader.load(
    'models/floor_souzou.glb',
    function (gltf) {
        originalModel = gltf.scene;
        scene.add(originalModel);
        console.log('Original model loaded'); // ロード成功ログ

        // クリック可能なオブジェクトをリストに追加
        const clickable = Object.keys(objectInfo); // クリック可能なオブジェクト名のリスト

        clickable.forEach(name => {
            const clickableObject = scene.getObjectByName(name);
            if (clickableObject) {
                clickableObjects.push(clickableObject);
                console.log('Clickable object siroiyatsu', clickableObject);
            }
        });
        bitton()
    },
    undefined,
    function (error) {
        console.error('An error happened', error);
    }
);

// カメラの位置
camera.position.x = -20;
camera.position.y = 20;
camera.position.z = 10;

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

    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        console.log('モデルがクリックされました！');
        const intersectedObject = intersects[0].object;
        console.log('Intersected object:', intersectedObject);

        
        showInfoBox(intersectedObject);
    }
}
    

function showInfoBox(object) {
    const infoBox = document.getElementById('infoBox');
    const info = objectInfo[object.name] || '情報が見つかりません'; // オブジェクトの情報を取得
    infoBox.innerHTML = `<strong>モデル名:</strong> ${object.name}<br><strong>情報:</strong><br> ${info}<br><button onclick="location.href='yatai.html'">移動</button>`;
    infoBox.style.display = 'block';
}




window.addEventListener('click', onMouseClick);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
