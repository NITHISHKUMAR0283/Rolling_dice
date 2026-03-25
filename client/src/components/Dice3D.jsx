
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import * as CANNON from "cannon-es";

// Dice face rotations for fallback
const faceRotations = [
  [0, 0, 0], // 1
  [0, Math.PI / 2, 0], // 2
  [Math.PI / 2, 0, 0], // 3
  [-Math.PI / 2, 0, 0], // 4
  [0, -Math.PI / 2, 0], // 5
  [Math.PI, 0, 0], // 6
];

// SVG dot positions for dice faces (3x3 grid)
const svgDots = [
  // 1
  [4],
  // 2
  [0, 8],
  // 3
  [0, 4, 8],
  // 4
  [0, 2, 6, 8],
  // 5
  [0, 2, 4, 6, 8],
  // 6
  [0, 2, 3, 5, 6, 8],
];

function svgFace(face) {
  // 3x3 grid, 60x60 viewBox
  const positions = [
    [12, 12], [30, 12], [48, 12],
    [12, 30], [30, 30], [48, 30],
    [12, 48], [30, 48], [48, 48],
  ];
  const dots = svgDots[face - 1]
    .map(i => `<circle cx="${positions[i][0]}" cy="${positions[i][1]}" r="6" fill="black"/>`)
    .join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><rect width='60' height='60' rx='10' fill='white'/>${dots}</svg>`;
}

const diceFaceTextures = Array.from({ length: 6 }, (_, i) =>
  new THREE.TextureLoader().load(
    `data:image/svg+xml;base64,${btoa(svgFace(i + 1))}`
  )
);

export default function Dice3D({ result, phase }) {
  const mountRef = useRef();
  const diceRef = useRef();
  const worldRef = useRef();
  const animRef = useRef();
  const meshRef = useRef();
  const bodyRef = useRef();

  useEffect(() => {
    const width = 120;
    const height = 120;
    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 100, 200);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 100, 100);
    scene.add(dirLight);

    // Dice geometry/materials (SVG textures)
    const geometry = new THREE.BoxGeometry(60, 60, 60);
    const materials = diceFaceTextures.map(
      tex => new THREE.MeshPhongMaterial({ map: tex })
    );
    const dice = new THREE.Mesh(geometry, materials);
    dice.castShadow = true;
    dice.receiveShadow = true;
    scene.add(dice);
    meshRef.current = dice;

    // Cannon.js physics world
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    worldRef.current = world;
    // Dice body
    const shape = new CANNON.Box(new CANNON.Vec3(30, 30, 30));
    const body = new CANNON.Body({ mass: 1, shape });
    body.position.set(0, 60, 0);
    world.addBody(body);
    bodyRef.current = body;
    // Floor
    const ground = new CANNON.Body({ mass: 0 });
    ground.addShape(new CANNON.Plane());
    ground.position.set(0, 0, 0);
    world.addBody(ground);

    // Animation loop
    function animate() {
      animRef.current = requestAnimationFrame(animate);
      world.step(1 / 60);
      dice.position.copy(body.position);
      dice.quaternion.copy(body.quaternion);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Roll dice on phase/result change
  useEffect(() => {
    if (phase === "rolling" && meshRef.current && bodyRef.current) {
      // Randomize velocity/rotation for roll
      bodyRef.current.position.set(0, 60, 0);
      bodyRef.current.velocity.set(
        (Math.random() - 0.5) * 20,
        20 + Math.random() * 10,
        (Math.random() - 0.5) * 20
      );
      bodyRef.current.angularVelocity.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
    }
    if (phase === "result" && result && meshRef.current && bodyRef.current) {
      // Snap to result face
      const [rx, ry, rz] = faceRotations[result - 1];
      meshRef.current.rotation.set(rx, ry, rz);
      bodyRef.current.position.set(0, 30, 0);
      bodyRef.current.velocity.set(0, 0, 0);
      bodyRef.current.angularVelocity.set(0, 0, 0);
      meshRef.current.quaternion.setFromEuler(rx, ry, rz);
      bodyRef.current.quaternion.copy(meshRef.current.quaternion);
    }
  }, [phase, result]);

  return (
    <div className="flex flex-col items-center">
      <div ref={mountRef} className="mx-auto" style={{ width: 120, height: 120 }} />
      <div className="text-center text-lg font-bold mt-2">{phase === "result" && result ? `Result: ${result}` : ""}</div>
    </div>
  );
}
