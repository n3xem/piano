import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class ThreeJSContainer {
    private scene: THREE.Scene;

    constructor() {
        this.createScene();
    }

    // 画面部分の作成(表示する枠ごとに)
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        let renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x495ed));

        //カメラの設定
        let camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        let orbitControls = new OrbitControls(camera, renderer.domElement);

        let render = () => {

            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        }
        render();

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = () => {
        const WHITE_KEY_WIDTH = 2;
        const WHITE_KEY_NUM = 7;
        const WHITE_KEY_DISTANCE = 0.1;
        const KEYBOARD_WIDTH = 2.1 * 6;
        this.scene = new THREE.Scene();

        let white_key_geometry = new THREE.BoxGeometry(WHITE_KEY_WIDTH, 2, 10);
        let black_key_geometry = new THREE.BoxGeometry(WHITE_KEY_WIDTH / 2, 2, 6);
        let white_key_material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
        let black_key_material = new THREE.MeshPhongMaterial({ color: 0x000000 });

        let white_keys: THREE.Mesh[] = new Array(7);
        let black_keys: THREE.Mesh[] = new Array(5);

        //白い鍵盤を追加
        for (let i = 0; i < WHITE_KEY_NUM; i++) {
            let tmp: THREE.Mesh = new THREE.Mesh(white_key_geometry, white_key_material);
            tmp.position.set(i * (WHITE_KEY_WIDTH + WHITE_KEY_DISTANCE) - KEYBOARD_WIDTH / 2, 0, 0);
            white_keys[i] = tmp;
            this.scene.add(white_keys[i]);
        }

        //黒い鍵盤を追加
        for (let i = 0; i < 6; i++) {
            if (i === 2) continue;
            let tmp: THREE.Mesh = new THREE.Mesh(black_key_geometry, black_key_material);
            tmp.position.set(1.05 + i * (WHITE_KEY_WIDTH + WHITE_KEY_DISTANCE) - KEYBOARD_WIDTH / 2, 1, -1.7);
            black_keys[i] = tmp;
            this.scene.add(black_keys[i]);
        }

        const spotLight = new THREE.SpotLight(0xFFFFFF, 2, 50, Math.PI / 4, 10, 0.5);
        spotLight.position.set(0, 30, 20);
        this.scene.add(spotLight);

        //スポットライトの光線が見える
        /*
        const lightHelper = new THREE.SpotLightHelper(spotLight);
        this.scene.add(lightHelper);
        */

        let update = () => {

            //lightHelper.update();
            requestAnimationFrame(update);
        }
        update();
    }
}

let container = new ThreeJSContainer();

let viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 10, 10));
document.body.appendChild(viewport);
