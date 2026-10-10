// ঘুরবো বাংলাদেশ — Supabase Authentication

const SUPABASE_URL =
  "https://hbllzgylzemdszsbetkl.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhibGx6Z3lsemVtZHN6c2JldGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNTA5MjksImV4cCI6MjEwNjgyNjkyOX0.Qsx2bG000YHhzoyObbXZBxE8wPrrtjvonnplqGyyX5w";

const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let authMode = "login";

const authSection = document.getElementById("auth");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubmit = document.getElementById("authSubmit");
const authMsg = document.getElementById("authMsg");
const nameWrap = document.getElementById("nameWrap");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");

function showAuth(mode) {
  authMode = mode;

  authTitle.textContent =
    mode === "register" ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Login";

  authSubmit.textContent =
    mode === "register" ? "Register করুন" : "Login করুন";

  nameWrap.classList.toggle("hidden", mode !== "register");
  nameInput.required = mode === "register";

  passwordInput.autocomplete =
    mode === "register" ? "new-password" : "current-password";

  authMsg.textContent = "";
  authMsg.style.color = "";

  authSection.classList.remove("hidden");
  authSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function hideAuth() {
  authSection.classList.add("hidden");
  authMsg.textContent = "";
}

window.showAuth = showAuth;
window.hideAuth = hideAuth;

function showMessage(message, isError = false) {
  authMsg.textContent = message;
  authMsg.style.color = isError ? "#b42318" : "#176344";
}

function updateDashboard(user) {
  if (!user) {
    dashboard.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    return;
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Traveler";

  document.getElementById("userName").textContent = fullName;
  document.getElementById("profileName").textContent = fullName;
  document.getElementById("profileEmail").textContent =
    user.email || "";

  dashboard.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  hideAuth();
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const fullName = nameInput.value.trim();

  authSubmit.disabled = true;
  authSubmit.textContent = "অপেক্ষা করুন...";
  showMessage("");

  try {
    if (authMode === "register") {
      if (!fullName) {
        showMessage("আপনার নাম লিখুন।", true);
        return;
      }

      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        updateDashboard(data.user);
        showMessage("অ্যাকাউন্ট তৈরি হয়েছে!");
      } else {
        showMessage(
          "রেজিস্ট্রেশন সফল! আপনার ইমেইল যাচাই করে তারপর Login করুন।"
        );
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      updateDashboard(data.user);
    }
  } catch (error) {
    showMessage(
      error.message || "সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      true
    );
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent =
      authMode === "register" ? "Register করুন" : "Login করুন";
  }
});

logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;

  const { error } = await sb.auth.signOut();

  logoutBtn.disabled = false;

  if (error) {
    alert("Logout করা যায়নি: " + error.message);
    return;
  }

  updateDashboard(null);
  showAuth("login");
  showMessage("আপনি সফলভাবে Logout করেছেন।");
});

async function checkSession() {
  const { data, error } = await sb.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);
    return;
  }

  updateDashboard(data.session?.user || null);
}

sb.auth.onAuthStateChange((_event, session) => {
  updateDashboard(session?.user || null);
});

checkSession();
