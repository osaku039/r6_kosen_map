console.log('yatai.js is loaded'); // ファイルロード確認用のログ

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(90, 30, 101);  // カメラを正面に固定
//camera.position.set(-30, 10, 0);    //テスト用
camera.lookAt(0, -10, -10);  // カメラをシーンの中心に向ける
//camera.lookAt(20, -5, -20); //テスト用
const renderer = new THREE.WebGLRenderer({antialias: true,});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

renderer.setClearColor(0xfff2b9); //背景色



// OrbitControlsのセットアップ      ...カメラの動きを制御するやつ。いらない
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;


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
    'models/souzou4.glb',
    function (gltf) {
        originalModel = gltf.scene;
        scene.add(originalModel);
        console.log('Original model loaded'); // ロード成功ログ

        const objectList = ['building', 'souzouzissentou', 'shityoukakuho-ru', 'piano', 'yatai'];

        
        // クリック可能なオブジェクトをリストに追加
        objectList.forEach(name => {
            const clickableObject = scene.getObjectByName(name);
            console.log('Checking name:', name);

            if (clickableObject) {
                clickableObjects.push(clickableObject);
                console.log('Clickable object siroiyatsu', clickableObject);
            }else {
                console.log("無理でした...");
            }
        });

        
        
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
    console.log(camera.position);
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
        console.log(intersectedObject.parent.name);
        movePage(intersectedObject.parent.name, intersectedObject);
    }
    else {
        console.log('No clickable object was clicked.'); // クリックされた場所にオブジェクトがなかった場合
    }
}
    

function movePage(name, object) {
    console.log("move");
    switch (name){
        case 'souzouzissentou':
            link = "./souzou.html";
            break;
        case 'building':
            link = "./souzou.html";
            break;
        case 'shityoukakuho-ru':
            link = "./sityoukaku.html";
            firstPosition = [27.2, 17.11, 49.22];
            secondPosition = [-16.7, -3, 50.17];
            break;
        case 'piano':
            link = "./sityoukaku.html";
            firstPosition = [27.2, 17.11, 49.22];
            secondPosition = [-16.7, -3, 50.17];
            break;
        case 'yatai':
            link = "./yatai.html";
            firstPosition = [73.49, 7.7, 55];
            secondPosition = [74, -3, 17];
            break;
    }
    moveCamera(firstPosition, secondPosition, link, object);

}

function moveCamera(cameraPositionValue, objectPositionValue, link, object) {
    let cameraPosition;
    let objectPosition;
    cameraPosition = new THREE.Vector3(
        cameraPositionValue[0], 
        cameraPositionValue[1], 
        cameraPositionValue[2]
    );
    objectPosition = new THREE.Vector3(
        objectPositionValue[0], 
        objectPositionValue[1], 
        objectPositionValue[2]
    );
    console.log(cameraPosition);
    // // クリックされたオブジェクトの位置にカメラを動かす例
    gsap.to(camera.position, {
        x: cameraPosition.x, // オブジェクトの近くに移動するように
        y: cameraPosition.y,
        z: cameraPosition.z,
        duration: 1.5, // 1.5秒かけて移動
        onUpdate: function () {
                // OrbitControlsのターゲットを設定
                // controls.target.copy(objectPosition);
                // controls.update();
                camera.lookAt(objectPosition);
        },
        onComplete: function () {
            console.log('Current Camera Position:', camera.position);
            // アニメーション終了後にカメラを固定
            // camera.lookAt(worldPosition.x,worldPosition.y,worldPosition.z);
            // console.log(worldPosition);
            gsap.to(camera.position, {
                x: objectPosition.x, // オブジェクトの近くに移動するように
                y: objectPosition.y,
                z: objectPosition.z,
                duration: 2.0, // 2秒かけて移動
                onUpdate: function () {
                        // OrbitControlsのターゲットを設定
                        // controls.target.copy(cameraPosition);
                        // controls.update();
                        camera.lookAt(objectPosition);
                },
                onComplete: function () {
                    console.log('Current Camera Position:', camera.position);
                    // アニメーション終了後にカメラを固定
                    // camera.lookAt(worldPosition.x,worldPosition.y,worldPosition.z);
                    // console.log(worldPosition);
                
                    // location.href = link;
                }
            
            });
            gsap.to(camera.position, {
                duration: 1.5,
                onComplete: function() {
                    location.href = link;
                }
            })
        }

    });

}


window.addEventListener('click', onMouseClick);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
