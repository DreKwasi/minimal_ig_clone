import { ref } from "vue";
import { defineStore } from "pinia";
import { supabase } from "../supabase.js";

export const useUserStore = defineStore("users", () => {
  const user = ref(null);
  const errorMessage = ref("");
  const isSuccess = ref(false);
  const loading = ref(false);
  const loadingUser = ref(false);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleLogin = async (credentials) => {
    const { email, password } = credentials;

    if (!validateEmail(email)) {
      return (errorMessage.value = "Email is not valid");
    }

    if (!password.length) {
      return (errorMessage.value = "Password cannot be empty");
    }

    loading.value = true;

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      loading.value = false;
      return (errorMessage.value = loginError.message);
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();

    user.value = {
      email: existingUser.email,
      username: existingUser.username,
      id: existingUser.id,
    };
    loading.value = false;
    errorMessage.value = "";
  };

  const handleSignup = async (credentials) => {
    const { email, password, username } = credentials;

    if (password.length < 6) {
      return (errorMessage.value = "Password must be at least 6 characters");
    }

    if (username.length < 4) {
      return (errorMessage.value = "Username must be at least 4 characters");
    }

    if (!validateEmail(email)) {
      return (errorMessage.value = "Email is not valid");
    }

    loading.value = true;
    const { data: userwithUsername } = await supabase
      .from("users")
      .select()
      .eq("username", username)
      .single();

    if (userwithUsername) {
      loading.value = false;

      return (errorMessage.value = "Username already taken");
    }

    const { error: authenticationError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authenticationError) {
      loading.value = false;
      return (errorMessage.value = authenticationError.message);
    }

    const { error: databaseError } = await supabase.from("users").insert({
      username,
      email,
    });
    if (databaseError) {
      loading.value = false;

      return (errorMessage.value = "Unable to Create User. Contact Admin");
    }

    loading.value = false;
    errorMessage.value = "";

    const { data: newUser } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();

    user.value = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    };
    isSuccess.value = true;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    user.value = null;
  };

  const getUser = async () => {
    loadingUser.value = true;
    const { data: userAuthData } = await supabase.auth.getUser();

    if (!userAuthData.user) {
      loadingUser.value = false;
      return (user.value = null);
    }

    const { data: userWithEmail } = await supabase
      .from("users")
      .select()
      .eq("email", userAuthData.user.email)
      .single();

    user.value = {
      username: userWithEmail.username,
      email: userWithEmail.email,
      id: userWithEmail.id,
    };

    loadingUser.value = false;
  };

  const clearErrorMessage = () => {
    errorMessage.value = "";
  };

  return {
    user,
    errorMessage,
    isSuccess,
    loading,
    loadingUser,
    user,
    handleLogin,
    handleSignup,
    handleLogout,
    getUser,
    clearErrorMessage,
  };
});
