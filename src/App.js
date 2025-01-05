import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { PointerLockControls } from '@react-three/drei'

function Room() {
  // Load 6 images as textures:
  // Order: +x, -x, +y, -y, +z, -z
  const textures = useLoader(THREE.TextureLoader, [
    '/right.jpg',
    '/left.jpg',
    '/top.jpg',
    '/bottom.jpg',
    '/front.jpg',
    '/back.jpg',
  ])

  // Return a <mesh> with a boxGeometry. We attach each texture
  // to the box's face materials using material-0 to material-5
  return (
    <mesh>
      {/* The box is 300×300×300 (in cm if 1 unit = 1cm) */}
      <boxGeometry args={[300, 300, 300]} />
      {/* Map each texture to its corresponding face index */}
      {textures.map((texture, index) => (
        <meshBasicMaterial
          attach={`material-${index}`}
          key={index}
          map={texture}
          side={THREE.BackSide} // so we see it from the inside
        />
      ))}
    </mesh>
  )
}

function Movement() {
  const [moveForward, setMoveForward] = useState(false)
  const [moveBackward, setMoveBackward] = useState(false)
  const [moveLeft, setMoveLeft] = useState(false)
  const [moveRight, setMoveRight] = useState(false)

  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())

  const { camera } = useThree()

  // Key events
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

  // Movement logic (runs every frame)
  useFrame((state, delta) => {
    const moveSpeed = 50 // cm per second

    // Dampen velocity
    velocity.current.x -= velocity.current.x * 10.0 * delta
    velocity.current.z -= velocity.current.z * 10.0 * delta

    // forward/back = z-axis, left/right = x-axis
    direction.current.z = Number(moveForward) - Number(moveBackward)
    direction.current.x = Number(moveRight) - Number(moveLeft)
    direction.current.normalize()

    if (moveForward || moveBackward) {
      velocity.current.z -= direction.current.z * moveSpeed * delta
    }
    if (moveLeft || moveRight) {
      velocity.current.x -= direction.current.x * moveSpeed * delta
    }

    // Figure out the camera’s facing direction
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(camera.up, forward).normalize()

    // Move the camera
    camera.position.addScaledVector(forward, -velocity.current.z * delta)
    camera.position.addScaledVector(right, velocity.current.x * delta)
  })

  return null
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 0, 0], // Start at the center of the cube
        }}
      >
        <Room />
        <Movement />
        <PointerLockControls />
      </Canvas>
    </div>
  )
}
