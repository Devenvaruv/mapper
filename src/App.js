import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { PointerLockControls } from '@react-three/drei'

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
    const moveSpeed = 50
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
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(camera.up, forward).normalize()

    camera.position.addScaledVector(forward, -velocity.current.z * delta)
    camera.position.addScaledVector(right, velocity.current.x * delta)
  })

  return null
}

export default function App() {
  const [cameraPos, setCameraPos] = useState([0, 0, 0])

  const cube1Textures = [
    '/cube1/right.jpg',
    '/cube1/left.jpg',
    '/cube1/top.jpg',
    '/cube1/bottom.jpg',
    '/cube1/front.jpg',
    '/cube1/back.jpg',
  ]
  const cube2Textures = [
    '/cube2/Img_2_2048.jpg',
    '/cube2/Img_0_2048.jpg',
    '/cube2/Img_4_2048.jpg',
    '/cube2/Img_5_2048.jpg',
    '/cube2/Img_1_2048.jpg',
    '/cube2/Img_3_2048.jpg',
  ]

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          // We'll ignore this position after the first render,
          // because we do setCameraPos() in code.
          position: cameraPos,
        }}
      >
        <Room texturePaths={cube1Textures} position={[0, 0, 0]} size={300} />
        <Room texturePaths={cube2Textures} position={[600, 0, 0]} size={300} />

        {/* Pass both the cameraPos and setCameraPos to Movement */}
        <Movement setCameraPos={setCameraPos} cameraPos={cameraPos} />

        <PointerLockControls />
      </Canvas>
    </div>
  )
}
