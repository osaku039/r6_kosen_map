import { Info } from './information.js';
console.log('main.js is loaded'); // ファイルロード確認用のログ

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
const floor1ClassGroup = new THREE.Group(); // 1階のクラスグループ
const floor2ClassGroup = new THREE.Group(); // 2階のクラスグループ
const floor3ClassGroup = new THREE.Group(); // 3階のクラスグループ
const floor1Group = new THREE.Group();
const floor2Group = new THREE.Group();
const floor3Group = new THREE.Group();
const invisibleGroup = new THREE.Group(); //不可視にしたいグループ
// playAnimation関数
let currentAction = null;
let objectToHide = null;
gsap.registerPlugin(CSSPlugin); //gsapのやつ

function playAnimation(buttonId) {
    let glbFileName = '';

    switch (buttonId) {
        case 'animate1':
            glbFileName = 'animation/animate1_1.glb';
            break;
        case 'animate2':
            glbFileName = 'animation/animate1_2.glb';
            break;
        case 'animate3':
            glbFileName = 'animation/animate1_3.glb';
            break;
        case 'animate4':
            glbFileName = 'animation/animate1_4.glb';
            break;
        case 'animate5':
            glbFileName = 'animation/animate2_1.glb';
            break;
        case 'animate6':
            glbFileName = 'animation/animate2_2.glb';
            break;
        case 'animate7':
            glbFileName = 'animation/animate2_3.glb';
            break;
        case 'animate8':
            glbFileName = 'animation/animate2_4.glb';
            break;
        case 'animate9':
            glbFileName = 'animation/animate2_5.glb';
            break;
        case 'animate10':
            glbFileName = 'animation/animate3_1.glb';
            break;
        case 'animate11':
            glbFileName = 'animation/animate3_2.glb';
            break;
        case 'animate12':
            glbFileName = 'animation/animate3_3.glb';
            break;
        case 'animate13':
            glbFileName = 'animation/animate3_4.glb';
            break;
        case 'animate14':
            glbFileName = 'animation/animate3_5.glb';
            break;
        case 'animate15':
            glbFileName = 'animation/animate3_6.glb';
            break;
        default:
            console.error(`未対応のボタンID: ${buttonId}`);
            return;
    }

    // GLTFLoaderを使用してGLBファイルを読み込む
    const loader = new THREE.GLTFLoader();
    loader.load(
        glbFileName,
        function (gltf) {
            // 読み込んだアニメーションをシーンに追加
            const model = gltf.scene;
            scene.add(model);

         
            const mixer = new THREE.AnimationMixer(model);
            const clips = gltf.animations; // アニメーションクリップを取得

            if (clips.length > 0) {
                const clip = clips[0]; // 最初のクリップを再生（複数ある場合には調整が必要）
                const action = mixer.clipAction(clip);
                action.play(); // アニメーションを再生
                currentAction = action; // 現在のアクションを保存
                objectToHide = model; // 非表示にするオブジェクトを保存
            }

            // クリックでアニメーション停止
            window.addEventListener('click', function stopAnimation() {
                if (currentAction && objectToHide) {
                    currentAction.stop(); // アニメーションを停止
                    objectToHide.visible = false; // オブジェクトを非表示
                    currentAction = null; 
                    objectToHide = null;

                    // イベントリスナーを解除
                    window.removeEventListener('click', stopAnimation);
                }
            });

            // アニメーションの更新ループ
            function animate() {
                requestAnimationFrame(animate);
                mixer.update(0.01); // 更新の間隔を調整
                renderer.render(scene, camera);
            }

            animate(); // アニメーション開始
        },
        undefined,
        function (error) {
            console.error('アニメーションの読み込み中にエラーが発生しました', error);
        }
    );
}

// GLTFモデルのロード
const loader = new THREE.GLTFLoader();
loader.load(
    'models/souzou3.glb',
    function (gltf) {
        // const groupedModel = createGroupedModel(gltf); // グループ化されたモデルを取得
        originalModel = gltf.scene; //読み込んだモデルの取得
        originalModel.position.set(0,0,0);

        // scene.add(groupedModel); // シーンにグループ化されたモデルを追加
        scene.add(originalModel); //シーンに追加
        console.log('Original model loaded'); // ロード成功ログ
        // object.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        // クリック可能なオブジェクトをリストに追加
    
        // 1階のオブジェクトを1階のグループに追加

        const objectsFloor1 = ['1_1', '1_2', '1_3', '1_4', '1_men', '1_women', '1_other'];
        addGroup(floor1ClassGroup, objectsFloor1, gltf);
        const objectsAllFloor1 = ['F1', 'Stair1', 'hito', 'kanban'];
        floor1Group.add(floor1ClassGroup);
        addGroup(floor1Group, objectsAllFloor1, gltf);
    
        // 2階のオブジェクトを2階のグループに追加
        const objectsFloor2 = ['2_1', '2_2', '2_3', '2_4', '2_5', '2_men', '2_women', '2_other', 'zinja'];
        addGroup(floor2ClassGroup, objectsFloor2, gltf);
        const objectsAllFloor2 = ['F2', 'Stair2'];
        floor2Group.add(floor2ClassGroup);
        addGroup(floor2Group, objectsAllFloor2, gltf);
    
        // 3階のオブジェクトを3階のグループに追加
        const objectsFloor3 = ['3_1', '3_2', '3_3', '3_4', '3_5', '3_6', '3_men', '3_women', '3_other'];
        addGroup(floor3ClassGroup, objectsFloor3, gltf);
        const objectsAllFloor3 = ['F3', 'Stair3'];
        floor3Group.add(floor3ClassGroup);
        addGroup(floor3Group, objectsAllFloor3, gltf);
        

        const objectsInvisible = ['invisible', 'invisible2', 'invisible3', 'invisible4', 'invisible5', 'invisible6', 'invisible7', 'invisible8','building'];
        addGroup(invisibleGroup, objectsInvisible, gltf);
    
        // 各階のグループを全体のグループに追加
        allModelGroup.add(floor1Group);
        allModelGroup.add(floor2Group);
        allModelGroup.add(floor3Group);
    
        // // 全体のグループをシーンに追加
        allModelGroup.position.set(0,0,0);
        scene.add(allModelGroup);
        
        allModelGroup.traverse(function (child) {
            if (child.isMesh) {
                console.log("きえた:"+child.parent.name);
                child.material.transparent = true;
                child.material.alphaToCoverage = true;
                // child.material.opacity = 0.2;  // 透明度を設定
            }
        });

        invisibleGroup.visible = false;

        //オブジェクトを消す！
        moveObject(floor1ClassGroup, 1, 0, 1, 0);
        moveObject(floor2ClassGroup, 1, 0, 1, 0);
        moveObject(floor3ClassGroup, 1, 0, 1, 0);
        
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

//グループにリストのオブジェクトを追加する
function addGroup(Group, list, gltf) {
    list.forEach(name => {
        const object = gltf.scene.getObjectByName(name);
        if (object) {
            Group.add(object);
        }
    });
}


// アニメーション対象のオブジェクト
const animatedObjects = [];

// レンダリングループ
function animate() {
    requestAnimationFrame(animate); //毎フレーム更新

    // originalModel.rotation.x += 0.2;

    controls.update(); //カメラのコントロールを更新
    renderer.render(scene, camera); //シーンを描画
    // console.log(camera.position);
}
animate(); //アニメーション開始

// クリックイベント
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let visibleClass; //見せるオブジェクト
let invisibleClass1; //見せないオブジェクト1,2
let invisibleClass2;
let selectedFloor; //選ばれたフロア

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
            console.log(intersectedObject.parent.name);

            moveCamera(intersectedObject.parent.name);
            showFloor(intersectedObject.parent.name);
        }
        else{

            //クラスを選択
            const worldPosition = new THREE.Vector3();
            let objectClass;
            intersectedObject.getWorldPosition(worldPosition);
            // const targetMeshNames = ['1_men', '2_3', '2_4']; // 透明化するメッシュ名のリスト
            // targetMeshNames.forEach(name => {
            //     const parent = scene.getObjectByName(name);
            //     console.log("親氏:"+parent.name);
            //     parent.children.forEach(child => {
            //         console.log("ありし:"+child.name);
            //         if (child.isMesh) {
            //             console.log("選ばれし:"+child.name);
            //             // メッシュに対する処理
            //             child.material.transparent = true;
            //             child.material.alphaToCoverage = true;
            //             child.material.opacity = 0.2;
            //         }
            //     });
            // });
            // floor3ClassGroup.traverse(function (child) {
            //     objectClass = child.parent;
            //     console.log("もの:"+child.name +"\n親:"+objectClass.name);
            //     if (child.isMesh && objectClass.parent === floor3ClassGroup) {
            //         console.log("きえた:"+child.parent.name);
            //         child.material.transparent = true;
            //         child.material.alphaToCoverage = true;
            //         child.material.opacity = 0.2;  // 透明度を設定
            //     }
            // });
            console.log(intersectedObject.parent.name); // ワールド座標を出力
            showInfoBox(intersectedObject.parent.name);

        }
    }
    else {
        console.log("ぱあ");
    }


}

// URLからクエリパラメータを取得する関数
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ページがロードされたときにクエリパラメータを取得して showInfoBox 関数を呼び出す
window.onload = function() {
    const classId = getQueryParam('id');
    if (classId != '') {
        const floor = classId.charAt(0);
        switch (floor){
            case '1':
                showFloor('F1');
                break;
            case '2':
                showFloor('F2');
                break;
            case '3':
                showFloor('F3');
                break;
        }
        // 取得したidを showInfoBox に渡して実行
        showInfoBox(classId);
        classId = '';
    }
    else{
        location.href='souzou.html';
    }
}
    
//クリックされたオブジェクトの情報を表示
function showInfoBox(name) {
    const infoBox = document.getElementById('infoBox');
    const info = Info[name]['description'] || '情報が見つかりません'; // オブジェクトの情報を取得
    infoBox.innerHTML = `<strong>モデル名:</strong> ${name}<br><strong>情報:</strong><br> ${info}<br> 
    <button id="animate1">1_1</button>
    <button id="animate2">1_2</button>
    <button id="animate3">1_3</button>
    <button id="animate4">1_4</button>

    <button id="animate5">2_1</button>
    <button id="animate6">2_2</button>
    <button id="animate7">2_3</button>
    <button id="animate8">2_4</button>
    <button id="animate9">2_5</button>

    <button id="animate10">3_1</button>
    <button id="animate11">3_2</button>
    <button id="animate12">3_3</button>
    <button id="animate13">3_4</button>
    <button id="animate14">3_5</button>
    <button id="animate15">3_6</button>
    `;
     // ボタンのクリックイベントを設定
     document.getElementById('animate1').addEventListener('click', () => playAnimation('animate1'));
     document.getElementById('animate2').addEventListener('click', () => playAnimation('animate2'));
     document.getElementById('animate3').addEventListener('click', () => playAnimation('animate3'));
     document.getElementById('animate4').addEventListener('click', () => playAnimation('animate4'));
     
     document.getElementById('animate5').addEventListener('click', () => playAnimation('animate5'));
     document.getElementById('animate6').addEventListener('click', () => playAnimation('animate6'));
     document.getElementById('animate7').addEventListener('click', () => playAnimation('animate7'));
     document.getElementById('animate8').addEventListener('click', () => playAnimation('animate8'));
     document.getElementById('animate9').addEventListener('click', () => playAnimation('animate9'));
 
     document.getElementById('animate10').addEventListener('click', () => playAnimation('animate10'));
     document.getElementById('animate11').addEventListener('click', () => playAnimation('animate11'));
     document.getElementById('animate12').addEventListener('click', () => playAnimation('animate12'));
     document.getElementById('animate13').addEventListener('click', () => playAnimation('animate13'));
     document.getElementById('animate14').addEventListener('click', () => playAnimation('animate14'));
     document.getElementById('animate15').addEventListener('click', () => playAnimation('animate15'));
     
    infoBox.style.display = 'block';
    moveCamera(name);
}

//Objectを動かす
function moveObject(group, x, y, z, duration) {
    gsap.to(group.scale, {
        x: x,  // x方向の拡大
        y: y,  // y方向の拡大
        z: z,  // z方向の拡大
        duration: duration,  // アニメーションの持続時間
    });
    // group.traverse((child) => {
    //     if (child.isMesh) {
    //         child.material.transparent = true;  // 透明化を許可
    //         gsap.to(child.material, {
    //             opacity: 0.5,  // 透明にする
    //             duration: 1,  // アニメーションの持続時間
    //         });
    //     }
    // });
    console.log("gsap");
}

function changeFloor(selectedFloor) {
    floor1Group.visible = false;
    floor2Group.visible = false;
    floor3Group.visible = false;
    selectedFloor.visible = true;
    // moveObject(selectedFloor, 2, 2, 2, 1);
    console.log("selectedFloor = "+ selectedFloor);
}

//Floorを出す
function showFloor(name) {
    switch(name){
        case 'F1':
            visibleClass = floor1ClassGroup;
            invisibleClass1 = floor2ClassGroup;
            invisibleClass2 = floor3ClassGroup;
            selectedFloor = floor1Group;
            break;
        case 'F2':
            visibleClass = floor2ClassGroup;
            invisibleClass1 = floor1ClassGroup;
            invisibleClass2 = floor3ClassGroup;
            selectedFloor = floor2Group;
            break;
        case 'F3':
            visibleClass = floor3ClassGroup;
            invisibleClass1 = floor1ClassGroup;
            invisibleClass2 = floor2ClassGroup;
            selectedFloor = floor3Group;
            break;
    }

    moveObject(visibleClass, 1, 1, 1, 1);
    moveObject(invisibleClass1, 1, 0, 1, 0);
    moveObject(invisibleClass2, 1, 0, 1, 0);
    changeFloor(selectedFloor);
}

//カメラを動かす
function moveCamera(name) {
    console.log(name);
    let cameraPosition;
    let objectPosition;
    const cameraPositionValue = Info[name]['cameraPosition'] || [0,0,0]; // オブジェクトの情報を取得
    const objectPositionValue = Info[name]['Position'] || [0,0,0];
    console.log("x:"+cameraPositionValue[0]);
    //配列を座標に変換
    cameraPosition = new THREE.Vector3(
        cameraPositionValue[0], 
        cameraPositionValue[1], 
        cameraPositionValue[2]
    );
    objectPosition = new THREE.Vector3(
        parseFloat(objectPositionValue[0]), 
        parseFloat(objectPositionValue[1]), 
        parseFloat(objectPositionValue[2])
    );
    // // クリックされたオブジェクトの位置にカメラを動かす例
    gsap.to(camera.position, {
        x: cameraPosition.x, // オブジェクトの近くに移動するように
        y: cameraPosition.y,
        z: cameraPosition.z,
        duration: 1.5, // 1.5秒かけて移動
        onUpdate: function () {
                // OrbitControlsのターゲットを設定
                controls.target.copy(objectPosition);
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

window.addEventListener('dblclick', onMouseClick); //clickがあったらonMouseClickを作動させるのかな?

//ウィンドウサイズの調整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});