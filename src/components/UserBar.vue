<script setup>
import { defineProps } from "vue";
import UploadPhotoModal from "./UploadPhotoModal.vue";
import { useUserStore } from "../stores/users.js";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { supabase } from "../supabase";

const route = useRoute();
const { username: profileUsername } = route.params;
const props = defineProps([
  "profileUser",
  "userInfo",
  "addNewPost",
  "isFollowing",
  "updateIsFollowing",
]);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const followUser = async () => {
  await supabase.from("followers_following").insert({
    follower_id: user.value.id,
    following_id: props.profileUser.id,
  });
  props.updateIsFollowing(true);
};

const unFollowUser = async () => {
  await supabase
    .from("followers_following")
    .delete()
    .eq("follower_id", user.value.id)
    .eq("following_id", props.profileUser.id);
  props.updateIsFollowing(false);
};
</script>

<template>
  <div class="userbar-container" v-if="props.profileUser">
    <div class="top-content">
      <ATypographyTitle :level="2">{{
        props.profileUser.username
      }}</ATypographyTitle>
      <div v-if="user">
        <UploadPhotoModal
          v-if="profileUsername === user.username"
          :addNewPost="addNewPost"
        />
        <div v-else>
          <AButton v-if="!props.isFollowing" @click="followUser"
            >Follow</AButton
          >
          <AButton v-else @click="unFollowUser">Following</AButton>
        </div>
        <div></div>
      </div>
    </div>
    <div class="bottom-content">
      <ATypographyTitle :level="5"
        >{{ props.userInfo.posts }} posts</ATypographyTitle
      >
      <ATypographyTitle :level="5"
        >{{ props.userInfo.followers }} followers</ATypographyTitle
      >
      <ATypographyTitle :level="5"
        >{{ props.userInfo.following }} following</ATypographyTitle
      >
    </div>
  </div>
  <div class="userbar-container" v-else>
    <ATypographyTitle :level="2">User Not Found</ATypographyTitle>
  </div>
</template>

<style scoped>
.userbar-container {
  padding-bottom: 75px;
}

.bottom-content {
  display: flex;
  align-items: center;
}

.bottom-content h5 {
  margin: 0 !important;
  padding: 0;
  margin-right: 30px !important;
}

.top-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
