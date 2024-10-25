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

        showInfoBox();

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


function showInfoBox() {
    const infoBox = document.getElementById('infoBox');
    // const info = Info[name]['description'] || '情報が見つかりません'; // オブジェクトの情報を取得
    infoBox.innerHTML = `
        <ul class="time-schedule">
        <strong class="title">アリーナプログラム</strong>
        <div class="am">
            <li>
            <span class="time">10:00</span>
            <div class="sch_box"><p class="sch_title">Haruto Fujiki</p>
            </div>
            </li>
            <li>
                <span class="time">10:15</span>
                <div class="sch_box"><p class="sch_title">ic</p>
            </div>
            </li>
            <li>
            <span class="time">10:30</span>
            <div class="sch_box"><p class="sch_title">海パンスクワット</p>
            </div>
            </li>
            <li>
                <span class="time">10:45</span>
                <div class="sch_box"><p class="sch_title">動点P-MODEL</p>
            </div>
            </li>
            <li>
                <span class="time">11:00</span>
                <div class="sch_box"><p class="sch_title">KO専生は全員オタクなのか？</p>
            </div>
            </li>
            <li>
                <span class="time">11:15</span>
                <div class="sch_box"><p class="sch_title">良いコール、mc事情</p>
            </div>
            </li>
            <li>
                <span class="time">11:30</span>
                <div class="sch_box"><p class="sch_title">Eggsplosion</p>
            </div>
            </li>
            <li>
                <span class="time">11:45</span>
                <div class="sch_box"><p class="sch_title">タイ高専イベント</p>
            </div>
            </li>
            <li>
                <span class="time">12:00</span>
                <div class="sch_box"><p class="sch_title">カラオケ大会予選</p>
            </div>
            </li>
        </div>
        <div class="pm">
            <li>
                <span class="time">13:00</span>
                <div class="sch_box"><p class="sch_title">教員有志[C]</p>
            </div>
            </li>
            <li>
                <span class="time">13:15</span>
                <div class="sch_box"><p class="sch_title">教員有志[B]</p>
            </div>
            </li>
            <li>
                <span class="time">13:30</span>
                <div class="sch_box"><p class="sch_title">y四段活用y</p>
            </div>
            </li>
            <li>
                <span class="time">13:45</span>
                <div class="sch_box"><p class="sch_title">NOW OWN SALE!</p>
            </div>
            </li>
            <li>
                <span class="time">14:00</span>
                <div class="sch_box"><p class="sch_title">島唐辛子</p>
            </div>
            </li>
            <li>
                <span class="time">14:15</span>
                <div class="sch_box"><p class="sch_title">EQ20</p>
            </div>
            </li>
        </div>
    </ul>

    `;
    //  // ボタンのクリックイベントを設定
    // document.getElementById('animation').addEventListener('click', () => playAnimation(name));
     
    infoBox.style.display = 'block';
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
