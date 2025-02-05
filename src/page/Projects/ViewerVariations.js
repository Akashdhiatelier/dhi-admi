import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Engine,
  Scene,
  HemisphericLight,
  ArcRotateCamera,
  HighlightLayer,
  PositionGizmo,
  RotationGizmo,
  ScaleGizmo,
  UtilityLayerRenderer,
} from "react-babylonjs";
import "babylonjs-inspector";
import {
  ActionManager,
  ExecuteCodeAction,
  Vector3,
  Color3,
  Color4,
  SceneLoader,
  PointerDragBehavior,
  Vector4,
  Quaternion,
} from "@babylonjs/core";
import ScaledModelWithProgress from "../Models/ScaledModalWithProgress";
import { Button } from "react-bootstrap";
import {
  Icon360,
  IconArrowsMove,
  IconLockOpen,
  IconLock,
} from "@tabler/icons-react";
import _ from "lodash";
const Viewer = ({
  projectModelFile,
  pickedMeshId = null,
  setPickedMeshId = null,
  projectModels = [],
  currentSelection = [],
  variationPositions = [],
  setVariationPositions = [],
}) => {
  const [selectedMesh, setSelectedMesh] = useState(null);
  // const sceneRef = useRef(null);

  const parentMeshRefs = useRef([]);
  const highlightLayerRef = useRef(null);
  const positionGizmoRef = useRef(null);
  const rotationGizmoRef = useRef(null);
  const scaleGizmoRef = useRef(null);
  const [isRotate, setIsRotate] = useState(false);
  const [isMove, setIsMove] = useState(false);
  const [isScale, setIsScale] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [isReload, setIsReload] = useState(false);

  const getFileName = (path) => {
    return path.split("\\").pop().split("/").pop();
  };
  const getBasePath = (path) => {
    return path.substring(0, path.lastIndexOf("/"));
  };
  let baseUrl =
    process.env.REACT_APP_UPLOAD_BASE_URL + getBasePath(projectModelFile) + "/";

  const onModelLoaded = (model) => {
    console.log("onModelLoaded");
    parentMeshRefs.current = [];
    model.meshes.forEach((mesh, i) => {
      if (mesh?.parent?.metadata?.gltf?.extras?.is_parent) {
        mesh.parent.is_parent = true;
        parentMeshRefs.current.push(mesh.parent);
      }
    });
    const parentMeshPositions = parentMeshRefs.current.map((mesh) => {
      return {
        id: mesh.id,
        position: mesh.position,
        rotation: mesh.rotationQuaternion,
      };
    });
    setVariationPositions(parentMeshPositions);

    // model.meshes.forEach((mesh, i) => {
    // 	if(i===0){
    // 		mesh._scene?.debugLayer?.show()
    // 	}
    // 	meshRefs.current.push(mesh);
    // 	mesh.actionManager = new ActionManager(mesh._scene);
    // 	mesh.actionManager.registerAction(
    // 		new ExecuteCodeAction(ActionManager.OnPickTrigger, (event) => {
    // 			// console.log("mesh:parent",mesh.parent);
    // 			// if (selectedMesh) {
    // 			// 	selectedMesh.removeAllMeshes();
    // 			// }
    // 			// selectedMesh = new HighlightLayer("highlight", mesh.parent._scene);
    // 			// selectedMesh.addMesh(mesh.parent.mesh, Color3.Green());
    // 			// setCurrentMesh(selectedMesh);
    // 		})
    // 	);
    // });
  };
  const onMeshPicked = (mesh) => {
    if (mesh && mesh.parent) {
      setSelectedMesh(mesh);
    }
  };
  const handleModelChange = async () => {
    console.log("call handleModel Change");
    if (selectedMesh) {
      const filteredMesh = currentSelection.filter(
        (item) => item.object_id === selectedMesh.parent.id
      );
      if (filteredMesh.length > 0) {
        let modelBaseUrl =
          process.env.REACT_APP_UPLOAD_BASE_URL +
          getBasePath(filteredMesh[0].model_file) +
          "/";
        let modelFileUrl = getFileName(filteredMesh[0].model_file);

        const importedMeshes = await SceneLoader.ImportMeshAsync(
          null,
          modelBaseUrl,
          modelFileUrl,
          selectedMesh._scene
        );
        let totalChild = selectedMesh.parent.getChildMeshes().length;
        // importedMeshes.meshes[0].parent = selectedMesh.parent;

        importedMeshes.meshes.forEach((mesh, i) => {
          if (i > 0) {
            importedMeshes.meshes[i].parent = selectedMesh.parent;
          }
        });
        const getSibling = selectedMesh.parent.getChildMeshes();
        getSibling.forEach((mesh, i) => {
          if (totalChild > i) {
            // console.log(`pMesh ${i}:`, mesh.id);
            mesh.dispose();
          }
        });
        // const highlightLayer = highlightLayerRef.current;
        // highlightLayer.removeAllMeshes();
        // getSibling.forEach((m) => highlightLayer.addMesh(m, Color3.Green()));
        resetSelected();
      } else {
        console.log("filter mesh not found.");
      }
    } else {
      console.log("handleModelChange else");
    }
  };
  useEffect(() => {
    const getModelChange = setTimeout(() => {
      handleModelChange();
    }, 100);
    return () => clearTimeout(getModelChange);
  }, [currentSelection]);
  useEffect(() => {
    const highlightLayer = highlightLayerRef.current;
    if (selectedMesh) {
      highlightLayer?.removeAllMeshes();
      setIsMove(false);
      setIsRotate(false);
      setIsScale(false);
      if (selectedMesh.parent && selectedMesh.parent.id !== "__root__") {
        // selectedMesh.parent.position = new Vector3(-1.640252947807312,0,-2.2680790328979492);

        const getSibling = selectedMesh.parent.getChildMeshes();
        if (getSibling.length > 0) {
          // console.log("selectedMesh.parent.id:", selectedMesh.parent.id);
          setPickedMeshId(selectedMesh.parent.id);
          getSibling.forEach((m) => highlightLayer.addMesh(m, Color3.Green()));
        }
      } else {
        // setPickedMeshId(selectedMesh.id);
        // highlightLayer.addMesh(selectedMesh, Color3.Green());
      }
    }
  }, [selectedMesh]);
  useEffect(() => {
    if (positionGizmoRef.current) {
      positionGizmoRef.current.attachedMesh = isMove
        ? selectedMesh.parent
        : null;
    }
    if (rotationGizmoRef.current) {
      rotationGizmoRef.current.attachedMesh = isRotate
        ? selectedMesh.parent
        : null;
    }
    if (scaleGizmoRef.current) {
      scaleGizmoRef.current.attachedMesh = isScale ? selectedMesh.parent : null;
    }
  }, [isMove, isRotate, isScale]);
  const resetSelected = () => {
    if (selectedMesh) {
      setSelectedMesh(null);
      setPickedMeshId(null);
      highlightLayerRef.current.removeAllMeshes();
      setIsMove(false);
      setIsMove(false);
      setIsScale(false);
    }
  };
  const handleCanvasClick = (event, pickInfo) => {
    if (pickInfo.pickedMesh === null) {
      resetSelected();
    }
  };
  const onSceneMount = (scene) => {
    // sceneRef.current = scene;
    // console.log("onSceneMount:", scene?.debugLayer);
    // scene?.debugLayer?.show();
  };
  const handleGizmoMove = () => {
    if (positionGizmoRef.current) {
      // const newPosition = positionGizmoRef.current.attachedMesh;
      // console.log("GizmoPos:",newPosition);

      const parentMeshPositions = parentMeshRefs.current.map((mesh) => {
        return {
          id: mesh.id,
          position: mesh.position,
          rotation: mesh.rotationQuaternion,
        };
      });
      setVariationPositions(parentMeshPositions);
      // const meshPositions = positionGizmoRef.current.attachedMesh._scene.meshes.map(mesh => mesh.position);
      // console.log("Meshes",meshPositions);

      // console.log("meshPos:",selectedMesh.parent.getAbsolutePosition());
    }
  };
  useEffect(() => {
    const refineModel = projectModels.find(
      (item) => item.object_id === pickedMeshId && item.allow_move === true
    );
    setShowOptions(refineModel ? true : false);
    console.log("pickedMeshId:", pickedMeshId);
    console.log("refineModel", refineModel);
    console.log("projectModels:", projectModels);
  }, [pickedMeshId]);

  useEffect(() => {
    parentMeshRefs.current.forEach((pMesh) => {
      const findOne = variationPositions.find((item) => item.id === pMesh.id);
      if (findOne) {
        pMesh.position.copyFrom(findOne.position);
        pMesh.rotationQuaternion.copyFrom(findOne.rotation);
      }
      const filteredMesh = currentSelection.filter(
        (item) => item.object_id === pMesh.id
      );
      if (filteredMesh.length > 0) {
        let modelBaseUrl =
          process.env.REACT_APP_UPLOAD_BASE_URL +
          getBasePath(filteredMesh[0].model_file) +
          "/";
        let modelFileUrl = getFileName(filteredMesh[0].model_file);

        SceneLoader.ImportMesh(
          null,
          modelBaseUrl,
          modelFileUrl,
          pMesh._scene,
          (importedMeshes) => {
            if (importedMeshes) {
              console.log(
                "🚀 ~ file: ViewerVariations.js:266 ~ parentMeshRefs.current.map ~ importedMeshes:",
                importedMeshes
              );

              let totalChild = pMesh.getChildMeshes().length;
              // importedMeshes.meshes[0].parent = selectedMesh.parent;

              importedMeshes.forEach((mesh, i) => {
                if (i > 0) {
                  // importedMeshes[i].parent = pMesh;
                  mesh.parent = pMesh;
                }
              });
              const getSibling = pMesh.getChildMeshes();
              getSibling.forEach((mesh, i) => {
                if (totalChild > i) {
                  // console.log(`pMesh ${i}:`, mesh.id);
                  mesh.dispose();
                }
              });
            }
          }
        );
      }
    });
  }, [variationPositions]);
  const handleReload = () => {
    setIsReload(true);
    setTimeout(() => {
      setIsReload(false);
    }, 1);
  };
  return (
    <Fragment>
      <button className="position-fixed" onClick={handleReload}>
        Reload Model
      </button>

      {showOptions && (
        <div className="position-fixed mt-1 w-4">
          <Button
            variant="outline-secondary"
            className={`btn-icon mb-1 ${isRotate ? "active" : ""}`}
            onClick={() => setIsRotate(!isRotate)}
          >
            <Icon360 stroke={1.5} size="20" />
          </Button>
          {/* <br /> */}
          <Button
            variant="outline-secondary"
            className={`btn-icon ${isMove ? "active" : ""}`}
            onClick={() => setIsMove(!isMove)}
          >
            <IconArrowsMove stroke={1.5} size="20" />
          </Button>

          <Button
            variant="outline-secondary"
            className={`btn-icon ${isScale ? "active" : ""}`}
            onClick={() => setIsScale(!isScale)}
          >
            <IconArrowsMove stroke={1.5} size="20" />
          </Button>
        </div>
      )}
      <Engine
        antialias
        adaptToDeviceRatio={true}
        canvasId="project-viewer-canvas"
      >
        {/* <FreeCamera name="camera1" position={new Vector3(0, 5, -10)} setTarget={[Vector3.Zero()]}> */}
        <Scene
          onSceneMount={onSceneMount}
          onMeshPicked={onMeshPicked}
          onPointerDown={handleCanvasClick}
          clearColor={new Color4(1, 1, 1, 0)}
        >
          <ArcRotateCamera
            name="camera1"
            alpha={Math.PI / 2}
            beta={Math.PI / 2}
            radius={9.0}
            target={Vector3.Zero()}
            minZ={0.001}
          />

          <HemisphericLight
            name="light1"
            intensity={2}
            direction={Vector3.Up()}
          />
          {!isReload && (
            <ScaledModelWithProgress
              rootUrl={`${baseUrl}`}
              sceneFilename={getFileName(projectModelFile)}
              // scaleTo={1}
              progressBarColor={Color3.Green()}
              // center={new Vector3(0, 0, 0)}
              center={Vector3.Zero()}
              onModelLoaded={onModelLoaded}
            />
          )}
          <HighlightLayer name="highlight" ref={highlightLayerRef} />
          <UtilityLayerRenderer>
            <PositionGizmo
              ref={positionGizmoRef}
              onDragEndObservable={handleGizmoMove}
            />
            <RotationGizmo
              thickness={1.5}
              ref={rotationGizmoRef}
              onDragEndObservable={handleGizmoMove}
            />
            <ScaleGizmo
              thickness={1.5}
              ref={scaleGizmoRef}
              onDragEndObservable={handleGizmoMove}
            />
          </UtilityLayerRenderer>
        </Scene>
        {/* </FreeCamera> */}
      </Engine>
    </Fragment>
  );
};
export default Viewer;
