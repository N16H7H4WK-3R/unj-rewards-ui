// ── API Response Wrappers ──

export interface ApiSuccessResponse<T> {
    data: T;
}

export interface ApiErrorDetail {
    message: string;
    error_code: string;
    detail?: Record<string, string[]>;
}

export interface ApiErrorResponse {
    timestamp?: string;
    error: ApiErrorDetail;
}

// ── Auth ──

export type UserRole = 'technician' | 'dealer' | 'admin';

export interface OtpRequestPayload {
    username: string;
}

export interface OtpRequestResponse {
    token: string;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user_role: string | null;
    username: string;
    full_name: string;
    kyc_status: KYCEntity[];
}

export interface AdminLoginResponse {
    access: string;
    refresh: string;
    user_role: string;
    username: string;
}

export interface RefreshPayload {
    refresh: string;
}

export interface RefreshResponse {
    access: string;
    refresh: string;
}

export interface LogoutResponse {
    message: string;
}

// ── Role ──

export interface RoleSelectPayload {
    role: 'Technician' | 'Dealer';
}

export interface RoleSelectResponse {
    message: string;
    role: string;
}

// ── Profile ──

export interface Profile {
    id: number;
    username: string;
    full_name: string;
    email: string | null;
    photo: string | null;
    dob: string | null;
    gender: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
    full_address: string | null;
    role: string | null;
    device_type: string | null;
    email_verification_status: boolean;
    created_at: string;
}

export interface ProfileUpdatePayload {
    full_name?: string;
    email?: string;
    photo?: File;
    dob?: string;
    gender?: string;
    district?: string;
    state?: string;
    pincode?: string;
    full_address?: string;
    device_type?: string;
}

export interface EmailVerificationRequestPayload {
    email: string;
}

export interface EmailVerificationConfirmPayload {
    email: string;
    otp: string;
}

export interface MessageResponse {
    message: string;
}

// ── Wallet ──

export interface Wallet {
    wallet_id: number;
    balance: string;
    user_id: number;
}

// ── Transactions ──

export interface TransactionStatus {
    status: string;
    at: string;
}

export interface Transaction {
    id: number;
    transaction_type: 'CREDIT' | 'DEBIT';
    transaction_amount: string;
    transaction_status: TransactionStatus[];
    reason: string | null;
    created_at: string;
    qr_code: string | null;
    product_name: string | null;
}

export interface PaginationResponse<T> {
    content: T[];
    page: number;
    size: number;
    total_elements: number;
    total_pages: number;
    first: boolean;
    last: boolean;
}

export interface TransactionsData {
    wallet_balance: string;
    transactions: PaginationResponse<Transaction>;
}

// ── Home ──

export interface HomeUser {
    id: number;
    full_name: string;
    username: string;
    role: string | null;
    photo: string | null;
    is_profile_complete: boolean;
}

export interface KYCEntity {
    entity: string;
    status: string;
    verified_at: string | null;
}

export interface KYCStatus {
    kyc_status: KYCEntity[];
    aadhaar_number: string | null;
    pan_number: string | null;
}

export interface HomeData {
    user: HomeUser;
    wallet: Wallet;
    kyc: KYCStatus;
}

// ── KYC ──

export interface KycOtpRequestPayload {
    aadhaar_number: string;
    pan_number: string;
}

export interface KycOtpRequestResponse {
    reference_id: string;
    pan_number: string;
    aadhaar_number: string;
}

export interface AadhaarAddress {
    country: string;
    district: string;
    house: string;
    landmark: string;
    pincode: string;
    post_office: string;
    state: string;
    street: string;
    subdistrict: string;
    vtc: string;
}

export interface AadhaarData {
    reference_id: number;
    status: string;
    message: string;
    care_of: string;
    full_address: string;
    date_of_birth: string;
    email_hash: string;
    gender: string;
    name: string;
    address: AadhaarAddress;
    year_of_birth: string;
    mobile_hash: string;
    photo: string;
    share_code: string;
}

export interface KycOtpVerifyPayload {
    otp: string;
    reference_id: string;
    aadhaar_number: string;
    pan_number: string;
}

export interface KycOtpVerifyResponse {
    message: string;
    pan_link_status: 'VERIFIED' | 'PENDING' | 'NOT_LINKED' | 'LINK_CHECK_FAILED';
    sandbox_response: {
        data: AadhaarData;
    };
}

export interface PanVerifyPayload {
    aadhaar_number: string;
    pan_number: string;
}

export interface PanVerifyResponse {
    message: string;
    pan_link_status: string;
}

// ── QR ──

export interface Product {
    id: number;
    name: string;
    category: string;
    default_points: number;
}

export interface QRValidateResponse {
    public_code: string;
    url?: string;
    points: string;
    status: string;
    product: Product;
}

/** The process endpoint may return a flat validate-style object or a wrapper with { public_code, qr }. */
export type QRProcessResponse =
    | QRValidateResponse
    | { public_code: string; qr: QRValidateResponse };

export interface QRRedeemPayload {
    public_code: string;
    latitude?: number;
    longitude?: number;
}

export interface QRRedeemResponse {
    message: string;
    qr: QRValidateResponse;
    wallet: { balance: string };
}

// ── Admin QR ──

export interface QRCreatePayload {
    product_id: number;
    points: string;
    count: number;
}

export interface QRListItem {
    id: number;
    public_code: string;
    points: string;
    status: string;
    product: Product;
    redeemed_at: string | null;
    redeemed_by_username: string | null;
    created_at: string;
}

export interface QRBatch {
    id: number;
    batch_id: string;
    product_name: string;
    points: string;
    count: number;
    created_at: string;
}

export interface QRBatchListResponse {
    batches: QRBatch[];
}
// ── Admin Management ──

export interface Category {
    id: number;
    name: string;
}

export interface CategoryPayload {
    name: string;
}

export interface AdminProduct {
    id: number;
    name: string;
    category: number | Category;
    default_points: number;
}

export interface AdminProductPayload {
    name: string;
    category: number;
    default_points: number;
}

export interface AdminUser {
    id: number;
    username: string;
    full_name: string;
    role: string;
}

export interface AdminUserPayload {
    username: string;
    full_name: string;
    role: string;
}

export interface DebitPayload {
    user_id: number;
    amount: number;
    reason: string;
}
