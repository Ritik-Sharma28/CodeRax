import validator from "validator";

export const validate = (data) => {

    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some Field Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");

}

export const validateStrongPassword = (password) => {
    if (!password || typeof password !== "string")
        throw new Error("Password is required");

    if (!validator.isStrongPassword(password))
        throw new Error("Weak Password");
};
