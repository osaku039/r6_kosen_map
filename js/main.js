console.log('yatai.js is loaded'); // ファイルロード確認用のログ

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(70, 40, 121);//私が好きな位置
//camera.position.set(90, 30, 101);  // カメラを正面に固定
camera.lookAt(30, 30, 30);  // カメラをシーンの中心に向ける
const renderer = new THREE.WebGLRenderer({antialias: true,});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

renderer.setClearColor(0xfff2b9); //背景色
renderer.render(scene, camera);


// OrbitControlsのセットアップ      ...カメラの動きを制御するやつ。いらない
const controls = new THREE.OrbitControls(camera, renderer.domElement);
// ユーザーの操作を無効にする
controls.enableRotate = false;  // 回転を無効
controls.enablePan = false;     // パンを無効
controls.enableZoom = false;    // ズームを無効


// 光源の追加
const ambientLight = new THREE.AmbientLight(0xf0f0f0);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(2, 30, 0).normalize();
scene.add(directionalLight);

let originalModel;
let newModel;

let clickableObjects = []; // クリック可能なオブジェクトのリスト
const clock = new THREE.Clock(); // Clockを定義
const models = [];  // モデルを格納する配列
const mixers = [];  // AnimationMixerを格納する配列
const loaders = new THREE.GLTFLoader();
let floorGroup = new THREE.Group();
// モデルを読み込む関数
function loadModel(url) {
    return new Promise((resolve, reject) => {
        loaders.load(url, function (gltf) {
            const model = gltf.scene;
            scene.add(model);
            console.log(`${url} loaded`);

            const mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
                console.log('Playing animation:', clip.name);
            });

            models.push(model);
            mixers.push(mixer);
            resolve();
        }, undefined, function (error) {
            console.error('An error happened', error);
            reject(error);
        });
    });
}

// モデルを非同期で読み込む
Promise.all([
    loadModel('models/zentai5.glb'),
    loadModel('models/People.glb'),
]).then(() => {
    console.log('All models loaded');
        const floor = ['F1', 'F2', 'F3', 'F4'];

        floor.forEach(name => {
            const object = scene.getObjectByName(name);
            if (object) {
                floorGroup.add(object);
            }
        });
        // floorGroup.traverse((child) => {
        //     if (child.isMesh) {
        //         child.material.transparent = true;  // 透明化を許可
        //         gsap.to(child.material, {
        //         opacity: 0,  // 透明にする
        //         duration: 0,  // アニメーションの持続時間
        //         });
        //     }
        // });


    // クリック可能なオブジェクトのリスト作成
    const objectNames = ['building', 'piano', 'yatai', 'object1', 'object2', 'gym'];
    objectNames.forEach(name => {
        const object = models.find(model => model.getObjectByName(name));
        if (object) {
            clickableObjects.push(object.getObjectByName(name));
            console.log('Clickable object:', name);
        } else {
          console.log("無理でした...");
        }
    });

    // アニメーションの更新用
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        // すべてのmixerを更新
        mixers.forEach(mixer => mixer.update(delta));

        renderer.render(scene, camera);
    }
    animate();
});



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

    //ようこそ文字
    document.getElementById('overlay-text').innerText = '高専祭へようこそ！！';
    document.getElementById('guide').innerText = '気になるエリアをタップしてみてください！';

    //controls.update();      //カメラの動き要らないから削除して
    renderer.render(scene, camera);
    // console.log(camera.position);
}
animate();
//アニメーション再生
function playAnimationIfConditionMet(condition, url) {
    if (condition) {
        loadModel(url).then(() => {
            console.log('入ります');
        }).catch((error) => {
            console.error('入りません！',error);
        });
    }
}
// クリックイベント
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(clickableObjects, true);
    // 特定のオブジェクトがクリックされたかをチェック

    //ぽっぷあっぷ表示のとき他要素を非表示するための者々
    const management = document.getElementById('management');
    const popupWrapper = document.getElementById('popup-wrapper');
    const popupClose = document.getElementById('close');
    const welcomeText = document.getElementById('overlay-text');
    const guideText = document.getElementById('guide');
    //const yataiText = document.getElementById('yatai-text');
    //const gymText = document.getElementById('gym-text');
    const classButtons = document.getElementById('button-container');
    // ボタンをクリックしたときにポップアップを表示させる
    management.addEventListener('click', () => {
        popupWrapper.style.display = "block";

        classButtons.style.display = "none";
        guideText.style.display = "none";
        welcomeText.style.display = "none";
        //gymText.style.display = "none";
        //yataiText.style.display = "none";
    });
    //ポップアップ中にクリックイベントが干渉しないように
    popupWrapper.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    // ポップアップの外側又は「x」のマークをクリックしたときポップアップを閉じる
    popupWrapper.addEventListener('click', e => {
      if (e.target.id === popupWrapper.id || e.target.id === close.id) {
        popupWrapper.style.display = 'none';

        classButtons.style.display = "block";
        guideText.style.display = "block";
        welcomeText.style.display = "block";
        //gymText.style.display = "block";
        //yataiText.style.display = "block";
      }
    });

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        console.log('Intersected object:', intersectedObject);
        
        // buildingがクリックされたときにアニメーションを再生
        console.log('アニメーション始まり');
        playAnimationIfConditionMet(intersectedObject.parent.name === 'building', 'models/hairu1.glb');
        console.log('アニメーションオワタ');
    } else {
        console.log('No clickable object was clicked.'); // クリックされた場所にオブジェクトがなかった場合
    }
    if (intersects.length > 0) {
        console.log('aaaaa');
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

    //ようこそのテキストを非表示にする
    const welcomeText = document.getElementById('overlay-text');
    const guideText = document.getElementById('guide');
    const locationText = document.getElementById('location-text');
    //const yataiText = document.getElementById('yatai-text');
    //const gymText = document.getElementById('gym-text');

    if (welcomeText) {
        welcomeText.style.display = 'none';
        guideText.style.display = 'none';
        locationText.style.display = 'none';
        //yataiText.style.display = 'none';
        //gymText.style.display = 'none';
        console.log("welcomeText is now hidden.");
    } 
    else {
        console.log("welcomeText not found.");
    }

    switch (name){
        case 'building':
            link = "./souzou.html";
            firstPosition = [-1.74,-1.5,65.5];
            secondPosition = [-1.74,-1.5,50];
            // secondPosition = [-1.74,-1.5,4.10];
            break;
        case 'piano':
            link = "./sityoukaku.html";
            firstPosition = [27.2, 17.11, 49.22];
            secondPosition = [-16.7, 2, 50.17];
            break;
        case 'gym':
            link = "./gym.html";
            firstPosition = [4.7, 30.12, 35.37];
            secondPosition = [2.7, 29, 30];
            break;
        case 'yatai':
            link = "./yatai.html";
            firstPosition = [66.46, 8.12, 40.37];
            secondPosition = [66.66, 0, 16.30];
            break;
    }
    moveCamera(firstPosition, secondPosition, link, object);

}

function moveCamera(cameraPositionValue, objectPositionValue, link, object) {
    console.log("link:"+link);
    let cameraPosition;
    let objectPosition;
    let humanPosition;
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

    var tl = gsap.timeline();
    // // クリックされたオブジェクトの位置にカメラを動かす例
    tl.to(camera.position, {
        x: cameraPosition.x, // オブジェクトの近くに移動するように
        y: cameraPosition.y,
        z: cameraPosition.z,
        duration: 1.5, // 1.5秒かけて移動  
    }, 0);
    tl.to(controls.target, {
        x: objectPosition.x,
        y: objectPosition.y,
        z: objectPosition.z,
        duration: 1.5,
        ease: "power1.out",
        onUpdate: function () {
          // OrbitControlsを更新して視点の変更を反映
          controls.update();
        }
    }, 0);
    tl.to(camera.position, {
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


    if (link === "./souzou.html") {
        console.log(object.material);
        object.material.transparent = true;
       
        //floorGroup.traverse((child) => {
        //    if (child.isMesh) {
        //        console.log("消えたよ:"+link);
        //        console.log(child.name);
        //        child.material.transparent = true;  // 透明化を許可
        //        gsap.to(child.material, {
        //            delay: 1.5,
        //            opacity: 1,
        //            duration: 0.1,  // アニメーションの持続時間
        //        });
        //  }
        //});
        humanPosition = new THREE.Vector3(-1.74,-1.5,50);
        tl.to(camera.position, {
            x: humanPosition.x, // オブジェクトの近くに移動するように
            y: humanPosition.y,
            z: humanPosition.z,
            duration: 0.1, // 2秒かけて移動
            onUpdate: function () {
                    // OrbitControlsのターゲットを設定
                    // controls.target.copy(cameraPosition);
                    // controls.update();
                    camera.lookAt(humanPosition);
            },
            onComplete: function () {
                console.log('Current Camera Position:', camera.position);
                // アニメーション終了後にカメラを固定
                // camera.lookAt(worldPosition.x,worldPosition.y,worldPosition.z);
                // console.log(worldPosition);
            
                // location.href = link;
            }
        });
        tl.to(camera.position, {
            onComplete: function() {
                location.href = link;
            }
        })
    }else {
        gsap.to(camera.position, {
            duration: 1.5,
            delay: 1.5,
            onComplete: function() {
                location.href = link;
            }
        })
    }
}


window.addEventListener('click', onMouseClick);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});