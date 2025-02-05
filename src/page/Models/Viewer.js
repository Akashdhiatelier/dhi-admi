import React, { useEffect, useRef, useState } from "react";
import { Engine, Scene } from "react-babylonjs";
import {
	Vector3,
	StandardMaterial,
	Texture,
	Color3,
	Color4,
	ActionManager,
	ExecuteCodeAction,
	InterpolateValueAction,
	SetValueAction,
	HighlightLayer,
	Tools,
} from "@babylonjs/core";
import ScaledModelWithProgress from "./ScaledModalWithProgress";

const Viewer = ({
	modelFile,
	modelMaterials = [],
	currentSelection = [],
	setModelLayers = null,
	pickedMeshId = null,
	setPickedMeshId = null,
	setVariationThumbnail = null,
}) => {
	const [currentMesh, setCurrentMesh] = useState(null);
	const modelRef = useRef(null);
	const meshRefs = useRef([]);

	const getFileName = (path) => {
		return path.split("\\").pop().split("/").pop();
	};
	const getBasePath = (path) => {
		return path.substring(0, path.lastIndexOf("/"));
	};

	let selectedMesh;
	const handleMaterialChange = () => {
		meshRefs.current.forEach((mesh, i) => {
			if (mesh && i > 0) {
				const filteredMesh = currentSelection.filter((item) => item.layer_id === mesh.id);
				if (filteredMesh.length > 0) {
					const filterMaterial = modelMaterials.filter((item) => item.id === filteredMesh[0].material_id);
					if (filterMaterial.length > 0) {
						const material = new StandardMaterial("material", mesh._scene);
						const textureUrl = process.env.REACT_APP_UPLOAD_BASE_URL + filterMaterial[0].thumbnail;
						const texture = new Texture(textureUrl, mesh._scene);
						material.diffuseTexture = texture;
						mesh.material = material;
					}
				}
			}
		});
		// if (setVariationThumbnail !== null) {
		// 	takeSnapshot();
		// }
	};
	function dataURLtoBlob(dataUrl) {
		const arr = dataUrl.split(",");
		const mime = arr[0].match(/:(.*?);/)[1];
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], { type: mime });
	}
	const takeSnapshot = () => {
		try {
			if (currentMesh && pickedMeshId === null) {
				currentMesh.removeAllMeshes();
			}
			if (modelRef?.current?.rootMesh) {
				const model = modelRef.current.rootMesh;
				const camera = model.getScene().activeCamera;

				// Get the bounding box of the model
				const boundingBox = model.getBoundingInfo().boundingBox;
				const size = boundingBox.maximum.subtract(boundingBox.minimum);

				// Adjust the render target size to match the model size
				const width = Math.ceil(size.x);
				const height = Math.ceil(size.y);

				setTimeout(() => {
					Tools.CreateScreenshot(
						model.getScene().getEngine(),
						camera,
						{
							precision: 1,
							width,
							height,
							useWidthHeightFallback: true,
							restoreOriginalSize: true,
							format: "png",
							download: false, // Set the download option to false
						},
						(dataUrl) => {
							if (setVariationThumbnail !== null) {
								setVariationThumbnail(dataURLtoBlob(dataUrl));
							}
						}
					);
				}, 100);
			}
		} catch (error) {
			console.log("snapshot error occured:", error);
		}
	};
	useEffect(() => {
		console.log("setPickedMeshId changed:", pickedMeshId);
		if (currentMesh && pickedMeshId === null) {
			currentMesh.removeAllMeshes();
		}
		if (setVariationThumbnail !== null) {
			takeSnapshot();
		}
	}, [pickedMeshId]);
	useEffect(() => {
		handleMaterialChange();
	}, [currentSelection]);
	const onModelLoaded = (model) => {
		modelRef.current = model;
		const refineData = model.meshes.reduce((p, c, i) => {
			if (i > 0) {
				p.push(c.id);
			}
			return p;
		}, []);
		if (setModelLayers !== null) {
			setModelLayers(refineData);
		}
		let defaultMeshMaterial = [];
		model.meshes.forEach((mesh, i) => {
			meshRefs.current.push(mesh);
			defaultMeshMaterial.push(mesh);
			if (setPickedMeshId !== null) {
				mesh.actionManager = new ActionManager(mesh._scene);
				mesh.actionManager.registerAction(
					new ExecuteCodeAction(ActionManager.OnPickTrigger, (event) => {
						if (selectedMesh) {
							selectedMesh.removeAllMeshes();
						}
						selectedMesh = new HighlightLayer("highlight", mesh._scene);
						selectedMesh.addMesh(mesh, Color3.Green());
						setCurrentMesh(selectedMesh);
					})
				);
			}
		});
	};
	const onMeshPicked = (mesh) => {
		if (setPickedMeshId !== null) {
			setPickedMeshId(mesh.id);
		}
	};
	const handleCanvasClick = (event, pickInfo) => {
		if (pickInfo.pickedMesh === null) {
			if (currentMesh) {
				setPickedMeshId(null);
				currentMesh.removeAllMeshes();
			}
		}
	};
	let baseUrl = process.env.REACT_APP_UPLOAD_BASE_URL + getBasePath(modelFile) + "/";
	return (
		<>
			<Engine antialias adaptToDeviceRatio={true} canvasId="model-viewer-canvas">
				<Scene onMeshPicked={onMeshPicked} onPointerDown={handleCanvasClick} clearColor={new Color4(0, 0, 0, 0.1)}>
				{/* <Scene onMeshPicked={onMeshPicked} onPointerDown={handleCanvasClick}> */}
					<arcRotateCamera
						name="camera1"
						alpha={Math.PI / 2}
						beta={Math.PI / 2}
						radius={9.0}
						target={Vector3.Zero()}
						minZ={0.001}
					/>
					<hemisphericLight name="light1" intensity={2} direction={Vector3.Up()} />

					<ScaledModelWithProgress
						rootUrl={`${baseUrl}`}
						sceneFilename={getFileName(modelFile)}
						scaleTo={4}
						progressBarColor={Color3.Green()}
						center={new Vector3(0, -1, 0)}
						onModelLoaded={onModelLoaded}
					/>
				</Scene>
			</Engine>
		</>
	);
};

export default Viewer;
