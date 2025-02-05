import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./ck-editor-style.css";
const RichTextEditor = (props) => {
	return (
		<CKEditor
			editor={ClassicEditor}
			{...props}
		/>
	);
};
export default RichTextEditor;
