<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useRoute } from 'vue-router';
    import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
    import Footer from '../components/Footer.vue'
    import Header from '../components/Header.vue';
    import SafeContent from '../components/SafeContent.vue';
    import DataTable from "primevue/datatable";
    import Column from "primevue/column";
    import Button from "primevue/button";
    import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from "chart.js";
    import { Pie, Bar } from "vue-chartjs";
    import FloatingControls from '@/components/FloatingControls.vue';
    
    // Tell ChartJs which features to include.
    // Till V2 everything was included, it increased bundle size.
    // Starting V3, add only required features.
    ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

    const db = getFirestore();

    let users = ref([]);
    let comments = ref([]);
    let experts = ref([]);
    let appointments = ref([]);
    let showAll = ref(false);
    let showCharts = ref(false);

    // This will hold the table type from query: 'users', 'comments', 'experts', 'appointments', or null
    let tableType = ref(null);
    const route = useRoute();

    // Individual column filters for Users table
    const nameFilter = ref("");
    const emailFilter = ref("");
    
    // Individual column filters for Comments table
    const commentTextFilter = ref("");
    const commentAuthorFilter = ref("");

    // Individual column filters for Experts table
    const expertNameFilter = ref("");
    const expertProfessionFilter = ref("");

    // Individual column filters for Appointments table
    const appointmentUserFilter = ref("");
    const appointmentExpertFilter = ref("");
    const appointmentDateFilter = ref("");
    const appointmentTimeFilter = ref("");
    let showUpcoming = ref(true);

    // Data for creating charts
    const genderChartData = ref(null);
    const ratingChartData = ref(null);
    const inappropriateChartData = ref(null);
    const appointmentsByExpertChartData = ref(null);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "Users"));
            let userList = [];
            let maleCount = 0;
            let femaleCount = 0;
            
            querySnapshot.forEach((doc) => {
                if(doc.data().Role !== "Admin")
                {
                    const gender = doc.data().Gender || "Unknown";
                    if (gender.toLowerCase() === "male") maleCount++;
                    else if (gender.toLowerCase() === "female") femaleCount++;

                    userList.push({
                        id: doc.id,
                        name: doc.data().Name || `${doc.data().FirstName} ${doc.data().LastName}`,
                        email: doc.data().Email, 
                        gender: gender
                    });               
                }
            });

            users.value = userList;

            // User Distribution by gender Data for Pie Chart
            genderChartData.value = {
                labels: ["Male", "Female"],
                datasets: [
                    {
                        label: "Users by Gender",
                        data: [maleCount, femaleCount],
                        backgroundColor: ["#36A2EB", "#FF6384"],
                    },
                ],
            };
        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    };

    // Updated filter for Users with individual column filters
    const filteredUsers = computed(() => {
        if (!users.value) return [];
        
        return users.value.filter(u => {
            const matchesName = !nameFilter.value || 
                u.name?.toLowerCase().includes(nameFilter.value.toLowerCase());
            const matchesEmail = !emailFilter.value || 
                u.email?.toLowerCase().includes(emailFilter.value.toLowerCase());
            
            return matchesName && matchesEmail;
        });
    });

    const fetchComments = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "Ratings")); 
            let commentsList = [];

            // 1 to 5 stars (from left to right)
            let ratingCounts = [0, 0, 0, 0, 0];
            let appropriate = 0;
            let inappropriate = 0;

            querySnapshot.forEach((doc) => {
                if(doc.data().Name !== "Admin")
                {
                    const rating = doc.data().Rating || 0;
                    if (rating >= 1 && rating <= 5) {
                        ratingCounts[rating - 1]++;
                    }

                    const isInappropriate = doc.data().Inappropriate || false;
                    if (isInappropriate) inappropriate++;
                    else appropriate++;

                    commentsList.push({ 
                        id: doc.id,
                        text: doc.data().Comment,
                        name: doc.data().Name, 
                        userId: doc.data().UserId,
                        inappropriate: doc.data().Inappropriate || false
                    });            
                }
            });

            comments.value = commentsList;

            // Ratings distribution data for Bar graph
            ratingChartData.value = {
                labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
                datasets: [
                    {
                        label: "Number of Comments",
                        data: ratingCounts,
                        backgroundColor: "#42A5F5",
                    },
                ],
            };

            // Appropriate vs Inappropriate data for Pie chart
            inappropriateChartData.value = {
                labels: ["Appropriate", "Inappropriate"],
                datasets: [
                    {
                        data: [appropriate, inappropriate],
                        backgroundColor: ["#4CAF50", "#FF7043"],
                    },
                ],
            };

        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    };

    const filteredComments = computed(() => {
        // Show all comments
        if (showAll.value) {
            return comments.value;
        }

        // Show only appropriate comments
        return comments.value.filter(c => !c.inappropriate);
    });

    // Updated filter for Comments with individual column filters
    const filteredCommentsList = computed(() => {
        if (!comments.value) return [];

        let baseComments = showAll.value 
            ? comments.value 
            : comments.value.filter(c => !c.inappropriate);

        return baseComments.filter(c => {
            const matchesText = !commentTextFilter.value || 
                c.text?.toLowerCase().includes(commentTextFilter.value.toLowerCase());
            const matchesAuthor = !commentAuthorFilter.value || 
                c.name?.toLowerCase().includes(commentAuthorFilter.value.toLowerCase());
            
            return matchesText && matchesAuthor;
        });
    });

    const fetchExperts = async () => {
        try {
            const snapshot = await getDocs(collection(db, "WellnessExperts"));
            experts.value = snapshot.docs.map(d => ({
                id: d.id,
                name: d.data().Name,
                profession: d.data().Profession
            }));
        } catch (error) {
            console.error("Error fetching experts: ", error);
        }
    };

    const deleteExpert = async (id) => {
        if (confirm("Are you sure you want to delete this expert?")) {
            try {
                await deleteDoc(doc(db, "WellnessExperts", id));
                experts.value = experts.value.filter(e => e.id !== id);
                alert("Expert deleted successfully!");
            } catch (error) {
                console.error("Error deleting expert: ", error);
            }
        }
    };

    const filteredExperts = computed(() => {
        if (!experts.value) return [];
        
        return experts.value.filter(e => {
            const matchesName = !expertNameFilter.value || 
                e.name?.toLowerCase().includes(expertNameFilter.value.toLowerCase());
            const matchesProfession = !expertProfessionFilter.value || 
                e.profession?.toLowerCase().includes(expertProfessionFilter.value.toLowerCase());
            
            return matchesName && matchesProfession;
        });
    });

    const fetchAppointments = async () => {
        try {
            const snapshot = await getDocs(collection(db, "Appointments"));
            appointments.value = snapshot.docs.map(d => ({
                id: d.id,
                expertName: d.data().ExpertName,
                userName: users.value.find(u => u.id === d.data().UserId)?.name || "Unknown",
                date: d.data().Date,
                time: d.data().Time
            }));

            // Prepare Appointments by Expert chart data
            const counts = {};
            appointments.value.forEach(a => {
                if (a.expertName) {
                    counts[a.expertName] = (counts[a.expertName] || 0) + 1;
                }
            });

            appointmentsByExpertChartData.value = {
                labels: Object.keys(counts),
                datasets: [
                    {
                        label: "Appointments per Expert",
                        data: Object.values(counts),
                        backgroundColor: Object.keys(counts).map(() => `hsl(${Math.random() * 360}, 70%, 60%)`)
                    }
                ]
            };

        } catch (error) {
            console.error("Error fetching appointments: ", error);
        }
    };

    const deleteAppointment = async (id) => {
        if (confirm("Are you sure you want to delete this appointment?")) {
            try {
                await deleteDoc(doc(db, "Appointments", id));
                appointments.value = appointments.value.filter(a => a.id !== id);
                alert("Appointment deleted successfully!");
            } catch (error) {
                console.error("Error deleting appointment: ", error);
            }
        }
    };

    const filteredAppointments = computed(() => {
        if (!appointments.value) return [];

        const now = new Date();
        
        return appointments.value.filter(a => {
            const appointmentDateTime = new Date(`${a.date}T${a.time}`);

            // Filter future appointments if showUpcoming is true
            if (showUpcoming.value && appointmentDateTime < now) return false;
            
            const matchesUser = !appointmentUserFilter.value || 
                a.userName?.toLowerCase().includes(appointmentUserFilter.value.toLowerCase());
            const matchesExpert = !appointmentExpertFilter.value || 
                a.expertName?.toLowerCase().includes(appointmentExpertFilter.value.toLowerCase());
            const matchesDate = !appointmentDateFilter.value || 
                a.date?.toLowerCase().includes(appointmentDateFilter.value.toLowerCase());
            const matchesTime = !appointmentTimeFilter.value || 
                a.time?.toLowerCase().includes(appointmentTimeFilter.value.toLowerCase());
            
            return matchesUser && matchesExpert && matchesDate && matchesTime;
        });
    });

    const deleteUser = async (userId) => {
        if(confirm("Are you sure you want to delete this user?")) {
            try {

                // Delete user document from Firestore
                const user = doc(db, "Users", userId);
                await deleteDoc(user);
                console.log("User deleted with ID: ", userId);

                // Find all comments added by this user
                const allComments = collection(db, "Ratings");
                const commentQuery = query(allComments, where("UserId", "==", userId));
                const userComments = await getDocs(commentQuery);

                // Delete each comment added by this user
                const deleteCommentPromises = [];
                userComments.forEach((commentDoc) => {
                    deleteCommentPromises.push(deleteDoc(doc(db, "Ratings", commentDoc.id)));
                });
                
                // Promise is used to delete multiple comments added by the user
                await Promise.all(deleteCommentPromises);

                // Delete all appointments for this user
                const allAppointments = collection(db, "Appointments");
                const appointmentQuery = query(allAppointments, where("UserId", "==", userId));
                const userAppointments = await getDocs(appointmentQuery);

                const deleteAppointmentPromises = [];
                userAppointments.forEach((appointmentDoc) => {
                    deleteAppointmentPromises.push(deleteDoc(doc(db, "Appointments", appointmentDoc.id)));
                });

                // Promise is used to delete multiple appointments added by the user
                await Promise.all(deleteAppointmentPromises);
                
                // Update local state
                users.value = users.value.filter(user => user.id !== userId);
                comments.value = comments.value.filter(comment => comment.UserId !== userId);
                appointments.value = appointments.value.filter(appointment => appointment.UserId !== userId);
                alert("User and its comments and appointments deleted successfully!");

            } catch (error) {
                console.error("Error deleting user: ", error);
            }
        }
    };

    const deleteComment = async (commentId) => {
        if(confirm("Are you sure you want to delete this comment?")) {
            try {
                await deleteDoc(doc(db, "Ratings", commentId));
                comments.value = comments.value.filter(comment => comment.id !== commentId);
                alert("Comment deleted successfully!");
            } catch (error) {
                console.error("Error deleting comment: ", error);
            }
        }
    };

    const markInappropriate = async (commentId) => {
        try {
            const commentRef = doc(db, "Ratings", commentId);
            await updateDoc(commentRef, { Inappropriate: true });
            
            // Update the UI immediately, once the local state is updated
            const comment = comments.value.find(c => c.id === commentId);
            if(comment) comment.inappropriate = true;

            // Find user details by userId
            const user = users.value.find(u => u.id === comment.userId);
            if (!user) {
                console.warn("User not found for this comment");
                return;
            }

            // Send email using mailgun server
            await fetch("https://sendinappropriatecommentemail-gjd6kkfwjq-uc.a.run.app", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                    name: user.name,
                    comment: comment.text,
                    filePath: "https://eatsmarthub.pages.dev/attachments/Feedback_form_guidelines.pdf",
                }),
            });

            comments.value = comments.value.filter(comment => comment.id !== commentId);

            alert("Comment marked as inappropriate!");
        } catch (error) {
            console.error("Error marking comment:", error);
        }
    };

    const downloadCSV = (data, filename) => {
        if (!data || !data.length) {
            alert("No data available to export");
            return;
        }

        // Extract headers
        const headers = Object.keys(data[0]);

        // Build CSV content
        const csvRows = [
            headers.join(","),
            ...data.map(row =>
                headers.map(field => JSON.stringify(row[field], replacer)).join(",")
            ),
        ];

        function replacer(key, value) {
            // Handle null/undefined
            return value === null || value === undefined ? "" : value;
        }

        const csvContent = csvRows.join("\n");

        // Create blob and download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export User Details
    const exportUsersCSV = () => {
        downloadCSV(users.value, "user_details.csv");
    };

    // Export Comment Details
    const exportCommentsCSV = () => {
        downloadCSV(filteredComments.value, "comment_details.csv");
    };

    // Export Expert Details
    const exportExpertsCSV = () => {
        downloadCSV(experts.value, "expert_details.csv");
    };

    // Export Appointment Details
    const exportAppointmentsCSV = () => {
        downloadCSV(appointments.value, "appointment_details.csv");
    };

    onMounted(() => {
        document.title = "Report Dashboard - EatSmartHub";
        tableType.value = route.query.table || null;

        fetchUsers();
        fetchComments();
        fetchExperts();
        fetchAppointments();
    });

</script>

<template>
    <Header />

    <div class="report-style">
        <h1 class="text-white mt-2"> Report Dashboard </h1>

        <div class="container mt-4 mb-4" style="width:95%">

            <div class="d-flex justify-content-between align-items-center mb-3">
                <router-link to="/"> 
                    <button class="btn btn-primary"> Go Back to Dashboard </button>
                </router-link>

                <div class="d-flex justify-content-end">
                    <Button
                        :label="showCharts ? 'Show Datatables' : 'Show Visualisations'"
                        class="btn btn-primary"
                        @click="showCharts = !showCharts"
                    />
                </div>
            </div>
            

            <!-- Data Tables -->
            <div v-if="!showCharts">

                <!-- Users Table -->
                <div class="card shadow p-3 mb-4" v-if="!tableType || tableType === 'users'">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h3 class="text-center">User Details</h3>
                        <div class="d-flex gap-2">
                            <Button 
                                label="Download Users CSV"
                                class="btn btn-primary"
                                size="small"
                                @click="exportUsersCSV"
                            />
                        </div>
                    </div>

                    <DataTable
                        ref="usersTable"
                        :value="filteredUsers"
                        stripedRows
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[10,20,40]"
                        responsiveLayout="scroll"
                        tableStyle="min-width: 50rem; width:100%"
                        class="p-datatable-sm"
                        filterDisplay="row"
                    >
                        <template #empty > No Users found </template>

                        <!-- Make the name safe -->
                        <Column field="name" header="Name" sortable :showFilterMenu="false">
                            <template #filter>
                                <input 
                                    v-model="nameFilter"
                                    type="text"
                                    placeholder="Search name..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                <SafeContent inline :content="slotProps.data.name" :strip="true" />
                            </template>
                        </Column>
                        
                        <!-- Make the Email safe -->
                        <Column field="email" header="Email" sortable :showFilterMenu="false">
                            <template #filter>
                                <input 
                                    v-model="emailFilter"
                                    type="text"
                                    placeholder="Search email..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                <SafeContent inline :content="slotProps.data.email" :strip="true" />
                            </template>
                        </Column>
                        
                        <Column header="Delete User">
                            <template #body="slotProps">
                                <Button
                                    label="Delete"
                                    class="btn btn-primary"
                                    size="small"
                                    @click="deleteUser(slotProps.data.id)"
                                />
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <!-- Comments Table -->
                <div class="card shadow p-3 mb-4" v-if="!tableType || tableType === 'comments'">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h3 class="text-center">Comment Details</h3>
                        <div class="d-flex gap-2">
                            <Button 
                                label="Download Comments CSV"
                                class="btn btn-primary"
                                size="small"
                                @click="exportCommentsCSV"
                            />
                        </div>
                    </div>

                    <DataTable
                        :value="filteredCommentsList"
                        stripedRows
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[10,20,40]"
                        responsiveLayout="scroll"
                        tableStyle="min-width: 50rem; width:100%"
                        class="p-datatable-sm"
                        filterDisplay="row"
                    >
                        <template #empty > No Comments found </template>

                        <!-- Make the Comment safe -->
                        <Column field="text" header="Comment" sortable :showFilterMenu="false">
                            <template #filter>
                                <input 
                                    v-model="commentTextFilter"
                                    type="text"
                                    placeholder="Search comment..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                <SafeContent inline :content="slotProps.data.text" :strip="true" />
                            </template>
                        </Column>

                        <!-- Make the Author name Safe -->
                        <Column field="name" header="Author" sortable :showFilterMenu="false">
                            <template #filter>
                                <input 
                                    v-model="commentAuthorFilter"
                                    type="text"
                                    placeholder="Search author..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                <SafeContent inline :content="slotProps.data.name" :strip="true" />
                            </template>
                        </Column>

                        <!-- Separate column for Inappropriate -->
                        <Column header="Mark Inappropriate">
                            <template #body="slotProps">
                                <Button
                                    label="Inappropriate"
                                    class="btn btn-primary"
                                    size="small"
                                    :disabled="slotProps.data.inappropriate"
                                    @click="markInappropriate(slotProps.data.id)"
                                />
                            </template>
                        </Column>

                        <!-- Separate column for Delete -->
                        <Column header="Delete Comment">
                            <template #body="slotProps">
                                <Button
                                    label="Delete"
                                    class="btn btn-primary"
                                    size="small"
                                    @click="deleteComment(slotProps.data.id)"
                                />
                            </template>
                        </Column>

                    </DataTable>

                    <div class="mt-3 text-center">
                        <Button 
                            :label="showAll ? 'Show Only Appropriate Comments' : 'Show All Comments'"
                            class="btn btn-primary"
                            @click="showAll = !showAll"
                        />
                    </div>
                </div>

                <!-- Experts Table -->
                <div class="card shadow p-3 mb-4" v-if="!tableType || tableType === 'experts'">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h3 class="text-center">Wellness Experts</h3>
                        <div class="d-flex gap-2">
                            <Button 
                                label="Download Experts CSV"
                                class="btn btn-primary"
                                size="small"
                                @click="exportExpertsCSV"
                            />
                        </div>
                    </div>

                    <DataTable
                        :value="filteredExperts"
                        stripedRows
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[10,20,40]"
                        responsiveLayout="scroll"
                        tableStyle="min-width: 50rem; width:100%"
                        class="p-datatable-sm"
                        filterDisplay="row"
                    >
                        <template #empty > No Experts found </template>

                        <!-- Expert Name -->
                        <Column field="name" header="Name" sortable :showFilterMenu="false">
                            <template #filter>
                                <input 
                                    v-model="expertNameFilter"
                                    type="text"
                                    placeholder="Search name..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                <SafeContent inline :content="slotProps.data.name" :strip="true" />
                            </template>
                        </Column>

                        <!-- Profession -->
                        <Column field="profession" header="Profession" sortable :showFilterMenu="false">
                            <template #filter>
                                <input 
                                    v-model="expertProfessionFilter"
                                    type="text"
                                    placeholder="Search profession..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                <SafeContent inline :content="slotProps.data.profession" :strip="true" />
                            </template>
                        </Column>

                        <!-- Delete Expert -->
                        <Column header="Delete Expert">
                            <template #body="slotProps">
                                <Button
                                    label="Delete"
                                    class="btn btn-primary"
                                    size="small"
                                    @click="deleteExpert(slotProps.data.id)"
                                />
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <!-- Appointments Table -->
                <div class="card shadow p-3 mb-4" v-if="!tableType || tableType === 'appointments'">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h3 class="text-center">Appointment Details</h3>
                        <div class="d-flex gap-2">
                            <Button 
                                label="Download Appointments CSV"
                                class="btn btn-primary"
                                size="small"
                                @click="exportAppointmentsCSV"
                            />
                        </div>
                    </div>

                    <DataTable
                        :value="filteredAppointments"
                        stripedRows
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[10,20,40]"
                        responsiveLayout="scroll"
                        tableStyle="min-width: 50rem; width:100%"
                        class="p-datatable-sm"
                        filterDisplay="row"
                    >
                        <template #empty > No Appointments found </template>

                        <!-- Expert Name -->
                        <Column field="expertName" header="Expert Name" sortable :showFilterMenu="false">
                            <template #filter>
                                <input 
                                    v-model="appointmentExpertFilter"
                                    type="text"
                                    placeholder="Search expert..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                <SafeContent inline :content="slotProps.data.expertName" :strip="true" />
                            </template>
                        </Column>

                        <!-- User Name -->
                        <Column field="userName" header="User Name" sortable :showFilterMenu="false">
                            <template #filter>
                                <input 
                                    v-model="appointmentUserFilter"
                                    type="text"
                                    placeholder="Search user..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                <SafeContent inline :content="slotProps.data.userName" :strip="true" />
                            </template>
                        </Column>

                        <!-- Date -->
                        <Column field="date" header="Date" sortable :showFilterMenu="false">
                            <template #filter>
                                <input 
                                    v-model="appointmentDateFilter"
                                    type="text"
                                    placeholder="Search date..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                {{ slotProps.data.date }}
                            </template>
                        </Column>

                        <!-- Time -->
                        <Column field="time" header="Time" sortable :showFilterMenu="false">
                            <template #filter>
                                <input
                                    v-model="appointmentTimeFilter"
                                    type="text"
                                    placeholder="Search time..."
                                    class="form-control form-control-sm"
                                />
                            </template>
                            <template #body="slotProps">
                                {{ slotProps.data.time }}
                            </template>
                        </Column>

                        <!-- Delete Appointment -->
                        <Column header="Delete Appointment">
                            <template #body="slotProps">
                                <Button
                                    label="Delete"
                                    class="btn btn-primary"
                                    size="small"
                                    @click="deleteAppointment(slotProps.data.id)"
                                />
                            </template>
                        </Column>
                    </DataTable>

                    <div class="mt-3 text-center">
                        <Button 
                            :label="showUpcoming ? 'Show All Appointments' : 'Show Upcoming Appointments'"
                            class="btn btn-primary"
                            @click="showUpcoming = !showUpcoming"
                        />
                    </div>
                </div>

            </div>

            <div v-else class="row">
                <!-- Users by Gender -->
                <div class="col-md-6 mb-4">
                    <div class="card shadow p-3 h-100 d-flex justify-content-center align-items-center">
                        <h3 class="text-center">Users by Gender</h3>
                        <div style="max-width:400px; width:100%; height:300px;">
                            <Pie 
                                v-if="genderChartData"
                                alt="Pie Chart of Users by Gender"
                                :data="genderChartData" 
                                :options="{ responsive: true, maintainAspectRatio: false }" 
                            />
                        </div>
                    </div>
                </div>

                <!-- Ratings Distribution -->
                <div class="col-md-6 mb-4">
                    <div class="card shadow p-3 h-100 d-flex justify-content-center align-items-center">
                        <h3 class="text-center">Ratings Distribution</h3>
                        <div style="max-width:400px; width:100%; height:300px;">
                            <Bar 
                                v-if="ratingChartData" 
                                alt="Bar graph of Rating Distribution"
                                :data="ratingChartData" 
                                :options="{ responsive: true, maintainAspectRatio: false }" 
                            />
                        </div>
                    </div>
                </div>

                <!-- Appropriate vs Inappropriate -->
                <div class="col-md-6 mb-4">
                    <div class="card shadow p-3 h-100 d-flex justify-content-center align-items-center">
                        <h3 class="text-center">Appropriate vs Inappropriate Comments</h3>
                        <div style="max-width:400px; width:100%; height:300px;">
                            <Pie 
                                v-if="inappropriateChartData" 
                                alt="Pie Chart of Appropriate vs Inappropriate"
                                :data="inappropriateChartData" 
                                :options="{ responsive: true, maintainAspectRatio: false }" 
                            />
                        </div>
                    </div>
                </div>

                <!-- Appointments by Expert -->
                <div class="col-md-6 mb-4">
                    <div class="card shadow p-3 h-100 d-flex justify-content-center align-items-center">
                        <h3 class="text-center">Appointments by Expert</h3>
                        <div style="max-width:400px; width:100%; height:300px;">
                            <Pie 
                                v-if="appointmentsByExpertChartData" 
                                alt="Pie Chart of Appointments by Expert"
                                :data="appointmentsByExpertChartData" 
                                :options="{ 
                                    responsive: true, 
                                    maintainAspectRatio: false
                                }" 
                            />
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
    .report-style {
        background-color: var(--page-bg);
        color: var(--page-text);
        min-height: 100dvh;
        flex-direction: column;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .btn-primary {
        background-color: var(--primary-btn-bg);
        color: var(--primary-btn-text);
        border: none;
    }

    .card {
        background: var(--card-bg);
        color: var(--card-text);
        border-radius: 16px;
        box-shadow: 0 8px 30px rgba(2,6,23,0.15);
        transition: background-color 0.35s ease, color 0.35s ease;
    }

</style>
