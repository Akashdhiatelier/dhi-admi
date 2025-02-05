import React, { forwardRef, useEffect, useRef, useState } from "react";
import {
	Engine,
	Scene,
	HemisphericLight,
	HighlightLayer,
	PositionGizmo,
	RotationGizmo,
	UtilityLayerRenderer,
} from "react-babylonjs";
import { ActionManager, ExecuteCodeAction, Color3, SceneLoader, DebugLayer, Vector3 } from "@babylonjs/core";
import ScaledModelWithProgress from "../Models/ScaledModalWithProgress";
import { IconChevronsDownLeft } from "@tabler/icons-react";

function Demo() {
	const sceneRef = React.createRef();
	const meshRefs = useRef([]);
	const highlightLayerRef = useRef(null);
	const positionGizmoRef = useRef(null);
	const rotationGizmoRef = useRef(null);

	const [selectedMesh, setSelectedMesh] = useState(null);
	const baseUrl = "http://localhost:8080/public/projects/";

	const onModelLoaded = (model) => {
		model.meshes.forEach((mesh, i) => {
			meshRefs.current.push(mesh);
			mesh.actionManager = new ActionManager(mesh._scene);
			mesh.actionManager.registerAction(
				new ExecuteCodeAction(ActionManager.OnPickTrigger, (event) => {
					// console.log("mesh:parent",mesh.parent);
					// if (selectedMesh) {
					// 	selectedMesh.removeAllMeshes();
					// }
					// selectedMesh = new HighlightLayer("highlight", mesh.parent._scene);
					// selectedMesh.addMesh(mesh.parent.mesh, Color3.Green());
					// setCurrentMesh(selectedMesh);
				})
			);
		});
	};
	useEffect(() => {
		const highlightLayer = highlightLayerRef.current;
		if (selectedMesh) {
			highlightLayer?.removeAllMeshes();
			if (selectedMesh.parent && selectedMesh.parent !== "__root__" && selectedMesh.parent.parent.id !== "__root__") {
				console.log("selectedMesh.parent:", selectedMesh.parent.position);
				console.log("This is parent mesh:", selectedMesh.parent);
				// let position = selectedMesh.parent.getAbsolutePosition();
				// console.log("🚀 ~ file: Demo.js:50 ~ useEffect ~ position:", position)
				

				console.log("🚀 ~ file: Demo.js:52 ~ useEffect ~ selectedMesh:", selectedMesh.parent);
				SceneLoader.ImportMesh(
					"",
					"http://localhost:8080/public/models/",
					// "model-1681731743751.glb",
					"model-1679309126169.glb",
					selectedMesh._scene,
					(meshes) => {
						console.log("ImportMesh", meshes);
						const meshAbsolutePosition = selectedMesh.parent.getAbsolutePosition();
						selectedMesh.parent.getChildMeshes().forEach(childMesh => childMesh.dispose());
						meshAbsolutePosition.y=0;
						meshes[0].position.copyFrom(meshAbsolutePosition);
						meshes[0].rotationQuaternion = selectedMesh.parent.rotationQuaternion.clone();
						meshes[0].scaling = selectedMesh.parent.scaling.clone();
						meshes.forEach(mesh=>mesh.parent=selectedMesh.parent);
					}
				);

				// const getSibling = selectedMesh.parent.getChildMeshes();
				// if (getSibling.length > 1) {
				// 	getSibling.forEach((m) => {
				// 		highlightLayer.addMesh(m, Color3.Green());
				// 		// m.isVisible = false;
				// 	});
				// 	positionGizmoRef.current.attachedMesh = selectedMesh.parent;
				// 	rotationGizmoRef.current.attachedMesh = selectedMesh.parent;
				// } else {
				// 	selectedMesh.parent.parent.getChildMeshes().forEach((m) => {
				// 		highlightLayer.addMesh(m, Color3.Green());
				// 		// m.isVisible = false;
				// 	});
				// 	positionGizmoRef.current.attachedMesh = selectedMesh.parent.parent;
				// 	rotationGizmoRef.current.attachedMesh = selectedMesh.parent.parent;
				// }
			} else {
				highlightLayer.addMesh(selectedMesh, Color3.Green());
				positionGizmoRef.current.attachedMesh = selectedMesh;
				rotationGizmoRef.current.attachedMesh = selectedMesh;
			}
		}
	}, [selectedMesh]);
	const onMeshPicked = (mesh) => {
		if (mesh && mesh.parent) {
			setSelectedMesh(mesh);
		}
	};
	const handleCanvasClick = (event, pickInfo) => {
		if (pickInfo.pickedMesh === null) {
			if (selectedMesh) {
				setSelectedMesh(null);
				// setPickedMeshId(null);
				highlightLayerRef.current.removeAllMeshes();
				rotationGizmoRef.current.attachedMesh = null;
				positionGizmoRef.current.attachedMesh = null;
			}
		}
	};
	// engine.runRenderLoop(() => {
	// 	selectedMesh._scene.render();
	//   });
	return (
		<>
			<Engine antialias adaptToDeviceRatio canvasId="babylonJS">
				<Scene onMeshPicked={onMeshPicked} onPointerDown={handleCanvasClick}>
					<arcRotateCamera
						name="camera"
						alpha={Math.PI / 2}
						beta={Math.PI / 4}
						radius={10}
						target={Vector3.Zero()}
					/>
					<HemisphericLight name="light1" intensity={2} direction={Vector3.Up()} />
					<ScaledModelWithProgress
						rootUrl={`${baseUrl}`}
						sceneFilename="project-1680680765492.glb"
						scaleTo={4}
						progressBarColor={Color3.Green()}
						// center={new Vector3(0, 0, 0)}
						center={Vector3.Zero()}
						onModelLoaded={onModelLoaded}
					/>
					<HighlightLayer name="highlight" ref={highlightLayerRef} />
					<UtilityLayerRenderer>
						<PositionGizmo thickness={1.5} ref={positionGizmoRef} />
						<RotationGizmo thickness={1.5} ref={rotationGizmoRef} />
					</UtilityLayerRenderer>
				</Scene>
			</Engine>
		</>
	);
}
export default Demo;
