import { IconUser } from "@tabler/icons-react";

class Utils {
    static haveSameData = (obj1, obj2)=>{
        const obj1Length = Object.keys(obj1).length;
        const obj2Length = Object.keys(obj2).length;
  
        if (obj1Length === obj2Length) {
            return Object.keys(obj1).every(
                key => obj2.hasOwnProperty(key)
                    && obj2[key] === obj1[key]);
        }
        return false;
    }
    static getAcronym = (name)=>{
        let res = '';
        name = name.split(' ');
        if(name.length<2){
            res =  (name[0][0]||"")+(name[0][1]||"");
        }
        else{
            let i=0;
            name.forEach(item => {
                const [char] = item;
                i++;
                if(i<3){
                    res += char;
                }
            });
        }
        return res.toUpperCase();
    }
    static priceFormat = (price)=>{
        const dollarUS = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits:0
        });
        return dollarUS.format(price);
    }
    static getBase64Image = (file) => {
		return new Promise((resolve) => {
			let baseURL = "";
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				baseURL = reader.result;
				resolve(baseURL);
			};
		});
	};
    static getFormData = (object)=>{
        // return Object.entries(o).reduce((d,e) => (d.append(...e),d), new FormData())
        const formData = new FormData();
        Object.keys(object).forEach(key => {
            if(key==="avatar" || key==="material" || key==="models" ||  key==="thumbnail"){
                formData.append(key,object[key][0]);
            }
            else{
                formData.append(key,object[key]);
            }
            // formData.append(key, (key==="avatar" || key==="material")?object[key][0]:object[key])
        });
        return formData;
    }
}
export default Utils;