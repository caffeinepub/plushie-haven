import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Comment {
    content: string;
    createdAt: Time;
    authorName?: string;
    author: Principal;
    postId: bigint;
}
export interface Event {
    id: bigint;
    startTime: Time;
    title: string;
    endTime: Time;
    createdAt: Time;
    authorName?: string;
    description: string;
    author: Principal;
    location: string;
}
export interface SupporterRequest {
    displayName: string;
    submittedAt: Time;
    numberOfCoffees?: bigint;
    message: string;
    validUntil?: Time;
}
export interface Poll {
    question: string;
    createdAt: Time;
    createdBy: Principal;
    isActive: boolean;
    options: Array<PollOption>;
    pollId: bigint;
}
export interface PollWithResults {
    question: string;
    createdAt: Time;
    createdBy: Principal;
    results: Array<[bigint, bigint]>;
    isActive: boolean;
    options: Array<PollOption>;
    pollId: bigint;
}
export interface ImageAttachment {
    contentType: string;
    bytes: Uint8Array;
}
export interface UserProfileEdit {
    bio: string;
    displayName: string;
    plushieImages: Array<ExternalBlob>;
    links: Array<Link>;
    publicDirectory: boolean;
    avatar?: ExternalBlob;
}
export interface LegacyPostWithCounts {
    likeCount: bigint;
    post: LegacyPost;
    commentCount: bigint;
}
export interface SupporterProfile {
    displayName: string;
    addedAt: Time;
    validUntil?: Time;
}
export interface LegacyPost {
    id: bigint;
    title: string;
    body: string;
    createdAt: Time;
    authorName?: string;
    author: Principal;
    image?: ImageAttachment;
}
export interface PollOption {
    optionId: bigint;
    text: string;
}
export interface FollowCounts {
    followers: bigint;
    following: bigint;
}
export interface Link {
    url: string;
    displayName: string;
}
export interface UserProfile {
    bio: string;
    displayName: string;
    plushieImages: Array<ExternalBlob>;
    links: Array<Link>;
    publicDirectory: boolean;
    avatar?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveSupporter(supporter: Principal, validUntil: Time | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createComment(postId: bigint, authorName: string | null, content: string): Promise<Comment>;
    createEvent(authorName: string | null, title: string, description: string, location: string, startTime: Time, endTime: Time): Promise<bigint>;
    createPoll(question: string, options: Array<PollOption>): Promise<bigint>;
    createPost(authorName: string | null, title: string, body: string, imageBytes: Uint8Array | null, imageContentType: string | null): Promise<bigint>;
    deletePost(id: bigint): Promise<void>;
    doesCallerFollow(target: Principal): Promise<boolean>;
    editPost(id: bigint, newTitle: string, newBody: string, newAuthorName: string | null): Promise<void>;
    follow(target: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentCounts(postIds: Array<bigint>): Promise<Array<[bigint, bigint]>>;
    getComments(postId: bigint): Promise<Array<Comment>>;
    getEvent(id: bigint): Promise<Event>;
    getFollowCounts(user: Principal): Promise<FollowCounts>;
    getPoll(id: bigint): Promise<Poll>;
    getPollResults(id: bigint): Promise<PollWithResults>;
    getPost(id: bigint): Promise<LegacyPost>;
    getPostLikeCount(postId: bigint): Promise<bigint>;
    getPostsWithCounts(): Promise<Array<LegacyPostWithCounts>>;
    getProfileLikeCount(profile: Principal): Promise<bigint>;
    getSupporterRequests(): Promise<Array<[Principal, SupporterRequest]>>;
    getSupporters(): Promise<Array<[Principal, SupporterProfile]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isPostLikedByCaller(postId: bigint): Promise<boolean>;
    isProfileLikedByCaller(profile: Principal): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    likeProfile(profile: Principal): Promise<void>;
    listDirectoryProfiles(): Promise<Array<UserProfile>>;
    listEvents(): Promise<Array<Event>>;
    listPolls(): Promise<Array<Poll>>;
    listPosts(): Promise<Array<LegacyPost>>;
    revokeSupporter(supporter: Principal): Promise<void>;
    saveCallerUserProfile(profileEdit: UserProfileEdit): Promise<void>;
    submitSupporterRequest(displayName: string, message: string, numberOfCoffees: bigint | null, validUntil: Time | null): Promise<void>;
    unfollow(target: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    unlikeProfile(profile: Principal): Promise<void>;
    vote(pollId: bigint, optionId: bigint): Promise<void>;
}
