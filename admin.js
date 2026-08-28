async function checkAdminAccess() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    console.log("SESSION:", session);
    console.log("ERROR:", error);

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    document.querySelector(".admin-user").textContent =
        session.user.email;

    console.log("LOGIN OK");
}

checkAdminAccess();
