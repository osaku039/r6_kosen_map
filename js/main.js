console.log('main.js is loaded'); // ファイルロード確認用のログ

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(-50, 25, 0);  // カメラを正面に固定
//camera.position.set(-30, 10, 0);    //テスト用
camera.lookAt(20, -5, 0);  // カメラをシーンの中心に向ける
//camera.lookAt(20, -5, -20); //テスト用
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

renderer.setClearColor(0xfff2b9); 


/*
// OrbitControlsのセットアップ      ...カメラの動きを制御するやつ。いらない
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
*/

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

/*
const objectInfo = {
    'pin1': '2年1組屋台(麺類)',
    'pin2': '2年2組屋台',
    'pin3': '3年生物屋台（串もの）',
    'pin4': '4年機械屋台',
    'pin5': 'お',
    'pin6': 'か',
    'pin7': 'き',
    'yata1': '2年1組屋台(麺類)',
    'yata2': '2年2組屋台',
    'yata3': '3年生物屋台（串もの）',
    'yata4': '4年機械屋台',
    'yata5': 'お',
    'yata6': 'か',
    'yata7': 'き',
};
*/

const objectInfo = {
    'pin1': '2年1組屋台(麺類)',
    '立方体094': '2年1組屋台(麺類)',
    '立方体094_1': '2年1組屋台(麺類)',
    '立方体094_2': '2年1組屋台(麺類)',
    '立方体094_3': '2年1組屋台(麺類)',
    '立方体094_4': '2年1組屋台(麺類)',
    '立方体094_5': '2年1組屋台(麺類)',
    '立方体094_6': '2年1組屋台(麺類)',
    '立方体094_7': '2年1組屋台(麺類)',
    '立方体094_8': '2年1組屋台(麺類)',
    '立方体094_9': '2年1組屋台(麺類)',
    '立方体094_10': '2年1組屋台(麺類)',
    '立方体094_11': '2年1組屋台(麺類)',
    '立方体094_12': '2年1組屋台(麺類)',
    '立方体094_13': '2年1組屋台(麺類)',
    '立方体094_14': '2年1組屋台(麺類)',
    '立方体094_15': '2年1組屋台(麺類)',
    '立方体094_16': '2年1組屋台(麺類)',

    'pin2': '2年2組屋台',
    '立方体072': '2年2組屋台',
    '立方体072_1': '2年2組屋台',
    '立方体072_2': '2年2組屋台',
    '立方体072_3': '2年2組屋台',
    '立方体072_4': '2年2組屋台',
    '立方体072_5': '2年2組屋台',
    '立方体072_6': '2年2組屋台',
    '立方体072_7': '2年2組屋台',
    '立方体072_8': '2年2組屋台',
    '立方体072_9': '2年2組屋台',
    '立方体072_10': '2年2組屋台',
    '立方体072_11': '2年2組屋台',
    '立方体072_12': '2年2組屋台',
    '立方体072_13': '2年2組屋台',
    '立方体072_14': '2年2組屋台',
    '立方体072_15': '2年2組屋台',
    '立方体072_16': '2年2組屋台',
    
    'pin3': '3年生物屋台（串もの）',
    '立方体035': '3年生物屋台（串もの）',
    '立方体035_1': '3年生物屋台（串もの）',
    '立方体035_2': '3年生物屋台（串もの）',
    '立方体035_3': '3年生物屋台（串もの）',
    '立方体035_4': '3年生物屋台（串もの）',
    '立方体035_5': '3年生物屋台（串もの）',
    '立方体035_6': '3年生物屋台（串もの）',
    '立方体035_7': '3年生物屋台（串もの）',
    '立方体035_8': '3年生物屋台（串もの）',
    '立方体035_9': '3年生物屋台（串もの）',
    '立方体035_10': '3年生物屋台（串もの）',
    '立方体035_11': '3年生物屋台（串もの）',
    '立方体035_12': '3年生物屋台（串もの）',
    '立方体035_13': '3年生物屋台（串もの）',
    '立方体035_14': '3年生物屋台（串もの）',
    '立方体035_15': '3年生物屋台（串もの）',
    '立方体035_16': '3年生物屋台（串もの）',
    
    'pin4': '4年機械屋台',
    '立方体012': '4年機械屋台',
    '立方体012_1': '4年機械屋台',
    '立方体012_2': '4年機械屋台',
    '立方体012_3': '4年機械屋台',
    '立方体012_4': '4年機械屋台',
    '立方体012_5': '4年機械屋台',
    '立方体012_6': '4年機械屋台',
    '立方体012_7': '4年機械屋台',
    '立方体012_8': '4年機械屋台',
    '立方体012_9': '4年機械屋台',
    '立方体012_10': '4年機械屋台',
    '立方体012_11': '4年機械屋台',
    '立方体012_12': '4年機械屋台',
    '立方体012_13': '4年機械屋台',
    '立方体012_14': '4年機械屋台',
    '立方体012_15': '4年機械屋台',
    '立方体012_16': '4年機械屋台',

    'pin5': 'お',
    '立方体055': 'お',
    '立方体055_1': 'お',
    '立方体055_2': 'お',
    '立方体055_3': 'お',
    '立方体055_4': 'お',
    '立方体055_5': 'お',
    '立方体055_6': 'お',
    '立方体055_7': 'お',
    '立方体055_8': 'お',
    '立方体055_9': 'お',
    '立方体055_10': 'お',
    '立方体055_11': 'お',
    '立方体055_12': 'お',
    '立方体055_13': 'お',
    '立方体055_14': 'お',
    '立方体055_15': 'お',
    '立方体055_16': 'お',

    'pin6': 'い',
    '立方体089': 'い',
    '立方体089_1': 'い',
    '立方体089_2': 'い',
    '立方体089_3': 'い',
    '立方体089_4': 'い',
    '立方体089_5': 'い',
    '立方体089_6': 'い',
    '立方体089_7': 'い',
    '立方体089_8': 'い',
    '立方体089_9': 'い',
    '立方体089_10': 'い',
    '立方体089_11': 'い',
    '立方体089_12': 'い',
    '立方体089_13': 'い',
    '立方体089_14': 'い',
    '立方体089_15': 'い',
    '立方体089_16': 'い',

    'pin7': 'え',
    '立方体123': 'え',
    '立方体123_1': 'え',
    '立方体123_2': 'え',
    '立方体123_3': 'え',
    '立方体123_4': 'え',
    '立方体123_5': 'え',
    '立方体123_6': 'え',
    '立方体123_7': 'え',
    '立方体123_8': 'え',
    '立方体123_9': 'え',
    '立方体123_10': 'え',
    '立方体123_11': 'え',
    '立方体123_12': 'え',
    '立方体123_13': 'え',
    '立方体123_14': 'え',
    '立方体123_15': 'え',
    '立方体123_16': 'え',

}


// GLTFモデルのロード
const loader = new THREE.GLTFLoader();

loader.load(
    'models/yatai.glb',
    function (gltf) {
        originalModel = gltf.scene;
        scene.add(originalModel);
        console.log('Original model loaded'); // ロード成功ログ

        // クリック可能なオブジェクトをリストに追加
        for (let name in objectInfo) {
            const clickableObject = scene.getObjectByName(name);
            if (clickableObject) {
                clickableObjects.push(clickableObject);
                clickableObject.userData.info = objectInfo[name]; // オブジェクトに情報を紐付け
                console.log('Clickable object:', clickableObject); // クリック可能なオブジェクトを確認
            }
            else {
                console.log('Object not found:', name); // オブジェクトが見つからなかった場合のログ
            }
        }
        
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

    // アニメーション対象のオブジェクトを更新
    animatedObjects.forEach(obj => {
        if (obj.visible && obj.position.y < obj.targetY) {
            obj.position.y += 0.01;
        }
    });

    //controls.update();      //カメラの動き要らないから削除して
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
