import { useState } from 'react';
import { Engine, Scene,Model } from 'react-babylonjs';
import { Vector3,StandardMaterial,Texture } from '@babylonjs/core';

const LoadModel = () => {
  const initialTextureUrl = 'http://localhost:8080/public/thumbnails/material-1678790668544-909455319.webp';
  const updatedTextureUrl = 'http://localhost:8080/public/thumbnails/material-1678790668544-909455319.webp';
  const modelUrl = 'http://localhost:8080/public/models/';

  const [textureUrl, setTextureUrl] = useState(initialTextureUrl);

  const onModelLoadedHandler = (model) => {
    const { scene } = model;
    console.log("Viewer:onModelLoadedHandler")
    // Find the mesh you want to change the texture of
    const selectedMesh = scene.getMeshByName('Object001_Material #5_0');
    console.log("🚀 ~ file: LoadModel.js:17 ~ onModelLoadedHandler ~ selectedMesh:", selectedMesh)

    // Create a standard material and apply the initial texture to it
    const material = new StandardMaterial('material', scene);
    const texture = new Texture(textureUrl, scene);
    material.diffuseTexture = texture;

    // Assign the material to the selected mesh
    selectedMesh.material = material;
  };

  const updateTexture = () => {
    setTextureUrl(updatedTextureUrl);
  };

  return (
    <Engine antialias={true}>
      <Scene>
        <Model
          position={new Vector3(0, 0, 0)}
          rootUrl={modelUrl}
          sceneFilename="model-1679309126169.glb"
          onModelLoaded={onModelLoadedHandler}
        />
        <button onClick={updateTexture}>Update Texture</button>
      </Scene>
    </Engine>
  );
};

export default LoadModel;