import { Application } from './node_modules/@splinetool/runtime/build/runtime.js';

import { gsap } from "./node_modules/gsap/index.js";

const canvas = document.getElementById('canvas3d');
const app = new Application(canvas);
app.load('https://prod.spline.design/zS2PZDT8S1BpUf2U/scene.splinecode');

app
    .load('https://prod.spline.design/zS2PZDT8S1BpUf2U/scene.splinecode')
    .then(() => {
        console.log('Scene loaded');
        const pc = app.findObjectByName('pc');
    })

    gsap.set(pc.scale, { x: 0, y: 0, z: 0 });
    gsap.to(pc.position, { x: 110, y: 50 });