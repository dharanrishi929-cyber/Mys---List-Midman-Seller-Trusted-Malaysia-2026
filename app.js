console.log("APP JS LOADED");

const profilesContainer = document.getElementById("profiles");

async function loadProfiles() {

    if (!profilesContainer) {
        console.log("profiles container not found");
        return;
    }

    profilesContainer.innerHTML =
        '<div class="loading">Loading profiles...</div>';

    if (!window.supabaseClient) {
        profilesContainer.innerHTML =
            '<div class="loading">Supabase client not found.</div>';
        return;
    }

    const result = await window.supabaseClient
        .from("profiles")
        .select("*");

    console.log(result);

    if (result.error) {

        profilesContainer.innerHTML =
            '<div class="loading">' +
            result.error.message +
            '</div>';

        return;
    }

    if (!result.data || result.data.length === 0) {

        profilesContainer.innerHTML =
            '<div class="loading">No profiles found.</div>';

        return;
    }

    profilesContainer.innerHTML = result.data.map(function(profile) {

        return `
            <div class="card">

                <div class="avatar">
                    ${(profile.username || "?").charAt(0).toUpperCase()}
                </div>

                <h3>
                    ${profile.username || "Unknown"}
                </h3>

                <p class="role">
                    ${profile.role || "Seller"}
                </p>

                ${
                    profile.verified
                    ? '<div class="verified">✓ Verified</div>'
                    : ''
                }

                <div class="trust">
                    ${profile.trust_status || "Trusted"}
                </div>

                <div class="rating">
                    ★ ${profile.rating || 0}
                    <span>
                        (${profile.reviews || 0} reviews)
                    </span>
                </div>

                <a
                    href="profile.html?id=${profile.id}"
                    class="profile-btn"
                >
                    View Profile
                </a>

            </div>
        `;

    }).join("");
}

loadProfiles();
