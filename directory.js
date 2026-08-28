const grid =
    document.getElementById("directoryGrid");

const searchInput =
    document.getElementById("searchInput");

const roleFilter =
    document.getElementById("roleFilter");

let profiles = [];


// =========================
// LOAD FROM SUPABASE
// =========================

async function loadProfiles() {

    grid.innerHTML = `
        <div class="empty">
            Loading profiles...
        </div>
    `;

    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        grid.innerHTML = `
            <div class="empty">
                Failed to load profiles.
            </div>
        `;

        return;
    }


    profiles = data.map(profile => ({

        id: profile.id,

        username: profile.username,

        role: profile.role === "SELLER"
            ? "Seller"
            : "Midman",

        verified: profile.verified,

        trust: profile.trust_status,

        rating: 0,

        reviews: 0

    }));


    renderProfiles();
}



// =========================
// RENDER
// =========================

function renderProfiles() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const role =
        roleFilter.value;


    const filtered =
        profiles.filter(profile => {

            const nameMatch =
                profile.username
                    .toLowerCase()
                    .includes(search);


            const roleMatch =
                role === "all" ||
                profile.role === role;


            return nameMatch && roleMatch;

        });


    if (filtered.length === 0) {

        grid.innerHTML = `
            <div class="empty">
                No profiles found.
            </div>
        `;

        return;
    }


    grid.innerHTML =
        filtered.map(profile => `

        <div class="card">

            <div class="avatar">
                ${profile.username
                    .charAt(0)
                    .toUpperCase()}
            </div>


            <h3>
                ${profile.username}
            </h3>


            <p class="role">
                ${profile.role}
            </p>


            ${
                profile.verified
                ? `
                    <div class="verified">
                        ✓ Verified
                    </div>
                `
                : ""
            }


            <div class="trust">
                ${profile.trust}
            </div>


            <div class="rating">

                ★ ${profile.rating}

                <span>
                    (${profile.reviews} reviews)
                </span>

            </div>


            <a
                href="profile.html?id=${profile.id}"
                class="profile-btn"
            >
                View Profile
            </a>

        </div>

    `).join("");

}



// =========================
// SEARCH
// =========================

searchInput.addEventListener(
    "input",
    renderProfiles
);


// =========================
// ROLE FILTER
// =========================

roleFilter.addEventListener(
    "change",
    renderProfiles
);


// =========================
// START
// =========================

loadProfiles();
