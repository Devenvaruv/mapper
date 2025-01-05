import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PointerLockControls } from '@react-three/drei'

function SkyBox() {
  const { scene } = useThree()
  useEffect(() => {
    const loader = new THREE.CubeTextureLoader()
    const texture = loader.load([
      '/right.jpg',
      '/left.jpg',
      '/top.jpg',
      '/bottom.jpg',
      '/front.jpg',
      '/back.jpg',
    ])
    scene.background = texture
  }, [scene])
  
  return null
}

function RedDot() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="red" />
    </mesh>
  )
}

function Movement({ setDistance }) {
  const { camera } = useThree()
  const [moveForward, setMoveForward] = useState(false)
  const [moveBackward, setMoveBackward] = useState(false)
  const [moveLeft, setMoveLeft] = useState(false)
  const [moveRight, setMoveRight] = useState(false)
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  
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
  }, [])
  
  useFrame((state, delta) => {
    const moveSpeed = 100
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
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    const right = new THREE.Vector3()
    right.crossVectors(camera.up, forward).normalize()
    camera.position.addScaledVector(forward, -velocity.current.z * delta)
    camera.position.addScaledVector(right, velocity.current.x * delta)

    // Update the distance from the camera to the origin
    const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0))
    setDistance(dist)
  })
  
  return null
}

export default function App() {
  const [distance, setDistance] = useState(0)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 100000,
          position: [0, 0, 100],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <SkyBox />
        <RedDot />
        <Movement setDistance={setDistance} />
        <PointerLockControls />
      </Canvas>
      {/* Distance overlay rendered outside the Canvas */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        color: '#fff',
        fontFamily: 'sans-serif',
        zIndex: 1
      }}>
        Distance: {distance.toFixed(2)} cm
      </div>
    </div>
  )
}
