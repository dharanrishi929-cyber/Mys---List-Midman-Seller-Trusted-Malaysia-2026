async function editProfile(id) {

    // Ambil profile lama
    const {
        data: profile,
        error: fetchError
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError) {
        alert("Failed to load profile:\n" + fetchError.message);
        return;
    }


    const username = prompt(
        "Username:",
        profile.username || ""
    );

    if (!username) return;


    const role = prompt(
        "Role: SELLER atau MIDMAN",
        profile.role || "SELLER"
    );

    if (!role) return;

    const cleanRole = role.toUpperCase();

    if (
        cleanRole !== "SELLER" &&
        cleanRole !== "MIDMAN"
    ) {
        alert("Role mesti SELLER atau MIDMAN.");
        return;
    }


    const trust = prompt(
        "Trust status:",
        profile.trust_status || "Trusted"
    );

    if (!trust) return;


    const description = prompt(
        "Description:",
        profile.description || ""
    );


    // =========================
    // PILIH GAMBAR BARU
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
    // UPDATE PROFILE
    // =========================

    const {
        error: updateError
    } = await supabaseClient
        .from("profiles")
        .update({

            username: username,

            role: cleanRole,

            trust_status: trust,

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
}
