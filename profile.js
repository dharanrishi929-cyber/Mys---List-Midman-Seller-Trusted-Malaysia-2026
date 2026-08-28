cnst container = document.getElementById("profileContainer");

const params = new URLSearchParams(window.location.search);
const profileId = params.get("id");


async function loadProfile() {

    if (!container) {
        return;
    }

    if (!profileId) {

        container.innerHTML = `
            <div class="loading">
                Profile ID not found.
            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="loading">
            Loading profile...
        </div>
    `;


    try {

        const result =
            await window.supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", profileId)
                .single();


        console.log(
            "PROFILE RESULT:",
            result
        );


        if (result.error) {

            container.innerHTML = `
                <div class="loading">

                    Database error:

                    <br><br>

                    ${result.error.message}

                </div>
            `;

            return;
        }


        const profile = result.data;


        if (!profile) {

            container.innerHTML = `
                <div class="loading">
                    Profile not found.
                </div>
            `;

            return;
        }


        const username =
            profile.username || "Unknown";


        const role =
            profile.role || "Seller";


        const trust =
            profile.trust_status || "Trusted";


        const rating =
            profile.rating || 0;


        const reviews =
            profile.reviews || 0;


        const initial =
            username
                .charAt(0)
                .toUpperCase();


        container.innerHTML = `

            <div class="profile-card">


                <div class="big-avatar">

                    ${initial}

                </div>


                <h1>

                    ${username}

                </h1>


                <p class="role">

                    ${role}

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

                    ${trust}

                </div>


                <div class="big-rating">

                    ★ ${rating}

                    <span>

                        (${reviews} reviews)

                    </span>

                </div>


                <p class="description">

                    ${
                        profile.description ||
                        "No description available."
                    }

                </p>


                ${
                    profile.whatsapp_number
                    ? `
                        <a
                            href="https://wa.me/${profile.whatsapp_number}"
                            target="_blank"
                            class="whatsapp-btn"
                        >

                            Contact on WhatsApp

                        </a>
                    `
                    : ""
                }


            </div>

        `;

    }


    catch (error) {

        console.error(
            "PROFILE ERROR:",
            error
        );


        container.innerHTML = `
            <div class="loading">

                Error:

                <br><br>

                ${error.message}

            </div>
        `;

    }

}


loadProfile();o
