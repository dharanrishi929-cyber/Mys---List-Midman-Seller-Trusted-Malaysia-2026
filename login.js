const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    // Supabase Auth menggunakan EMAIL.
    // Untuk sementara, masukkan email yang kau buat
    // dalam Supabase Authentication sebagai username.

    message.textContent = "Signing in...";
    message.className = "login-message info";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: username,
            password: password
        });

    if (error) {
        message.textContent = "Login gagal: " + error.message;
        message.className = "login-message error";
        return;
    }

    message.textContent = "Login berjaya!";

    window.location.href = "admin.html";
});
