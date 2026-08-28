const grid = document.getElementById("profilesAdminGrid");
const logoutBtn = document.getElementById("logoutBtn");


// =========================
// LOAD PROFILES
// =========================

async function loadProfiles() {

    grid.innerHTML = `
        <p class="loading">
            Loading profiles...
        </p>
    `;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("profiles")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        console.log("PROFILES:", data);
        console.log("ERROR:", error);


        if (error) {

            grid.innerHTML = `
                <p class="loading">
                    Database error:<br>
                    ${error.message}
                </p>
            `;

            return;
        }


        if (!data || data.length === 0) {

            grid.innerHTML = `
                <p class="loading">
                    No profiles found.
                </p>
            `;

            return;
        }


        grid.innerHTML = data.map(profile => `

            <div class="admin-profile-card">

                <div class="avatar">
                    ${
                        profile.username
                            .charAt(0)
                            .toUpperCase()
                    }
                </div>


                <h3>
                    ${profile.username}
                </h3>


                <p class="role">
                    ${profile.role}
                </p>


                <div class="trust">
                    ${profile.trust_status}
                </div>


                ${
                    profile.verified
                    ? `
                        <div class="verified">
                            ✓ Verified
                        </div>
                    `
                    : `
                        <div class="unverified">
                            Not Verified
                        </div>
                    `
                }


                ${
                    profile.featured
                    ? `
                        <div class="verified">
                            ★ Featured
                        </div>
                    `
                    : ""
                }


                <div class="admin-actions">

                    <button
                        onclick="editProfile('${profile.id}')"
                    >
                        Edit
                    </button>


                    <button
                        onclick="deleteProfile('${profile.id}')"
                        class="danger-btn"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `).join("");


    } catch (err) {

        console.error(
            "JAVASCRIPT ERROR:",
            err
        );

        grid.innerHTML = `
            <p class="loading">
                Error:<br>
                ${err.message}
            </p>
        `;
    }
}



// =========================
// EDIT PROFILE
// =========================

async function editProfile(id) {

    const username =
        prompt(
            "Username baru:"
        );

    if (!username) return;


    const role =
        prompt(
            "Role: SELLER atau MIDMAN",
            "SELLER"
        );


    if (
        role !== "SELLER" &&
        role !== "MIDMAN"
    ) {

        alert(
            "Role mesti SELLER atau MIDMAN."
        );

        return;
    }


    const trust =
        prompt(
            "Trust status:",
            "Trusted"
        );


    if (!trust) return;


    const description =
        prompt(
            "Description:"
        );


    const {
        error
    } = await supabaseClient
        .from("profiles")
        .update({

            username: username,

            role: role,

            trust_status: trust,

            description:
                description || "",

            updated_at:
                new Date().toISOString()

        })
        .eq("id", id);


    if (error) {

        alert(
            "Update failed:\n" +
            error.message
        );

        console.error(error);

        return;
    }


    alert(
        "Profile updated!"
    );


    loadProfiles();
}



// =========================
// DELETE PROFILE
// =========================

async function deleteProfile(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this profile?"
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient
        .from("profiles")
        .delete()
        .eq("id", id);


    if (error) {

        alert(
            "Delete failed:\n" +
            error.message
        );

        console.error(error);

        return;
    }


    alert(
        "Profile deleted!"
    );


    loadProfiles();
}



// =========================
// LOGOUT
// =========================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

        }
    );

}



// =========================
// START
// =========================

loadProfiles();                                         const addProfileBtn =
    document.getElementById("addProfileBtn");

const addProfileForm =
    document.getElementById("addProfileForm");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const cancelProfileBtn =
    document.getElementById("cancelProfileBtn");


addProfileBtn.addEventListener(
    "click",
    () => {

        addProfileForm.style.display =
            "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


cancelProfileBtn.addEventListener(
    "click",
    () => {

        addProfileForm.style.display =
            "none";

    }
);


saveProfileBtn.addEventListener(
    "click",
    async () => {

        const username =
            document.getElementById(
                "newUsername"
            ).value.trim();

        const role =
            document.getElementById(
                "newRole"
            ).value;

        const whatsapp =
            document.getElementById(
                "newWhatsapp"
            ).value.trim();

        const trust =
            document.getElementById(
                "newTrust"
            ).value.trim();

        const description =
            document.getElementById(
                "newDescription"
            ).value.trim();

        const verified =
            document.getElementById(
                "newVerified"
            ).checked;

        const featured =
            document.getElementById(
                "newFeatured"
            ).checked;


        if (!username) {

            alert(
                "Username wajib diisi."
            );

            return;
        }


        const {
            error
        } = await supabaseClient
            .from("profiles")
            .insert({

                username,

                role,

                whatsapp_number:
                    whatsapp || null,

                trust_status:
                    trust || "Trusted",

                description:
                    description || null,

                verified,

                featured

            });


        if (error) {

            alert(
                "Failed to add profile:\n" +
                error.message
            );

            return;
        }


        alert(
            "Profile added successfully!"
        );


        addProfileForm.style.display =
            "none";


        document.getElementById(
            "newUsername"
        ).value = "";

        document.getElementById(
            "newWhatsapp"
        ).value = "";

        document.getElementById(
            "newDescription"
        ).value = "";


        loadProfiles();

    }
);
