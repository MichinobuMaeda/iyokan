export const en = {
  // Application
  appTitle: "IyoKAN",

  // Navigation
  home: "Home",
  returnToHome: "Return to Home",
  organizations: "Organizations",
  templates: "Templates",
  generators: "Generative AI",
  posts: "Posts",
  providers: "Providers",
  users: "Users",
  groups: "Groups",
  appSettings: "App Settings",

  // Common UI
  cancel: "Cancel",
  save: "Save",
  send: "Send",
  close: "Close",
  required: "Required",
  active: "Active",
  hardBreak: "Insert line break with Markdown",

  // Form Fields
  id: "ID",
  name: "Name",
  title: "Title",
  message: "Message",
  link: "Link",
  feed: "Feed",
  category: "Category",
  source: "Source",
  prompt: "Prompt",
  schedule: "Schedule",
  presetTimes: "Preset Times",
  image: "Image",
  description: "Description",
  canceled: "Canceled",
  paused: "Paused",
  scheduled: "Scheduled",
  finished: "Finished",
  members: "Members",
  created: "Created",
  updated: "Updated",
  untitled: "Untitled",
  selectImage: "Select image",
  removeImage: "Remove image",
  presetTimesFormat: "One time per line in HH:MM format",

  // Login
  loginTitle: "Login",
  loginSuccess: "Login successful",
  forgotPassword: "Forgot password?",
  email: "Email",
  password: "Password",

  // Password Reset
  resetPasswordTitle: "Reset Password",
  passwordResetEmailSent: "Password reset email sent. Check your inbox.",
  validPassword:
    "Set a password with at least 10 characters, including uppercase, lowercase, numbers, and symbols.",

  // Change Email
  changeEmail: "Change Email",
  newEmail: "New Email",
  confirmEmail: "Confirm Email",
  emailMismatch: "Email addresses do not match",
  enterValidEmail: "Enter a valid email address",

  // Change Password
  changePassword: "Change Password",
  newPassword: "New Password",
  passwordMismatch: "Passwords do not match",

  // Home
  selectOrganization: "Select organization",

  // Organization Management
  addOrganization: "Add organization",
  addPost: "Add post",
  editPost: "Edit post",
  addTemplate: "Add template",
  addGenerator: "Add AI generator",
  addProvider: "Add provider",
  addUser: "Add user",
  editUser: "Edit User",

  // Messages
  defaultSuccessMessage: "Changes saved successfully",
  defaultErrorMessage: "Failed to save changes",

  // Validation Errors
  errorInvalidEmail: "Invalid email format",
  errorEmailMismatch: "Email addresses do not match",
  errorUrlRequired: "URL is required",
  errorInvalidUrl: "Invalid URL format",
  errorOidReserved: "Organization ID is reserved and cannot be used",
  errorOidUsed: "Organization ID is already in use",
  errorOidInvalidFormat:
    "Organization ID must contain only lowercase letters and numbers",
  atLeastOneFieldRequired:
    "At least one of title, message, or link is required",
  errorPasswordRequired: "Password is required",
  errorPasswordMin10: "Min 10 characters",
  errorPasswordUppercase: "Add uppercase letter",
  errorPasswordLowercase: "Add lowercase letter",
  errorPasswordNumber: "Add number",
  errorPasswordSymbol: "Add symbol",
  errorPasswordMismatch: "Passwords do not match",
  errorEmptyText: "At least one of title, message, or link should be filled",
  errorAtLeastOneProvider: "At least one provider must be selected",
  errorInvalidTimeFormat: "Invalid time format. Use HH:MM format",

  // Authentication Errors
  errorLogin: "Failed to login",
  errorLogout: "Failed to logout",
  errorNoUser: "No user is currently logged in",
  errorReauthenticate: "Failed to re-authenticate",
  errorResetPassword: "Failed to send password reset email",
  errorChangeEmail: "Failed to change email",
  errorChangePassword: "Failed to change password",
  errorGetUserPrivs: "Failed to get user privileges",
} as const;
