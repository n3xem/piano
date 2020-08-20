import * as THREE from "three";
import * as TONE from "tone";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Tone } from "tone/build/esm/core/Tone";

class ThreeJSContainer {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private canvas;

    constructor() {
        this.createScene();
    }

    // 画面部分の作成(表示する枠ごとに)
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        this.canvas = document.querySelector('#myCanvas');
        let renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        });
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x333333));

        //カメラの設定
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.copy(cameraPos);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        //let orbitControls = new OrbitControls(this.camera, renderer.domElement);

        let render = () => {

            renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        }
        render();

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = () => {
        const synth = new TONE.Synth().toDestination();
        const WHITE_KEY_WIDTH = 2;
        const WHITE_KEY_NUM = 7;
        const WHITE_KEY_DISTANCE = 0.1;
        const KEYBOARD_WIDTH = 2.1 * 6;
        const WHITE_KEY_SCALE: string[] = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
        const BLACK_KEY_SCALE: string[] = ["C#4", "D#4", "", "F#4", "G#4", "A#4"];

        let playedScale = {};
        let isMousePush = false;

        this.scene = new THREE.Scene();

        let white_key_geometry = new THREE.BoxGeometry(WHITE_KEY_WIDTH, 2, 10);
        white_key_geometry.name = "white";
        let black_key_geometry = new THREE.BoxGeometry(WHITE_KEY_WIDTH / 2, 2, 6);
        black_key_geometry.name = "black";

        let white_keys: THREE.Mesh[] = new Array(7);
        let black_keys: THREE.Mesh[] = new Array(5);

        let meshList: THREE.Mesh[] = [];

        //白い鍵盤を追加
        for (let i = 0; i < WHITE_KEY_NUM; i++) {
            let white_key_material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
            let tmp: THREE.Mesh = new THREE.Mesh(white_key_geometry, white_key_material);
            tmp.position.set(i * (WHITE_KEY_WIDTH + WHITE_KEY_DISTANCE) - KEYBOARD_WIDTH / 2, 0, 0);
            tmp.name = WHITE_KEY_SCALE[i];
            white_keys[i] = tmp;
            meshList.push(tmp);
            this.scene.add(white_keys[i]);
        }

        //黒い鍵盤を追加
        for (let i = 0; i < 6; i++) {
            if (i === 2) continue;
            let black_key_material = new THREE.MeshPhongMaterial({ color: 0x000000 });
            let tmp: THREE.Mesh = new THREE.Mesh(black_key_geometry, black_key_material);
            tmp.position.set(1.05 + i * (WHITE_KEY_WIDTH + WHITE_KEY_DISTANCE) - KEYBOARD_WIDTH / 2, 1, -1.7);
            tmp.name = BLACK_KEY_SCALE[i];
            black_keys[i] = tmp;
            meshList.push(tmp);
            this.scene.add(black_keys[i]);
        }

        //ライトの設定
        const spotLight = new THREE.SpotLight(0xFFFFFF, 2, 50, Math.PI / 4, 10, 0.5);
        spotLight.position.set(0, 30, 20);
        this.scene.add(spotLight);

        //スポットライトの光線が見える
        /*
        const lightHelper = new THREE.SpotLightHelper(spotLight);
        this.scene.add(lightHelper);
        */

        const CANVAS = document.querySelector('canvas');
        const MOUSE = new THREE.Vector2();

        const raycaster = new THREE.Raycaster();
        let intersects: THREE.Intersection[] = [];

        //カーソル座標取得と、マウスに当たったオブジェクトを取得
        let onMouseMove = (event) => {

            console.log("move");
            const element = event.currentTarget;
            // canvas要素上のXY座標
            const mouseX = event.clientX - element.offsetLeft;
            const mouseY = event.clientY - element.offsetTop;
            // canvas要素の幅・高さ
            const w = element.offsetWidth;
            const h = element.offsetHeight;

            // -1〜+1の範囲で現在のマウス座標を登録する
            MOUSE.x = (mouseX / w) * 2 - 1;
            MOUSE.y = -(mouseY / h) * 2 + 1;

            raycaster.setFromCamera(MOUSE, this.camera);
            intersects = raycaster.intersectObjects(meshList);

        }

        let onMouseDown = (event) => {
            isMousePush = true;

            console.log("mousedown");
        }
        let onMouseUp = (event) => {
            isMousePush = false;
            synth.triggerRelease(TONE.now());
            console.log("mouseup")
        }

        CANVAS.addEventListener('mousedown', onMouseDown);
        CANVAS.addEventListener('mouseup', onMouseUp);
        CANVAS.addEventListener('mousemove', onMouseMove);

        let update = () => {

            meshList.map(mesh => {
                let now = TONE.now();
                if (intersects.length > 0 && mesh === intersects[0].object && isMousePush) {
                    console.log("attack");
                    if (playedScale[mesh.name] !== true) {
                        synth.triggerAttack(mesh.name, now);
                        playedScale[mesh.name] = true;
                    }
                    mesh.material.color.setHex(0xFF0000);
                }
                else if (mesh.geometry.name === "black") {
                    playedScale[mesh.name] = false;
                    mesh.material.color.setHex(0x000000)
                }
                else if (mesh.geometry.name === "white") {
                    playedScale[mesh.name] = false;
                    mesh.material.color.setHex(0xFFFFFF);
                }
            });

            requestAnimationFrame(update);
        }
        update();
    }
}

let container = new ThreeJSContainer();

let viewport = container.createRendererDOM(1200, 500, new THREE.Vector3(0, 10, 10));
document.body.appendChild(viewport);
