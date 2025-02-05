import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as CategoryAPI from "../../api/CategoryAPI";
import CustomModal from "../../components/CustomModal/CustomModal";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
const AddEditCategory = ({ categoryModal, resetCategoryModal, status }) => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);

	const fetchEditCategory = async () => {
		setIsLoading(true);
		await CategoryAPI.getOne(categoryModal.id).then((res) => {
			let category = res?.data;
			if (category) {
				setValue("name", category.name);
				setValue("status", category.status);
			}
		});
		setIsLoading(false);
	};
	useEffect(() => {
		if (categoryModal.id) {
			fetchEditCategory();
		}
	}, []);
	/** Yup validations schema used for form validation **/
	let defaultCategoryValue = {
		name: "",
		status: "Active",
	};

	const categorySchema = yup.object().shape({
		name: yup.string().trim().required("Please enter category name!"),
		status: yup.string().trim().required("Please select status!"),
	});

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors: categoryError },
		reset,
		setError,
		setFocus,
	} = useForm({
		mode: "onBlur",
		resolver: yupResolver(categorySchema),
		defaultValues: defaultCategoryValue,
	});

	const formSubmit = async (formData) => {
		setIsLoading(true);
		if (categoryModal.action === "Edit") {
			await CategoryAPI.update(categoryModal.id, formData)
				.then((res) => {
					resetCategoryModal(true);
					dispatch(
						showUpdatedToasterMessage({
							message: "Category updated successfully.",
							type: "success",
						})
					);
				})
				.catch((error) => {
                    if(error?.code===406){
                        setError("name", {
                            type: "custom",
                            message: error?.errorMessage,
                        });
                        setFocus("name");
                    }
					else{
                        dispatch(
                            showUpdatedToasterMessage({
                                message: error?.errorMessage,
                                type: "danger",
                            })
                        );
                    }
				});
		} else {
			await CategoryAPI.create(formData)
				.then((res) => {
					resetCategoryModal(true);
					dispatch(
						showUpdatedToasterMessage({
							message: "Category added successfully.",
							type: "success",
						})
					);
				})
				.catch((error) => {
					if(error?.code===406){
                        setError("name", {
                            type: "custom",
                            message: error?.errorMessage,
                        });
                        setFocus("name");
                    }
                    else{
                        dispatch(
                            showUpdatedToasterMessage({
                                message: error?.errorMessage,
                                type: "danger",
                            })
                        );
                    }
				});
		}
		setIsLoading(false);
	};
	return (
		<CustomModal
			show={categoryModal.show}
			isLoading={isLoading}
			onHide={resetCategoryModal}
			modalHeading={categoryModal.title}
			size="lg"
			saveBtnText={categoryModal.saveBtnText}
			onSaveCallback={handleSubmit(formSubmit)}
		>
			<Form autoComplete="off" onSubmit={handleSubmit(formSubmit)}>
				<Row className="row-cards">
					<Form.Group as={Col} md="6">
						<Form.Label className="required">Name</Form.Label>
						<Form.Control
							type="text"
							className={`${categoryError.name && "is-invalid"}`}
							placeholder="Enter Category Name"
							{...register("name")}
						/>
						{categoryError.name && (
							<Form.Text className="invalid-feedback">{categoryError.name.message}</Form.Text>
						)}
					</Form.Group>
					<Form.Group as={Col} md="6" controlId="status">
						<Form.Label className="required">Status</Form.Label>
						<Form.Select
							aria-label="Status"
							className={`${categoryError.status && "is-invalid"}`}
							{...register("status")}
						>
							<option value="">Select</option>
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
						</Form.Select>
						{categoryError.status && (
							<Form.Text className="invalid-feedback">{categoryError.status.message}</Form.Text>
						)}
					</Form.Group>
				</Row>
			</Form>
		</CustomModal>
	);
};
export default AddEditCategory;
