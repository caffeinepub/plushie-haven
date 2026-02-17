import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

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

  public query ({ caller }) func listDirectoryProfiles() : async [(Principal, UserProfile)] {
    userProfiles.filter(func(_principal, profile) { profile.publicDirectory }).toArray();
  };

  public type ModerationOutcome = {
    #allow;
    #block;
    #manualReview;
  };

  public type ModeratedContent = {
    id : Nat;
    author : Principal;
    title : Text;
    body : Text;
    video : ?Storage.ExternalBlob;
    submittedAt : Time.Time;
    moderationOutcome : ModerationOutcome;
  };

  public type Post = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    video : ?Storage.ExternalBlob;
  };

  public type PostEdit = {
    authorName : ?Text;
    title : Text;
    body : Text;
    video : ?Storage.ExternalBlob;
  };

  public type Event = {
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

  public type GalleryMediaItem = {
    id : Nat;
    author : Principal;
    mediaType : {
      #image;
      #video;
    };
    createdAt : Time.Time;
    blob : Storage.ExternalBlob;
    title : ?Text;
    description : ?Text;
  };

  var nextGalleryMediaId = 0;
  let galleryMediaItems = Map.empty<Nat, GalleryMediaItem>();

  public shared ({ caller }) func addGalleryMediaItem(mediaType : { #image; #video }, blob : Storage.ExternalBlob, title : ?Text, description : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add media items");
    };

    let newItem : GalleryMediaItem = {
      id = nextGalleryMediaId;
      author = caller;
      mediaType;
      createdAt = Time.now();
      blob;
      title;
      description;
    };

    galleryMediaItems.add(nextGalleryMediaId, newItem);

    let mediaId = nextGalleryMediaId;
    nextGalleryMediaId += 1;
    mediaId;
  };

  public query ({ caller }) func listGalleryMediaItems() : async [GalleryMediaItem] {
    galleryMediaItems.values().toArray();
  };

  public shared ({ caller }) func deleteGalleryMediaItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete media items");
    };

    let item = switch (galleryMediaItems.get(id)) {
      case (null) { Runtime.trap("Gallery media item not found") };
      case (?item) { item };
    };

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (item.author != caller) {
        Runtime.trap("Unauthorized: Only the author or an admin can delete this media item");
      };
    };

    galleryMediaItems.remove(id);
  };

  let posts = Map.empty<Nat, Post>();
  var nextPostId = 0;

  let events = Map.empty<Nat, Event>();
  var nextEventId = 0;

  let moderationQueue = Map.empty<Nat, ModeratedContent>();

  public shared ({ caller }) func createModerationRequest(title : Text, body : Text, video : ?Storage.ExternalBlob) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create moderation requests");
    };

    let moderationRequest : ModeratedContent = {
      id = nextPostId;
      author = caller;
      title;
      body;
      submittedAt = Time.now();
      video;
      moderationOutcome = #manualReview;
    };

    moderationQueue.add(nextPostId, moderationRequest);
    let requestId = nextPostId;
    nextPostId += 1;
    requestId;
  };

  public shared ({ caller }) func approveModerationRequest(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve moderation requests");
    };

    let moderationRequest = switch (moderationQueue.get(id)) {
      case (null) { Runtime.trap("Moderation request not found!") };
      case (?request) { request };
    };

    let newPost : Post = {
      id = moderationRequest.id;
      author = moderationRequest.author;
      authorName = null;
      title = moderationRequest.title;
      body = moderationRequest.body;
      createdAt = Time.now();
      video = moderationRequest.video;
    };

    posts.add(moderationRequest.id, newPost);
    moderationQueue.remove(id);
  };

  public shared ({ caller }) func rejectModerationRequest(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject moderation requests");
    };

    moderationQueue.remove(id);
  };

  public query ({ caller }) func getModerationQueue() : async [(Nat, ModeratedContent)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view the moderation queue");
    };
    moderationQueue.toArray();
  };

  public query ({ caller }) func listPosts() : async [Post] {
    posts.values().toArray();
  };

  public query ({ caller }) func getPost(id : Nat) : async Post {
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

  public shared ({ caller }) func editPost(id : Nat, postEdit : PostEdit) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit posts");
    };

    if (postEdit.title.trim(#char ' ').size() == 0) { Runtime.trap("Title cannot be empty") };
    if (postEdit.body.trim(#char ' ').size() == 0) { Runtime.trap("Body cannot be empty") };

    let existingPost = switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };

    let updatedPost : Post = {
      existingPost with
      authorName = postEdit.authorName;
      title = postEdit.title;
      body = postEdit.body;
      video = postEdit.video;
    };
    posts.add(id, updatedPost);
  };

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
    postIds.map(func(id) {
      let count = switch (comments.get(id)) {
        case (null) { 0 };
        case (?list) { list.size() };
      };
      (id, count);
    });
  };

  public type PostWithCounts = {
    post : Post;
    likeCount : Nat;
    commentCount : Nat;
  };

  public query ({ caller }) func getPostsWithCounts() : async [PostWithCounts] {
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
