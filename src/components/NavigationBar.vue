<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getAuth, signOut} from 'firebase/auth';
  import router from '@/router';
  import { getFirestore, doc, getDoc } from 'firebase/firestore';

  const Name = ref(null);
  const userId = ref(null);
  
  const auth = getAuth();
  const db = getFirestore();

  onMounted(async () => {
    const storedUserId = localStorage.getItem('userId');
    
    if(storedUserId) {
      userId.value = storedUserId;

      // Fetch user data from Firestore
      const userDocRef = doc(db, 'Users', storedUserId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        Name.value = userData.FirstName || userData.Name.split(" ")[0] || 'User';
      } else {
        console.log('No such document!');
        Name.value = 'Unknown User';
      }

    } 
    else {
      userId.value = null;
      Name.value = null;
    }
  });

  const signOutUser = () => {
    signOut(auth).then(() => {
      console.log('User signed out successfully');
      router.push('/'); 
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
  };

</script>

<template>
  <nav 
    class="navbar navbar-expand-lg navbar-dark"
    id="nav-style"
  >
    <div class="container-fluid">
      <!-- Navbar Brand (optional, can be your logo or title) -->
      <!-- <a class="navbar-brand d-lg-none text-light" href="#">Menu</a> -->

      <!-- Toggler Button (hamburger for small screens) -->
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Collapsible Menu -->
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
          
          <li class="nav-item dropdown mx-2">
            <a class="nav-link dropdown-toggle text-light" href="#" id="healthDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Wellness Hub
            </a>
            <ul class="dropdown-menu" aria-labelledby="healthDropdown">
              <li><a class="dropdown-item" href="/appointmentBooking">Appointment Booking</a></li>
              <li><a class="dropdown-item" href="/maps">Closest Clinic</a></li>
              <li><a class="dropdown-item" href="/dosDonts">Dos And Don'ts</a></li>
              <li><a class="dropdown-item" href="/handlePeerPressure">Handle Pressure</a></li>
              <li><a class="dropdown-item" href="/symptomsChecker">Symptoms Checker</a></li>
            </ul>
          </li>

          <li class="nav-item dropdown mx-2">
            <a class="nav-link dropdown-toggle text-light" href="#" id="guidesDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Resources & Support
            </a>
            <ul class="dropdown-menu" aria-labelledby="guidesDropdown">
              <li><a class="dropdown-item" href="/learning">Learning Resources</a></li>
              <li><a class="dropdown-item" href="/genAISupport">Gen AI Support</a></li>
            </ul>
          </li>

          <li class="nav-item dropdown mx-2">
            <a class="nav-link dropdown-toggle text-light" href="#" id="projectDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Who we are
            </a>
            <ul class="dropdown-menu" aria-labelledby="projectDropdown">
              <li><a class="dropdown-item" href="/aboutUs">About Us</a></li>
            </ul>
          </li>

          <li class="nav-item dropdown mx-2">
            <a class="nav-link dropdown-toggle text-light" href="#" id="accountDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle" style="font-size: 1.1rem;"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
              <li><a class="dropdown-item" href="#">Welcome, {{ 'Guest' }}</a></li>
              <li><a class="dropdown-item" href="/profile">Profile</a></li>
              <li><a class="dropdown-item" href="/settings">Settings</a></li>
              <li><a class="dropdown-item" @click="signOutUser()">Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
  #nav-style {
    background: transparent !important; /* let header background show */
  }

  #nav-style .nav-link {
    color: var(--page-text) !important;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  #nav-style .nav-link:hover {
    color: var(--hover-accent) !important; /* golden hover effect */
  }

  /* Dropdown menu items hover */
  #nav-style .dropdown-item {
    transition: background-color 0.3s, color 0.3s; /* smooth transition */
    color: var(--card-text) !important;
    background-color: var(--card-bg);
  }

    /* Change background and text color on hover */
  #nav-style .dropdown-item:hover {
    background-color: var(--toggle-track); /* or any color you like */
    color: var(--hover-accent); /* text color on hover */
  }

  /* Toggler icon (hamburger) */
  .navbar-toggler-icon {
    filter: invert(1); /* makes it visible on dark background */
  }
</style>
