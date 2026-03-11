<script setup>
    import Cover_Image from '/images/Cover_Image.png';
    import {getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
    import { getFirestore, doc, setDoc, getDoc, collection, where, getDocs, query } from "firebase/firestore";
    import { useRouter } from 'vue-router';
    import { ref, onMounted } from 'vue';
    import router from '@/router';

    const signInFormData = ref({
        email: '',
        password: ''
    });

    const message = ref("");
    const rememberMe = ref(false);

    const showPassword = ref(false);

    const togglePassword = () => {
        showPassword.value = !showPassword.value;
    };

    const signIn = async (signInFormDataValues) => {
        try {
            const auth = getAuth();
            const db = getFirestore();

            let role = null;
            
            const enteredEmail = signInFormDataValues.email;
            const enteredPassword = signInFormDataValues.password;

            // Find the user document by email
            const usersRef = collection(db, "Users");
            const q = query(usersRef, where("Email", "==", enteredEmail));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                message.value = "User not found. Please register.";
                return;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            //const userId = userDoc.id;

            const userCredential = await signInWithEmailAndPassword(
                auth,
                enteredEmail,
                enteredPassword
            );

            role = userData.Role;
            localStorage.setItem('userId', userCredential.user.uid);
            localStorage.setItem('userEmail', enteredEmail);

            if (rememberMe.value) {
                localStorage.setItem("rememberedEmail", enteredEmail);
                localStorage.setItem("rememberedPassword", enteredPassword)
            } else {
                localStorage.removeItem("rememberedEmail");
                localStorage.removeItem("rememberedPassword");
            }

            router.push('/dashboard');
            
        } catch (error) {
            console.log("Firebase Sign-In Error", error);
            switch(error.code) {
                case 'auth/user-not-found':
                    message.value = "User not found. Please register yourself.";
                    break;
                case 'auth/wrong-password':
                    message.value = "Incorrect password. Please try again.";
                    break;
                case 'auth/invalid-email':
                    message.value = "Invalid email format.";
                    break;
                default:
                    message.value = "Email or Password is incorrect. Please try again. Or Sign up if you are a new user.";
            }
        }
    };

    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();
        const db = getFirestore();

        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;

                const userRef = doc(db, "Users", user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        Name: user.displayName,
                        Email: user.email,
                        Role: "User",
                        GoogleSignedIn: "Yes"
                    });
                } else {
                    await setDoc(
                        userRef,
                        { lastLogin: new Date() },
                        { merge: true }
                    );
                }

                localStorage.setItem('userId', user.uid);
                localStorage.setItem('userEmail', user.email);
                router.push('/dashboard');
            })
            .catch((error) => {
                console.log("Google Sign-In Error", error);
                message.value = "Google Sign-In failed. Please try again.";
            });
    };

    const submitSignInForm = async () => {
        validateEmail(true);
        validatePassword(true);

        if(!errors.value.email
        && !errors.value.password
        ) {
            const signInFormDataSnapshot = { ...signInFormData.value };

            await signIn(signInFormDataSnapshot);
            clearForm();
        }
    }

    onMounted(() => {
        document.title = "Sign In | Eat Smart Hub";
        const savedEmail = localStorage.getItem("rememberedEmail");
        const savedPassword = localStorage.getItem("rememberedPassword");
        if (savedEmail) {
            signInFormData.value.email = savedEmail;
            signInFormData.value.password = savedPassword;
            rememberMe.value = true;
        }
    });

    const clearForm = () => {
        signInFormData.value = {
            email: '',
            password: ''
        };
    };

    const errors = ref({
        email: null,
        password: null
    })

    const validateEmail = (blur) => {
        if(!signInFormData.value.email) {
            if (blur) errors.value.email = "Email is required"
        } else {
            const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegexPattern.test(signInFormData.value.email)) {
                if (blur) errors.value.email = "Please enter a valid email Id";
            } else {
                errors.value.email = null; 
            }
        }
        message.value = null;
    };

    const validatePassword = (blur) => {
        if(!signInFormData.value.password) {
            if (blur) errors.value.password = "Password is required"
        } else {
            errors.value.password = null
        }
        message.value = null;
    };

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
                        Please Sign In 
                    </h2>

                    <form @submit.prevent = "submitSignInForm">
                        <div class="row mb-3">
                            <label for="email" class="col-sm-3 col-form-label"> Email: </label> 
                            <div class="col-sm-9">
                                <input 
                                    type="text" id="email" class="form-control" 
                                    placeholder="Please enter your email Id"
                                    @blur="() => validateEmail(true)"
                                    @input="() => validateEmail(false)"
                                    v-model = "signInFormData.email">
                                    <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <label for="password" class="col-sm-3 col-form-label"> Password: </label>
                            <div class="col-sm-9">
                                <div class="position-relative">

                                    <input :type="showPassword ? 'text' : 'password'" 
                                    id="password" class="form-control" 
                                    placeholder="Please enter your password"
                                    @blur="() => validatePassword(true)"
                                    @input="() => validatePassword(false)"
                                    v-model="signInFormData.password">

                                    <i 
                                        class="bi" 
                                        :class="showPassword ? 'bi-eye-slash' : 'bi-eye'" 
                                        @click="togglePassword"
                                        style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); cursor: pointer;">
                                    </i>

                                </div>

                                <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
                            </div>
                        </div>

                        <div v-if="message" class="alert alert-danger mt-3">{{ message }}</div>

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="form-check mb-0">
                                <input class="form-check-input" type="checkbox" id="rememberMe" v-model="rememberMe">
                                <label class="form-check-label" for="rememberMe">
                                    Remember Me
                                </label>
                            </div>

                            <div class="mb-0">
                                <router-link to="/forgotPassword" class="link-style text-decoration-none">
                                    Forgot Password
                                </router-link>
                            </div>
                        </div>

                        <div class="text-center">
                            <p id="SignUp-style">
                                Dont have an Account? Please  
                                <router-link to="/register" class="link-style text-decoration-none">
                                    sign up here.
                                </router-link>
                            </p>
                        </div> 

                        <div class="text-center">
                            <button type="submit" class="btn btn-primary me-2 mb-2">Submit</button>
                        </div>

                        <div class="text-center">
                            <button type="button" 
                                class="btn btn-primary border" 
                                @click="signInWithGoogle"
                            >
                                <i class="bi bi-google" style="color: white;"></i>
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped> 
    #form-style {
        background: var(--section-bg);
        color: var(--section-text);
        position: relative;
        max-width: 70%; 
        border-radius: 20px;
        padding: 20px;
    }

    .form-check-label, .col-form-label {
        font-weight: 600;
    }

    .link-style {
        color: var(--accent);
        font-weight: 600;
    }

    .btn-primary {
        background-color: var(--primary-btn-bg);
        color: var(--primary-btn-text);
        border: none;
    }

    .bi {
        color: var(--circle-bg);
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

