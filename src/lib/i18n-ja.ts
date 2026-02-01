export const ja = {
  // Common
  cancel: "キャンセル",
  save: "保存",
  update: "更新",
  logout: "ログアウト",
  login: "ログイン",
  required: "必須",

  // Header
  appTitle: "いよかん",
  changeEmail: "メールアドレス変更",
  changePassword: "パスワード変更",
  organizations: "組織",
  home: "ホーム",
  returnToHome: "ホームに戻る",

  // Login page
  loginTitle: "ログイン",
  email: "メールアドレス",
  password: "パスワード",
  forgotPassword: "パスワードをお忘れですか？",
  loggingIn: "ログイン中...",

  // Reset Password page
  resetPasswordTitle: "パスワードリセット",
  sendResetEmail: "リセットメールを送信",
  sending: "送信中...",
  passwordResetEmailSent:
    "パスワードリセットメールを送信しました。受信トレイをご確認ください。",
  validPassword:
    "10文字以上の大文字・小文字・数字・記号を組み合わせたパスワードを設定してください。",

  // Change Email page
  changeEmailTitle: "メールアドレス変更",
  currentPassword: "現在のパスワード",
  newEmail: "新しいメールアドレス",
  confirmEmail: "メールアドレス確認",
  updating: "更新中...",
  changeEmailButton: "メールアドレス変更",
  emailMismatch: "メールアドレスが一致しません",
  enterValidEmail: "有効なメールアドレスを入力してください",

  // Change Password page
  changePasswordTitle: "パスワード変更",
  newPassword: "新しいパスワード",
  confirmPassword: "パスワード確認",
  changePasswordButton: "パスワード変更",
  passwordMismatch: "パスワードが一致しません",
  passwordTooShort: "パスワードは10文字以上である必要があります",

  // Admin page
  adminTitle: "管理者",
  name: "名前",
  valid: "有効",
  active: "有効",
  adminUpdateSuccess: "管理者情報を更新しました",
  emailChangeNote: "メールアドレスはアカウント所有者のみ変更できます",
  typeChangeNote: "プロバイダータイプは作成後に変更できません",
  // Organization page
  orgTitle: "組織",
  description: "説明",
  orgUpdateSuccess: "組織情報を更新しました",

  // Provider page
  providerTitle: "プロバイダー",
  type: "タイプ",
  parameters: "パラメータ",
  parameterKey: "パラメータキー",
  addParameter: "パラメータ追加",
  remove: "削除",
  providerUpdateSuccess: "プロバイダー情報を更新しました",

  // Meta component
  id: "ID",
  created: "作成日時",
  updated: "更新日時",

  // Detail page titles
  admin: "管理者",
  organization: "組織",
  provider: "プロバイダー",
  users: "ユーザー",
  groups: "グループ",

  // Home page
  selectOrganization: "組織を選択",

  // Groups page
  members: "メンバー",

  // Organization page
  addOrganization: "組織を追加",
  addAdmin: "管理者を追加",
  addProvider: "プロバイダーを追加",
  addUser: "ユーザーを追加",
  editUser: "ユーザーを編集",

  // Validation errors
  errorEmailRequired: "メールアドレスは必須です",
  errorInvalidEmail: "メールアドレスの形式が無効です",
  errorNameEmailRequired: "名前とメールアドレスは必須です",
  errorOrgIdReserved: "この組織IDは予約されており使用できません",
  errorOidInvalidFormat: "組織IDは小文字と数字のみ使用できます",
  errorProviderTypeRequired: "プロバイダータイプは必須です",
  errorPasswordRequired: "パスワードは必須です",
  errorPasswordMin10: "10文字以上が必要です",
  errorPasswordUppercase: "大文字を使用してください",
  errorPasswordLowercase: "小文字を使用してください",
  errorPasswordNumber: "数字を使用してください",
  errorPasswordSymbol: "記号を使用してください",
  errorPasswordMismatch: "パスワードが一致しません",
  errorEmailMismatch: "メールアドレスが一致しません",

  // Auth errors
  errorLoginNotAdmin: "管理者としてログインできません",
  errorInvalidAdmin: "無効な管理者アカウントです",
  errorLogin: "ログインに失敗しました",
  errorResetPassword: "パスワードリセットメールの送信に失敗しました",
  errorLogout: "ログアウトに失敗しました",
  errorNoUser: "ユーザーがログインしていません",
  errorReauthenticate: "再認証に失敗しました",
  errorChangeEmail: "メールアドレスの変更に失敗しました",
  errorChangePassword: "パスワードの変更に失敗しました",

  // Firestore errors
  errorUpdateAdmin: "管理者情報の更新に失敗しました",
  errorSaveOrg: "組織の保存に失敗しました",
  errorUpdateOrg: "組織情報の更新に失敗しました",
  errorSaveProvider: "プロバイダーの保存に失敗しました",
  errorUpdateProvider: "プロバイダー情報の更新に失敗しました",
  errorUpdateUser: "ユーザー情報の更新に失敗しました",

  // Server Firestore errors
  errorFetchAdmins: "管理者一覧の取得に失敗しました",
  errorAdminNotFound: "管理者が見つかりません",
  errorFetchAdmin: "管理者の取得に失敗しました",
  errorFetchOrgs: "組織一覧の取得に失敗しました",
  errorOrgNotFound: "組織が見つかりません",
  errorFetchOrg: "組織の取得に失敗しました",
  errorFetchProviders: "プロバイダー一覧の取得に失敗しました",
  errorProviderNotFound: "プロバイダーが見つかりません",
  errorFetchProvider: "プロバイダーの取得に失敗しました",
  errorFetchUsers: "ユーザー一覧の取得に失敗しました",
  errorUserNotFound: "ユーザーが見つかりません",
  errorFetchUser: "ユーザーの取得に失敗しました",

  // Functions errors
  errorCreateAdmin: "管理者の作成に失敗しました",
  errorCreateUser: "ユーザーの作成に失敗しました",
} as const;
