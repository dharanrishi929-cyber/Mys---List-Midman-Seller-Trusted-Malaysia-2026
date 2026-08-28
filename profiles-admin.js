// =========================
// ELEMENTS
// =========================

const grid = document.getElementById("profilesAdminGrid");
const logoutBtn = document.getElementById("logoutBtn");

const addProfileBtn = document.getElementById("addProfileBtn");
const addProfileForm = document.getElementById("addProfileForm");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");


// =========================
// LOAD PROFILES
// =========================

async function loadProfiles() {

    if (!grid) {
        console.error("profilesAdminGrid not found.");
        return;
    }

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
                    ${escapeHtml(error.message)}
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

        grid.innerHTML = data.map(profile => {

            const username =
                profile.username || "Unknown";

            const initial =
                username.charAt(0).toUpperCase();

            const image = profile.profile_picture
                ? `
                    <img
                        src="${escapeAttribute(profile.profile_picture)}"
                        alt="${escapeAttribute(username)}"
                        class="profile-avatar-img"
                    >
                `
                : `
                    <div class="avatar">
                        ${escapeHtml(initial)}
                    </div>
                `;

            return `
                <div class="admin-profile-card">

                    ${image}

                    <h3>
                        ${escapeHtml(username)}
                    </h3>

                    <p class="role">
                        ${escapeHtml(profile.role || "SELLER")}
                    </p>

                    <div class="trust">
                        ${escapeHtml(
                            profile.trust_status || "Trusted"
                        )}
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
            `;

        }).join("");

    } catch (err) {

        console.error(
            "JAVASCRIPT ERROR:",
            err
        );

        grid.innerHTML = `
            <p class="loading">
                Error:<br>
                ${escapeHtml(err.message)}
            </p>
        `;
    }
}


// =========================
// EDIT PROFILE
// =========================

async function editProfile(id) {

    try {

        const {
            data: profile,
            error: fetchError
        } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError) {

            alert(
                "Failed to load profile:\n" +
                fetchError.message
            );

            return;
        }


        const username = prompt(
            "Username:",
            profile.username || ""
        );

        if (username === null || !username.trim()) {
            return;
        }


        const role = prompt(
            "Role: SELLER atau MIDMAN",
            profile.role || "SELLER"
        );

        if (role === null) return;

        const cleanRole =
            role.trim().toUpperCase();

        if (
            cleanRole !== "SELLER" &&
            cleanRole !== "MIDMAN"
        ) {

            alert(
                "Role mesti SELLER atau MIDMAN."
            );

            return;
        }


        const trust = prompt(
            "Trust status:",
            profile.trust_status || "Trusted"
        );

        if (trust === null) return;


        const description = prompt(
            "Description:",
            profile.description || ""
        );


        // =========================
        // CHANGE PROFILE IMAGE
        // =========================

        const changeImage = confirm(
            "Nak tukar gambar profile?\n\n" +
            "OK = pilih gambar baru\n" +
            "Cancel = kekalkan gambar lama"
        );


        let profilePicture =
            profile.profile_picture || null;


        if (changeImage) {

            const input =
                document.createElement("input");

            input.type = "file";
            input.accept = "image/*";

            input.click();


            const selectedFile =
                await new Promise(resolve => {

                    input.onchange = () => {
                        resolve(
                            input.files[0] || null
                        );
                    };

                    input.oncancel = () => {
                        resolve(null);
                    };

                });


            if (selectedFile) {

                const extension =
                    selectedFile.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                const filePath =
                    `profiles/${id}-${Date.now()}.${extension}`;


                const {
                    error: uploadError
                } = await supabaseClient
                    .storage
                    .from("avatars")
                    .upload(
                        filePath,
                        selectedFile,
                        {
                            cacheControl: "3600",
                            upsert: false,
                            contentType:
                                selectedFile.type
                        }
                    );


                if (uploadError) {

                    alert(
                        "Image upload failed:\n" +
                        uploadError.message
                    );

                    console.error(uploadError);

                    return;
                }


                const {
                    data: publicData
                } = supabaseClient
                    .storage
                    .from("avatars")
                    .getPublicUrl(filePath);


                profilePicture =
                    publicData.publicUrl;
            }
        }


        // =========================
        // UPDATE
        // =========================

        const {
            error: updateError
        } = await supabaseClient
            .from("profiles")
            .update({

                username:
                    username.trim(),

                role:
                    cleanRole,

                trust_status:
                    trust.trim(),

                description:
                    description || "",

                profile_picture:
                    profilePicture,

                updated_at:
                    new Date().toISOString()

            })
            .eq("id", id);


        if (updateError) {

            alert(
                "Update failed:\n" +
                updateError.message
            );

            console.error(updateError);

            return;
        }


        alert(
            "Profile updated successfully!"
        );


        loadProfiles();

    } catch (err) {

        console.error(err);

        alert(
            "Error:\n" +
            err.message
        );
    }
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
// ADD PROFILE FORM
// =========================

if (addProfileBtn && addProfileForm) {

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
}


if (cancelProfileBtn && addProfileForm) {

    cancelProfileBtn.addEventListener(
        "click",
        () => {

            addProfileForm.style.display =
                "none";

        }
    );
}


// =========================
// SAVE NEW PROFILE
// =========================

if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        async () => {

            const username =
                document.getElementById(
                    "newUsername"
                )?.value.trim();

            const role =
                document.getElementById(
                    "newRole"
                )?.value;

            const whatsapp =
                document.getElementById(
                    "newWhatsapp"
                )?.value.trim();

            const trust =
                document.getElementById(
                    "newTrust"
                )?.value.trim();

            const description =
                document.getElementById(
                    "newDescription"
                )?.value.trim();

            const verified =
                document.getElementById(
                    "newVerified"
                )?.checked || false;

            const featured =
                document.getElementById(
                    "newFeatured"
                )?.checked || false;


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

                    role:
                        role || "SELLER",

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

                console.error(error);

                return;
            }


            alert(
                "Profile added successfully!"
            );


            if (addProfileForm) {
                addProfileForm.style.display =
                    "none";
            }


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
// SECURITY HELPERS
// =========================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}


// =========================
// START
// =========================

loadProfiles();
