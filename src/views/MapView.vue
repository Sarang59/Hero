<script setup>
    import { ref, onMounted, nextTick } from "vue";
    import Header from '../components/Header.vue';
    import Footer from '../components/Footer.vue';
    import mapboxgl from "mapbox-gl";
    import "mapbox-gl/dist/mapbox-gl.css";
    import FloatingControls from "@/components/FloatingControls.vue";
    import { getFirestore, collection, getDocs } from "firebase/firestore";
    import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage";
    import SafeContent from "@/components/SafeContent.vue";

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

    const db = getFirestore();
    const storage = getStorage();

    const userCoords = ref(null);
    const experts = ref([]);
    const loading = ref(true);
    const errorMsg = ref("");

    const tripInfo = ref({
        origin: "",
        destination: "",
        distance: "",
        duration: {
            driving: "",
            walking: "",
            cycling: ""
        }
    });

    // Get current location
    const fetchUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject("Geolocation not supported");
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
                () => reject("Unable to retrieve your location")
            );
        });
    };

    const fetchExperts = async () => {
        try {
            const snapshot = await getDocs(collection(db, "WellnessExperts"));
            const fetchedExperts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Get photo URLs
            for (const expert of fetchedExperts) {
                if (expert.PhotoLink) {
                    try {
                        const imgRef = storageRef(storage, expert.PhotoLink);
                        expert.PhotoURL = await getDownloadURL(imgRef);
                    } catch {
                        expert.PhotoURL = "https://via.placeholder.com/400x200?text=No+Image";
                    }
                } else {
                    expert.PhotoURL = "https://via.placeholder.com/400x200?text=No+Image";
                }
            }

            // Compute distance & duration to user
            const expertsWithDistance = [];

            for (const expert of fetchedExperts) {

                const geoRes = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                        expert.Location
                    )}.json?access_token=${mapboxgl.accessToken}`
                );

                const geoData = await geoRes.json();
                if (!geoData.features?.length) continue;

                const destCoords = geoData.features[0].geometry.coordinates;

                const modes = ["driving", "walking", "cycling"];
                const durations = {};
                let distanceKm = "";

                for (const mode of modes) {
                    const dirRes = await fetch(
                        `https://api.mapbox.com/directions/v5/mapbox/${mode}/${userCoords.value[0]},${userCoords.value[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
                    );
                    const dirData = await dirRes.json();
                    if (dirData.routes?.length) {
                        durations[mode] = Math.ceil(dirData.routes[0].duration / 60) + " min";
                        if (!distanceKm) distanceKm = (dirData.routes[0].distance / 1000).toFixed(2) + " km";
                    } else durations[mode] = "N/A";
                }

                expertsWithDistance.push({ ...expert, destCoords, durations, distanceKm });
            }

            // Sort by nearest distance
            experts.value = expertsWithDistance.sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));

        } catch (err) {
            console.error(err);
            errorMsg.value = "Error fetching wellness experts.";
        } finally {
            loading.value = false;
        }
    };

    // Initialize small map for each expert showing route
    const initExpertMap = async (expert) => {
        if (!expert.destCoords || !userCoords.value) return;
        await nextTick();

        const containerId = `map-${expert.id}`;
        const mapInstance = new mapboxgl.Map({
            container: containerId,
            style: "mapbox://styles/mapbox/streets-v12",
            center: userCoords.value,
            zoom: 12,
            interactive: false
        });

        mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Wait until the map has loaded before drawing route
        mapInstance.on("load", async () => {
            // Add markers
            new mapboxgl.Marker({ color: "blue" })
                .setLngLat(userCoords.value)
                .setPopup(new mapboxgl.Popup().setText("You are here"))
                .addTo(mapInstance);

            new mapboxgl.Marker({ color: "red" })
                .setLngLat(expert.destCoords)
                .setPopup(new mapboxgl.Popup().setText(expert.Clinic))
                .addTo(mapInstance);

            // Fetch route data
            const routeRes = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords.value[0]},${userCoords.value[1]};${expert.destCoords[0]},${expert.destCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
            );
            const routeData = await routeRes.json();

            if (routeData.routes?.length) {
                const route = routeData.routes[0].geometry;

                // Add route once map is ready
                mapInstance.addSource("route", {
                    type: "geojson",
                    data: { type: "Feature", geometry: route }
                });

                mapInstance.addLayer({
                    id: "route",
                    type: "line",
                    source: "route",
                    layout: { "line-join": "round", "line-cap": "round" },
                    paint: { "line-color": "#007AFF", "line-width": 4 }
                });

                // Fit bounds to route
                const bounds = new mapboxgl.LngLatBounds();
                route.coordinates.forEach(coord => bounds.extend(coord));
                mapInstance.fitBounds(bounds, { padding: 50 });
            }
        });
    };

    const initAllExpertMaps = async () => {
        await nextTick(); // wait for DOM to render the divs
        experts.value.forEach(expert => {
            initExpertMap(expert);
        });
    };

    onMounted(async () => {
        document.title = "Maps & Directions | Eat Smart Hub";

        try {
            userCoords.value = await fetchUserLocation();
        } catch {
            userCoords.value = [144.9631, -37.8136]; // default Melbourne
        }

        await fetchExperts();
        initAllExpertMaps();
    });

</script>

<template>
    <Header />

    <div class="container py-5">
        <div class="mt-2 mb-4">
            <router-link to="/">
                <button class="btn btn-primary back-btn">
                    <i class="bi bi-arrow-left"></i> Back to Dashboard
                </button>
            </router-link>
        </div>

        <h2 class="text-center mb-5 fw-bold header">Nearest Wellness Clinics</h2>

        <div v-if="loading" class="loader-wrapper">
            <div class="loader"></div>
            <p>Loading experts...</p>
        </div>

        <div v-else-if="errorMsg" class="alert alert-danger text-center">{{ errorMsg }}</div>

        <div v-else class="row g-4">
            <div v-for="expert in experts" :key="expert.id" class="col-12 col-md-6 col-lg-4">
                <div class="card shadow-lg h-100">
                    <!-- <img :src="expert.PhotoURL" :alt="'Photo of ' + expert.Name" class="card-img-top" style="height:400px; object-fit:cover; border-radius:10px"/> -->
                    <h3 class="px-3 py-2"> <SafeContent inline :content="expert.Name" :strip="true" /> </h3>
                    <div class="card-body d-flex flex-column">
                        
                        <p class="card-text"><strong>Clinic:</strong> <SafeContent inline :content="expert.Clinic" :strip="true" /> </p>
                        <p class="card-text"><strong>Location:</strong> <SafeContent inline :content="expert.Location" :strip="true" /> </p>
                        <p class="card-text"><strong>Distance:</strong> <SafeContent inline :content="expert.distanceKm" :strip="true" /> </p>
                        <div class="d-flex flex-wrap gap-2 mb-4">
                            <span><strong>Car:</strong> <SafeContent inline :content="expert.durations.driving" :strip="true" /></span>
                            <span><strong>Walking:</strong> <SafeContent inline :content="expert.durations.walking" :strip="true" /></span>
                            <span><strong>Cycling:</strong> <SafeContent inline :content="expert.durations.cycling" :strip="true" /></span>
                        </div>

                        <div style="position: relative; height: 200px; border-radius: 10px; overflow: hidden;">
                            <div v-if="!expert.destCoords" class="map-loader-overlay">
                                <div class="loader"></div>
                            </div>
                            <div :id="`map-${expert.id}`" class="expert-map"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Footer />

    <FloatingControls />

</template>

<style scoped>
    .container {
        background-color: var(--page-bg);
        max-width: 100%;
        padding: 20px;
    }

    .header {
        font-size: 2.5rem;
        color: var(--page-text);
    }

    .loader-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: rgba(0, 255, 255, 0.5);
    }

    .loader {
        border: 4px solid rgba(255, 255, 255, 0.2);
        border-top: 4px solid #00ffff;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
        box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
    }

    .map-loader-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
        z-index: 10;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .card {
        background-color: var(--card-bg);
        color: var(--card-text);
        border-radius: 16px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.25);
    }

    .card-body span {
        font-size: 1.0rem;
    }

    .expert-map {
        height: 200px;
        border-radius: 10px;
        overflow: hidden;
    }

    .btn-primary {
        background-color: var(--primary-btn-bg);
        color: var(--primary-btn-text);
        border: none;
    }

</style>
