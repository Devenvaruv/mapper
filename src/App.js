import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Billboard, Text, PointerLockControls } from "@react-three/drei";

function getCubeTextures(mainFolder, subFolderName, index) {
  return [
    `/${mainFolder}/${subFolderName}_${index}/Img_2_2048.jpg`, // Front
    `/${mainFolder}/${subFolderName}_${index}/Img_0_2048.jpg`, // Back
    `/${mainFolder}/${subFolderName}_${index}/Img_4_2048.jpg`, // Top
    `/${mainFolder}/${subFolderName}_${index}/Img_5_2048.jpg`, // Bottom
    `/${mainFolder}/${subFolderName}_${index}/Img_1_2048.jpg`, // Right
    `/${mainFolder}/${subFolderName}_${index}/Img_3_2048.jpg`, // Left
  ];
}

function getFaceIndex(imageName) {
  switch (imageName) {
    case "Img_2_2048.jpg":
      return 4; // Front
    case "Img_0_2048.jpg":
      return 1; // Back
    case "Img_4_2048.jpg":
      return 0; // Top
    case "Img_5_2048.jpg":
      return 5; // Bottom
    case "Img_1_2048.jpg":
      return 2; // Right
    case "Img_3_2048.jpg":
      return 3; // Left
    default:
      return 0;
  }
}

function pixelTo3DPosition(
  faceIndex,
  x,
  y,
  textureSize = 2048,
  cubeSize = 300
) {
  // Map [0..2048] to [-cubeSize/2..+cubeSize/2] for each dimension
  const half = cubeSize / 2;

  // px: left -> right
  // py: top -> bottom
  // For typical 2D images, y=0 at top,
  const px = (x / textureSize) * cubeSize - half;
  const py = half - (y / textureSize) * cubeSize;

  switch (faceIndex) {
    case 0: // from Img_4_2048 // Top
      return new THREE.Vector3(px, half, -py);

    case 1: // from Img_0_2048 // Back
      return new THREE.Vector3(half, py, -px);

    case 2: // from Img_1_2048 // Right
      return new THREE.Vector3(px, py, half);

    case 3: // from Img_3_2048 // Left
      return new THREE.Vector3(-px, py, -half);

    case 4: // from Img_2_2048 // Front
      return new THREE.Vector3(-half, py, px);

    case 5: // from Img_5_2048 // Bottom
      return new THREE.Vector3(-px, -half, py);

    default:
      return new THREE.Vector3(0, 0, 0);
  }
}

function AssetMarker({ faceIndex, x, y, assetName, cubeSize }) {
  // Convert from 2D pixel coords to 3D
  const position = pixelTo3DPosition(faceIndex, x, y, 2048, cubeSize);

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>

      <Billboard>
        <Text
          fontSize={5} // How large the text is in 3D units
          color="white"
          anchorX="center" // Center the text horizontally
          anchorY="center" // Center the text vertically
          position={[0, 6, 6]} // Slightly above the sphere so it's visible
        >
          {assetName}
        </Text>
      </Billboard>
    </group>
  );
}

function Room({ texturePaths = [], position = [0, 0, 0], size = 300 }) {
  const textures = useLoader(THREE.TextureLoader, texturePaths)

  return (
    <group position={position} scale={[-1, 1, 1]}>
      
      {/* The main textured cube */}
      <mesh>
        <boxGeometry args={[size, size, size]} />
        {textures.map((texture, i) => (
          <meshBasicMaterial
            attach={`material-${i}`}
            key={i}
            map={texture}
            side={THREE.BackSide}
          />
        ))}
      </mesh>

      {/* The lineSegments to show edges in red */}
      <lineSegments>
        {/* Create an EdgesGeometry from a BoxGeometry of the same size */}
        <edgesGeometry args={[new THREE.BoxGeometry(size, size, size)]} />
        <lineBasicMaterial color="red" />
      </lineSegments>
      
      
    </group>
  )
}

function Movement({
  setCameraPos,
  cameraPos,
  currentCubeIndex,
  setCurrentCubeIndex,
}) {
  const { camera } = useThree();

  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const [moveUp, setMoveUp] = useState(false);
  const [moveDown, setMoveDown] = useState(false);

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.set(...cameraPos);
  }, [cameraPos, camera]);

  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          setMoveForward(true);
          break;
        case "KeyS":
        case "ArrowDown":
          setMoveBackward(true);
          break;
        case "KeyA":
        case "ArrowLeft":
          setMoveLeft(true);
          break;
        case "KeyD":
        case "ArrowRight":
          setMoveRight(true);
          break;
        case "KeyE":
          setMoveUp(true);
          break;
        case "KeyQ":
          setMoveDown(true);
          break;
        case "KeyN":
          console.log("Pressed N -> Next Cube");
          setCurrentCubeIndex((prev) => prev + 1);
          setCameraPos([0, 0, 0]);
          break;
        case "KeyB":
          console.log("Pressed B -> Previous Cube");
          setCurrentCubeIndex((prev) => Math.max(prev - 1, 0));
          setCameraPos([0, 0, 0]);
          break;
        default:
          break;
      }
    };

    const onKeyUp = (e) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          setMoveForward(false);
          break;
        case "KeyS":
        case "ArrowDown":
          setMoveBackward(false);
          break;
        case "KeyA":
        case "ArrowLeft":
          setMoveLeft(false);
          break;
        case "KeyD":
        case "ArrowRight":
          setMoveRight(false);
          break;
        case "KeyE":
          setMoveUp(false);
          break;
        case "KeyQ":
          setMoveDown(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [setCameraPos, setCurrentCubeIndex]);

  useFrame((_, delta) => {
    const moveSpeed = 500;
    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;
    velocity.current.y -= velocity.current.y * 10.0 * delta;

    direction.current.z = Number(moveForward) - Number(moveBackward);
    direction.current.x = Number(moveRight) - Number(moveLeft);
    direction.current.y = Number(moveUp) - Number(moveDown);
    direction.current.normalize();

    if (moveForward || moveBackward) {
      velocity.current.z -= direction.current.z * moveSpeed * delta;
    }
    if (moveLeft || moveRight) {
      velocity.current.x -= direction.current.x * moveSpeed * delta;
    }
    if (moveUp || moveDown) {
      velocity.current.y -= direction.current.y * moveSpeed * delta;
    }

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);

    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();

    const up = new THREE.Vector3(0, 1, 0);

    camera.position.addScaledVector(forward, -velocity.current.z * delta);
    camera.position.addScaledVector(right, velocity.current.x * delta);
    camera.position.addScaledVector(up, velocity.current.y * delta);
  });

  return null;
}

function adjustLocation(location, offset = 2048) {
  const [x, y] = location;
  return [Math.abs(x - offset), Math.abs(y - offset)];
}

export default function App() {
  // 1. change the JSON DATA to match the road data
  // 2. change the mainFolderName to the road data name
  // 3. change subFolderName to current T_number
  // 4. change currentCubeIndex to current uPano
  const assets = require("./json/Panorama_Genoa.json");
  const mainFolderName = "Genoa_T5"; // root folder in /public
  const subFolderName = "Genoa_T2"
  const [currentCubeIndex, setCurrentCubeIndex] = useState(73);
  
  const glRef = useRef(null);
  const [cameraPos, setCameraPos] = useState([0, 0, 0]);
  const texturePaths = getCubeTextures(mainFolderName, subFolderName ,currentCubeIndex);
  const markersForCurrentPano = assets.filter(
    (item) => item.uPANO === `${subFolderName}_${currentCubeIndex}`
  );
  const handleScreenshot = () => {
    if (!glRef.current) return;
    // Convert the 3D canvas to a data URL
    const dataURL = glRef.current.domElement.toDataURL("image/jpg");
    // Download the image
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = subFolderName + "_" + currentCubeIndex + ".jpg";
    link.click();
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: cameraPos,
          rotation: [0, Math.PI / 2, 0],
        }}
        
        onCreated={(state) => {
          glRef.current = state.gl; // store the WebGL renderer
        }}
      >
        {/* The panorama cube */}
        <Room texturePaths={texturePaths} position={[0, 0, 0]} size={300} />

        {/* Movement / Controls */}
        <Movement
          setCameraPos={setCameraPos}
          cameraPos={cameraPos}
          currentCubeIndex={currentCubeIndex}
          setCurrentCubeIndex={setCurrentCubeIndex}
        />

        {/* Render an AssetMarker for each asset */}
        {markersForCurrentPano.map((asset) => {
          const faceIndex = getFaceIndex(asset.Image);
          const [x, y] = adjustLocation(asset.Location_Pixel);
          return (
            <AssetMarker
              key={asset.ID}
              faceIndex={faceIndex}
              x={x}
              y={2048 - y}
              assetName={asset.Asset_Name}
              cubeSize={300}
            />
          );
        })}

        <PointerLockControls />
      </Canvas>
      {/* The small legend in the top-right corner */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.5)",
          color: "white",
          padding: "8px",
          borderRadius: "4px",
          zIndex: 9999,
        }}
      >
        <strong>{`${subFolderName}_`}</strong>
        <input
            type="number"
            value={currentCubeIndex}
            onChange={(e) => setCurrentCubeIndex(e.target.value)}
            style={{ width: "40px" }}
          />
        <div style={{ marginTop: "8px" }}>
          <button onClick={handleScreenshot}>Take Screenshot</button>
        </div>
        <div style={{ marginTop: "8px" }}>
          
        </div>
      </div>
    </div>
  );
}
