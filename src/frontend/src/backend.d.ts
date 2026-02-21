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
export interface UserProfileEdit {
    bio: string;
    displayName: string;
    plushieImages: Array<ExternalBlob>;
    links: Array<Link>;
    publicDirectory: boolean;
    avatar?: ExternalBlob;
}
export type Time = bigint;
export interface SupporterProfile {
    displayName: string;
    addedAt: Time;
    validUntil?: Time;
}
export interface FollowCounts {
    followers: bigint;
    following: bigint;
}
export interface SupporterRequest {
    displayName: string;
    submittedAt: Time;
    numberOfCoffees?: bigint;
    message: string;
    validUntil?: Time;
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
    doesCallerFollow(target: Principal): Promise<boolean>;
    follow(target: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFollowCounts(user: Principal): Promise<FollowCounts>;
    getSupporterRequests(): Promise<Array<[Principal, SupporterRequest]>>;
    getSupporters(): Promise<Array<[Principal, SupporterProfile]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listDirectoryProfiles(): Promise<Array<[Principal, UserProfile]>>;
    revokeSupporter(supporter: Principal): Promise<void>;
    saveCallerUserProfile(profileEdit: UserProfileEdit): Promise<void>;
    submitSupporterRequest(displayName: string, message: string, numberOfCoffees: bigint | null, validUntil: Time | null): Promise<void>;
    unfollow(target: Principal): Promise<void>;
}
