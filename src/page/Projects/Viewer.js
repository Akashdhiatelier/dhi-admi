import React, { useEffect, useRef, useState } from "react";
import { Engine, Scene,HemisphericLight, ArcRotateCamera, HighlightLayer,PositionGizmo,RotationGizmo,UtilityLayerRenderer } from "react-babylonjs";
import {
	ActionManager,
	ExecuteCodeAction,
	Vector3,
	Color3,
    Color4
} from "@babylonjs/core";
import ScaledModelWithProgress from "../Models/ScaledModalWithProgress";
const Viewer = ({ projectModelFile, setPickedMeshId }) => {
	const [selectedMesh, setSelectedMesh] = useState(null);
	const meshRefs = useRef([]);
	const highlightLayerRef = useRef(null);

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
	const onMeshPicked = (mesh) => {
		if (mesh && mesh.parent) {
			console.log("sMesh:",mesh.id,mesh.parent.id)
			setSelectedMesh(mesh);
		}
	};
	
	useEffect(() => {
		const highlightLayer = highlightLayerRef.current;
		if (selectedMesh) {
            highlightLayer?.removeAllMeshes();
			if (selectedMesh.parent && selectedMesh.parent.id !=="__root__"){
				// && selectedMesh.parent.parent.id != "__root__") {

				// console.log("selectedMesh.parent:", selectedMesh.parent);
				// console.log("This is parent mesh:", selectedMesh.parent.getChildMeshes());
                const getSibling = selectedMesh.parent.getChildMeshes();
                console.log("🚀 ~ file: Viewer.js:50 ~ useEffect ~ getSibling:", getSibling)
                if(getSibling.length>0){

                    setPickedMeshId(selectedMesh.parent.id);
                    getSibling.forEach((m) => highlightLayer.addMesh(m, Color3.Green()));
                }
                // else{
                //     setPickedMeshId(selectedMesh.parent.parent.id);
                //     selectedMesh.parent.parent.getChildMeshes().forEach((m) => highlightLayer.addMesh(m, Color3.Green()));
                // }
			}
            else{
                setPickedMeshId(selectedMesh.id);
                highlightLayer.addMesh(selectedMesh,Color3.Green());
            }
		}
	}, [selectedMesh]);
	const handleCanvasClick = (event, pickInfo) => {
		if (pickInfo.pickedMesh === null) {
			if (selectedMesh) {
                setSelectedMesh(null);
				setPickedMeshId(null);
				highlightLayerRef.current.removeAllMeshes();
			}
		}
	};
	const getFileName = (path) => {
		return path.split("\\").pop().split("/").pop();
	};
	const getBasePath = (path) => {
		return path.substring(0, path.lastIndexOf("/"));
	};
	let baseUrl = process.env.REACT_APP_UPLOAD_BASE_URL + getBasePath(projectModelFile) + "/";
	
	return (
		<Engine antialias adaptToDeviceRatio={true} canvasId="project-viewer-canvas">
			<Scene onMeshPicked={onMeshPicked} onPointerDown={handleCanvasClick} clearColor={new Color4(1,1,1, 0)}>
				<ArcRotateCamera
					name="camera1"
					alpha={Math.PI / 2}
					beta={Math.PI / 2}
					radius={9.0}
					target={Vector3.Zero()}
					minZ={0.001}
				/>
				<HemisphericLight name="light1" intensity={2} direction={Vector3.Up()} />

				<ScaledModelWithProgress
					rootUrl={`${baseUrl}`}
					sceneFilename={getFileName(projectModelFile)}
					scaleTo={4}
					progressBarColor={Color3.Green()}
					// center={new Vector3(0, 0, 0)}
                    center={Vector3.Zero()}
					onModelLoaded={onModelLoaded}
				/>

				<HighlightLayer name="highlight" ref={highlightLayerRef} />
			</Scene>
		</Engine>
	);
};
export default Viewer;
