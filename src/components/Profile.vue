<script setup>
import Container from "./Container.vue";
import UserBar from "./UserBar.vue";
import ImageGallery from "./ImageGallery.vue";
import { ref, onMounted, watch, reactive } from "vue";
import { supabase } from "../supabase";
import { useRoute } from "vue-router";
import { useUserStore } from "../stores/users";
import { storeToRefs } from "pinia";

const route = useRoute();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { username } = route.params;

const profileUser = ref(null);
const isFollowing = ref(false);
const posts = ref([]);
const loading = ref(false);

const userInfo = reactive({
  posts: null,
  followers: null,
  following: null,
});

const fetchFollowersCount = async () => {
  const { count } = await supabase
    .from("followers_following")
    .select("*", { count: "exact" })
    .eq("following_id", profileUser.value.id);

  return count;
};

const fetchFollowingCount = async () => {
  const { count } = await supabase
    .from("followers_following")
    .select("*", { count: "exact" })
    .eq("follower_id", profileUser.value.id);

  return count;
};

const addNewPost = (post) => {
  posts.value.unshift(post);
};

const fetchData = async () => {
  loading.value = true;
  const { data: userData } = await supabase
    .from("users")
    .select()
    .eq("username", username)
    .single();

  if (!userData) {
    loading.value = false;
    return (profileUser.value = null);
  }

  profileUser.value = userData;

  const { data: postData } = await supabase
    .from("posts")
    .select()
    .eq("owner_id", profileUser.value.id);

  posts.value = postData;
  userInfo.posts = posts.value.length;

  const followerCount = await fetchFollowersCount();
  const followingCount = await fetchFollowingCount();

  userInfo.followers = followerCount;
  userInfo.following = followingCount;

  loading.value = false;
};

const updateIsFollowing = (follow) => {
  isFollowing.value = follow;
};

const fetchIsFollowing = async () => {
  if (user.value && user.value.id !== profileUser.value.id) {
    const { data } = await supabase
      .from("followers_following")
      .select()
      .eq("follower_id", user.value.id)
      .eq("following_id", profileUser.value.id)
      .single();

    if (data) {
      return (isFollowing.value = true);
    }
  }
};

watch(user, () => {
  fetchIsFollowing();
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <Container>
    <div class="profile-container" v-if="!loading">
      <UserBar
        :key="$route.params.username"
        :profileUser="profileUser"
        :userInfo="userInfo"
        :addNewPost="addNewPost"
        :isFollowing="isFollowing"
        :updateIsFollowing="updateIsFollowing"
      />
      <ImageGallery :posts="posts" />
    </div>
    <div class="spinner" v-else>
      <ASpin />
    </div>
  </Container>
</template>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  padding: 20px 0px;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 85vh;
}
</style>
