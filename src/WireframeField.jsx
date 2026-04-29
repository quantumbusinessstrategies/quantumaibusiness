import { useEffect, useRef } from 'react'

function seeded(seed) {
  const n = Math.sin(seed * 9999) * 10000
  return n - Math.floor(n)
}

function range(seed, min, max) {
  return seeded(seed) * (max - min) + min
}

function makeRhombicDodecahedronGeometry(THREE, radius = 1) {
  const vertices = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
    [0.5, 0.5, 0.5],
    [0.5, 0.5, -0.5],
    [0.5, -0.5, 0.5],
    [0.5, -0.5, -0.5],
    [-0.5, 0.5, 0.5],
    [-0.5, 0.5, -0.5],
    [-0.5, -0.5, 0.5],
    [-0.5, -0.5, -0.5],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize().multiplyScalar(radius))

  const faces = [
    [0, 6, 2, 7],
    [0, 7, 5, 9],
    [0, 9, 3, 8],
    [0, 8, 4, 6],
    [1, 11, 2, 10],
    [1, 13, 5, 11],
    [1, 12, 3, 13],
    [1, 10, 4, 12],
    [2, 6, 4, 10],
    [2, 11, 5, 7],
    [3, 12, 4, 8],
    [3, 9, 5, 13],
  ]

  const positions = []
  faces.forEach(([a, b, c, d]) => {
    ;[a, b, c, a, c, d].forEach((index) => {
      const vertex = vertices[index]
      positions.push(vertex.x, vertex.y, vertex.z)
    })
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

function createWireObject(THREE, index) {
  const type = index % 4
  const geometry =
    type === 0
      ? new THREE.IcosahedronGeometry(1, 0)
      : type === 1
        ? new THREE.DodecahedronGeometry(1, 0)
        : type === 2
          ? makeRhombicDodecahedronGeometry(THREE, 1)
          : new THREE.IcosahedronGeometry(1, 1)

  const edges = new THREE.EdgesGeometry(geometry, type === 3 ? 18 : 1)
  geometry.dispose()

  const hue = range(index + 8, 0.48, 0.94)
  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color().setHSL(hue, 0.98, 0.72),
    transparent: true,
    opacity: range(index + 12, 0.38, 0.74),
    blending: THREE.AdditiveBlending,
  })
  const mesh = new THREE.LineSegments(edges, material)
  const scale = range(index + 18, 0.75, 1.9)
  mesh.scale.setScalar(scale)
  mesh.position.set(range(index + 24, -8.6, 8.6), range(index + 30, -5.2, 5.2), range(index + 36, -3.8, 2.2))
  mesh.rotation.set(range(index + 42, 0, Math.PI), range(index + 48, 0, Math.PI), range(index + 54, 0, Math.PI))
  mesh.userData.spin = {
    x: range(index + 60, -0.16, 0.16),
    y: range(index + 66, 0.12, 0.34),
    z: range(index + 72, -0.1, 0.18),
    drift: range(index + 78, 0.12, 0.34),
    originY: mesh.position.y,
  }
  return mesh
}

export default function WireframeField() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let renderer = null
    let objects = []
    let frameId = 0
    let disposed = false
    let handleResize = null

    function resize(camera) {
      const width = mount.clientWidth || window.innerWidth
      const height = mount.clientHeight || window.innerHeight
      renderer.setSize(width, height, false)
      const aspect = width / Math.max(height, 1)
      camera.left = -7.2 * aspect
      camera.right = 7.2 * aspect
      camera.top = 7.2
      camera.bottom = -7.2
      camera.updateProjectionMatrix()
    }

    function animate(rendererInstance, scene, camera, clock) {
      const elapsed = clock.getElapsedTime()
      objects.forEach((object, index) => {
        const spin = object.userData.spin
        object.rotation.x += spin.x * 0.01
        object.rotation.y += spin.y * 0.01
        object.rotation.z += spin.z * 0.01
        object.position.y = spin.originY + Math.sin(elapsed * spin.drift + index) * 0.34
      })
      rendererInstance.render(scene, camera)
      frameId = window.requestAnimationFrame(() => animate(rendererInstance, scene, camera, clock))
    }

    async function start() {
      const THREE = await import('three')
      if (disposed || !mount.isConnected) return

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-10, 10, 6, -6, 0.1, 100)
      camera.position.set(0, 0, 12)

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      mount.appendChild(renderer.domElement)

      objects = Array.from({ length: 18 }, (_, index) => createWireObject(THREE, index + 1))
      objects.forEach((object) => scene.add(object))

      const clock = new THREE.Clock()
      handleResize = () => resize(camera)
      resize(camera)
      animate(renderer, scene, camera, clock)
      window.addEventListener('resize', handleResize)
    }

    start()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      if (handleResize) {
        window.removeEventListener('resize', handleResize)
      }
      objects.forEach((object) => {
        object.geometry.dispose()
        object.material.dispose()
      })
      renderer?.dispose()
      renderer?.domElement.remove()
    }
  }, [])

  return <div aria-hidden="true" className="three-wireframes" ref={mountRef} />
}
