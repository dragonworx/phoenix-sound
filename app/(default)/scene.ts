import * as THREE from 'three';

/**
 * Custom 3D scene setup with geometric shapes, lighting, and shadows
 * Designed for camera positioned at diagonal view (100, 100, 100)
 */
export const customScene = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void => {
    // Ground plane - white, horizontal surface to receive shadows
    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
      specular: 0x111111
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to lay flat on XZ plane
    plane.receiveShadow = true;
    scene.add(plane);

    // Red cone - positioned left of center
    const coneGeometry = new THREE.ConeGeometry(10, 20, 32);
    const coneMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      shininess: 100,
      specular: 0x111111
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(-30, 10, 0); // Left side, half-height above ground
    cone.castShadow = true;
    scene.add(cone);

    // Green sphere - positioned at center
    const sphereGeometry = new THREE.SphereGeometry(12, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      shininess: 100,
      specular: 0x111111
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 12, 0); // Center, radius height above ground
    sphere.castShadow = true;
    scene.add(sphere);

    // Blue cube - positioned right of center
    const cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x0000ff,
      shininess: 100,
      specular: 0x111111
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(30, 10, 0); // Right side, half-height above ground
    cube.castShadow = true;
    scene.add(cube);

    // Main directional light - positioned to illuminate from diagonal angle
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(50, 80, 60); // High and angled toward camera view
    directionalLight.target.position.set(0, 0, 0); // Aimed at scene center
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -80;
    directionalLight.shadow.camera.right = 80;
    directionalLight.shadow.camera.top = 80;
    directionalLight.shadow.camera.bottom = -80;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    // Secondary point light - provides additional illumination and shadow depth
    const pointLight = new THREE.PointLight(0xffffff, 0.6, 400);
    pointLight.position.set(40, 60, 40); // Positioned to complement directional light
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 400;
    scene.add(pointLight);

    // Ambient light - provides base illumination to prevent completely dark areas
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Transparent background to show page background through canvas
    scene.background = null;
  }