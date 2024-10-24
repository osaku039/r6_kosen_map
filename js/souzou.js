import { locateInfo } from './locateInformation.js';
import { classInfo } from './programInformation.js';
console.log('main.js is loaded'); // ファイルロード確認用のログ

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene(); //シーンの作成
const camera = new THREE.PerspectiveCamera(
    43, window.innerWidth / window.innerHeight, 0.1, 1000
); //カメラの作成
// camera.position.z =5;
let firstTargetPosition = new THREE.Vector3(-0.66, 0, 0);
camera.position.set(-0.66, 0, 1); //カメラの位置
// camera.lookAt(targetPositionValue); //カメラの見る方向
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); //画面サイズ
document.getElementById('container').appendChild(renderer.domElement); //レンダラーをHTMLに追加

// renderer.setClearColor(0xfff2b9);  //背景色の追加
renderer.setClearColor(0xffe271);  //背景色の追加

let isShowInfo = false; //Infoを消すときに使っていると思う
let currentFloor = 'home'; //1個前の視点に戻るときに使うと思う
let clickTimeout = null;

// OrbitControlsのセットアップ
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; //カメラの動きをなめらかに
controls.dampingFactor = 0.1; //なめらかさの度合い
// controls.screenSpacePanning = false; //パンの無効化
// // controls.enablePan = false; //パンを禁止
// controls.maxPolarAngle = Math.PI * 0.33;//カメラ最大値を0.33に
// controls.minPolarAngle = Math.PI * 0.33;//カメラ最小値を0.33に
controls.maxPolarAngle = Math.PI * 0.5;
controls.target.copy(firstTargetPosition);
controls.update();

// 光源の追加
const ambientLight = new THREE.AmbientLight(0xf0f0f0); //環境光
scene.add(ambientLight); //シーンに追加

const directionalLight = new THREE.DirectionalLight(0xffffff,0.5 ); // 平行光1.5に増加
directionalLight.position.set(2, 30, 0).normalize(); //光の方向をセット
scene.add(directionalLight); //シーンに追加

let originalModel;
const clickableObjects = []; // クリック可能なオブジェクトのリスト

//グループの定義
let allModelGroup = new THREE.Group();
let floor1ClassGroup = new THREE.Group(); // 1階のクラスグループ
let floor2ClassGroup = new THREE.Group(); // 2階のクラスグループ
let floor3ClassGroup = new THREE.Group(); // 3階のクラスグループ
let floor1Group = new THREE.Group();
let floor2Group = new THREE.Group();
let floor3Group = new THREE.Group();
let invisibleGroup = new THREE.Group(); //不可視にしたいグループ
let F4, ground;
// playAnimation関数
let currentAction = null;
let objectToHide = null;
gsap.registerPlugin(CSSPlugin); //gsapのやつ


const locationText = document.getElementById('location-text');

//経路選択のアニメーション
function playAnimation(name) {
    const glbFileName = locateInfo[name]['animationFile'] || '';

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

            moveHomePosition(2, "power1.in", true, 1);

            moveCamera('home', 2, "power1.in");

            //クラスをほんのり透明に
            changeTransparent(floor1ClassGroup, 0.1);
            changeTransparent(floor2ClassGroup, 0.1);
            changeTransparent(floor3ClassGroup, 0.1);

            //対象のクラスだけ濃く
            const targetObject = scene.getObjectByName(name);
            changeTransparent(targetObject, 0.5);

            gsap.to({}, {
                delay:2,
                onComplete: function() {
                    if (clips.length > 0) {
                        const clip = clips[0]; // 最初のクリップを再生（複数ある場合には調整が必要）
                        const action = mixer.clipAction(clip);
                        action.play(); // アニメーションを再生
                        currentAction = action; // 現在のアクションを保存
                        objectToHide = model; // 非表示にするオブジェクトを保存
                    }
                }
            });

            // クリックでアニメーション停止
            window.addEventListener('click', function stopAnimation() {
                if (currentAction && objectToHide) {
                    currentAction.stop(); // アニメーションを停止
                    objectToHide.visible = false; // オブジェクトを非表示
                    currentAction = null; 
                    objectToHide = null;

                    // イベントリスナーを解除
                    window.removeEventListener('click', stopAnimation);
                    window.addEventListener('click', handleClick);

                    moveObject(floor1ClassGroup, 1, 0, 1, 0.3);
                    moveObject(floor2ClassGroup, 1, 0, 1, 0.3);
                    moveObject(floor3ClassGroup, 1, 0, 1, 0.3);
                    
                    gsap.to({}, {
                        delay:0.4,
                        onComplete: function() {
                            changeTransparent(floor1ClassGroup, 1);
                            changeTransparent(floor2ClassGroup, 1);
                            changeTransparent(floor3ClassGroup, 1);
                        }
                    });

                    hideInfoBox();
        
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
    'models/souzou7.glb',
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

        const objectsFloor1 = ['1_1', '1_2', '1_3', '1_4', '1_men', '1_women', '1_10', '1_11', '1_12', '1_13'];
        addGroup(floor1ClassGroup, objectsFloor1, gltf);
        const objectsAllFloor1 = ['F1', 'Stair1', 'hito', 'kanban', 'monitor'];
        floor1Group.add(floor1ClassGroup);
        addGroup(floor1Group, objectsAllFloor1, gltf);
    
        // 2階のオブジェクトを2階のグループに追加
        const objectsFloor2 = ['2_1', '2_2', '2_3', '2_4', '2_5', '2_6', 'zinja', '2_men', '2_women', '2_10', '2_11', '2_12'];
        addGroup(floor2ClassGroup, objectsFloor2, gltf);
        const objectsAllFloor2 = ['F2', 'Stair2', '2_fence', '2_tables', '2_kanban'];
        floor2Group.add(floor2ClassGroup);
        addGroup(floor2Group, objectsAllFloor2, gltf);
    
        // 3階のオブジェクトを3階のグループに追加
        const objectsFloor3 = ['3_1', '3_2', '3_3', '3_4', '3_5', '3_6', '3_men', '3_women', '3_10', '3_11', '3_12', '3_13'];
        addGroup(floor3ClassGroup, objectsFloor3, gltf);
        const objectsAllFloor3 = ['F3', 'Stair3', '3_fence', '3_tables', '3_kanban'];
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

        invisibleGroup.visible = false;

        //オブジェクトを消す！
        moveObject(floor1ClassGroup, 1, 0, 1, 0);
        moveObject(floor2ClassGroup, 1, 0, 1, 0);
        moveObject(floor3ClassGroup, 1, 0, 1, 0);

        F4 = gltf.scene.getObjectByName('F4');
        ground = gltf.scene.getObjectByName('ground');
        changeTransparent(F4, 0.5);
        
        const clickable = Object.keys(locateInfo); // クリック可能なオブジェクト名のリスト

        document.getElementById('guide').innerText = '階を選んで、タップしてみてください！';

        clickable.forEach(name => {
            const clickableObject = scene.getObjectByName(name);
            if (clickableObject) {
                clickableObjects.push(clickableObject);
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
    
    //guideここに入れると強すぎるから移動
    
    controls.update(); //カメラのコントロールを更新
    renderer.render(scene, camera); //シーンを描画
    // console.log(camera.position);
    // console.log(currentFloor);
}
animate(); //アニメーション開始

// クリックイベント
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selectedFloor; //選ばれたフロア

//クリックイベント
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera); //マウス位置とカメラ位置の調整

    const intersects = raycaster.intersectObjects(clickableObjects, true); //クリックしたオブジェクトの検出

    const guideText = document.getElementById('guide');//テキストを非表示するため要素取得

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const parentName = intersectedObject.parent.name;
        console.log(parentName);

        /*
        if (guideText) {
            guideText.style.display = 'none';
            guideText.style.display = 'none';
            console.log("guideText is now hidden.");
        } 
        else {
            console.log("guideText not found.");
        }
        */

        //階の選択
        if (intersectedObject.parent.name.startsWith('F')){
            console.log(intersectedObject.parent.name);
            if (guideText) {
                document.getElementById('guide').innerText = '教室を選んでください！';
                guideText.style.display = 'block';
            } 
            else {
                console.log("guideText not found.");
            }
            if (currentFloor != intersectedObject.parent.name){
                moveCamera(intersectedObject.parent.name, 1.5, "power1.out");
                showFloor(intersectedObject.parent.name);
                changeLocationText(intersectedObject.parent.name);
            }
        }
        else if ((locateInfo[intersectedObject.name]) || ("name" in locateInfo[parentName])){
            console.log(intersectedObject.name);
        }
        else {

            //クラスを選択
            const worldPosition = new THREE.Vector3();
            intersectedObject.getWorldPosition(worldPosition);
            console.log(parentName); // ワールド座標を出力
            showInfoBox(parentName);

            if (guideText) {
                guideText.style.display = 'none';
                guideText.style.display = 'none';
                console.log("guideText is now hidden.");
            } 
            else {
                console.log("guideText not found.");
            }

        }
    }
    else {
        if (isShowInfo == true) {
            hideInfoBox();
            isShowInfo = false;
        };
        console.log("ぱあ");
        guideText.style.display = 'block';
        document.getElementById('guide').innerText = '階を選んで、タップしてみてください！';
        if (currentFloor != 'home'){
            moveHomePosition(2, "power1.out", true, 0);
        }
    }


}

// URLからクエリパラメータを取得する関数
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ページがロードされたときにクエリパラメータを取得して showInfoBox 関数を呼び出す
window.addEventListener('load', function() {
    let classId = getQueryParam('id');
    //gsapで0.2秒待つことによってgltfのロードを待つという力技を使いました。awaitとか使えるのかな?
    if (classId !== null) {
        moveCamera('home', 0, "power1.out");
        gsap.to({}, {
            delay: 0.2,
            onComplete: function() {
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
                showInfoBox(classId);
                classId = "";
            }
        });
    } 
  else {
        moveCamera('home', 3, "power3.in");
    }

    // playAnimation関数
    function playAnimation(name, onComplete = null) {
        const glbFileName = locateInfo[name]['animationFile'] || '';

        const loader = new THREE.GLTFLoader();
        loader.load(
            glbFileName,
            function (gltf) {
                const model = gltf.scene;
                scene.add(model);

                const mixer = new THREE.AnimationMixer(model);
                const clips = gltf.animations;

                if (clips.length > 0) {
                    const action = mixer.clipAction(clips[0]);

                    // アニメーションの設定
                    if (name === 'genzaiti') {
                        action.loop = THREE.LoopRepeat; // genzaitiはループ
                    } else {
                        action.loop = THREE.LoopOnce; 
                        action.clampWhenFinished = true; //最後の状態で止める
                    }

                    action.play();

                    action.onFinished = () => {
                        if (onComplete) onComplete(); 
                        if (name !== 'genzaiti') {
                            model.visible = false; // genzaiti以外は非表示
                        }
                    };
                }

                function animate() {
                    requestAnimationFrame(animate);
                    mixer.update(0.01);
                    renderer.render(scene, camera);
                }

                animate();
            },
            undefined,
            function (error) {
                console.error('アニメーションの読み込み中にエラーが発生しました', error);
            }
        );
    }


    playAnimation('hairu', () => {
        // アニメーション終了後、aruku4を非表示にする
        const aruku4Object = scene.getObjectByName('hairu');
        if (aruku4Object) {
            aruku4Object.visible = false; // 非表示
        }
    });
    
     // genzaitiアニメーションをループ再生
    playAnimation('genzaiti', () => {
    });
    // hito.glb（ループしない）
    playAnimation('hito', () => {
    });


    // data-role="action" の属性を持つ全ての要素を取得
    const buttons = document.querySelectorAll('[data-role="category"]');
    console.log(buttons);

    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            const buttonId = button.getAttribute('data-id');
            event.stopPropagation();  // クリックイベントがシーンに伝播するのを防ぐ
            console.log(`Button ${buttonId} clicked!`);
        });
    });

});



    
//クリックされたオブジェクトの情報を表示
function showInfoBox(name) {
    isShowInfo = true;
    const infoBox = document.getElementById('infoBox');
    const classId = locateInfo[name]['class'];
    const className = classInfo[classId]['className'];
    // const program = classInfo[classId]['program'];
    // const category = classInfo[classId]['category'];
    const comment = classInfo[classId]['comment'];
    const iconFile = classInfo[classId]['iconFile'];
    const photo = classInfo[classId]['photo'];
    infoBox.innerHTML = `
      <div class="l-wrapper_01">
        <article class="card_01">
          <div class="card__header_01">
            <figure class="card__thumbnail_01">
                <p><img src=${iconFile} alt="icon"></p>
                <a href=${photo} data-lightbox="group"><img src=${photo}></a>
            </figure>
          </div>
          <div class="card__body_01">
            <strong>クラス:</strong> ${className}<br>
            <p class="card__text2_01">${comment}</p>
          </div>
          <div class="card__footer_01">
            <button id="animation">経路選択</button>
          </div>
          
        </article>
      </div>
      `;
    // ボタンのクリックイベントを設定
    document.getElementById('animation').addEventListener('click', () => playAnimation(name));
     
    infoBox.style.display = 'block';
    moveCamera(name, 1.5, "power1.out");
    changeLocationText(name);
    if (currentFloor.startsWith('F')){
        currentFloor = "_" + currentFloor;
    }
}

function returnCameraPosition(event) {
    console.log("リターン!");
    switch (currentFloor.slice(0,1)) {
        case '_':
            currentFloor = currentFloor.slice(1);
            moveCamera(currentFloor, 1.5, "power1.out");
            showFloor(currentFloor);
            break;
        case 'F':
            moveHomePosition(2, "power1.out", true, 0);
            break;
        default:
            break;
    }
}

// InfoBox を非表示にする関数
function hideInfoBox() {
    const infoBox = document.getElementById('infoBox');
    infoBox.style.display = 'none'; // 非表示にする
}

function changeLocationText(name) {
    locationText.innerHTML = locateInfo[name]['locationText'] || '情報が見つかりません';
}


//Objectを動かす
function moveObject(group, x, y, z, duration) {
    var floor = 'F' + group.children[0].name.charAt(0);
    var originalPosition = locateInfo[floor]['Position'] || 0;
    var originalYPosition = originalPosition[1];
    console.log("floor"+ floor + "\noriginal" + originalYPosition);

    var tl = gsap.timeline();
    tl.to(group.scale, {
        x: x,  // x方向の拡大
        y: y,  // y方向の拡大
        z: z,  // z方向の拡大
        duration: duration,  // アニメーションの持続時間
        onUpdate: function() {
            const scaleFactor = group.scale.y;  // 現在のスケール倍率
            // スケールが1のときはY座標を0に、0に近づくほどoriginalYPositionに移動
            const newYPosition = originalYPosition * (1 - scaleFactor);
            group.position.y = newYPosition; //y座標の更新
        },
    });
}

//透明度変更
function changeTransparent(target, opacity) {
    target.traverse(function (child) {
        if (child.isMesh) {
            child.material.transparent = true;
            child.material.alphaToCoverage = true;
            child.material.opacity = opacity;  // 透明度を設定
        }
    });
}

//Floorを出す
function showFloor(name) {
    if (isShowInfo == true) {
        hideInfoBox();
        isShowInfo = false;
    };
    switch(name){
        case 'F1':
            moveObject(floor1ClassGroup, 1, 1, 1, 1);
            moveObject(floor2ClassGroup, 1, 0, 1, 0);
            moveObject(floor3ClassGroup, 1, 0, 1, 0);
            selectedFloor = floor1Group;
            console.log('F1 selected');
            break;
        case 'F2':
            moveObject(floor2ClassGroup, 1, 1, 1, 1);
            moveObject(floor1ClassGroup, 1, 0, 1, 0);
            moveObject(floor3ClassGroup, 1, 0, 1, 0);
            selectedFloor = floor2Group;
            console.log('F1 selected');
            break;
        case 'F3':
            moveObject(floor3ClassGroup, 1, 1, 1, 1);
            moveObject(floor1ClassGroup, 1, 0, 1, 0);
            moveObject(floor2ClassGroup, 1, 0, 1, 0);
            selectedFloor = floor3Group;
            console.log('F1 selected');
            break;
        default:
            moveHomePosition(2, "power1.out", true, 0);
            break;
    }
    
    floor1Group.visible = false;
    floor2Group.visible = false;
    floor3Group.visible = false;
    F4.visible = false;
    ground.visible = false;
    selectedFloor.visible = true;

    currentFloor = name;

    changeLocationText(name);

    console.log("selectedFloor = "+ selectedFloor.name);

}

//ホームポジションに戻る
function moveHomePosition(duration, ease, isVisible, scale) {
    floor1Group.visible = isVisible;
    floor2Group.visible = isVisible;
    floor3Group.visible = isVisible;
    F4.visible = isVisible;
    ground.visible = isVisible;
    moveCamera('home', duration, ease);
    moveObject(floor1ClassGroup, 1, scale, 1, 0.3);
    moveObject(floor2ClassGroup, 1, scale, 1, 0.3);
    moveObject(floor3ClassGroup, 1, scale, 1, 0.3);
    changeLocationText('home');
    currentFloor = 'home';
}

//カメラを動かす
function moveCamera(name, duration, ease) {
    let cameraPosition;
    let targetPosition;
    const cameraPositionValue = locateInfo[name]['cameraPosition'] || [0,0,0]; // オブジェクトの情報を取得
    const targetPositionValue = locateInfo[name]['Position'] || [0,0,0];
    //配列を座標に変換
    cameraPosition = new THREE.Vector3(
        cameraPositionValue[0],
        cameraPositionValue[1],
        cameraPositionValue[2]
    );
    targetPosition = new THREE.Vector3(
        parseFloat(targetPositionValue[0]),
        parseFloat(targetPositionValue[1]),
        parseFloat(targetPositionValue[2])
    );
    // GSAPのタイムラインを使って、カメラの移動と視点の移動を同時に行う
    gsap.timeline()
        .to(camera.position, {
          x: cameraPosition.x,
          y: cameraPosition.y,
          z: cameraPosition.z,
          duration: duration,
          ease: ease,
          onUpdate: function () {
            // カメラが動いたときに常にOrbitControlsを更新
            controls.update();
          }
        }, 0) // タイムラインの0秒目から開始"power3.in"
        .to(controls.target, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: duration,
          ease: ease,
          onUpdate: function () {
            // OrbitControlsを更新して視点の変更を反映
            controls.update();
          }
    }, 0); // タイムラインの0秒目から開始
}

// クリックイベントハンドラー
function handleClick(event) {
    if (clickTimeout !== null) {
        // 2回目のクリック: ダブルクリックと判定
        clearTimeout(clickTimeout);
        clickTimeout = null;
        returnCameraPosition(event);
    } else {
        // 1回目のクリック: ダブルクリックが来るか待機
        clickTimeout = setTimeout(() => {
            onMouseClick(event);
            clickTimeout = null;  // タイムアウト後にリセット
        }, 300);  // 300ミリ秒以内に2回目のクリックが来るかを待つ
    }
}


//経路選択のところにも同じ処理あるから変更する時は全部変更するように
window.addEventListener('click', handleClick); //clickがあったらonMouseClickを作動させる

//ウィンドウサイズの調整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});