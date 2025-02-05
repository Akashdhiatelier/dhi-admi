import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Form, Row } from "react-bootstrap";
import { IconPencil, IconPhotoPlus } from "@tabler/icons-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Utils from "../../components/Utils";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import CustomModal from "../../components/CustomModal/CustomModal";
import * as MaterialAPI from "../../api/MaterialAPI";
import SelectBox from "../../components/SelectBox";
const AddEditMaterial = ({ materialModal, resetMaterialModal }) => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.dhi.authUserReducer);
	const [isLoading, setIsLoading] = useState(false);
	const [colors, setColors] = useState([]);
	const fileInput = useRef();
	const [materialImage, setMaterialImage] = useState("");

	const fetchMaterialColors = useCallback(async () => {
		await MaterialAPI.getMaterialColors().then(({data}) => {
			if (data) {
				let optionColors =
					data.map((item) => ({
						label: item.name,
						value: item.id,
						color: item.color,
					})) || [];
				setColors(optionColors);
			}
		});
	}, []);
	const fetchEditMaterial = async () => {
		setIsLoading(true);
		await MaterialAPI.getOne(materialModal.id).then(({data}) => {
			let selectedColor = {};
			if (data?.material_color) {
				selectedColor.value = data?.material_color.id;
				selectedColor.label = data?.material_color.name;
				selectedColor.color = data?.material_color.color;
			}
            data.tags = data.tags?(data.tags.split(",").map(item=>({label:item,value:item}))):null;
			setValue("name", data.name);
			setValue("color", selectedColor);
			setValue("tags", data.tags);
			setValue("price", data.price);
			setValue("status", data.status);
			if (data?.thumbnail) {
				setMaterialImage(process.env.REACT_APP_UPLOAD_BASE_URL+data.thumbnail);
			}
			setIsLoading(false);
		});
	};
	useEffect(() => {
		fetchMaterialColors();
		if (materialModal.id) {
			fetchEditMaterial();
		}
	}, []);

	/** Yup validations schema used for form validation **/
	let defaultMaterialValue = {
		name: "",
		color: "",
		tags: [],
		price: "",
		status: "Active",
		material: "",
	};
	const materialSchema = yup.object().shape({
		name: yup.string().trim().required("Please enter material name!"),
		color: yup
			.object()
			.shape({
				label: yup.string().required("color is required (from label)"),
				value: yup.string().required("Please choose color!"),
			})
			.nullable() // for handling null value when clearing options via clicking "x"
			.required("Please choose color!"),
		price: yup.number().typeError("Please enter valid price!").positive("Price must be more than 0 (zero)"),
		status: yup.string().trim().required("Please select status!"),
	});
	const {
		register,
		handleSubmit,
		setValue,
		control,
		formState: { errors: userError },
		reset,
		setError,
		setFocus,
	} = useForm({
		mode: "onBlur",
		resolver: yupResolver(materialSchema),
		defaultValues: defaultMaterialValue,
	});

	const formSubmit = async (formData) => {
		formData = { ...formData, color: formData?.color?.value };
        // formData.tags = formData.tags?formData.tags.map(item=>item.value).join(','):"";
        formData.tags = formData.tags && formData.tags.length>0 ? JSON.stringify(formData.tags):null;
        if(!formData?.material){
            delete formData.material;
        }
        let refineFormData = Utils.getFormData(formData);
        // return false;
        setIsLoading(true);
		if (materialModal.action === "Edit") {
			await MaterialAPI.update(materialModal.id, refineFormData).then((res) => {
				resetMaterialModal(true);
				dispatch(
					showUpdatedToasterMessage({
						message: "Material update successfully.",
						type: "success",
					})
				);
			}).catch((error) => {
                if(error?.code===404){
                    setError("name", {
                        type: "custom",
                        message: error.errorMessage,
                    });
                    setFocus("name");
                }
                else {
					dispatch(
						showUpdatedToasterMessage({
							message: error?.errorMessage,
							type: "danger",
						})
					);
				}
            });
		} else {
			await MaterialAPI.create(refineFormData).then((res) => {
				resetMaterialModal(true);
				dispatch(
					showUpdatedToasterMessage({
						message: "Material add successfully.",
						type: "success",
					})
				);
			}).catch((error) => {
                if(error?.code===404){
                    setError("name", {
                        type: "custom",
                        message: error.errorMessage,
                    });
                    setFocus("name");
                }
                else {
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

	const handleFileInputChange = (e) => {
		let image = e.target.files[0];
		if (image) {
			Utils.getBase64Image(image)
				.then((result) => {
					setMaterialImage(result);
				})
				.catch((error) => {
					setMaterialImage("");
				});
		}
	};

	return (
		<CustomModal
			show={materialModal.show}
			isLoading={isLoading}
			onHide={resetMaterialModal}
			modalHeading={materialModal.title}
			size="lg"
			saveBtnText={materialModal.saveBtnText}
			onSaveCallback={handleSubmit(formSubmit)}
		>
			<Form onSubmit={handleSubmit(formSubmit)} autoComplete="off">
				<Row className="row-cards">
					<Form.Group as={Col} className="mb-3">
						<span
							className="avatar avatar-xl bg-gold-lt"
							style={{
								backgroundImage: materialImage ? `url('${materialImage}')` : "none",
							}}
						>
							{!materialImage && <IconPhotoPlus stroke={1.5} size={16} />}
						</span>
						<Button
							variant="secondary"
							size="sm"
							// onClick={() => fileInput.current.click()}
							className="btn-icon position-absolute"
							style={{
								zIndex: 1,
								marginLeft: "-29px",
								marginTop: "83px",
							}}
						>
							<IconPencil stroke={1.5} size={16} />
						</Button>
						<input
							type="file"
							// ref={fileInput}
                            className="-d-none btn-icon position-absolute opacity-0"
                            style={{
								zIndex: 1,
                                width:"24px",
								marginLeft: "-29px",
								marginTop: "83px"
							}}
                            {...register("material")}
							onChange={handleFileInputChange}
							accept="image/png, image/gif, image/jpeg"
						/>
						{/* <input type="hidden" value={materialImage} {...register("material")} /> */}
					</Form.Group>
				</Row>
				<Row className="row-cards">
					<Form.Group as={Col} md="6">
						<Form.Label className="required">Material Name</Form.Label>
						<Form.Control
							type="text"
							className={`${userError.name && "is-invalid"}`}
							placeholder="Enter Material Name"
							{...register("name")}
						/>
						{userError.name && <Form.Text className="invalid-feedback">{userError.name.message}</Form.Text>}
					</Form.Group>
					<Form.Group as={Col} md="6" controlId="role">
						<Form.Label className="required">Choose Color</Form.Label>
						<Controller
							name="color"
							control={control}
							render={({ field }) => (
								<SelectBox
									{...field}
									showColor={true}
									isClearable
									isSearchable={true}
									options={colors}
									className={`form-control p-0 border-0 ${userError.color && "is-invalid"}`}
								/>
							)}
						/>
						{userError.color && <Form.Text className="invalid-feedback">{userError.color.message}</Form.Text>}
					</Form.Group>
					<Form.Group as={Col} md="12" controlId="tags">
						<Form.Label>Tags</Form.Label>
						<Controller
							name="tags"
							control={control}
							render={({ field }) => (
								<SelectBox
									{...field}
									isCreatable={true}
									isMulti
									isClearable
									noOptionsMessage={() => null}
									options={[]}
									className={`form-control p-0 border-0`}
								/>
							)}
						/>
					</Form.Group>
					<Form.Group as={Col} md="6" controlId="price">
						<Form.Label className="required">Price</Form.Label>
						<Form.Control
							type="number"
							className={`${userError.price && "is-invalid"}`}
							placeholder="Enter Price"
							{...register("price")}
						/>
						{userError.price && <Form.Text className="invalid-feedback">{userError.price.message}</Form.Text>}
					</Form.Group>
					<Form.Group as={Col} md="6" controlId="status">
						<Form.Label className="required">Status</Form.Label>
						<Form.Select
							aria-label="Status"
							className={`${userError.status && "is-invalid"}`}
							{...register("status")}
						>
							<option value="">Select</option>
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
						</Form.Select>
						{userError.status && <Form.Text className="invalid-feedback">{userError.status.message}</Form.Text>}
					</Form.Group>
				</Row>
			</Form>
		</CustomModal>
	);
};
export default AddEditMaterial;
