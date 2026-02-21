import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

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
      Runtime.trap("You must be authenticated to follow someone");
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
      Runtime.trap("You must be authenticated to unfollow someone");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("You must be authenticated to check follow status");
    };

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
};
