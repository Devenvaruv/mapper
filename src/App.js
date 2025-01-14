import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { PointerLockControls } from '@react-three/drei'
import { useMemo } from 'react'

import img0Points from './json/JsonDump.json'

function Room({ texturePaths = [], position = [0, 0, 0], size = 300 }) {
  const textures = useLoader(THREE.TextureLoader, texturePaths)
  return (
    <mesh position={position}>
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
  )
}

function Movement({ setCameraPos, cameraPos }) {
  const { camera } = useThree()

  const [moveForward, setMoveForward] = useState(false)
  const [moveBackward, setMoveBackward] = useState(false)
  const [moveLeft, setMoveLeft] = useState(false)
  const [moveRight, setMoveRight] = useState(false)

  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())

  // Whenever cameraPos changes, update the actual camera in Three.js
  useEffect(() => {
    camera.position.set(...cameraPos)
  }, [cameraPos, camera])

  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveForward(true)
          break
        case 'KeyS':
        case 'ArrowDown':
          setMoveBackward(true)
          break
        case 'KeyA':
        case 'ArrowLeft':
          setMoveLeft(true)
          break
        case 'KeyD':
        case 'ArrowRight':
          setMoveRight(true)
          break
        case 'KeyN':
          console.log('Pressed N')
          // Teleport to second cube
          setCameraPos([600, 0, 0])
          break
        case 'KeyB':
          console.log('Pressed B')
          setCameraPos([0,0,0])
          break
        default:
          break
      }
    }
    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveForward(false)
          break
        case 'KeyS':
        case 'ArrowDown':
          setMoveBackward(false)
          break
        case 'KeyA':
        case 'ArrowLeft':
          setMoveLeft(false)
          break
        case 'KeyD':
        case 'ArrowRight':
          setMoveRight(false)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [setCameraPos])

  useFrame((_, delta) => {
    const moveSpeed = 500
    velocity.current.x -= velocity.current.x * 10.0 * delta
    velocity.current.z -= velocity.current.z * 10.0 * delta

    direction.current.z = Number(moveForward) - Number(moveBackward)
    direction.current.x = Number(moveRight) - Number(moveLeft)
    direction.current.normalize()

    if (moveForward || moveBackward) {
      velocity.current.z -= direction.current.z * moveSpeed * delta
    }
    if (moveLeft || moveRight) {
      velocity.current.x -= direction.current.x * moveSpeed * delta
    }

    // Forward direction
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(camera.up, forward).normalize()

    camera.position.addScaledVector(forward, -velocity.current.z * delta)
    camera.position.addScaledVector(right, velocity.current.x * delta)
  })

  return null
}

function rotatePoint90([x, y, z], axis) {
  switch (axis) {
    case 'x':
      // +90° around X: (x, y, z) -> (x, -z, y)
      return [x, -z, y]
    case 'y':
      // +90° around Y: (x, y, z) -> (z, y, -x)
      return [z, y, -x]
    case 'z':
      // +90° around Z: (x, y, z) -> (-y, x, z)
      return [-y, x, z]
    default:
      return [x, y, z]
  }
}


export default function App() {
  const [cameraPos, setCameraPos] = useState([0, 0, 0])

  const cube1Textures = [
    '/cube2/Img_2_2048.jpg',
    '/cube2/Img_0_2048.jpg',
    '/cube2/Img_4_2048.jpg',
    '/cube2/Img_5_2048.jpg',
    '/cube2/Img_1_2048.jpg',
    '/cube2/Img_3_2048.jpg',
  ]

  
  

  function PointsOnCubeFace({
    points = [],        // array of [x, y, z]
    imageWidth = 2048, 
    imageHeight = 2048,
    boxSize = 300,      // must match your <Room> size
  }) {
    // We'll ignore each point's z. 
    // We only use x,y in [0..imageWidth, 0..imageHeight] space.
  
    // Because the “left” face is at x = -boxSize/2, we do:
    //   position={[-boxSize/2, 0, 0]}
    // Then rotate so that the local plane
    //   (0, up, right) => (y, z) 
    // aligns with how the texture is mapped.
    //
    // The rotation to face inside the cube from the left side 
    // is either [0, +Math.PI/2, 0] or [0, -Math.PI/2, 0], 
    // depending on your texture orientation.
    // Usually for the "left" face, you'd do [0, Math.PI/2, 0] 
    // so that +Z is "up" in image terms. 
    //
    // However, if your markers look flipped, 
    // try [0, -Math.PI/2, 0] or invert one axis below.
  
    const groupPosition = useMemo(
      () => new THREE.Vector3(-boxSize / 2, 0, 0), 
      [boxSize]
    );
    const groupRotation = useMemo(
      () => new THREE.Euler(0, Math.PI / 2, 0), 
      []
    );
  
    const scaleX = boxSize / imageWidth;   // maps 2048 wide -> 300 wide
    const scaleY = boxSize / imageHeight;  // similarly for height
    
    const rotatedPoints = useMemo(() => {
      return points.map(([x, y, z]) => {
        // 90° rotation clockwise around Z-axis:
        // New x = y
        // New y = -x
        // Z remains unchanged
        return [y, x, z];
      });
    }, [points]);

    return (
      <group position={groupPosition} rotation={groupRotation}>
        {rotatedPoints.map((p, i) => {
          const [rx, ry, rz] = p
          
          const localZ = (rx - imageWidth / 2)  * scaleX
          const localY = (ry - imageHeight / 2) * scaleY
  
          // Because we are on the left face:
          //   local X is 0 (since x = -150 is the face plane),
          //   local Y is vertical,
          //   local Z is horizontal across the texture. 
          // If your points appear flipped across Y or Z, 
          // just invert localZ or localY, e.g. `-localZ`.
          return (
            <mesh key={i} position={[ localY, - localZ, 0]}>
              <sphereGeometry args={[1.5, 16, 16]} />
              <meshBasicMaterial color="red" />
            </mesh>
          )
        })}
      </group>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: cameraPos,
        }}
      >
        <Room texturePaths={cube1Textures} position={[0, 0, 0]} size={640} />
        
        {/* Pass both the cameraPos and setCameraPos to Movement */}
        <Movement setCameraPos={setCameraPos} cameraPos={cameraPos} />

        {/* Draw points on the "Img_0" face (index=1) */}
        <PointsOnCubeFace points={img0Points} boxSize={300} />

        <PointerLockControls />
      </Canvas>
    </div>
  )
}
