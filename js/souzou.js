import { Info } from './information.js';
console.log('main.js is loaded'); // ファイルロード確認用のログ
// const object = {
//     "001":{
//         "list":["りっぽうたい1","りっぽいうたい2"],
//         "description":"２ねんいちくみ"
//     }
// }

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene(); //シーンの作成
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
); //カメラの作成
// camera.position.z =5;
camera.position.set(108, 113, 159); //カメラの位置
// camera.lookAt(100,100,0); //カメラの見る方向
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); //画面サイズ
document.getElementById('container').appendChild(renderer.domElement); //レンダラーをHTMLに追加

renderer.setClearColor(0xfff2b9);  //背景色の追加



// OrbitControlsのセットアップ
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; //カメラの動きをなめらかに
controls.dampingFactor = 0.1; //なめらかさの度合い
// controls.screenSpacePanning = false; //パンの無効化
// // controls.enablePan = false; //パンを禁止
// controls.maxPolarAngle = Math.PI * 0.33;//カメラ最大値を0.33に
// controls.minPolarAngle = Math.PI * 0.33;//カメラ最小値を0.33に

// 光源の追加
const ambientLight = new THREE.AmbientLight(0xf0f0f0); //環境光
scene.add(ambientLight); //シーンに追加

const directionalLight = new THREE.DirectionalLight(0xffffff,0.5 ); // 平行光1.5に増加
directionalLight.position.set(2, 30, 0).normalize(); //光の方向をセット
scene.add(directionalLight); //シーンに追加

let originalModel;
let newModel;
const clickableObjects = []; // クリック可能なオブジェクトのリスト

//グループの定義
const allModelGroup = new THREE.Group();
const floor1Group = new THREE.Group(); // 1階のグループ
const floor2Group = new THREE.Group(); // 2階のグループ
const floor3Group = new THREE.Group(); // 3階のグループ
const invisibleGroup = new THREE.Group(); //不可視にしたいグループ

// GLTFモデルのロード
const loader = new THREE.GLTFLoader();
loader.load(
    'models/floor_souzou3.glb',
    function (gltf) {
        // const groupedModel = createGroupedModel(gltf); // グループ化されたモデルを取得
        originalModel = gltf.scene; //読み込んだモデルの取得

        // scene.add(groupedModel); // シーンにグループ化されたモデルを追加
        scene.add(originalModel); //シーンに追加
        console.log('Original model loaded'); // ロード成功ログ
        // object.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        // クリック可能なオブジェクトをリストに追加
    
        // 1階のオブジェクトを1階のグループに追加

        const objectsFloor1 = ['1_1', '1_2', '1_3', '1_4', 'Stair1', '1_other'];
        objectsFloor1.forEach(name => {
            const object = gltf.scene.getObjectByName(name);
            if (object) {
                floor1Group.add(object); // 1階グループにオブジェクトを追加
            }
        });
    
        // 2階のオブジェクトを2階のグループに追加
        const objectsFloor2 = ['2_1', '2_2', '2_3', '2_4', '2_5', 'Stair2', '2_other', 'zinja'];
        objectsFloor2.forEach(name => {
            const object = gltf.scene.getObjectByName(name);
            if (object) {
                console.log(object);
                floor2Group.add(object); // 2階グループにオブジェクトを追加
            }
        });
    
        // 3階のオブジェクトを3階のグループに追加
        const objectsFloor3 = ['3_1', '3_2', '3_3', '3_4', '3_5', '3_6', 'Stair3', '3_other'];
        objectsFloor3.forEach(name => {
            const object = gltf.scene.getObjectByName(name);
            // object.name = 'aiueo';
            if (object) {
                floor3Group.add(object); // 3階グループにオブジェクトを追加
            }
        });

        const objectsInvisible = ['invisible', 'invisible2', 'invisible3', 'invisible4', 'invisible5', 'invisible6', 'invisible7', 'invisible8'];
        objectsInvisible.forEach(name => {
            const object = gltf.scene.getObjectByName(name);
            if (object) {
                invisibleGroup.add(object);
            }
        });
    
        // 各階のグループを全体のグループに追加
        allModelGroup.add(floor1Group);
        allModelGroup.add(floor2Group);
        allModelGroup.add(floor3Group);
    
        // 全体のグループをシーンに追加
        scene.add(allModelGroup);

        invisibleGroup.visible = false;

        //オブジェクトを消す！
        moveObject(floor1Group, 1, 0, 1, 0);
        moveObject(floor2Group, 1, 0, 1, 0);
        moveObject(floor3Group, 1, 0, 1, 0);
        
        const clickable = Object.keys(Info); // クリック可能なオブジェクト名のリスト

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


// アニメーション対象のオブジェクト
const animatedObjects = [];

// レンダリングループ
function animate() {
    requestAnimationFrame(animate); //毎フレーム更新

    // originalModel.rotation.x += 0.2;

    controls.update(); //カメラのコントロールを更新
    renderer.render(scene, camera); //シーンを描画
}
animate(); //アニメーション開始

// クリックイベント
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let visibleFloor; //見せるオブジェクト
let invisibleFloor1; //見せないオブジェクト1,2
let invisibleFloor2;

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

        //階の選択
        if (intersectedObject.parent.name.startsWith('F')){
            console.log(intersectedObject.name);

            showFloor(intersectedObject.parent.name);
        }
        else{

            //クラスを選択
            const worldPosition = new THREE.Vector3();
            intersectedObject.getWorldPosition(worldPosition);
            console.log(worldPosition); // ワールド座標を出力

            moveCamera("aiueo", worldPosition, intersectedObject);
            showInfoBox(intersectedObject);

        }
    }
    else {
        const intersectedObject = intersects[0].object;
        console.log('Intersected object:', intersectedObject);
    }


}
    
//クリックされたオブジェクトの情報を表示
function showInfoBox(object) {
    const infoBox = document.getElementById('infoBox');
    const className = object.parent.name || object.name;
    const info = Info[className]['description'] || '情報が見つかりません'; // オブジェクトの情報を取得
    infoBox.innerHTML = `<strong>モデル名:</strong> ${object.name}<br>${className}<br><strong>情報:</strong><br> ${info}<br><button onclick="location.href='yatai.html'">移動</button>`;
    infoBox.style.display = 'block';
}

//Objectを動かす
function moveObject(group, x, y, z, duration) {
    gsap.to(group.scale, {
        x: x,  // x方向の拡大
        y: y,  // y方向の拡大
        z: z,  // z方向の拡大
        duration: duration,  // アニメーションの持続時間
    });
}

//Floorを出す
function showFloor(name) {
    switch(name){
        case 'F1':
            visibleFloor = floor1Group;
            invisibleFloor1 = floor2Group;
            invisibleFloor2 = floor3Group;
            break;
        case 'F2':
            visibleFloor = floor2Group;
            invisibleFloor1 = floor1Group;
            invisibleFloor2 = floor3Group;
            break;
        case 'F3':
            visibleFloor = floor3Group;
            invisibleFloor1 = floor1Group;
            invisibleFloor2 = floor2Group;
            break;
    }

    moveObject(visibleFloor, 1, 1, 1, 1);
    moveObject(invisibleFloor1, 1, 0, 1, 0);
    moveObject(invisibleFloor2, 1, 0, 1, 0);
}

//カメラを動かす
function moveCamera(name, worldPosition) {
    console.log(name);
    // // クリックされたオブジェクトの位置にカメラを動かす例
    gsap.to(camera.position, {
        x: worldPosition.x + 0, // オブジェクトの近くに移動するように
        y: worldPosition.y + 0,
        z: worldPosition.z + 10,
        duration: 1.5, // 1.5秒かけて移動
        onUpdate: function () {
                // OrbitControlsのターゲットを設定
                controls.target.copy(worldPosition);
                // カメラの更新
                controls.update();
        },
        onComplete: function () {
            console.log('Current Camera Position:', camera.position);
            // アニメーション終了後にカメラを固定
            // camera.lookAt(worldPosition.x,worldPosition.y,worldPosition.z);
            // console.log(worldPosition);
        }
        
    });
}

window.addEventListener('click', onMouseClick); //clickがあったらonMouseClickを作動させるのかな?

//ウィンドウサイズの調整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
