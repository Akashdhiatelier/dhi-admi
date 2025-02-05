import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Card, Spinner } from "react-bootstrap";
import RichTextEditor from "../../components/RichTextEditor";
import * as CmsAPI from "../../api/CmsAPI";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import Loader from "../../components/Loader";
const CmsSettings = ({ title = null, slug = null }) => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [content, setContent] = useState("");

  const fetchContent = async()=>{
    await CmsAPI.getOne(slug).then(({data})=>{
      setContent(data?.content);
    }).catch((error)=>{
      dispatch(
				showUpdatedToasterMessage({
					message: error.message,
					type: "danger",
				})
			);
    })
  }
  useEffect(()=>{
    fetchContent();
  },[slug])
	const handleEditorChange = (event, editor) => {
		const data = editor.getData();
		setContent(data);
	};

	const handleCancel = () => {
		setContent("");
	};
	const handleSubmit = async () => {
		setIsLoading(true);
		await CmsAPI.update(slug, {content:content}).then(({data})=>{
      dispatch(
				showUpdatedToasterMessage({
					message: "Data save successfully.",
					type: "success",
				})
			);
    }).catch((error) => {
			dispatch(
				showUpdatedToasterMessage({
					message: error.message,
					type: "danger",
				})
			);
		});
		setIsLoading(false);
	};
	return (
		<Fragment>
			<Card.Header className="h2 text-primary">{title}</Card.Header>
			<Card.Body>
				<RichTextEditor data={content} onChange={handleEditorChange} />
			</Card.Body>
			<Card.Footer className="bg-gold-lt">
				<div className="btn-list justify-content-end">
					<Button type="button" onClick={handleCancel} variant="default" className="me-3" disabled={isLoading}>
						Cancel
					</Button>
					<Button type="button" onClick={handleSubmit} disabled={isLoading}>
						{isLoading && <Spinner animation="border" size="sm" className="me-2" />}
						Submit
					</Button>
				</div>
			</Card.Footer>
		</Fragment>
	);
};
export default CmsSettings;
