<script setup>
import { ref, reactive, defineProps, defineEmits } from "vue";
import { useUserStore } from "../stores/users.js";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { errorMessage, isSuccess, loading, user } = storeToRefs(userStore);

const emit = defineEmits(["successTrigger"]);
const emitSuccessTrigger = (isSuccess) => {
  emit("successTrigger", isSuccess);
};

const props = defineProps(["isLogin"]);
const title = props.isLogin ? "Login" : "Signup";

const visible = ref(false);
const userCredentials = reactive({
  email: "",
  password: "",
  username: "",
});

const showModal = () => {
  visible.value = true;
};

const clearUserCredentialsInput = () => {
  userCredentials.email = "";
  userCredentials.username = "";
  userCredentials.password = "";
  userStore.clearErrorMessage();
};

const handleOk = async (e) => {
  if (props.isLogin) {
    await userStore.handleLogin({
      email: userCredentials.email,
      password: userCredentials.password,
    });
    if (!errorMessage) {
      clearUserCredentialsInput();
      visible.value = false;
    }
  } else {
    // awaiting to prevent visible from running before the async
    await userStore.handleSignup(userCredentials);
    if (user.value) {
      clearUserCredentialsInput();
      visible.value = false;
      emitSuccessTrigger(isSuccess);
      user.value = null;
    }
  }
};

const handleCancel = () => {
  clearUserCredentialsInput();
  visible.value = false;
};
</script>

<template>
  <div>
    <AButton class="btn" type="primary" @click="showModal">{{ title }}</AButton>
    <AModal v-model:visible="visible" :title="title" @ok="handleOk">
      <template #footer>
        <AButton key="back" :disabled="loading" @click="handleCancel"
          >Cancel</AButton
        >
        <AButton
          key="submit"
          :disabled="loading"
          type="primary"
          :loading="loading"
          @click="handleOk"
          >Submit</AButton
        >
      </template>
      <div v-if="!loading" class="input-container">
        <AInput
          class="input"
          v-if="!isLogin"
          v-model:value="userCredentials.username"
          placeholder="Username"
        />
        <AInput
          class="input"
          v-model:value="userCredentials.email"
          placeholder="Email"
        />
        <AInput
          class="input"
          v-model:value="userCredentials.password"
          placeholder="Password"
          type="password"
        />
      </div>
      <div v-else class="spinner">
        <ASpin />
      </div>
      <ATypographyText v-if="errorMessage" type="danger">{{
        errorMessage
      }}</ATypographyText>
    </AModal>
  </div>
</template>

<style scoped>
.btn {
  margin-left: 10px;
}

.input {
  margin-top: 5px;
}

.input-container {
  height: 120px;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
}
</style>
