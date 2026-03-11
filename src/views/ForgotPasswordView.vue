<script setup>
    import Cover_Image from '/images/Cover_Image.png';
    import { getAuth, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
    import { onMounted, ref } from 'vue';
    import router from '@/router';
    import emailjs from "emailjs-com";
    import { getFirestore, doc, updateDoc, getDocs, query, collection, where } from "firebase/firestore";
    import { on } from 'form-data';

    const email = ref("");
    let successMessage = ref("");
    let errorMessage = ref("");
    let message = ref("");

    const errors = ref({ 
        email: "",
        password: ""
    });

    const clearMessages = () => {
        successMessage.value = "";
        errorMessage.value = "";
    };

    // Step 1: Verify Email and send OTP
    // Step 2: Verify OTP
    // Step 3: Reset the Password 
    let step = ref(1); 
    let newPassword = ref("");
    let generatedOtp = ref("");
    const db = getFirestore();
    let otpInput = ref("");
    let confirmPassword = ref("");
    let showPassword = ref(false);
    let showConfirmPassword = ref(false);

    // 1. Send OTP via EmailJS
    const checkEmailAndSendOtp = async () => {
        const errorMsg = validateEmail();
        if(errorMsg) {
            errorMessage.value = errorMsg;
            return;
        }

        // Generate Random 6 digit OTP.
        generatedOtp.value = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            // Query Firestore by email
            const q = query(collection(db, "Users"), where("Email", "==", email.value));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                errorMessage.value = "This email is not registered.";
                return;
            }

            let name = "";
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const firstName = userData.FirstName || "";
                const lastName = userData.LastName || "";
                name = `${firstName} ${lastName}`.trim();
            });

            await fetch("https://sendotp-gjd6kkfwjq-uc.a.run.app", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.value,
                    name: name,
                    otp: generatedOtp.value,
                }),
            });

            step.value = 2;
            clearMessages();
            successMessage.value = "OTP has been sent to your email.";
            errorMessage.value = "";
            
        } catch (error) {
            errorMessage.value = "Error sending OTP.";
            successMessage.value = "";
            console.error(error);
        }
    };

    // 2. Verify OTP
    const verifyOTP = async () => {
        if (otpInput.value === generatedOtp.value) {
            step.value = 3;
            clearMessages();
            successMessage.value = "OTP verified!";
            errorMessage.value = "";
        } else {
            errorMessage.value = "Invalid OTP.";
            successMessage.value = "";
        }
    };

    // 3. Reset password in Firebase
    const resetPassword = async () => {
        const errorMsg = validatePassword();
        if (errorMsg) {
            errorMessage = errorMsg;
            return;
        }

        if (newPassword.value !== confirmPassword.value) {
            errorMessage.value = "Passwords do not match.";
            return;
        }

        try {
            const auth = getAuth();

            // Send password reset email first
            sendPasswordResetEmail(auth, email.value)
                .then(async () => {

                    console.log("Email value is in forgot password function: " + email.value)

                    // Update Firestore user document (optional but your logic keeps it)
                    const q = query(collection(db, "Users"), where("Email", "==", email.value));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const userDocRef = querySnapshot.docs[0].ref;
                        await updateDoc(userDocRef, {
                            Password: newPassword.value,
                            PasswordLastUpdated: new Date()
                        });
                    }

                    clearMessages();
                    successMessage.value = "Password reset email sent successfully! Please check your inbox/Spam box.";
                    errorMessage.value = "";
                    email.value = "";
                    otpInput.value = "";
                    newPassword.value = "";
                    confirmPassword.value = "";

                    // Redirect after few seconds
                    setTimeout(() => {
                        router.push('/');
                    }, 5000);

                })
                .catch((error) => {
                    console.error("Error sending reset email:", error);
                    errorMessage.value = "Failed to send password reset email. Please check your email address.";
                });

        } catch (err) {
            console.error("Unexpected error:", err);
            errorMessage.value = "An unexpected error occurred. Please try again later.";
        }
    };

    const validateEmail = () => {
        if (!email.value) {
            return "Email is required";
        }

        const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegexPattern.test(email.value)) {
            return "Please enter a valid email Id";
        }

        return null;
    };

    const validatePassword = () => {
        const password = newPassword.value;
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password)
        const hasSpecialChar = /[!@#$%^&*().,?":{}|<>]/.test(password)
        if(!password) {
            return "Password is required"
        } else if(password.length < minLength) {
            return `Password must be at least ${minLength} characters long.`; 
        } else if (!hasUppercase) {
            return `Password must contain at least 1 uppercase letter.`;
        } else if (!hasLowercase) {
            return `Password must contain at least 1 lowercase letter.`;
        } else if (!hasNumber) {
            return `Password must contain at least 1 number.`;
        } else if (!hasSpecialChar) {
            return `Password must contain at least 1 Special Character.`;
        } else {
            return null
        }
    };

    onMounted(() => {
        document.title = "Forgot Password | Eat Smart Hub";
    });

</script>

<template>
    <div
        :style="{
            backgroundImage: `url(${Cover_Image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100dvh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }"
    >
        <div id="form-style">
            <div class="container mt-8">
                <div class="row">
                    <h2 id="h2-style" class="text-center mb-4 p-3">Forgot Password</h2>

                    <!-- Step 1: Enter Email -->
                    <form v-if="step === 1" @submit.prevent="checkEmailAndSendOtp">
                        <div class="row mb-3">
                            <label for="email" class="col-sm-3 col-form-label">Email:</label>
                            <div class="col-sm-9">
                                <input
                                    type="text"
                                    id="email"
                                    class="form-control"
                                    placeholder="Enter your registered email"
                                    v-model="email"
                                    required
                                    @input="clearMessages"
                                />
                            </div>
                        </div>
                        
                        <div v-if="message" class="alert alert-info mt-3">{{ message }}</div>
                        <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
                        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

                        <div class="text-center">
                            <button type="submit" class="btn btn-primary me-2 mb-2">
                                Send OTP
                            </button>
                        </div>
                    </form>

                    <!-- Step 2: Enter OTP -->
                    <form v-if="step === 2" @submit.prevent="verifyOTP">
                        <div class="row mb-3">
                            <label for="otp" class="col-sm-3 col-form-label">OTP:</label>
                            <div class="col-sm-9">
                                <input
                                    type="text"
                                    id="otp"
                                    class="form-control"
                                    placeholder="Enter OTP from email"
                                    v-model="otpInput"
                                    required
                                    @input="clearMessages"
                                />
                            </div>
                        </div>

                        <div v-if="message" class="alert alert-info mt-3">{{ message }}</div>
                        <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
                        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

                        <div class="text-center">
                            <button type="submit" class="btn btn-primary me-2 mb-2">
                                Verify OTP
                            </button>
                        </div>
                    </form>

                    <!-- Step 3: Reset Password -->
                    <form v-if="step === 3" @submit.prevent="resetPassword">
                        <div class="row mb-3">
                            <label for="password" class="col-sm-3 col-form-label">New Password:</label>
                            <div class="col-sm-9 input-group">
                                <input
                                    :type="showPassword ? 'text' : 'password'"
                                    id="password"
                                    class="form-control"
                                    placeholder="Enter new password"
                                    v-model="newPassword"
                                    required
                                    @input="clearMessages"
                                />
                                <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
                                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                </button>
                                <div v-if="errors.email" class="text-danger">{{ errors.password }}</div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <label for="confirmPassword" class="col-sm-3 col-form-label">Confirm Password:</label>
                            <div class="col-sm-9 input-group">
                                <input
                                    :type="showConfirmPassword ? 'text' : 'password'"
                                    id="confirmPassword"
                                    class="form-control"
                                    placeholder="Confirm new password"
                                    v-model="confirmPassword"
                                    required
                                />
                                <button type="button" class="btn btn-outline-secondary" @click="showConfirmPassword = !showConfirmPassword">
                                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                </button>
                            </div>
                        </div>

                        <div v-if="message" class="alert alert-info mt-3">{{ message }}</div>
                        <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
                        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

                        <div class="text-center">
                            <button type="submit" class="btn btn-primary me-2 mb-2">
                                Reset Password
                            </button>
                        </div>
                    </form>

                    <!-- Back to Login -->
                    <div class="text-center">
                        <p id="SignUp-style">
                            Remembered your password?
                            <router-link to="/" class="link-style text-decoration-none">
                                Back to Login
                            </router-link>
                        </p>
                    </div>
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

    .col-form-label {
        font-weight: 600;
    }

    .btn-primary {
        background-color: var(--primary-btn-bg);
        color: var(--primary-btn-text);
        border: none;
    }

    .link-style {
        color: var(--accent);
        font-weight: 600;
    }

    .form-control {
        background-color: var(--input-bg);
        color: var(--input-text);
        transition: border-color 0.35s ease, background-color 0.35s ease, color 0.35s ease;
    }

    .form-control::placeholder {
        color: var(--input-text);
        opacity: 0.7;
    }

    #SignUp-style {
        color: var(--section-text);
        font-weight: 600;
    }

    #h2-style {
        color: var(--section-text);
        padding: 10px;
    }
</style>
