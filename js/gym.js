console.log('yatai.js is loaded'); // ファイルロード確認用のログ

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(7.16, 11.13, 36.29);  // カメラを正面に固定
//camera.position.set(-30, 10, 0);    //テスト用
camera.lookAt(12.8, 0, -13);  // カメラをシーンの中心に向ける
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
    'models/gym.glb',
    function (gltf) {
        originalModel = gltf.scene;
        scene.add(originalModel);
        console.log('Original model loaded'); // ロード成功ログ
        
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

    if(originalModel){
        originalModel.rotation.y += 0.003;
    }


    // controls.update();      //カメラの動き要らないから削除して
    renderer.render(scene, camera);
    // console.log(camera.position);
}
animate();


// タブのボタンを取得
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

// 各タブボタンにクリックイベントを追加
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    // すべてのタブボタンとパネルを非アクティブ化
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    // クリックされたボタンと対応するパネルをアクティブ化
    button.classList.add('active');
    const targetPanel = document.getElementById(button.dataset.target);
    targetPanel.classList.add('active');
  });
});


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
