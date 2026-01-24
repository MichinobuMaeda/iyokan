export const en = {
  // Common
  cancel: "Cancel",
  save: "Save",
  logout: "Logout",
  login: "Login",

  required: "Required",

  // Header
  appTitle: "Iyokan",
  changeEmail: "Change Email",
  changePassword: "Change Password",

  // Login page
  loginTitle: "Login",
  email: "Email",
  password: "Password",
  forgotPassword: "Forgot password?",
  loggingIn: "Logging in...",

  // Reset Password page
  resetPasswordTitle: "Reset Password",
  sendResetEmail: "Send reset email",
  sending: "Sending...",
  passwordResetEmailSent: "Password reset email sent. Check your inbox.",

  // Change Email page
  changeEmailTitle: "Change Email",
  currentPassword: "Current Password",
  newEmail: "New Email",
  confirmEmail: "Confirm Email",
  updating: "Updating...",
  changeEmailButton: "Change Email",
  emailMismatch: "Email addresses do not match",

  // Change Password page
  changePasswordTitle: "Change Password",
  newPassword: "New Password",
  confirmPassword: "Confirm Password",
  changePasswordButton: "Change Password",
  passwordMismatch: "Passwords do not match",
  passwordTooShort: "Password must be at least 10 characters",

  // Admin page
  adminTitle: "Admin",
  name: "Name",
  valid: "Valid",
  active: "Active",
  adminUpdateSuccess: "Admin updated successfully",
  emailChangeNote: "Only the account holder can change their email",
  typeChangeNote: "Provider type cannot be changed after creation",

  // Organization page
  orgTitle: "Organization",
  description: "Description",
  orgUpdateSuccess: "Organization updated successfully",

  // Provider page
  providerTitle: "Provider",
  type: "Type",
  parameters: "Parameters",
  parameterKey: "Parameter Key",
  addParameter: "Add Parameter",
  remove: "Remove",
  providerUpdateSuccess: "Provider updated successfully",

  // Meta component
  id: "ID",
  created: "Created",
  updated: "Updated",

  // Detail page titles
  admin: "Admin",
  organization: "Organization",
  provider: "Provider",
  users: "Users",

  // Home page
  selectOrganization: "Select organization",

  // Organization page
  addOrganization: "Add organization",
  addAdmin: "Add admin",
  addProvider: "Add provider",
  addUser: "Add user",

  // Validation errors
  errorEmailRequired: "Email is required",
  errorInvalidEmail: "Invalid email format",
  errorNameEmailRequired: "Name and email are required",
  errorOrgIdReserved: "Organization ID is reserved and cannot be used",
  errorOidRequired: "Organization ID is required",
  errorOidInvalidFormat:
    "Organization ID must contain only lowercase letters and numbers",
  errorProviderTypeRequired: "Provider type is required",
  errorPasswordRequired: "Password is required",
  errorPasswordMin10: "Min 10 characters",
  errorPasswordUppercase: "Add uppercase letter",
  errorPasswordLowercase: "Add lowercase letter",
  errorPasswordNumber: "Add number",
  errorPasswordSymbol: "Add symbol",
  errorPasswordMismatch: "Passwords do not match",
  errorEmailMismatch: "Email addresses do not match",
  // Auth errors
  errorLoginNotAdmin: "Failed to login as admin",
  errorInvalidAdmin: "Invalid admin account",
  errorLogin: "Failed to login",
  errorResetPassword: "Failed to send password reset email",
  errorLogout: "Failed to logout",
  errorNoUser: "No user is currently logged in",
  errorReauthenticate: "Failed to re-authenticate",
  errorChangeEmail: "Failed to change email",
  errorChangePassword: "Failed to change password",

  // Firestore errors
  errorUpdateAdmin: "Failed to update admin",
  errorSaveOrg: "Failed to save organization",
  errorUpdateOrg: "Failed to update organization",
  errorSaveProvider: "Failed to save provider",
  errorUpdateProvider: "Failed to update provider",
  errorUpdateUser: "Failed to update user",

  // Server Firestore errors
  errorFetchAdmins: "Failed to fetch admins",
  errorAdminNotFound: "Admin not found",
  errorFetchAdmin: "Failed to fetch admin",
  errorFetchOrgs: "Failed to fetch organizations",
  errorOrgNotFound: "Organization not found",
  errorFetchOrg: "Failed to fetch organization",
  errorFetchProviders: "Failed to fetch providers",
  errorProviderNotFound: "Provider not found",
  errorFetchProvider: "Failed to fetch provider",
  errorFetchUsers: "Failed to fetch users",
  errorUserNotFound: "User not found",
  errorFetchUser: "Failed to fetch user",

  // Functions errors
  errorCreateAdmin: "Failed to create admin",
  errorCreateUser: "Failed to create user",
} as const;
