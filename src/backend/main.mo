import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage
  include MixinStorage();

  // Supporter/coffees system
  public type SupporterRequest = {
    submittedAt : Time.Time;
    displayName : Text;
    message : Text;
    numberOfCoffees : ?Nat;
    validUntil : ?Time.Time;
  };

  public type SupporterProfile = {
    addedAt : Time.Time;
    displayName : Text;
    validUntil : ?Time.Time;
  };

  let supporterRequests = Map.empty<Principal, SupporterRequest>();
  let supporters = Map.empty<Principal, SupporterProfile>();

  public shared ({ caller }) func submitSupporterRequest(displayName : Text, message : Text, numberOfCoffees : ?Nat, validUntil : ?Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit supporter requests");
    };

    let request : SupporterRequest = {
      submittedAt = Time.now();
      displayName;
      message;
      numberOfCoffees;
      validUntil;
    };
    supporterRequests.add(caller, request);
  };

  public shared ({ caller }) func approveSupporter(supporter : Principal, validUntil : ?Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve supporters");
    };

    let request = switch (supporterRequests.get(supporter)) {
      case (null) { Runtime.trap("Supporter request not found!") };
      case (?request) { request };
    };

    let profile : SupporterProfile = {
      addedAt = Time.now();
      displayName = request.displayName;
      validUntil;
    };

    supporters.add(supporter, profile);
    supporterRequests.remove(supporter);
  };

  public shared ({ caller }) func revokeSupporter(supporter : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can revoke supporter status");
    };

    supporters.remove(supporter);
  };

  public query ({ caller }) func getSupporterRequests() : async [(Principal, SupporterRequest)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view supporter requests");
    };
    supporterRequests.toArray();
  };

  public query ({ caller }) func getSupporters() : async [(Principal, SupporterProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view the supporter list");
    };
    supporters.toArray();
  };

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
    // No authorization needed - public directory is meant to be publicly accessible
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
    // No authorization needed - posts are publicly viewable
    posts.values().toArray();
  };

  public query ({ caller }) func getPost(id : Nat) : async LegacyPost {
    // No authorization needed - posts are publicly viewable
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
    // No authorization needed - events are publicly viewable
    events.values().toArray();
  };

  public query ({ caller }) func getEvent(id : Nat) : async Event {
    // No authorization needed - events are publicly viewable
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
    // No authorization needed - checking follow status is public information
    switch (followData.get(caller)) {
      case (null) { false };
      case (?info) {
        info.following.any(func(u) { u == target });
      };
    };
  };

  public query ({ caller }) func getFollowCounts(user : Principal) : async FollowCounts {
    // No authorization needed - follow counts are public information
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
    // No authorization needed - checking like status is public information
    switch (postLikes.get(postId)) {
      case (null) { false };
      case (?likes) {
        likes.any(func(u) { u == caller });
      };
    };
  };

  public query ({ caller }) func getPostLikeCount(postId : Nat) : async Nat {
    // No authorization needed - like counts are public information
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
    // No authorization needed - checking like status is public information
    switch (profileLikes.get(profile)) {
      case (null) { false };
      case (?likes) {
        likes.any(func(u) { u == caller });
      };
    };
  };

  public query ({ caller }) func getProfileLikeCount(profile : Principal) : async Nat {
    // No authorization needed - like counts are public information
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
    // No authorization needed - comments are publicly viewable
    switch (comments.get(postId)) {
      case (null) { [] };
      case (?postComments) { postComments.toArray() };
    };
  };

  public query ({ caller }) func getCommentCounts(postIds : [Nat]) : async [(Nat, Nat)] {
    // No authorization needed - comment counts are public information
    // Return array of (postId, commentCount)
    postIds.map(func(id) {
      let count = switch (comments.get(id)) {
        case (null) { 0 };
        case (?list) { list.size() };
      };
      (id, count);
    });
  };

  // EXTENDING BACKEND TO BETTER SUPPORT NEW FRONTEND

  public type LegacyPostWithCounts = {
    post : LegacyPost;
    likeCount : Nat;
    commentCount : Nat;
  };

  public query ({ caller }) func getPostsWithCounts() : async [LegacyPostWithCounts] {
    // No authorization needed - posts and their counts are publicly viewable
    let postsArray = posts.values().toArray();
    postsArray.map(func(post) {
      {
        post;
        likeCount = switch (postLikes.get(post.id)) {
          case (null) { 0 };
          case (?likes) { likes.size() };
        };
        commentCount = switch (comments.get(post.id)) {
          case (null) { 0 };
          case (?postComments) { postComments.size() };
        };
      };
    });
  };

  // === POLLING SYSTEM ===

  public type PollOption = {
    optionId : Nat;
    text : Text;
  };

  public type Poll = {
    pollId : Nat;
    question : Text;
    options : [PollOption];
    createdBy : Principal;
    createdAt : Time.Time;
    isActive : Bool;
  };

  public type PollWithResults = {
    pollId : Nat;
    question : Text;
    options : [PollOption];
    createdBy : Principal;
    createdAt : Time.Time;
    isActive : Bool;
    results : [(Nat, Nat)];
  };

  let polls = Map.empty<Nat, Poll>();
  var nextPollId = 0;
  let votes = Map.empty<Nat, List.List<(Principal, Nat)>>();

  public shared ({ caller }) func createPoll(question : Text, options : [PollOption]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create polls");
    };

    let poll : Poll = {
      pollId = nextPollId;
      question;
      options;
      createdBy = caller;
      createdAt = Time.now();
      isActive = true;
    };

    polls.add(nextPollId, poll);

    let pollId = nextPollId;
    nextPollId += 1;
    pollId;
  };

  public shared ({ caller }) func vote(pollId : Nat, optionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can vote");
    };

    let poll = switch (polls.get(pollId)) {
      case (null) { Runtime.trap("Poll does not exist!") };
      case (?poll) { poll };
    };

    if (not poll.isActive) {
      Runtime.trap("Voting for this poll has ended");
    };

    let pollVotes = switch (votes.get(pollId)) {
      case (null) { List.empty<(Principal, Nat)>() };
      case (?list) { list };
    };

    let hasVoted = pollVotes.any(func((user, _)) { user == caller });

    if (hasVoted) {
      Runtime.trap("You have already voted in this poll!");
    };

    let isValidOption = poll.options.any(func(option) { option.optionId == optionId });

    if (not isValidOption) {
      Runtime.trap("Invalid voting option!");
    };

    pollVotes.add((caller, optionId));
    votes.add(pollId, pollVotes);
  };

  public query ({ caller }) func getPoll(id : Nat) : async Poll {
    switch (polls.get(id)) {
      case (null) { Runtime.trap("Poll not found") };
      case (?poll) { poll };
    };
  };

  public query ({ caller }) func listPolls() : async [Poll] {
    // No authorization needed - polls are publicly viewable
    polls.values().toArray();
  };

  public query ({ caller }) func getPollResults(id : Nat) : async PollWithResults {
    let poll = switch (polls.get(id)) {
      case (null) { Runtime.trap("Poll not found") };
      case (?poll) { poll };
    };

    let voteCounts = poll.options.map(func(option) {
      let count = switch (votes.get(id)) {
        case (null) { 0 };
        case (?pollVotes) {
          pollVotes.filter(func((_, optionId)) { optionId == option.optionId }).size();
        };
      };
      (option.optionId, count);
    });

    {
      poll with
      results = voteCounts;
    };
  };
};
