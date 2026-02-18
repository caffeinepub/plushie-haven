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
export interface GalleryMediaItem {
    id: bigint;
    title?: string;
    blob: ExternalBlob;
    createdAt: Time;
    description?: string;
    author: Principal;
    mediaType: Variant_video_image;
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
export interface PostWithCounts {
    likeCount: bigint;
    post: Post;
    commentCount: bigint;
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
export interface Poll {
    question: string;
    createdAt: Time;
    createdBy: Principal;
    isActive: boolean;
    options: Array<PollOption>;
    pollId: bigint;
}
export interface UserProfileEdit {
    bio: string;
    displayName: string;
    plushieImages: Array<ExternalBlob>;
    links: Array<Link>;
    publicDirectory: boolean;
    avatar?: ExternalBlob;
}
export interface SupporterProfile {
    displayName: string;
    addedAt: Time;
    validUntil?: Time;
}
export interface Post {
    id: bigint;
    title: string;
    video?: ExternalBlob;
    body: string;
    createdAt: Time;
    authorName?: string;
    author: Principal;
    image?: ExternalBlob;
}
export interface PollOption {
    optionId: bigint;
    text: string;
}
export interface FollowCounts {
    followers: bigint;
    following: bigint;
}
export interface ModeratedContent {
    id: bigint;
    title: string;
    moderationOutcome: ModerationOutcome;
    video?: ExternalBlob;
    body: string;
    submittedAt: Time;
    author: Principal;
    image?: ExternalBlob;
}
export interface Link {
    url: string;
    displayName: string;
}
export interface PostEdit {
    title: string;
    video?: ExternalBlob;
    body: string;
    authorName?: string;
    image?: ExternalBlob;
}
export interface UserProfile {
    bio: string;
    displayName: string;
    plushieImages: Array<ExternalBlob>;
    links: Array<Link>;
    publicDirectory: boolean;
    avatar?: ExternalBlob;
}
export enum ModerationOutcome {
    allow = "allow",
    manualReview = "manualReview",
    block = "block"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_video_image {
    video = "video",
    image = "image"
}
export interface backendInterface {
    addGalleryMediaItem(mediaType: Variant_video_image, blob: ExternalBlob, title: string | null, description: string | null): Promise<bigint>;
    approveModerationRequest(id: bigint): Promise<void>;
    approveSupporter(supporter: Principal, validUntil: Time | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createComment(postId: bigint, authorName: string | null, content: string): Promise<Comment>;
    createEvent(authorName: string | null, title: string, description: string, location: string, startTime: Time, endTime: Time): Promise<bigint>;
    createModerationRequest(title: string, body: string, video: ExternalBlob | null, image: ExternalBlob | null): Promise<bigint>;
    createPoll(question: string, options: Array<PollOption>): Promise<bigint>;
    deleteGalleryMediaItem(id: bigint): Promise<void>;
    deletePost(id: bigint): Promise<void>;
    doesCallerFollow(target: Principal): Promise<boolean>;
    editPost(id: bigint, postEdit: PostEdit): Promise<void>;
    follow(target: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentCounts(postIds: Array<bigint>): Promise<Array<[bigint, bigint]>>;
    getComments(postId: bigint): Promise<Array<Comment>>;
    getEvent(id: bigint): Promise<Event>;
    getFollowCounts(user: Principal): Promise<FollowCounts>;
    getModerationQueue(): Promise<Array<[bigint, ModeratedContent]>>;
    getPoll(id: bigint): Promise<Poll>;
    getPollResults(id: bigint): Promise<PollWithResults>;
    getPost(id: bigint): Promise<Post>;
    getPostLikeCount(postId: bigint): Promise<bigint>;
    getPostsWithCounts(): Promise<Array<PostWithCounts>>;
    getProfileLikeCount(profile: Principal): Promise<bigint>;
    getSupporterRequests(): Promise<Array<[Principal, SupporterRequest]>>;
    getSupporters(): Promise<Array<[Principal, SupporterProfile]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isPostLikedByCaller(postId: bigint): Promise<boolean>;
    isProfileLikedByCaller(profile: Principal): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    likeProfile(profile: Principal): Promise<void>;
    listDirectoryProfiles(): Promise<Array<[Principal, UserProfile]>>;
    listEvents(): Promise<Array<Event>>;
    listGalleryMediaItems(): Promise<Array<GalleryMediaItem>>;
    listPolls(): Promise<Array<Poll>>;
    listPosts(): Promise<Array<Post>>;
    rejectModerationRequest(id: bigint): Promise<void>;
    revokeSupporter(supporter: Principal): Promise<void>;
    saveCallerUserProfile(profileEdit: UserProfileEdit): Promise<void>;
    submitSupporterRequest(displayName: string, message: string, numberOfCoffees: bigint | null, validUntil: Time | null): Promise<void>;
    unfollow(target: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    unlikeProfile(profile: Principal): Promise<void>;
    vote(pollId: bigint, optionId: bigint): Promise<void>;
}
