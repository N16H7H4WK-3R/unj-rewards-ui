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
    device_type?: string;
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
    aadhar_number: string | null;
    pan_number: string | null;
}

export interface HomeData {
    user: HomeUser;
    wallet: Wallet;
    kyc: KYCStatus;
}

// ── QR ──

export interface Product {
    id: number;
    name: string;
    category: string;
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
