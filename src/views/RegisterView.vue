<script setup>
    import Cover_Image from '/images/Cover_Image.png';
    import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth';
    import { useRouter } from 'vue-router';
    import { onMounted, ref } from 'vue';
    import router from '@/router';
    import { getFirestore, doc, setDoc } from "firebase/firestore";

    const registerFormData = ref({
        fullname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        isAustralian: false,
        gender: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: ''
    });

    const errorMessage = ref("");
    const successMessage = ref("");

    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    const db = getFirestore();

    const togglePassword = () => {
        showPassword.value = !showPassword.value;
    };

    const toggleConfirmPassword = () => {
        showConfirmPassword.value = !showConfirmPassword.value;
    };

    const register = async (registerFormDataValues) => {
        try {
            const auth = getAuth();

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                registerFormDataValues.email,
                registerFormDataValues.password
            );

            const user = userCredential.user;
            let AustralianResident = "";

            if (registerFormDataValues.isAustralian) {
                AustralianResident = "Yes";
            } else {
                AustralianResident = "No";
            }

            await setDoc(doc(db, "Users", user.uid), {
                FirstName: registerFormDataValues.firstname || "",
                LastName: registerFormDataValues.lastname || "",
                Email: registerFormDataValues.email || "",
                Password: registerFormDataValues.password || "",
                Gender: registerFormDataValues.gender || "",
                isAustralian: AustralianResident ?? "No",
                PhoneNumber: registerFormDataValues.phoneNumber || "",
                Address: registerFormDataValues.address || "",
                DateOfBirth: registerFormDataValues.dateOfBirth || "",
                PasswordChanged: false,
                GoogleSignedIn: "No",
                Role: "User"
            });

            successMessage.value = "Registration successful! Redirecting to login...";
            errorMessage.value = "";

            setTimeout(() => {
                router.push('/');
            }, 4000);
            
        } catch (error) {
            console.log("Firebase Register Error", error);
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage.value = "Email is already in use. Please try with a different email.";
                    break;
                case 'auth/invalid-email':
                    errorMessage.value = "Invalid email format. Please check and try again.";
                    break;
                case 'auth/weak-password':
                    errorMessage.value = "Password is too weak. Please choose a stronger password.";
                    break;
                default:
                    errorMessage.value = "Registration failed. Please try again.";
            }
        }
    };

    const submitRegisterationForm = async () => {
        validateFirstName(true);
        validateLastName(true);
        validateEmail(true);
        validatePassword(true);
        validateConfirmPassword(true);
        validateGender(true);
        validateDateOfBirth(true);
        validatePhoneNumber(true);
        validateAddress(true);
        
        if(!errors.value.email
        && !errors.value.password
        && !errors.value.firstname
        && !errors.value.lastname
        && !errors.value.confirmPassword
        && !errors.value.gender
        && !errors.value.dateOfBirth
        && !errors.value.phoneNumber
        && !errors.value.address
        ) {
            const registerFormDataSnapshot = { ...registerFormData.value };

            await register(registerFormDataSnapshot);
            clearForm();
        }
    }

    const clearForm = () => {
        registerFormData.value = {
            firstname: '',
            lastname: '',
            email: '',
            password: '',
            confirmPassword: '',
            isAustralian: false,
            gender: '',
            phoneNumber: '',
            address: '',
            dateOfBirth: ''
        };
    };

    const errors = ref ({
        firstname: null,
        lastname: null,
        email: null,
        password: null,
        confirmPassword: null,
        gender: null,
        phoneNumber: null,
        address: null,
        dateOfBirth: null
    });

    const validateFirstName = (blur) => {
        if(!registerFormData.value.firstname) {
            if (blur) errors.value.firstname = "First Name is required";
        } else if(registerFormData.value.firstname.length < 3) {
            if (blur) errors.value.firstname = "First Name must be at least 3 characters";
        } else if (/\d/.test(registerFormData.value.firstname)) {
            if (blur) errors.value.firstname = "First Name cannot contain numbers";
        } else {
            errors.value.firstname = null
        }
        successMessage.value = null;
        errorMessage.value = null;
    };

    const validateLastName = (blur) => {
        if (/\d/.test(registerFormData.value.lastname)) {
            if (blur) errors.value.lastname = "Last Name cannot contain numbers";
        } else {
            errors.value.lastname = null
        }

        successMessage.value = null;
        errorMessage.value = null;
    };

    const validateEmail = (blur) => {
        if(!registerFormData.value.email) {
            if (blur) errors.value.email = "Email is required";
        } else {
            const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegexPattern.test(registerFormData.value.email)) {
                if (blur) errors.value.email = "Please enter a valid email Id";
            } else {
                errors.value.email = null; 
            }
        }
        successMessage.value = null;
        errorMessage.value = null;
    };

    const validatePassword = (blur) => {
        const password = registerFormData.value.password;
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password)
        const hasSpecialChar = /[!@#$%^&*().,?":{}|<>]/.test(password)

        if(!password) {
            if (blur) errors.value.password = "Password is required"
        } else if(password.length < minLength) {
            if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`; 
        } else if (!hasUppercase) {
            if (blur) errors.value.password = `Password must contain at least 1 uppercase letter.`;
        } else if (!hasLowercase) {
            if (blur) errors.value.password = `Password must contain at least 1 lowercase letter.`;
        } else if (!hasNumber) {
            if (blur) errors.value.password = `Password must contain at least 1 number.`;
        } else if (!hasSpecialChar) {
            if (blur) errors.value.password = `Password must contain at least 1 Special Character.`;
        } else {
            errors.value.password = null
        }
        successMessage.value = null;
        errorMessage.value = null;
    };

    const validateConfirmPassword = (blur) => {
        if(registerFormData.value.confirmPassword === "") {
            if (blur) errors.value.confirmPassword = `Confirm Password is required`;
        }
        else if(registerFormData.value.confirmPassword != registerFormData.value.password){
            if (blur) errors.value.confirmPassword = `Passwords do not match with each other`;
        } else {
            errors.value.confirmPassword = null;
        }
        successMessage.value = null;
        errorMessage.value = null;
    };

    const validateGender = (blur) => {
        if (!registerFormData.value.gender) {
            if (blur) errors.value.gender = "Please select your gender.";
        } else {
            errors.value.gender = null;
        }

        successMessage.value = null;
        errorMessage.value = null;
    };

    const validateDateOfBirth = (blur) => {
        if(!registerFormData.value.dateOfBirth) {
            if (blur) errors.value.dateOfBirth = "Date of Birth is required";
        } else {
            const dobRegexPattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/;

            if (!dobRegexPattern.test(registerFormData.value.dateOfBirth)) {
                if (blur) errors.value.dateOfBirth = "Please enter a valid date of birth in MM/DD/YYYY format";
            } else {
                errors.value.dateOfBirth = null; 
            }
        }
        successMessage.value = null;
        errorMessage.value = null;
    };

    const validatePhoneNumber = (blur) => {
        if(!registerFormData.value.phoneNumber) {
            if (blur) errors.value.phoneNumber = "Phone Number is required";
        } else {
            const phoneRegexPattern = /^\+61\s?[1-9]\s?\d{4}\s?\d{4}$/;

            if (!phoneRegexPattern.test(registerFormData.value.phoneNumber)) {
                if (blur) errors.value.phoneNumber = "Please enter a valid Australian phone number starting with +61";
            } else {
                errors.value.phoneNumber = null; 
            }
        }
        successMessage.value = null;
        errorMessage.value = null;
    };

    const validateAddress = (blur) => {
        if(!registerFormData.value.address) {
            if (blur) errors.value.address = "Address is required";
        } else if(registerFormData.value.address.length < 10) {
            if (blur) errors.value.address = "Address must be at least 10 characters";
        } else {
            errors.value.address = null
        }
        successMessage.value = null;
        errorMessage.value = null;
    };

    onMounted(() => {
        document.title = "Sign Up | Eat Smart Hub";
    });

</script>

<template>
    <div :style="{ 
        backgroundImage: `url(${Cover_Image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }">
        <div id="form-style">
            <div class="container mt-8">
                <div class="row">
                    <h2 id="h2-style" class="text-center mb-4 p-3"> 
                        Please enter your details to Register
                    </h2>

                    <form @submit.prevent = "submitRegisterationForm">
                        <div class="row mb-3">
                            <div class="col-sm-6 d-flex align-items-center">
                                <label for="firstname" class="col-form-label me-2 mb-0" style="width: 120px"> First Name: </label> 
                                <input 
                                    type="text" id="firstname" class="form-control" 
                                    placeholder="Please enter your first name"
                                    @blur="() => validateFirstName(true)"
                                    @input="() => validateFirstName(false)"
                                    v-model = "registerFormData.firstname">
                            </div>

                            <div class="col-sm-6 d-flex align-items-center">
                                <label for="lastname" class="col-form-label me-2 mb-0" style="width: 120px;"> Last name: </label> 
                                <input 
                                    type="text" id="lastname" class="form-control" 
                                    placeholder="Please enter your last name"
                                    @blur="() => validateLastName(true)"
                                    @input="() => validateLastName(false)"
                                    v-model = "registerFormData.lastname">
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-sm-6">
                                <div v-if="errors.firstname" class="text-danger">{{ errors.firstname }}</div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <label for="email" class="col-sm-3 col-form-label"> Email: </label> 
                            <div class="col-sm-9">
                                <input 
                                    type="email" id="email" class="form-control" 
                                    placeholder="Please enter your email"
                                    @blur="() => validateEmail(true)"
                                    @input="() => validateEmail(false)"
                                    v-model = "registerFormData.email">
                                    <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-sm-5 d-flex flex-column justify-content-center mb-3 mb-sm-0">
                                <div class="form-check d-flex align-items-center mb-0">
                                    <input type="checkbox" class="form-check-input" id="isAustralian" 
                                        name="isAustralian"
                                        v-model="registerFormData.isAustralian"> &nbsp; &nbsp;
                                    <label class="form-check-label" for="isAustralian">Australian Resident? </label>
                                </div>
                            </div>

                            <div class="col-sm-7">
                                <div class="d-flex align-column">
                                    <label for="gender" class="form-label mb-0 me-2">Gender: </label>
                                    <select class="form-select" id="gender" 
                                        @blur="() => validateGender(true)"
                                        @change="() => validateGender(false)"
                                        v-model="registerFormData.gender">
                                        <option value="">Please Select</option>
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                
                                <div v-if="errors.gender" class="text-danger">
                                    {{ errors.gender }}
                                </div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <label for="dateOfBirth" class="col-sm-3 col-form-label"> Date of Birth: </label> 
                            <div class="col-sm-9">
                                <input 
                                    type="text" id="dateOfBirth" class="form-control" 
                                    placeholder="DD/MM/YYYY"
                                    @blur="() => validateDateOfBirth(true)"
                                    @input="() => validateDateOfBirth(false)"
                                    v-model = "registerFormData.dateOfBirth">
                                    <div v-if="errors.dateOfBirth" class="text-danger">{{ errors.dateOfBirth }}</div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <label for="phoneNumber" class="col-sm-3 col-form-label"> Phone Number: </label> 
                            <div class="col-sm-9">
                                <input 
                                    type="text" id="phoneNumber" class="form-control" 
                                    placeholder="+61 X XXXX XXXX"
                                    @blur="() => validatePhoneNumber(true)"
                                    @input="() => validatePhoneNumber(false)"
                                    v-model = "registerFormData.phoneNumber">
                                    <div v-if="errors.phoneNumber" class="text-danger">{{ errors.phoneNumber }}</div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <label for="address" class="col-sm-3 col-form-label"> Address: </label> 
                            <div class="col-sm-9">
                                <input 
                                    type="text" id="address" class="form-control" 
                                    placeholder="House No, Street, Suburb, State, Postcode"
                                    @blur="() => validateAddress(true)"
                                    @input="() => validateAddress(false)"
                                    v-model = "registerFormData.address">
                                    <div v-if="errors.address" class="text-danger">{{ errors.address }}</div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-sm-6 d-flex align-items-center">
                                <label for="password" class="col-form-label me-2 mb-0" style="width: 100px;"> Password: </label> 
                                <div class="position-relative">
                                    <input 
                                        :type="showPassword ? 'text' : 'password'"
                                        id="password" class="form-control pe-5" 
                                        placeholder="Please enter password"
                                        @blur="() => validatePassword(true)"
                                        @input="() => validatePassword(false)"
                                        v-model = "registerFormData.password"
                                    >

                                    <i 
                                        class="bi" 
                                        :class="showPassword ? 'bi-eye-slash' : 'bi-eye'" 
                                        @click="togglePassword"
                                        style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); cursor: pointer;">
                                    </i>
                                    
                                </div>
                            </div>

                            <div class="col-sm-6 d-flex align-items-center">
                                <label for="confirmPassword" class="col-form-label me-2 mb-0" style="width: 150px;"> Confirm Password: </label> 
                                <div class="position-relative">
                                    <input 
                                        :type="showConfirmPassword ? 'text' : 'password'" 
                                        id="confirmPassword" class="form-control pe-5" 
                                        placeholder="Please enter confirm password"
                                        @blur="() => validateConfirmPassword(true)"
                                        @input="() => validateConfirmPassword(false)"
                                        v-model = "registerFormData.confirmPassword"
                                    >

                                    <i 
                                        class="bi" 
                                        :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'" 
                                        @click="toggleConfirmPassword"
                                        style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); cursor: pointer;">
                                    </i>
                                </div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-sm-6">
                                <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
                            </div>
                            <div class="col-sm-6">
                                <div v-if="errors.confirmPassword" class="text-danger">{{ errors.confirmPassword }}</div>
                            </div>
                        </div>

                        <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
                        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

                        <div class="text-center">
                            <button type="submit" class="btn btn-primary me-2 mb-2">Submit</button>
                            <button type="button" class="btn btn-secondary mb-2" @click="clearForm">Clear</button>
                        </div>

                        <div id="login-style" class="text-center mt-3">
                            <p> Already have an account? 
                                <router-link to="/" class="link-style text-decoration-none"> Login here </router-link>
                            </p>
                        </div>

                    </form>
                </div>
            </div>
        </div> 
    </div>
</template>

<style scoped>
    #form-style {
        background-color: var(--section-bg); 
        max-width: 70%; 
        border-radius: 20px; 
        color: var(--section-text);
        font-weight: bold;
        padding: 20px;
        margin-top: 30px;
        margin-bottom: 30px;
    }

    #login-style {
        color: var(--section-text);
        font-weight: 600;
    }

    .link-style {
        color: var(--accent);
        font-weight: 600;
    }

    .col-form-label, .form-label, .form-check-label {
        font-weight: 600;
    }

    .btn-primary {
        background-color: var(--primary-btn-bg);
        color: var(--primary-btn-text);
        border: none;
    }

    .btn-secondary {
        background-color: var(--secondary-btn-bg);
        color: var(--secondary-btn-text);
        border: none;
    }

    .form-control, .form-select, .form-check-input {
        border: 1px solid var(--input-border);
        background-color: var(--input-bg);
        color: var(--input-text);
        transition: border-color 0.35s ease, background-color 0.35s ease, color 0.35s ease;
    }

    .form-control:focus, .form-select:focus, .form-check-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 0.2rem rgba(12, 149, 235, 0.25);
        outline: none;
    }

    .form-control::placeholder, .form-select::placeholder, .form-check-input::placeholder {
        color: var(--input-text);
        opacity: 1;
    }

    #h2-style {
        color: var(--section-text);
        padding: 10px;
    }
</style>

