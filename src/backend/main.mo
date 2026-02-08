import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage
  include MixinStorage();

  // User Profile Types
  public type Link = {
    url : Text;
    displayName : Text;
  };

  public type UserProfile = {
    displayName : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    links : [Link];
    plushieImages : [Storage.ExternalBlob];
    publicDirectory : Bool;
  };

  public type UserProfileEdit = {
    displayName : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    links : [Link];
    plushieImages : [Storage.ExternalBlob];
    publicDirectory : Bool;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Profile CRUD
  public shared ({ caller }) func saveCallerUserProfile(profileEdit : UserProfileEdit) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let newProfile : UserProfile = {
      profileEdit with
      links = profileEdit.links;
      plushieImages = profileEdit.plushieImages;
    };

    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    let profile = userProfiles.get(user);
    switch (profile) {
      case (null) { null };
      case (?p) {
        if (p.publicDirectory or caller == user or AccessControl.isAdmin(accessControlState, caller)) {
          ?p;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func listDirectoryProfiles() : async [UserProfile] {
    userProfiles.values().toArray().filter(func(profile) { profile.publicDirectory });
  };

  // Legacy (unchanged)
  type ImageAttachment = {
    bytes : [Nat8];
    contentType : Text;
  };

  type LegacyPost = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    image : ?ImageAttachment;
  };

  type Event = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    description : Text;
    location : Text;
    startTime : Time.Time;
    endTime : Time.Time;
    createdAt : Time.Time;
  };

  let posts = Map.empty<Nat, LegacyPost>();
  var nextPostId = 0;

  let events = Map.empty<Nat, Event>();
  var nextEventId = 0;

  public shared ({ caller }) func createPost(authorName : ?Text, title : Text, body : Text, imageBytes : ?[Nat8], imageContentType : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create posts");
    };

    if (title.trim(#char ' ').size() == 0) { Runtime.trap("Title cannot be empty") };
    if (body.trim(#char ' ').size() == 0) { Runtime.trap("Body cannot be empty") };

    let image = switch (imageBytes, imageContentType) {
      case (?bytes, ?contentType) {
        ?{
          bytes;
          contentType;
        };
      };
      case (_) { null };
    };

    let post : LegacyPost = {
      id = nextPostId;
      author = caller;
      authorName;
      title;
      body;
      createdAt = Time.now();
      image;
    };

    posts.add(nextPostId, post);
    let postId = nextPostId;
    nextPostId += 1;
    postId;
  };

  public query ({ caller }) func listPosts() : async [LegacyPost] {
    posts.values().toArray();
  };

  public query ({ caller }) func getPost(id : Nat) : async LegacyPost {
    switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };
  };

  public shared ({ caller }) func deletePost(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users and admins can delete posts");
    };

    let post = switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (post.author != caller) {
        Runtime.trap("Unauthorized: Only the author or an admin can delete this post");
      };
    };

    posts.remove(id);
  };

  public shared ({ caller }) func editPost(id : Nat, newTitle : Text, newBody : Text, newAuthorName : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can edit posts");
    };

    if (newTitle.trim(#char ' ').size() == 0) { Runtime.trap("Title cannot be empty") };
    if (newBody.trim(#char ' ').size() == 0) { Runtime.trap("Body cannot be empty") };

    let post = switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (post.author != caller) {
        Runtime.trap("Unauthorized: Only the author or an admin can edit this post");
      };
    };

    let updatedPost : LegacyPost = {
      post with
      title = newTitle;
      body = newBody;
      authorName = newAuthorName;
    };

    posts.add(id, updatedPost);
  };

  // Events
  public shared ({ caller }) func createEvent(authorName : ?Text, title : Text, description : Text, location : Text, startTime : Time.Time, endTime : Time.Time) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create events");
    };

    if (title.trim(#char ' ').size() == 0) { Runtime.trap("Title cannot be empty") };
    if (description.trim(#char ' ').size() == 0) { Runtime.trap("Description cannot be empty") };
    if (location.trim(#char ' ').size() == 0) { Runtime.trap("Location cannot be empty") };
    if (startTime >= endTime) { Runtime.trap("Start time must be before end time") };

    let event : Event = {
      id = nextEventId;
      author = caller;
      authorName;
      title;
      description;
      location;
      startTime;
      endTime;
      createdAt = Time.now();
    };

    events.add(nextEventId, event);
    let eventId = nextEventId;
    nextEventId += 1;
    eventId;
  };

  public query ({ caller }) func listEvents() : async [Event] {
    events.values().toArray();
  };

  public query ({ caller }) func getEvent(id : Nat) : async Event {
    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event };
    };
  };

  // Follow system
  type FollowInfo = {
    followers : List.List<Principal>;
    following : List.List<Principal>;
  };

  let followData = Map.empty<Principal, FollowInfo>();

  public type FollowCounts = {
    followers : Nat;
    following : Nat;
  };

  public shared ({ caller }) func follow(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (caller == target) {
      Runtime.trap("You cannot follow yourself");
    };

    let callerFollows = switch (followData.get(caller)) {
      case (null) {
        {
          followers = List.empty<Principal>();
          following = List.empty<Principal>();
        };
      };
      case (?f) { f };
    };

    let targetFollows = switch (followData.get(target)) {
      case (null) {
        {
          followers = List.empty<Principal>();
          following = List.empty<Principal>();
        };
      };
      case (?f) { f };
    };

    let alreadyFollowing = callerFollows.following.any(func(u) { u == target });

    if (alreadyFollowing) { return };

    callerFollows.following.add(target);
    targetFollows.followers.add(caller);

    followData.add(caller, callerFollows);
    followData.add(target, targetFollows);
  };

  public shared ({ caller }) func unfollow(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow");
    };

    switch (followData.get(caller)) {
      case (null) { return };
      case (?info) {
        let newFollowing = List.empty<Principal>();
        info.following.forEach(func(x) { if (x != target) { newFollowing.add(x) } });
        info.following.clear();
        info.following.addAll(newFollowing.values());

        let newFollowers = List.empty<Principal>();
        switch (followData.get(target)) {
          case (null) {};
          case (?targetInfo) {
            targetInfo.followers.forEach(func(x) {
              if (x != caller) { newFollowers.add(x) };
            });
            targetInfo.followers.clear();
            targetInfo.followers.addAll(newFollowers.values());
          };
        };
      };
    };
  };

  public query ({ caller }) func doesCallerFollow(target : Principal) : async Bool {
    switch (followData.get(caller)) {
      case (null) { false };
      case (?info) {
        info.following.any(func(u) { u == target });
      };
    };
  };

  public query ({ caller }) func getFollowCounts(user : Principal) : async FollowCounts {
    let info = switch (followData.get(user)) {
      case (null) {
        {
          followers = List.empty<Principal>();
          following = List.empty<Principal>();
        };
      };
      case (?data) { data };
    };
    {
      followers = info.followers.size();
      following = info.following.size();
    };
  };

  // Likes system
  let postLikes = Map.empty<Nat, List.List<Principal>>();
  let profileLikes = Map.empty<Principal, List.List<Principal>>();

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist!") };
      case (?_post) {};
    };

    let likes = switch (postLikes.get(postId)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    if (likes.any(func(u) { u == caller })) {
      return;
    };

    likes.add(caller);
    postLikes.add(postId, likes);
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist!") };
      case (?_) {};
    };

    switch (postLikes.get(postId)) {
      case (null) {};
      case (?likes) {
        let filtered = likes.filter(func(user) { user != caller });
        postLikes.add(postId, filtered);
      };
    };
  };

  public query ({ caller }) func isPostLikedByCaller(postId : Nat) : async Bool {
    switch (postLikes.get(postId)) {
      case (null) { false };
      case (?likes) {
        likes.any(func(u) { u == caller });
      };
    };
  };

  public query ({ caller }) func getPostLikeCount(postId : Nat) : async Nat {
    switch (postLikes.get(postId)) {
      case (null) { 0 };
      case (?likes) { likes.size() };
    };
  };

  public shared ({ caller }) func likeProfile(profile : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like profiles");
    };

    let likes = switch (profileLikes.get(profile)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    if (likes.any(func(u) { u == caller })) {
      return;
    };

    likes.add(caller);
    profileLikes.add(profile, likes);
  };

  public shared ({ caller }) func unlikeProfile(profile : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike profiles");
    };

    switch (profileLikes.get(profile)) {
      case (null) {};
      case (?likes) {
        let filtered = likes.filter(func(user) { user != caller });
        profileLikes.add(profile, filtered);
      };
    };
  };

  public query ({ caller }) func isProfileLikedByCaller(profile : Principal) : async Bool {
    switch (profileLikes.get(profile)) {
      case (null) { false };
      case (?likes) {
        likes.any(func(u) { u == caller });
      };
    };
  };

  public query ({ caller }) func getProfileLikeCount(profile : Principal) : async Nat {
    switch (profileLikes.get(profile)) {
      case (null) { 0 };
      case (?likes) { likes.size() };
    };
  };

  // === NEW COMMENT SYSTEM ===

  public type Comment = {
    postId : Nat;
    author : Principal;
    authorName : ?Text;
    content : Text;
    createdAt : Time.Time;
  };

  let comments = Map.empty<Nat, List.List<Comment>>();

  public shared ({ caller }) func createComment(postId : Nat, authorName : ?Text, content : Text) : async Comment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can comment");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist!") };
      case (?_) {};
    };

    let comment : Comment = {
      postId;
      author = caller;
      authorName;
      content;
      createdAt = Time.now();
    };

    let postComments = switch (comments.get(postId)) {
      case (null) { List.empty<Comment>() };
      case (?list) { list };
    };

    postComments.add(comment);
    comments.add(postId, postComments);

    comment;
  };

  public query ({ caller }) func getComments(postId : Nat) : async [Comment] {
    switch (comments.get(postId)) {
      case (null) { [] };
      case (?postComments) { postComments.toArray() };
    };
  };

  public query ({ caller }) func getCommentCounts(postIds : [Nat]) : async [(Nat, Nat)] {
    // Return array of (postId, commentCount)
    postIds.map(func(id) {
      let count = switch (comments.get(id)) {
        case (null) { 0 };
        case (?list) { list.size() };
      };
      (id, count);
    });
  };
};
