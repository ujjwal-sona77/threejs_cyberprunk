import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(51, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas'), antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;



let model;

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0030;
composer.addPass(rgbShiftPass);

// Load HDRI environment map
new RGBELoader()
  .setPath('') // Update this path to where your HDRI file is located
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    // Load the model after the HDRI is loaded
    const loader = new GLTFLoader();
    loader.load('DamagedHelmet.gltf', (gltf) => {
      model = gltf.scene;
      scene.add(model);

      // Adjust model position if needed
      model.position.set(0, 0, 0);

      // Adjust model scale if needed
      model.scale.set(1, 1, 1);
    }, undefined, (error) => {
      console.error('An error occurred while loading the model:', error);
    });
  });


window.addEventListener("mousemove", (e) => {
  if (model) {
    const rotationX = (e.clientX / window.innerWidth - .5) * (Math.PI * .12);
    const rotationY = (e.clientY / window.innerHeight - .5) * (Math.PI * .12);
    gsap.to(model.rotation, {
      y: rotationX,
      x: rotationY,
      duration: 0.5,
      ease: "power2.out"
    });
  }
});

window.addEventListener("resize" , ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
})

function animate() {
  window.requestAnimationFrame(animate);
  composer.render();
}

animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}