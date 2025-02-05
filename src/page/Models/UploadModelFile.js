import React,{Fragment, useState} from "react";
import { useDispatch } from "react-redux";
import { Card, Col, Row } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { IconUpload } from "@tabler/icons-react";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import Loader from "../../components/Loader";
import * as ModelAPI from "../../api/ModelAPI";
import Utils from "../../components/Utils";
const UploadModelFile = ({modelId,fetchEditModel}) => {
    const dispatch = useDispatch();
    const [isLoading,setIsLoading] = useState();
	const handleDropFile = (files) =>{
        let ext = files[0].name.split('.').pop().toLowerCase();
        if(ext ==="glb" || ext ==="obj"){
            uploadModel(files[0]);
        }
        else{
            dispatch(
                showUpdatedToasterMessage({
                    message: "Invalid model file. Please upload valid model file",
                    type: "danger",
                })
            );
        }
    }
    const uploadModel = async(file)=>{
        setIsLoading(true);
        const formData = {model:file}
        let refineFormData = Utils.getFormData(formData);
        await ModelAPI.upload(modelId,refineFormData).then(({data})=>{
            fetchEditModel();
            dispatch(
                showUpdatedToasterMessage({
                    message: "Model uploaded success!",
                    type: "success",
                })
            );
        });
        setIsLoading(false);
    }
    const { getRootProps, getInputProps } = useDropzone({
        disabled:isLoading,
        onDrop: handleDropFile,
    });
    
	return (
        <Fragment>
		<Card {...getRootProps({ className: "dropzone cursor-pointer" })}>
			<Card.Body>
				<Row className="justify-content-center align-items-center h-100">
					<Col bsPrefix="col-auto text-center">
                        {isLoading && <Loader />}
						<input {...getInputProps()} />
						<IconUpload stroke={1} size={"60"} />
						<h3 className="fw-normal">Drag & Drop your file here to upload.</h3>
                        <p className="mx-3 ps-2 text-muted">Only .glb or .obj file allowed.</p>
					</Col>
				</Row>
			</Card.Body>
		</Card>
        </Fragment>
	);
};
export default UploadModelFile;
