export const en = {
  // Common UI
  cancel: "Cancel",
  save: "Save",
  send: "Send",
  close: "Close",
  required: "Required",
  hardBreak: "Insert line break with Markdown",
  defaultSuccessMessage: "Changes saved successfully",
  defaultErrorMessage: "Failed to save changes",

  // App header and navigation
  appTitle: "Iyokan",
  home: "Home",
  returnToHome: "Return to Home",
  organizations: "Organizations",
  providers: "Providers",
  users: "Users",
  groups: "Groups",
  appSettings: "App Settings",
  changeEmail: "Change Email",
  changePassword: "Change Password",

  // Common form fields
  name: "Name",
  email: "Email",
  password: "Password",
  newEmail: "New Email",
  confirmEmail: "Confirm Email",
  newPassword: "New Password",
  description: "Description",
  active: "Active",

  // Meta information
  id: "ID",
  created: "Created",
  updated: "Updated",
  members: "Members",

  // Login page
  loginTitle: "Login",
  loginSuccess: "Login successful",
  forgotPassword: "Forgot password?",

  // Reset password page
  resetPasswordTitle: "Reset Password",
  passwordResetEmailSent: "Password reset email sent. Check your inbox.",
  validPassword:
    "Set a password with at least 10 characters, including uppercase, lowercase, numbers, and symbols.",

  // Change email page
  emailMismatch: "Email addresses do not match",
  enterValidEmail: "Enter a valid email address",

  // Change password page
  passwordMismatch: "Passwords do not match",

  // Home page
  selectOrganization: "Select organization",

  // Actions
  addOrganization: "Add organization",
  addProvider: "Add provider",
  addUser: "Add user",
  editUser: "Edit User",

  // Validation errors
  errorInvalidEmail: "Invalid email format",
  errorUrlRequired: "URL is required",
  errorInvalidUrl: "Invalid URL format",
  errorOidReserved: "Organization ID is reserved and cannot be used",
  errorOidUsed: "Organization ID is already in use",
  errorOidInvalidFormat:
    "Organization ID must contain only lowercase letters and numbers",
  errorPasswordRequired: "Password is required",
  errorPasswordMin10: "Min 10 characters",
  errorPasswordUppercase: "Add uppercase letter",
  errorPasswordLowercase: "Add lowercase letter",
  errorPasswordNumber: "Add number",
  errorPasswordSymbol: "Add symbol",
  errorPasswordMismatch: "Passwords do not match",
  errorEmailMismatch: "Email addresses do not match",

  // Authentication errors
  errorLogin: "Failed to login",
  errorResetPassword: "Failed to send password reset email",
  errorLogout: "Failed to logout",
  errorNoUser: "No user is currently logged in",
  errorReauthenticate: "Failed to re-authenticate",
  errorChangeEmail: "Failed to change email",
  errorChangePassword: "Failed to change password",
  errorGetUserPrivs: "Failed to get user privileges",
} as const;
